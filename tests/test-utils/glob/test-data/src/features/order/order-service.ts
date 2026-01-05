import { OrderRepository } from "./order-repository";

export class OrderService {
  constructor(private repository: OrderRepository) {}

  async createOrder(userId: string, items: Array<{ productId: string; quantity: number }>): Promise<string> {
    return this.repository.save({
      id: Math.random().toString(36).substring(7),
      userId,
      items,
      status: "pending",
      createdAt: new Date(),
    });
  }
}

