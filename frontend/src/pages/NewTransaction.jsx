import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const NewTransaction = () => {
  const [formData, setFormData] = useState({
    swiftCode: '',
    amount: '',
    recipientName: '',
    recipientBank: '',
    description: '',
    paymentMethod: 'bank_transfer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.swiftCode || !formData.amount || !formData.recipientName) {
        setError('SWIFT Code, Amount, and Recipient Name are required');
        setLoading(false);
        return;
      }

      if (formData.amount <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }

      const transactionData = {
        swiftCode: formData.swiftCode.toUpperCase(),
        amount: parseFloat(formData.amount),
        recipientName: formData.recipientName,
        recipientBank: formData.recipientBank,
        description: formData.description,
        paymentMethod: formData.paymentMethod
      };

      const response = await transactionAPI.create(transactionData);

      if (response.message === 'Transaction created successfully') {
        setSuccess('Transaction created successfully!');
        // Reset form
        setFormData({
          swiftCode: '',
          amount: '',
          recipientName: '',
          recipientBank: '',
          description: '',
          paymentMethod: 'bank_transfer'
        });
        
        // Redirect to transactions list after 2 seconds
        setTimeout(() => {
          navigate('/transactions');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create transaction');
      }
    } catch (err) {
      setError('Failed to create transaction. Please try again.');
      console.error('Transaction creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Common SWIFT codes for demo
  const commonSwiftCodes = [
    { code: 'BOFAUS3N', bank: 'Bank of America' },
    { code: 'CITIUS33', bank: 'Citibank' },
    { code: 'CHASUS33', bank: 'JPMorgan Chase' },
    { code: 'WFBIUS6S', bank: 'Wells Fargo' },
    { code: 'HSBCUS33', bank: 'HSBC Bank USA' },
    { code: 'DEUTUS33', bank: 'Deutsche Bank' }
  ];

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' }
  ];

  return (
    <div className="new-transaction-container">
      <div className="transaction-header">
        <h2>Create New International Payment</h2>
        <button 
          className="btn-back"
          onClick={() => navigate('/transactions')}
        >
          ← Back to Transactions
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="transaction-form-container">
        <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-section">
            <h3>Payment Details</h3>
            
            <div className="form-group">
              <label htmlFor="amount">Amount (USD)*</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method*</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter payment description (e.g., Invoice payment, Supplier payment)"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Recipient Information</h3>
            
            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name*</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Full name of recipient"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipientBank">Recipient Bank</label>
              <input
                type="text"
                id="recipientBank"
                name="recipientBank"
                value={formData.recipientBank}
                onChange={handleChange}
                placeholder="Bank name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="swiftCode">SWIFT/BIC Code*</label>
              <input
                type="text"
                id="swiftCode"
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleChange}
                placeholder="e.g., BOFAUS3N"
                required
                style={{ textTransform: 'uppercase' }}
              />
              <small className="help-text">
                8-11 character SWIFT code for international transfers
              </small>
            </div>

            <div className="common-swift-codes">
              <h4>Common SWIFT Codes:</h4>
              <div className="swift-codes-list">
                {commonSwiftCodes.map(bank => (
                  <button
                    key={bank.code}
                    type="button"
                    className="swift-code-btn"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        swiftCode: bank.code,
                        recipientBank: prev.recipientBank || bank.bank
                      }));
                    }}
                  >
                    <strong>{bank.code}</strong>
                    <span>{bank.bank}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/transactions')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Creating Transaction...' : 'Create Payment'}
            </button>
          </div>
        </form>

        <div className="transaction-info">
          <h3>Payment Information</h3>
          <div className="info-card">
            <h4>About International Payments</h4>
            <ul>
              <li>SWIFT codes are required for international bank transfers</li>
              <li>Transactions typically take 1-3 business days</li>
              <li>All payments are subject to review and approval</li>
              <li>Exchange rates are locked at time of transaction</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>Current Limits</h4>
            <ul>
              <li>Minimum amount: $1.00</li>
              <li>Maximum amount: $50,000.00</li>
              <li>Daily limit: $100,000.00</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTransaction;