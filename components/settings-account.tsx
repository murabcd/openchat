"use client";

import React from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";

import type { Doc } from "@/convex/_generated/dataModel";

interface AccountSettingsProps {
  user: Doc<"users">;
}

const SettingsAccount = ({ user }: AccountSettingsProps) => {
  return (
    <div className="flex flex-col w-full h-full gap-6 pt-4">
      {/* Account User Info */}
      <div className="flex flex-row items-center justify-between w-full gap-4 px-3">
        <div className="flex flex-row items-center gap-3">
          <Image
            src={user.image ?? "https://avatar.vercel.sh/user"}
            alt={user.name ?? "User"}
            width={48}
            height={48}
            className="rounded-full border"
          />
          <div className="text-sm">
            <div>{user.name ?? "User Name"}</div>
            <div className="text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Manage
        </Button>
      </div>
    </div>
  );
};

export default SettingsAccount;
