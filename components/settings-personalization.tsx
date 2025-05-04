"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsMemoriesView } from "@/components/settings-memories-view";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface SettingsPersonalizationProps {
  onManageMemoriesClick?: () => void;
}

const SettingsPersonalization = ({
  onManageMemoriesClick,
}: SettingsPersonalizationProps) => {
  const [isModalOpen, setIsModalOpen] = useState(
    !onManageMemoriesClick ? false : undefined
  );

  const user = useQuery(api.users.getUser);
  const updateMemoryPreference = useMutation(api.users.updateMemoryPreference);

  const handleManageClick = () => {
    if (onManageMemoriesClick) {
      onManageMemoriesClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleMemoryToggle = (checked: boolean) => {
    updateMemoryPreference({ enabled: checked })
      .then(() => {
        toast.success(checked ? "Memory enabled" : "Memory disabled");
      })
      .catch((error) => {
        toast.error("Failed to update preference");
        console.error("Failed to update memory preference:", error);
      });
  };

  const isMemoryCurrentlyEnabled = user?.isMemoryEnabled ?? true;

  return (
    <>
      <div className="flex flex-col gap-4 pt-4 px-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-sm">Memory</span>
          <Switch
            id="memory-switch"
            checked={isMemoryCurrentlyEnabled}
            onCheckedChange={handleMemoryToggle}
            disabled={user === undefined}
          />
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
