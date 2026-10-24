#pragma once

#include <vector>
#include <string>

/**
 * @brief Configuration parameters for the simulation. The same struct is used for both
 *        Token Bucket and Leaky Bucket; fields that are not applicable to a particular
 *        algorithm are ignored.
 */
struct SimulationConfig {
    // Common fields
    std::string algorithm;          // "token_bucket" or "leaky_bucket"
    int steps;                     // Number of simulation time steps
    std::vector<int> arrivals;     // Packets arriving at each time step (size == steps)

    // Token Bucket specific
    int token_capacity = 0;        // Maximum number of tokens the bucket can hold
    int initial_tokens = 0;        // Tokens present at step 0
    int token_rate = 0;            // Tokens generated per time step

    // Leaky Bucket specific
    int queue_capacity = 0;        // Maximum number of packets the queue can hold
    int initial_queue = 0;         // Packets already queued at step 0
    int leak_rate = 0;             // Packets transmitted per time step

    /**
     * @brief Validate the configuration.
     *        Throws a std::runtime_error with a descriptive message if any field is invalid.
     */
    void validate() const;
};
