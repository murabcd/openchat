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
    visibility: v.union(v.literal("private"), v.literal("public")),
    chatId: v.string(),
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    content: v.any(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    chatId: v.string(),
    messageId: v.string(),
  }).index("by_chatId", ["chatId"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    kind: v.union(
      v.literal("text"),
      v.literal("code"),
      v.literal("image"),
      v.literal("sheet")
    ),
    documentId: v.string(),
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  suggestions: defineTable({
    originalText: v.string(),
    suggestedText: v.string(),
    description: v.optional(v.string()),
    isResolved: v.boolean(),
    documentId: v.string(),
    suggestionId: v.string(),
    userId: v.id("users"),
  })
    .index("by_documentId", ["documentId"])
    .index("by_userId", ["userId"]),

  votes: defineTable({
    chatId: v.string(),
    messageId: v.string(),
    isUpvoted: v.boolean(),
  }).index("by_messageId", ["messageId"]),
});
