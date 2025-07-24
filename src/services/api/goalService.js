import { toast } from "react-toastify";

class GoalService {
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
          { field: { Name: "target_amount" } },
          { field: { Name: "current_amount" } },
          { field: { Name: "target_date" } }
        ],
        orderBy: [
          { fieldName: "target_date", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('goal', params);
      
      if (!response.success) {
        console.error("Error fetching goals:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching goals:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching goals:", error.message);
        toast.error("Failed to load goals");
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
          { field: { Name: "target_amount" } },
          { field: { Name: "current_amount" } },
          { field: { Name: "target_date" } }
        ]
      };

      const response = await this.apperClient.getRecordById('goal', id, params);
      
      if (!response.success) {
        console.error(`Error fetching goal with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching goal with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching goal:", error.message);
        toast.error("Failed to load goal");
      }
      return null;
    }
  }

  async create(goal) {
    try {
      const params = {
        records: [{
          Name: goal.name || goal.Name || '',
          Tags: goal.tags || goal.Tags || '',
          target_amount: parseFloat(goal.target_amount || goal.targetAmount),
          current_amount: parseFloat(goal.current_amount || goal.currentAmount || 0),
          target_date: goal.target_date || goal.targetDate
        }]
      };

      const response = await this.apperClient.createRecord('goal', params);
      
      if (!response.success) {
        console.error("Error creating goal:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} goal records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating goal:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating goal:", error.message);
        toast.error("Failed to create goal");
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
          target_amount: parseFloat(data.target_amount || data.targetAmount),
          current_amount: parseFloat(data.current_amount || data.currentAmount),
          target_date: data.target_date || data.targetDate
        }]
      };

      const response = await this.apperClient.updateRecord('goal', params);
      
      if (!response.success) {
        console.error("Error updating goal:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} goal records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating goal:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating goal:", error.message);
        toast.error("Failed to update goal");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('goal', params);
      
      if (!response.success) {
        console.error("Error deleting goal:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} goal records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting goal:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting goal:", error.message);
        toast.error("Failed to delete goal");
      }
      return false;
    }
  }
}

export const goalService = new GoalService();