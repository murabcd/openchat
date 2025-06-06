import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveChat = mutation({
  args: {
    title: v.string(),
    chatId: v.string(),
    userId: v.id("users"),
    visibility: v.union(v.literal("private"), v.literal("public")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chats", args);
  },
});

export const listChats = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    return result;
  },
});

export const getChatById = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();
  },
});

export const deleteChatById = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .first();
    if (!chat) throw new Error("Chat not found");

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    const votes = await ctx.db
      .query("votes")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    const streams = await ctx.db
      .query("streams")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .collect();

    await Promise.all([
      ...votes.map((vote) => ctx.db.delete(vote._id)),
      ...messages.map((message) => ctx.db.delete(message._id)),
      ...documents.map((document) => ctx.db.delete(document._id)),
      ...streams.map((stream) => ctx.db.delete(stream._id)),
      ctx.db.delete(chat._id),
    ]);
  },
});

export const voteMessage = mutation({
  args: {
    chatId: v.string(),
    messageId: v.string(),
    type: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, args) => {
    const existingVote = await ctx.db
      .query("votes")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .first();

    if (existingVote) {
      return await ctx.db.patch(existingVote._id, {
        isUpvoted: args.type === "up",
      });
    }

    return await ctx.db.insert("votes", {
      chatId: args.chatId,
      messageId: args.messageId,
      isUpvoted: args.type === "up",
    });
  },
});

export const getVotesByChatId = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .collect();
  },
});

export const updateChatVisibilityById = mutation({
  args: {
    chatId: v.string(),
    visibility: v.union(v.literal("private"), v.literal("public")),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!chat) throw new Error("Chat not found");

    return await ctx.db.patch(chat._id, {
      visibility: args.visibility,
    });
  },
});

export const togglePinChat = mutation({
  args: {
    chatId: v.string(),
  },
  returns: v.object({ isPinned: v.boolean() }),
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(chat._id, { isPinned: !chat.isPinned });

    return { isPinned: !chat.isPinned };
  },
});

export const renameChat = mutation({
  args: {
    chatId: v.string(),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(chat._id, { title: args.newTitle });
  },
});

export const deleteAllUserChats = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const userChats = await ctx.db
      .query("chats")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const deletePromises: Promise<any>[] = [];

    for (const chat of userChats) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat.chatId))
        .collect();
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat.chatId))
        .collect();
      const documents = await ctx.db
        .query("documents")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat.chatId))
        .collect();
      const streams = await ctx.db
        .query("streams")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat.chatId))
        .collect();

      messages.forEach((msg) => deletePromises.push(ctx.db.delete(msg._id)));
      votes.forEach((vote) => deletePromises.push(ctx.db.delete(vote._id)));
      documents.forEach((doc) => deletePromises.push(ctx.db.delete(doc._id)));
      streams.forEach((stream) => deletePromises.push(ctx.db.delete(stream._id)));

      deletePromises.push(ctx.db.delete(chat._id));
    }

    await Promise.all(deletePromises);

    return { deletedChatsCount: userChats.length };
  },
});
