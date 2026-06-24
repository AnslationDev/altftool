"use client";

import { EditorLayout } from "../../components/editor/EditorLayout";
import {
  CommonProfileFields,
  ChatBuilder,
  Field,
  AvatarUpload,
  CommentsBuilder,
  SearchResultsBuilder,
  NumberField,
} from "../../components/editor/EditorControls";

// Previews
import { WhatsAppPreview } from "../../components/editor/previews/WhatsAppPreview";
import { InstagramDMPreview } from "../../components/editor/previews/InstagramDMPreview";
import { TwitterPreview } from "../../components/editor/previews/TwitterPreview";
import { NotificationPreview } from "../../components/editor/previews/NotificationPreview";
import { InstagramPostPreview } from "../../components/editor/previews/InstagramPostPreview";
import { FacebookPostPreview } from "../../components/editor/previews/FacebookPostPreview";
import { YoutubeCommentPreview } from "../../components/editor/previews/YoutubeCommentPreview";
import { MessengerPreview } from "../../components/editor/previews/MessengerPreview";
import { TelegramPreview } from "../../components/editor/previews/TelegramPreview";
import { SnapchatPreview } from "../../components/editor/previews/SnapchatPreview";
import { LowBatteryPreview } from "../../components/editor/previews/LowBatteryPreview";
import { SearchResultsPreview } from "../../components/editor/previews/SearchResultsPreview";
import { ErrorPopupPreview } from "../../components/editor/previews/ErrorPopupPreview";
import { FakeCallPreview } from "../../components/editor/previews/FakeCallPreview";

import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { getTemplate } from "../../lib/templates";
import { useEditor } from "../../lib/editor-store";

export default function EditorClient({ slug }) {
  const tpl = getTemplate(slug);
  if (!tpl) return null;

  const sidebar = <SidebarForSlug slug={slug} />;
  const preview = (() => {
    switch (slug) {
      case "whatsapp": return <WhatsAppPreview />;
      case "instagram-dm": return <InstagramDMPreview />;
      case "twitter": return <TwitterPreview />;
      case "notification": return <NotificationPreview />;
      case "instagram-post": return <InstagramPostPreview />;
      case "facebook-post": return <FacebookPostPreview />;
      case "youtube": return <YoutubeCommentPreview />;
      case "messenger": return <MessengerPreview />;
      case "telegram": return <TelegramPreview />;
      case "snapchat": return <SnapchatPreview />;
      case "low-battery": return <LowBatteryPreview />;
      case "search-results": return <SearchResultsPreview />;
      case "error-popup": return <ErrorPopupPreview />;
      case "fake-call": return <FakeCallPreview />;
      default: return null;
    }
  })();

  return <EditorLayout title={tpl.name} sidebar={sidebar} preview={preview} />;
}

function SidebarForSlug({ slug }) {
  const state = useEditor();
  const { set } = state;

  // ─── 1. CHATS ─────────────────────────────────────────────────────────────
  if (["whatsapp", "instagram-dm", "messenger", "telegram"].includes(slug)) {
    return (
      <>
        <CommonProfileFields />
        <ChatBuilder />
      </>
    );
  }

  // ─── 2. SNAPCHAT ──────────────────────────────────────────────────────────
  if (slug === "snapchat") {
    const { username, avatar, time } = state;
    return (
      <>
        <AvatarUpload />
        <Field label="Display name">
          <Input value={username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Time/Timestamp">
          <Input value={time} onChange={(e) => set("time", e.target.value)} className="rounded-xl" />
        </Field>
        <AvatarUpload valueKey="postImage" label="Snap/Story image" />
        <ChatBuilder />
      </>
    );
  }

  // ─── 3. TWITTER ───────────────────────────────────────────────────────────
  if (slug === "twitter") {
    const { body, likes, views } = state;
    return (
      <>
        <CommonProfileFields />
        <Field label="Tweet body">
          <Textarea value={body} onChange={(e) => set("body", e.target.value)} rows={4} className="rounded-xl" />
        </Field>
        <NumberField label="Likes" storeKey="likes" />
        <NumberField label="Views" storeKey="views" />
      </>
    );
  }

  // ─── 4. INSTAGRAM POST ────────────────────────────────────────────────────
  if (slug === "instagram-post") {
    const { username, verified, caption, location, likes, theme, device } = state;
    return (
      <>
        <AvatarUpload />
        <Field label="Display name">
          <Input value={username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
        </Field>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
          <Label className="text-xs">Verified badge</Label>
          <Switch checked={verified} onCheckedChange={(v) => set("verified", v)} />
        </div>
        <Field label="Location">
          <Input value={location} onChange={(e) => set("location", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Caption text">
          <Textarea value={caption} onChange={(e) => set("caption", e.target.value)} rows={3} className="rounded-xl" />
        </Field>
        <AvatarUpload valueKey="postImage" label="Post image" />
        <NumberField label="Likes" storeKey="likes" />
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => set("theme", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="amoled">AMOLED</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </>
    );
  }

  // ─── 5. FACEBOOK POST ─────────────────────────────────────────────────────
  if (slug === "facebook-post") {
    const { username, verified, body, time, theme } = state;
    return (
      <>
        <AvatarUpload />
        <Field label="Display name">
          <Input value={username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
        </Field>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
          <Label className="text-xs">Verified badge</Label>
          <Switch checked={verified} onCheckedChange={(v) => set("verified", v)} />
        </div>
        <Field label="Post time">
          <Input value={time} onChange={(e) => set("time", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Post content text">
          <Textarea value={body} onChange={(e) => set("body", e.target.value)} rows={3} className="rounded-xl" />
        </Field>
        <AvatarUpload valueKey="postImage" label="Post image (optional)" />
        <NumberField label="Likes / Reactions" storeKey="likes" />
        <NumberField label="Shares count" storeKey="shares" />
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => set("theme", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="amoled">AMOLED</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <CommentsBuilder />
      </>
    );
  }

  // ─── 6. YOUTUBE COMMENT ───────────────────────────────────────────────────
  if (slug === "youtube") {
    const { username, verified, videoTitle, channelName, commentText, commentLikes, commentTime, theme } = state;
    return (
      <>
        <h3 className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-wide">Video Info</h3>
        <AvatarUpload valueKey="videoThumbnail" label="Video Thumbnail" />
        <Field label="Video Title">
          <Input value={videoTitle} onChange={(e) => set("videoTitle", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Channel Name">
          <Input value={channelName} onChange={(e) => set("channelName", e.target.value)} className="rounded-xl" />
        </Field>

        <h3 className="text-xs font-bold text-neutral-400 mt-4 uppercase tracking-wide">Commenter Info</h3>
        <AvatarUpload />
        <Field label="Commenter Name">
          <Input value={username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
        </Field>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-3 py-2">
          <Label className="text-xs">Verified badge</Label>
          <Switch checked={verified} onCheckedChange={(v) => set("verified", v)} />
        </div>
        <Field label="Comment Time/Date">
          <Input value={commentTime} onChange={(e) => set("commentTime", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Comment Text">
          <Textarea value={commentText} onChange={(e) => set("commentText", e.target.value)} rows={3} className="rounded-xl" />
        </Field>
        <NumberField label="Comment Likes" storeKey="commentLikes" />
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => set("theme", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="amoled">AMOLED</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <CommentsBuilder />
      </>
    );
  }

  // ─── 7. NOTIFICATION ──────────────────────────────────────────────────────
  if (slug === "notification") {
    const { username, body, time, device } = state;
    return (
      <>
        <AvatarUpload />
        <Field label="Notification Sender">
          <Input value={username} onChange={(e) => set("username", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Message body">
          <Textarea value={body} onChange={(e) => set("body", e.target.value)} rows={3} className="rounded-xl" />
        </Field>
        <Field label="Time/Timestamp">
          <Input value={time} onChange={(e) => set("time", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Device platform">
          <Select value={device} onValueChange={(v) => set("device", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="iphone">iOS (iPhone)</SelectItem>
              <SelectItem value="android">Android</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </>
    );
  }

  // ─── 8. LOW BATTERY ───────────────────────────────────────────────────────
  if (slug === "low-battery") {
    const { batteryLevel, os, theme } = state;
    return (
      <>
        <NumberField label="Battery Level (%)" storeKey="batteryLevel" />
        <Field label="OS System style">
          <Select value={os} onValueChange={(v) => set("os", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ios">iOS (iPhone)</SelectItem>
              <SelectItem value="android">Android</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => set("theme", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </>
    );
  }

  // ─── 9. SEARCH RESULTS ────────────────────────────────────────────────────
  if (slug === "search-results") {
    const { searchQuery, theme } = state;
    return (
      <>
        <Field label="Search Query">
          <Input value={searchQuery} onChange={(e) => set("searchQuery", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => set("theme", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="amoled">AMOLED</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <SearchResultsBuilder />
      </>
    );
  }

  // ─── 10. ERROR POPUP ──────────────────────────────────────────────────────
  if (slug === "error-popup") {
    const { errorTitle, errorMessage, errorOs, theme } = state;
    return (
      <>
        <Field label="Error Title">
          <Input value={errorTitle} onChange={(e) => set("errorTitle", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Error Message">
          <Textarea value={errorMessage} onChange={(e) => set("errorMessage", e.target.value)} rows={4} className="rounded-xl" />
        </Field>
        <Field label="Operating System">
          <Select value={errorOs} onValueChange={(v) => set("errorOs", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="windows">Windows</SelectItem>
              <SelectItem value="macos">macOS</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Theme">
          <Select value={theme} onValueChange={(v) => set("theme", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </>
    );
  }

  // ─── 11. FAKE CALL SCREEN ─────────────────────────────────────────────────
  if (slug === "fake-call") {
    const { callerName, callerNumber, device } = state;
    return (
      <>
        <AvatarUpload />
        <Field label="Caller Display Name">
          <Input value={callerName} onChange={(e) => set("callerName", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Caller Subtitle (Number/Location)">
          <Input value={callerNumber} onChange={(e) => set("callerNumber", e.target.value)} className="rounded-xl" />
        </Field>
        <Field label="Device platform">
          <Select value={device} onValueChange={(v) => set("device", v)}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="iphone">iOS (iPhone)</SelectItem>
              <SelectItem value="android">Android</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </>
    );
  }

  return null;
}
