"use client";

import { cn } from "@/lib/utils";
import { type ComponentProps, type FC, memo } from "react";

type DotMatrixState = "connecting" | "running" | "complete";

const DotMatrixImpl: FC<
  ComponentProps<"span"> & { state?: DotMatrixState }
> = ({ state = "connecting", className, ...props }) => {
  return (
    <span
      data-slot="dot-matrix"
      className={cn(
        "flex items-center gap-0.5",
        state === "connecting" && "animate-pulse",
        className,
      )}
      role="img"
      aria-label={state === "connecting" ? "Connecting" : "Processing"}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          data-slot="dot-matrix-dot"
          className={cn(
            "size-1.5 rounded-full bg-current",
            state === "connecting" && "animate-bounce",
          )}
          style={
            state === "connecting"
              ? { animationDelay: `${i * 150}ms` }
              : undefined
          }
        />
      ))}
    </span>
  );
};

DotMatrixImpl.displayName = "DotMatrix";

export const DotMatrix = memo(DotMatrixImpl);
