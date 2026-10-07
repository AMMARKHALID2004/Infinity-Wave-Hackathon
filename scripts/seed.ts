import "./env";
import { createAdminClient } from "../lib/supabase/admin";

type DemoAccount = {
  ref: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "AGENT";
  specialization: string;
  skills: string[];
};

const accounts: DemoAccount[] = [
  { ref: "ADMIN", name: "Admin", email: "admin@novaworks.example", role: "ADMIN", specialization: "Administrator", skills: ["Company overview", "transcript creation"] },
  { ref: "PM01", name: "Ayesha Khan", email: "ayesha@novaworks.example", role: "MANAGER", specialization: "Web PM", skills: ["Web projects", "client coordination"] },
  { ref: "PM02", name: "Bilal Ahmed", email: "bilal@novaworks.example", role: "MANAGER", specialization: "Mobile PM", skills: ["Mobile projects", "delivery planning"] },
  { ref: "PM03", name: "Hina Malik", email: "hina@novaworks.example", role: "MANAGER", specialization: "AI PM", skills: ["AI projects", "requirement review"] },
  { ref: "DEV01", name: "Ali Raza", email: "ali@novaworks.example", role: "AGENT", specialization: "Full-Stack", skills: ["React", "frontend integration"] },
  { ref: "DEV02", name: "Hamza Shah", email: "hamza@novaworks.example", role: "AGENT", specialization: "Full-Stack", skills: ["Node.js", "databases", "APIs"] },
  { ref: "DEV03", name: "Sara Noor", email: "sara@novaworks.example", role: "AGENT", specialization: "App Developer", skills: ["Flutter", "mobile UI"] },
  { ref: "DEV04", name: "Usman Tariq", email: "usman@novaworks.example", role: "AGENT", specialization: "App Developer", skills: ["Flutter", "integration", "testing"] },
  { ref: "DEV05", name: "Zain Abbas", email: "zain@novaworks.example", role: "AGENT", specialization: "AI Developer", skills: ["LLMs", "extraction", "prompts"] },
  { ref: "DEV06", name: "Maryam Asif", email: "maryam@novaworks.example", role: "AGENT", specialization: "AI Developer", skills: ["Retrieval", "document processing"] },
];

async function main() {
  const admin = createAdminClient();
  const users = new Map<string, string>();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const user of data.users) if (user.email) users.set(user.email.toLowerCase(), user.id);
    if (data.users.length < 1000) break;
  }
  for (const account of accounts) {
    let id = users.get(account.email);
    if (!id) {
      const { data, error } = await admin.auth.admin.createUser({
        email: account.email,
        password: "Demo123!",
        email_confirm: true,
      });
      if (error) throw new Error(`Creating ${account.ref}: ${error.message}`);
      id = data.user.id;
      users.set(account.email, id);
    } else {
      // Existing demo users must still have the documented demo credential.
      const { error } = await admin.auth.admin.updateUserById(id, {
        password: "Demo123!",
        email_confirm: true,
      });
      if (error) throw new Error(`Updating ${account.ref}: ${error.message}`);
    }
    const { error } = await admin.from("profiles").upsert(
      { id, ...account }, { onConflict: "email" },
    );
    if (error) throw new Error(`Saving ${account.ref}: ${error.message}`);
    console.log(`Seeded ${account.ref} (${account.email})`);
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
