import { toast } from "react-toastify";

class ConnectedAccountService {
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
          { field: { Name: "account_id" } },
          { field: { Name: "institution_name" } },
          { field: { Name: "account_name" } },
          { field: { Name: "account_type" } },
          { field: { Name: "public_token" } },
          { field: { Name: "access_token" } },
          { field: { Name: "connected_at" } },
          { field: { Name: "last_sync" } }
        ],
        orderBy: [
          { fieldName: "connected_at", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('connected_account', params);
      
      if (!response.success) {
        console.error("Error fetching connected accounts:", response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching connected accounts:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching connected accounts:", error.message);
        toast.error("Failed to load connected accounts");
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
          { field: { Name: "account_id" } },
          { field: { Name: "institution_name" } },
          { field: { Name: "account_name" } },
          { field: { Name: "account_type" } },
          { field: { Name: "public_token" } },
          { field: { Name: "access_token" } },
          { field: { Name: "connected_at" } },
          { field: { Name: "last_sync" } }
        ]
      };

      const response = await this.apperClient.getRecordById('connected_account', id, params);
      
      if (!response.success) {
        console.error(`Error fetching connected account with ID ${id}:`, response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching connected account with ID ${id}:`, error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error fetching connected account:", error.message);
        toast.error("Failed to load connected account");
      }
      return null;
    }
  }

  async create(accountData) {
    try {
      const params = {
        records: [{
          Name: accountData.institution_name || accountData.account_name || '',
          Tags: accountData.tags || '',
          account_id: accountData.account_id,
          institution_name: accountData.institution_name,
          account_name: accountData.account_name,
          account_type: accountData.account_type,
          public_token: accountData.public_token,
          access_token: accountData.access_token,
          connected_at: accountData.connected_at || new Date().toISOString(),
          last_sync: accountData.last_sync || null
        }]
      };

      const response = await this.apperClient.createRecord('connected_account', params);
      
      if (!response.success) {
        console.error("Error creating connected account:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} connected account records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating connected account:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error creating connected account:", error.message);
        toast.error("Failed to connect bank account");
      }
      return null;
    }
  }

  async update(id, data) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: data.institution_name || data.account_name || data.Name || '',
          Tags: data.tags || data.Tags || '',
          account_id: data.account_id,
          institution_name: data.institution_name,
          account_name: data.account_name,
          account_type: data.account_type,
          public_token: data.public_token,
          access_token: data.access_token,
          connected_at: data.connected_at,
          last_sync: data.last_sync
        }]
      };

      const response = await this.apperClient.updateRecord('connected_account', params);
      
      if (!response.success) {
        console.error("Error updating connected account:", response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} connected account records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating connected account:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error updating connected account:", error.message);
        toast.error("Failed to update connected account");
      }
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('connected_account', params);
      
      if (!response.success) {
        console.error("Error deleting connected account:", response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} connected account records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting connected account:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error deleting connected account:", error.message);
        toast.error("Failed to disconnect account");
      }
      return false;
    }
  }

  // Helper method to update last sync time
  async updateLastSync(accountId, syncTime = null) {
    try {
      const account = await this.getById(accountId);
      if (!account) return false;

      return await this.update(accountId, {
        ...account,
        last_sync: syncTime || new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating last sync time:", error.message);
      return false;
    }
  }
}

export const connectedAccountService = new ConnectedAccountService();