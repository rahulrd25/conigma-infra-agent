'use client';
import { useState } from 'react';

export default function AuditPage() {
  const [resourceId, setResourceId] = useState('');
  const [resourceType, setResourceType] = useState('S3_BUCKET');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runAudit = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, resourceType }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      alert("Audit failed. Check if Temporal Worker is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Infra Security Agent</h1>
      
      <div className="space-y-4 border p-6 rounded-lg bg-gray-50">
        <div>
          <label className="block text-sm font-medium mb-1">Resource ID</label>
          <input 
            className="w-full p-2 border rounded text-black"
            placeholder="e.g. production-customer-data"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Resource Type</label>
          <select 
            className="w-full p-2 border rounded text-black"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
          >
            <option value="S3_BUCKET">S3 Bucket</option>
            <option value="EC2_INSTANCE">EC2 Instance</option>
          </select>
        </div>

        <button 
          onClick={runAudit}
          disabled={loading || !resourceId}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:bg-gray-400"
        >
          {loading ? 'Agent Investigating...' : 'Start Security Audit'}
        </button>
      </div>

      {result && (
        <div className="mt-10 p-6 border-2 border-green-500 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Audit Report</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {result.violationFound ? '⚠️ Violation Detected' : '✅ Clear'}</p>
            <p><strong>Severity:</strong> <span className="text-red-600 font-bold">{result.severity}</span></p>
            <p><strong>Remediation Plan:</strong></p>
            <pre className="bg-black text-green-400 p-3 rounded text-sm overflow-x-auto">
              {result.remediationPlan}
            </pre>
            <p className="text-xs text-gray-400 mt-4">Audit Timestamp: {result.timestamp}</p>
          </div>
        </div>
      )}
    </main>
  );
}