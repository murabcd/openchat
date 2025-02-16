"use client";

import { memo } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useWindowSize } from "usehooks-ts";

import { Plus } from "lucide-react";

import { ModelSelector } from "@/components/model-selector";
import { SidebarToggle } from "@/components/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VisibilityType, VisibilitySelector } from "@/components/visibility-selector";

import { Unauthenticated } from "convex/react";

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push("/");
                router.refresh();
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="md:sr-only">New chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ModelSelector selectedModelId={selectedModelId} className="order-1 md:order-2" />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

      <Unauthenticated>
        <Button className="flex md:h-[34px] order-4 md:ml-auto" asChild>
          <Link href="/register">Sign up</Link>
        </Button>
      </Unauthenticated>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, () => true);
