import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
export default function Navbar() {
  return (
    <nav className="bg-saudi-green text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold"><ShieldCheck /><span>وَعِيد</span></Link>
        <div className="flex gap-4 text-sm"><Link to="/verify">التحقق</Link><Link to="/register">تسجيل</Link></div>
      </div>
    </nav>
  );
}
