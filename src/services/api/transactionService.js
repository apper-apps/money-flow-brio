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

// Enhanced Plaid Integration with Database Persistence and Categorization
  async initializePlaid() {
    try {
      if (!import.meta.env.VITE_PLAID_PUBLIC_KEY) {
        throw new Error('Plaid configuration missing. Please check your environment variables.');
      }
      
      this.plaidClient = {
        initialized: true,
        publicKey: import.meta.env.VITE_PLAID_PUBLIC_KEY,
        environment: import.meta.env.VITE_PLAID_ENV || 'sandbox'
      };
      return this.plaidClient;
    } catch (error) {
      console.error('Plaid initialization failed:', error.message);
      throw new Error(`Failed to initialize bank connection: ${error.message}`);
    }
  }

  async linkAccount(publicToken, metadata) {
    try {
      if (!publicToken || !metadata) {
        throw new Error('Invalid connection data received from bank');
      }

      // Import the service here to avoid circular dependency
      const { connectedAccountService } = await import('./connectedAccountService');
      
      // Generate unique account ID
      const accountId = `${metadata.institution?.institution_id || 'bank'}_${Date.now()}`;
      
      // Prepare account data for database storage
      const accountData = {
        account_id: accountId,
        institution_name: metadata.institution?.name || 'Unknown Bank',
        account_name: metadata.account?.name || metadata.account?.official_name || 'Checking Account',
        account_type: metadata.account?.type || metadata.account?.subtype || 'depository',
        public_token: publicToken,
        access_token: `access_token_${accountId}`, // In production, exchange with Plaid API
        connected_at: new Date().toISOString(),
        last_sync: null
      };
      
      // Save to database
      const newAccount = await connectedAccountService.create(accountData);
      if (!newAccount) {
        throw new Error('Failed to save account connection to database');
      }
      
      return newAccount;
    } catch (error) {
      console.error('Account linking failed:', error.message);
      throw new Error(`Failed to connect bank account: ${error.message}`);
    }
  }

  // Predefined categorization rules
  categorizeTransaction(description, amount) {
    const desc = description.toLowerCase();
    
    // Income patterns
    const incomePatterns = [
      /salary|payroll|wages|income|deposit|transfer.*in/i,
      /direct.*deposit|dd\s|ach.*credit/i,
      /refund|return|cashback/i
    ];
    
    // Expense categorization patterns
    const categoryRules = {
      'Food': [
        /restaurant|cafe|coffee|food|grocery|market|dining|eat/i,
        /starbucks|mcdonalds|subway|pizza|burger/i,
        /whole foods|trader joe|safeway|kroger/i
      ],
      'Transport': [
        /gas|fuel|station|exxon|shell|chevron|bp/i,
        /uber|lyft|taxi|transport|parking|toll/i,
        /auto|car.*wash|service.*station/i
      ],
      'Shopping': [
        /amazon|walmart|target|store|shop|retail/i,
        /purchase|buy|mall|outlet/i
      ],
      'Entertainment': [
        /movie|cinema|theater|netflix|spotify|game/i,
        /entertainment|fun|recreation|hobby/i
      ],
      'Utilities': [
        /electric|gas.*company|water|internet|phone|cable/i,
        /utility|bill.*pay|service.*charge/i
      ],
      'Healthcare': [
        /medical|doctor|pharmacy|hospital|health|dental/i,
        /cvs|walgreens|clinic|urgent.*care/i
      ],
      'Finance': [
        /bank|atm|fee|interest|loan|credit|payment/i,
        /transfer|wire|check|deposit/i
      ]
    };

    // Check for income first
    for (const pattern of incomePatterns) {
      if (pattern.test(desc)) {
        return { type: 'income', category: 'Income' };
      }
    }

    // Check expense categories
    for (const [category, patterns] of Object.entries(categoryRules)) {
      for (const pattern of patterns) {
        if (pattern.test(desc)) {
          return { type: 'expense', category };
        }
      }
    }

    // Default categorization based on amount (positive = income, negative = expense)
    return {
      type: amount > 0 ? 'income' : 'expense',
      category: amount > 0 ? 'Income' : 'Other'
    };
  }

  async syncTransactions(accountId) {
    try {
      // Import the service here to avoid circular dependency
      const { connectedAccountService } = await import('./connectedAccountService');
      
      const account = await connectedAccountService.getById(accountId);
      if (!account) {
        throw new Error('Connected account not found. Please reconnect your bank account.');
      }

      // Check for existing transactions to avoid duplicates
      const existingTransactions = await this.getAll();
      const existingPlaidIds = new Set(
        existingTransactions
          .filter(tx => tx.plaid_transaction_id)
          .map(tx => tx.plaid_transaction_id)
      );

      // Mock imported transactions from Plaid (In production, call Plaid API)
      const mockImportedTransactions = [
        {
          plaid_transaction_id: `plaid_${Date.now()}_1`,
          amount: -12.50, // Negative for expenses in Plaid
          description: 'STARBUCKS COFFEE #1234',
          date: new Date().toISOString().split('T')[0],
          account_id: account.account_id
        },
        {
          plaid_transaction_id: `plaid_${Date.now()}_2`,
          amount: -45.00,
          description: 'SHELL GAS STATION',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          account_id: account.account_id
        },
        {
          plaid_transaction_id: `plaid_${Date.now()}_3`,
          amount: 2500.00, // Positive for income
          description: 'COMPANY PAYROLL DIRECT DEP',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          account_id: account.account_id
        }
      ];

      // Filter out duplicates and categorize transactions
      const newTransactions = [];
      let duplicatesSkipped = 0;

      for (const importedTx of mockImportedTransactions) {
        if (existingPlaidIds.has(importedTx.plaid_transaction_id)) {
          duplicatesSkipped++;
          continue;
        }

        // Categorize transaction
        const { type, category } = this.categorizeTransaction(
          importedTx.description, 
          importedTx.amount
        );

        // Prepare transaction for database
        const transactionData = {
          amount: Math.abs(importedTx.amount), // Store as positive number
          type: type,
          category: category,
          description: importedTx.description,
          date: importedTx.date,
          recurring: false, // Could be enhanced with pattern detection
          plaid_transaction_id: importedTx.plaid_transaction_id,
          account_id: importedTx.account_id
        };

        try {
          const created = await this.create(transactionData);
          if (created) {
            newTransactions.push(created);
          }
        } catch (error) {
          console.error('Failed to create transaction:', error.message);
          // Continue with other transactions even if one fails
        }
      }
      
      // Update last sync time
      await connectedAccountService.updateLastSync(accountId);
      
      return {
        imported: newTransactions.length,
        duplicatesSkipped: duplicatesSkipped,
        transactions: newTransactions,
        accountName: account.institution_name
      };
    } catch (error) {
      console.error('Transaction sync failed:', error.message);
      throw new Error(`Failed to sync transactions: ${error.message}`);
    }
  }

  async getConnectedAccounts() {
    try {
      // Import the service here to avoid circular dependency
      const { connectedAccountService } = await import('./connectedAccountService');
      return await connectedAccountService.getAll();
    } catch (error) {
      console.error('Failed to load connected accounts:', error.message);
      return [];
    }
  }

  async disconnectAccount(accountId) {
    try {
      // Import the service here to avoid circular dependency
      const { connectedAccountService } = await import('./connectedAccountService');
      
      const account = await connectedAccountService.getById(accountId);
      if (!account) {
        throw new Error('Account not found');
      }
      
      // In production, revoke access token with Plaid API here
      
      const success = await connectedAccountService.delete(accountId);
      if (!success) {
        throw new Error('Failed to remove account from database');
      }
      
      return true;
    } catch (error) {
      console.error('Account disconnection failed:', error.message);
      throw new Error(`Failed to disconnect account: ${error.message}`);
    }
  }
}

export const transactionService = new TransactionService();