import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import RegisterDocument from './pages/RegisterDocument';
import VerifyDocument from './pages/VerifyDocument';
import Registry from './pages/Registry';
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 dir-rtl font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<RegisterDocument />} />
          <Route path="/verify" element={<VerifyDocument />} />
          <Route path="/analyze" element={<VerifyDocument />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/ledger" element={<Registry />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
