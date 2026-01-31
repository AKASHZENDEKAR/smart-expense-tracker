import React, { useState, useEffect } from 'react';
import { insightAPI } from '../utils/api';

function Insights() {
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const [insightsRes, predictionRes] = await Promise.all([
        insightAPI.get(),
        insightAPI.predict()
      ]);
      setInsights(insightsRes.data);
      setPrediction(predictionRes.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Generating insights...</div></div>;
  }

  const categoryBreakdown = insights?.category_breakdown || {};
  const topCategory = insights?.largest_expense?.category || 'N/A';
  const topAmount = insights?.largest_expense?.amount || 0;

  return (
    <div className="container">
      <h1>AI-Powered Insights</h1>
      
      <div className="card">
        <h2>📊 Spending Analysis</h2>
        
        <div className="insight-item">
          <h4>Total Spending This Month</h4>
          <p>You've spent <strong>${insights?.total_current_month?.toFixed(2) || '0.00'}</strong> this month across {insights?.total_transactions || 0} transactions.</p>
        </div>

        <div className="insight-item">
          <h4>Average Transaction</h4>
          <p>Your average expense is <strong>${insights?.average_transaction?.toFixed(2) || '0.00'}</strong>.</p>
        </div>

        {insights?.month_over_month_change !== undefined && (
          <div className="insight-item">
            <h4>Month-over-Month Comparison</h4>
            <p>
              Compared to last month, your spending has 
              {insights.month_over_month_change > 0 ? (
                <span style={{color: '#dc3545'}}> increased by {insights.month_over_month_change.toFixed(1)}%</span>
              ) : insights.month_over_month_change < 0 ? (
                <span style={{color: '#28a745'}}> decreased by {Math.abs(insights.month_over_month_change).toFixed(1)}%</span>
              ) : (
                <span> remained the same</span>
              )}
            </p>
          </div>
        )}

        <div className="insight-item">
          <h4>Biggest Expense Category</h4>
          <p>You spent the most on <strong>{topCategory}</strong> with your largest single expense being <strong>${topAmount.toFixed(2)}</strong>.</p>
        </div>
      </div>

      <div className="card">
        <h2>📈 Category Breakdown</h2>
        {Object.keys(categoryBreakdown).length > 0 ? (
          <div>
            {Object.entries(categoryBreakdown).map(([category, amount]) => (
              <div key={category} className="category-breakdown-item">
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span><strong>{category}</strong></span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${(amount / insights.total_current_month * 100)}%`,
                      backgroundColor: '#667eea'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No category data available yet.</p>
        )}
      </div>

      <div className="card">
        <h2>🔮 AI Prediction</h2>
        {prediction?.prediction > 0 ? (
          <div className="insight-item">
            <h4>Next Month's Spending Forecast</h4>
            <p>
              Based on your spending patterns over the last {prediction.based_on_months} months, 
              we predict you'll spend approximately <strong>${prediction.prediction}</strong> next month.
            </p>
            <p style={{fontSize: '14px', color: '#666'}}>
              Confidence Level: <strong>{prediction.confidence}</strong>
            </p>
          </div>
        ) : (
          <div className="alert alert-info">
            {prediction?.message || 'Need more data to make predictions. Keep tracking your expenses!'}
          </div>
        )}
      </div>

      <div className="card">
        <h2>💡 Smart Recommendations</h2>
        <div className="insight-item">
          <h4>Budget Tip</h4>
          <p>Consider setting a monthly budget of <strong>${(insights?.total_current_month * 0.9)?.toFixed(2) || '0'}</strong> to reduce spending by 10%.</p>
        </div>
        <div className="insight-item">
          <h4>Savings Opportunity</h4>
          <p>If you reduce your <strong>{topCategory}</strong> spending by 20%, you could save <strong>${(topAmount * 0.2)?.toFixed(2)}</strong> monthly!</p>
        </div>
      </div>
    </div>
  );
}

export default Insights;
