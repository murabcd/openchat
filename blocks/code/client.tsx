import { Copy, Logs, MessageCircle, Play, Redo, Undo } from "lucide-react";

import { toast } from "sonner";

import { generateUUID } from "@/lib/utils";

import { Console, ConsoleOutput, ConsoleOutputContent } from "@/components/console";
import { Block } from "@/components/create-block";
import { CodeEditor } from "@/components/code-editor";

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt

    # Clear any existing plots
    plt.clf()
    plt.close('all')

    # Switch to agg backend
    plt.switch_backend('agg')

    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                print("Warning: Plot size too large, reducing quality")
                plt.gcf().set_dpi(100)

            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()

            plt.clf()
            plt.close('all')

        plt.show = custom_show
  `,
  basic: `
    # Basic output capture setup
  `,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ["basic"];

  if (code.includes("matplotlib") || code.includes("plt.")) {
    handlers.push("matplotlib");
  }

  return handlers;
}

interface Metadata {
  outputs: Array<ConsoleOutput>;
}

type ConsoleStatus = ConsoleOutput["status"];

export const codeBlock = new Block<"code", Metadata>({
  kind: "code",
  description:
    "Useful for code generation; Code execution is only available for python code.",
  initialize: async ({ setMetadata }) => {
    setMetadata({
      outputs: [],
    });
  },
  onStreamPart: ({ streamPart, setBlock }) => {
    if (streamPart.type === "code-delta") {
      setBlock((draftBlock) => ({
        ...draftBlock,
        content: streamPart.content as string,
        isVisible:
          draftBlock.status === "streaming" &&
          draftBlock.content.length > 300 &&
          draftBlock.content.length < 310
            ? true
            : draftBlock.isVisible,
        status: "streaming",
      }));
    }
  },
  content: ({ metadata, setMetadata, ...props }) => {
    return (
      <>
        <div className="px-1">
          <CodeEditor {...props} />
        </div>

        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({
                ...metadata,
                outputs: [],
              });
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <Play className="w-4 h-4" />,
      label: "Run",
      description: "Execute code",
      onClick: async ({ content, setMetadata }) => {
        const runId = generateUUID();
        const outputContent: Array<ConsoleOutputContent> = [];

        const updateMetadataStatus = (status: ConsoleStatus, message?: string) => {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: message ? [{ type: "text", value: message }] : [],
                status: status,
              },
            ],
          }));
        };

        updateMetadataStatus("in_progress", "Starting...");

        try {
          updateMetadataStatus("loading_pyodide");
          const pyodide = await (globalThis as any).loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
          });

          pyodide.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith("data:image/png;base64") ? "image" : "text",
                value: output,
              });
              setMetadata((metadata) => ({
                ...metadata,
                outputs: metadata.outputs.map((out) =>
                  out.id === runId ? { ...out, contents: [...outputContent] } : out
                ),
              }));
            },
          });

          updateMetadataStatus("loading_micropip");
          await pyodide.loadPackage("micropip");
          const micropip = pyodide.pyimport("micropip");

          const importRegex = /\s*(?:import|from)\s+([\w.]+)/g;
          const packages = new Set<string>();
          let match;
          while ((match = importRegex.exec(content)) !== null) {
            const basePackage = match[1].split(".")[0];
            packages.add(basePackage);
          }

          if (packages.size > 0) {
            const packageList = Array.from(packages);
            updateMetadataStatus(
              "loading_packages",
              `Installing: ${packageList.join(", ")}...`
            );
            try {
              await micropip.install(packageList);
            } catch (installError: any) {
              console.error("Micropip installation failed:", installError);
              throw new Error(
                `Failed to install packages: ${packageList.join(", ")}. Error: ${installError.message}`
              );
            }
          }

          updateMetadataStatus("in_progress", "Setting up environment...");
          const requiredHandlers = detectRequiredHandlers(content);
          for (const handler of requiredHandlers) {
            if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
              await pyodide.runPythonAsync(
                OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]
              );

              if (handler === "matplotlib") {
                await pyodide.runPythonAsync("setup_matplotlib_output()");
              }
            }
          }

          updateMetadataStatus("in_progress", "Executing code...");
          await pyodide.runPythonAsync(content);

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: outputContent,
                status: "completed",
              },
            ],
          }));
        } catch (error: any) {
          console.error("Code execution error:", error);
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((output) => output.id !== runId),
              {
                id: runId,
                contents: [
                  ...outputContent,
                  { type: "text", value: `Error: ${error.message}` },
                ],
                status: "failed",
              },
            ],
          }));
        }
      },
    },
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
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageCircle className="w-4 h-4" />,
      description: "Add comments",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Add comments to the code snippet for understanding",
        });
      },
    },
    {
      icon: <Logs className="w-4 h-4" />,
      description: "Add logs",
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: "user",
          content: "Add logs to the code snippet for debugging",
        });
      },
    },
  ],
});
