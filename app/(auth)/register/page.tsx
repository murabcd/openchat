import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { UserAuthForm } from "@/components/user-auth-form";

export const metadata = {
  title: "Create an account",
  description: "Create an account to get started.",
};

export default function RegisterPage() {
  return (
    <div className="flex h-screen">
      <div className="hidden w-1/2 flex-col justify-start items-start gap-4 bg-muted/40 lg:flex p-4">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-semibold">OpenChat</span>
            <p className="text-sm text-muted-foreground py-2">
              Bring your ideas to life using coding, images, text, data, and web search.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-[350px] space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image
              src="/logo-dark.svg"
              alt="Logo"
              width={30}
              height={30}
              className="dark:hidden"
            />
            <Image
              src="/logo.svg"
              alt="Logo"
              width={30}
              height={30}
              className="hidden dark:block"
            />
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Sign up to get started</p>
          </div>
          <UserAuthForm type="register" />
          <p className="text-center text-sm text-muted-foreground">
            By signing up, you agree to our{" "}
            <Link href="/#" className="hover:text-brand underline underline-offset-4">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/#" className="hover:text-brand underline underline-offset-4">
              Privacy
            </Link>
            .
          </p>
        </div>
      </div>
      <Link href="/login">
        <Button variant="ghost" className="absolute right-4 top-4 md:right-2 md:top-2">
          Sign in
        </Button>
      </Link>
    </div>
  );
}
