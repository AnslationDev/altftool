"use client";

import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Field, TextArea, Select, ResultPanel } from "./ui";

const SIZES = [128, 200, 256, 320];

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://altf.tools");
  const [size, setSize] = useState("200");
  const [fg, setFg] = useState("#111111");

  const value = text.trim();

  return (
    <div className="afc-calc">
      <Field label="Text or URL" hint="Anything you type is encoded into the QR code.">
        <TextArea
          rows={3}
          value={text}
          placeholder="https://example.com or any text…"
          onChange={(e) => setText(e.target.value)}
        />
      </Field>

      <div className="afc-conv-row">
        <Field label="Size">
          <Select value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((s) => (
              <option key={s} value={s}>{`${s} × ${s} px`}</option>
            ))}
          </Select>
        </Field>
        <Field label="Foreground color">
          <input
            type="color"
            className="afc-input"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            aria-label="Foreground color"
          />
        </Field>
      </div>

      {value ? (
        <ResultPanel title="QR code">
          <div className="afc-qr-wrap">
            <QRCodeCanvas
              value={value}
              size={Number(size)}
              fgColor={fg}
              bgColor="#ffffff"
              includeMargin
              level="M"
            />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="QR code" muted>
          <p className="afc-note">Enter text or a URL to generate a QR code.</p>
        </ResultPanel>
      )}
    </div>
  );
}
