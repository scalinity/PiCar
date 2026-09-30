use crate::persistence::Repository;
use serde_json::Value;
use std::sync::Mutex;
use tauri::State;
pub struct Database(pub Mutex<Repository>);
fn main_window(window: &tauri::WebviewWindow) -> Result<(), String> {
    if window.label() == "main" {
        Ok(())
    } else {
        Err("PERMISSION_DENIED".into())
    }
}
#[tauri::command]
pub fn load_companion_state(
    window: tauri::WebviewWindow,
    database: State<Database>,
    id: String,
) -> Result<Value, String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .load(&id)
}
#[tauri::command]
pub fn list_companion_aggregates(
    window: tauri::WebviewWindow,
    database: State<Database>,
) -> Result<Value, String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .list()
}
#[tauri::command]
pub fn list_progress_imports(
    window: tauri::WebviewWindow,
    database: State<Database>,
) -> Result<Value, String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .imports()
}
#[tauri::command]
pub fn commit_session_command(
    window: tauri::WebviewWindow,
    database: State<Database>,
    raw: String,
) -> Result<Value, String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .commit(&raw)
}
#[tauri::command]
pub fn export_session(
    window: tauri::WebviewWindow,
    database: State<Database>,
) -> Result<Value, String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .export()
}
#[tauri::command]
pub fn recover_session(
    window: tauri::WebviewWindow,
    database: State<Database>,
    raw: String,
) -> Result<(), String> {
    main_window(&window)?;
    let mut current = database.0.lock().map_err(|_| "IO_FAILURE".to_owned())?;
    let dir = current.path.parent().ok_or("IO_FAILURE")?;
    let name = format!(
        "recovery-{:x}.sqlite3",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|_| "IO_FAILURE")?
            .as_nanos()
    );
    let path = dir.join(&name);
    std::fs::OpenOptions::new()
        .create_new(true)
        .write(true)
        .open(&path)
        .map_err(|e| e.to_string())?;
    let mut recovered = Repository::open(&path)?;
    recovered.restore(&raw)?;
    let marker = dir.join("active-recovery.pending");
    std::fs::write(&marker, &name).map_err(|e| e.to_string())?;
    std::fs::File::open(&marker)
        .and_then(|f| f.sync_all())
        .map_err(|e| e.to_string())?;
    std::fs::rename(marker, dir.join("active-recovery")).map_err(|e| e.to_string())?;
    std::fs::File::open(dir)
        .and_then(|f| f.sync_all())
        .map_err(|e| e.to_string())?;
    *current = recovered;
    Ok(())
}
#[tauri::command]
pub fn quarantine_legacy_raw(
    window: tauri::WebviewWindow,
    database: State<Database>,
    raw: String,
) -> Result<(), String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .quarantine(&raw)
}
#[cfg(feature = "m3-native-test")]
#[tauri::command]
pub fn m3_test_fresh(
    window: tauri::WebviewWindow,
    database: State<Database>,
) -> Result<(), String> {
    main_window(&window)?;
    let mut current = database.0.lock().map_err(|_| "IO_FAILURE".to_owned())?;
    let dir = current.path.parent().ok_or("IO_FAILURE")?;
    let name = format!(
        "fixture-{:x}.sqlite3",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|_| "IO_FAILURE")?
            .as_nanos()
    );
    *current = Repository::open(&dir.join(name))?;
    Ok(())
}
#[cfg(feature = "m3-native-test")]
#[tauri::command]
pub fn m3_test_fault(
    window: tauri::WebviewWindow,
    database: State<Database>,
    fault: String,
) -> Result<(), String> {
    main_window(&window)?;
    let mut current = database.0.lock().map_err(|_| "IO_FAILURE".to_owned())?;
    match fault.as_str(){
 "restart"=>{*current=Repository::open(&current.path.clone())?;return Ok(());},
 "rollback"=>current.connection.execute_batch("CREATE TRIGGER fail_event BEFORE INSERT ON events BEGIN SELECT RAISE(ABORT,'TEST_ROLLBACK'); END;"),
 "quota"=>current.connection.execute_batch("PRAGMA query_only=ON;"),
 "clear"=>current.connection.execute_batch("PRAGMA query_only=OFF; DROP TRIGGER IF EXISTS fail_event;"),
 "missingEvent"=>current.connection.execute_batch("DELETE FROM events;"),
 "snapshot"=>current.connection.execute_batch("UPDATE snapshots SET json='{}';"),
 "newer"=>current.connection.execute_batch("PRAGMA user_version=2;"),
 _=>return Err("TEST_FAULT_NOT_ALLOWED".into())
 }.map_err(|e|format!("IO_FAILURE: {e}"))?;
    Ok(())
}

#[tauri::command]
pub fn import_session(
    window: tauri::WebviewWindow,
    database: State<Database>,
    raw: String,
) -> Result<(), String> {
    main_window(&window)?;
    database
        .0
        .lock()
        .map_err(|_| "IO_FAILURE".to_owned())?
        .restore(&raw)
}
