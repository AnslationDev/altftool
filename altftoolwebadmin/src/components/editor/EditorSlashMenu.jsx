"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

/**
 * EditorSlashMenuList — the keyboard-navigable list rendered by the
 * SlashCommands extension. Groups come from the shared command registry.
 */
export const EditorSlashMenuList = forwardRef(function EditorSlashMenuList(
  { items, command },
  ref,
) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  const select = (index) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!items.length) return false; // nothing to navigate — avoid % 0 (NaN)
      if (event.key === "ArrowDown") {
        setSelectedIndex((index) => (index + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelectedIndex((index) => (index - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        select(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) {
    return (
      <div className="altft-slash-menu" role="listbox" aria-label="Insert menu">
        <p className="altft-slash-menu__empty">No matching blocks</p>
      </div>
    );
  }

  let lastGroup = null;

  return (
    <div className="altft-slash-menu" role="listbox" aria-label="Insert menu">
      {items.map((item, index) => {
        const groupHeader =
          item.group !== lastGroup ? (
            <p key={`group-${item.group}`} className="altft-slash-menu__group" aria-hidden="true">
              {item.group}
            </p>
          ) : null;
        lastGroup = item.group;
        const Icon = item.icon;
        return (
          <React.Fragment key={item.id}>
            {groupHeader}
            <button
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              className={`altft-slash-menu__item ${index === selectedIndex ? "is-selected" : ""}`}
              onMouseEnter={() => setSelectedIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(index)}
            >
              <span className="altft-slash-menu__icon">
                <Icon size={15} aria-hidden="true" />
              </span>
              <span className="altft-slash-menu__text">
                <span className="altft-slash-menu__label">{item.label}</span>
                <span className="altft-slash-menu__description">{item.description}</span>
              </span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
});

export default EditorSlashMenuList;
