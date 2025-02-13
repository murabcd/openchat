import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
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
  handler: async (ctx) => {
    return await ctx.db.query("chats").order("desc").collect();
  },
});

export const addMessage = mutation({
  args: {
    chatId: v.string(),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    id: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});

export const getChatMessages = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
    return messages;
  },
});

export const getChatById = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();
    return chat;
  },
});

export const deleteChatById = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.id))
      .first();

    if (!chat) {
      throw new Error("Chat not found");
    }

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete the chat
    await ctx.db.delete(chat._id);
  },
});

export const updateChatTitle = mutation({
  args: {
    chatId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .first();

    if (!existingChat) {
      throw new Error("Chat not found");
    }

    await ctx.db.patch(existingChat._id, {
      title: args.title,
    });

    return existingChat._id;
  },
});

export const saveMessages = mutation({
  args: {
    messages: v.array(
      v.object({
        id: v.string(),
        chatId: v.string(),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        userId: v.id("users"),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.messages.map((message) => ctx.db.insert("messages", message))
    );
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
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
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
      .filter((q) => q.eq(q.field("chatId"), args.chatId))
      .collect();
  },
});

export const updateChatVisibility = mutation({
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

export const deleteMessagesByChatIdAfterTimestamp = mutation({
  args: {
    chatId: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.gte(q.field("_creationTime"), args.timestamp))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
  },
});
