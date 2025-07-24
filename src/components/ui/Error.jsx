import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <ApperIcon name="AlertTriangle" className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;