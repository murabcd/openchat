import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const deleteTrailingMessages = mutation({
  args: { messageId: v.string() },
  handler: async (ctx, { messageId }) => {
    try {
      const message = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("id"), messageId))
        .first();

      if (!message) {
        throw new Error(`Message not found with id: ${messageId}`);
      }

      const messagesToDelete = await ctx.db
        .query("messages")
        .filter((q) =>
          q.and(
            q.eq(q.field("chatId"), message.chatId),
            q.gt(q.field("_creationTime"), message._creationTime)
          )
        )
        .collect();

      for (const msg of messagesToDelete) {
        await ctx.db.delete(msg._id);
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
});

export const getUserMessageId = query({
  args: {},
  handler: async (ctx) => {
    const messageId = await ctx.db
      .query("messages")
      .order("desc")
      .filter((q) => q.eq(q.field("role"), "user"))
      .first();

    return messageId?.id ?? null;
  },
});

export const setUserMessageId = mutation({
  args: { messageId: v.string() },
  handler: async (ctx, { messageId }) => {
    // You might want to store this in a separate table or update the message
    // depending on your needs
    const message = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("id"), messageId))
      .first();

    if (!message) {
      throw new Error("Message not found");
    }

    // Return the message ID that was set
    return messageId;
  },
});
