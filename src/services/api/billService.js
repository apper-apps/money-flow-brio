import { toast } from "react-toastify";

class BillService {
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
          { field: { Name: "due_date" } },
          { field: { Name: "recurring" } },
          { field: { Name: "paid" } }
        ],
        orderBy: [
          { fieldName: "due_date", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('bill', params);
      
      if (!response.success) {
        console.error("Error fetching bills:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching bills:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching bills:", error.message);
        toast.error("Failed to load bills");
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
          { field: { Name: "due_date" } },
          { field: { Name: "recurring" } },
          { field: { Name: "paid" } }
        ]
      };

      const response = await this.apperClient.getRecordById('bill', id, params);
      
      if (!response.success) {
        console.error(`Error fetching bill with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching bill with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching bill:", error.message);
        toast.error("Failed to load bill");
      }
      return null;
    }
  }

  async create(bill) {
    try {
      const params = {
        records: [{
          Name: bill.name || bill.Name || '',
          Tags: bill.tags || bill.Tags || '',
          amount: parseFloat(bill.amount),
          due_date: bill.due_date || bill.dueDate,
          recurring: Boolean(bill.recurring),
          paid: Boolean(bill.paid)
        }]
      };

      const response = await this.apperClient.createRecord('bill', params);
      
      if (!response.success) {
        console.error("Error creating bill:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} bill records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating bill:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating bill:", error.message);
        toast.error("Failed to create bill");
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
          amount: parseFloat(data.amount),
          due_date: data.due_date || data.dueDate,
          recurring: Boolean(data.recurring),
          paid: Boolean(data.paid)
        }]
      };

      const response = await this.apperClient.updateRecord('bill', params);
      
      if (!response.success) {
        console.error("Error updating bill:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} bill records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating bill:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating bill:", error.message);
        toast.error("Failed to update bill");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('bill', params);
      
      if (!response.success) {
        console.error("Error deleting bill:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} bill records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting bill:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting bill:", error.message);
        toast.error("Failed to delete bill");
      }
      return false;
    }
  }
}

export const billService = new BillService();