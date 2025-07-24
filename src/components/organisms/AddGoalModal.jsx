import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { goalService } from '@/services/api/goalService';
import { toast } from 'react-toastify';

function AddGoalModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    tags: '',
    target_amount: '',
    current_amount: '0',
    target_date: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    if (!formData.target_amount || parseFloat(formData.target_amount) <= 0) {
      newErrors.target_amount = 'Target amount must be greater than 0';
    }

    if (!formData.target_date) {
      newErrors.target_date = 'Target date is required';
    } else {
      const selectedDate = new Date(formData.target_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.target_date = 'Target date must be in the future';
      }
    }

    if (formData.current_amount && parseFloat(formData.current_amount) < 0) {
      newErrors.current_amount = 'Current amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const goalData = {
        name: formData.name.trim(),
        tags: formData.tags.trim(),
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount || 0),
        target_date: formData.target_date
      };

      const result = await goalService.create(goalData);

      if (result) {
        toast.success('Goal created successfully!');
        setFormData({
          name: '',
          tags: '',
          target_amount: '',
          current_amount: '0',
          target_date: ''
        });
        setErrors({});
        onSuccess?.(result);
        onClose();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                Create New Goal
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <ApperIcon name="X" className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Goal Name"
                error={errors.name}
                required
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </FormField>

              <FormField
                label="Tags"
                error={errors.tags}
              >
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="e.g., savings, investment, emergency"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </FormField>

              <FormField
                label="Target Amount"
                error={errors.target_amount}
                required
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={(e) => handleChange('target_amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </FormField>

              <FormField
                label="Current Amount"
                error={errors.current_amount}
              >
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={(e) => handleChange('current_amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </FormField>

              <FormField
                label="Target Date"
                error={errors.target_date}
                required
              >
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => handleChange('target_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </FormField>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                      Create Goal
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
}

export default AddGoalModal;