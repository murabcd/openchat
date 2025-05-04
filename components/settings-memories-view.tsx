"use client";

import { useState } from "react";

import { Trash } from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const SettingsMemoriesView = () => {
  const memories = useQuery(api.memories.listMemories);
  const deleteMemory = useMutation(api.memories.deleteMemory);
  const deleteAllMemories = useMutation(api.memories.deleteAllMemories);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDelete = async (id: Id<"memories">) => {
    try {
      await deleteMemory({ id });
      toast.success("Memory deleted");
    } catch (error) {
      toast.error("Failed to delete memory");
      console.error("Failed to delete memory:", error);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllMemories();
      toast.success("Memories deleted");
    } catch (error) {
      toast.error("Failed to delete memories");
      console.error("Failed to delete memories:", error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <>
      <div>
        {memories === undefined && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading memories...
          </div>
        )}

        {memories && memories.length === 0 && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No memories found.
          </div>
        )}
        {/* Memory list */}
        {memories && memories.length > 0 && (
          <ScrollArea className="h-[400px] w-full pr-4">
            <ul className="space-y-2">
              {memories.map((memory) => (
                <li
                  key={memory._id}
                  className="flex items-start justify-between gap-2 text-sm p-2 rounded-lg hover:bg-muted/50"
                >
                  <span className="flex-1 break-words">{memory.content}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => handleDelete(memory._id)}
                    aria-label="Delete memory"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        {memories && memories.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive focus:text-destructive dark:text-red-500"
                disabled={isDeletingAll}
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your
                  saved memories and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-none" disabled={isDeletingAll}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} disabled={isDeletingAll}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </>
  );
};
