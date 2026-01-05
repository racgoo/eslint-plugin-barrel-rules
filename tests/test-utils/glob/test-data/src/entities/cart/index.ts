import { User } from "../user";
import { Product } from "../product";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  user: User;
  items: CartItem[];
}

export function createCart(user: User): Cart {
  return {
    id: Math.random().toString(36).substring(7),
    user,
    items: [],
  };
}

