// src/components/PacketViz.tsx
import { SimulationEvent } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Visual representation of the current simulation state.
 * Supports both Token Bucket (tokens) and Leaky Bucket (queue).
 * The component animates additions/removals of tokens/packets using Framer Motion.
 */
export default function PacketViz({ event }: { event: SimulationEvent }) {
  const { algorithm } = event;
  const [tokens, setTokens] = useState<number>(event.state_before.tokens);
  const [queued, setQueued] = useState<number>(event.state_before.queued);

  // Update visual state when the selected event changes.
  useEffect(() => {
    if (algorithm === 'token_bucket') {
      setTokens(event.state_after.tokens);
    } else {
      setQueued(event.state_after.queued);
    }
  }, [event, algorithm]);

  // For reduced‑motion users we simply render static counts.
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (algorithm === 'token_bucket') {
    const capacity = event.state_after.capacity || event.state_before.capacity;
    const tokenElements = [];
    for (let i = 0; i < capacity; i++) {
      const filled = i < tokens;
      tokenElements.push(
        <motion.div
          key={i}
          layout
          className={`w-6 h-6 rounded-full border border-primary-500 flex items-center justify-center ${
            filled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.3 }}
        >
          {filled && <span className="sr-only">Token</span>}
        </motion.div>
      );
    }
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-sm font-medium">Token Bucket (capacity: {capacity})</div>
        <div className="flex flex-wrap gap-1 justify-center max-w-xs">
          <AnimatePresence>{tokenElements}</AnimatePresence>
        </div>
      </div>
    );
  }

  // Leaky Bucket visualisation – a horizontal FIFO queue.
  const queueCapacity = event.state_after.capacity || event.state_before.capacity;
  const packetElements = [];
  for (let i = 0; i < queueCapacity; i++) {
    const occupied = i < queued;
    packetElements.push(
      <motion.div
        key={i}
        layout
        className={`w-8 h-8 border border-primary-500 flex items-center justify-center ${
          occupied ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
        }`}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        transition={{ duration: prefersReduced ? 0 : 0.3 }}
      >
        {occupied && <span className="sr-only">P</span>}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm font-medium">Leaky Bucket Queue (capacity: {queueCapacity})</div>
      <div className="flex gap-1 overflow-x-auto">
        <AnimatePresence>{packetElements}</AnimatePresence>
      </div>
    </div>
  );
}
