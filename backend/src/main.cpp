#include "SimulationConfig.h"
#include "TokenBucket.h"
#include "LeakyBucket.h"
#include "SimulationEvent.h"
#include "MetricsCalculator.h"
#include <nlohmann/json.hpp>
#include <iostream>
#include <stdexcept>
#include <vector>

using json = nlohmann::json;

json eventToJson(const SimulationEvent& ev) {
    return {
        {"event_id", ev.event_id},
        {"time_step", ev.time_step},
        {"algorithm", ev.algorithm},
        {"event_type", ev.event_type},
        {"function_name", ev.function_name},
        {"description", ev.description},
        {"changed_vars", ev.changed_vars},
        {"state_before", {
            {"time_step", ev.state_before.time_step},
            {"tokens", ev.state_before.tokens},
            {"capacity", ev.state_before.capacity},
            {"queued", ev.state_before.queued},
            {"arrivals", ev.state_before.arrivals},
            {"generated_tokens", ev.state_before.generated_tokens},
            {"sent", ev.state_before.sent},
            {"dropped", ev.state_before.dropped}
        }},
        {"state_after", {
            {"time_step", ev.state_after.time_step},
            {"tokens", ev.state_after.tokens},
            {"capacity", ev.state_after.capacity},
            {"queued", ev.state_after.queued},
            {"arrivals", ev.state_after.arrivals},
            {"generated_tokens", ev.state_after.generated_tokens},
            {"sent", ev.state_after.sent},
            {"dropped", ev.state_after.dropped}
        }}
    };
}

int main() {
    try {
        // Read full stdin
        std::string input((std::istreambuf_iterator<char>(std::cin)), std::istreambuf_iterator<char>());
        if (input.empty()) throw std::runtime_error("No input received on stdin");

        json j = json::parse(input);

        SimulationConfig cfg;
        cfg.algorithm = j.at("algorithm").get<std::string>();
        cfg.steps = j.at("steps").get<int>();
        cfg.arrivals = j.at("arrivals").get<std::vector<int>>();

        if (cfg.algorithm == "token_bucket") {
            cfg.token_capacity = j.at("token_capacity").get<int>();
            cfg.initial_tokens = j.at("initial_tokens").get<int>();
            cfg.token_rate = j.at("token_rate").get<int>();
        } else if (cfg.algorithm == "leaky_bucket") {
            cfg.queue_capacity = j.at("queue_capacity").get<int>();
            cfg.initial_queue = j.at("initial_queue").get<int>();
            cfg.leak_rate = j.at("leak_rate").get<int>();
        } else {
            throw std::runtime_error("Unsupported algorithm: " + cfg.algorithm);
        }

        cfg.validate();

        std::vector<SimulationEvent> trace;
        if (cfg.algorithm == "token_bucket") {
            TokenBucket tb(cfg);
            trace = tb.run();
        } else {
            LeakyBucket lb(cfg);
            trace = lb.run();
        }

        // Compute summary metrics
        SimulationMetrics metrics = calculateMetrics(cfg, trace);

        // Build output JSON
        json out;
        out["trace"] = json::array();
        for (const auto& ev : trace) out["trace"].push_back(eventToJson(ev));
        out["metrics"] = {
            {"total_arrivals", metrics.total_arrivals},
            {"total_sent", metrics.total_sent},
            {"total_dropped", metrics.total_dropped},
            {"packet_loss_ratio", metrics.packet_loss_ratio},
            {"throughput", metrics.throughput},
            {"token_utilization", metrics.token_utilization},
            {"average_queue_occupancy", metrics.average_queue_occupancy},
            {"max_queue_occupancy", metrics.max_queue_occupancy},
            {"capacity_overflows", metrics.capacity_overflows},
            {"steps_with_drops", metrics.steps_with_drops},
            {"steps_with_no_transmissions", metrics.steps_with_no_transmissions}
        };

        std::cout << out.dump(2) << std::endl;
        return 0;
    } catch (const std::exception& ex) {
        json err = { {"error", ex.what()} };
        std::cerr << err.dump() << std::endl;
        return 1;
    }
}
