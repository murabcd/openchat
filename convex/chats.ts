import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createChat = mutation({
  args: {
    title: v.string(),
    chatId: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});

export const getChatMessages = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const getChatById = query({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();
  },
});

export const deleteChatById = mutation({
  args: { chatId: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_chatId", (q) => q.eq("chatId", args.chatId))
      .unique();

    if (!chat) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
    return await ctx.db.delete(chat._id);
  },
});
