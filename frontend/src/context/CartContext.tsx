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
  // CHANGED: We now need both ID and Image to uniquely identify which row to remove
  removeFromCart: (id: number, image: string | null) => void;
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
      // CHANGED: Check if both the ID AND the exact image match
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.image === product.image
      );
      
      if (existingItem) {
        console.log("⚠️ Exact design already in cart! Increasing quantity.");
        return prevCart.map((item) =>
          (item.id === product.id && item.image === product.image)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      console.log("✅ New design! Adding as a separate row.");
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // CHANGED: Remove requires both ID and Image to avoid deleting all designs of a product
  const removeFromCart = (id: number, image: string | null) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.image === image)));
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