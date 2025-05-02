"use client";

import { useState } from "react";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import { ChevronUp, Settings, Moon, Sun, LogOut } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import SettingsDialog from "@/components/settings-dialog";
import SettingsSheet from "@/components/settings-drawer";

import { useAuthActions } from "@convex-dev/auth/react";
import { Doc } from "@/convex/_generated/dataModel";

export const SidebarUserNav = ({ user }: { user: Doc<"users"> }) => {
  const { setTheme, theme } = useTheme();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen} modal={true}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
                <Image
                  src={user.image}
                  alt={user.email}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="truncate">{user.email}</span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  setDropdownOpen(false);
                  setIsSettingsOpen(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4 mr-2" />
                ) : (
                  <Sun className="h-4 w-4 mr-2" />
                )}
                {`${theme === "light" ? "Dark" : "Light"} mode`}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  className="w-full cursor-pointer flex items-center"
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {isMobile ? (
        <SettingsSheet
          user={user}
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      ) : (
        <SettingsDialog
          user={user}
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
        />
      )}
    </>
  );
};
