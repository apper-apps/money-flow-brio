import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found", 
  description = "Get started by adding your first item",
  icon = "Database",
  action,
  actionLabel = "Add Item"
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-full p-6 mb-6">
        <ApperIcon name={icon} className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action} variant="primary">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;