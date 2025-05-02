"use client";

import React, { useState } from "react";

import { UserCog, PaintBucket, Database } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Doc } from "@/convex/_generated/dataModel";

import SettingsAccount from "./settings-account";
import SettingsAppearance from "./settings-appearance";
import SettingsDataControls from "./settings-data-controls";

interface SettingsDialogProps {
  user: Doc<"users">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActiveTab = "account" | "appearance" | "data";

const SettingsDialog = ({ user, open, onOpenChange }: SettingsDialogProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("account");

  const renderContent = () => {
    switch (activeTab) {
      case "account":
        return <SettingsAccount user={user} />;
      case "appearance":
        return <SettingsAppearance />;
      case "data":
        return <SettingsDataControls />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 md:min-h-[620px] h-[calc(100dvh-64px)] md:h-auto max-w-3xl flex flex-col md:overflow-hidden">
        <DialogHeader className="relative flex-shrink-0 px-6 pt-5 pb-2 min-h-10">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-grow h-0 focus:outline-none">
          {/* Left Sidebar */}
          <div className="flex flex-row md:flex-col gap-1.5 p-2 overflow-x-auto md:overflow-x-visible">
            <Button
              variant="ghost"
              className={cn(
                "justify-start gap-3 px-4 min-w-40 h-10 text-sm group",
                activeTab === "account" && "bg-muted text-primary"
              )}
              onClick={() => setActiveTab("account")}
            >
              <UserCog
                className={cn(
                  "w-4 h-4 text-muted-foreground group-hover:text-primary",
                  activeTab === "account" && "text-primary"
                )}
              />{" "}
              Account
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "justify-start gap-3 px-4 min-w-40 h-10 text-sm group",
                activeTab === "appearance" && "bg-muted text-primary"
              )}
              onClick={() => setActiveTab("appearance")}
            >
              <PaintBucket
                className={cn(
                  "w-4 h-4 text-muted-foreground group-hover:text-primary",
                  activeTab === "appearance" && "text-primary"
                )}
              />{" "}
              Appearance
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "justify-start gap-3 px-4 min-w-40 h-10 text-sm group",
                activeTab === "data" && "bg-muted text-primary"
              )}
              onClick={() => setActiveTab("data")}
            >
              <Database
                className={cn(
                  "w-4 h-4 text-muted-foreground group-hover:text-primary",
                  activeTab === "data" && "text-primary"
                )}
              />{" "}
              Data controls
            </Button>
          </div>

          {/* Right Content */}
          <div className="flex-1 w-full h-full md:pl-4 pr-4 pb-10 md:pr-4 overflow-y-auto focus:outline-none">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
