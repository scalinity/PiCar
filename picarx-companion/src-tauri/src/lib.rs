#[cfg(feature = "m3-persistence")]
mod commands;
#[cfg(feature = "m3-persistence")]
pub mod persistence;
#[cfg(feature = "m3-persistence")]
mod strict_json;
use tauri::{Manager, PhysicalPosition, PhysicalSize};

/// The configured window size can exceed a display's usable area, and centring a window larger than the screen leaves it
/// partly off-screen. Keep the configured size where it fits, otherwise fit it to the monitor's work area (outside the menu
/// bar and Dock), and centre it there. Placement never stops the app from starting.
fn fit_main_window(app: &tauri::App) {
    let place = || -> tauri::Result<()> {
        let Some(window) = app.get_webview_window("main") else { return Ok(()) };
        let Some(monitor) = window.current_monitor()?.or(window.primary_monitor()?) else { return Ok(()) };
        let (area, scale) = (*monitor.work_area(), monitor.scale_factor());
        let (width, height) = app.config().app.windows.first().map_or((1440.0, 900.0), |w| (w.width, w.height));
        let fit = |logical: f64, available: u32| ((logical * scale).round() as u32).min(available * 96 / 100);
        // Centre from the size set here: AppKit applies a resize after this call returns, so reading the window's size
        // back would still give the configured one. The overlay title bar keeps the outer and inner sizes equal.
        let size = PhysicalSize::new(fit(width, area.size.width), fit(height, area.size.height));
        window.set_size(size)?;
        let x = area.position.x + (area.size.width.saturating_sub(size.width) / 2) as i32;
        let y = area.position.y + (area.size.height.saturating_sub(size.height) / 2) as i32;
        window.set_position(PhysicalPosition::new(x, y))
    };
    if let Err(error) = place() {
        eprintln!("window placement skipped: {error}");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_opener::init());
    #[cfg(feature = "m3-native-test")]
    let builder = builder
        .plugin(tauri_plugin_wdio::init())
        .plugin(tauri_plugin_wdio_webdriver::init());
    #[cfg(not(feature = "m3-persistence"))]
    let builder = builder.setup(|app| {
        fit_main_window(app);
        Ok(())
    });
    #[cfg(feature = "m3-persistence")]
    let builder = builder.setup(|app| {
        fit_main_window(app);
        #[cfg(not(feature = "m3-native-test"))]
        let dir = app.path().app_data_dir()?;
        #[cfg(feature = "m3-native-test")]
        let dir = {
            if !app.config().app.windows.iter().all(|w| w.incognito) {
                return Err(std::io::Error::other("PRIVATE_TEST_WEBVIEW_REQUIRED").into());
            }
            let raw = std::env::var_os("PICAR_M3_TEST_DATA_DIR")
                .ok_or_else(|| std::io::Error::other("ISOLATED_TEST_DATA_REQUIRED"))?;
            let path = std::path::PathBuf::from(raw).canonicalize()?;
            let temp = std::env::temp_dir().canonicalize()?;
            if !path.starts_with(temp)
                || !path
                    .file_name()
                    .is_some_and(|n| n.to_string_lossy().starts_with("picar-m3-native-"))
            {
                return Err(std::io::Error::other("ISOLATED_TEST_DATA_REQUIRED").into());
            }
            path
        };
        std::fs::create_dir_all(&dir)?;
        let active = if dir.join("active-recovery").exists() {
            let name = std::fs::read_to_string(dir.join("active-recovery"))?;
            if !name.starts_with("recovery-")
                || !name.ends_with(".sqlite3")
                || !name
                    .bytes()
                    .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'.')
            {
                return Err(std::io::Error::other("RECOVERY_MARKER_INVALID").into());
            }
            dir.join(name)
        } else {
            dir.join("sessions.sqlite3")
        };
        let repository = persistence::Repository::open(&active).map_err(std::io::Error::other)?;
        app.manage(commands::Database(std::sync::Mutex::new(repository)));
        Ok(())
    });
    #[cfg(all(feature = "m3-persistence", not(feature = "m3-native-test")))]
    let builder = builder.invoke_handler(tauri::generate_handler![
        commands::load_companion_state,
        commands::list_companion_aggregates,
        commands::list_progress_imports,
        commands::commit_session_command,
        commands::export_session,
        commands::import_session,
        commands::recover_session,
        commands::quarantine_legacy_raw
    ]);
    #[cfg(feature = "m3-native-test")]
    let builder = builder.invoke_handler(tauri::generate_handler![
        commands::load_companion_state,
        commands::list_companion_aggregates,
        commands::list_progress_imports,
        commands::commit_session_command,
        commands::export_session,
        commands::import_session,
        commands::recover_session,
        commands::quarantine_legacy_raw,
        commands::m3_test_fresh,
        commands::m3_test_fault
    ]);
    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
#[cfg(all(feature = "m3-native-test", not(debug_assertions)))]
compile_error!("m3-native-test is restricted to disposable debug test targets");
