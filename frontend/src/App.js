import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpense from './components/AddExpense';
import UploadReceipt from './components/UploadReceipt';
import Insights from './components/Insights';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/dashboard" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/expenses"
            element={
              isAuthenticated ? (
                <ExpenseList />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/add-expense"
            element={
              isAuthenticated ? (
                <AddExpense />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/upload-receipt"
            element={
              isAuthenticated ? (
                <UploadReceipt />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/insights"
            element={
              isAuthenticated ? (
                <Insights />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
