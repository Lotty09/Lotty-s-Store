export type ProductImage = {
  id?: number;
  url: string;
  altText?: string | null;
};

export type Category = {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
};

export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  stockQuantity: number;
  sku?: string | null;
  status?: string;
  categoryId?: number;
  category?: Category;
  images: ProductImage[];
  createdAt?: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  image: string | null;
  product?: Pick<Product, 'id' | 'name'>;
};

export type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};
