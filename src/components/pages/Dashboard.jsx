import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatCard from "@/components/molecules/StatCard";
import TransactionList from "@/components/organisms/TransactionList";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import MonthlyChart from "@/components/organisms/MonthlyChart";
import GoalCards from "@/components/organisms/GoalCards";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import AddTransactionModal from "@/components/organisms/AddTransactionModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { transactionService } from "@/services/api/transactionService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    monthlyChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadStats = async () => {
    try {
      setError("");
      setLoading(true);
      const transactions = await transactionService.getAll();
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });

      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
        
      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const netWorth = totalIncome - totalExpenses;
      const monthlyChange = monthlyIncome - monthlyExpenses;

      setStats({
        totalIncome,
        totalExpenses,
        netWorth,
        monthlyChange
      });
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTransactionAdded = () => {
    loadStats();
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadStats} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Your financial overview at a glance</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          className="shadow-premium"
        >
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Income"
            value={`$${stats.totalIncome.toLocaleString()}`}
            icon="TrendingUp"
            iconColor="text-accent-500"
            className="border-l-4 border-accent-500"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Total Expenses"
            value={`$${stats.totalExpenses.toLocaleString()}`}
            icon="TrendingDown"
            iconColor="text-red-500"
            className="border-l-4 border-red-500"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Net Worth"
            value={`$${stats.netWorth.toLocaleString()}`}
            change={stats.netWorth > 0 ? "Positive" : "Negative"}
            changeType={stats.netWorth > 0 ? "positive" : "negative"}
            icon="Wallet"
            iconColor="text-primary-500"
            className="border-l-4 border-primary-500"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="This Month"
            value={`$${Math.abs(stats.monthlyChange).toLocaleString()}`}
            change={stats.monthlyChange > 0 ? "Surplus" : "Deficit"}
            changeType={stats.monthlyChange > 0 ? "positive" : "negative"}
            icon="Calendar"
            iconColor="text-secondary-500"
            className="border-l-4 border-secondary-500"
          />
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ExpenseChart />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <MonthlyChart />
        </motion.div>
      </div>

      {/* Recent Transactions and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <TransactionList limit={5} showActions={false} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Savings Goals</h3>
            <GoalCards limit={2} />
          </div>
        </motion.div>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
};

export default Dashboard;