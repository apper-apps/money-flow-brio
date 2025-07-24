import { toast } from "react-toastify";

class TransactionService {
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
          { field: { Name: "amount" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "recurring" } }
        ],
        orderBy: [
          { fieldName: "date", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('transaction', params);
      
      if (!response.success) {
        console.error("Error fetching transactions:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching transactions:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching transactions:", error.message);
        toast.error("Failed to load transactions");
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
          { field: { Name: "amount" } },
          { field: { Name: "type" } },
          { field: { Name: "category" } },
          { field: { Name: "description" } },
          { field: { Name: "date" } },
          { field: { Name: "recurring" } }
        ]
      };

      const response = await this.apperClient.getRecordById('transaction', id, params);
      
      if (!response.success) {
        console.error(`Error fetching transaction with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching transaction with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching transaction:", error.message);
        toast.error("Failed to load transaction");
      }
      return null;
    }
  }

  async create(transaction) {
    try {
      const params = {
        records: [{
          Name: transaction.description || '',
          Tags: transaction.tags || '',
          amount: parseFloat(transaction.amount),
          type: transaction.type,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          recurring: Boolean(transaction.recurring)
        }]
      };

      const response = await this.apperClient.createRecord('transaction', params);
      
      if (!response.success) {
        console.error("Error creating transaction:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} transaction records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating transaction:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating transaction:", error.message);
        toast.error("Failed to create transaction");
      }
      return null;
    }
  }

  async update(id, data) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.description || data.Name || '',
          Tags: data.tags || data.Tags || '',
          amount: parseFloat(data.amount),
          type: data.type,
          category: data.category,
          description: data.description,
          date: data.date,
          recurring: Boolean(data.recurring)
        }]
      };

      const response = await this.apperClient.updateRecord('transaction', params);
      
      if (!response.success) {
        console.error("Error updating transaction:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} transaction records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating transaction:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating transaction:", error.message);
        toast.error("Failed to update transaction");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('transaction', params);
      
      if (!response.success) {
        console.error("Error deleting transaction:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} transaction records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting transaction:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting transaction:", error.message);
        toast.error("Failed to delete transaction");
      }
      return false;
    }
  }
}

export const transactionService = new TransactionService();