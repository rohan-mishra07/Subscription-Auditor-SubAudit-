import React, { useState, useEffect } from 'react';
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

const CATEGORY_EMOJIS = {
  'Food & Delivery': '🍔',
  'Friends & UPI': '💸',
  'Shopping': '🛍️',
  'Recharge & Bills': '📱',
  'Entertainment': '🎬',
  'Education': '📚',
  'Travel & Transport': '🚕',
  'Rent & Hostel': '🏠',
  'Other': '🏷️',
};

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

const getCategory = (t) => {
  if (t.category && t.category.trim()) return t.category.trim();
  const name = (t.merchantName || '').toLowerCase();
  if (name.includes('zomato') || name.includes('swiggy') || name.includes('food') || name.includes('canteen') || name.includes('cafe')) return 'Food & Delivery';
  if (name.includes('jio') || name.includes('airtel') || name.includes('vi') || name.includes('bill') || name.includes('recharge') || name.includes('wifi')) return 'Recharge & Bills';
  if (name.includes('rent') || name.includes('hostel') || name.includes('pg') || name.includes('mess') || name.includes('landlord')) return 'Rent & Hostel';
  if (name.includes('netflix') || name.includes('spotify') || name.includes('prime') || name.includes('movie') || name.includes('hotstar')) return 'Entertainment';
  if (name.includes('amazon') || name.includes('flipkart') || name.includes('myntra') || name.includes('shop')) return 'Shopping';
  if (name.includes('uber') || name.includes('ola') || name.includes('rapido') || name.includes('metro') || name.includes('auto')) return 'Travel & Transport';
  if (name.includes('udemy') || name.includes('coursera') || name.includes('college') || name.includes('book')) return 'Education';
  if (name.startsWith('upi') || name.includes('paytm') || name.includes('gpay') || name.includes('transfer')) return 'Friends & UPI';
  return 'Other';
};

const getMonthName = (txs) => {
  if (!txs || txs.length === 0) {
    return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  const monthCounts = {};
  txs.forEach((t) => {
    if (t.transactionDate) {
      try {
        const d = new Date(t.transactionDate);
        if (!isNaN(d.getTime())) {
          const key = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
          monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
      } catch (ignored) {}
    }
  });

  const sortedMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
  if (sortedMonths.length > 0) {
    return sortedMonths[0][0];
  }

  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export default function SubscriptionDashboard({ transactions = [], onReset }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCategory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totalSpent = transactions.reduce(
    (sum, t) => sum + (Number(t.amount) || 0),
    0
  );

  const monthName = getMonthName(transactions);

  // Group spend by Category
  const categoryMap = {};

  transactions.forEach((t) => {
    const cat = getCategory(t);
    const amount = Number(t.amount) || 0;
    const merchant = (t.merchantName || 'Unknown').trim();

    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        name: cat,
        total: 0,
        merchants: {},
      };
    }

    categoryMap[cat].total += amount;
    categoryMap[cat].merchants[merchant] = (categoryMap[cat].merchants[merchant] || 0) + amount;
  });

  const categoryList = Object.values(categoryMap).map((cat) => {
    const percentage = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
    const topMerchants = Object.entries(cat.merchants)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mName]) => mName);

    return {
      name: cat.name,
      emoji: CATEGORY_EMOJIS[cat.name] || '🏷️',
      total: cat.total,
      percentage: parseFloat(percentage.toFixed(1)),
      topMerchants: topMerchants.join(', '),
    };
  });

  // Sort by total amount descending
  categoryList.sort((a, b) => b.total - a.total);

  const topCategory = categoryList.length > 0 ? categoryList[0] : null;

  const pieChartData = categoryList.map((cat) => ({
    name: cat.name,
    value: parseFloat(cat.total.toFixed(2)),
  }));

  const selectedCategoryTransactions = selectedCategory
    ? transactions
        .filter((t) => getCategory(t) === selectedCategory.name)
        .sort((a, b) => {
          const dA = a.transactionDate ? new Date(a.transactionDate) : new Date(0);
          const dB = b.transactionDate ? new Date(b.transactionDate) : new Date(0);
          return dB - dA;
        })
    : [];

  return (
    <div className="w-full space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Where did your pocket money go?
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Your monthly spending breakdown.
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

      {/* Hero Card - Total Spent */}
      <div>
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
          <p className="text-sm uppercase tracking-wider opacity-80 mb-2 font-medium">
            Total Spent This Month
          </p>
          <p className="text-5xl font-extrabold tracking-tight">
            ₹{totalSpent.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-75 mt-3">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} in {monthName}
          </p>
        </div>
        <div className="text-xs text-gray-400 mt-2 flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            Categories are auto-detected from merchant names. 
            Some merchants (like Amazon Pay) serve multiple purposes.
          </span>
        </div>
      </div>

      {/* Insight Card (Amber Box) */}
      {topCategory && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-xl shadow-sm">
          <p className="text-amber-900 font-semibold text-base mb-1 flex items-center gap-2">
            <span>💡</span> Spending Insight
          </p>
          <p className="text-sm text-amber-800">
            You spent <strong className="font-bold">{topCategory.percentage}%</strong> of your money on{' '}
            <strong className="font-bold">{topCategory.name}</strong> ({formatINR(topCategory.total)}).
          </p>
        </div>
      )}

      {/* Charts & Category Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Progress Bars */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col space-y-5">
          <h3 className="text-lg font-semibold text-gray-800">
            Category Breakdown
          </h3>

          {categoryList.length > 0 ? (
            <div className="space-y-5 flex-1">
              {categoryList.map((cat, idx) => {
                const categoryTransactions = transactions.filter(
                  (t) => getCategory(t) === cat.name
                );
                const categoryPayload = {
                  name: cat.name,
                  total: cat.total,
                  count: categoryTransactions.length,
                  transactions: categoryTransactions,
                };

                return (
                  <div key={cat.name} className="space-y-2 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-base">{cat.emoji}</span>
                        {cat.name}
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatINR(cat.total)}{' '}
                        <span className="text-xs font-normal text-gray-400">
                          ({cat.percentage}%)
                        </span>
                      </span>
                    </div>

                    {/* Horizontal Progress Bar */}
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, cat.percentage))}%`,
                          backgroundColor: COLORS[idx % COLORS.length],
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5">
                      <span className="truncate max-w-[70%]">
                        {cat.topMerchants ? `Top: ${cat.topMerchants}` : ''}
                      </span>
                      <button
                        onClick={() => setSelectedCategory(categoryPayload)}
                        className="text-indigo-600 text-sm hover:text-indigo-800 font-medium"
                      >
                        View details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12 flex-1 flex items-center justify-center">
              No category data available.
            </div>
          )}
        </div>

        {/* Recharts PieChart - Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 w-full mb-4">
            Spending by Category
          </h3>
          {pieChartData.length > 0 ? (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatINR(value)}
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
              No category data to display in chart.
            </div>
          )}
        </div>
      </div>

      {/* Category Details Modal */}
      {selectedCategory && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCategory(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                <p className="text-sm text-gray-500">
                  {selectedCategory.count} transactions • Total: ₹{selectedCategory.total.toLocaleString('en-IN')}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <table className="w-full">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-xs uppercase text-gray-500 border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Merchant</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCategory.transactions
                    .sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
                    .map((t, idx) => (
                      <tr key={t.id || idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 text-sm text-gray-600">{t.transactionDate}</td>
                        <td className="py-2 text-sm font-medium">{t.merchantName}</td>
                        <td className="py-2 text-sm text-right font-semibold text-indigo-600">
                          ₹{t.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


