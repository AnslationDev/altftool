import { appleWatchSettings } from "./appleWatch";
import { playstationSettings } from "./playstation";
import { androidTvSettings } from "./androidTv";
import { airpodsSettings } from "./airpods";
import { linuxSettings } from "./linux";
import { ipadSettings } from "./ipad";
import { xboxSettings } from "./xbox";
import { googleTvSettings } from "./googleTv";
import { mouseSettings } from "./mouse";
import { galaxyWatchSettings } from "./galaxyWatch";
import { androidTabletSettings } from "./androidTablet";
import { windowsTabletSettings } from "./windowsTablet";
import { wearOsSettings } from "./wearOs";
import { appleTvSettings } from "./appleTv";
import { samsungTizenSettings } from "./samsungTizen";
import { lgWebosSettings } from "./lgWebos";
import { nintendoSwitchSettings } from "./nintendoSwitch";
import { steamDeckSettings } from "./steamDeck";
import { galaxyBudsSettings } from "./galaxyBuds";
import { bluetoothSpeakersSettings } from "./bluetoothSpeakers";
import { keyboardSettings } from "./keyboard";
import { webcamSettings } from "./webcam";
import { printerSettings } from "./printer";
import { microphoneSettings } from "./microphone";
import { externalMonitorSettings } from "./externalMonitor";
import { dockingStationSettings } from "./dockingStation";
import { rabbitR1Settings } from "./rabbitR1";
import { humaneAiPinSettings } from "./humaneAiPin";

// Every device with hasGuides:true in deviceTaxonomy.js must have a matching
// entry here. Adding another fully-authored device later is: write
// data/devices/newDevice.js in the same shape as the examples below, import
// it, add one line below, and flip its taxonomy entry's status.
export const DEVICE_SETTINGS_BY_ID = {
  "apple-watch": appleWatchSettings,
  playstation: playstationSettings,
  "android-tv": androidTvSettings,
  airpods: airpodsSettings,
  linux: linuxSettings,
  ipad: ipadSettings,
  xbox: xboxSettings,
  "google-tv": googleTvSettings,
  mouse: mouseSettings,
  "galaxy-watch": galaxyWatchSettings,
  "android-tablet": androidTabletSettings,
  "windows-tablet": windowsTabletSettings,
  "wear-os": wearOsSettings,
  "apple-tv": appleTvSettings,
  "samsung-tizen": samsungTizenSettings,
  "lg-webos": lgWebosSettings,
  "nintendo-switch": nintendoSwitchSettings,
  "steam-deck": steamDeckSettings,
  "galaxy-buds": galaxyBudsSettings,
  "bluetooth-speakers": bluetoothSpeakersSettings,
  keyboard: keyboardSettings,
  webcam: webcamSettings,
  printer: printerSettings,
  microphone: microphoneSettings,
  "external-monitor": externalMonitorSettings,
  "docking-station": dockingStationSettings,
  "rabbit-r1": rabbitR1Settings,
  "humane-ai-pin": humaneAiPinSettings,
};

export function getSettingsForDevice(deviceId) {
  return DEVICE_SETTINGS_BY_ID[deviceId] || [];
}

export function getDeviceSettingById(deviceId, settingId) {
  return getSettingsForDevice(deviceId).find((setting) => setting.id === settingId) || null;
}

export const ALL_DEVICE_SETTINGS = Object.values(DEVICE_SETTINGS_BY_ID).flat();
