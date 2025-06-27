use axum::{
    routing::get,
    Router,
    Json,
};
use serde_json::{json, Value};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use std::time::{SystemTime, UNIX_EPOCH};
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec!["GET".parse().unwrap(), "POST".parse().unwrap()])
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(|| async { "Hello from Rust Backend!" }))
        .route("/health", get(health_check))
        .route("/status", get(status))
        .route("/deploy", get(deploy_status))
        .layer(cors);  // attach CORS middleware here

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    println!("Listening on {}", addr);
    axum::serve(
        TcpListener::bind(addr).await.unwrap(),
        app.into_make_service(),
    )
    .await
    .unwrap();
}



async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "timestamp": SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        "service": "rust-backend",
        "version": "1.0.0"
    }))
}

async fn status() -> Json<Value> {
    Json(json!({
        "backend": {
            "status": "running",
            "uptime": SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            "version": "1.0.0"
        },
        "frontend": {
            "status": "running",
            "version": "1.0.0"
        },
        "kubernetes": {
            "status": "deployed",
            "namespace": "default"
        }
    }))
}

async fn deploy_status() -> Json<Value> {
    Json(json!({
        "status": "deployed",
        "message": "Application successfully deployed to Kubernetes",
        "timestamp": SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        "pods": {
            "backend": "running",
            "frontend": "running"
        }
    }))
}

