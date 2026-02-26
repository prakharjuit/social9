import { useEffect, useState, useMemo } from 'react';
import socialAccountsService from '../../services/social-accounts.service';
import aiService from '../../services/ai.service';

function SimpleLineChart({ values = [], height = 220, color = '#0ea5e9' }) {
  const points = useMemo(() => {
    const nums = (values || []).map(v => (typeof v === 'number' ? v : (v && v.value) || 0));
    if (!nums.length) return null;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const range = max - min || 1;
    const stepX = 100 / Math.max(1, nums.length - 1);
    const path = nums
      .map((n, i) => {
        const x = (i * stepX);
        const y = 100 - ((n - min) / range) * 100;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
    return { path, min, max, nums };
  }, [values]);

  if (!points) return <div className="text-sm text-gray-500">No chart data</div>;

  return (
    <div className="w-full" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={points.path} fill="none" stroke={color} strokeWidth="0.8" strokeLinejoin="round" strokeLinecap="round" />
        <path d={`${points.path} L 100,100 L 0,100 Z`} fill="url(#g)" opacity="0.9" />
      </svg>
    </div>
  );
}

export default function AnalyticsDrawer({ accountId, open, onClose }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');

  useEffect(() => {
    if (open && accountId) {
      loadInsights();
    }
  }, [open, accountId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await socialAccountsService.getAnalytics(accountId, { since, until });
      const data = res.insights || null;
      setInsights(data);
      if (data && data.data && data.data.length) {
        setSelectedMetric(prev => prev || data.data[0].name);
      }
    } catch (err) {
      console.error('Failed to load insights', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await loadInsights();
  };

  const handleAi = async () => {
    if (!insights) return;
    const metrics = {};
    (insights.data || []).forEach(m => {
      const values = (m.values || []).map(v => (typeof v === 'number' ? v : v.value));
      metrics[m.name] = values.length ? values[values.length - 1] : 0;
    });

    try {
      setAiLoading(true);
      const res = await aiService.getInsights(metrics);
      setAiResult(res.insights || 'No insights returned');
    } catch (err) {
      console.error('AI insights failed', err);
      setAiResult('Failed to generate AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  if (!open) return null;

  const metricList = (insights && insights.data) || [];
  const selectedObj = metricList.find(m => m.name === selectedMetric) || metricList[0];
  const chartValues = (selectedObj && (selectedObj.values || []).map(v => (typeof v === 'number' ? v : v.value))) || [];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black opacity-25 z-40" onClick={onClose} />
        <aside onClick={e => e.stopPropagation()} className="ml-auto w-full md:w-3/4 bg-white h-full shadow-xl p-6 overflow-auto z-50">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-800">Analytics</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-gray-600">Loading analytics...</div>
        ) : insights ? (
          <div className="mt-4">
            <div className="flex flex-col md:flex-row md:space-x-6">
              <div className="md:w-3/4 bg-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-3 space-y-3 md:space-y-0">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-700">{selectedObj ? selectedObj.name : 'Metric'}</h4>
                    <div className="text-sm text-gray-400">{(selectedObj && (selectedObj.values || []).length) || 0} points</div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input type="date" value={since} onChange={e=>setSince(e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <input type="date" value={until} onChange={e=>setUntil(e.target.value)} className="px-2 py-1 border rounded text-sm" />
                    <select
                      value={selectedMetric || ''}
                      onChange={e => setSelectedMetric(e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      {metricList.map(m => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                    <button onClick={handleSync} disabled={syncing} className="px-3 py-1 bg-white border rounded text-sm">
                      {syncing ? 'Syncing...' : 'Sync Metrics'}
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <SimpleLineChart values={chartValues} height={360} color="#0284c7" />
                </div>
              </div>

              <div className="md:w-1/4 mt-6 md:mt-0">
                <div className="space-y-3">
                  {(metricList || []).map(metric => {
                    const values = (metric.values || []).map(v => (typeof v === 'number' ? v : v.value));
                    const latest = values.length ? values[values.length - 1] : 0;
                    return (
                      <div key={metric.name} className="p-3 border rounded-lg bg-gray-50">
                        <div className="text-xs text-gray-500">{metric.name}</div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-lg font-semibold">{latest}</div>
                          <div className="text-sm text-gray-400">{values.length} pts</div>
                        </div>
                      </div>
                    );
                  })}

                  <div>
                    <button onClick={handleAi} disabled={aiLoading} className="w-full py-2 bg-blue-600 text-white rounded-lg">
                      {aiLoading ? 'Analyzing...' : 'AI Insights'}
                    </button>
                    {aiResult && (
                      <div className="mt-3 p-3 bg-white border rounded text-sm whitespace-pre-wrap text-gray-700">{aiResult}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-sm text-gray-600">No analytics available</div>
        )}
      </aside>
    </div>
  );
}
