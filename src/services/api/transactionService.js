import transactionsData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...transactionsData];
    this.connectedAccounts = [];
    this.plaidClient = null;
  }

  async getAll() {
    await this.delay();
    return [...this.transactions];
  }

  async getById(id) {
    await this.delay();
    const transaction = this.transactions.find(t => t.Id === id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  }

  async create(transaction) {
    await this.delay();
    const maxId = Math.max(...this.transactions.map(t => t.Id), 0);
    const newTransaction = {
      ...transaction,
      Id: maxId + 1
    };
    this.transactions.push(newTransaction);
    return { ...newTransaction };
  }

  async update(id, data) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    this.transactions[index] = { ...this.transactions[index], ...data };
    return { ...this.transactions[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.transactions.findIndex(t => t.Id === id);
    if (index === -1) {
      throw new Error("Transaction not found");
}
    this.transactions.splice(index, 1);
    return true;
  }

  // Plaid Integration Methods
  async initializePlaid() {
await this.delay();
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
    await this.delay();
    try {
      // In a real implementation, exchange public token for access token
      const accountId = Date.now().toString();
      const newAccount = {
        Id: this.connectedAccounts.length + 1,
        accountId,
        institutionName: metadata.institution?.name || 'Unknown Bank',
        accountName: metadata.account?.name || 'Checking Account',
        accountType: metadata.account?.type || 'depository',
        publicToken,
        accessToken: `access_token_${accountId}`, // Mock access token
        connectedAt: new Date().toISOString(),
        lastSync: null
      };
      
      this.connectedAccounts.push(newAccount);
      return newAccount;
    } catch (error) {
      throw new Error('Failed to link bank account');
    }
  }

  async syncTransactions(accountId) {
    await this.delay();
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
          plaidTransactionId: `plaid_${Date.now()}_1`,
          accountId: account.accountId
        },
        {
          amount: 45.00,
          type: 'expense',
          category: 'Transport',
          description: 'Gas Station',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          recurring: false,
          plaidTransactionId: `plaid_${Date.now()}_2`,
          accountId: account.accountId
        }
      ];

      // Deduplicate transactions
      const newTransactions = [];
      for (const importedTx of mockImportedTransactions) {
        const exists = this.transactions.some(tx => 
          tx.plaidTransactionId === importedTx.plaidTransactionId
        );
        
        if (!exists) {
          const maxId = Math.max(...this.transactions.map(t => t.Id), 0);
          const newTransaction = {
            ...importedTx,
            Id: maxId + newTransactions.length + 1
          };
          newTransactions.push(newTransaction);
        }
      }

      this.transactions.push(...newTransactions);
      
      // Update last sync time
      account.lastSync = new Date().toISOString();
      
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
    await this.delay();
    return [...this.connectedAccounts];
  }

  async disconnectAccount(accountId) {
    await this.delay();
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

  delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const transactionService = new TransactionService();