import { useEffect, useRef } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useI18n } from '../i18n/useI18n';
import { useSettings } from '../features/settings/useSettings';
import type { Density, Theme } from '../features/settings/schema';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  /** App version shown in the About section. Passed in to avoid yet another
   *  import.meta.env lookup from inside this component. */
  appVersion: string;
}

const APP_CHANGELOG_URL = 'https://github.com/noureddinestam/dofus-companion/blob/main/CHANGELOG.md';
const APP_WEBSITE_URL = 'https://dofuscompanion.com';
const APP_CREDITS_URL = 'https://dofuscompanion.com/#credits';

function isTabbable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.hasAttribute('disabled')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const tabIndex = el.tabIndex;
  if (tabIndex < 0) return false;
  return true;
}

/**
 * Slide-in settings panel (60 % of the overlay width) anchored to the right.
 * Closes on Escape, on click outside, and via the close cross. Focus trap is
 * a small pure-React helper — no dependency on Radix or similar.
 */
export function SettingsPanel({ open, onClose, appVersion }: SettingsPanelProps) {
  const { t } = useI18n();
  const {
    settings,
    updateAppearance,
    updateContentDisplay,
    updateMonstersDisplay,
    updateNotifications,
  } = useSettings();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management: save + restore, initial focus on the close button.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const closeBtn = panelRef.current?.querySelector<HTMLButtonElement>('.settings-panel__close');
    closeBtn?.focus();
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  // Keyboard: Escape to close, Tab/Shift+Tab wrap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const tabbables = Array.from(panel.querySelectorAll<HTMLElement>('*')).filter(isTabbable);
      if (tabbables.length === 0) return;
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const tp = t.settings.panel;

  return (
    <div
      className="settings-panel-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-panel-title"
        className="settings-panel"
      >
        <header className="settings-panel__header">
          <h2 id="settings-panel-title" className="settings-panel__title">
            {tp.title}
          </h2>
          <button
            type="button"
            className="settings-panel__close"
            aria-label={tp.closeAria}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="settings-panel__body">
          {settings && (
            <>
              <section className="settings-panel__section">
                <h3 className="settings-panel__section-title">{tp.sectionAppearance}</h3>

                <label className="settings-panel__control">
                  <span>{tp.langLabel}</span>
                  <select
                    value={settings.appearance.lang}
                    onChange={(e) => {
                      void updateAppearance({ lang: e.target.value as 'fr' | 'en' });
                    }}
                  >
                    <option value="fr">{tp.langFr}</option>
                    <option value="en">{tp.langEn}</option>
                  </select>
                </label>

                <label className="settings-panel__control">
                  <span>
                    {tp.opacityLabel}{' '}
                    <small className="settings-panel__value">
                      {Math.round(settings.appearance.opacity * 100)}%
                    </small>
                  </span>
                  <input
                    type="range"
                    min={0.5}
                    max={1}
                    step={0.05}
                    value={settings.appearance.opacity}
                    onChange={(e) => {
                      void updateAppearance({ opacity: Number(e.target.value) });
                    }}
                  />
                  <small className="settings-panel__hint">{tp.opacityHint}</small>
                </label>

                <fieldset className="settings-panel__fieldset">
                  <legend>{tp.densityLabel}</legend>
                  <RadioRow
                    name="density"
                    value={settings.appearance.density}
                    options={[
                      { value: 'comfortable', label: tp.densityComfortable },
                      { value: 'compact', label: tp.densityCompact },
                    ]}
                    onChange={(value) => updateAppearance({ density: value as Density })}
                  />
                </fieldset>

                <fieldset className="settings-panel__fieldset">
                  <legend>{tp.themeLabel}</legend>
                  <RadioRow
                    name="theme"
                    value={settings.appearance.theme}
                    options={[
                      { value: 'system', label: tp.themeSystem },
                      { value: 'light', label: tp.themeLight },
                      { value: 'dark', label: tp.themeDark },
                    ]}
                    onChange={(value) => updateAppearance({ theme: value as Theme })}
                  />
                </fieldset>
              </section>

              <section className="settings-panel__section">
                <h3 className="settings-panel__section-title">{tp.sectionContent}</h3>

                <CheckboxRow
                  label={tp.showUnlockBlock}
                  checked={settings.contentDisplay.showUnlockBlock}
                  onChange={(v) => updateContentDisplay({ showUnlockBlock: v })}
                />
                <div className="settings-panel__sub">
                  <CheckboxRow
                    label={tp.showUnlockContext}
                    checked={settings.contentDisplay.showUnlockContext}
                    onChange={(v) => updateContentDisplay({ showUnlockContext: v })}
                    disabled={!settings.contentDisplay.showUnlockBlock}
                  />
                  <CheckboxRow
                    label={tp.showUnlockActions}
                    checked={settings.contentDisplay.showUnlockActions}
                    onChange={(v) => updateContentDisplay({ showUnlockActions: v })}
                    disabled={!settings.contentDisplay.showUnlockBlock}
                  />
                </div>
                <CheckboxRow
                  label={tp.showDangersBlock}
                  checked={settings.contentDisplay.showDangersBlock}
                  onChange={(v) => updateContentDisplay({ showDangersBlock: v })}
                />
                <CheckboxRow
                  label={tp.showTipsBlock}
                  checked={settings.contentDisplay.showTipsBlock}
                  onChange={(v) => updateContentDisplay({ showTipsBlock: v })}
                />
              </section>

              <section className="settings-panel__section">
                <h3 className="settings-panel__section-title">{tp.sectionMonsters}</h3>

                <CheckboxRow
                  label={tp.showLambdaMonsters}
                  hint={tp.showLambdaMonstersHint}
                  checked={settings.monstersDisplay.showLambdaMonsters}
                  onChange={(v) => updateMonstersDisplay({ showLambdaMonsters: v })}
                />
                <CheckboxRow
                  label={tp.showProvenanceBadge}
                  hint={tp.showProvenanceBadgeHint}
                  checked={settings.monstersDisplay.showProvenanceBadge}
                  onChange={(v) => updateMonstersDisplay({ showProvenanceBadge: v })}
                />
              </section>

              <section className="settings-panel__section">
                <h3 className="settings-panel__section-title">{tp.sectionShortcuts}</h3>

                <ul className="settings-panel__shortcuts">
                  <li className="settings-panel__shortcut">
                    <kbd>Alt+D</kbd>
                    <span>{tp.primaryShortcutHint}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>Ctrl+M</kbd>
                    <span>{tp.shortcutToggleMonsterView}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>Ctrl+L</kbd>
                    <span>{tp.shortcutToggleLang}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>↑↓</kbd>
                    <span>{tp.shortcutNavigate}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>Enter</kbd>
                    <span>{tp.shortcutOpen}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>/</kbd>
                    <span>{tp.shortcutFocusSearch}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>V</kbd>
                    <span>{tp.shortcutSwitchView}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>Backspace</kbd>
                    <span>{tp.shortcutBack}</span>
                  </li>
                  <li className="settings-panel__shortcut">
                    <kbd>Esc</kbd>
                    <span>{tp.shortcutClose}</span>
                  </li>
                </ul>
                <small className="settings-panel__hint">{tp.shortcutCustomizationSoon}</small>
              </section>

              <section className="settings-panel__section">
                <h3 className="settings-panel__section-title">{tp.sectionNotifications}</h3>

                <CheckboxRow
                  label={tp.showStartupToast}
                  hint={tp.showStartupToastHint}
                  checked={settings.notifications.showStartupToast}
                  onChange={(v) => updateNotifications({ showStartupToast: v })}
                />
              </section>

              <section className="settings-panel__section">
                <h3 className="settings-panel__section-title">{tp.sectionAbout}</h3>

                <p className="settings-panel__version">{tp.aboutVersion(appVersion)}</p>
                <ul className="settings-panel__links">
                  <li>
                    <button type="button" onClick={() => void openUrl(APP_CHANGELOG_URL)}>
                      {tp.aboutChangelog} ↗
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => void openUrl(APP_WEBSITE_URL)}>
                      {tp.aboutWebsite} ↗
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => void openUrl(APP_CREDITS_URL)}>
                      {tp.aboutCredits} ↗
                    </button>
                  </li>
                </ul>
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

function CheckboxRow({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <label
      className={
        'settings-panel__control settings-panel__control--checkbox' +
        (disabled ? ' settings-panel__control--disabled' : '')
      }
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => {
          void onChange(e.target.checked);
        }}
      />
      <span className="settings-panel__label-text">{label}</span>
      {hint && <small className="settings-panel__hint">{hint}</small>}
    </label>
  );
}

function RadioRow<T extends string>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void | Promise<void>;
}) {
  return (
    <div className="settings-panel__radio-row">
      {options.map((o) => (
        <label key={o.value} className="settings-panel__radio">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={o.value === value}
            onChange={() => {
              void onChange(o.value);
            }}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
