#include "SimulationConfig.h"
#include <stdexcept>
#include <algorithm>

void SimulationConfig::validate() const {
    if (algorithm != "token_bucket" && algorithm != "leaky_bucket") {
        throw std::runtime_error("Invalid algorithm: must be 'token_bucket' or 'leaky_bucket'");
    }
    if (steps <= 0) {
        throw std::runtime_error("Number of steps must be positive");
    }
    if (arrivals.size() != static_cast<size_t>(steps)) {
        throw std::runtime_error("Arrivals vector size must equal number of steps");
    }
    for (int a : arrivals) {
        if (a < 0) throw std::runtime_error("Arrivals cannot be negative");
    }
    if (algorithm == "token_bucket") {
        if (token_capacity < 0) throw std::runtime_error("Token capacity cannot be negative");
        if (initial_tokens < 0) throw std::runtime_error("Initial tokens cannot be negative");
        if (initial_tokens > token_capacity) throw std::runtime_error("Initial tokens cannot exceed capacity");
        if (token_rate < 0) throw std::runtime_error("Token generation rate cannot be negative");
    } else { // leaky_bucket
        if (queue_capacity < 0) throw std::runtime_error("Queue capacity cannot be negative");
        if (initial_queue < 0) throw std::runtime_error("Initial queued packets cannot be negative");
        if (initial_queue > queue_capacity) throw std::runtime_error("Initial queued packets cannot exceed capacity");
        if (leak_rate < 0) throw std::runtime_error("Leak rate cannot be negative");
    }
}
