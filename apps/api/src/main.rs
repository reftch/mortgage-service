use r_server::server::http::Server;

fn main() -> std::io::Result<()> {
    Server::new("0.0.0.0:8082")?.run()?;
    Ok(())
}
