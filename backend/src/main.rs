use axum::{
    routing::get,
    Router,
    Json,
    extract::State,
};
use serde_json::{json, Value};
use std::net::SocketAddr;
use tokio::net::TcpListener;
use std::time::{SystemTime, UNIX_EPOCH};
use tower_http::cors::{CorsLayer, Any};
use std::sync::Arc;

struct AppState {
    greeting: String,
    password: String,
}

#[tokio::main]
async fn main() {
    // Read environment variables
    let greeting = std::env::var("GREETING").unwrap_or("Hello from Rust Backend!".to_string());
    let password = std::env::var("PASSWORD").unwrap_or("not_set".to_string());
    let state = Arc::new(AppState { greeting, password });

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec!["GET".parse().unwrap(), "POST".parse().unwrap()])
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/status", get(status))
        .route("/deploy", get(deploy_status))
        .route("/secret", get(secret))
        .with_state(state)
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

async fn root(State(state): State<Arc<AppState>>) -> String {
    state.greeting.clone()
}

async fn secret(State(state): State<Arc<AppState>>) -> Json<Value> {
    Json(json!({ "password": state.password }))
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

