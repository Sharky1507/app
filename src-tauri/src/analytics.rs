use std::fmt::Display;

use log::warn;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::types::JsonValue;
use tauri::{AppHandle, Manager};

use crate::is_dev;
use crate::models::{
    generate_id, get_key_value_int, get_key_value_string, set_key_value_int, set_key_value_string,
};

const NAMESPACE: &str = "analytics";
const NUM_LAUNCHES_KEY: &str = "num_launches";

// serializable
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
pub enum AnalyticsResource {
    App,
    CookieJar,
    Dialog,
    Environment,
    Folder,
    GrpcConnection,
    GrpcEvent,
    GrpcRequest,
    HttpRequest,
    HttpResponse,
    KeyValue,
    Sidebar,
    Workspace,
    Setting,
}

impl AnalyticsResource {
    pub fn from_str(s: &str) -> serde_json::Result<AnalyticsResource> {
        return serde_json::from_str(format!("\"{s}\"").as_str());
    }
}

impl Display for AnalyticsResource {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            serde_json::to_string(self).unwrap().replace("\"", "")
        )
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
pub enum AnalyticsAction {
    Cancel,
    Commit,
    Create,
    Delete,
    DeleteMany,
    Duplicate,
    Export,
    Hide,
    Import,
    Launch,
    LaunchFirst,
    LaunchUpdate,
    Send,
    Show,
    Toggle,
    Update,
    Upsert,
}

impl AnalyticsAction {
    pub fn from_str(s: &str) -> serde_json::Result<AnalyticsAction> {
        return serde_json::from_str(format!("\"{s}\"").as_str());
    }
}

impl Display for AnalyticsAction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}",
            serde_json::to_string(self).unwrap().replace("\"", "")
        )
    }
}

#[derive(Default, Debug)]
pub struct LaunchEventInfo {
    pub current_version: String,
    pub previous_version: String,
    pub launched_after_update: bool,
    pub num_launches: i32,
}

pub async fn track_launch_event(app: &AppHandle) -> LaunchEventInfo {
    let last_tracked_version_key = "last_tracked_version";

    let mut info = LaunchEventInfo::default();

    info.num_launches = get_num_launches(app).await + 1;
    info.previous_version =
        get_key_value_string(app, NAMESPACE, last_tracked_version_key, "").await;
    info.current_version = app.package_info().version.to_string();

    if info.previous_version.is_empty() {
        track_event(
            app,
            AnalyticsResource::App,
            AnalyticsAction::LaunchFirst,
            None,
        )
        .await;
    } else {
        info.launched_after_update = info.current_version != info.previous_version;
        if info.launched_after_update {
            track_event(
                app,
                AnalyticsResource::App,
                AnalyticsAction::LaunchUpdate,
                Some(json!({ NUM_LAUNCHES_KEY: info.num_launches })),
            )
            .await;
        }
    };

    // Track a launch event in all cases
    track_event(
        app,
        AnalyticsResource::App,
        AnalyticsAction::Launch,
        Some(json!({ NUM_LAUNCHES_KEY: info.num_launches })),
    )
    .await;

    // Update key values

    set_key_value_string(
        app,
        NAMESPACE,
        last_tracked_version_key,
        info.current_version.as_str(),
    )
    .await;
    set_key_value_int(app, NAMESPACE, NUM_LAUNCHES_KEY, info.num_launches).await;

    info
}

pub async fn track_event(
    app_handle: &AppHandle,
    resource: AnalyticsResource,
    action: AnalyticsAction,
    attributes: Option<JsonValue>,
) {
    let id = get_id(app_handle).await;
    let event = format!("{}.{}", resource, action);
    let attributes_json = attributes.unwrap_or("{}".to_string().into()).to_string();
    let info = app_handle.package_info();
    let tz = datetime::sys_timezone().unwrap_or("unknown".to_string());
    let site = match is_dev() {
        true => "site_TkHWjoXwZPq3HfhERb",
        false => "site_zOK0d7jeBy2TLxFCnZ",
    };
    let base_url = match is_dev() {
        true => "http://localhost:7194",
        false => "https://t.yaak.app",
    };
    let params = vec![
        ("u", id),
        ("e", event.clone()),
        ("a", attributes_json.clone()),
        ("id", site.to_string()),
        ("v", info.version.clone().to_string()),
        ("os", get_os().to_string()),
        ("tz", tz),
        ("xy", get_window_size(app_handle)),
    ];
    let req = reqwest::Client::builder()
        .build()
        .unwrap()
        .get(format!("{base_url}/t/e"))
        .query(&params);

    // Disable analytics actual sending in dev
    if is_dev() {
        // debug!("track: {} {} {:?}", event, attributes_json, params);
        return;
    }

    if let Err(e) = req.send().await {
        warn!(
            "Error sending analytics event: {} {} {} {:?}",
            e, event, attributes_json, params,
        );
    }
}

fn get_os() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows"
    } else if cfg!(target_os = "macos") {
        "macos"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else {
        "unknown"
    }
}

fn get_window_size(app_handle: &AppHandle) -> String {
    let window = match app_handle.webview_windows().into_values().next() {
        Some(w) => w,
        None => return "unknown".to_string(),
    };

    let current_monitor = match window.current_monitor() {
        Ok(Some(m)) => m,
        _ => return "unknown".to_string(),
    };

    let scale_factor = current_monitor.scale_factor();
    let size = current_monitor.size();
    let width: f64 = size.width as f64 / scale_factor;
    let height: f64 = size.height as f64 / scale_factor;

    format!(
        "{}x{}",
        (width / 100.0).round() * 100.0,
        (height / 100.0).round() * 100.0
    )
}

async fn get_id(app_handle: &AppHandle) -> String {
    let id = get_key_value_string(app_handle, "analytics", "id", "").await;
    if id.is_empty() {
        let new_id = generate_id();
        set_key_value_string(app_handle, "analytics", "id", new_id.as_str()).await;
        new_id
    } else {
        id
    }
}

pub async fn get_num_launches(app: &AppHandle) -> i32 {
    get_key_value_int(app, NAMESPACE, NUM_LAUNCHES_KEY, 0).await
}