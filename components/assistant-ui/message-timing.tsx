"use client";

import { type FC, memo } from "react";
import { useAuiState } from "@assistant-ui/react";
import { cn } from "@/lib/utils";

const MessageTimingImpl: FC<{ className?: string }> = ({ className }) => {
  const timing = useAuiState((s) =>
    s.message.role === "assistant" ? s.message.metadata?.timing : undefined,
  );

  if (!timing?.tokensPerSecond) return null;

  return (
    <span
      data-slot="message-timing"
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1 text-xs",
        className,
      )}
    >
      {timing.tokensPerSecond.toFixed(1)} tok/s
    </span>
  );
};

MessageTimingImpl.displayName = "MessageTiming";

export const MessageTiming = memo(MessageTimingImpl);
