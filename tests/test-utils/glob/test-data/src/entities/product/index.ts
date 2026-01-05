export interface Product {
  id: string;
  name: string;
  price: number;
}

export function createProduct(name: string, price: number): Product {
  return {
    id: Math.random().toString(36).substring(7),
    name,
    price,
  };
}

