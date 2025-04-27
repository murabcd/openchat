import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

export const Overview = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold"
      >
        Hello there!
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
          Type questions, request code examples, or ask for explanations on any topic. If
          you like the project, contribute or star it on{" "}
          <Link
            className="underline underline-offset-4"
            href="https://github.com/muradpm/openchat"
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
