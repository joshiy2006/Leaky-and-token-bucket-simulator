#pragma once

#include "SimulationEvent.h"
#include "SimulationConfig.h"
#include <vector>

/**
 * @brief Summary metrics calculated after a run.
 */
struct SimulationMetrics {
    int total_arrivals = 0;
    int total_sent = 0;
    int total_dropped = 0;
    double packet_loss_ratio = 0.0;   // dropped / arrivals (0 if arrivals==0)
    double throughput = 0.0;          // sent / steps
    double token_utilization = 0.0;   // for token bucket only
    double average_queue_occupancy = 0.0; // for leaky bucket only
    int max_queue_occupancy = 0;      // for leaky bucket only
    int capacity_overflows = 0;       // tokens discarded or packets dropped due to full queue
    int steps_with_drops = 0;
    int steps_with_no_transmissions = 0;
};

/**
 * @brief Calculate summary metrics from a finished simulation.
 *        The function works for both algorithms; fields irrelevant to an algorithm will stay at their default value.
 */
SimulationMetrics calculateMetrics(const SimulationConfig& cfg,
                                 const std::vector<SimulationEvent>& trace);
