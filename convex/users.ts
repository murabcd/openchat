import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

export const getUser = query({
  args: {},
  handler: async (ctx): Promise<Doc<"users"> | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId);
  },
});

export const deleteCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      await ctx.runMutation(api.chats.deleteAllUserChats, {});
    } catch (error) {
      console.error("Error deleting user chats during account deletion:", error);
      throw new Error("Failed to delete associated chat data.");
    }

    await ctx.db.delete(userId);

    return { success: true };
  },
});

export const updateMemoryPreference = mutation({
  args: { enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    await ctx.db.patch(userId, { isMemoryEnabled: args.enabled });

    return null;
  },
});

export const updateAccountDetails = mutation({
  args: {
    name: v.string(),
    avatarStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    let avatarUrlToStore: string | undefined = undefined;

    if (args.avatarStorageId) {
      const urlFromResult = await ctx.storage.getUrl(args.avatarStorageId);
      if (urlFromResult) {
        avatarUrlToStore = urlFromResult;
      } else {
        console.warn(
          `Could not get URL for storageId: ${args.avatarStorageId}. Avatar URL will not be updated.`
        );
        avatarUrlToStore = undefined;
      }
    }

    await ctx.db.patch(userId, {
      name: args.name,
      ...(args.avatarStorageId !== undefined && {
        avatarStorageId: args.avatarStorageId,
      }),
      avatarUrl: args.avatarStorageId ? avatarUrlToStore : undefined,
    });

    return { success: true };
  },
});
