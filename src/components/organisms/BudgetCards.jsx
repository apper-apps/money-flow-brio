import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";

const BudgetCards = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
const loadBudgets = async () => {
    try {
      setError("");
      setLoading(true);
      const [budgetData, transactionData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);
      setTransactions(transactionData);
      // Calculate spent amount for each budget
      const budgetsWithSpent = budgetData.map(budget => {
        const categoryExpenses = transactionData.filter(t => 
          t.type === "expense" && 
          t.category.toLowerCase() === budget.category.toLowerCase()
        );
        
        const spent = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
        
        return {
          ...budget,
          spent
        };
      });

      setBudgets(budgetsWithSpent);
    } catch (err) {
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "from-red-500 to-red-600";
    if (percentage >= 75) return "from-orange-500 to-orange-600";
    return "from-accent-500 to-accent-600";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: "UtensilsCrossed",
      transport: "Car",
      entertainment: "Gamepad2",
      shopping: "ShoppingBag",
      bills: "Receipt",
      health: "Heart",
      other: "MoreHorizontal"
    };
    return icons[category.toLowerCase()] || "MoreHorizontal";
};

  const handleBudgetClick = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBudget(null);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.delete(budgetId);
        setBudgets(prev => prev.filter(b => b.Id !== budgetId));
        handleCloseModal();
      } catch (err) {
        console.error('Failed to delete budget:', err);
      }
    }
  };
  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadBudgets} />;
  if (budgets.length === 0) {
    return (
      <Empty
        title="No budgets set"
        description="Create your first budget to start tracking your spending"
        icon="PieChart"
        actionLabel="Create Budget"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {budgets.map((budget, index) => {
        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
        const remaining = Math.max(budget.limit - budget.spent, 0);
        
        return (
          <motion.div
            key={budget.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
<Card 
              className="hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
              onClick={() => handleBudgetClick(budget)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <ApperIcon 
                        name={getCategoryIcon(budget.category)} 
                        className="h-5 w-5 text-primary-600"
                      />
                    </div>
                    <span className="capitalize">{budget.category}</span>
                  </div>
                  <span className="text-sm font-normal text-slate-500">
                    {budget.period}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">
                        ${budget.spent.toLocaleString()} spent
                      </span>
                      <span className="text-slate-600">
                        ${budget.limit.toLocaleString()} limit
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500">Remaining</p>
                      <p className={`font-bold text-lg ${
                        remaining > 0 ? "text-accent-600" : "text-red-600"
                      }`}>
                        ${remaining.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Progress</p>
                      <p className={`font-bold text-lg ${
                        percentage >= 90 ? "text-red-600" : 
                        percentage >= 75 ? "text-orange-600" : "text-accent-600"
                      }`}>
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Warning if over budget */}
                  {percentage > 100 && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <ApperIcon name="AlertTriangle" className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">Over budget!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
})}
      
      {/* Budget Detail Modal */}
      {isModalOpen && selectedBudget && (
        <BudgetDetailModal
          budget={selectedBudget}
          transactions={transactions}
          onClose={handleCloseModal}
          onDelete={handleDeleteBudget}
        />
      )}
    </div>
  );
};

// Budget Detail Modal Component
const BudgetDetailModal = ({ budget, transactions, onClose, onDelete }) => {
  const categoryTransactions = transactions.filter(t => 
    t.type === "expense" && 
    t.category.toLowerCase() === budget.category.toLowerCase()
  );

  const sortedTransactions = categoryTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10); // Show last 10 transactions

  const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
  const remaining = Math.max(budget.limit - budget.spent, 0);

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "from-red-500 to-red-600";
    if (percentage >= 75) return "from-orange-500 to-orange-600";
    return "from-accent-500 to-accent-600";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: "UtensilsCrossed",
      transport: "Car",
      entertainment: "Gamepad2",
      shopping: "ShoppingBag",
      bills: "Receipt",
      health: "Heart",
      other: "MoreHorizontal"
    };
    return icons[category.toLowerCase()] || "MoreHorizontal";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-premium-lg max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <ApperIcon 
                name={getCategoryIcon(budget.category)} 
                className="h-6 w-6 text-primary-600"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold capitalize">{budget.category} Budget</h2>
              <p className="text-slate-500">{budget.period} budget</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(budget.Id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <ApperIcon name="Trash2" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Budget Overview */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Budget Limit</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${budget.limit.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${budget.spent.toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500 mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${
                  remaining > 0 ? "text-accent-600" : "text-red-600"
                }`}>
                  ${remaining.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Progress</span>
                <span className={`font-semibold ${
                  percentage >= 90 ? "text-red-600" : 
                  percentage >= 75 ? "text-orange-600" : "text-accent-600"
                }`}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full bg-gradient-to-r ${getProgressColor(percentage)} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Warning if over budget */}
            {percentage > 100 && (
              <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg border border-red-200">
                <ApperIcon name="AlertTriangle" className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">You're over budget by ${(budget.spent - budget.limit).toLocaleString()}!</span>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <ApperIcon name="Receipt" className="h-5 w-5 mr-2" />
              Recent Transactions ({categoryTransactions.length} total)
            </h3>
            
            {sortedTransactions.length > 0 ? (
              <div className="space-y-3">
                {sortedTransactions.map((transaction, index) => (
                  <div key={transaction.Id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                        <ApperIcon name="ArrowDown" className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{transaction.description}</p>
                        <p className="text-sm text-slate-500">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-${transaction.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                
                {categoryTransactions.length > 10 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-slate-500">
                      Showing 10 of {categoryTransactions.length} transactions
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Receipt" className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500">No transactions found for this category</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BudgetCards;