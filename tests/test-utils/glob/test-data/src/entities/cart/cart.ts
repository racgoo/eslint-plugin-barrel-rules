import { Cart, CartItem } from "./index";

export class CartEntity {
  constructor(private cart: Cart) {}

  getId(): string {
    return this.cart.id;
  }

  addItem(item: CartItem): void {
    this.cart.items.push(item);
  }

  getItems(): CartItem[] {
    return this.cart.items;
  }

  getTotal(): number {
    return this.cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
}

