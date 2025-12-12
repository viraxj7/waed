import React from 'react';
export default function ScoreBadge({ score }) {
  let c = score < 40 ? 'bg-yellow-500' : score < 70 ? 'bg-orange-500' : 'bg-red-600';
  if(score < 20) c = 'bg-green-500';
  return <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold ${c}`}>{score}%</div>;
}
