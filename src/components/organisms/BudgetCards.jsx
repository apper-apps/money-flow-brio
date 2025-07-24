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

  const loadBudgets = async () => {
    try {
      setError("");
      setLoading(true);
      const [budgetData, transactionData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);

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
            <Card className="hover:scale-[1.02] transition-transform duration-200">
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
    </div>
  );
};

export default BudgetCards;