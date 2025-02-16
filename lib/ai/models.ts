import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { customProvider, extractReasoningMiddleware, wrapLanguageModel } from "ai";

export const DEFAULT_CHAT_MODEL: string = "chat-model-small";

export const myProvider = customProvider({
  languageModels: {
    "chat-model-small": openai("gpt-4o-mini"),
    "chat-model-large": openai("gpt-4o"),
    "chat-model-reasoning": wrapLanguageModel({
      model: groq("deepseek-r1-distill-qwen-32b"),
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": openai("gpt-4-turbo"),
    "block-model": openai("gpt-4o-mini"),
  },
  imageModels: {
    "small-model": openai.image("dall-e-2"),
    "large-model": openai.image("dall-e-3"),
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
    name: "GPT 4o mini",
    description: "Fast model for simple tasks",
  },
  {
    id: "chat-model-large",
    name: "GPT 4o",
    description: "Powerful model for complex tasks",
  },
  {
    id: "chat-model-reasoning",
    name: "DeepSeek R1",
    description: "Advanced model for reasoning, multi-step tasks",
  },
];
