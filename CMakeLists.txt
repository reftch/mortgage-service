cmake_minimum_required(VERSION 3.10)
project(mortgage-service)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT APPLE)
    # set(BUILD_SHARED_LIBS OFF)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -static")
endif()

file(GLOB SOURCES "src/*.cc")

# find_package(OpenSSL REQUIRED)
add_executable(mortgage-service ${SOURCES})

include(FetchContent)
FetchContent_Declare(
    http-server
    GIT_REPOSITORY https://github.com/reftch/http-server-cpp.git
    GIT_TAG        v0.2.12
)

# Repo has a flag to disable examples & tests, set it:
set(BUILD_EXAMPLES OFF CACHE INTERNAL "")
set(BUILD_TEST OFF CACHE INTERNAL "")

FetchContent_MakeAvailable(http-server)

target_link_libraries(mortgage-service 
  PRIVATE
    http-server
)

# copy assests
file(COPY assets DESTINATION ${CMAKE_BINARY_DIR})
