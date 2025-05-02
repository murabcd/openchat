import { query, internalMutation, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

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
