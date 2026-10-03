import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPanel from "./admin-panel";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white">
        <div className="max-w-md border border-red-500/20 bg-[#101010] p-8 text-center">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-red-400">
            Access denied
          </div>

          <h1 className="mt-4 text-3xl font-black uppercase">
            Not an administrator
          </h1>

          <p className="mt-4 text-sm leading-6 text-zinc-500">
            Your Supabase account is signed in, but it has not been added to
            the tournament admin list.
          </p>
        </div>
      </main>
    );
  }

  return <AdminPanel admin={admin} userEmail={user.email ?? ""} />;
}