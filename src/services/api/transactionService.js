import { toast } from "react-toastify";

class TransactionService {
  constructor() {
    this.connectedAccounts = [];
    this.plaidClient = null;
    
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
          { field: { Name: "recurring" } },
          { field: { Name: "plaid_transaction_id" } },
          { field: { Name: "account_id" } }
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
          { field: { Name: "recurring" } },
          { field: { Name: "plaid_transaction_id" } },
          { field: { Name: "account_id" } }
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
          recurring: Boolean(transaction.recurring),
          plaid_transaction_id: transaction.plaid_transaction_id || '',
          account_id: transaction.account_id || ''
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
          recurring: Boolean(data.recurring),
          plaid_transaction_id: data.plaid_transaction_id || '',
          account_id: data.account_id || ''
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

  // Plaid Integration Methods - Preserved for existing functionality
  async initializePlaid() {
    try {
      // In a real implementation, this would initialize Plaid with your credentials
      this.plaidClient = {
        initialized: true,
        publicKey: import.meta.env.VITE_PLAID_PUBLIC_KEY || 'sandbox_public_key'
      };
      return this.plaidClient;
    } catch (error) {
      throw new Error('Failed to initialize Plaid');
    }
  }

  async linkAccount(publicToken, metadata) {
    try {
      // In a real implementation, exchange public token for access token
      const accountId = Date.now().toString();
      const newAccount = {
        Id: this.connectedAccounts.length + 1,
        account_id: accountId,
        institution_name: metadata.institution?.name || 'Unknown Bank',
        account_name: metadata.account?.name || 'Checking Account',
        account_type: metadata.account?.type || 'depository',
        public_token: publicToken,
        access_token: `access_token_${accountId}`, // Mock access token
        connected_at: new Date().toISOString(),
        last_sync: null
      };
      
      this.connectedAccounts.push(newAccount);
      return newAccount;
    } catch (error) {
      throw new Error('Failed to link bank account');
    }
  }

  async syncTransactions(accountId) {
    try {
      const account = this.connectedAccounts.find(acc => acc.Id === accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      // Mock imported transactions from Plaid
      const mockImportedTransactions = [
        {
          amount: 12.50,
          type: 'expense',
          category: 'Food',
          description: 'Coffee Shop Purchase',
          date: new Date().toISOString().split('T')[0],
          recurring: false,
          plaid_transaction_id: `plaid_${Date.now()}_1`,
          account_id: account.account_id
        },
        {
          amount: 45.00,
          type: 'expense',
          category: 'Transport',
          description: 'Gas Station',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          recurring: false,
          plaid_transaction_id: `plaid_${Date.now()}_2`,
          account_id: account.account_id
        }
      ];

      // Create new transactions in database
      const newTransactions = [];
      for (const importedTx of mockImportedTransactions) {
        const created = await this.create(importedTx);
        if (created) {
          newTransactions.push(created);
        }
      }
      
      // Update last sync time
      account.last_sync = new Date().toISOString();
      
      return {
        imported: newTransactions.length,
        duplicatesSkipped: mockImportedTransactions.length - newTransactions.length,
        transactions: newTransactions
      };
    } catch (error) {
      throw new Error('Failed to sync transactions');
    }
  }

  async getConnectedAccounts() {
    return [...this.connectedAccounts];
  }

  async disconnectAccount(accountId) {
    try {
      const index = this.connectedAccounts.findIndex(acc => acc.Id === accountId);
      if (index === -1) {
        throw new Error('Account not found');
      }
      
      this.connectedAccounts.splice(index, 1);
      return true;
    } catch (error) {
      throw new Error('Failed to disconnect account');
    }
  }
}

export const transactionService = new TransactionService();