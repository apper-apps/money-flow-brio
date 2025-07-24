import React from "react";
import Input from "@/components/atoms/Input";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ placeholder = "Search...", value, onChange, className }) => {
  return (
    <div className="relative">
      <ApperIcon 
        name="Search" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`pl-10 ${className}`}
      />
    </div>
  );
};

export default SearchBar;