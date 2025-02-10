import { Chat } from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const id = generateUUID();

  return <Chat key={id} chatId={id} initialMessages={[]} />;
}
