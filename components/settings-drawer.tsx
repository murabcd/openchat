"use client";

import React, { useState } from "react";

import {
  UserCog,
  PaintBucket,
  Database,
  ChevronRight,
  ArrowLeft,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AppearanceSettings from "@/components/settings-appearance";
import DataControlsSettings from "@/components/settings-data-controls";
import PersonalizationSettings from "@/components/settings-personalization";
import { SettingsProfileView } from "@/components/settings-profile-view";
import { SettingsMemoriesView } from "@/components/settings-memories-view";

import type { Doc } from "@/convex/_generated/dataModel";

interface SettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Doc<"users">;
}

type SettingsView =
  | "main"
  | "account"
  | "appearance"
  | "data"
  | "personalization"
  | "manageMemories"
  | "accountDetails";

const SettingsDrawer = ({ open, onOpenChange, user }: SettingsDrawerProps) => {
  const [currentView, setCurrentView] = useState<SettingsView>("main");

  const settingsItems = [
    { id: "account", label: "Account", icon: UserCog, view: "account" as SettingsView },
    {
      id: "personalization",
      label: "Personalization",
      icon: WandSparkles,
      view: "personalization" as SettingsView,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: PaintBucket,
      view: "appearance" as SettingsView,
    },
    { id: "data", label: "Data controls", icon: Database, view: "data" as SettingsView },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "main":
        return (
          <div className="p-2 flex flex-col gap-1">
            {settingsItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-between h-12 px-3"
                onClick={() => setCurrentView(item.view)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Button>
            ))}
          </div>
        );

      case "account":
        return (
          <div className="p-4 flex flex-col gap-6">
            <div className="flex flex-row items-center justify-between w-full gap-4">
              <div className="flex flex-row items-center gap-3">
                <Avatar className="w-12 h-12 border">
                  <AvatarImage
                    src={user.avatarUrl ?? user.image ?? undefined}
                    alt={user.name ?? "User"}
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0) ?? user.email.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div>{user.name ?? "User Name"}</div>
                  <div className="text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView("accountDetails")}
              >
                Manage
              </Button>
            </div>
          </div>
        );
      case "accountDetails":
        return (
          <div className="p-4">
            <SettingsProfileView
              user={user}
              onSaveSuccess={() => setCurrentView("account")}
              onCancel={() => setCurrentView("account")}
            />
          </div>
        );
      case "appearance":
        return (
          <div className="p-4">
            <AppearanceSettings />
          </div>
        );

      case "data":
        return (
          <div className="p-4">
            <DataControlsSettings />
          </div>
        );

      case "personalization":
        return (
          <div className="p-4">
            <PersonalizationSettings
              onManageMemoriesClick={() => setCurrentView("manageMemories")}
            />
          </div>
        );

      case "manageMemories":
        return (
          <div className="p-4">
            <SettingsMemoriesView />
          </div>
        );

      default:
        return null;
    }
  };

  const handleBack = () => {
    if (currentView === "manageMemories") {
      setCurrentView("personalization");
    } else if (currentView === "accountDetails") {
      setCurrentView("account");
    } else {
      setCurrentView("main");
    }
  };

  const getTitle = () => {
    if (currentView === "main") return "Settings";
    if (currentView === "manageMemories") return "Saved memories";
    if (currentView === "accountDetails") return "Manage account";
    const item = settingsItems.find(
      (i) => i.view === currentView || (i.id === currentView && currentView === "account")
    );
    return item?.label ?? "Settings";
  };

  React.useEffect(() => {
    if (!open) {
      setCurrentView("main");
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[70dvh] rounded-tr-lg rounded-tl-lg">
        <DrawerHeader className="flex items-center justify-center relative gap-2 px-4 pt-4 pb-2">
          {currentView !== "main" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 absolute left-2 top-3.5"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <DrawerTitle>{getTitle()}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto flex-1">{renderContent()}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
