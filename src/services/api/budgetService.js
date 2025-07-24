import { toast } from "react-toastify";

class BudgetService {
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
          { field: { Name: "category" } },
          { field: { Name: "limit" } },
          { field: { Name: "period" } },
          { field: { Name: "spent" } }
        ],
        orderBy: [
          { fieldName: "category", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('budget', params);
      
      if (!response.success) {
        console.error("Error fetching budgets:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching budgets:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching budgets:", error.message);
        toast.error("Failed to load budgets");
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
          { field: { Name: "category" } },
          { field: { Name: "limit" } },
          { field: { Name: "period" } },
          { field: { Name: "spent" } }
        ]
      };

      const response = await this.apperClient.getRecordById('budget', id, params);
      
      if (!response.success) {
        console.error(`Error fetching budget with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching budget with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching budget:", error.message);
        toast.error("Failed to load budget");
      }
      return null;
    }
  }

  async create(budget) {
    try {
      const params = {
        records: [{
          Name: budget.name || budget.Name || budget.category || '',
          Tags: budget.tags || budget.Tags || '',
          category: budget.category,
          limit: parseFloat(budget.limit),
          period: budget.period,
          spent: parseFloat(budget.spent || 0)
        }]
      };

      const response = await this.apperClient.createRecord('budget', params);
      
      if (!response.success) {
        console.error("Error creating budget:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} budget records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating budget:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating budget:", error.message);
        toast.error("Failed to create budget");
      }
      return null;
    }
  }

  async update(id, data) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.name || data.Name || data.category || '',
          Tags: data.tags || data.Tags || '',
          category: data.category,
          limit: parseFloat(data.limit),
          period: data.period,
          spent: parseFloat(data.spent || 0)
        }]
      };

      const response = await this.apperClient.updateRecord('budget', params);
      
      if (!response.success) {
        console.error("Error updating budget:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} budget records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating budget:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating budget:", error.message);
        toast.error("Failed to update budget");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('budget', params);
      
      if (!response.success) {
        console.error("Error deleting budget:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} budget records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting budget:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting budget:", error.message);
        toast.error("Failed to delete budget");
      }
      return false;
    }
  }
}

export const budgetService = new BudgetService();