import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return <main className="mx-auto max-w-3xl px-6 py-20">
    <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">NovaWorks Technologies</p>
    <h1 className="mt-4 text-4xl font-bold tracking-tight">AI Project Manager</h1>
    <p className="mt-4 text-neutral-600">Meeting to execution. The CRM screens and transcript flow are the next build step.</p>
    <Link href="/login" className="mt-8 inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-white">Demo login <ArrowRight size={16} /></Link>
  </main>;
}
