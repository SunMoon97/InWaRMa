import React from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center space-x-2 select-none">
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="40" height="24" rx="4" fill="#2563eb"/>
      <rect x="12" y="8" width="24" height="16" rx="4" fill="#60a5fa"/>
      <rect x="20" y="24" width="8" height="8" rx="2" fill="#fff"/>
      <path d="M8 40V28C8 25.7909 9.79086 24 12 24H36C38.2091 24 40 25.7909 40 28V40" stroke="#1e293b" strokeWidth="2"/>
      <circle cx="24" cy="32" r="2" fill="#2563eb"/>
    </svg>
    <span className="font-bold text-xl tracking-tight text-slate-800">InWaRMa</span>
  </div>
);

export default Logo; 