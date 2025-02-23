import { Copy, Redo, Undo } from "lucide-react";

import { toast } from "sonner";

import { ImageEditor } from "@/components/image-editor";
import { Block } from "@/components/create-block";

export const imageBlock = new Block({
  kind: "image",
  description: "Useful for image generation",
  onStreamPart: ({ streamPart, setBlock }) => {
    if (streamPart.type === "image-delta") {
      setBlock((draftBlock) => ({
        ...draftBlock,
        content: streamPart.content as string,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ImageEditor,
  actions: [
    {
      icon: <Undo className="w-4 h-4" />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <Redo className="w-4 h-4" />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <Copy className="w-4 h-4" />,
      description: "Copy image to clipboard",
      onClick: ({ content }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${content}`;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            }
          }, "image/png");
        };

        toast.success("Copied image to clipboard!");
      },
    },
  ],
  toolbar: [],
});
