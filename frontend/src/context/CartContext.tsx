'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stockQuantity?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, image: string | null) => void;
  clearCart: () => void;
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
      if (!savedCart) return;

      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) setCart(parsedCart);
      } catch {
        localStorage.removeItem('techstore-cart');
      }
    };
    
    const loadTimer = window.setTimeout(() => {
      loadCart();
      setIsLoaded(true);
    }, 0);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'techstore-cart' && e.newValue) {
        try {
          const parsedCart = JSON.parse(e.newValue);
          if (Array.isArray(parsedCart)) setCart(parsedCart);
        } catch {
          setCart([]);
        }
      } else if (e.key === 'techstore-cart' && e.newValue === null) {
        setCart([]);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 2. Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('techstore-cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id && item.image === product.image
      );
      
      if (existingItem) {
        if (typeof product.stockQuantity === 'number'
          && existingItem.quantity >= product.stockQuantity) {
          return prevCart;
        }

        return prevCart.map((item) =>
          (item.id === product.id && item.image === product.image)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }

      if (typeof product.stockQuantity === 'number' && product.stockQuantity < 1) {
        return prevCart;
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number, image: string | null) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.image === image)));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};