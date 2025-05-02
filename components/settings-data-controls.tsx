"use client";

import React, { useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";

const SettingsDataControls = () => {
  const [showDeleteChatsDialog, setShowDeleteChatsDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);

  const deleteAllChatsMutation = useMutation(api.chats.deleteAllUserChats);
  const deleteAccountMutation = useMutation(api.users.deleteCurrentUser);
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleDeleteAllChats = async () => {
    toast.promise(deleteAllChatsMutation({}), {
      loading: "Deleting all chats...",
      success: (result) => {
        setShowDeleteChatsDialog(false);
        return `Successfully deleted ${result.deletedChatsCount} chats.`;
      },
      error: (err) => {
        setShowDeleteChatsDialog(false);
        return `Failed to delete chats: ${err.message || "Unknown error"}`;
      },
    });
  };

  const handleDeleteAccount = async () => {
    toast.promise(deleteAccountMutation({}), {
      loading: "Deleting account...",
      success: () => {
        setShowDeleteAccountDialog(false);
        signOut();
        router.push("/");
        return "Account deleted successfully.";
      },
      error: (err) => {
        setShowDeleteAccountDialog(false);
        return `Failed to delete account: ${err.message || "Unknown error"}`;
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 pt-4 px-3">
      {/* Delete All Chats */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Delete all chats</span>
        <AlertDialog open={showDeleteChatsDialog} onOpenChange={setShowDeleteChatsDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive focus:text-destructive dark:text-red-500"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your
                conversations and associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-none">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAllChats}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Delete Account */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Delete account</span>
        <AlertDialog
          open={showDeleteAccountDialog}
          onOpenChange={setShowDeleteAccountDialog}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive focus:text-destructive dark:text-red-500"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-none">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SettingsDataControls;
