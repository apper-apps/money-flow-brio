import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { billService } from '@/services/api/billService';
import { toast } from 'react-toastify';

const AddBillModal = ({ isOpen, onClose, onSuccess }) => {
  const [bill, setBill] = useState({
    name: '',
    amount: '',
    due_date: '',
    tags: '',
    recurring: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setBill(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!bill.name.trim()) {
      newErrors.name = 'Bill name is required';
    }
    
    if (!bill.amount || parseFloat(bill.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!bill.due_date) {
      newErrors.due_date = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const billData = {
        Name: bill.name.trim(),
        amount: parseFloat(bill.amount),
        due_date: bill.due_date,
        Tags: bill.tags.trim(),
        recurring: bill.recurring,
        paid: false // New bills are unpaid by default
      };

      const result = await billService.create(billData);
      
      if (result) {
        toast.success('Bill created successfully!');
        setBill({
          name: '',
          amount: '',
          due_date: '',
          tags: '',
          recurring: false
        });
        setErrors({});
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      toast.error('Failed to create bill. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-premium-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Add New Bill
              </CardTitle>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <ApperIcon name="X" className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Add a new bill to track your upcoming payments
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Bill Name"
                required
                value={bill.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Electric Bill, Water Bill"
                error={errors.name}
                disabled={isSubmitting}
              />

              <FormField
                label="Amount"
                required
                type="number"
                step="0.01"
                min="0"
                value={bill.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0.00"
                error={errors.amount}
                disabled={isSubmitting}
              />

              <FormField
                label="Due Date"
                required
                type="date"
                value={bill.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                error={errors.due_date}
                disabled={isSubmitting}
              />

              <FormField
                label="Tags"
                value={bill.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="e.g., utilities, monthly, essential"
                disabled={isSubmitting}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={bill.recurring}
                  onChange={(e) => handleChange('recurring', e.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="recurring" 
                  className="text-sm font-medium text-slate-700"
                >
                  Recurring bill
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Add Bill
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddBillModal;