"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Battery,
  Camera,
  Check,
  CheckCheck,
  ChevronLeft,
  Clipboard,
  Download,
  Edit3,
  Image as ImageIcon,
  Maximize2,
  MessageCircle,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Smile,
  Sparkles,
  Trash2,
  UploadCloud,
  User,
  Video,
  Wifi,
  X,
} from "lucide-react";


const STORAGE_KEY = "altftool-fake-chat-maker-whatsapp";

const TEMPLATES = {
  whatsapp: {
    label: "WhatsApp",
    accent: "#00A884",
    header: "#075E54",
    headerDark: "#075E54",
    headerBorder: "#075E54",
    headerBorderDark: "#075E54",
    statusBar: "#054640",
    statusBarDark: "#054640",
    headerText: "#FFFFFF",
    headerTextDark: "#FFFFFF",
    headerSubtext: "#D9FDD3",
    headerSubtextDark: "#D9FDD3",
    mine: "#DCF8C6",
    mineDark: "#DCF8C6",
    myText: "#111B21",
    myTextDark: "#111B21",
    theirs: "#FFFFFF",
    theirsDark: "#1F2C34",
    otherText: "#111B21",
    otherTextDark: "#E9EDEF",
    wallpaper: "#E5DDD5",
    wallpaperDark: "#0D1117",
    wallpaperImage: "/Fakechat-bg-images/whatsapp_background.jpg",
    footer: "#F0F2F5",
    footerDark: "#1F2C34",
    input: "#FFFFFF",
    inputDark: "#1F2C34",
    inputText: "#111B21",
    inputTextDark: "#E9EDEF",
    placeholder: "#8696A0",
    placeholderDark: "#8696A0",
    timestamp: "#667781",
    timestampDark: "#8696A0",
    read: "#53BDEB",
    sent: "#667781",
    sendIcon: "#FFFFFF",
    microphoneIcon: "#8696A0",
    radius: 7.5,
  },
  instagram: {
    label: "Instagram",
    accent: "#3797F0",
    header: "#FFFFFF",
    headerDark: "#000000",
    headerBorder: "#DBDBDB",
    headerBorderDark: "#262626",
    statusBar: "#FFFFFF",
    statusBarDark: "#000000",
    headerText: "#000000",
    headerTextDark: "#FFFFFF",
    headerSubtext: "#8E8E8E",
    headerSubtextDark: "#8E8E8E",
    mine: "#3797F0",
    mineDark: "#3797F0",
    myText: "#FFFFFF",
    myTextDark: "#FFFFFF",
    theirs: "#EFEFEF",
    theirsDark: "#262626",
    otherText: "#262626",
    otherTextDark: "#FFFFFF",
    wallpaper: "#FFFFFF",
    wallpaperDark: "#000000",
    wallpaperImage: "/Fakechat-bg-images/instagram_background.jpg",
    footer: "#FAFAFA",
    footerDark: "#000000",
    input: "#FFFFFF",
    inputDark: "#000000",
    inputText: "#000000",
    inputTextDark: "#FFFFFF",
    placeholder: "#8E8E8E",
    placeholderDark: "#8E8E8E",
    timestamp: "#8E8E8E",
    timestampDark: "#8E8E8E",
    read: "#3797F0",
    sent: "#8E8E8E",
    sendIcon: "#FFFFFF",
    microphoneIcon: "#3797F0",
    radius: 18,
    storyRing: "linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)",
  },
  telegram: {
    label: "Telegram",
    accent: "#2CA5E0",
    header: "#2CA5E0",
    headerDark: "#2CA5E0",
    headerBorder: "#2CA5E0",
    headerBorderDark: "#2CA5E0",
    statusBar: "#2CA5E0",
    statusBarDark: "#2CA5E0",
    headerText: "#FFFFFF",
    headerTextDark: "#FFFFFF",
    headerSubtext: "#FFFFFF",
    headerSubtextDark: "#FFFFFF",
    mine: "#EFFDDE",
    mineDark: "#EFFDDE",
    myText: "#000000",
    myTextDark: "#000000",
    theirs: "#ffffff",
    theirsDark: "#212D3B",
    otherText: "#000000",
    otherTextDark: "#FFFFFF",
    wallpaper: "#DAE4EA",
    wallpaperDark: "#0E1621",
    wallpaperImage: "/Fakechat-bg-images/telegram_background.jpg",
    footer: "#FFFFFF",
    footerDark: "#1C2733",
    input: "#FFFFFF",
    inputDark: "#1C2733",
    inputText: "#000000",
    inputTextDark: "#FFFFFF",
    placeholder: "#A0ACB2",
    placeholderDark: "#A0ACB2",
    timestamp: "#A0ACB2",
    timestampDark: "#A0ACB2",
    read: "#5DB8F2",
    sent: "#A0ACB2",
    sendIcon: "#FFFFFF",
    microphoneIcon: "#2CA5E0",
    onlineDot: "#0AC630",
    radius: 12,
  },
  imessage: {
    label: "iMessage",
    accent: "#007AFF",
    header: "#F9F9F9",
    headerDark: "#1C1C1E",
    headerBorder: "#E5E5EA",
    headerBorderDark: "#2C2C2E",
    statusBar: "#F9F9F9",
    statusBarDark: "#1C1C1E",
    headerText: "#000000",
    headerTextDark: "#FFFFFF",
    headerSubtext: "#8E8E93",
    headerSubtextDark: "#8E8E93",
    mine: "#007AFF",
    mineDark: "#007AFF",
    myText: "#FFFFFF",
    myTextDark: "#FFFFFF",
    theirs: "#E5E5EA",
    theirsDark: "#3A3A3C",
    otherText: "#000000",
    otherTextDark: "#FFFFFF",
    wallpaper: "#FFFFFF",
    wallpaperDark: "#000000",
    wallpaperImage: "/Fakechat-bg-images/imessage_background.jpg",
    footer: "#FFFFFF",
    footerDark: "#1C1C1E",
    input: "#FFFFFF",
    inputDark: "#1C1C1E",
    inputBorder: "#C7C7CC",
    inputBorderDark: "#3A3A3C",
    inputText: "#000000",
    inputTextDark: "#FFFFFF",
    placeholder: "#C7C7CC",
    placeholderDark: "#8E8E93",
    timestamp: "#8E8E93",
    timestampDark: "#8E8E93",
    read: "#007AFF",
    sent: "#8E8E93",
    sendIcon: "#FFFFFF",
    microphoneIcon: "#007AFF",
    facetime: "#34C759",
    radius: 20,
  },
  kakaotalk: {
    label: "KakaoTalk",
    accent: "#FEE500",
    header: "#3A2929",
    headerDark: "#3A2929",
    headerBorder: "#3A2929",
    headerBorderDark: "#3A2929",
    statusBar: "#3A2929",
    statusBarDark: "#3A2929",
    headerText: "#FFFFFF",
    headerTextDark: "#FFFFFF",
    headerSubtext: "#FFFFFF",
    headerSubtextDark: "#FFFFFF",
    mine: "#FEE500",
    mineDark: "#FEE500",
    myText: "#3A1D1D",
    myTextDark: "#3A1D1D",
    theirs: "#FFFFFF",
    theirsDark: "#FFFFFF",
    otherText: "#1A1A1A",
    otherTextDark: "#1A1A1A",
    wallpaper: "#B2C7D9",
    wallpaperDark: "#1C1C1C",
    wallpaperImage: "/Fakechat-bg-images/kakaotalk_background.jpg",
    footer: "#FFFFFF",
    footerDark: "#FFFFFF",
    input: "#FFFFFF",
    inputDark: "#FFFFFF",
    inputText: "#1A1A1A",
    inputTextDark: "#1A1A1A",
    placeholder: "#6B6B6B",
    placeholderDark: "#6B6B6B",
    timestamp: "#6B6B6B",
    timestampDark: "#6B6B6B",
    read: "#FEE500",
    sent: "#6B6B6B",
    sendIcon: "#3C1E1E",
    microphoneIcon: "#3C1E1E",
    profileName: "#5A5A5A",
    radius: 12,
  },
  discord: {
    label: "Discord",
    accent: "#5865F2",
    header: "#2B2D31",
    headerDark: "#2B2D31",
    headerBorder: "#1E1F22",
    headerBorderDark: "#1E1F22",
    statusBar: "#2B2D31",
    statusBarDark: "#2B2D31",
    headerText: "#FFFFFF",
    headerTextDark: "#FFFFFF",
    headerSubtext: "#B5BAC1",
    headerSubtextDark: "#B5BAC1",
    mine: "transparent",
    mineDark: "transparent",
    myText: "#DBDEE1",
    myTextDark: "#DBDEE1",
    theirs: "transparent",
    theirsDark: "transparent",
    otherText: "#DBDEE1",
    otherTextDark: "#DBDEE1",
    wallpaper: "#FFFFFF",
    wallpaperDark: "#313338",
    wallpaperImage: "/Fakechat-bg-images/discord_background.jpg",
    footer: "#383A40",
    footerDark: "#383A40",
    input: "#383A40",
    inputDark: "#383A40",
    inputText: "#DBDEE1",
    inputTextDark: "#DBDEE1",
    placeholder: "#6D6F78",
    placeholderDark: "#6D6F78",
    timestamp: "#80848E",
    timestampDark: "#80848E",
    read: "#23A55A",
    sent: "#80848E",
    sendIcon: "#DBDEE1",
    microphoneIcon: "#DBDEE1",
    hoverMessage: "#2E3035",
    serverList: "#1E1F22",
    channelList: "#2B2D31",
    activeChannel: "#404249",
    mentionBg: "#3C3F1F",
    mentionText: "#E3C53B",
    link: "#00A8FC",
    onlineDot: "#23A55A",
    idleDot: "#F0B232",
    dndDot: "#F23F43",
    offlineDot: "#80848E",
    boostPink: "#FF73FA",
    radius: 4,
    flat: true,
  },
};

const TEMPLATE_ORDER = ["whatsapp", "instagram", "telegram", "imessage", "kakaotalk", "discord"];

const SAMPLE_MESSAGES = [
  {
    id: "m1",
    type: "message",
    sender: "them",
    text: "Hey, video script ka first hook ready hai?",
    imageUrl: "",
    time: "10:28",
    status: "seen",
    reaction: "",
    date: "Today",
  },
  {
    id: "m2",
    type: "message",
    sender: "me",
    text: "Haan, 3 versions banaye hain. Viral wala short and punchy hai.",
    imageUrl: "",
    time: "10:29",
    status: "seen",
    reaction: "🔥",
    date: "Today",
  },
  {
    id: "m3",
    type: "image",
    sender: "them",
    text: "Thumbnail reference",
    imageUrl: "",
    time: "10:30",
    status: "delivered",
    reaction: "",
    date: "Today",
  },
  {
    id: "m4",
    type: "message",
    sender: "me",
    text: "Perfect. Mockup preview export karke bhej raha hoon.",
    imageUrl: "",
    time: "10:32",
    status: "seen",
    reaction: "",
    date: "Today",
  },
];

const STATUS_LABELS = {
  sent: "Sent",
  delivered: "Delivered",
  seen: "Seen",
};

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function wrapText(text, maxChars) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if (!current) {
      current = word;
      return;
    }
    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
      return;
    }
    lines.push(current);
    current = word;
  });

  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildScript(settings, messages) {
  return [
    `${TEMPLATES[settings.template].label} chat mockup`,
    `Title: ${settings.chatTitle}`,
    `Status: ${settings.chatStatus}`,
    "",
    ...messages.map((message) => {
      const name = message.sender === "me" ? settings.meName : settings.themName;
      const kind = message.type === "image" ? "[image] " : "";
      const suffix = message.reaction ? ` ${message.reaction}` : "";
      return `[${message.time}] ${name}: ${kind}${message.text}${suffix}`;
    }),
  ].join("\n");
}

function buildChatSvg(settings, messages) {
  const theme = TEMPLATES[settings.template];
  const dark = settings.darkMode || settings.template === "discord";
  const isKakao = settings.template === "kakaotalk";
  const isDiscord = settings.template === "discord";
  const width = 430;
  const statusHeight = settings.showStatus ? 34 : 0;
  const headerHeight = 66;
  const footerHeight = settings.showFooter ? 60 : 18;
  const innerX = 18;
  const innerWidth = width - innerX * 2;
  const bg = dark ? theme.wallpaperDark : theme.wallpaper;
  const header = dark ? theme.headerDark : theme.header;
  const headerBorder = dark ? theme.headerBorderDark : theme.headerBorder;
  const statusBar = dark ? theme.statusBarDark : theme.statusBar;
  const footer = dark ? theme.footerDark : theme.footer;
  const inputBg = dark ? theme.inputDark : theme.input;
  const inputText = dark ? theme.inputTextDark : theme.inputText;
  const mine = dark ? theme.mineDark : theme.mine;
  const theirs = dark ? theme.theirsDark : theme.theirs;
  const headerText = dark ? theme.headerTextDark : theme.headerText;
  const headerSubtext = dark ? theme.headerSubtextDark : theme.headerSubtext;
  const timestamp = dark ? theme.timestampDark : theme.timestamp;
  const stageHeader = isKakao && !dark ? bg : header;
  const stageHeaderText = isKakao && !dark ? "#111827" : headerText;
  const stageHeaderSubtext = isKakao && !dark ? theme.profileName || "#5A5A5A" : headerSubtext;
  const wallpaperHref =
    theme.wallpaperImage && typeof window !== "undefined"
      ? `${window.location.origin}${theme.wallpaperImage}`
      : theme.wallpaperImage;
  let y = statusHeight + headerHeight + 16;

  const nodes = [];
  let lastDate = "";

  messages.forEach((message) => {
    if (settings.showDate && message.date && message.date !== lastDate) {
      nodes.push(
        `<rect x="${width / 2 - 39}" y="${y}" width="78" height="24" rx="12" fill="${dark ? "#182533" : "#ffffff"}" opacity=".92"/>
         <text x="${width / 2}" y="${y + 16}" text-anchor="middle" font-family="Inter,Arial" font-size="10" font-weight="800" fill="${timestamp}">${escapeXml(message.date)}</text>`
      );
      y += 34;
      lastDate = message.date;
    }

    const isMe = message.sender === "me";
    const lines = wrapText(message.text || (message.type === "image" ? "Photo" : ""), 31);
    const bubbleWidth = message.type === "image" ? 238 : Math.min(292, Math.max(132, Math.max(...lines.map((line) => line.length)) * 7.3 + 40));
    const bubbleHeight = message.type === "image" ? 196 : Math.max(46, lines.length * 19 + 32 + (message.reaction ? 10 : 0));
    const showLeftIdentity = !isMe && !isDiscord;
    const avatarSize = 28;
    const x = isMe ? width - innerX - bubbleWidth : innerX + (showLeftIdentity ? avatarSize + 10 : 0);
    const bubbleY = y + (showLeftIdentity ? 18 : 0);
    const fill = isMe ? mine : theirs;
    const textColor = isMe ? (dark ? theme.myTextDark : theme.myText) : (dark ? theme.otherTextDark : theme.otherText);
    const timeColor = timestamp;
    const status = isMe && settings.showRead ? ` ${message.status === "sent" ? "✓" : "✓✓"}` : "";
    const radius = theme.flat ? 4 : theme.radius;
    const bubbleStroke = theme.flat ? "none" : "rgba(15,23,42,.08)";
    const textNodes = lines
      .map((line, index) => `<text x="${x + 15}" y="${bubbleY + (message.type === "image" ? 155 : 23) + index * 19}" font-family="Inter,Arial" font-size="14" font-weight="650" fill="${textColor}">${escapeXml(line)}</text>`)
      .join("");
    const imageNode =
      message.type === "image"
        ? message.imageUrl?.startsWith("data:")
          ? `<rect x="${x + 8}" y="${bubbleY + 8}" width="${bubbleWidth - 16}" height="132" rx="13" fill="${dark ? "#111827" : "#f8fafc"}"/>
             <image x="${x + 8}" y="${bubbleY + 8}" width="${bubbleWidth - 16}" height="132" preserveAspectRatio="xMidYMid meet" href="${escapeXml(message.imageUrl)}" clip-path="url(#imageClip-${message.id})"/>
             <clipPath id="imageClip-${message.id}"><rect x="${x + 8}" y="${bubbleY + 8}" width="${bubbleWidth - 16}" height="132" rx="13"/></clipPath>`
          : `<rect x="${x + 8}" y="${bubbleY + 8}" width="${bubbleWidth - 16}" height="132" rx="13" fill="${dark ? "#0f172a" : "#e2e8f0"}"/>
             <text x="${x + bubbleWidth / 2}" y="${bubbleY + 76}" text-anchor="middle" font-family="Inter,Arial" font-size="13" font-weight="900" fill="${timestamp}">Image bubble</text>`
        : "";
    const reaction = message.reaction
      ? `<circle cx="${isMe ? x + 18 : x + bubbleWidth - 18}" cy="${bubbleY + bubbleHeight + 3}" r="13" fill="#ffffff" stroke="#dbe3ef"/>
         <text x="${isMe ? x + 10 : x + bubbleWidth - 25}" y="${bubbleY + bubbleHeight + 8}" font-size="14">${escapeXml(message.reaction)}</text>`
      : "";
    const leftIdentity =
      showLeftIdentity
        ? `<circle cx="${innerX + avatarSize / 2}" cy="${bubbleY + avatarSize / 2}" r="${avatarSize / 2}" fill="${theme.accent}"/>
           <text x="${innerX + avatarSize / 2}" y="${bubbleY + avatarSize / 2 + 5}" text-anchor="middle" font-family="Inter,Arial" font-size="13" font-weight="950" fill="${settings.template === "kakaotalk" ? "#3A1D1D" : "#ffffff"}">${escapeXml(initials(settings.themName))}</text>
           <text x="${x}" y="${y + 12}" font-family="Inter,Arial" font-size="11" font-weight="900" fill="${theme.profileName || timestamp}">${escapeXml(settings.themName)}</text>`
        : "";

    nodes.push(`
      <g>
        ${leftIdentity}
        <rect x="${x}" y="${bubbleY}" width="${bubbleWidth}" height="${bubbleHeight}" rx="${radius}" fill="${fill}" stroke="${bubbleStroke}"/>
        ${imageNode}
        ${textNodes}
        <text x="${x + bubbleWidth - 72}" y="${bubbleY + bubbleHeight - 10}" font-family="Inter,Arial" font-size="10" font-weight="800" fill="${timeColor}">${escapeXml(message.time)}${status}</text>
        ${reaction}
      </g>`);
    y += bubbleHeight + 10 + (showLeftIdentity ? 18 : 0) + (message.reaction ? 12 : 0);
  });

  const height = Math.max(700, y + footerHeight + 18);
  const avatarFill = settings.template === "instagram" ? "url(#storyRing)" : theme.accent;
  const storyRingDef =
    settings.template === "instagram"
      ? `<linearGradient id="storyRing" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#F58529"/><stop offset="50%" stop-color="#DD2A7B"/><stop offset="100%" stop-color="#8134AF"/></linearGradient>`
      : "";
  const svgDefs = `<defs>${storyRingDef}<clipPath id="phoneClip"><rect x="10" y="10" width="${width - 20}" height="${height - 20}" rx="28"/></clipPath></defs>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${svgDefs}
    <rect width="${width}" height="${height}" rx="32" fill="#0f172a"/>
    <rect x="10" y="10" width="${width - 20}" height="${height - 20}" rx="28" fill="${bg}"/>
    ${wallpaperHref ? `<image x="10" y="10" width="${width - 20}" height="${height - 20}" preserveAspectRatio="xMidYMid slice" opacity="1" href="${escapeXml(wallpaperHref)}" clip-path="url(#phoneClip)"/>` : ""}
    ${settings.showStatus ? `<rect x="10" y="10" width="${width - 20}" height="${statusHeight}" rx="28" fill="${isKakao && !dark ? "rgba(0,0,0,.08)" : statusBar}"/>
      <text x="30" y="32" font-family="Inter,Arial" font-size="13" font-weight="900" fill="${stageHeaderText}">${escapeXml(settings.phoneTime)}</text>
      <text x="${width - 108}" y="32" font-family="Inter,Arial" font-size="12" font-weight="850" fill="${stageHeaderText}">WiFi ${settings.battery}% ▮</text>` : ""}
    <rect x="10" y="${10 + statusHeight}" width="${width - 20}" height="${headerHeight}" fill="${stageHeader}"/>
    <rect x="10" y="${10 + statusHeight + headerHeight - 1}" width="${width - 20}" height="1" fill="${isKakao && !dark ? "rgba(15,23,42,.08)" : headerBorder}"/>
    <text x="28" y="${statusHeight + 53}" font-family="Inter,Arial" font-size="24" font-weight="800" fill="${stageHeaderText}">‹</text>
    ${isKakao ? "" : `<circle cx="62" cy="${statusHeight + 43}" r="22" fill="${avatarFill}"/>
    ${settings.template === "instagram" ? `<circle cx="62" cy="${statusHeight + 43}" r="18" fill="${stageHeader}"/>` : ""}
    <text x="62" y="${statusHeight + 51}" text-anchor="middle" font-family="Inter,Arial" font-size="18" font-weight="950" fill="${settings.template === "instagram" ? stageHeaderText : "#fff"}">${escapeXml(settings.themName.slice(0, 1).toUpperCase())}</text>`}
    <text x="${isKakao ? 52 : 96}" y="${statusHeight + 38}" font-family="Inter,Arial" font-size="17" font-weight="950" fill="${stageHeaderText}">${escapeXml(settings.chatTitle)}</text>
    <text x="${isKakao ? 52 : 96}" y="${statusHeight + 58}" font-family="Inter,Arial" font-size="12" font-weight="750" fill="${stageHeaderSubtext}">${escapeXml(settings.chatStatus)}</text>
    <text x="${width - 82}" y="${statusHeight + 52}" font-family="Inter,Arial" font-size="18" font-weight="900" fill="${stageHeaderText}">⌕  ⋮</text>
    ${nodes.join("")}
    ${settings.showFooter ? `<rect x="${10}" y="${height - 60}" width="${width - 20}" height="50" fill="${footer}" opacity=".98"/>
      <rect x="${innerX}" y="${height - 52}" width="${innerWidth - 50}" height="40" rx="20" fill="${inputBg}" stroke="${dark ? theme.inputBorderDark || "rgba(255,255,255,.16)" : theme.inputBorder || "rgba(15,23,42,.12)"}"/>
      <text x="${innerX + 18}" y="${height - 27}" font-family="Inter,Arial" font-size="13" font-weight="750" fill="${timestamp}">Message</text>
      <circle cx="${width - 42}" cy="${height - 32}" r="20" fill="${theme.accent}"/>
      <text x="${width - 47}" y="${height - 27}" font-family="Inter,Arial" font-size="14" font-weight="950" fill="${theme.sendIcon || inputText}">➤</text>` : ""}
  </svg>`;
}

function emptyDraft() {
  return {
    id: "",
    type: "message",
    sender: "me",
    text: "",
    imageUrl: "",
    time: "10:35",
    status: "seen",
    reaction: "",
    date: "Today",
  };
}

function initials(name) {
  return String(name || "U")
    .trim()
    .slice(0, 1)
    .toUpperCase();
}

function MetricCard({ icon: Icon, label, value, detail, tone = "info" }) {
  const toneClass = {
    info: "bg-[var(--section-highlight)] text-[var(--primary)]",
    good: "tool-status-good",
    warn: "tool-status-warn",
    bad: "tool-status-bad",
  }[tone];

  return (
    <article className="tool-card min-w-0 overflow-hidden !p-4 text-center sm:!p-5 xl:!p-6">
      <div className="grid min-w-0 gap-3">
        <span className={`mx-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg sm:h-11 sm:w-11 ${toneClass}`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </span>
        <div className="min-w-0">
          <p className="break-words text-[0.68rem] font-bold uppercase tracking-wide text-[var(--muted-foreground)] sm:text-xs">
            {label}
          </p>
          <span className="tool-metric-value mt-1">{value}</span>
          {detail ? <p className="mt-2 hidden break-words text-sm text-[var(--muted-foreground)] sm:block">{detail}</p> : null}
        </div>
      </div>
    </article>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-2 block break-words text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={`h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] ${props.className || ""}`}
    />
  );
}

function SelectInput(props) {
  return (
    <select
      {...props}
      className={`h-11 w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)] ${props.className || ""}`}
    />
  );
}

function PhonePreview({ settings, messages, onDownloadPng, onDownloadSvg }) {
  const theme = TEMPLATES[settings.template];
  const dark = settings.darkMode || settings.template === "discord";
  const textScale = Number(settings.textScale) || 14;
  const phoneHeight = Math.max(560, Math.min(920, Number(settings.phoneHeight) || 690));
  const isKakao = settings.template === "kakaotalk";
  const isDiscord = settings.template === "discord";
  const isInstagram = settings.template === "instagram";
  const bg = dark ? theme.wallpaperDark : theme.wallpaper;
  const header = dark ? theme.headerDark : theme.header;
  const headerBorder = dark ? theme.headerBorderDark : theme.headerBorder;
  const statusBar = dark ? theme.statusBarDark : theme.statusBar;
  const inputText = dark ? theme.inputTextDark : theme.inputText;
  const mine = dark ? theme.mineDark : theme.mine;
  const theirs = dark ? theme.theirsDark : theme.theirs;
  const headerText = dark ? theme.headerTextDark : theme.headerText;
  const headerSubtext = dark ? theme.headerSubtextDark : theme.headerSubtext;
  const myText = dark ? theme.myTextDark : theme.myText;
  const otherText = dark ? theme.otherTextDark : theme.otherText;
  const timestamp = dark ? theme.timestampDark : theme.timestamp;
  const stageHeader = isKakao && !dark ? bg : header;
  const stageHeaderText = isKakao && !dark ? "#111827" : headerText;
  const stageHeaderSubtext = isKakao && !dark ? theme.profileName || "#5A5A5A" : headerSubtext;


  return (
    <article className="min-w-0 overflow-hidden rounded-2xl bg-[#1a1d27] p-4 shadow-2xl">
      {/* Phone frame */}
      <div
        className="relative mx-auto overflow-hidden"
        style={{
          width: `${Math.min(settings.previewWidth || 390, 390)}px`,
          maxWidth: "100%",
          borderRadius: "36px",
          boxShadow: "0 0 0 2px #2d3040, 0 0 0 4px #111320, 0 24px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)",
          background: "#111320",
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2">
          <div className="h-6 w-28 rounded-b-2xl" style={{ backgroundColor: "#111320" }} />
        </div>

        {/* Screen */}
        <div
          className="relative overflow-hidden"
          style={{
            height: `${phoneHeight}px`,
            borderRadius: "34px",
            backgroundColor: bg,
            backgroundImage: theme.wallpaperImage ? `url(${theme.wallpaperImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark overlay for dark mode wallpapers */}
          {dark && theme.wallpaperImage && settings.template !== "telegram" && (
            <div className="absolute inset-0 z-0" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
          )}
          {/* WhatsApp green tint overlay — matches the real app’s gradient wallpaper */}
          {settings.template === "whatsapp" && !dark && (
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{
                background: "linear-gradient(160deg, rgba(132,196,100,0.28) 0%, rgba(180,230,140,0.18) 40%, rgba(210,240,160,0.22) 100%)",
              }}
            />
          )}

          <div className="relative z-10 flex h-full flex-col">
            {/* Status Bar */}
            {settings.showStatus ? (
              <div
                className="flex shrink-0 items-center justify-between px-6 pt-7 pb-1 text-[11px] font-bold"
                style={{ backgroundColor: isKakao && !dark ? "rgba(0,0,0,.06)" : statusBar, color: stageHeaderText }}
              >
                <span className="tracking-tight">{settings.phoneTime}</span>
                <span className="flex items-center gap-1.5">
                  <Wifi className="h-3 w-3" />
                  <Battery className="h-3 w-3" />
                  <span>{settings.battery}%</span>
                </span>
              </div>
            ) : (
              <div className="pt-7" />
            )}

            {/* Header */}
            <div
              className="flex shrink-0 items-center gap-2.5 px-3 py-2.5 shadow-sm"
              style={{ backgroundColor: stageHeader, borderBottom: `1px solid ${isKakao && !dark ? "rgba(15,23,42,.08)" : headerBorder}` }}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" style={{ color: stageHeaderText }} />
              {!isKakao ? (
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-black"
                  style={{ background: theme.storyRing || theme.accent }}
                >
                  <div
                    className="grid h-full w-full place-items-center overflow-hidden rounded-full"
                    style={{ backgroundColor: settings.template === "instagram" ? stageHeader : theme.accent }}
                  >
                    {settings.themAvatar ? (
                      <img src={settings.themAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-black text-white">{initials(settings.themName)}</span>
                    )}
                  </div>
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-black leading-tight" style={{ color: stageHeaderText }}>
                  {settings.chatTitle}
                </p>
                <p className="truncate text-[10px] font-semibold leading-tight" style={{ color: stageHeaderSubtext }}>
                  {settings.chatStatus}
                </p>
              </div>
              {isKakao ? (
                <>
                  <Search className="h-4 w-4 shrink-0" style={{ color: stageHeaderText }} />
                  <MoreVertical className="h-4 w-4 shrink-0" style={{ color: stageHeaderText }} />
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 shrink-0" style={{ color: stageHeaderText }} />
                  <Phone className="h-4 w-4 shrink-0" style={{ color: stageHeaderText }} />
                  <MoreVertical className="h-4 w-4 shrink-0" style={{ color: stageHeaderText }} />
                </>
              )}
            </div>

            {/* Messages Area */}
            <div className={`relative min-h-0 flex-1 overflow-y-auto px-2.5 py-3 ${settings.showFooter ? "pb-16" : "pb-3"}`}>
              <div className="relative z-10 space-y-1.5">
                {settings.showDate ? (
                  <div
                    className="mx-auto mb-2 w-fit rounded-full px-3 py-0.5 text-[10px] font-semibold shadow-sm"
                    style={{ backgroundColor: dark ? "rgba(15,23,42,.82)" : "rgba(255,255,255,.88)", color: timestamp }}
                  >
                    {messages[0]?.date || "Today"}
                  </div>
                ) : null}
                {messages.map((message) => {
                  const isMe = message.sender === "me";
                  const bubble = isMe ? mine : theirs;
                  const bubbleText = isMe ? myText : otherText;
                  const r = theme.flat ? 4 : theme.radius;
                  const bubbleRadius = isMe
                    ? `${r}px ${r}px ${Math.max(3, r / 3)}px ${r}px`
                    : `${r}px ${r}px ${r}px ${Math.max(3, r / 3)}px`;
                  return (
                    <div key={message.id} className={`relative flex min-w-0 items-end gap-1.5 ${isMe ? "justify-end" : "justify-start"} ${message.reaction ? "mb-3" : ""}`}>
                      {!isMe && !isDiscord ? (
                        <div
                          className="mb-0.5 grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full text-xs font-black"
                          style={{ backgroundColor: theme.accent, color: settings.template === "kakaotalk" ? "#3A1D1D" : "#ffffff" }}
                        >
                          {settings.themAvatar ? <img src={settings.themAvatar} alt="" className="h-full w-full object-cover" /> : initials(settings.themName)}
                        </div>
                      ) : null}
                      <div className={`min-w-0 ${isDiscord ? "max-w-[92%]" : isMe ? "max-w-[80%]" : "max-w-[76%]"}`}>
                        {!isMe && !isDiscord ? (
                          <p className="mb-0.5 truncate text-[10px] font-bold" style={{ color: theme.profileName || timestamp }}>
                            {settings.themName}
                          </p>
                        ) : null}
                        <div
                          className="min-w-0 px-2.5 py-1.5"
                          style={{
                            backgroundColor: bubble,
                            color: bubbleText,
                            borderRadius: bubbleRadius,
                            boxShadow: theme.flat ? "none" : "0 1px 2px rgba(0,0,0,0.13)",
                          }}
                        >
                          {message.type === "image" ? (
                            <div className="mb-1 overflow-hidden rounded-lg">
                              {message.imageUrl ? (
                                <img src={message.imageUrl} alt="" className="max-h-48 w-full object-cover" />
                              ) : (
                                <div className="grid h-32 w-full place-items-center" style={{ backgroundColor: dark ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.08)" }}>
                                  <ImageIcon className="h-6 w-6" style={{ color: timestamp }} />
                                </div>
                              )}
                            </div>
                          ) : null}
                          {message.text ? (
                            <p className="break-words leading-snug" style={{ fontSize: `${textScale}px`, fontWeight: 500 }}>
                              {message.text}
                            </p>
                          ) : null}
                          <div className="mt-0.5 flex items-center justify-end gap-0.5" style={{ color: timestamp }}>
                            <span style={{ fontSize: "9px", fontWeight: 600 }}>{message.time}</span>
                            {isMe && settings.showRead ? (
                              <CheckCheck className="h-3 w-3" style={{ color: message.status === "seen" ? theme.read : theme.sent }} />
                            ) : null}
                          </div>
                        </div>
                      </div>
                      {message.reaction ? (
                        <span className={`absolute -bottom-3.5 grid h-6 min-w-6 place-items-center rounded-full border bg-white px-1.5 text-xs shadow-sm ${isMe ? "right-1" : "left-8"}`}>
                          {message.reaction}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Input Bar */}
            {settings.showFooter ? (
              isInstagram ? (
                /* ── Instagram DM Footer ── */
                <div
                  className="absolute bottom-0 left-0 right-0 z-20 flex shrink-0 items-center gap-2 px-3 py-2.5"
                  style={{ backgroundColor: dark ? theme.footerDark : theme.footer, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}` }}
                >
                  {/* Blue camera circle — far left */}
                  <button
                    type="button"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <Camera className="h-[18px] w-[18px]" style={{ color: "#fff" }} />
                  </button>

                  {/* Plain pill input — no icons inside */}
                  <div
                    className="flex min-w-0 flex-1 items-center rounded-full px-4 py-[7px]"
                    style={{
                      backgroundColor: dark ? theme.inputDark : theme.input,
                      border: `1px solid ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
                    }}
                  >
                    <span
                      className="min-w-0 flex-1 truncate text-[11px]"
                      style={{ color: dark ? theme.placeholderDark : theme.placeholder, fontWeight: 400 }}
                    >
                      Message...
                    </span>
                  </div>

                  {/* Right icons: Mic | Gallery | Sticker | Plus */}
                  <span className="flex shrink-0 items-center gap-2.5" style={{ color: dark ? theme.placeholderDark : theme.placeholder }}>
                    <Mic className="h-[18px] w-[18px]" />
                    <ImageIcon className="h-[18px] w-[18px]" />
                    <Smile className="h-[18px] w-[18px]" />
                    <Plus className="h-[18px] w-[18px]" />
                  </span>
                </div>
              ) : (
                /* ── WhatsApp / Telegram / iMessage / KakaoTalk / Discord Footer ── */
                <div
                  className="absolute bottom-0 left-0 right-0 z-20 flex shrink-0 items-center gap-1.5 px-2 py-2"
                  style={{ backgroundColor: dark ? theme.footerDark : theme.footer }}
                >
                  {/* Emoji / Smiley icon — far left */}
                  {!isDiscord && (
                    <button type="button" className="shrink-0 p-1" style={{ color: dark ? theme.placeholderDark : theme.placeholder }}>
                      <Smile className="h-5 w-5" />
                    </button>
                  )}

                  {/* Input pill */}
                  <div
                    className="flex min-w-0 flex-1 items-center rounded-full px-3 py-[7px]"
                    style={{
                      backgroundColor: dark ? theme.inputDark : theme.input,
                      border: theme.inputBorder
                        ? `1px solid ${dark ? theme.inputBorderDark : theme.inputBorder}`
                        : "1px solid rgba(0,0,0,0.10)",
                    }}
                  >
                    <span
                      className="min-w-0 flex-1 truncate text-[11px]"
                      style={{ color: dark ? theme.placeholderDark : theme.placeholder, fontWeight: 400 }}
                    >
                      {isDiscord
                        ? `Message #${settings.chatTitle.toLowerCase().replace(/\s+/g, "-")}`
                        : "Message"}
                    </span>
                    {/* Paperclip + Camera inside input — WhatsApp style */}
                    {!isDiscord && (
                      <span className="ml-2 flex shrink-0 items-center gap-1.5">
                        <Paperclip
                          className="h-[15px] w-[15px]"
                          style={{ color: dark ? theme.placeholderDark : theme.placeholder }}
                        />
                        {settings.template === "whatsapp" && (
                          <Camera
                            className="h-[15px] w-[15px]"
                            style={{ color: dark ? theme.placeholderDark : theme.placeholder }}
                          />
                        )}
                      </span>
                    )}
                  </div>

                  {/* Send / Mic circle button — far right */}
                  <button
                    type="button"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {isDiscord ? (
                      <Send className="h-4 w-4" style={{ color: theme.sendIcon || "#fff" }} />
                    ) : (
                      <Mic className="h-[18px] w-[18px]" style={{ color: theme.sendIcon || "#fff" }} />
                    )}
                  </button>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      {!settings.watermark ? (
        <div className="mt-4 rounded-xl border tool-callout-warn p-3 text-sm font-semibold tool-text-warn">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          Watermark off — public export mein label recommend hai.
        </div>
      ) : null}

      <div className="tool-action-grid mt-4">
        <button type="button" className="btn-primary" onClick={onDownloadPng}>
          <Download className="h-4 w-4" />
          Export PNG
        </button>
        <button type="button" className="btn-secondary" onClick={onDownloadSvg}>
          <ImageIcon className="h-4 w-4" />
          Export SVG
        </button>
      </div>
    </article>
  );
}

function FakeChatHome({ settings, messages, savedAt, onOpenTemplate, onOpenBuilder, onClearSaved }) {
  const [templateSearch, setTemplateSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const templateTerm = templateSearch.trim().toLowerCase();
  const historyTerm = historySearch.trim().toLowerCase();
  const filteredTemplates = TEMPLATE_ORDER.filter((key) => TEMPLATES[key].label.toLowerCase().includes(templateTerm));
  const recentTitle = settings.chatTitle || "Working Title";
  const recentTemplate = TEMPLATES[settings.template]?.label || "WhatsApp";
  const hasHistory = !historyTerm || `${recentTitle} ${recentTemplate}`.toLowerCase().includes(historyTerm);

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
          Fake Chat Maker
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-base font-semibold leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
          Create realistic-looking but clearly editable chat mockups for social research, content creation, humor, UI demos, scripts, and testing workflows.
        </p>
      </header>

      <section className="mx-auto mt-8 max-w-4xl text-center">
        <h2 className="text-2xl font-black text-[var(--foreground)]">Create New</h2>
        <label className="relative mx-auto mt-3 block max-w-sm">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={templateSearch}
            onChange={(event) => setTemplateSearch(event.target.value)}
            className="h-11 w-full rounded-full border border-transparent bg-[var(--muted)] px-5 pr-12 text-center text-base font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            placeholder="Template"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {filteredTemplates.map((key) => {
            const item = TEMPLATES[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onOpenTemplate(key)}
                className="min-h-16 rounded-md border bg-[var(--background)] px-5 py-4 text-xl font-black text-[var(--foreground)] transition hover:-translate-y-0.5 hover:shadow-[var(--card-shadow)]"
                style={{ borderColor: item.accent }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-4xl text-center">
        <h2 className="text-2xl font-black text-[var(--foreground)]">Chat History</h2>
        <label className="relative mx-auto mt-3 block max-w-sm">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={historySearch}
            onChange={(event) => setHistorySearch(event.target.value)}
            className="h-11 w-full rounded-full border border-transparent bg-[var(--muted)] px-5 pr-12 text-center text-base font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            placeholder="Title"
          />
        </label>

        <div className="mt-4 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--card)] shadow-[var(--card-shadow)]">
          <div className="hidden grid-cols-[3.5rem_1fr_1.5fr_1fr_3.5rem] bg-[var(--primary)] text-sm font-black text-[var(--primary-foreground)] sm:grid">
            <div className="border-r border-white/20 p-4">
              <input type="checkbox" aria-label="Select all chats" />
            </div>
            <div className="border-r border-white/20 p-4">Template</div>
            <div className="border-r border-white/20 p-4">Recent Saved Date</div>
            <div className="border-r border-white/20 p-4">Title</div>
            <div className="p-4">
              <Trash2 className="mx-auto h-4 w-4" />
            </div>
          </div>
          {hasHistory ? (
            <div className="grid gap-3 bg-[var(--muted)] p-4 text-left sm:grid-cols-[3.5rem_1fr_1.5fr_1fr_3.5rem] sm:gap-0 sm:p-0 sm:text-center">
              <div className="flex items-center sm:justify-center sm:border-r sm:border-[var(--border)] sm:p-4">
                <input type="checkbox" aria-label="Select chat" />
              </div>
              <button type="button" onClick={onOpenBuilder} className="break-words font-black text-[var(--foreground)] sm:border-r sm:border-[var(--border)] sm:p-4">
                {recentTemplate}
              </button>
              <button type="button" onClick={onOpenBuilder} className="break-words font-semibold text-[var(--foreground)] sm:border-r sm:border-[var(--border)] sm:p-4">
                {savedAt || "Autosaved draft"}
              </button>
              <button type="button" onClick={onOpenBuilder} className="break-words font-semibold text-[var(--foreground)] sm:border-r sm:border-[var(--border)] sm:p-4">
                {recentTitle}
              </button>
              <button type="button" onClick={onClearSaved} className="text-[var(--muted-foreground)] hover:text-[var(--danger)] sm:p-4" aria-label="Delete saved chat">
                <Trash2 className="h-4 w-4 sm:mx-auto" />
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-sm font-semibold text-[var(--muted-foreground)]">No saved chat found.</div>
          )}
        </div>
      </section>

      <section id="features" className="mx-auto mt-8 grid max-w-4xl gap-3">
        <article className="rounded-md border border-pink-300 bg-pink-50 p-5 text-center text-pink-950 dark:border-pink-500/40 dark:bg-pink-950/20 dark:text-pink-100">
          <h3 className="text-lg font-black">Realistic Simulation Experience</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed">
            Build conversations that closely mimic popular messaging app layouts with editable messages, profile names, images, reactions, times, and delivery marks.
          </p>
        </article>
        <article className="rounded-md border border-red-300 bg-red-50 p-5 text-center text-red-950 dark:border-red-500/40 dark:bg-red-950/20 dark:text-red-100">
          <h3 className="text-lg font-black">Enhanced User Friendliness</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed">
            Choose a template, add message or image bubbles, preview immediately, autosave locally, and export PNG/SVG/JSON from one clean workspace.
          </p>
        </article>
        <article id="how-to-use" className="rounded-md border border-blue-300 bg-blue-50 p-5 text-center text-blue-950 dark:border-blue-500/40 dark:bg-blue-950/20 dark:text-blue-100">
          <h3 className="text-lg font-black">How To Use</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed">
            Select WhatsApp or another template, update people details, add bubbles, tune preview controls, then export your mockup.
          </p>
        </article>
        <article id="change-log" className="rounded-md border border-emerald-300 bg-emerald-50 p-5 text-center text-emerald-950 dark:border-emerald-500/40 dark:bg-emerald-950/20 dark:text-emerald-100">
          <h3 className="text-lg font-black">Change Log</h3>
          <p className="mt-2 text-sm font-semibold leading-relaxed">
            Added route-style template flow, chat history, image messages, autosave, responsive preview, and export controls.
          </p>
        </article>
      </section>
    </main>
  );
}

export default function FakeChatMaker() {
  const [view, setView] = useState("home");
  const [settings, setSettings] = useState({
    template: "whatsapp",
    chatTitle: "Content Team",
    chatStatus: "online",
    meName: "Saurabh",
    themName: "Maya",
    meAvatar: "",
    themAvatar: "",
    phoneTime: "10:32",
    battery: 86,
    darkMode: false,
    watermark: true,
    showStatus: true,
    showFooter: true,
    showDate: true,
    showRead: true,
    textScale: 14,
    previewWidth: 390,
    phoneHeight: 690,
    fixedHeight: true,
  });
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [draft, setDraft] = useState(emptyDraft);
  const [search, setSearch] = useState("");
  const [savedAt, setSavedAt] = useState("");

  const theme = TEMPLATES[settings.template];
  const isDarkTemplate = settings.darkMode || settings.template === "discord";
  const currentMineBubble = isDarkTemplate ? theme.mineDark : theme.mine;
  const currentTheirsBubble = isDarkTemplate ? theme.theirsDark : theme.theirs;
  const currentMyText = isDarkTemplate ? theme.myTextDark : theme.myText;
  const currentOtherText = isDarkTemplate ? theme.otherTextDark : theme.otherText;
  const currentMutedText = isDarkTemplate ? theme.timestampDark : theme.timestamp;

  const stats = useMemo(() => {
    const words = messages.reduce((sum, message) => sum + String(message.text || "").split(/\s+/).filter(Boolean).length, 0);
    const images = messages.filter((message) => message.type === "image").length;
    const mine = messages.filter((message) => message.sender === "me").length;
    return { words, images, mine, theirs: messages.length - mine };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return messages;
    return messages.filter((message) =>
      `${message.text} ${message.time} ${message.sender} ${message.type} ${message.status}`.toLowerCase().includes(term)
    );
  }, [messages, search]);

  useEffect(() => {
    const applyHash = () => {
      const match = window.location.hash.match(/chat\/([a-z-]+)/);
      if (!match) {
        setView("home");
        return;
      }
      const key = match[1];
      if (TEMPLATES[key]) {
        setSettings((current) => ({ ...current, template: key }));
        setView("builder");
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed?.settings && Array.isArray(parsed?.messages)) {
        setSettings((current) => ({ ...current, ...parsed.settings }));
        setMessages(parsed.messages);
        setSavedAt(parsed.savedAt || "");
      }
    } catch {
      // Ignore malformed local drafts.
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, messages, savedAt: stamp }));
        setSavedAt(stamp);
      } catch {
        // Storage can fail in private windows; the tool still works.
      }
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [settings, messages]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const openTemplate = (key) => {
    setSettings((current) => ({ ...current, template: key }));
    setView("builder");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#/chat/${key}`);
    }
  };

  const openHome = () => {
    setView("home");
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "#/");
    }
  };

  const clearSaved = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage failures.
    }
    setSavedAt("");
    resetSample();
  };

  const updateMessage = (id, patch) => {
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, ...patch } : message)));
  };

  const readImageFile = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => callback(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const addOrUpdateMessage = () => {
    const hasText = draft.text.trim();
    const hasImage = draft.type === "image" && draft.imageUrl;
    if (!hasText && !hasImage) return;

    if (draft.id) {
      updateMessage(draft.id, { ...draft, text: draft.text.trim() || (draft.type === "image" ? "Photo" : "") });
      setDraft(emptyDraft());
      return;
    }

    setMessages((current) => [
      ...current,
      {
        ...draft,
        id: makeId("message"),
        text: draft.text.trim() || (draft.type === "image" ? "Photo" : ""),
      },
    ]);
    setDraft(emptyDraft());
  };

  const editMessage = (message) => {
    setDraft({ ...message });
  };

  const resetSample = () => {
    setSettings({
      template: "whatsapp",
      chatTitle: "Content Team",
      chatStatus: "online",
      meName: "Saurabh",
      themName: "Maya",
      meAvatar: "",
      themAvatar: "",
      phoneTime: "10:32",
      battery: 86,
      darkMode: false,
      watermark: true,
      showStatus: true,
      showFooter: true,
      showDate: true,
      showRead: true,
      textScale: 14,
      previewWidth: 390,
      phoneHeight: 690,
      fixedHeight: true,
    });
    setMessages(SAMPLE_MESSAGES);
    setDraft(emptyDraft());
    setSearch("");
  };

  const saveNow = () => {
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings, messages, savedAt: stamp }));
    setSavedAt(stamp);
  };

  const copyScript = async () => {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(buildScript(settings, messages));
    }
  };

  const downloadJson = () => {
    downloadFile("fake-chat-maker.json", JSON.stringify({ settings, messages }, null, 2), "application/json");
  };

  const downloadSvg = () => {
    downloadFile("fake-chat-mockup.svg", buildChatSvg(settings, messages), "image/svg+xml");
  };

  const downloadPng = () => {
    const svg = buildChatSvg(settings, messages);
    const image = new window.Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width * 2;
      canvas.height = image.height * 2;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = pngUrl;
        anchor.download = "fake-chat-mockup.png";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };
    image.src = url;
  };

  if (view === "home") {
    return (
      <FakeChatHome
        settings={settings}
        messages={messages}
        savedAt={savedAt}
        onOpenTemplate={openTemplate}
        onOpenBuilder={() => openTemplate(settings.template)}
        onClearSaved={clearSaved}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10">
      <header className="mx-auto max-w-5xl text-center">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--section-highlight)] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--primary)]">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">{theme.label} chat studio</span>
          </span>
          <span className="inline-flex max-w-full items-center gap-2 rounded-full tool-status-good px-4 py-2 text-xs font-bold uppercase tracking-wide">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Browser-side editor
          </span>
        </div>
        <h1 className="heading tool-heading-accent mx-auto max-w-5xl text-center text-4xl sm:text-5xl">
          Fake {theme.label} Chat Maker
        </h1>
        <p className="description mx-auto mt-3 max-w-4xl text-center text-sm sm:text-base">
          Build a realistic {theme.label} chat scene with profile controls, message bubbles, image posts, status bar, live preview, and export-ready screenshots.
        </p>
      </header>

      <section className="mt-8 grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(310px,380px)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-6">
          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <MessageCircle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  UI
                </p>
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Chat Interface</h2>
                <p className="mt-1 break-words text-sm text-[var(--muted-foreground)]">
                  Choose app style and tune person details before adding bubbles.
                </p>
              </div>
            </div>

            <div className="tool-tab-grid">
              {Object.entries(TEMPLATES).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting("template", key)}
                  className={`min-w-0 rounded-xl border px-4 py-3 text-left transition ${
                    settings.template === key
                      ? "border-[var(--primary)] bg-[var(--section-highlight)] text-[var(--primary)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: item.accent }} />
                    <span className="min-w-0 break-words text-sm font-black">{item.label}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
              <Field label="Chat title">
                <TextInput value={settings.chatTitle} onChange={(event) => updateSetting("chatTitle", event.target.value)} />
              </Field>
              <Field label="Subtitle / status">
                <TextInput value={settings.chatStatus} onChange={(event) => updateSetting("chatStatus", event.target.value)} />
              </Field>
              <Field label="Your name">
                <TextInput value={settings.meName} onChange={(event) => updateSetting("meName", event.target.value)} />
              </Field>
              <Field label="Other person name">
                <TextInput value={settings.themName} onChange={(event) => updateSetting("themName", event.target.value)} />
              </Field>
              <Field label="Your avatar image">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => readImageFile(event.target.files?.[0], (value) => updateSetting("meAvatar", value))}
                  className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                />
              </Field>
              <Field label="Other avatar image">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => readImageFile(event.target.files?.[0], (value) => updateSetting("themAvatar", value))}
                  className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                />
              </Field>
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Send className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Edit chat
                  </p>
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">
                    {draft.id ? "Update Bubble" : "Add Bubble"}
                  </h2>
                </div>
              </div>
              {draft.id ? (
                <button type="button" className="btn-secondary" onClick={() => setDraft(emptyDraft())}>
                  <X className="h-4 w-4" />
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <div className="tool-tab-grid mb-5">
              {[
                ["message", MessageCircle, "Message"],
                ["image", ImageIcon, "Image"],
              ].map(([type, Icon, label]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDraft((current) => ({ ...current, type }))}
                  className={draft.type === type ? "btn-primary" : "btn-secondary"}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="grid min-w-0 gap-4 lg:grid-cols-2">
              <Field label="Person">
                <SelectInput value={draft.sender} onChange={(event) => setDraft((current) => ({ ...current, sender: event.target.value }))}>
                  <option value="me">{settings.meName}</option>
                  <option value="them">{settings.themName}</option>
                </SelectInput>
              </Field>
              <Field label="Date label">
                <TextInput value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} placeholder="Today" />
              </Field>
              <Field label="Time">
                <TextInput type="time" value={draft.time} onChange={(event) => setDraft((current) => ({ ...current, time: event.target.value }))} />
              </Field>
              <Field label="Status">
                <SelectInput value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Reaction">
                <TextInput value={draft.reaction} onChange={(event) => setDraft((current) => ({ ...current, reaction: event.target.value.slice(0, 4) }))} placeholder="🔥" />
              </Field>
              {draft.type === "image" ? (
                <Field label="Image upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => readImageFile(event.target.files?.[0], (value) => setDraft((current) => ({ ...current, imageUrl: value })))}
                    className="w-full min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--foreground)]"
                  />
                </Field>
              ) : null}
              <Field label={draft.type === "image" ? "Caption" : "Message text"} className="lg:col-span-2">
                <textarea
                  value={draft.text}
                  onChange={(event) => setDraft((current) => ({ ...current, text: event.target.value }))}
                  className="min-h-28 w-full min-w-0 resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm font-semibold text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  placeholder={draft.type === "image" ? "Optional image caption..." : "Type message..."}
                />
              </Field>
            </div>

            <button type="button" className="btn-primary mt-5 w-full" onClick={addOrUpdateMessage}>
              {draft.id ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {draft.id ? "Update Bubble" : "Add Bubble"}
            </button>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                  <Edit3 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Chat history
                  </p>
                  <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Messages</h2>
                </div>
              </div>
              <label className="relative block min-w-0 lg:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <TextInput value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search chat..." />
              </label>
            </div>

            <div className="grid min-w-0 gap-2.5">
              {filteredMessages.map((message) => (
                <article
                  key={message.id}
                  className="group min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-[var(--card-shadow)]"
                >
                  <div className="grid min-w-0 gap-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full text-sm font-black text-white shadow-sm"
                      style={{ backgroundColor: message.sender === "me" ? theme.accent : "#8aa1e6" }}
                    >
                      {message.sender === "me" && settings.meAvatar ? (
                        <img src={settings.meAvatar} alt="" className="h-full w-full object-cover" />
                      ) : message.sender === "them" && settings.themAvatar ? (
                        <img src={settings.themAvatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials(message.sender === "me" ? settings.meName : settings.themName)
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <span className="min-w-0 break-words text-sm font-black text-[var(--foreground)]">
                          {message.sender === "me" ? settings.meName : settings.themName}
                        </span>
                        <span
                          className="rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wide"
                          style={{
                            backgroundColor: `${theme.accent}18`,
                            color: theme.accent,
                          }}
                        >
                          {message.type}
                        </span>
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[0.68rem] font-bold text-[var(--muted-foreground)]">
                          {message.time}
                        </span>
                        {message.sender === "me" && settings.showRead ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold"
                            style={{
                              backgroundColor: `${message.status === "seen" ? theme.read : theme.sent}18`,
                              color: message.status === "seen" ? theme.read : theme.sent,
                            }}
                          >
                            <CheckCheck className="h-3 w-3" />
                            {STATUS_LABELS[message.status]}
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={`mt-2 max-w-full rounded-2xl px-3 py-2 text-sm font-semibold leading-relaxed shadow-sm ${
                          message.sender === "me" ? "rounded-br-md" : "rounded-bl-md"
                        }`}
                        style={{
                          backgroundColor: message.sender === "me" ? currentMineBubble : currentTheirsBubble,
                          color: message.sender === "me" ? currentMyText : currentOtherText,
                          borderRadius: theme.flat ? 4 : theme.radius,
                          border: theme.flat ? `1px solid ${theme.hoverMessage || "transparent"}` : undefined,
                          boxShadow: theme.flat ? "none" : undefined,
                        }}
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          {message.type === "image" ? (
                            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
                              {message.imageUrl ? (
                                <img src={message.imageUrl} alt="" className="h-full w-full object-contain" />
                              ) : (
                                <ImageIcon className="h-5 w-5" style={{ color: currentMutedText }} />
                              )}
                            </span>
                          ) : null}
                          <p className="min-w-0 flex-1 break-words">
                            {message.text || (message.type === "image" ? "Image preview" : "Empty message")}
                            {message.reaction ? <span className="ml-2">{message.reaction}</span> : null}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] sm:w-10 sm:px-0"
                        onClick={() => editMessage(message)}
                        aria-label="Edit message"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-9 min-w-0 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-bold text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] sm:w-10 sm:px-0"
                        onClick={() => setMessages((current) => current.filter((entry) => entry.id !== message.id))}
                        aria-label="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="tool-card min-w-0 overflow-hidden">
            <div className="mb-5 flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--section-highlight)] text-[var(--primary)]">
                <Maximize2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="break-words text-xs font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Preview config
                </p>
                <h2 className="break-words text-2xl font-black text-[var(--foreground)]">Phone & Export Controls</h2>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Field label="Phone time">
                <TextInput type="time" value={settings.phoneTime} onChange={(event) => updateSetting("phoneTime", event.target.value)} />
              </Field>
              <Field label="Battery %">
                <TextInput
                  type="number"
                  min="1"
                  max="100"
                  value={settings.battery}
                  onChange={(event) => updateSetting("battery", Math.max(1, Math.min(100, Number(event.target.value) || 1)))}
                />
              </Field>
              <Field label="Preview width">
                <TextInput
                  type="number"
                  min="280"
                  max="430"
                  value={settings.previewWidth}
                  onChange={(event) => updateSetting("previewWidth", Math.max(280, Math.min(430, Number(event.target.value) || 390)))}
                />
              </Field>
              <Field label="Fixed height">
                <TextInput
                  type="number"
                  min="560"
                  max="920"
                  value={settings.phoneHeight}
                  onChange={(event) => updateSetting("phoneHeight", Math.max(560, Math.min(920, Number(event.target.value) || 690)))}
                />
              </Field>
              <Field label="Text size">
                <input
                  type="range"
                  min="12"
                  max="18"
                  value={settings.textScale}
                  onChange={(event) => updateSetting("textScale", Number(event.target.value))}
                  className="h-11 w-full min-w-0 accent-[var(--primary)]"
                />
              </Field>
            </div>

            <div className="mt-5 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                ["showStatus", "Status bar"],
                ["showFooter", "Footer"],
                ["showDate", "Date chip"],
                ["showRead", "Read ticks"],
                ["watermark", "Watermark"],
                ["darkMode", "Dark mode"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateSetting(key, !settings[key])}
                  className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-black transition ${
                    settings[key]
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {settings[key] ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  <span className="min-w-0 truncate">{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
              <button type="button" className="btn-primary" onClick={saveNow}>
                <Save className="h-4 w-4" />
                Save
              </button>
              <button type="button" className="btn-secondary" onClick={copyScript}>
                <Clipboard className="h-4 w-4" />
                Copy Script
              </button>
              <button type="button" className="btn-secondary" onClick={downloadJson}>
                <Download className="h-4 w-4" />
                JSON
              </button>
              <button type="button" className="btn-secondary" onClick={resetSample}>
                <RefreshCw className="h-4 w-4" />
                Sample
              </button>
              <button type="button" className="btn-secondary" onClick={() => setMessages([])}>
                <Trash2 className="h-4 w-4" />
                Clear Chat
              </button>
            </div>
          </article>
        </div>

        <div className="min-w-0 xl:sticky xl:top-24">
          <PhonePreview settings={settings} messages={messages} onDownloadPng={downloadPng} onDownloadSvg={downloadSvg} />

          <section className="mt-6 grid min-w-0 gap-4">
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <UploadCloud className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">Image Messages</h3>
              <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                Upload image bubbles from your device. Exports stay local in the browser.
              </p>
            </article>
            <article className="tool-card min-w-0 overflow-hidden !p-5">
              <User className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="mt-3 break-words text-lg font-black text-[var(--foreground)]">People & Status</h3>
              <p className="mt-2 break-words text-sm text-[var(--muted-foreground)]">
                Change sender names, avatars, online text, status bar, battery, and read marks.
              </p>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
