// src/components/VariableInspector.tsx
import { SimulationEvent } from "../api";

interface Props {
  event: SimulationEvent;
}

export default function VariableInspector({ event }: Props) {
  const { state_before, state_after } = event;
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded border">
      <h3 className="text-lg font-medium mb-2">Variable Inspector</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold">Before</h4>
          <pre className="whitespace-pre-wrap">{JSON.stringify(state_before, null, 2)}</pre>
        </div>
        <div>
          <h4 className="font-semibold">After</h4>
          <pre className="whitespace-pre-wrap">{JSON.stringify(state_after, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
