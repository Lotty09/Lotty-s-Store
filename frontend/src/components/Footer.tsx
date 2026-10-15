import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-4">Lotty's Store</h3>
            <p className="text-sm text-gray-600">
              Premium quality designs and apparel. 
              Delivered straight to your doorstep.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-blue-600" /> lottystorrsupoort@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-blue-600" /> +234 9018684798
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" /> Awka, Nigeria
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Lotty's Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}