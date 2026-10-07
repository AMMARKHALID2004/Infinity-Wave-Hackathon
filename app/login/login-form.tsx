"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? "Unable to sign in."); return; }
      router.push("/");
      router.refresh();
    } catch { setError("Could not reach the server. Please try again."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-6 space-y-4">
    <label className="block text-sm font-medium">Email<input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-md border border-neutral-300 p-2" /></label>
    <label className="block text-sm font-medium">Password<input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-md border border-neutral-300 p-2" /></label>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="w-full rounded-md bg-blue-700 p-2 text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
  </form>;
}
