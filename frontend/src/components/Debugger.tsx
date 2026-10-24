// src/components/Debugger.tsx
import { useEffect, useState } from "react";
import { runSimulation, SimulationEvent, SimulationMetrics, SimulationConfig } from "../api";
import ControlPanel from "./ControlPanel";
import EventTimeline from "./EventTimeline";
import VariableInspector from "./VariableInspector";
import CalculationPanel from "./CalculationPanel";
import PacketViz from "./PacketViz";
import AnalyticsChart from "./AnalyticsChart";

type Props = {
  algorithm: "token_bucket" | "leaky_bucket";
};

type StoredRun = {
  id: number;
  algorithm: string;
  config: SimulationConfig;
  result: { events: SimulationEvent[]; metrics: SimulationMetrics };
  timestamp: string;
};

export default function Debugger({ algorithm }: Props) {
  const defaultConfig: SimulationConfig = {
    arrival_rate: 5,
    burst_size: 10,
    token_rate: 2,
    bucket_capacity: 20,
    simulation_time: 30,
    queue_capacity: 15,
  };

  const [config, setConfig] = useState<SimulationConfig>(defaultConfig);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);

  const loadFromStoredRun = (run: StoredRun) => {
    setConfig(run.config);
    setEvents(run.result.events);
    setMetrics(run.result.metrics);
    setSelectedIdx(0);
  };

  const loadSimulation = async () => {
    setRunning(true);
    // Check if a stored run was selected from history
    const stored = localStorage.getItem("selectedRun");
    if (stored) {
      try {
        const parsed: StoredRun = JSON.parse(stored);
        loadFromStoredRun(parsed);
        localStorage.removeItem("selectedRun");
        setRunning(false);
        return;
      } catch (e) {
        console.error("Failed to parse selectedRun", e);
        localStorage.removeItem("selectedRun");
      }
    }

    const result = await runSimulation(algorithm, config);
    setEvents(result.events);
    setMetrics(result.metrics);
    // Persist to history
    const history = JSON.parse(localStorage.getItem("experimentHistory") || "[]");
    history.unshift({
      id: Date.now(),
      algorithm,
      config,
      result,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("experimentHistory", JSON.stringify(history.slice(0, 20)));
    setSelectedIdx(0);
    setRunning(false);
  };

  const stepForward = () => setSelectedIdx((i) => Math.min(i + 1, events.length - 1));
  const stepBackward = () => setSelectedIdx((i) => Math.max(i - 1, 0));

  useEffect(() => {
    // Auto‑load a simulation on mount
    loadSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentEvent = events[selectedIdx];

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="flex flex-col space-y-4">
        <ControlPanel
          onPlay={loadSimulation}
          onPause={() => setRunning(false)}
          onStepForward={stepForward}
          onStepBackward={stepBackward}
          isRunning={running}
        />
        {currentEvent && <PacketViz event={currentEvent} />}
        {metrics && <CalculationPanel metrics={metrics} />}
        <AnalyticsChart events={events} metric="tokens" />
      </div>
      <div className="flex flex-col space-y-4 overflow-auto max-h-screen">
        <EventTimeline events={events} selectedIndex={selectedIdx} onSelect={setSelectedIdx} />
        {currentEvent && <VariableInspector event={currentEvent} />}
      </div>
    </div>
  );
}
