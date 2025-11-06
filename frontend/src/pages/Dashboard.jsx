import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header>
        <h1>Welcome, {user?.name}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      
      <div className="dashboard-content">
        <div className="card">
          <h3>Quick Actions</h3>
          <Link to="/transactions" className="btn-primary">
            View Transactions
          </Link>
          <Link to="/transactions/new" className="btn-secondary">
            Create New Transaction
          </Link>
        </div>
        
        
        <div className="card">
          <h3>Account Information</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;