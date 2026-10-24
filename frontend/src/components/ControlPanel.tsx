// src/components/ControlPanel.tsx
import { useState } from "react";

interface Props {
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  isRunning: boolean;
}

export default function ControlPanel({
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  isRunning,
}: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const buttonClass = (active: boolean) =>
    `p-2 rounded-full transition-colors duration-200 ${
      active ? "bg-primary-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
    } ${hovered === "play" && active ? "" : ""}`;

  return (
    <div className="flex items-center space-x-2 p-2">
      <button
        className={buttonClass(!isRunning)}
        onClick={onPlay}
        onMouseEnter={() => setHovered("play")}
        onMouseLeave={() => setHovered(null)}
        aria-label="Play"
      >
        ▶️
      </button>
      <button
        className={buttonClass(isRunning)}
        onClick={onPause}
        onMouseEnter={() => setHovered("pause")}
        onMouseLeave={() => setHovered(null)}
        aria-label="Pause"
      >
        ⏸️
      </button>
      <button
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        onClick={onStepBackward}
        aria-label="Step Backward"
      >
        ⏮️
      </button>
      <button
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        onClick={onStepForward}
        aria-label="Step Forward"
      >
        ⏭️
      </button>
    </div>
  );
}
