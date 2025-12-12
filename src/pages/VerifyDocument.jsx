import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ScoreBadge from '../components/ScoreBadge';
export default function VerifyDocument() {
  const [res, setRes] = useState(null);
  const [load, setLoad] = useState(false);
  const chk = () => { setLoad(true); setTimeout(() => {
    setRes(Math.random() > 0.5 ? {ok:true} : {ok:false, score: 75, flags:['تعديل فوتوشوب', 'خطوط غير متطابقة']});
    setLoad(false);
  }, 1500)};
  return (
    <div className="max-w-3xl mx-auto p-6 text-center">
      <h2 className="text-3xl font-bold mb-8 text-saudi-green">التحقق من المستندات</h2>
      {!res ? <div className="bg-white p-8 rounded-xl shadow"><FileUpload onFileSelect={()=>{}} /><button onClick={chk} className="mt-4 px-8 py-3 bg-saudi-green text-white rounded-lg">{load?'جاري الفحص...':'تحقق'}</button></div> :
      <div className="animate-fade-in">
        {res.ok ? <div className="bg-green-100 p-10 rounded-xl text-green-800 text-2xl font-bold">✔ المستند سليم ومسجل</div> :
        <div className="bg-white border-t-8 border-red-500 p-8 rounded-xl shadow flex items-center gap-8 text-right">
          <div className="flex-1"><h3 className="text-2xl font-bold text-red-600 mb-2">⚠ اشتباه تزوير</h3>
          <ul className="list-disc pr-5 text-gray-600">{res.flags.map(f=><li key={f}>{f}</li>)}</ul></div>
          <ScoreBadge score={res.score} />
        </div>}
        <button onClick={()=>setRes(null)} className="mt-6 text-gray-500 underline">فحص جديد</button>
      </div>}
    </div>
  );
}
