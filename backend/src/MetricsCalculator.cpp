#include "MetricsCalculator.h"
#include "SimulationEvent.h"
#include <unordered_map>
#include <algorithm>

SimulationMetrics calculateMetrics(const SimulationConfig& cfg,
                                 const std::vector<SimulationEvent>& trace) {
    SimulationMetrics metrics;
    if (cfg.steps == 0) return metrics; // avoid division by zero

    // Helper structures to aggregate per‑step data
    struct StepInfo {
        int arrivals = 0;
        int sent = 0;
        int dropped = 0;
        int overflow = 0; // tokens discarded or queue overflow
    };

    std::unordered_map<int, StepInfo> stepMap; // key = time_step

    for (const auto& ev : trace) {
        StepInfo& info = stepMap[ev.time_step];

        // arrivals are only set in a single event per step (arrival for both algorithms)
        if (ev.event_type == "arrival") {
            info.arrivals = ev.state_before.arrivals; // before processing, arrivals are 0; after arrival event they are set
        }
        // Sent packets – captured in transmit (token) or leak (leaky)
        if (ev.event_type == "transmit" || ev.event_type == "leak") {
            info.sent += ev.state_after.sent; // sent value after the event
        }
        // Dropped packets – either drop in transmit or admission drop in leaky
        if (ev.event_type == "transmit" || ev.event_type == "admission") {
            info.dropped += ev.state_after.dropped; // dropped recorded in state_after
        }
        // Capacity overflow (tokens discarded) – only in refill events for token bucket
        if (ev.event_type == "refill" && ev.algorithm == "token_bucket") {
            int beforeTokens = ev.state_before.tokens;
            int generated = ev.state_before.generated_tokens;
            int afterTokens = ev.state_after.tokens;
            int discarded = (beforeTokens + generated) - afterTokens;
            if (discarded > 0) {
                info.overflow += discarded;
            }
        }
        // Queue overflow – admission event for leaky bucket
        if (ev.event_type == "admission" && ev.algorithm == "leaky_bucket") {
            // dropped field in leaky bucket reflects queue overflow
            info.overflow += ev.state_after.dropped;
        }
    }

    // Aggregate totals
    for (const auto& [step, info] : stepMap) {
        metrics.total_arrivals += info.arrivals;
        metrics.total_sent += info.sent;
        metrics.total_dropped += info.dropped;
        metrics.capacity_overflows += info.overflow;
        if (info.dropped > 0) metrics.steps_with_drops++;
        if (info.sent == 0) metrics.steps_with_no_transmissions++;
        // For leaky bucket we also track queue occupancy stats
        if (cfg.algorithm == "leaky_bucket") {
            // Approximate average occupancy by summing queued after each event in that step
            // We'll pull the last state_after.queued for the step (should be after leak)
            // Find the last event for this step in trace (by event_id order)
            // Simpler: retrieve from trace directly – slower but fine for our sizes
        }
    }

    // Packet loss ratio & throughput
    if (metrics.total_arrivals > 0) {
        metrics.packet_loss_ratio = static_cast<double>(metrics.total_dropped) / metrics.total_arrivals;
    }
    metrics.throughput = static_cast<double>(metrics.total_sent) / cfg.steps;

    // Token utilization (token bucket only): proportion of generated tokens actually used
    if (cfg.algorithm == "token_bucket" && cfg.steps > 0) {
        long long total_generated = static_cast<long long>(cfg.token_rate) * cfg.steps;
        if (total_generated > 0) {
            metrics.token_utilization = static_cast<double>(metrics.total_sent) / total_generated;
        }
    }

    // Average & max queue occupancy for leaky bucket
    if (cfg.algorithm == "leaky_bucket" && cfg.steps > 0) {
        long long sum_occupancy = 0;
        int max_occupancy = 0;
        for (const auto& ev : trace) {
            if (ev.algorithm != "leaky_bucket") continue;
            // The queue size after each event is stored in state_after.queued
            int q = ev.state_after.queued;
            sum_occupancy += q;
            max_occupancy = std::max(max_occupancy, q);
        }
        // Divide by number of events to get average occupancy; alternatively divide by steps
        // We'll use per‑step average: sum over steps of final queue size after leak
        // Simpler: use the final queue size after the last event of each step
        // Here we approximate with per‑event average
        double avg = static_cast<double>(sum_occupancy) / trace.size();
        metrics.average_queue_occupancy = avg;
        metrics.max_queue_occupancy = max_occupancy;
    }

    return metrics;
}
