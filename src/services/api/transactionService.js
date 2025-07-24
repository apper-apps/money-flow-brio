import transactionsData from "@/services/mockData/transactions.json";

class TransactionService {
  constructor() {
    this.transactions = [...transactionsData];
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

  delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const transactionService = new TransactionService();