import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <Image src="/logo.jpg" alt="" width={96} height={96} className="size-20" />
      <p className="eyebrow">Page not found</p>
      <h1 className="text-5xl text-balance sm:text-6xl">This path doesn&apos;t lead anywhere</h1>
      <p className="max-w-md text-muted-foreground">
        The page or design you&apos;re looking for may have moved or is no longer
        available.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/shop" className={buttonVariants({ size: "xl" })}>
          Browse the collection
        </Link>
        <Link href="/" className={buttonVariants({ size: "xl", variant: "outline" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
