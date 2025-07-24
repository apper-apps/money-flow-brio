import React, { useState } from "react";
import { motion } from "framer-motion";
import BudgetCards from "@/components/organisms/BudgetCards";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import AddBudgetModal from "@/components/organisms/AddBudgetModal";
const Budgets = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleModalSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
          <p className="text-slate-600 mt-1">Monitor your spending against set budgets</p>
        </div>
        <Button 
          variant="primary" 
          className="shadow-premium"
          onClick={() => setIsModalOpen(true)}
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Budget Overview Stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Total Budgets</p>
              <p className="text-2xl font-bold text-primary-900">6</p>
            </div>
            <div className="h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="PieChart" className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 border border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-600">On Track</p>
              <p className="text-2xl font-bold text-accent-900">4</p>
            </div>
            <div className="h-12 w-12 bg-accent-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Over Budget</p>
              <p className="text-2xl font-bold text-orange-900">2</p>
            </div>
            <div className="h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Budget Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 }}
      >
        <BudgetCards key={refreshKey} />
      </motion.div>

      {/* Add Budget Modal */}
      <AddBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Budgets;