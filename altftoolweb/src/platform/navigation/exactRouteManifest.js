/**
 * Lightweight exact-route manifest for dynamic page families.
 *
 * Keep catalogue modules out of proxy.js: Support Settings carries roughly
 * 2 MiB of authored data, while the Transform JSON contains metadata the
 * request guard does not need. This compact manifest stores only URL segments.
 * exactRouteManifest.test.mjs reconstructs both families from their canonical
 * catalogues, so adding or removing content without regenerating this file
 * fails CI instead of reopening an unbounded soft-404 route.
 */

const SUPPORT_SETTING_BASE_PATH = "/supportsetting";
const TRANSFORM_BASE_PATH = "/transform";

function segmentSet(value) {
  return new Set(value.split(" "));
}

const SUPPORT_PLATFORM_SETTINGS = {
  windows: segmentSet("windows-update windows-reset system-restart camera-permission microphone-permission wifi-connection network-reset bluetooth-settings display-settings storage-settings power-sleep sound-settings notifications-settings default-apps language-region windows-security windows-family-safety windows-email-accounts windows-other-users windows-work-school-access windows-passkeys windows-sign-in-options windows-your-info windows-linked-devices windows-focus-assist windows-personalization windows-themes windows-lock-screen windows-taskbar windows-start-menu windows-mouse windows-keyboard windows-touchpad windows-pen-ink windows-printers-scanners windows-vpn windows-mobile-hotspot windows-apps windows-optional-features windows-startup-apps windows-accessibility windows-privacy-security windows-permissions windows-time-date windows-clipboard windows-multitasking windows-remote-desktop windows-backup windows-recovery windows-activation windows-troubleshoot windows-device-manager windows-graphics windows-fonts windows-about-system-info windows-advanced-system-settings windows-storage-sense windows-file-history windows-nearby-sharing windows-voice-typing windows-game-mode windows-bitlocker windows-narrator windows-contrast-themes windows-text-size windows-text-cursor windows-mouse-pointer-touch windows-visual-effects windows-voice-access windows-find-my-device windows-video-playback windows-offline-maps windows-apps-for-websites windows-app-execution-aliases windows-airplane-mode windows-proxy-settings windows-ethernet windows-data-usage windows-autoplay windows-usb-settings windows-cameras-device windows-night-light windows-hdr-settings windows-volume-mixer windows-advanced-display-settings windows-multiple-displays windows-colors windows-background-spotlight windows-touch-keyboard windows-device-usage windows-location-privacy windows-diagnostics-feedback windows-activity-history windows-onedrive-sync windows-disk-cleanup windows-storage-spaces windows-removable-storage windows-save-locations windows-disks-volumes windows-rename-pc windows-system-restore windows-environment-variables windows-domain-workgroup windows-uac-settings windows-delivery-optimization windows-insider-program windows-update-history windows-active-hours windows-pause-updates windows-optional-updates windows-update-advanced-options windows-get-help windows-feedback-hub windows-task-manager windows-memory-diagnostic windows-event-viewer windows-sync-settings windows-phone-link windows-general-privacy windows-pc-health-check"),
  macos: segmentSet("macos-software-update macos-time-machine-backup macos-filevault-encryption macos-camera-mic-privacy macos-wifi macos-bluetooth macos-displays macos-sound-notifications macos-apple-id-icloud macos-accessibility macos-erase-reset-mac macos-focus macos-desktop-dock macos-menu-bar-control-center macos-wallpaper-screensaver macos-lock-screen macos-mission-control macos-trackpad macos-mouse macos-keyboard macos-printers-scanners macos-vpn-network macos-general-apps macos-login-items macos-siri-spotlight macos-privacy-security-hub macos-app-permissions macos-language-region macos-date-time macos-airdrop-handoff macos-screen-sharing macos-recovery-mode macos-activation-lock macos-about-this-mac macos-storage-management macos-family-sharing macos-internet-accounts macos-users-groups macos-sign-in-password macos-automatic-updates macos-update-history macos-beta-updates macos-rapid-security-response macos-optimize-storage macos-icloud-drive macos-external-storage macos-system-report macos-startup-disk macos-serial-warranty macos-voiceover macos-zoom-magnifier macos-voice-control macos-safe-mode macos-diagnostics-usage-data macos-activity-monitor macos-switch-control macos-captions macos-sound-recognition macos-display-accommodations macos-pointer-control macos-screen-time macos-icloud-keychain macos-game-center macos-wallet-apple-pay macos-two-factor-auth macos-extensions macos-passwords-app macos-game-controllers macos-universal-control macos-ethernet macos-firewall macos-proxies macos-thunderbolt-bridge macos-personal-hotspot macos-battery macos-cds-dvds macos-dictation macos-bluetooth-accessory-battery macos-appearance macos-wallpaper macos-night-shift macos-true-tone macos-sound-output-input macos-appearance-light-dark macos-accent-highlight-color macos-focus-do-not-disturb macos-stage-manager macos-hot-corners macos-location-services macos-full-disk-access macos-screen-recording-permission macos-apple-advertising macos-icloud-desktop-documents-sync macos-migration-assistant macos-disk-utility-partition macos-icloud-plus-features macos-download-your-data macos-sharing-computer-name macos-configuration-profiles macos-app-store-auto-updates macos-update-now-vs-upgrade-later macos-update-install-scheduling macos-managed-updates-deferral macos-update-command-line macos-disk-utility-first-aid macos-apple-diagnostics macos-console-system-logs macos-reinstall-macos macos-force-quit-apps macos-shortcuts-app macos-screenshots-app macos-continuity-camera-sidecar macos-airplay-receiver macos-sound-effects-alerts macos-notification-center-widgets macos-login-window-appearance macos-contacts-calendar-access macos-version-build-number macos-legal-regulatory"),
  android: segmentSet("android-system-update android-storage-cleanup android-backup-restore android-app-permissions android-privacy-dashboard android-wifi android-bluetooth android-display-dark-mode android-google-account-sync android-accessibility android-factory-reset android-notifications android-sound-vibration android-do-not-disturb android-battery android-apps-default-apps android-home-screen-launcher android-wallpaper-style android-lock-screen android-security-screen-lock android-location android-nfc-payments android-hotspot-tethering android-vpn android-data-usage android-language-input android-date-time android-digital-wellbeing android-nearby-share android-multiple-users android-developer-options android-about-phone android-game-mode android-recovery-safe-mode android-emergency-sos android-connected-devices android-printing android-cast android-usb-preferences android-android-auto android-app-info android-special-app-access android-unused-apps-archiving android-clone-apps android-google-photos-backup android-files-by-google android-sd-card-storage android-talkback android-magnification android-live-caption android-security-patch-level android-carrier-updates android-play-system-update android-diagnostics-repair-tool android-send-feedback android-battery-usage-troubleshoot android-select-to-speak android-color-correction android-accessibility-shortcut android-tts-output android-interaction-controls android-add-account android-sync-account-data android-family-link android-emergency-info android-autofill-service android-google-one-backup android-personal-dictionary android-per-app-notifications android-permission-manager android-adaptive-battery android-screen-pinning android-app-timers android-airplane-mode android-sim-esim-manager android-private-dns android-fast-pair android-previously-connected-devices android-phone-hub-cross-device android-physical-keyboard android-stylus-settings android-font-display-size android-screen-timeout android-auto-rotate android-one-handed-mode android-independent-volume-controls android-themed-icons android-icon-shape-grid android-always-on-display android-screen-saver android-quick-settings-tiles android-notification-dots android-status-bar-icons android-show-passwords android-lock-screen-notification-privacy android-usage-diagnostics android-camera-mic-access-toggle android-free-up-space android-clear-cache-data android-download-manager android-google-drive-storage android-switch-transfer-data android-model-hardware-info android-imei-serial-number android-version-detail android-legal-information android-regulatory-labels android-device-status-info android-auto-update-apps android-app-download-network-preference android-check-for-update android-scheduled-system-updates android-baseband-firmware-version android-network-sim-diagnostics android-app-crash-reports android-reset-wifi-mobile-bluetooth android-reset-app-preferences android-bug-report-tool android-privacy-sandbox-ads"),
  ios: segmentSet("ios-software-update ios-iphone-storage ios-icloud-backup ios-privacy-permissions ios-face-id-passcode ios-wifi ios-bluetooth ios-display-brightness ios-accessibility ios-screen-time-family ios-reset-iphone ios-notifications ios-sounds-haptics ios-focus ios-battery ios-general-about ios-control-center ios-home-screen-app-library ios-wallpaper ios-standby-lock-screen ios-location-services ios-cellular-data ios-personal-hotspot ios-vpn ios-airdrop ios-siri-search ios-keyboard ios-language-region ios-date-time ios-find-my ios-apple-pay-wallet ios-app-store-settings ios-safari-settings ios-emergency-sos ios-game-center ios-icloud-account ios-family-sharing ios-sign-in-security ios-mail-contacts-accounts ios-airpods-settings ios-apple-watch-pairing ios-continuity-handoff ios-bluetooth-accessories ios-analytics-improvements ios-recovery-mode-restore ios-diagnostics-log ios-battery-health-troubleshoot ios-icloud-storage-manage ios-offload-unused-apps ios-icloud-photos-optimize ios-legal-regulatory ios-carrier-info ios-diagnostics-usage-info ios-automatic-updates ios-update-history ios-beta-updates ios-voiceover ios-magnifier ios-voice-control ios-switch-control ios-assistivetouch ios-sound-recognition ios-guided-access ios-captions-subtitles ios-screen-time-limits ios-apple-cash-family-payments ios-ask-to-buy ios-calendar-accounts ios-subscriptions-management ios-messages-settings ios-maps-settings ios-camera-settings ios-photos-settings ios-shortcuts-settings ios-airplane-mode ios-wifi-calling ios-icloud-private-relay ios-low-data-mode ios-carplay ios-magsafe-charging ios-external-storage-files ios-airplay-screen-mirroring ios-true-tone ios-night-shift ios-dark-mode ios-auto-lock ios-text-size-bold-text ios-attention-aware-features ios-home-screen-widgets ios-display-zoom ios-action-button ios-back-tap ios-tap-raise-to-wake ios-app-tracking-transparency ios-safety-check ios-content-privacy-restrictions ios-sensitive-content-warning ios-app-privacy-report ios-finder-itunes-backup ios-music-podcast-downloads ios-messages-keep-storage ios-icloud-plus-plan ios-quick-start-data-transfer ios-model-serial-imei ios-certificate-trust-settings ios-vpn-device-management ios-device-name ios-rapid-security-response ios-carrier-settings-update ios-app-store-auto-app-updates ios-update-via-finder-computer ios-security-only-updates-legacy-devices ios-force-restart-shut-down ios-erase-all-content-settings ios-dfu-mode-restore ios-overheating-temperature-troubleshoot ios-wifi-bluetooth-connectivity-troubleshoot ios-airtag-pairing ios-contact-poster"),
};

const SUPPORT_PLATFORM_CATEGORIES = segmentSet("system-updates privacy-permissions connectivity-network display-sound-notifications storage-backup-data accounts-sync-family accessibility-language troubleshooting-diagnostics personalization devices-peripherals apps-features system-info");

const SUPPORT_DEVICE_SETTINGS = {
  airpods: segmentSet("airpods-pairing airpods-firmware-update airpods-connectivity-troubleshooting airpods-battery-charging-case airpods-noise-control airpods-spatial-audio airpods-find-my airpods-ear-detection airpods-customize-controls airpods-audio-sharing airpods-device-switching airpods-hearing-accessibility"),
  "android-tablet": segmentSet("android-tablet-software-update android-tablet-wifi-network android-tablet-display-brightness android-tablet-multi-window android-tablet-google-account-sync android-tablet-app-permissions android-tablet-battery-power-saving android-tablet-storage-management"),
  "android-tv": segmentSet("android-tv-system-update android-tv-network android-tv-bluetooth-remote android-tv-display-picture android-tv-sound-audio android-tv-apps-management android-tv-casting android-tv-storage android-tv-parental-controls"),
  "apple-tv": segmentSet("apple-tv-software-update apple-tv-wifi-network apple-tv-airplay-homekit apple-tv-siri-remote-pairing apple-tv-screen-saver-display apple-tv-apple-id-icloud apple-tv-screen-time-privacy apple-tv-storage-apps"),
  "apple-watch": segmentSet("apple-watch-pairing apple-watch-software-update apple-watch-bluetooth apple-watch-display-brightness apple-watch-always-on-display apple-watch-watch-faces apple-watch-notifications apple-watch-sound-haptics apple-watch-battery-power-saving apple-watch-health-fitness apple-watch-sleep-tracking apple-watch-wallet-payments apple-watch-apps-management apple-watch-privacy-security apple-watch-accessibility apple-watch-backup-reset apple-watch-troubleshooting"),
  "bluetooth-speakers": segmentSet("bluetooth-speakers-pairing bluetooth-speakers-multipoint-pairing bluetooth-speakers-volume-eq bluetooth-speakers-battery bluetooth-speakers-firmware-update bluetooth-speakers-voice-assistant bluetooth-speakers-stereo-party-pairing bluetooth-speakers-connection-troubleshooting"),
  "docking-station": segmentSet("docking-station-connected-devices-overview docking-station-multi-monitor-setup docking-station-ethernet-connection docking-station-charging-power-delivery docking-station-firmware-update docking-station-usb-hub-troubleshooting docking-station-displaylink-driver-installation docking-station-daisy-chaining-monitors"),
  "external-monitor": segmentSet("external-monitor-resolution-refresh-rate external-monitor-brightness-contrast external-monitor-multi-display-arrangement external-monitor-hdr external-monitor-color-profile-calibration external-monitor-usb-c-docking-passthrough external-monitor-osd-controls external-monitor-power-saving-auto-sleep"),
  "galaxy-buds": segmentSet("galaxy-buds-pairing galaxy-buds-noise-cancellation galaxy-buds-equalizer galaxy-buds-touch-controls galaxy-buds-battery-case galaxy-buds-firmware-update galaxy-buds-find-my-buds galaxy-buds-ambient-sound"),
  "galaxy-watch": segmentSet("galaxy-watch-pairing galaxy-watch-software-update galaxy-watch-display-brightness galaxy-watch-always-on-display galaxy-watch-watch-faces galaxy-watch-notifications galaxy-watch-sound-haptics galaxy-watch-bluetooth-wifi galaxy-watch-battery-power-saving galaxy-watch-health-fitness galaxy-watch-sleep-tracking galaxy-watch-wallet-payments galaxy-watch-apps-management galaxy-watch-privacy-security galaxy-watch-accessibility galaxy-watch-backup-restore"),
  "google-tv": segmentSet("google-tv-software-update google-tv-wifi-network google-tv-display-picture google-tv-sound-audio google-tv-apps-management google-tv-google-cast google-tv-storage google-tv-parental-controls google-tv-voice-assistant"),
  "humane-ai-pin": segmentSet("humane-ai-pin-initial-setup-account humane-ai-pin-wifi-data-plan humane-ai-pin-voice-trust-light humane-ai-pin-laser-ink-gestures humane-ai-pin-battery-booster humane-ai-pin-software-update humane-ai-pin-privacy-moments humane-ai-pin-connectivity-troubleshooting"),
  ipad: segmentSet("ipad-software-update ipad-apple-id-icloud ipad-display-brightness ipad-apple-pencil ipad-multitasking-stage-manager ipad-notifications ipad-sound-haptics ipad-wifi-cellular ipad-storage-management ipad-privacy-security ipad-accessibility ipad-backup-restore"),
  keyboard: segmentSet("keyboard-bluetooth-usb-pairing keyboard-layout-input-language keyboard-backlighting keyboard-function-key-behavior keyboard-battery keyboard-firmware-update keyboard-multi-device-switching keyboard-key-remapping"),
  "lg-webos": segmentSet("lg-webos-software-update lg-webos-picture-wizard lg-webos-magic-remote-pairing lg-webos-sound-output lg-webos-home-dashboard lg-webos-screensaver-energy-saving lg-webos-parental-guidance lg-webos-account-channels"),
  linux: segmentSet("linux-system-update linux-wifi-network linux-display-graphics-drivers linux-sound-audio linux-user-accounts-permissions linux-storage-disk-management linux-desktop-environment-customization linux-firewall-security linux-backup-snapshots linux-printing-setup linux-flatpak-snap-apps linux-troubleshooting-boot-issues"),
  microphone: segmentSet("microphone-input-device-driver-selection microphone-gain-sensitivity microphone-noise-suppression microphone-mute-button-indicator microphone-polar-pattern-selection microphone-firmware-update microphone-positioning-pop-filter microphone-no-input-troubleshooting"),
  mouse: segmentSet("mouse-bluetooth-pairing mouse-pointer-speed mouse-dpi-sensitivity-profiles mouse-button-customization mouse-battery-charging mouse-firmware-update mouse-scroll-wheel-settings mouse-multi-device-switching"),
  "nintendo-switch": segmentSet("nintendo-switch-system-update nintendo-switch-account-profiles nintendo-switch-parental-controls nintendo-switch-wifi-connection nintendo-switch-joycon-pairing nintendo-switch-microsd-storage nintendo-switch-sleep-power nintendo-switch-save-data-cloud-backup"),
  playstation: segmentSet("playstation-system-update playstation-network-connection playstation-controller-pairing playstation-account-sign-in playstation-storage-management playstation-downloads-updates playstation-privacy-parental-controls playstation-audio-display-output playstation-trophies-social"),
  printer: segmentSet("printer-wifi-setup printer-usb-connection printer-driver-installation printer-ink-toner-levels printer-print-quality-cleaning printer-scan-to-computer-cloud printer-firmware-update printer-network-sharing"),
  "rabbit-r1": segmentSet("rabbit-r1-initial-setup-account rabbit-r1-wifi-connection rabbit-r1-push-to-talk-voice rabbit-r1-rabbit-eye-camera rabbit-r1-battery-charging rabbit-r1-software-update rabbit-r1-data-privacy rabbit-r1-connectivity-troubleshooting"),
  "samsung-tizen": segmentSet("samsung-tizen-software-update samsung-tizen-picture-mode samsung-tizen-sound-output-bluetooth samsung-tizen-network-smartthings samsung-tizen-samsung-account samsung-tizen-ambient-mode samsung-tizen-parental-controls samsung-tizen-universal-guide-smart-hub"),
  "steam-deck": segmentSet("steam-deck-system-update steam-deck-wifi-bluetooth steam-deck-battery-power steam-deck-controller-configuration steam-deck-storage-microsd steam-deck-display-refresh-resolution steam-deck-desktop-mode steam-deck-game-library-downloads"),
  "wear-os": segmentSet("wear-os-pairing-with-phone wear-os-software-update wear-os-watch-faces-tiles wear-os-notifications wear-os-google-assistant wear-os-battery-saver wear-os-wifi-cellular wear-os-health-connect-sync"),
  webcam: segmentSet("webcam-driver-software-install webcam-resolution-frame-rate webcam-autofocus-exposure webcam-built-in-microphone webcam-privacy-shutter-indicator-light webcam-field-of-view-adjustment webcam-firmware-update webcam-background-effects"),
  "windows-tablet": segmentSet("windows-tablet-windows-update windows-tablet-wifi-network windows-tablet-tablet-mode-touch-gestures windows-tablet-pen-windows-ink windows-tablet-microsoft-account-onedrive-sync windows-tablet-battery-saver windows-tablet-storage-sense windows-tablet-windows-hello"),
  xbox: segmentSet("xbox-system-update xbox-controller-pairing xbox-account-sign-in xbox-game-library xbox-audio-output xbox-network-settings xbox-remote-play xbox-privacy-family-settings"),
};

const SUPPORT_HELP_TOPICS = segmentSet("troubleshooting faq device contact");
const SUPPORT_AI_TOOLS = segmentSet("chatgpt claude gemini copilot perplexity midjourney cursor github-copilot vscode-extensions");

const TRANSFORM_TOOL_SLUGS = segmentSet("svg-to-jsx svg-to-react-native html-to-jsx html-to-pug json-to-big-query json-to-flow json-to-go-bson json-to-go json-to-graphql json-to-io-ts json-to-java json-to-jsdoc json-to-json-schema json-to-kotlin json-to-mobx-state-tree json-to-mongoose json-to-mysql json-to-proptypes json-to-rust-serde json-to-sarcastic json-to-scala-case-class json-to-toml json-to-typescript json-to-yaml json-to-zod json-schema-to-openapi-schema json-schema-to-protobuf json-schema-to-typescript json-schema-to-zod css-to-js css-to-tailwind object-styles-to-template-literal js-object-to-json js-object-to-typescript graphql-to-components graphql-to-flow graphql-to-fragment-matcher graphql-to-introspection-json graphql-to-java graphql-to-resolvers-signature graphql-to-schema-ast graphql-to-typescript graphql-to-typescript-mongodb jsonld-to-compacted jsonld-to-expanded jsonld-to-flattened jsonld-to-framed jsonld-to-nquads jsonld-to-normalized typescript-to-flow typescript-to-json-schema typescript-to-javascript typescript-to-typescript-declaration typescript-to-zod flow-to-javascript flow-to-typescript flow-to-typescript-declaration cadence-to-go markdown-to-html toml-to-json toml-to-yaml xml-to-json yaml-to-json yaml-to-toml");

function stripTrailingSlashes(pathname) {
  if (typeof pathname !== "string") return "";
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function isKnownSupportSettingPath(pathname) {
  const normalized = stripTrailingSlashes(pathname);
  if (normalized === SUPPORT_SETTING_BASE_PATH) return true;
  if (!normalized.startsWith(`${SUPPORT_SETTING_BASE_PATH}/`)) return false;

  const segments = normalized.slice(SUPPORT_SETTING_BASE_PATH.length + 1).split("/");
  if (segments.some((segment) => !segment)) return false;

  const [first, second, third] = segments;
  const platformSettings = SUPPORT_PLATFORM_SETTINGS[first];
  if (platformSettings) {
    if (segments.length === 1) return true;
    if (segments.length === 2) return platformSettings.has(second);
    return (
      segments.length === 3 &&
      second === "category" &&
      SUPPORT_PLATFORM_CATEGORIES.has(third)
    );
  }

  const deviceSettings = SUPPORT_DEVICE_SETTINGS[first];
  if (deviceSettings) {
    if (segments.length === 1) return true;
    return segments.length === 2 && deviceSettings.has(second);
  }

  if (first === "help") {
    return segments.length === 2 && SUPPORT_HELP_TOPICS.has(second);
  }
  if (first === "ai-tools") {
    return segments.length === 2 && SUPPORT_AI_TOOLS.has(second);
  }
  return false;
}

export function isKnownTransformPagePath(pathname) {
  const normalized = stripTrailingSlashes(pathname);
  if (normalized === TRANSFORM_BASE_PATH) return true;
  if (!normalized.startsWith(`${TRANSFORM_BASE_PATH}/`)) return false;

  const segments = normalized.slice(TRANSFORM_BASE_PATH.length + 1).split("/");
  return (
    segments.length === 1 &&
    Boolean(segments[0]) &&
    TRANSFORM_TOOL_SLUGS.has(segments[0])
  );
}

export const SUPPORT_SETTING_ROUTE_COUNT =
  1 +
  Object.values(SUPPORT_PLATFORM_SETTINGS).reduce(
    (total, settings) => total + 1 + SUPPORT_PLATFORM_CATEGORIES.size + settings.size,
    0,
  ) +
  Object.values(SUPPORT_DEVICE_SETTINGS).reduce(
    (total, settings) => total + 1 + settings.size,
    0,
  ) +
  SUPPORT_HELP_TOPICS.size +
  SUPPORT_AI_TOOLS.size;

export const TRANSFORM_PAGE_ROUTE_COUNT = TRANSFORM_TOOL_SLUGS.size;
export const EXACT_ROUTE_REDIRECT_STATUS = 308;

/**
 * Return the family hub for a path that entered a guarded dynamic page family
 * but is not in its exact manifest. Real `/transform/api/<slug>` calls are
 * deliberately outside the Transform page guard; there is no bare
 * `/transform/api` endpoint, so that path is an invalid page slug.
 */
export function getExactRouteRedirect(pathname) {
  const normalized = stripTrailingSlashes(pathname);

  if (
    normalized.startsWith(`${SUPPORT_SETTING_BASE_PATH}/`) &&
    !isKnownSupportSettingPath(normalized)
  ) {
    return SUPPORT_SETTING_BASE_PATH;
  }

  if (
    normalized.startsWith(`${TRANSFORM_BASE_PATH}/`) &&
    !normalized.startsWith(`${TRANSFORM_BASE_PATH}/api/`) &&
    !isKnownTransformPagePath(normalized)
  ) {
    return TRANSFORM_BASE_PATH;
  }

  return null;
}
