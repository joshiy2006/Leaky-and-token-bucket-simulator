#pragma once

#include "SimulationConfig.h"
#include "SimulationState.h"
#include "SimulationEvent.h"
#include <vector>

/**
 * @brief Implements the Leaky Bucket algorithm with event recording.
 */
class LeakyBucket {
public:
    LeakyBucket(const SimulationConfig& cfg);
    std::vector<SimulationEvent> run();

private:
    const SimulationConfig& config_;
    SimulationState state_;
    std::vector<SimulationEvent> events_;

    void recordEvent(const std::string& event_type,
                     const std::string& function_name,
                     const SimulationState& before,
                     const SimulationState& after,
                     const std::string& description,
                     const std::vector<std::string>& changed_vars);
    void receiveArrivals();
    void admitToQueue();
    void leakPackets();
};
