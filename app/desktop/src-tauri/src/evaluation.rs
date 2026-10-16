use tauri::Manager;
use std::io::Write;
fn token_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    if app.config().identifier != "app.ad-fontes.evaluation" { return Err("Evaluation edition required".into()); }
    let dir = app.path().app_data_dir().map_err(|_| "Application storage unavailable")?;
    std::fs::create_dir_all(&dir).map_err(|_| "Application storage unavailable")?;
    #[cfg(unix)] { use std::os::unix::fs::PermissionsExt; std::fs::set_permissions(&dir, std::fs::Permissions::from_mode(0o700)).map_err(|_| "Application storage unavailable")?; }
    Ok(dir.join("evaluation-update-session.json"))
}
#[tauri::command]
pub fn evaluation_update_session(app: tauri::AppHandle) -> Result<serde_json::Value,String> {
    let path=token_path(&app)?;
    if !path.exists() { return Ok(serde_json::Value::Null); }
    let bytes=std::fs::read(path).map_err(|_| "Update session unavailable")?;
    let value:serde_json::Value=serde_json::from_slice(&bytes).map_err(|_| "Update session unavailable")?;
    Ok(value)
}
#[tauri::command]
pub fn evaluation_disconnect(app: tauri::AppHandle) -> Result<(),String> {
    let path=token_path(&app)?; if path.exists(){std::fs::remove_file(path).map_err(|_| "Update session unavailable")?;} Ok(())
}
#[tauri::command]
pub async fn evaluation_pair(app: tauri::AppHandle, code: String) -> Result<(),String> {
    let path=token_path(&app)?;
    if code.len()!=43 || !code.bytes().all(|c|c.is_ascii_alphanumeric()||c==b'_'||c==b'-'){return Err("Invalid pairing code".into());}
    let _ = rustls::crypto::ring::default_provider().install_default();
    let client=reqwest::Client::builder().redirect(reqwest::redirect::Policy::none()).timeout(std::time::Duration::from_secs(30)).build().map_err(|_|"Pairing unavailable")?;
    let response=client.post("https://eval.ad-fontes.app/api/evaluation/pair").json(&serde_json::json!({"code":code})).send().await.map_err(|_|"Pairing service could not be reached")?;
    if !response.status().is_success(){return Err("Pairing expired or access is unavailable. Generate a fresh code on the website.".into());}
    let value:serde_json::Value=response.json().await.map_err(|_|"Invalid pairing response")?;
    let token=value["token"].as_str().ok_or("Invalid pairing response")?;
    if token.len()!=43 || !token.bytes().all(|c|c.is_ascii_alphanumeric()||c==b'_'||c==b'-') || value["expiresAt"].as_u64().is_none(){return Err("Invalid pairing response".into());}
    let mut options=std::fs::OpenOptions::new();options.create(true).truncate(true).write(true);
    #[cfg(unix)] {use std::os::unix::fs::OpenOptionsExt;options.mode(0o600);}
    let mut file=options.open(&path).map_err(|_|"Update session could not be saved")?;
    file.write_all(serde_json::to_string(&value).map_err(|_|"Invalid session")?.as_bytes()).map_err(|_|"Update session could not be saved")?;
    Ok(())
}
