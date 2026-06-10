#define CONNECTION_TIMEOUT_SECOND -1
#include "server.h"

int main() {
    static auto& log = http::Logger::getInstance();

    auto host = GetEnv<std::string>("HOST", "0.0.0.0");
    auto port = GetEnv<int>("PORT", 8080);

    // Server instance
    http::Server s(host, port);
    // Register signal handler with capture
    static auto s_ptr = &s;
    signal(SIGINT, [](int) {
        s_ptr->Stop();
    });

    s.SetRoute<http::HttpMethod::GET>("/", [](const http::Request&, http::Response& res) {
        auto dev_mode = GetEnv<bool>("DEV_MODE", false);
        res.SetContent<http::ContentType::HTML>(dev_mode ? "index-dev.html" : "index.html");
    });

    s.Start();

    return 0;
}