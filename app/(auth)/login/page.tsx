import Link from "next/link";
import Image from "next/image";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { UserAuthForm } from "@/components/user-auth-form";

export const metadata = {
  title: "Login to your account",
  description: "Login to your account to continue.",
};

export default function LoginPage() {
  return (
    <div className="flex h-screen">
      <div className="hidden w-1/2 bg-muted/40 lg:block" />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image
              src="/logo-dark.svg"
              alt="Logo"
              width={25}
              height={25}
              className="dark:hidden"
            />
            <Image
              src="/logo.svg"
              alt="Logo"
              width={25}
              height={25}
              className="hidden dark:block"
            />
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Login to your account to continue
            </p>
          </div>
          <UserAuthForm type="login" />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="hover:text-brand underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Link href="/">
        <Button variant="ghost" className="absolute right-4 top-4 md:right-2 md:top-2">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>
    </div>
  );
}
