import "server-only";
import { getCurrentProfile, type CurrentProfile, type Role } from "./auth";
import { createAdminClient } from "./supabase/admin";

type ProjectRow = {
  id: string;
  name: string;
  client_name: string;
  description: string;
  manager_id: string;
  deadline: string;
  created_at: string;
};

type TaskRow = {
  project_id: string;
  title: string;
  description: string;
  assignee_id: string;
  deadline: string;
  estimated_hours: number;
};

type PersonRow = { id: string; name: string; ref: string };

export class AccessError extends Error {
  constructor(message = "Unauthorized", public status = 401) { super(message); }
}

export async function requireProfile(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new AccessError();
  return profile;
}

export async function optionalProfile(): Promise<CurrentProfile | null> {
  return getCurrentProfile();
}

export async function requireRole(...roles: Role[]): Promise<CurrentProfile> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) throw new AccessError("Forbidden", 403);
  return profile;
}

function databaseError(error: { message: string } | null) {
  if (error) throw new Error(`Database query failed: ${error.message}`);
}

async function peopleById(ids: string[]) {
  if (ids.length === 0) return new Map<string, PersonRow>();
  const { data, error } = await createAdminClient()
    .from("profiles").select("id,name,ref").in("id", ids);
  databaseError(error);
  return new Map(((data ?? []) as PersonRow[]).map((person) => [person.id, person]));
}

export async function listProjects(profile: CurrentProfile) {
  const admin = createAdminClient();
  let assignedTasks: Pick<TaskRow, "project_id">[] = [];
  if (profile.role === "AGENT") {
    const { data, error } = await admin.from("tasks")
      .select("project_id").eq("assignee_id", profile.id);
    databaseError(error);
    assignedTasks = (data ?? []) as Pick<TaskRow, "project_id">[];
    if (assignedTasks.length === 0) return [];
  }

  let query = admin.from("projects")
    .select("id,name,client_name,description,manager_id,deadline,created_at")
    .order("created_at", { ascending: false });
  if (profile.role === "MANAGER") query = query.eq("manager_id", profile.id);
  if (profile.role === "AGENT") {
    query = query.in("id", [...new Set(assignedTasks.map((task) => task.project_id))]);
  }
  const { data, error } = await query;
  databaseError(error);
  const projects = (data ?? []) as ProjectRow[];
  if (projects.length === 0) return [];

  const managers = await peopleById([...new Set(projects.map((project) => project.manager_id))]);
  let countRows = assignedTasks;
  if (profile.role !== "AGENT") {
    const result = await admin.from("tasks").select("project_id")
      .in("project_id", projects.map((project) => project.id));
    databaseError(result.error);
    countRows = (result.data ?? []) as Pick<TaskRow, "project_id">[];
  }
  const counts = new Map<string, number>();
  for (const task of countRows) counts.set(task.project_id, (counts.get(task.project_id) ?? 0) + 1);

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    clientName: project.client_name,
    description: project.description,
    deadline: project.deadline,
    createdAt: project.created_at,
    managerName: managers.get(project.manager_id)?.name ?? "Unknown manager",
    // Agents see a count of their own visible tasks, never other agents' work.
    taskCount: counts.get(project.id) ?? 0,
  }));
}

export async function getProject(profile: CurrentProfile, projectId: string) {
  const admin = createAdminClient();
  if (profile.role === "AGENT") {
    const assignment = await admin.from("tasks").select("project_id")
      .eq("project_id", projectId).eq("assignee_id", profile.id).limit(1);
    databaseError(assignment.error);
    if (!assignment.data?.length) throw new AccessError("Project not found", 404);
  }

  let projectQuery = admin.from("projects")
    .select("id,name,client_name,description,manager_id,deadline,created_at")
    .eq("id", projectId);
  if (profile.role === "MANAGER") projectQuery = projectQuery.eq("manager_id", profile.id);
  const { data, error } = await projectQuery.maybeSingle();
  databaseError(error);
  if (!data) throw new AccessError("Project not found", 404);
  const project = data as ProjectRow;

  let taskQuery = admin.from("tasks")
    .select("project_id,title,description,assignee_id,deadline,estimated_hours")
    .eq("project_id", projectId)
    .order("deadline", { ascending: true });
  if (profile.role === "AGENT") taskQuery = taskQuery.eq("assignee_id", profile.id);
  const taskResult = await taskQuery;
  databaseError(taskResult.error);
  const tasks = (taskResult.data ?? []) as TaskRow[];
  const people = await peopleById([
    ...new Set([project.manager_id, ...tasks.map((task) => task.assignee_id)]),
  ]);

  return {
    id: project.id,
    name: project.name,
    clientName: project.client_name,
    description: project.description,
    deadline: project.deadline,
    createdAt: project.created_at,
    managerName: people.get(project.manager_id)?.name ?? "Unknown manager",
    tasks: tasks.map((task) => ({
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      estimatedHours: task.estimated_hours,
      assigneeName: people.get(task.assignee_id)?.name ?? "Unknown assignee",
      assigneeRef: people.get(task.assignee_id)?.ref ?? "",
    })),
  };
}

export async function listMyTasks(profile: CurrentProfile) {
  if (profile.role !== "AGENT") throw new AccessError("Forbidden", 403);
  const admin = createAdminClient();
  const { data, error } = await admin.from("tasks")
    .select("project_id,title,description,assignee_id,deadline,estimated_hours")
    .eq("assignee_id", profile.id)
    .order("deadline", { ascending: true });
  databaseError(error);
  const tasks = (data ?? []) as TaskRow[];
  if (tasks.length === 0) return [];

  const { data: projectData, error: projectError } = await admin.from("projects")
    .select("id,name,client_name,deadline")
    .in("id", [...new Set(tasks.map((task) => task.project_id))]);
  databaseError(projectError);
  const projects = new Map(
    ((projectData ?? []) as Pick<ProjectRow, "id" | "name" | "client_name" | "deadline">[])
      .map((project) => [project.id, project]),
  );
  return tasks.map((task) => {
    const project = projects.get(task.project_id);
    return {
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      estimatedHours: task.estimated_hours,
      project: project ? {
        id: project.id,
        name: project.name,
        clientName: project.client_name,
        deadline: project.deadline,
      } : null,
    };
  });
}

export async function listTeam() {
  const { data, error } = await createAdminClient()
    .from("profiles").select("name,role,specialization").order("name");
  databaseError(error);
  return data ?? [];
}

export async function requireTranscriptAdmin() {
  return requireRole("ADMIN");
}

export function accessErrorResponse(error: unknown) {
  if (error instanceof AccessError) return Response.json({ error: error.message }, { status: error.status });
  throw error;
}
