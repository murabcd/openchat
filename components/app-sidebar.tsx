"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Plus, TextSearch } from "lucide-react";

import { SidebarHistory } from "@/components/sidebar-history";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";

import { Doc } from "@/convex/_generated/dataModel";

export const AppSidebar = ({ user }: { user: Doc<"users"> | null }) => {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [openCommandDialog, setOpenCommandDialog] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommandDialog((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelectChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    setOpenCommandDialog(false);
    setOpenMobile(false);
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center gap-1">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                OpenChat
              </span>
            </Link>
            <div className="flex flex-row items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={() => setOpenCommandDialog(true)}
                  >
                    <TextSearch className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">Search chats (⌘K)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push("/");
                      router.refresh();
                    }}
                  >
                    <Plus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent align="end">New chat</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory
          user={user}
          openCommandDialog={openCommandDialog}
          setOpenCommandDialog={setOpenCommandDialog}
          onSelectChat={handleSelectChat}
        />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
};
