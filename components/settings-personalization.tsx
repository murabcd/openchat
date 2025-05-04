"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsMemoriesView } from "@/components/settings-memories-view";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SettingsPersonalizationProps {
  onManageMemoriesClick?: () => void;
}

const SettingsPersonalization = ({
  onManageMemoriesClick,
}: SettingsPersonalizationProps) => {
  const [isModalOpen, setIsModalOpen] = useState(
    !onManageMemoriesClick ? false : undefined
  );

  const handleManageClick = () => {
    if (onManageMemoriesClick) {
      onManageMemoriesClick();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 pt-4 px-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm">Memory</span>
          <Switch id="memory-switch" />
        </div>
        <Button
          variant="link"
          onClick={handleManageClick}
          className="text-xs text-muted-foreground hover:text-primary h-auto px-0 py-0 self-start"
        >
          Manage memories
        </Button>
      </div>

      {typeof isModalOpen === "boolean" && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Saved memories</DialogTitle>
            </DialogHeader>
            <SettingsMemoriesView />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SettingsPersonalization;
