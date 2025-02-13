import { cookies } from "next/headers";

import { Chat } from "@/components/chat";

import { models } from "@/lib/ai/models";
import { DEFAULT_MODEL_NAME } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("model-id")?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME;

  return (
    <Chat key={id} chatId={id} initialMessages={[]} selectedModelId={selectedModelId} />
  );
}
