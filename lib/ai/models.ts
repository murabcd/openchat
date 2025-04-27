import { openai } from "@ai-sdk/openai";
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from "ai";

export const DEFAULT_CHAT_MODEL: string = "chat-model-small";

export const myProvider = customProvider({
  languageModels: {
    "chat-model-small": openai.responses("gpt-4o-mini"),
    "chat-model-large": openai.responses("gpt-4o"),
    "chat-model-reasoning": wrapLanguageModel({
      model: openai.responses("o4-mini"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gpt-4.1-nano"),
    "block-model": openai("gpt-4o-mini"),
  },
  imageModels: {
    "image-model-small": openai.image("dall-e-2"),
    "image-model-large": openai.image("dall-e-3"),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: "chat-model-small",
    name: "Mini model",
    description: "Fast model for simple tasks",
  },
  {
    id: "chat-model-large",
    name: "Large model",
    description: "Powerful model for complex tasks",
  },
  {
    id: "chat-model-reasoning",
    name: "Reasoning model",
    description: "Advanced model for reasoning, multi-step tasks",
  },
];
