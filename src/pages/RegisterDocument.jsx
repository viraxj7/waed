import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
export default function RegisterDocument() {
  const [s, setS] = useState('idle');
  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-saudi-green">تسجيل مستند</h2>
      {s==='done' ? <div className="p-10 bg-green-100 text-green-800 text-center rounded-xl">تم التسجيل بنجاح</div> :
      <form onSubmit={(e)=>{e.preventDefault(); setS('loading'); setTimeout(()=>setS('done'),1500)}} className="space-y-4">
        <input placeholder="اسم الجهة" className="w-full p-3 border rounded" required />
        <FileUpload onFileSelect={()=>{}} label="ارفع المستند الأصلي" />
        <button className="w-full bg-saudi-green text-white py-3 rounded-lg">{s==='loading'?'...':'تسجيل'}</button>
      </form>}
    </div>
  );
}
