cmake_minimum_required(VERSION 3.15)

project(NetworkSimulator LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Build options
option(BUILD_TESTS "Build unit tests" ON)

# Sources
set(SRC_FILES
    src/SimulationConfig.cpp
    src/SimulationState.cpp
    src/SimulationEvent.cpp
    src/EventRecorder.cpp
    src/MetricsCalculator.cpp
    src/TokenBucket.cpp
    src/LeakyBucket.cpp
    src/main.cpp
)

add_executable(simulator ${SRC_FILES})

target_include_directories(simulator PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src)

# nlohmann JSON single‑header library via FetchContent
include(FetchContent)
FetchContent_Declare(
    json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
)
FetchContent_MakeAvailable(json)

target_link_libraries(simulator PRIVATE nlohmann_json::nlohmann_json)

if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()
