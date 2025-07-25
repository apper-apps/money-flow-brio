import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { reportService } from '@/services/api/reportService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Select from '@/components/atoms/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';

const AddReportModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Summary',
    dataSource: 'transaction',
    filters: '',
    displayFormat: 'Table',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Report name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const reportData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        data_source: formData.dataSource,
        filters: formData.filters.trim(),
        display_format: formData.displayFormat,
        tags: formData.tags.trim()
      };

      const newReport = await reportService.create(reportData);
      if (newReport) {
        onSuccess(newReport);
      }
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ApperIcon name="BarChart3" className="h-5 w-5 text-primary-600" />
                  </div>
                  <CardTitle>Create New Report</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  <ApperIcon name="X" className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Basic Information</h3>
                  
                  <div>
                    <Label htmlFor="name">Report Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Monthly Expense Report"
                      className={errors.name ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what this report shows..."
                      className={`w-full px-3 py-2 border rounded-md resize-none h-20 ${
                        errors.description ? 'border-red-500' : 'border-slate-300'
                      }`}
                      disabled={loading}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="e.g., monthly, expenses, analysis"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Report Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900">Report Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Report Type</Label>
                      <Select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        disabled={loading}
                      >
                        <option value="Summary">Summary - Overview of key metrics</option>
                        <option value="Detail">Detail - Detailed transaction listing</option>
                        <option value="Chart">Chart - Visual data representation</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="dataSource">Data Source</Label>
                      <Select
                        id="dataSource"
                        value={formData.dataSource}
                        onChange={(e) => handleInputChange('dataSource', e.target.value)}
                        disabled={loading}
                      >
                        <option value="transaction">Transactions</option>
                        <option value="budget">Budgets</option>
                        <option value="bill">Bills</option>
                        <option value="goal">Goals</option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayFormat">Display Format</Label>
                      <Select
                        id="displayFormat"
                        value={formData.displayFormat}
                        onChange={(e) => handleInputChange('displayFormat', e.target.value)}
                        disabled={loading}
                      >
                        <option value="Table">Table</option>
                        <option value="Card">Card Layout</option>
                        <option value="Chart">Chart/Graph</option>
                        <option value="List">List View</option>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="filters">Filters (Optional)</Label>
                      <Input
                        id="filters"
                        type="text"
                        value={formData.filters}
                        onChange={(e) => handleInputChange('filters', e.target.value)}
                        placeholder="e.g., date_range=30days, category=food"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Report Type Info */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">
                    {formData.type === 'Summary' && 'Summary Report'}
                    {formData.type === 'Detail' && 'Detail Report'}
                    {formData.type === 'Chart' && 'Chart Report'}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {formData.type === 'Summary' && 'Shows aggregated financial metrics like total income, expenses, and key performance indicators.'}
                    {formData.type === 'Detail' && 'Displays detailed transaction listings with filtering and sorting capabilities.'}
                    {formData.type === 'Chart' && 'Provides visual representations of your financial data through charts and graphs.'}
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                        Create Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddReportModal;