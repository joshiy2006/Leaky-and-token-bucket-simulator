// src/components/EventTimeline.tsx
import { SimulationEvent } from "../api";
import { useCallback } from "react";

interface Props {
  events: SimulationEvent[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function EventTimeline({ events, selectedIndex, onSelect }: Props) {
  const handleClick = useCallback(
    (i: number) => () => onSelect(i),
    [onSelect]
  );

  return (
    <div className="overflow-y-auto h-full max-h-96 border rounded bg-white dark:bg-gray-800 p-2">
      {events.map((e, i) => (
        <div
          key={i}
          className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${i === selectedIndex ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          onClick={handleClick(i)}
        >
          <div className="text-sm font-mono">#{i + 1}</div>
          <div className="text-xs">{e.description || e.type}</div>
        </div>
      ))}
    </div>
  );
}
