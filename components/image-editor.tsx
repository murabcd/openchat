"use client";

import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ImageEditorProps {
  title: string;
  content: string;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  isInline: boolean;
}

export function ImageEditor({ title, content, status, isInline }: ImageEditorProps) {
  let storageId = null;
  let contentType = "base64";

  try {
    const parsed = JSON.parse(content);

    if (parsed && parsed.storageId) {
      contentType = "storage";
      storageId = parsed.storageId;
    }
  } catch (error) {
    console.error("Error parsing image content:", error);
  }

  const imageData = useQuery(
    api.files.getAiImageUrl,
    contentType === "storage" && storageId ? { storageId } : "skip"
  );

  const imageUrl = imageData?.url;
  const isLoading = contentType === "storage" && !imageUrl;

  return (
    <div
      className={cn("flex flex-row items-center justify-center w-full", {
        "h-[calc(100dvh-60px)]": !isInline,
        "h-[200px]": isInline,
      })}
    >
      {status === "streaming" || isLoading ? (
        <div className="flex flex-row gap-4 items-center">
          {!isInline && (
            <div className="animate-spin">
              <Loader className="w-4 h-4" />
            </div>
          )}
          <div>Generating image...</div>
        </div>
      ) : contentType === "storage" ? (
        imageUrl && (
          <picture>
            <img
              className={cn("w-full h-fit max-w-[800px]", {
                "p-0 md:p-20": !isInline,
              })}
              src={imageUrl}
              alt={title}
            />
          </picture>
        )
      ) : (
        <picture>
          <img
            className={cn("w-full h-fit max-w-[800px]", {
              "p-0 md:p-20": !isInline,
            })}
            src={`data:image/png;base64,${content}`}
            alt={title}
          />
        </picture>
      )}
    </div>
  );
}
