"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SettingsProfileView } from "@/components/settings-profile-view";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { Doc } from "@/convex/_generated/dataModel";

interface AccountSettingsProps {
  user: Doc<"users">;
}

const SettingsAccount = ({ user }: AccountSettingsProps) => {
  const [isManageAccountOpen, setIsManageAccountOpen] = React.useState(false);

  const handleSaveSuccess = () => {
    setIsManageAccountOpen(false);
  };

  const handleCancel = () => {
    setIsManageAccountOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full gap-6 pt-4">
      {/* Account User Info */}
      <div className="flex flex-row items-center justify-between w-full gap-4 px-3">
        <div className="flex flex-row items-center gap-3">
          <Avatar className="w-12 h-12 border">
            {" "}
            {/* Use shadcn Avatar, size 48x48px (w-12 h-12) */}
            <AvatarImage
              src={user.avatarUrl ?? user.image ?? undefined}
              alt={user.name ?? "User"}
            />
            <AvatarFallback>
              {/* Fallback with initials */}
              {user.name?.charAt(0) ?? user.email.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <div>{user.name ?? "User Name"}</div>
            <div className="text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsManageAccountOpen(true)}>
          Manage
        </Button>
      </div>

      {isManageAccountOpen && (
        <Dialog open={isManageAccountOpen} onOpenChange={setIsManageAccountOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Manage account</DialogTitle>
            </DialogHeader>
            <SettingsProfileView
              user={user}
              onSaveSuccess={handleSaveSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SettingsAccount;
