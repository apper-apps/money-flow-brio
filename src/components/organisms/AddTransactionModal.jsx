import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { toast } from "react-toastify";

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [loading, setLoading] = useState(false);

  const categories = {
    expense: ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Health", "Other"],
    income: ["Salary", "Freelance", "Investment", "Other"]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const transaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        recurring: false
      };
      
      await transactionService.create(transaction);
      toast.success("Transaction added successfully");
      onSuccess?.();
      onClose();
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
      });
    } catch (err) {
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "type" && { category: "" }) // Reset category when type changes
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md"
      >
        <Card className="shadow-premium-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Add Transaction
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                placeholder="0.00"
              />

              <FormField label="Type" required>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </Select>
              </FormField>

              <FormField label="Category" required>
                <Select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories[formData.type].map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Description"
                required
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Transaction description"
              />

              <FormField
                label="Date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddTransactionModal;