#pragma once

#include <vector>
#include <string>
#include "SimulationConfig.h"

/**
 * @brief Represents the mutable state of the simulation at a given moment.
 *        It is recorded before and after each event.
 */
struct SimulationState {
    int time_step = 0;               // Current time step (0‑based)
    int tokens = 0;                  // Current token count (Token Bucket)
    int capacity = 0;                // Token or queue capacity, for convenience
    int queued = 0;                  // Number of packets waiting in Leaky Bucket queue
    int arrivals = 0;                // Packets arriving this step
    int generated_tokens = 0;        // Tokens generated this step (Token Bucket)
    int sent = 0;                    // Packets transmitted this event
    int dropped = 0;                 // Packets dropped this event
    // Additional fields can be added later without breaking existing JSON schema

    // Helper to create a copy for "before" snapshots
    SimulationState copy() const { return *this; }
};
