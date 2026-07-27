"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutGrid, Search, X, Check, Clock, LayoutList, ChevronRight } from "lucide-react";
import { getPickerGroups, getPickerDevicesByGroup, getPickerDevices } from "../data/deviceTaxonomy";

/**
 * "More Devices" — a proper Device Picker (Raycast/Spotlight-style modal),
 * not the old vertical expandable panel it replaces. That panel had three
 * real problems: it duplicated Windows/macOS/Android/iOS (already
 * always-visible as pills above it), it read as an unfinished dropdown
 * rather than a product surface, and as a plain in-flow scrolling list it
 * had nowhere good to go once the taxonomy grew past a screenful.
 *
 * This version fixes all three: Windows/macOS/Android/iOS are excluded at
 * the data layer (see getPickerDevices in deviceTaxonomy.js) so there's
 * never duplication to filter out by hand here; it's a centered modal with
 * its own search, not a menu; and because search + category grouping both
 * scale to any number of entries without layout changes, going from today's
 * ~30 devices to 100+ later is just adding rows to DEVICES.
 *
 * Portaled into the nearest `.support-setting-page` ancestor (not all the
 * way to `document.body`) so it keeps the `--support-primary` /
 * `--support-secondary` theme variables defined there in scope, and so it
 * isn't clipped or repositioned by the sidebar's own scroll/transform.
 */
const DeviceMegaMenu = ({ activeDeviceId, onSelectDevice, compact = false }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [portalContainer, setPortalContainer] = useState(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);

  const groups = useMemo(() => getPickerGroups(), []);
  const deviceCount = useMemo(() => getPickerDevices().length, []);

  const trimmedQuery = query.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!trimmedQuery) return null;
    return getPickerDevices().filter((device) => {
      const group = groups.find((g) => g.id === device.group);
      const haystack = `${device.name} ${device.shortName} ${group?.label || ""}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [trimmedQuery, groups]);

  useEffect(() => {
    if (!open) return;
    setPortalContainer(triggerRef.current?.closest(".support-setting-page") || document.body);
    setQuery("");
    // Autofocus after the open animation's first frame so the panel is
    // already in the DOM (it's only rendered once `open` is true).
    const id = window.requestAnimationFrame(() => searchInputRef.current?.focus());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(id);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (id, meta) => {
    setOpen(false);
    onSelectDevice(id, meta);
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) setOpen(false);
  };

  const renderCard = (device) => {
    const DeviceIcon = device.icon;
    const isActive = device.id === activeDeviceId;
    const isComingSoon = device.status === "coming-soon";
    return (
      <button
        key={device.id}
        type="button"
        role="menuitem"
        className={`support-devicemenu-item ${isActive ? "support-devicemenu-item-active" : ""} ${
          isComingSoon ? "support-devicemenu-item-soon" : ""
        }`}
        style={{ "--device-accent": device.color }}
        onClick={() => handleSelect(device.id, { kind: device.isPrimaryOS ? "os" : "device" })}
      >
        <span className="support-devicemenu-item-icon" aria-hidden="true">
          <DeviceIcon className="h-4 w-4" />
        </span>
        <span className="support-devicemenu-item-label">{device.shortName}</span>
        {isActive && <Check className="h-3.5 w-3.5 support-devicemenu-item-check" />}
        {isComingSoon && (
          <span className="support-devicemenu-item-badge">
            <Clock className="h-2.5 w-2.5" /> Soon
          </span>
        )}
      </button>
    );
  };

  const panel = open && (
    <div className="support-devicepicker-backdrop" onMouseDown={handleBackdropClick}>
      <div className="support-devicepicker-panel" role="dialog" aria-modal="true" aria-label="Browse devices">
        <div className="support-devicepicker-header">
          <p className="support-devicepicker-title">
            <LayoutList className="h-4 w-4" aria-hidden="true" />
            Browse Devices
          </p>
          <button
            type="button"
            className="support-devicepicker-close"
            onClick={() => setOpen(false)}
            aria-label="Close device picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="support-devicepicker-search">
          <Search className="h-4 w-4 support-devicepicker-search-icon" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search devices — try “Apple Watch” or “Xbox”"
            aria-label="Search devices"
            className="support-devicepicker-search-input"
          />
        </div>

        <div className="support-devicepicker-body">
          {searchResults ? (
            searchResults.length > 0 ? (
              <div className="support-devicemenu-grid">{searchResults.map(renderCard)}</div>
            ) : (
              <div className="support-devicepicker-empty">
                <Search className="h-5 w-5" aria-hidden="true" />
                <p>No devices match &ldquo;{query}&rdquo;.</p>
                <p className="support-devicepicker-empty-sub">Try a different name, or browse by category instead.</p>
              </div>
            )
          ) : (
            <div className="support-devicemenu-groups">
              {groups.map((group) => {
                const devices = getPickerDevicesByGroup(group.id);
                if (!devices.length) return null;
                const GroupIcon = group.icon;

                return (
                  <div key={group.id} className="support-devicemenu-group">
                    <p className="support-devicemenu-group-label">
                      <GroupIcon className="h-3.5 w-3.5" /> {group.label}
                    </p>
                    <div className="support-devicemenu-grid">{devices.map(renderCard)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="support-devicemenu-wrap">
      <button
        ref={triggerRef}
        type="button"
        className={`support-devicemenu-trigger ${compact ? "support-devicemenu-trigger-compact" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Browse more devices — ${deviceCount} available`}
        onClick={() => setOpen(true)}
      >
        {compact ? (
          <>
            <span className="support-devicemenu-trigger-icon" aria-hidden="true">
              <LayoutGrid className="h-3.5 w-3.5" />
            </span>
            <span className="support-devicemenu-trigger-label">More Devices</span>
            {deviceCount > 0 && <span className="support-devicemenu-trigger-count">{deviceCount}</span>}
            <ChevronRight className="h-3 w-3 support-devicemenu-trigger-arrow" aria-hidden="true" />
          </>
        ) : (
          <>
            <LayoutGrid className="h-3.5 w-3.5" />
            More Devices
          </>
        )}
      </button>

      {panel && portalContainer ? createPortal(panel, portalContainer) : null}
    </div>
  );
};

export default DeviceMegaMenu;
