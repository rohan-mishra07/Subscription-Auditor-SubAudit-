import React, { useState } from 'react';
import UploadStatement from './components/UploadStatement';
import SubscriptionDashboard from './components/SubscriptionDashboard';

export default function App() {
  const [transactions, setTransactions] = useState([]);

  const handleReset = () => {
    setTransactions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navbar / Header */}
        <header className="bg-white rounded-lg shadow-md p-4 px-6 flex items-center justify-between border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              SA
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                SubAudit
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Subscription & Recurring Expense Detector
              </p>
            </div>
          </div>
          {transactions && transactions.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              ● Active Audit Session
            </span>
          )}
        </header>

        {/* Conditional View Rendering */}
        <main>
          {!transactions || transactions.length === 0 ? (
            <UploadStatement onUploadSuccess={setTransactions} />
          ) : (
            <SubscriptionDashboard
              transactions={transactions}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  );
}
