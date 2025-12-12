import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Search } from 'lucide-react';
const Btn = ({to, t, d}) => <Link to={to} className="bg-white p-6 rounded-xl shadow hover:shadow-lg border-t-4 border-saudi-green text-center"><h3 className="font-bold mb-2">{t}</h3><p className="text-sm text-gray-500">{d}</p></Link>;
export default function Landing() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-5xl font-bold mb-6 text-gray-800">وَعِيد <span className="text-saudi-green">الوطني</span></h1>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Btn to="/register" t="جهة إصدار" d="تسجيل مستند جديد" />
        <Btn to="/verify" t="تحقق من مستند" d="كشف التزوير وحالة المستند" />
        <Btn to="/registry" t="السجل العام" d="استعراض العمليات" />
      </div>
    </div>
  );
}
