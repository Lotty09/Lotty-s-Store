'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load cart initially and listen for changes from other tabs
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('techstore-cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };
    
    loadCart();
    setIsLoaded(true);

    // NEW: Listen for changes from other browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'techstore-cart' && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 2. Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('techstore-cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: CartItem) => {
    console.log("🛒 TRYING TO ADD PRODUCT:", product.name, "ID:", product.id);
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        console.log("⚠️ Product ID already in cart! Increasing quantity instead of adding new row.");
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      console.log("✅ New Product! Adding to cart array.");
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};