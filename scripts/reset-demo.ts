import "./env";
import { createAdminClient } from "../lib/supabase/admin";

async function main() {
  const admin = createAdminClient();
  const { error: taskError } = await admin.from("tasks").delete().not("id", "is", null);
  if (taskError) throw taskError;
  const { error: projectError } = await admin.from("projects").delete().not("id", "is", null);
  if (projectError) throw projectError;
  console.log("Deleted demo tasks and projects. Users and profiles remain.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
