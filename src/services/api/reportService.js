import { toast } from "react-toastify";

class ReportService {
  constructor() {
    // Initialize ApperClient
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "description" } },
          { field: { Name: "type" } },
          { field: { Name: "data_source" } },
          { field: { Name: "filters" } },
          { field: { Name: "display_format" } },
          { field: { Name: "last_run_date" } },
          { field: { Name: "report_data" } }
        ],
        orderBy: [
          { fieldName: "last_run_date", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('report', params);
      
      if (!response.success) {
        console.error("Error fetching reports:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching reports:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching reports:", error.message);
        toast.error("Failed to load reports");
      }
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "description" } },
          { field: { Name: "type" } },
          { field: { Name: "data_source" } },
          { field: { Name: "filters" } },
          { field: { Name: "display_format" } },
          { field: { Name: "last_run_date" } },
          { field: { Name: "report_data" } }
        ]
      };

      const response = await this.apperClient.getRecordById('report', id, params);
      
      if (!response.success) {
        console.error(`Error fetching report with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching report with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching report:", error.message);
        toast.error("Failed to load report");
      }
      return null;
    }
  }

  async create(report) {
    try {
      const params = {
        records: [{
          Name: report.name || report.Name || '',
          Tags: report.tags || report.Tags || '',
          description: report.description || '',
          type: report.type || 'Summary',
          data_source: report.data_source || report.dataSource || '',
          filters: report.filters || '',
          display_format: report.display_format || report.displayFormat || 'Table',
          last_run_date: report.last_run_date || null,
          report_data: report.report_data || report.reportData || ''
        }]
      };

      const response = await this.apperClient.createRecord('report', params);
      
      if (!response.success) {
        console.error("Error creating report:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} report records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating report:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating report:", error.message);
        toast.error("Failed to create report");
      }
      return null;
    }
  }

  async update(id, data) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.name || data.Name || '',
          Tags: data.tags || data.Tags || '',
          description: data.description || '',
          type: data.type || 'Summary',
          data_source: data.data_source || data.dataSource || '',
          filters: data.filters || '',
          display_format: data.display_format || data.displayFormat || 'Table',
          last_run_date: data.last_run_date || null,
          report_data: data.report_data || data.reportData || ''
        }]
      };

      const response = await this.apperClient.updateRecord('report', params);
      
      if (!response.success) {
        console.error("Error updating report:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} report records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating report:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating report:", error.message);
        toast.error("Failed to update report");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('report', params);
      
      if (!response.success) {
        console.error("Error deleting report:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} report records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting report:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting report:", error.message);
        toast.error("Failed to delete report");
      }
      return false;
    }
  }

  async runReport(id) {
    try {
      const report = await this.getById(id);
      if (!report) {
        toast.error("Report not found");
        return null;
      }

      // Update last run date
      const updateData = {
        ...report,
        last_run_date: new Date().toISOString()
      };

      await this.update(id, updateData);
      
      // Generate mock report data based on type
      let reportData = {};
      
      switch (report.type) {
        case 'Summary':
          reportData = {
            totalIncome: 15420.50,
            totalExpenses: 8750.25,
            netBalance: 6670.25,
            transactionCount: 142,
            avgTransactionAmount: 108.45,
            topCategories: [
              { category: 'Salary', amount: 12000.00 },
              { category: 'Food & Dining', amount: 2850.75 },
              { category: 'Transportation', amount: 1420.50 }
            ]
          };
          break;
        case 'Detail':
          reportData = {
            transactions: [
              { date: '2024-01-15', description: 'Salary Payment', amount: 3500.00, category: 'Salary' },
              { date: '2024-01-14', description: 'Grocery Shopping', amount: -125.50, category: 'Groceries' },
              { date: '2024-01-13', description: 'Coffee Shop', amount: -15.75, category: 'Food & Dining' }
            ],
            totalRecords: 142,
            filteredRecords: 25
          };
          break;
        case 'Chart':
          reportData = {
            chartType: 'pie',
            data: [
              { label: 'Income', value: 15420.50, color: '#10B981' },
              { label: 'Expenses', value: 8750.25, color: '#EF4444' }
            ],
            categories: [
              { label: 'Food & Dining', value: 2850.75 },
              { label: 'Transportation', value: 1420.50 },
              { label: 'Utilities', value: 850.00 }
            ]
          };
          break;
        default:
          reportData = { message: 'Unknown report type' };
      }

      toast.success('Report generated successfully');
      return reportData;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error running report:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error running report:", error.message);
        toast.error("Failed to run report");
      }
      return null;
    }
  }
}

export const reportService = new ReportService();