"use client";

import React, { useState } from "react";

import { UserCog, PaintBucket, Database, ChevronRight, ArrowLeft } from "lucide-react";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

import type { Doc } from "@/convex/_generated/dataModel";

import AccountSettings from "./settings-account";
import AppearanceSettings from "./settings-appearance";
import DataControlsSettings from "./settings-data-controls";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Doc<"users">;
}

type SettingsView = "main" | "account" | "appearance" | "data";

const SettingsDrawer = ({ open, onOpenChange, user }: SettingsSheetProps) => {
  const [currentView, setCurrentView] = useState<SettingsView>("main");

  const settingsItems = [
    { id: "account", label: "Account", icon: UserCog, view: "account" as SettingsView },
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
          <div className="p-4">
            <AccountSettings user={user} />
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

      default:
        return null;
    }
  };

  const handleBack = () => {
    setCurrentView("main");
  };

  const getTitle = () => {
    if (currentView === "main") return "Settings";
    const item = settingsItems.find((i) => i.view === currentView);
    return item?.label ?? "Settings";
  };

  React.useEffect(() => {
    if (!open) {
      setCurrentView("main");
    }
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[70dvh] rounded-lg">
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
