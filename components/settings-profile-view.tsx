"use client";

import React, { useState, useEffect, useRef } from "react";

import { toast } from "sonner";
import { ImageUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";

interface SettingsProfileViewProps {
  user: Doc<"users">;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export const SettingsProfileView = ({
  user,
  onSaveSuccess,
  onCancel,
}: SettingsProfileViewProps) => {
  const [name, setName] = useState(user.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarUrl ?? user.image ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateAttachmentUrl = useMutation(api.files.generateAttachmentUrl);
  const updateAccountDetails = useMutation(api.users.updateAccountDetails);
  const storeUser = useQuery(api.users.getUser, {});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user.name);
    setAvatarPreview(user.avatarUrl ?? user.image ?? null);
    setAvatarFile(null);
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size exceeds 5MB limit.");
        return;
      }
      if (!["image/png", "image/jpeg", "image/gif", "image/webp"].includes(file.type)) {
        toast.error("Invalid file type. Please upload PNG, JPG, GIF, or WEBP.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    let newAvatarStorageId: Id<"_storage"> | undefined = user.avatarStorageId;
    const optimisticallyUpdatedName = name.trim();
    const optimisticallyUpdatedAvatarUrl = avatarPreview;

    try {
      if (avatarFile) {
        setIsUploading(true);
        const postUrl = await generateAttachmentUrl({ contentType: avatarFile.type });
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": avatarFile.type },
          body: avatarFile,
        });
        const { storageId } = await result.json();
        newAvatarStorageId = storageId;
        setIsUploading(false);
      }

      await updateAccountDetails.withOptimisticUpdate((localStore) => {
        if (!storeUser) return;
        const currentUser = localStore.getQuery(api.users.getUser, {});
        if (currentUser) {
          localStore.setQuery(
            api.users.getUser,
            {},
            {
              ...currentUser,
              name: optimisticallyUpdatedName,
              avatarUrl: avatarFile
                ? (optimisticallyUpdatedAvatarUrl ?? undefined)
                : newAvatarStorageId
                  ? (optimisticallyUpdatedAvatarUrl ?? undefined)
                  : currentUser.avatarUrl,
            }
          );
        }
      })({
        name: optimisticallyUpdatedName,
        avatarStorageId: newAvatarStorageId,
      });

      toast.success("Account updated");
      onSaveSuccess();
    } catch (error) {
      console.error("Failed to update account:", error);
      toast.error("Failed to update account");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col h-full">
      <div className="grid gap-6 py-4 flex-grow">
        <div className="grid gap-2 items-center">
          <Label htmlFor="avatar">Avatar</Label>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border">
              {avatarPreview ? (
                <AvatarImage
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-muted/40">
                <ImageUp className="w-8 h-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="sm"
                className="w-min"
                onClick={triggerFileSelect}
                disabled={isUploading || isSaving}
              >
                Upload
              </Button>
              <input
                id="avatar"
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/png, image/jpeg, image/gif, image/webp"
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Recommend size 1:1, up to 5MB.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            disabled={isSaving}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 py-4 flex-shrink-0">
        <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isUploading || isSaving || !name.trim()}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};
