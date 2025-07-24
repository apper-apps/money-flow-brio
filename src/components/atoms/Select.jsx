import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = forwardRef(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      className={cn(
        "flex h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm transition-colors",
        "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
    <ApperIcon 
      name="ChevronDown" 
      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none"
    />
  </div>
));

Select.displayName = "Select";

export default Select;