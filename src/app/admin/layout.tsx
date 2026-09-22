import Link from "next/link";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/catalogue", label: "Catalogue" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/membres", label: "Membres" },
  { href: "/admin/import", label: "Import" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-48 shrink-0 border-r border-foreground/10 px-4 py-8">
        <p className="mb-6 text-xs uppercase tracking-[0.3em] text-gold">
          Admin
        </p>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-2 py-1.5 text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
