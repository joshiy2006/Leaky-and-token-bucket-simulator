#pragma once

#include "SimulationConfig.h"
#include "SimulationState.h"
#include "SimulationEvent.h"
#include <vector>

/**
 * @brief Implements the Token Bucket algorithm.
 *        Every public method records an event via the provided recorder.
 */
class TokenBucket {
public:
    TokenBucket(const SimulationConfig& cfg);

    /**
     * @brief Run the full simulation for the configured number of steps.
     *        Returns the ordered list of events.
     */
    std::vector<SimulationEvent> run();

private:
    const SimulationConfig& config_;   // immutable configuration
    SimulationState state_;            // mutable state during simulation
    std::vector<SimulationEvent> events_;

    // Helper functions that perform each step and record an event.
    void recordEvent(const std::string& event_type,
                     const std::string& function_name,
                     const std::string& description);
    void refillTokens();
    void processArrivals();
    void transmitPackets();
    void dropRemaining();
};
