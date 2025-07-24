import { toast } from "react-toastify";
import React from "react";

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

  // Enhanced method for bulk importing transactions with automatic categorization
  async importTransactions(transactions, accountId = null) {
    if (!this.apperClient) {
      console.error("ApperClient not initialized");
      toast.error("Service not available");
      return 0;
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      console.error("Invalid transactions data provided");
      toast.error("No transactions to import");
      return 0;
    }

    try {
      // Categorization rules based on transaction patterns
      const categorizationRules = {
        'Food & Dining': ['starbucks', 'mcdonald', 'restaurant', 'pizza', 'cafe', 'burger', 'taco', 'subway', 'kfc'],
        'Groceries': ['grocery', 'supermarket', 'kroger', 'walmart', 'target', 'costco', 'safeway', 'whole foods'],
        'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'metro', 'bus', 'train'],
        'Shopping': ['amazon', 'ebay', 'store', 'mall', 'retail', 'clothing', 'electronics', 'best buy'],
        'Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone', 'cable', 'utility'],
        'Entertainment': ['netflix', 'spotify', 'movie', 'theater', 'game', 'streaming', 'subscription'],
        'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medical', 'dentist', 'health'],
        'Investment': ['dividend', 'interest', 'investment', 'stock', 'bond', 'mutual fund'],
        'Salary': ['salary', 'payroll', 'direct deposit', 'wages', 'income'],
        'Freelance': ['freelance', 'contract', 'consulting', 'payment'],
        'Other Income': ['refund', 'cashback', 'bonus', 'gift']
      };

      // Auto-categorize transactions
      const processedTransactions = transactions.map(transaction => {
        let category = transaction.category || 'Other';
        
        // Auto-categorize based on description if category not provided
        if (!transaction.category || transaction.category === 'Other') {
          const description = (transaction.description || '').toLowerCase();
          
          for (const [categoryName, keywords] of Object.entries(categorizationRules)) {
            if (keywords.some(keyword => description.includes(keyword))) {
              category = categoryName;
              break;
            }
          }
          
          // Additional rules based on amount patterns
          if (category === 'Other' && transaction.amount !== undefined && transaction.amount !== null) {
            if (transaction.amount > 0) {
              category = transaction.amount > 1000 ? 'Salary' : 'Other Income';
            } else {
              const absAmount = Math.abs(transaction.amount);
              if (absAmount < 20) category = 'Food & Dining';
              else if (absAmount > 100 && absAmount < 300) category = 'Utilities';
              else category = 'Other';
            }
          }
        }

        return {
          Name: transaction.description || 'Imported Transaction',
          Tags: accountId ? `imported,account_${accountId}` : 'imported',
          amount: parseFloat(transaction.amount) || 0,
          type: transaction.type || (transaction.amount >= 0 ? 'income' : 'expense'),
          category: category,
          description: transaction.description || '',
          date: transaction.date || new Date().toISOString().split('T')[0],
          recurring: Boolean(transaction.recurring || false),
          plaid_transaction_id: transaction.plaid_transaction_id || `mock_${Date.now()}_${Math.random()}`,
          account_id: accountId || transaction.account_id || ''
        };
      });

      // Bulk create transactions
      const params = {
        records: processedTransactions
      };

      const response = await this.apperClient.createRecord('transaction', params);
      
      if (!response.success) {
        console.error("Error importing transactions:", response.message);
        toast.error(response.message);
        return 0;
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to import ${failedRecords.length} transaction records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`Import error - ${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(`Import error: ${record.message}`);
          });
        }
        
        const importedCount = successfulRecords.length;
        if (importedCount > 0) {
          toast.success(`Successfully imported ${importedCount} transactions with automatic categorization`);
        }
        
        return importedCount;
      }
      
      return 0;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error importing transactions:", error?.response?.data?.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Error importing transactions:", error.message);
        toast.error("Failed to import transactions");
      }
      return 0;
    }
  }
}

export const transactionService = new TransactionService();