import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
export default function FileUpload({ onFileSelect, label }) {
  const [name, setName] = useState('');
  return (
    <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 relative">
      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e)=>{setName(e.target.files[0]?.name); onFileSelect(e.target.files[0])}} />
      <UploadCloud className="mx-auto text-saudi-green mb-2" />
      <p>{name || label || "اختر ملفاً"}</p>
    </div>
  );
}
