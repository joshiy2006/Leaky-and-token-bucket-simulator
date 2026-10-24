#pragma once

#include "SimulationState.h"
#include <string>

/**
 * @brief Represents a single execution event that will be serialized to JSON.
 */
struct SimulationEvent {
    int event_id;                     // Sequential identifier (starting at 0)
    int time_step;                    // Time step this event belongs to
    std::string algorithm;            // "token_bucket" or "leaky_bucket"
    std::string event_type;           // e.g., "refill", "packet_processing", "leak"
    std::string function_name;        // Name of the C++ function that performed the action
    SimulationState state_before;     // Snapshot before the event
    SimulationState state_after;      // Snapshot after the event
    std::string description;          // Human‑readable description of the operation
    std::vector<std::string> changed_vars; // Names of variables that changed during the event
};
