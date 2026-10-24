// src/components/CalculationPanel.tsx
import { SimulationMetrics } from "../api";

type Props = {
  metrics: SimulationMetrics | null;
};

export default function CalculationPanel({ metrics }: Props) {
  if (!metrics) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border">
        <p className="text-sm text-gray-500 dark:text-gray-400">No metrics available yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded border">
      <h3 className="text-lg font-medium mb-2">Simulation Metrics</h3>
      <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
}
