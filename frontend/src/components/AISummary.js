import React, { useEffect, useState } from 'react';
import { genAIAPI } from '../utils/api';

function AISummary() {
  const [summary, setSummary] = useState('🤖 Loading AI insights...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await genAIAPI.getSummary();
      setSummary(res.data.ai_summary || 'No AI insights available.');
    } catch (err) {
      setSummary('AI insights are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ai-summary">
      <h2>🤖 AI Monthly Summary</h2>
      <p style={{ whiteSpace: 'pre-line' }}>
        {loading ? 'Analyzing your expenses...' : summary}
      </p>
    </div>
  );
}

export default AISummary;
