import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    primary: "bg-primary-100 text-primary-800 border-primary-200",
    secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
    accent: "bg-accent-100 text-accent-800 border-accent-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-orange-100 text-orange-800 border-orange-200",
    error: "bg-red-100 text-red-800 border-red-200",
    income: "bg-green-100 text-green-800 border-green-200",
    expense: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = "Badge";

export default Badge;