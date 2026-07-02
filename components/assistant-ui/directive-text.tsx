"use client";

import { type FC, memo } from "react";
import { WrenchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DirectiveTextImpl: FC<{
  directiveType: string;
  directiveId: string;
  label: string;
  className?: string;
}> = ({ directiveType, directiveId, label, className }) => {
  const showWrench = directiveType !== "command";

  return (
    <span
      data-slot="directive-text"
      data-directive-type={directiveType}
      data-directive-id={directiveId}
      className={cn(
        "aui-directive-chip inline-flex items-baseline gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[13px] leading-none font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
        className,
      )}
    >
      {showWrench && (
        <span className="aui-directive-chip-icon self-center">
          <WrenchIcon className="size-3" />
        </span>
      )}
      <span className="aui-directive-chip-label">{label}</span>
    </span>
  );
};

DirectiveTextImpl.displayName = "DirectiveText";

export const DirectiveText = memo(DirectiveTextImpl);
