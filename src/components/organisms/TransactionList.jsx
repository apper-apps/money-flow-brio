import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const TransactionList = ({ limit = null, showActions = true }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await transactionService.getAll();
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(limit ? sortedData.slice(0, limit) : sortedData);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [limit]);

  const handleDelete = async (id) => {
    try {
      await transactionService.delete(id);
      setTransactions(prev => prev.filter(t => t.Id !== id));
      toast.success("Transaction deleted successfully");
    } catch (err) {
      toast.error("Failed to delete transaction");
    }
  };

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
    return type === "expense" ? `-${formatted}` : `+${formatted}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: "UtensilsCrossed",
      transport: "Car",
      entertainment: "Gamepad2",
      shopping: "ShoppingBag",
      bills: "Receipt",
      health: "Heart",
      salary: "Banknote",
      freelance: "Briefcase",
      investment: "TrendingUp",
      other: "MoreHorizontal"
    };
    return icons[category.toLowerCase()] || "MoreHorizontal";
  };

  if (loading) return <Loading type="skeleton" />;
  if (error) return <Error message={error} onRetry={loadTransactions} />;
  if (transactions.length === 0) {
    return (
      <Empty
        title="No transactions yet"
        description="Start tracking your finances by adding your first transaction"
        icon="ArrowLeftRight"
        actionLabel="Add Transaction"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Transactions
          {showActions && (
            <ApperIcon name="ArrowLeftRight" className="h-5 w-5 text-slate-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  h-12 w-12 rounded-full flex items-center justify-center
                  ${transaction.type === "income" 
                    ? "bg-gradient-to-br from-accent-100 to-accent-200" 
                    : "bg-gradient-to-br from-red-100 to-red-200"
                  }
                `}>
                  <ApperIcon 
                    name={getCategoryIcon(transaction.category)} 
                    className={`h-5 w-5 ${
                      transaction.type === "income" ? "text-accent-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{transaction.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={transaction.type === "income" ? "income" : "expense"}>
                      {transaction.category}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`font-bold text-lg ${
                  transaction.type === "income" ? "text-accent-600" : "text-red-600"
                }`}>
                  {formatAmount(transaction.amount, transaction.type)}
                </span>
                {showActions && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(transaction.Id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <ApperIcon name="Trash2" className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;