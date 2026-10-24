// src/pages/ExperimentHistory.tsx
import { useEffect, useState } from "react";
import { SimulationConfig, SimulationEvent, SimulationMetrics } from "../api";
import { Link, useNavigate } from "react-router-dom";

type HistoryEntry = {
  id: number;
  algorithm: string;
  config: SimulationConfig;
  result: { events: SimulationEvent[]; metrics: SimulationMetrics };
  timestamp: string;
};

export default function ExperimentHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("experimentHistory") || "[]");
    setHistory(stored);
  }, []);

  const deleteEntry = (id: number) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("experimentHistory", JSON.stringify(updated));
  };

  const reloadEntry = (entry: HistoryEntry) => {
    // Store selected entry in a temporary key for the Debugger to read
    localStorage.setItem("selectedRun", JSON.stringify(entry));
    navigate(entry.algorithm === "token_bucket" ? "/token" : "/leaky");
  };

  const exportEntry = (entry: HistoryEntry, format: "single" | "split") => {
    const dataSingle = JSON.stringify({ events: entry.result.events, metrics: entry.result.metrics }, null, 2);
    const blobSingle = new Blob([dataSingle], { type: "application/json" });
    const urlSingle = URL.createObjectURL(blobSingle);
    const aSingle = document.createElement("a");
    aSingle.href = urlSingle;
    aSingle.download = `simulation_${entry.id}.json`;
    aSingle.click();
    URL.revokeObjectURL(urlSingle);
    // Split format could be implemented similarly if needed
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Experiment History</h2>
      {history.length === 0 ? (
        <p>No experiments recorded yet.</p>
      ) : (
        <table className="min-w-full table-auto bg-white dark:bg-gray-800 shadow rounded">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Algorithm</th>
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => (
              <tr key={h.id} className="border-b border-gray-300 dark:border-gray-600">
                <td className="px-4 py-2">{h.id}</td>
                <td className="px-4 py-2 capitalize">{h.algorithm}</td>
                <td className="px-4 py-2">{new Date(h.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="bg-primary-500 text-white px-2 py-1 rounded"
                    onClick={() => reloadEntry(h)}
                  >
                    Reload
                  </button>
                  <button
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                    onClick={() => exportEntry(h, "single")}
                  >
                    Export
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 py-1 rounded"
                    onClick={() => deleteEntry(h.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/" className="mt-4 inline-block text-primary-500">← Back to Overview</Link>
    </div>
  );
}
