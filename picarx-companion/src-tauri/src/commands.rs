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

#[tauri::command]
pub fn studio_copy_photo(window:tauri::WebviewWindow,database:State<Database>,session_id:String,observation_id:String,bytes:Vec<u8>)->Result<Value,String>{
 main_window(&window)?;let db=database.0.lock().map_err(|_|"IO_FAILURE")?;
 let stored=db.load(&session_id)?;if !stored["aggregate"]["snapshot"]["variantId"].as_str().is_some_and(|v|["rpi5","rpi-zero-2-w"].contains(&v)){return Err("UNKNOWN_SESSION".into());}
 crate::evidence::copy(db.path.parent().ok_or("EVIDENCE_PATH")?,&session_id,&observation_id,&bytes)
}
#[tauri::command]
pub fn studio_read_photo(window:tauri::WebviewWindow,database:State<Database>,session_id:String,observation_id:String)->Result<Vec<u8>,String>{
 main_window(&window)?;let db=database.0.lock().map_err(|_|"IO_FAILURE")?;let stored=db.load(&session_id)?;
 let record=stored["events"].as_array().ok_or("UNKNOWN_SESSION")?.iter().find(|e|e["action"]["kind"]=="observation"&&e["action"]["record"]["id"]==observation_id).ok_or("UNKNOWN_OBSERVATION")?;
 crate::evidence::verify(db.path.parent().ok_or("EVIDENCE_PATH")?,&record["action"]["record"])
}
#[tauri::command]
pub async fn studio_export_evidence(window:tauri::WebviewWindow,app:tauri::AppHandle,bytes:Vec<u8>)->Result<bool,String>{
 main_window(&window)?;if bytes.len()>100*1024*1024||!bytes.starts_with(b"PK\x03\x04"){return Err("EXPORT_SIZE_OR_FORMAT".into());}
 #[cfg(target_os="macos")]{
  let (send,receive)=std::sync::mpsc::channel();
  app.run_on_main_thread(move||{
   let result=(||{
    use objc2::MainThreadMarker;use objc2_app_kit::NSSavePanel;use objc2_foundation::NSString;use std::io::Write;
    let panel=NSSavePanel::savePanel(MainThreadMarker::new().ok_or("MAIN_THREAD_REQUIRED")?);
    panel.setNameFieldStringValue(&NSString::from_str("PiCar-private-evidence.zip"));
    if panel.runModal()!=1{return Ok(false);}
    let path=panel.URL().and_then(|u|u.path()).ok_or("EXPORT_DESTINATION")?.to_string();
    let mut file=std::fs::OpenOptions::new().write(true).create_new(true).open(&path).map_err(|e|format!("EXPORT_DESTINATION: {e}"))?;
    let result=file.write_all(&bytes).and_then(|_|file.sync_all());
    if let Err(error)=result{drop(file);let _=std::fs::remove_file(&path);return Err(format!("EXPORT_IO: {error}"));}Ok(true)
   })();let _=send.send(result);
  }).map_err(|e|e.to_string())?;
  receive.recv().map_err(|e|e.to_string())?
 }
 #[cfg(not(target_os="macos"))]{let _=(app,bytes);Err("EXPORT_PLATFORM_UNSUPPORTED".into())}
}
