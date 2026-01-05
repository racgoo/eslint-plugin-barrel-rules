interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
}

export class PaymentRepository {
  async save(payment: Payment): Promise<string> {
    // Simulate database save
    return payment.id;
  }

  async findById(id: string): Promise<Payment | null> {
    // Simulate database find
    return null;
  }
}

