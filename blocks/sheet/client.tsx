import { parse, unparse } from "papaparse";

import { toast } from "sonner";

import { Copy, LineChart, Redo, WandSparkles, Undo } from "lucide-react";

import { Block } from "@/components/create-block";
import { SpreadsheetEditor } from "@/components/sheet-editor";

type Metadata = any;

export const sheetBlock = new Block<"sheet", Metadata>({
  kind: "sheet",
  description: "Useful for working with spreadsheets",
  initialize: async () => {},
  onStreamPart: ({ setBlock, streamPart }) => {
    if (streamPart.type === "sheet-delta") {
      setBlock((draftBlock) => ({
        ...draftBlock,
        content: streamPart.content as string,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    return (
      <SpreadsheetEditor
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={isCurrentVersion}
        saveContent={onSaveContent}
        status={status}
      />
    );
  },
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
      description: "Copy as CSV",
      onClick: ({ content }) => {
        const parsed = parse<string[]>(content, { skipEmptyLines: true });

        const nonEmptyRows = parsed.data.filter((row) =>
          row.some((cell) => cell.trim() !== "")
        );

        const cleanedCsv = unparse(nonEmptyRows);

        navigator.clipboard.writeText(cleanedCsv);
        toast.success("Copied to clipboard");
      },
    },
  ],
  toolbar: [
    {
      description: "Format and clean data",
      icon: <WandSparkles className="w-4 h-4" />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Can you please format and clean the data?",
        });
      },
    },
    {
      description: "Analyze and visualize data",
      icon: <LineChart className="w-4 h-4" />,
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content:
            "Can you please analyze and visualize the data by creating a new code block in python?",
        });
      },
    },
  ],
});
