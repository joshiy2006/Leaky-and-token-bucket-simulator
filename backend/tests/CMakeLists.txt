# backend/tests/CMakeLists.txt
cmake_minimum_required(VERSION 3.14)

# Use Catch2 via FetchContent
include(FetchContent)
FetchContent_Declare(
  catch2
  GIT_REPOSITORY https://github.com/catchorg/Catch2.git
  GIT_TAG v3.5.0
)
FetchContent_MakeAvailable(catch2)

add_executable(unit_tests token_bucket_test.cpp leaky_bucket_test.cpp)

target_link_libraries(unit_tests PRIVATE Catch2::Catch2WithMain token_bucket leaky_bucket)

# Enable CTest integration
include(CTest)
add_test(NAME unit_tests COMMAND unit_tests)
