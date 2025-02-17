import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <Image
            src="/logo-dark.svg"
            alt="Logo"
            width={40}
            height={40}
            className="dark:hidden"
          />
          <Image
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="hidden dark:block"
          />
        </p>
        <h1 className="text-4xl font-semibold">What can I help with?</h1>
        <p className="font-medium text-muted-foreground">
          You can learn about the project and contribute by visiting{" "}
          <Link
            className="underline underline-offset-4"
            href="https://github.com/muradpm/openchat"
            target="_blank"
          >
            GitHub
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
