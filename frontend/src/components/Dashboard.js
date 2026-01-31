import React, { useEffect, useState } from 'react';
import { expenseAPI, insightAPI } from '../utils/api';
import AISummary from './AISummary';

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Chart.js register
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [insightsRes, expensesRes] = await Promise.all([
        insightAPI.get(),
        expenseAPI.getAll()
      ]);

      setInsights(insightsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ✅ Backend sends "by_category"
  const categoryData = insights?.by_category || {};

  const pieChartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe',
          '#43e97b',
          '#fa709a',
          '#fee140'
        ]
      }
    ]
  };

  const totalAmount = insights?.total || 0;
  const transactionCount = expenses.length;
  const averageAmount =
    transactionCount > 0 ? totalAmount / transactionCount : 0;

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="container">
      <h1>Dashboard</h1>

      {/* 📊 STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>This Month's Spending</h3>
          <div className="amount">₹{totalAmount.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <h3>Transactions</h3>
          <div className="amount">{transactionCount}</div>
        </div>

        <div className="stat-card">
          <h3>Average Transaction</h3>
          <div className="amount">₹{averageAmount.toFixed(2)}</div>
        </div>

        <div className="stat-card">
          <h3>Month vs Last Month</h3>
          <div className="amount">0%</div>
        </div>
      </div>

      {/* 🤖 AI SUMMARY */}
      <AISummary />

      {/* 🥧 CATEGORY PIE CHART */}
      <div className="card">
        <h2>Spending by Category</h2>
        {Object.keys(categoryData).length > 0 ? (
          <div style={{ height: '300px' }}>
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </div>
        ) : (
          <p>No expense data available.</p>
        )}
      </div>

      {/* 📋 RECENT EXPENSES */}
      <div className="card">
        <h2>Recent Expenses</h2>
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div>
                <strong>{expense.description || 'No description'}</strong>
                <p>
                  <span className="category-badge">{expense.category}</span>
                  {' • '}
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="expense-amount">
                ₹{expense.amount.toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <p>No expenses yet.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
