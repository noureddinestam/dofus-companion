#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalPosition, Runtime, WebviewWindow,
};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;

const EDGE_MARGIN: i32 = 20;
const SETTINGS_STORE_FILE: &str = "settings.json";
const FIRST_RUN_KEY: &str = "hasCompletedFirstRun";

fn position_top_right<R: Runtime>(window: &WebviewWindow<R>) {
    let Some(monitor) = window.current_monitor().ok().flatten() else { return };
    let screen = monitor.size();
    let win = window.outer_size().unwrap_or_default();
    let x = (screen.width as i32) - (win.width as i32) - EDGE_MARGIN;
    let y = EDGE_MARGIN;
    let _ = window.set_position(PhysicalPosition::new(x.max(0), y));
}

/// Centre la fenêtre sur le moniteur courant. Utilisé au premier lancement pour
/// que le welcome overlay soit immédiatement lisible, avant que l'utilisateur
/// n'ait défini une position persistée via tauri-plugin-window-state.
fn center_on_monitor<R: Runtime>(window: &WebviewWindow<R>) {
    let Some(monitor) = window.current_monitor().ok().flatten() else { return };
    let screen = monitor.size();
    let win = window.outer_size().unwrap_or_default();
    let x = ((screen.width as i32) - (win.width as i32)) / 2;
    let y = ((screen.height as i32) - (win.height as i32)) / 2;
    let _ = window.set_position(PhysicalPosition::new(x.max(0), y.max(0)));
}

/// Lit `hasCompletedFirstRun` depuis le settings store. Si le fichier n'existe
/// pas encore, ou si la clé est absente, retourne `false` — les users frais
/// verront le welcome, les users v0.5.1 qui auto-update ont leur flag posé
/// côté JS au tout premier chargement via la heuristique localStorage.
fn is_first_run<R: Runtime>(app: &tauri::AppHandle<R>) -> bool {
    let store = match app.store(SETTINGS_STORE_FILE) {
        Ok(s) => s,
        Err(_) => return true,
    };
    match store.get(FIRST_RUN_KEY) {
        Some(serde_json::Value::Bool(true)) => false,
        _ => true,
    }
}

/// Toggle robuste — gère les cas minimisée, cachée, non-focalisée.
/// Sur Windows, après Ctrl+D (show desktop) ou Win+D, la fenêtre peut être
/// dans un état où is_visible() retourne true mais elle n'est plus au premier plan.
fn toggle_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    let Some(window) = app.get_webview_window("main") else { return };
    let visible = window.is_visible().unwrap_or(false);
    let minimized = window.is_minimized().unwrap_or(false);
    let focused = window.is_focused().unwrap_or(false);

    if visible && !minimized && focused {
        // Vraiment au premier plan → masquer
        let _ = window.hide();
    } else {
        // Hidden, minimized, ou au second plan → forcer l'affichage propre
        if minimized {
            let _ = window.unminimize();
        }
        let _ = window.show();
        // Re-applique always_on_top qui peut sauter après Win+D / Ctrl+D
        let _ = window.set_always_on_top(true);
        let _ = window.set_focus();
    }
}

fn reset_position<R: Runtime>(app: &tauri::AppHandle<R>) {
    let Some(window) = app.get_webview_window("main") else { return };
    let _ = window.unminimize();
    position_top_right(&window);
    let _ = window.show();
    let _ = window.set_always_on_top(true);
    let _ = window.set_focus();
}

/// Exposed to the frontend so the title-bar arrow button triggers the exact
/// same behavior as the tray's "Repositionner" menu item.
#[tauri::command]
fn reposition_top_right<R: Runtime>(app: tauri::AppHandle<R>) {
    reset_position(&app);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![reposition_top_right])
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let handle_shortcut = app.handle().clone();
            let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::KeyD);
            app.global_shortcut()
                .on_shortcut(shortcut, move |_app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        toggle_window(&handle_shortcut);
                    }
                })?;

            let handle_menu = app.handle().clone();
            let handle_click = app.handle().clone();

            let show_item =
                MenuItem::with_id(app, "show", "Afficher / Masquer", true, None::<&str>)?;
            let reset_item = MenuItem::with_id(
                app,
                "reset",
                "Repositionner (haut-droite)",
                true,
                None::<&str>,
            )?;
            let sep = tauri::menu::PredefinedMenuItem::separator(app)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quitter", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &reset_item, &sep, &quit_item])?;

            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("Dofus Companion · Alt+D")
                .show_menu_on_left_click(false)
                .on_menu_event(move |_app, event| match event.id.as_ref() {
                    "show" => toggle_window(&handle_menu),
                    "reset" => reset_position(&handle_menu),
                    "quit" => handle_menu.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(move |_tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_window(&handle_click);
                    }
                })
                .build(app)?;

            // Position top-right au premier démarrage (si window-state n'a rien restauré)
            if let Some(window) = app.get_webview_window("main") {
                let pos = window.outer_position().unwrap_or_default();
                if pos.x < 100 && pos.y < 100 {
                    position_top_right(&window);
                }

                // v0.5.5 : fond webview réellement transparent. Le `transparent: true`
                // dans tauri.conf.json rend la fenêtre native transparente mais pas
                // la surface de peinture de WKWebView / WebView2 — elle garde son
                // fond blanc par défaut, qu'on voyait apparaître dès que le slider
                // opacité rendait le thème semi-transparent. On force RGBA(0,0,0,0).
                let _ = window.set_background_color(Some(tauri::window::Color(0, 0, 0, 0)));
            }

            // v0.5.2 first-run : si aucun flag `hasCompletedFirstRun` n'a été
            // posé dans le store (ni par le user sur v0.5.2+, ni par la
            // heuristique de migration v0.5.1), on force l'affichage centré
            // de la fenêtre pour déclencher le WelcomeOverlay côté JS.
            if is_first_run(&app.handle()) {
                if let Some(window) = app.get_webview_window("main") {
                    center_on_monitor(&window);
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }

            #[cfg(debug_assertions)]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                }
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
