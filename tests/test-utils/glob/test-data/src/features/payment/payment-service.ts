import { PaymentRepository } from "./payment-repository";

export class PaymentService {
  constructor(private repository: PaymentRepository) {}

  async processPayment(amount: number): Promise<string> {
    return this.repository.save({
      id: Math.random().toString(36).substring(7),
      amount,
      status: "pending",
      createdAt: new Date(),
    });
  }
}

