// backend/tests/token_bucket_test.cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include "../src/TokenBucket.h"
#include "../src/SimulationConfig.h"
#include "../src/SimulationEvent.h"

TEST_CASE("TokenBucket basic behavior", "[TokenBucket]") {
    SimulationConfig cfg{};
    cfg.token_rate = 2; // tokens per second
    cfg.bucket_capacity = 5;
    cfg.arrival_rate = 1; // packets per second
    cfg.burst_size = 0;
    cfg.simulation_time = 5;
    cfg.queue_capacity = 0; // not used for token bucket

    TokenBucket tb(cfg);
    tb.run();
    const auto& events = tb.get_events();
    // Ensure there is at least one event per second
    REQUIRE(events.size() >= cfg.simulation_time);
    // Final token count should never exceed capacity
    int final_tokens = events.back().state_after.tokens;
    REQUIRE(final_tokens <= cfg.bucket_capacity);
    // No packets should be dropped in token bucket mode
    int total_dropped = 0;
    for (const auto& e : events) {
        total_dropped += e.state_after.dropped;
    }
    REQUIRE(total_dropped == 0);
}
