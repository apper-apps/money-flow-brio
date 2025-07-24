import budgetsData from "@/services/mockData/budgets.json";

class BudgetService {
  constructor() {
    this.budgets = [...budgetsData];
  }

  async getAll() {
    await this.delay();
    return [...this.budgets];
  }

  async getById(id) {
    await this.delay();
    const budget = this.budgets.find(b => b.Id === id);
    if (!budget) {
      throw new Error("Budget not found");
    }
    return { ...budget };
  }

  async create(budget) {
    await this.delay();
    const maxId = Math.max(...this.budgets.map(b => b.Id), 0);
    const newBudget = {
      ...budget,
      Id: maxId + 1
    };
    this.budgets.push(newBudget);
    return { ...newBudget };
  }

  async update(id, data) {
    await this.delay();
    const index = this.budgets.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error("Budget not found");
    }
    this.budgets[index] = { ...this.budgets[index], ...data };
    return { ...this.budgets[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.budgets.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error("Budget not found");
    }
    this.budgets.splice(index, 1);
    return true;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 250));
  }
}

export const budgetService = new BudgetService();