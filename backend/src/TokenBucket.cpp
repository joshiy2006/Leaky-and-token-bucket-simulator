#include "TokenBucket.h"
#include "SimulationEvent.h"
#include <algorithm>
#include <string>

TokenBucket::TokenBucket(const SimulationConfig& cfg)
    : config_(cfg) {
    // Initialize state based on config
    state_.time_step = 0;
    state_.capacity = cfg.token_capacity;
    state_.tokens = cfg.initial_tokens;
    state_.arrivals = 0;
    state_.generated_tokens = 0;
    state_.sent = 0;
    state_.dropped = 0;
    state_.queued = 0; // not used for token bucket
}

// Helper to push an event after the state has been updated
void TokenBucket::recordEvent(const std::string& event_type,
                              const std::string& function_name,
                              const SimulationState& before,
                              const SimulationState& after,
                              const std::string& description,
                              const std::vector<std::string>& changed_vars) {
    SimulationEvent ev{};
    ev.event_id = static_cast<int>(events_.size());
    ev.time_step = before.time_step; // time step before change
    ev.algorithm = "token_bucket";
    ev.event_type = event_type;
    ev.function_name = function_name;
    ev.state_before = before;
    ev.state_after = after;
    ev.description = description;
    ev.changed_vars = changed_vars;
    events_.push_back(ev);
}

void TokenBucket::refillTokens() {
    SimulationState before = state_;
    int tokens_before = state_.tokens;
    state_.generated_tokens = config_.token_rate;
    int tokens_after = std::min(state_.capacity, tokens_before + state_.generated_tokens);
    int discarded = (tokens_before + state_.generated_tokens) - tokens_after;
    state_.tokens = tokens_after;
    // Record event
    recordEvent(
        "refill",
        "TokenBucket::refillTokens",
        before,
        state_,
        "Generate tokens and enforce bucket capacity",
        {"generated_tokens", "tokens", "discarded_tokens_due_to_capacity"}
    );
}

void TokenBucket::processArrivals() {
    SimulationState before = state_;
    if (state_.time_step < static_cast<int>(config_.arrivals.size())) {
        state_.arrivals = config_.arrivals[state_.time_step];
    } else {
        state_.arrivals = 0;
    }
    recordEvent(
        "arrival",
        "TokenBucket::processArrivals",
        before,
        state_,
        "Load arriving packets for this step",
        {"arrivals"}
    );
}

void TokenBucket::transmitPackets() {
    SimulationState before = state_;
    int sent = std::min(state_.arrivals, state_.tokens);
    state_.sent = sent;
    state_.tokens -= sent;
    int dropped = state_.arrivals - sent;
    state_.dropped = dropped;
    recordEvent(
        "transmit",
        "TokenBucket::transmitPackets",
        before,
        state_,
        "Transmit packets using available tokens and drop remainder",
        {"sent", "dropped", "tokens"}
    );
}

std::vector<SimulationEvent> TokenBucket::run() {
    for (state_.time_step = 0; state_.time_step < config_.steps; ++state_.time_step) {
        // Step 1: Refill tokens
        refillTokens();
        // Step 2: Process arrivals
        processArrivals();
        // Step 3: Transmit / drop packets
        transmitPackets();
        // Reset temporary per‑step fields for next iteration
        state_.generated_tokens = 0;
        state_.arrivals = 0;
        state_.sent = 0;
        state_.dropped = 0;
    }
    return events_; // Return the full trace
}
