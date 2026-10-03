import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Admin = {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
};

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from("admins")
    .select("id, name, phone, photo_url")
    .order("name");

  const adminList = (admins ?? []) as Admin[];

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <Link
            href="/"
            className="text-sm font-bold text-zinc-500 transition hover:text-white"
          >
            ← Home
          </Link>

          <p className="mt-10 text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
            Need Help?
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            Contact
          </h1>

          <p className="mt-5 max-w-2xl text-zinc-400">
            Get in touch with the tournament administrators for questions,
            match issues, or tournament information.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        {adminList.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-[#0d0d0d] px-6 py-20 text-center">
            <h2 className="text-xl font-black uppercase">
              Admin contacts coming soon
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Administrator contact information will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {adminList.map((admin) => (
              <article
                key={admin.id}
                className="border border-white/10 bg-[#0d0d0d] p-6 transition hover:border-[#ff6b00]/40"
              >
                <div className="flex items-center gap-5">
                  {admin.photo_url ? (
                    <img
                      src={admin.photo_url}
                      alt={admin.name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#ff6b00] text-2xl font-black text-black">
                      {admin.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00]">
                      Tournament Admin
                    </p>

                    <h2 className="mt-1 text-2xl font-black uppercase">
                      {admin.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                    Phone
                  </div>

                  <div className="mt-2 break-all font-bold">
                    {admin.phone}
                  </div>

                  <a
                    href={`tel:${admin.phone}`}
                    className="mt-4 block w-full bg-[#ff6b00] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#ff8126]"
                  >
                    Contact Admin
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}