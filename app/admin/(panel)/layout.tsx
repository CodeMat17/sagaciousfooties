import { fetchQuery } from "convex/nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { AdminSessionProvider } from "@/components/admin/admin-session";
import { AdminShell } from "@/components/admin/admin-shell";
import { api } from "@/convex/_generated/api";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminSplash />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

/** Server-side gate: the session cookie is verified against Convex. */
async function AdminGate({ children }: { children: ReactNode }) {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  let valid = false;
  try {
    valid = await fetchQuery(api.adminAuth.validateSession, { sessionToken: token });
  } catch {
    valid = false;
  }
  if (!valid) redirect("/admin/login");

  return (
    <AdminSessionProvider token={token}>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}

function AdminSplash() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <span className="size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-sm">Opening the atelier…</span>
      </div>
    </div>
  );
}
