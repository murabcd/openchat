import "server-only";

import { cache } from "react";

import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

export const getCurrentUser = cache(async (): Promise<Doc<"users"> | null> => {
  try {
    const token = await convexAuthNextjsToken();
    if (!token) {
      return null;
    }

    const user = await fetchQuery(api.users.getUser, {}, { token });
    return user;
  } catch (error) {
    console.error("Error fetching cached user:", error);
    return null;
  }
});
