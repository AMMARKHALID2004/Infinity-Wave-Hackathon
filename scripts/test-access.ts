import "./env";
import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const password = "Demo123!";

type Project = { id: string; name: string; taskCount: number };
type Task = { title: string; project: { id: string; name: string } | null };

async function login(email: string) {
  const response = await fetch(new URL("/api/auth/login", baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(20_000),
  });
  assert.equal(response.status, 200, `${email} login failed: ${await response.text()}`);
  const cookies = response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]);
  assert.ok(cookies.length > 0, `${email} login did not set a session cookie`);
  return async function request(path: string, method = "GET") {
    const result = await fetch(new URL(path, baseUrl), {
      method,
      headers: { Cookie: cookies.join("; ") },
      signal: AbortSignal.timeout(20_000),
    });
    const body = await result.json();
    return { status: result.status, body };
  };
}

async function main() {
  const [admin, ayesha, ali, hamza] = await Promise.all([
    login("admin@novaworks.example"),
    login("ayesha@novaworks.example"),
    login("ali@novaworks.example"),
    login("hamza@novaworks.example"),
  ]);

  const denied = await ali("/api/transcript", "POST");
  assert.equal(denied.status, 403, "Non-admin transcript request must be forbidden");
  const team = await ali("/api/team");
  assert.equal(team.status, 200);
  assert.ok((team.body.team as Record<string, unknown>[]).every(
    (person) => Object.keys(person).sort().join(",") === "name,role,specialization",
  ), "The team directory must not expose IDs or emails");
  const invalidId = await ali("/api/projects/not-a-uuid");
  assert.equal(invalidId.status, 400, "Project IDs must be validated");

  const adminProjects = await admin("/api/projects");
  assert.equal(adminProjects.status, 200);
  const allProjects = adminProjects.body.projects as Project[];
  if (allProjects.length === 0) {
    console.log("SKIP project/task assertions: no projects have been created yet.");
    console.log("PASS transcript gate, team projection, and project ID validation.");
    return;
  }

  const ayeshaProjects = await ayesha("/api/projects");
  assert.equal(ayeshaProjects.status, 200);
  assert.deepEqual(
    (ayeshaProjects.body.projects as Project[]).map((project) => project.name),
    ["UrbanCart Website"],
    "Ayesha must see only UrbanCart",
  );

  const aliTasks = await ali("/api/my-tasks");
  assert.equal(aliTasks.status, 200);
  assert.equal((aliTasks.body.tasks as Task[]).length, 3, "Ali must see exactly three tasks");
  assert.ok((aliTasks.body.tasks as Task[]).every((task) => task.project?.name === "UrbanCart Website"));

  const hamzaTasks = await hamza("/api/my-tasks");
  assert.equal(hamzaTasks.status, 200);
  const hamzaItems = hamzaTasks.body.tasks as Task[];
  assert.equal(hamzaItems.length, 2, "Hamza must see exactly two tasks");
  assert.equal(new Set(hamzaItems.map((task) => task.project?.id)).size, 2,
    "Hamza's tasks must belong to two projects");

  const otherProject = allProjects.find((project) => project.name !== "UrbanCart Website");
  assert.ok(otherProject, "A second project is needed for the access check");
  const forbiddenProject = await ali(`/api/projects/${otherProject.id}`);
  assert.equal(forbiddenProject.status, 404, "Ali must not open another project's detail");

  const urbanCart = (ayeshaProjects.body.projects as Project[])[0];
  const aliProject = await ali(`/api/projects/${urbanCart.id}`);
  assert.equal(aliProject.status, 200);
  assert.equal(aliProject.body.project.tasks.length, 3,
    "Ali's project detail must contain only his own tasks");
  assert.ok(aliProject.body.project.tasks.every(
    (task: { assigneeRef: string }) => task.assigneeRef === "DEV01",
  ));

  console.log("PASS Ayesha sees only UrbanCart; Ali sees three tasks and no other project;");
  console.log("PASS Hamza sees two tasks across two projects; non-admin transcript is forbidden.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
