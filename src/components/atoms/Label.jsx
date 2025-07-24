import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-slate-700 mb-2 block",
      className
    )}
    {...props}
  />
));

Label.displayName = "Label";

export default Label;