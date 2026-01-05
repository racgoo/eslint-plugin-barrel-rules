export interface Payment {
  id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

export class PaymentService {
  async processPayment(amount: number): Promise<Payment> {
    return {
      id: Math.random().toString(36).substring(7),
      amount,
      status: "pending",
      createdAt: new Date(),
    };
  }
}

export class PaymentRepository {
  private payments: Payment[] = [];

  async save(payment: Payment): Promise<string> {
    this.payments.push(payment);
    return payment.id;
  }

  async findById(id: string): Promise<Payment | null> {
    return this.payments.find((p) => p.id === id) || null;
  }
}

