import Link from "next/link";

import { motion } from "framer-motion";
import { Doc } from "@/convex/_generated/dataModel";

interface OverviewProps {
  user: Doc<"users"> | null;
}

export const Overview = ({ user }: OverviewProps) => {
  const firstName = user?.name ? user.name.split(" ")[0] : null;

  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-4 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        {firstName ? `Hello, ${firstName}.` : "Hello there!"}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-2xl text-zinc-500"
      >
        How can I help you today?
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
        className="mt-4"
      >
        <p className="font-medium text-sm text-muted-foreground">
          Type questions, request code, or ask for explanations on any topic. If you like
          it, contribute or star on{" "}
          <Link
            className="underline underline-offset-4"
            href="https://github.com/murabcd/openchat"
            target="_blank"
          >
            GitHub
          </Link>
          .
        </p>
      </motion.div>
    </div>
  );
};
