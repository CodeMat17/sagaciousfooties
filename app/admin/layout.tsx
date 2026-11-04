import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin | Sagacious Footies" },
  robots: { index: false, follow: false },
};

// Tooltips are only used by the admin sidebar, so the provider lives here
// rather than in the root layout (keeps its code off the storefront).
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <TooltipProvider>{children}</TooltipProvider>;
}
