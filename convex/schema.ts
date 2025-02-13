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
  }).index("by_chatId", ["chatId"]),

  messages: defineTable({
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    id: v.string(),
    chatId: v.string(),
    userId: v.id("users"),
  }).index("by_chat", ["chatId"]),

  files: defineTable({
    storageId: v.id("storage"),
    name: v.string(),
    type: v.string(),
    url: v.string(),
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  documents: defineTable({
    title: v.string(),
    kind: v.union(v.literal("text"), v.literal("code")),
    content: v.string(),
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),

  suggestions: defineTable({
    documentId: v.string(),
    originalText: v.string(),
    suggestedText: v.string(),
    description: v.string(),
    isResolved: v.boolean(),
    userId: v.id("users"),
  }).index("by_documentId", ["documentId"]),

  votes: defineTable({
    chatId: v.string(),
    messageId: v.string(),
    isUpvoted: v.boolean(),
  }).index("by_message", ["messageId"]),
});
