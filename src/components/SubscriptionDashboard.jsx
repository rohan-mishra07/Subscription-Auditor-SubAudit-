import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#3B82F6', '#D97706', '#64748B'
];

export default function SubscriptionDashboard({ transactions = [], onReset }) {
  const recurringTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => t.isRecurring === true)
    : [];

  const totalMonthlySpend = recurringTransactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  // Group spend by merchant for PieChart
  const merchantSpendMap = recurringTransactions.reduce((acc, t) => {
    const merchant = t.merchantName || 'Unknown Merchant';
    acc[merchant] = (acc[merchant] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {});

  const chartData = Object.keys(merchantSpendMap).map((merchant) => ({
    name: merchant,
    value: parseFloat(merchantSpendMap[merchant].toFixed(2)),
  }));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Subscription Dashboard
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Overview of detected recurring subscriptions and monthly spend breakdown
          </p>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Upload Another Statement
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Total Monthly Spend
          </p>
          <p className="text-3xl font-extrabold text-indigo-600">
            {formatCurrency(totalMonthlySpend)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Sum of all recurring subscription fees
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Recurring Subscriptions
          </p>
          <p className="text-3xl font-extrabold text-gray-800">
            {recurringTransactions.length}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Out of {transactions.length} total transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Average Spend / Sub
          </p>
          <p className="text-3xl font-extrabold text-emerald-600">
            {formatCurrency(
              recurringTransactions.length > 0
                ? totalMonthlySpend / recurringTransactions.length
                : 0
            )}
          </p>
          <p className="text-xs text-gray-400 mt-2">Average cost per recurring item</p>
        </div>
      </div>

      {/* Charts & Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts PieChart */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 w-full mb-4">
            Spend by Merchant
          </h3>
          {chartData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 py-12">
              No recurring transaction data to display in chart.
            </div>
          )}
        </div>

        {/* Recurring Subscriptions Table */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recurring Subscriptions Table
          </h3>
          {recurringTransactions.length > 0 ? (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {recurringTransactions.map((t, idx) => (
                    <tr
                      key={t.id || idx}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {t.merchantName || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-indigo-600 font-semibold">
                        {formatCurrency(t.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {t.transactionDate || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12 flex-1 flex items-center justify-center">
              No recurring subscriptions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
