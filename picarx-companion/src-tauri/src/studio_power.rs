// Read-only macOS power policy input. No battery level, identifiers or history is collected.
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PowerState {
    source: &'static str,
    low_power: bool,
    thermal: &'static str,
}

#[tauri::command]
pub fn studio_power_state(window: tauri::WebviewWindow) -> Result<PowerState, String> {
    if window.label() != "main" { return Err("PERMISSION_DENIED".into()); }
    #[cfg(target_os = "macos")]
    {
        use std::ffi::{c_char, c_void, CStr};
        use objc2_foundation::NSProcessInfo;
        #[link(name = "IOKit", kind = "framework")]
        extern "C" {
            fn IOPSCopyPowerSourcesInfo() -> *const c_void;
            fn IOPSGetProvidingPowerSourceType(snapshot: *const c_void) -> *const c_void;
        }
        #[link(name = "CoreFoundation", kind = "framework")]
        extern "C" {
            fn CFStringGetCString(string: *const c_void, buffer: *mut c_char, size: isize, encoding: u32) -> bool;
            fn CFRelease(value: *const c_void);
        }
        let source = unsafe {
            let snapshot = IOPSCopyPowerSourcesInfo();
            if snapshot.is_null() { return Err("POWER_STATE_UNAVAILABLE".into()); }
            let kind = IOPSGetProvidingPowerSourceType(snapshot);
            let mut buffer = [0 as c_char; 64];
            let value = if !kind.is_null() && CFStringGetCString(kind, buffer.as_mut_ptr(), buffer.len() as isize, 0x08000100) {
                match CStr::from_ptr(buffer.as_ptr()).to_bytes() {
                    b"AC Power" => "ac", b"Battery Power" => "battery", _ => "unknown",
                }
            } else { "unknown" };
            CFRelease(snapshot);
            value
        };
        let process = NSProcessInfo::processInfo();
        let thermal = match process.thermalState().0 {
            0 => "nominal", 1 => "fair", 2 => "serious", 3 => "critical", _ => "unknown",
        };
        Ok(PowerState { source, low_power: process.isLowPowerModeEnabled(), thermal })
    }
    #[cfg(not(target_os = "macos"))]
    Err("POWER_STATE_UNAVAILABLE".into())
}
