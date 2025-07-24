import goalsData from "@/services/mockData/goals.json";

class GoalService {
  constructor() {
    this.goals = [...goalsData];
  }

  async getAll() {
    await this.delay();
    return [...this.goals];
  }

  async getById(id) {
    await this.delay();
    const goal = this.goals.find(g => g.Id === id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    return { ...goal };
  }

  async create(goal) {
    await this.delay();
    const maxId = Math.max(...this.goals.map(g => g.Id), 0);
    const newGoal = {
      ...goal,
      Id: maxId + 1
    };
    this.goals.push(newGoal);
    return { ...newGoal };
  }

  async update(id, data) {
    await this.delay();
    const index = this.goals.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Goal not found");
    }
    this.goals[index] = { ...this.goals[index], ...data };
    return { ...this.goals[index] };
  }

  async delete(id) {
    await this.delay();
    const index = this.goals.findIndex(g => g.Id === id);
    if (index === -1) {
      throw new Error("Goal not found");
    }
    this.goals.splice(index, 1);
    return true;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 350));
  }
}

export const goalService = new GoalService();