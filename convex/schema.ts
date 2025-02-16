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
    userId: v.id("users"),
    visibility: v.union(v.literal("private"), v.literal("public")),
    createdAt: v.number(),
  }).index("by_chatId", ["chatId"]),

  messages: defineTable({
    content: v.any(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    id: v.string(),
    chatId: v.string(),
    userId: v.id("users"),
    state: v.union(v.literal("complete"), v.literal("in_progress")),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_message_id", ["id"]),

  documents: defineTable({
    title: v.string(),
    kind: v.union(v.literal("text"), v.literal("code")),
    content: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  suggestions: defineTable({
    documentId: v.string(),
    originalText: v.string(),
    suggestedText: v.string(),
    description: v.string(),
    isResolved: v.boolean(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_documentId", ["documentId"]),

  votes: defineTable({
    chatId: v.string(),
    messageId: v.string(),
    isUpvoted: v.boolean(),
  }).index("by_message", ["messageId"]),
});
