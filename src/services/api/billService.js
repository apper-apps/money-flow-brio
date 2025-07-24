import billsData from "@/services/mockData/bills.json";

class BillService {
  constructor() {
    this.bills = [...billsData];
  }

  async getAll() {
    await this.delay();
    return [...this.bills];
  }

  async getById(id) {
    await this.delay();
    const bill = this.bills.find(b => b.Id === id);
    if (!bill) {
      throw new Error("Bill not found");
    }
    return { ...bill };
  }

  async create(bill) {
    await this.delay();
    const maxId = Math.max(...this.bills.map(b => b.Id), 0);
    const newBill = {
      ...bill,
      Id: maxId + 1
    };
    this.bills.push(newBill);
    return { ...newBill };
  }

  async update(id, data) {
    await this.delay();
    const index = this.bills.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error("Bill not found");
    }
    this.bills[index] = { ...this.bills[index], ...data };
    return { ...this.bills[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.bills.findIndex(b => b.Id === id);
    if (index === -1) {
      throw new Error("Bill not found");
    }
    this.bills.splice(index, 1);
    return true;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 280));
  }
}

export const billService = new BillService();