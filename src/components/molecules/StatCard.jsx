import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  iconColor = "text-primary-500",
  className 
}) => {
  const changeColors = {
    positive: "text-accent-600",
    negative: "text-red-600",
    neutral: "text-slate-600"
  };

  return (
    <Card className={cn("hover:scale-[1.02] transition-transform duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <ApperIcon 
                  name={changeType === "positive" ? "TrendingUp" : changeType === "negative" ? "TrendingDown" : "Minus"} 
                  className={cn("h-4 w-4 mr-1", changeColors[changeType])}
                />
                <span className={cn("text-sm font-medium", changeColors[changeType])}>
                  {change}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("h-12 w-12 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center", iconColor)}>
              <ApperIcon name={icon} className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;