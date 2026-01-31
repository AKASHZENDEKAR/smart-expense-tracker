import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">
          🧠 Smart Expense Tracker
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/expenses" className="nav-link">Expenses</Link>
          </li>
          <li className="nav-item">
            <Link to="/add-expense" className="nav-link">Add Expense</Link>
          </li>
          <li className="nav-item">
            <Link to="/upload-receipt" className="nav-link">Upload Receipt</Link>
          </li>
          <li className="nav-item">
            <Link to="/insights" className="nav-link">Insights</Link>
          </li>
          <li className="nav-item">
            <button onClick={onLogout} className="nav-link btn-logout">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
