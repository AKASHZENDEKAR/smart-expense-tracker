import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../utils/api';

function AddExpense() {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    payment_method: 'Cash'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Online'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await expenseAPI.add(formData);
      setSuccess('Expense added successfully!');
      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Add New Expense</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description"
            />
          </div>
          
          <div className="form-group">
            <label>Merchant/Store</label>
            <input
              type="text"
              name="merchant"
              value={formData.merchant}
              onChange={handleChange}
              placeholder="Where did you spend?"
            />
          </div>
          
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Payment Method</label>
            <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/expenses')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddExpense;
