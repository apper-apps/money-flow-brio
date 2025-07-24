import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import FormField from '@/components/molecules/FormField';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { budgetService } from '@/services/api/budgetService';
import { toast } from 'react-toastify';

const AddBudgetModal = ({ isOpen, onClose, onSuccess }) => {
  const [budget, setBudget] = useState({
    name: '',
    tags: '',
    category: '',
    limit: '',
    period: 'monthly',
    spent: '0'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setBudget(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!budget.name.trim()) {
      newErrors.name = 'Budget name is required';
    }
    
    if (!budget.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!budget.limit || parseFloat(budget.limit) <= 0) {
      newErrors.limit = 'Budget limit must be greater than 0';
    }
    
    if (!budget.period) {
      newErrors.period = 'Period is required';
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
      const budgetData = {
        name: budget.name.trim(),
        tags: budget.tags.trim(),
        category: budget.category.trim(),
        limit: parseFloat(budget.limit),
        period: budget.period,
        spent: parseFloat(budget.spent || 0)
      };

      const result = await budgetService.create(budgetData);
      
      if (result) {
        toast.success('Budget created successfully!');
        setBudget({
          name: '',
          tags: '',
          category: '',
          limit: '',
          period: 'monthly',
          spent: '0'
        });
        setErrors({});
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Failed to create budget. Please try again.');
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
                Create New Budget
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
              Set up a new budget to track your spending
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Budget Name"
                required
                value={budget.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Monthly Groceries"
                error={errors.name}
                disabled={isSubmitting}
              />

              <FormField
                label="Category"
                required
                value={budget.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Food, Transport, Entertainment"
                error={errors.category}
                disabled={isSubmitting}
              />

              <FormField
                label="Budget Limit"
                required
                type="number"
                step="0.01"
                min="0"
                value={budget.limit}
                onChange={(e) => handleChange('limit', e.target.value)}
                placeholder="0.00"
                error={errors.limit}
                disabled={isSubmitting}
              />

              <FormField
                label="Period"
                required
                error={errors.period}
              >
                <Select
                  value={budget.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </FormField>

              <FormField
                label="Initial Spent Amount"
                type="number"
                step="0.01"
                min="0"
                value={budget.spent}
                onChange={(e) => handleChange('spent', e.target.value)}
                placeholder="0.00"
                disabled={isSubmitting}
              />

              <FormField
                label="Tags"
                value={budget.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="e.g., essential, discretionary"
                disabled={isSubmitting}
              />

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
                      Creating...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Create Budget
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

export default AddBudgetModal;