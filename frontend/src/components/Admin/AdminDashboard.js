// frontend/src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  getDashboardStats, 
  getAllUsers, 
  getAllTransactions,
  updateUserRole,
  updateTransactionStatus,
  deleteUser 
} from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, transactionsData] = await Promise.all([
        getDashboardStats(),
        getAllUsers(),
        getAllTransactions()
      ]);
      
      setStats(statsData);
      setUsers(usersData);
      setTransactions(transactionsData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err) {
      setError('Failed to update user role');
    }
  };

  const handleStatusUpdate = async (transactionId, newStatus) => {
    try {
      await updateTransactionStatus(transactionId, newStatus);
      setTransactions(transactions.map(transaction =>
        transaction._id === transactionId ? { ...transaction, status: newStatus } : transaction
      ));
    } catch (err) {
      setError('Failed to update transaction status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, transactions, and system settings</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="alert-close">×</button>
        </div>
      )}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({stats.totalUsers || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions ({stats.totalTransactions || 0})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} users={users} transactions={transactions} />
        )}
        
        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            onRoleUpdate={handleRoleUpdate}
            onDeleteUser={handleDeleteUser}
          />
        )}
        
        {activeTab === 'transactions' && (
          <TransactionsTab 
            transactions={transactions}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
        
        {activeTab === 'reports' && (
          <ReportsTab transactions={transactions} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ stats, users, transactions }) => {
  const recentUsers = users.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="overview-tab">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">{stats.totalUsers || 0}</div>
          <div className="stat-trend positive">+12% this month</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Transactions</h3>
          <div className="stat-value">{stats.totalTransactions || 0}</div>
          <div className="stat-trend positive">+8% this month</div>
        </div>
        
        <div className="stat-card">
          <h3>Total Volume</h3>
          <div className="stat-value">${stats.totalVolume?.toLocaleString() || '0'}</div>
          <div className="stat-trend positive">+15% this month</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending Actions</h3>
          <div className="stat-value">{stats.pendingTransactions || 0}</div>
          <div className="stat-trend warning">Requires attention</div>
        </div>
      </div>

      <div className="overview-sections">
        <div className="overview-section">
          <h3>Recent Users</h3>
          <div className="recent-list">
            {recentUsers.map(user => (
              <div key={user._id} className="recent-item">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <div className={`user-role role-${user.role}`}>
                  {user.role}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-section">
          <h3>Recent Transactions</h3>
          <div className="recent-list">
            {recentTransactions.map(transaction => (
              <div key={transaction._id} className="recent-item">
                <div className="transaction-icon">💸</div>
                <div className="transaction-info">
                  <strong>${transaction.amount}</strong>
                  <span>{transaction.currency} • {transaction.paymentMethod}</span>
                </div>
                <div className={`status status-${transaction.status}`}>
                  {transaction.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ users, onRoleUpdate, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-tab">
      <div className="tab-header">
        <h2>User Management</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <UserRow 
                key={user._id}
                user={user}
                onRoleUpdate={onRoleUpdate}
                onDeleteUser={onDeleteUser}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserRow = ({ user, onRoleUpdate, onDeleteUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRole, setNewRole] = useState(user.role);

  const handleSave = () => {
    onRoleUpdate(user._id, newRole);
    setIsEditing(false);
  };

  return (
    <tr>
      <td>
        <div className="user-cell">
          <div className="user-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <strong>{user.name}</strong>
            <span>ID: {user._id}</span>
          </div>
        </div>
      </td>
      <td>{user.email}</td>
      <td>
        {isEditing ? (
          <div className="role-edit">
            <select 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleSave} className="btn-sm btn-success">Save</button>
            <button onClick={() => setIsEditing(false)} className="btn-sm btn-secondary">Cancel</button>
          </div>
        ) : (
          <div className="role-display">
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
            <button 
              onClick={() => setIsEditing(true)}
              className="btn-sm btn-outline"
            >
              Edit
            </button>
          </div>
        )}
      </td>
      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
      <td>
        <div className="action-buttons">
          <button 
            onClick={() => onDeleteUser(user._id)}
            className="btn-sm btn-danger"
            disabled={user.role === 'admin'}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ transactions, onStatusUpdate }) => {
  const [filter, setFilter] = useState('all');

  const filteredTransactions = transactions.filter(transaction =>
    filter === 'all' || transaction.status === filter
  );

  return (
    <div className="transactions-tab">
      <div className="tab-header">
        <h2>Transaction Management</h2>
        <div className="filter-controls">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <TransactionRow 
                key={transaction._id}
                transaction={transaction}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransactionRow = ({ transaction, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(transaction.status);

  const handleStatusUpdate = () => {
    onStatusUpdate(transaction._id, newStatus);
    setIsUpdating(false);
  };

  return (
    <tr>
      <td className="transaction-id">{transaction._id}</td>
      <td>{transaction.userId?.name || 'N/A'}</td>
      <td>${transaction.amount} {transaction.currency}</td>
      <td>{transaction.paymentMethod}</td>
      <td>
        {isUpdating ? (
          <div className="status-edit">
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={handleStatusUpdate} className="btn-sm btn-success">Update</button>
            <button onClick={() => setIsUpdating(false)} className="btn-sm btn-secondary">Cancel</button>
          </div>
        ) : (
          <div className="status-display">
            <span className={`status status-${transaction.status}`}>
              {transaction.status}
            </span>
            <button 
              onClick={() => setIsUpdating(true)}
              className="btn-sm btn-outline"
            >
              Change
            </button>
          </div>
        )}
      </td>
      <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
      <td>
        <button className="btn-sm btn-primary">View Details</button>
      </td>
    </tr>
  );
};

// Reports Tab Component
const ReportsTab = ({ transactions }) => {
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const generateReport = () => {
    // Report generation logic would go here
    console.log('Generating report:', { reportType, dateRange });
  };

  return (
    <div className="reports-tab">
      <div className="report-controls">
        <h2>Generate Reports</h2>
        
        <div className="control-group">
          <label>Report Type:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="monthly">Monthly Summary</option>
            <option value="transaction">Transaction Report</option>
            <option value="user">User Activity Report</option>
            <option value="revenue">Revenue Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range:</label>
          <div className="date-inputs">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        <button onClick={generateReport} className="btn btn-primary">
          Generate Report
        </button>
      </div>

      <div className="report-preview">
        <h3>Report Preview</h3>
        <div className="preview-placeholder">
          <p>Select report type and date range, then click "Generate Report"</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;