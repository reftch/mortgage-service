#include "server.h"

int main() {
    static auto& log = http::Logger::getInstance();

    auto host = getEnv<std::string>("HOST", "0.0.0.0");
    auto port = getEnv<int>("PORT", 8080);

    // Server instance
    http::Server s(host, port);
    // Register signal handler with capture
    static auto s_ptr = &s;
    signal(SIGINT, [](int) {
        s_ptr->stop();
    });

    s.setRoute<http::HttpMethod::GET>("/", [](const http::Request&, http::Response& res) {
        auto dev_mode = getEnv<bool>("DEV_MODE", false);
        res.setContent<http::ContentType::HTML>(dev_mode ? "index-dev.html" : "index.html");
    });

    s.start();

    return 0;
}