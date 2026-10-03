// AppKit exits native fullscreen on Escape before WebKit can apply Studio's dismissal order. Intercept only
// the active Studio's fullscreen main window, emitting one window-scoped press on release even if DOM focus disappeared.
use block2::RcBlock;
use objc2::{rc::Retained, runtime::AnyObject, MainThreadMarker};
use objc2_app_kit::{NSEvent, NSEventMask, NSEventType, NSWindowStyleMask};
use std::{cell::RefCell, sync::atomic::{AtomicBool, Ordering}};
use tauri::Emitter;

static ACTIVE: AtomicBool = AtomicBool::new(false);
thread_local! { static MONITOR: RefCell<Option<Retained<AnyObject>>> = const { RefCell::new(None) }; }

pub fn set_active(enabled: bool) { ACTIVE.store(enabled, Ordering::Relaxed); }

pub fn install(window: &tauri::WebviewWindow) -> Result<(), String> {
    let main_window = window.ns_window().map_err(|e| e.to_string())? as usize;
    let target = window.clone();
    let mtm = MainThreadMarker::new().ok_or("Studio Escape monitor requires the main thread")?;
    let handler = RcBlock::new(move |event: std::ptr::NonNull<NSEvent>| {
        // The local monitor supplies a live event on the main thread. Return that same event or null to consume it.
        let ev = unsafe { event.as_ref() };
        if ACTIVE.load(Ordering::Relaxed) && ev.keyCode() == 53 {
            if let Some(window) = ev.window(mtm) {
                if Retained::as_ptr(&window) as usize == main_window
                    && window.styleMask().contains(NSWindowStyleMask::FullScreen)
                {
                    if ev.r#type() == NSEventType::KeyUp {
                        if let Err(error) = target.emit("studio-escape", ()) {
                            eprintln!("Studio Escape delivery failed: {error}");
                            return event.as_ptr();
                        }
                    }
                    return std::ptr::null_mut();
                }
            }
        }
        event.as_ptr()
    });
    let monitor = unsafe { NSEvent::addLocalMonitorForEventsMatchingMask_handler(NSEventMask::KeyDown | NSEventMask::KeyUp, &handler) }
        .ok_or("Studio Escape monitor could not be installed")?;
    MONITOR.with(|slot| *slot.borrow_mut() = Some(monitor));
    Ok(())
}

pub fn remove() {
    ACTIVE.store(false, Ordering::Relaxed);
    MONITOR.with(|slot| {
        if let Some(monitor) = slot.borrow_mut().take() {
            // This token was returned by addLocalMonitor above, and is removed on the app's main-thread exit event.
            unsafe { NSEvent::removeMonitor(&monitor); }
        }
    });
}
