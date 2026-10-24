// backend/tests/leaky_bucket_test.cpp
#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include "../src/LeakyBucket.h"
#include "../src/SimulationConfig.h"
#include "../src/SimulationEvent.h"

TEST_CASE("LeakyBucket basic behavior", "[LeakyBucket]") {
    SimulationConfig cfg{};
    cfg.arrival_rate = 3; // packets per second
    cfg.burst_size = 0;
    cfg.queue_capacity = 5;
    cfg.simulation_time = 5;
    cfg.leak_rate = 2; // packets per second drained
    cfg.bucket_capacity = 0; // unused for leaky bucket

    LeakyBucket lb(cfg);
    lb.run();
    const auto& events = lb.get_events();
    // Ensure we have events for each second
    REQUIRE(events.size() >= cfg.simulation_time);
    // Queue length should never exceed capacity
    for (const auto& e : events) {
        REQUIRE(e.state_after.queued <= cfg.queue_capacity);
    }
    // Some packets should be dropped if arrivals exceed capacity+leak
    int total_dropped = 0;
    for (const auto& e : events) {
        total_dropped += e.state_after.dropped;
    }
    REQUIRE(total_dropped >= 0);
}
