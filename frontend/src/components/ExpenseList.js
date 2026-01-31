import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../utils/api';

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [filter, expenses]);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data);
      setFilteredExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    if (filter === 'all') {
      setFilteredExpenses(expenses);
    } else {
      setFilteredExpenses(expenses.filter(exp => exp.category === filter));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        setExpenses(expenses.filter(exp => exp.id !== id));
      } catch (error) {
        alert('Failed to delete expense');
      }
    }
  };

  const calculateTotal = () => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2);
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading expenses...</div></div>;
  }

  const categories = ['all', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];

  return (
    <div className="container">
      <div className="header-with-button">
        <h1>All Expenses</h1>
        <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
          + Add New Expense
        </button>
      </div>

      <div className="card">
        <div className="filter-section">
          <label>Filter by Category: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <span className="total-display">
            Total: <strong>${calculateTotal()}</strong>
          </span>
        </div>

        {filteredExpenses.length > 0 ? (
          <div className="expense-list">
            {filteredExpenses.map(expense => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <h4>{expense.description || 'No description'}</h4>
                  <p>
                    <span className="category-badge">{expense.category}</span>
                    {expense.merchant && ` • ${expense.merchant}`}
                    {' • '}
                    {expense.payment_method}
                    {' • '}
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="expense-actions">
                  <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDelete(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No expenses found</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-expense')}>
              Add Your First Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseList;
