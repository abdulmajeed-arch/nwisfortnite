"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center bg-[#ff6b00] font-black italic text-black">
            FN
          </div>

          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
            Restricted Area
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase tracking-tight">
            Admin Portal
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Sign in to manage the NWIS Fortnite Tournament.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="border border-white/10 bg-[#101010] p-6"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff6b00]"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Password
              </label>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff6b00]"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-[#ff6b00] px-4 py-3 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#ff8126] disabled:opacity-50"
            >
              <LogIn size={16} />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}