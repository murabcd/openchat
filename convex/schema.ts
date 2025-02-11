import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    emailVerificationTime: v.optional(v.number()),
  }).index("email", ["email"]),

  chats: defineTable({
    title: v.string(),
    chatId: v.string(),
  }).index("by_chatId", ["chatId"]),

  messages: defineTable({
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    chatId: v.string(),
    id: v.string(),
  }).index("by_chat", ["chatId"]),

  files: defineTable({
    storageId: v.id("storage"),
    name: v.string(),
    contentType: v.string(),
    url: v.string(),
  }),
});
