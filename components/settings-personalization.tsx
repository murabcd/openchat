"use client";

import { Switch } from "@/components/ui/switch";

const SettingsPersonalization = () => {
  return (
    <div className="flex flex-col gap-4 pt-5 px-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm">Memory</span>
        <Switch id="memory-switch" />
      </div>
    </div>
  );
};

export default SettingsPersonalization;
