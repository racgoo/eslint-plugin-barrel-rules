import { Product } from "./index";

export class ProductEntity {
  constructor(private product: Product) {}

  getId(): string {
    return this.product.id;
  }

  getName(): string {
    return this.product.name;
  }

  getPrice(): number {
    return this.product.price;
  }
}

