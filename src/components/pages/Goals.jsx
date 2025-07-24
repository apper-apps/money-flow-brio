import React, { useState } from "react";
import { motion } from "framer-motion";
import GoalCards from "@/components/organisms/GoalCards";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import AddGoalModal from "@/components/organisms/AddGoalModal";
import EditGoalModal from "@/components/organisms/EditGoalModal";

const Goals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const handleCreateGoal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingGoal(null);
  };

  const handleGoalCreated = (newGoal) => {
    // Modal will close automatically, GoalCards will refresh on next render
    console.log('Goal created:', newGoal);
  };

  const handleGoalUpdated = (updatedGoal) => {
    // Modal will close automatically, GoalCards will refresh on next render
    console.log('Goal updated:', updatedGoal);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Savings Goals</h1>
          <p className="text-slate-600 mt-1">Track your progress towards financial milestones</p>
        </div>
        <Button variant="primary" className="shadow-premium" onClick={handleCreateGoal}>
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
</div>

      {/* Goals Overview */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-6 border border-accent-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-accent-600">Active Goals</p>
              <p className="text-2xl font-bold text-accent-900">5</p>
            </div>
            <div className="h-12 w-12 bg-accent-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Target" className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-600">Total Target</p>
              <p className="text-2xl font-bold text-primary-900">$45,000</p>
            </div>
            <div className="h-12 w-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl p-6 border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Saved So Far</p>
              <p className="text-2xl font-bold text-secondary-900">$28,500</p>
            </div>
            <div className="h-12 w-12 bg-secondary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="PiggyBank" className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goal Cards */}
<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GoalCards onEditGoal={handleEditGoal} />
      </motion.div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleGoalCreated}
      />

      {/* Edit Goal Modal */}
      <EditGoalModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleGoalUpdated}
        goal={editingGoal}
      />
    </div>
  );
};

export default Goals;