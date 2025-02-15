"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useUserMessageId() {
  const userMessageIdFromServer = useQuery(api.messages.getUserMessageId);
  const setUserMessageIdFromServer = useMutation(api.messages.setUserMessageId);

  return {
    userMessageIdFromServer,
    setUserMessageIdFromServer,
  };
}
