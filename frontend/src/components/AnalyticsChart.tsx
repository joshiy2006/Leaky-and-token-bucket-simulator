// src/components/AnalyticsChart.tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { SimulationEvent } from '../api';

type Props = {
  events: SimulationEvent[];
  metric: 'tokens' | 'queued' | 'throughput';
};

export default function AnalyticsChart({ events, metric }: Props) {
  // Build chart data from events
  const data = events.map((e, idx) => {
    const value =
      metric === 'tokens'
        ? e.state_after.tokens ?? 0
        : metric === 'queued'
        ? e.state_after.queued ?? 0
        : e.metrics?.throughput ?? 0;
    return { step: idx + 1, value };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="step" label={{ value: 'Step', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: metric, angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
