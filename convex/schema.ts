import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    title: v.string(),
    chatId: v.string(),
    _creationTime: v.number(),
  }).index("by_chatId", ["chatId"]),

  messages: defineTable({
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    chatId: v.string(),
    id: v.string(),
    _creationTime: v.number(),
  }).index("by_chat", ["chatId"]),

  files: defineTable({
    storageId: v.id("_storage"),
    name: v.string(),
    contentType: v.string(),
    url: v.string(),
    uploadedBy: v.string(),
    uploadedAt: v.number(),
  }),
});
