import * as React from "react";
import { cn } from "@/presentation/components/ui/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ui-skeleton rounded-md", className)} aria-hidden="true" {...props} />;
}

export { Skeleton };
