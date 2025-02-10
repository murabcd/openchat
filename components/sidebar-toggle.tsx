import type { ComponentProps } from "react";

import { PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SidebarToggle({}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button onClick={toggleSidebar} variant="outline" className="md:px-2 md:h-fit">
          <PanelLeft className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">Toggle sidebar</TooltipContent>
    </Tooltip>
  );
}
