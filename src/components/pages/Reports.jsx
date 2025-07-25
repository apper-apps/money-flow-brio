import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { reportService } from '@/services/api/reportService';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import SearchBar from '@/components/molecules/SearchBar';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';
import AddReportModal from '@/components/organisms/AddReportModal';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [runningReports, setRunningReports] = useState(new Set());
  const [reportResults, setReportResults] = useState({});

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, selectedType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getAll();
      setReports(data);
      setFilteredReports(data);
    } catch (err) {
      setError('Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType);
    }

    setFilteredReports(filtered);
  };

  const handleAddReport = () => {
    setShowAddModal(true);
  };

  const handleModalSuccess = (newReport) => {
    setReports([newReport, ...reports]);
    setShowAddModal(false);
    toast.success('Report created successfully');
  };

  const handleRunReport = async (reportId) => {
    try {
      setRunningReports(prev => new Set([...prev, reportId]));
      const result = await reportService.runReport(reportId);
      
      if (result) {
        setReportResults(prev => ({
          ...prev,
          [reportId]: result
        }));
        // Reload reports to update last run date
        loadReports();
      }
    } catch (err) {
      console.error('Error running report:', err);
    } finally {
      setRunningReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const success = await reportService.delete(reportId);
      if (success) {
        setReports(reports.filter(report => report.Id !== reportId));
        toast.success('Report deleted successfully');
        // Clear any cached results
        setReportResults(prev => {
          const newResults = { ...prev };
          delete newResults[reportId];
          return newResults;
        });
      }
    } catch (err) {
      console.error('Error deleting report:', err);
    }
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'Summary': return 'FileText';
      case 'Detail': return 'List';
      case 'Chart': return 'BarChart3';
      default: return 'FileText';
    }
  };

  const getReportTypeBadgeColor = (type) => {
    switch (type) {
      case 'Summary': return 'bg-blue-100 text-blue-800';
      case 'Detail': return 'bg-green-100 text-green-800';
      case 'Chart': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderReportResult = (reportId, result) => {
    if (!result) return null;

    const report = reports.find(r => r.Id === reportId);
    if (!report) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-gray-50 rounded-lg"
      >
        <h4 className="font-medium mb-3">Report Results</h4>
        
        {report.type === 'Summary' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${result.totalIncome?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-600">Total Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">${result.totalExpenses?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-600">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${result.netBalance?.toLocaleString() || 0}</div>
              <div className="text-sm text-gray-600">Net Balance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{result.transactionCount || 0}</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
          </div>
        )}

        {report.type === 'Detail' && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Showing {result.filteredRecords || 0} of {result.totalRecords || 0} transactions
            </div>
            <div className="max-h-48 overflow-y-auto">
              {(result.transactions || []).map((transaction, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-gray-600">{transaction.date} • {transaction.category}</div>
                  </div>
                  <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(transaction.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {report.type === 'Chart' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Income vs Expenses</h5>
              <div className="space-y-2">
                {(result.data || []).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="font-medium">${item.value?.toLocaleString() || 0}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">Top Categories</h5>
              <div className="space-y-2">
                {(result.categories || []).map((category, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span>{category.label}</span>
                    <span className="font-medium">${category.value?.toLocaleString() || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadReports} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">Generate and view financial reports</p>
        </div>
        <Button onClick={handleAddReport} className="lg:w-auto">
          <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 lg:items-center"
      >
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search reports..."
          />
        </div>
        <Select
          value={selectedType}
          onChange={setSelectedType}
          className="lg:w-48"
        >
          <option value="all">All Types</option>
          <option value="Summary">Summary</option>
          <option value="Detail">Detail</option>
          <option value="Chart">Chart</option>
        </Select>
      </motion.div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Empty
          icon="BarChart3"
          title="No reports found"
          description={searchTerm || selectedType !== 'all' 
            ? "No reports match your current filters" 
            : "Create your first report to get started"}
          action={
            <Button onClick={handleAddReport}>
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredReports.map((report) => (
            <motion.div
              key={report.Id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <ApperIcon 
                          name={getReportTypeIcon(report.type)} 
                          className="h-5 w-5 text-primary-600" 
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.Name || 'Untitled Report'}</CardTitle>
                        <Badge className={getReportTypeBadgeColor(report.type)}>
                          {report.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {report.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {report.description}
                    </p>
                  )}
                  
                  {report.last_run_date && (
                    <div className="text-xs text-slate-500">
                      Last run: {format(new Date(report.last_run_date), 'MMM d, yyyy h:mm a')}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunReport(report.Id)}
                        disabled={runningReports.has(report.Id)}
                      >
                        {runningReports.has(report.Id) ? (
                          <ApperIcon name="Loader2" className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <ApperIcon name="Play" className="h-4 w-4 mr-1" />
                        )}
                        Run
                      </Button>
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReport(report.Id)}
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Report Results */}
                  {reportResults[report.Id] && renderReportResult(report.Id, reportResults[report.Id])}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add Report Modal */}
      {showAddModal && (
        <AddReportModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default Reports;