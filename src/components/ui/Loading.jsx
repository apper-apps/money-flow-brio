import React from "react";

const Loading = ({ type = "skeleton" }) => {
  if (type === "skeleton") {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-slate-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="h-64 bg-slate-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;