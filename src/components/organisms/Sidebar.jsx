import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Transactions", href: "/transactions", icon: "ArrowLeftRight" },
    { name: "Budgets", href: "/budgets", icon: "PieChart" },
    { name: "Bills", href: "/bills", icon: "Calendar" },
    { name: "Goals", href: "/goals", icon: "Target" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center px-6 py-8">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl p-2">
            <ApperIcon name="Wallet" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">MoneyFlow</h1>
            <p className="text-xs text-slate-500">Finance Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-premium"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <ApperIcon name={item.icon} className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-6 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-full p-2">
            <ApperIcon name="User" className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Personal Account</p>
            <p className="text-xs text-slate-500">Manage your finances</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:bg-white lg:border-r lg:border-slate-200">
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-64 bg-white shadow-premium-lg"
          >
            <SidebarContent />
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;