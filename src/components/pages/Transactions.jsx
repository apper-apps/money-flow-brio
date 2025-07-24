import React, { useState } from "react";
import { motion } from "framer-motion";
import TransactionList from "@/components/organisms/TransactionList";
import AddTransactionModal from "@/components/organisms/AddTransactionModal";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";

const Transactions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-600 mt-1">Track and manage all your financial transactions</p>
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

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-premium"
      >
        <div className="flex-1">
          <SearchBar
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </Select>
        </div>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        key={refreshKey}
      >
        <TransactionList showActions={true} />
      </motion.div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
};

export default Transactions;