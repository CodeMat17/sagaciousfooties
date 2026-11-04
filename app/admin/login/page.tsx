import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="grain relative hidden flex-col justify-between overflow-hidden bg-espresso p-12 text-ivory lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(201,162,92,0.3),transparent_60%)]" />
        <p className="relative text-[0.7rem] tracking-[0.3em] text-tan uppercase">
          Sagacious Footies · Atelier
        </p>
        <Image
          src="/logo.jpg"
          alt=""
          width={512}
          height={512}
          preload
          className="relative mx-auto w-2/3 max-w-sm drop-shadow-[0_30px_50px_rgba(0,0,0,0.5)]"
        />
        <p className="relative font-display text-3xl italic">
          Manage your collection. Every change goes live instantly.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-3 text-center lg:text-left">
            <Image
              src="/logo.jpg"
              alt=""
              width={96}
              height={96}
              className="mx-auto size-16 lg:hidden"
            />
            <p className="eyebrow">Owner access</p>
            <h1 className="text-5xl">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your admin PIN to manage products, prices and enquiries.
            </p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground lg:text-left">
            <Link href="/" className="underline-offset-4 hover:underline">
              ← Back to the store
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
