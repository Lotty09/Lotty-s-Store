import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 1. IMPORT YOUR CART PROVIDER HERE
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Store',
  description: 'E-commerce store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        {/* 2. WRAP THE CHILDREN IN THE PROVIDER */}
        <CartProvider>
          {children}
        </CartProvider>
        
      </body>
    </html>
  );
}
import Footer from '@/components/Footer'; // <-- Add this import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Your existing CartProvider or Navbar might be here */}
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer /> {/* <-- Add the Footer here */}
      </body>
    </html>
  );
}