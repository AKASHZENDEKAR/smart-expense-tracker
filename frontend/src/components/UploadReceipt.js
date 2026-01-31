import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { receiptAPI, expenseAPI } from '../utils/api';

function UploadReceipt() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await receiptAPI.upload(formData);
      setExtractedData(response.data);
      setSuccess('Receipt data extracted! Review and save below.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!extractedData) return;

    try {
      await expenseAPI.add({
        amount: extractedData.amount || 0,
        category: extractedData.suggested_category || 'Other',
        description: 'From receipt',
        merchant: extractedData.merchant || '',
        date: extractedData.date || new Date().toISOString().split('T')[0],
        payment_method: 'Card'
      });
      setSuccess('Expense saved successfully!');
      setTimeout(() => navigate('/expenses'), 1500);
    } catch (err) {
      setError('Failed to save expense');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Upload Receipt</h1>
        <p>Upload a receipt image to automatically extract expense details using AI</p>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
          {preview ? (
            <img src={preview} alt="Receipt preview" style={{maxWidth: '100%', maxHeight: '300px'}} />
          ) : (
            <div>
              <p style={{fontSize: '48px'}}>📄</p>
              <p>Click to select a receipt image</p>
              <p style={{fontSize: '14px', color: '#666'}}>Supported: JPG, PNG, PDF</p>
            </div>
          )}
          <input
            id="file-input"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            style={{display: 'none'}}
          />
        </div>
        
        {file && !extractedData && (
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={loading}
            style={{marginTop: '20px'}}
          >
            {loading ? 'Processing...' : 'Extract Data from Receipt'}
          </button>
        )}

        {extractedData && (
          <div className="extracted-data" style={{marginTop: '30px'}}>
            <h3>Extracted Data</h3>
            <div className="form-group">
              <label>Amount</label>
              <input 
                type="number" 
                value={extractedData.amount}
                onChange={(e) => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Merchant</label>
              <input 
                type="text" 
                value={extractedData.merchant}
                onChange={(e) => setExtractedData({...extractedData, merchant: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Suggested Category</label>
              <input 
                type="text" 
                value={extractedData.suggested_category}
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input 
                type="date" 
                value={extractedData.date}
                onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
              />
            </div>
            <button className="btn btn-success" onClick={handleSaveExpense}>
              Save as Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadReceipt;
