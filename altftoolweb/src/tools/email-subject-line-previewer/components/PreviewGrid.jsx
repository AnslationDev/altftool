import React, { useState } from 'react';
import { Inbox, Smartphone, Laptop, Search, Mail } from 'lucide-react';
import { PREVIEW_CLIENTS, truncateText } from '../utils/subjectLine';

const getAvatarColors = (sender) => {
  const char = (sender ? sender.trim().charAt(0) : 'S').toUpperCase();
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-rose-500 to-pink-600',
    'from-emerald-400 to-teal-600',
    'from-amber-400 to-orange-600',
    'from-purple-500 to-violet-600',
    'from-fuchsia-500 to-purple-600',
  ];
  const index = char.charCodeAt(0) % colors.length;
  return {
    initials: char,
    gradient: colors[index],
  };
};

const MOCK_INBOX_EMAILS = [
  {
    id: 1,
    sender: "Stripe Support",
    initials: "S",
    gradient: "from-purple-500 to-indigo-600",
    time: "10:15 AM",
    subject: "Payout of $1,420.50 transferred successfully",
    body: "We have initiated a transfer to your bank account ending in 4242. Standard processing takes...",
    unread: false
  },
  {
    id: 2,
    sender: "Slack Notification",
    initials: "SL",
    gradient: "from-yellow-400 to-amber-500",
    time: "9:05 AM",
    subject: "New mention in #marketing-campaigns by @alex",
    body: "alex: 'Let's review the new email subject line ideas today. Let's make sure the preheader matches...'",
    unread: true
  },
  {
    id: 3,
    sender: "Figma Team",
    initials: "F",
    gradient: "from-rose-500 to-pink-600",
    time: "8:42 AM",
    subject: "@lisa commented on 'AltF Landing Page v3'",
    body: "lisa: 'I really love the clean rounded-xl cards on this dashboard. Excellent contrast.'",
    unread: false
  },
  {
    id: 4,
    sender: "GitHub Security",
    initials: "GH",
    gradient: "from-neutral-700 to-neutral-900",
    time: "Yesterday",
    subject: "[Security] 2 dependencies need urgent updates",
    body: "We found 2 vulnerable dependencies in your repository. Click here to open a pull request and...",
    unread: true
  },
  {
    id: 5,
    sender: "Google Workspace",
    initials: "G",
    gradient: "from-blue-500 via-red-500 to-yellow-500",
    time: "May 18",
    subject: "Monthly Google Cloud billing invoice ready",
    body: "Your invoice for AltF Tools is now available. The total charge has been debited from your card...",
    unread: false
  }
];

export default function PreviewGrid({ email }) {
  const [activeTab, setActiveTab] = useState('gmailMobile');

  const activeClient = PREVIEW_CLIENTS.find(c => c.key === activeTab) || PREVIEW_CLIENTS[0];

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl transition-all duration-200">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
          Inbox Previews
        </h2>

        {/* Navigation Tabs */}
        <div className="flex rounded-lg bg-[var(--secondary-bg)]/80 p-0.5 border border-[var(--card-border)]/50">
          {PREVIEW_CLIENTS.map((client) => {
            const isActive = activeTab === client.key;
            const isMobile = client.key.includes('Mobile');

            return (
              <button
                key={client.key}
                type="button"
                onClick={() => setActiveTab(client.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm'
                    : 'text-[var(--secondary-foreground)]/80 hover:text-[var(--foreground)]'
                }`}
              >
                {isMobile ? <Smartphone size={13} /> : <Laptop size={13} />}
                {client.label.replace(' Mobile', '').replace(' Desktop', '')}
                <span className="hidden sm:inline-block text-[9px] opacity-60">
                  {isMobile ? 'Mobile' : 'Desktop'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Full-Width Simulated Preview Card */}
      <div className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-1.5 shadow-inner">
        {/* Simulated Browser/Client Outer Shell */}
        <div className="flex flex-col rounded-lg bg-[var(--card)]/40 overflow-hidden min-h-[380px]">

          {/* Client Header bar */}
          <ClientHeader clientKey={activeTab} email={email} />

          {/* Scrollable Inbox Emails List */}
          <div className="h-[300px] overflow-y-auto px-3.5 py-2.5 space-y-2 scrollbar-thin">

            {/* Our active email draft */}
            <DraftEmailRow client={activeClient} email={email} />

            {/* Companion Mock emails */}
            {MOCK_INBOX_EMAILS.map((mockMail) => (
              <MockEmailRow key={mockMail.id} mail={mockMail} client={activeClient} />
            ))}
          </div>

          {/* Client Footer info */}
          <div className="border-t border-[var(--card-border)]/30 px-3.5 py-1.5 bg-[var(--secondary-bg)]/25 flex items-center justify-between text-[9px] text-[var(--secondary-foreground)]/80 font-mono">
            <span>Client: {activeClient.label}</span>
            <span>Unread: {MOCK_INBOX_EMAILS.filter(m => m.unread).length + 1} messages</span>
          </div>

        </div>
      </div>
    </section>
  );
}

function ClientHeader({ clientKey, email }) {
  if (clientKey === 'gmailMobile') {
    return (
      <div className="px-3.5 py-2 border-b border-[var(--card-border)]/30 bg-[var(--secondary-bg)]/20 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[var(--input-bg)] rounded-full px-3 py-1.5 border border-[var(--input-border)]">
          <Search size={12} className="text-[var(--secondary-foreground)]/60" />
          <span className="text-[10px] text-[var(--secondary-foreground)]/60 font-medium">Search in mail</span>
        </div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[9px] font-bold text-white flex items-center justify-center shadow-sm shrink-0">
          U
        </div>
      </div>
    );
  }

  if (clientKey === 'gmailDesktop') {
    return (
      <div className="px-4 py-2 border-b border-[var(--card-border)]/30 bg-[var(--secondary-bg)]/25 flex items-center gap-4">
        {/* Browser Navigation Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs font-bold text-[var(--secondary-foreground)]/40 hover:text-[var(--foreground)] cursor-not-allowed select-none">&larr;</span>
          <span className="text-xs font-bold text-[var(--secondary-foreground)]/40 hover:text-[var(--foreground)] cursor-not-allowed select-none">&rarr;</span>
          <span className="text-xs font-bold text-[var(--secondary-foreground)]/50 hover:text-[var(--foreground)] cursor-pointer select-none">&#x21BB;</span>
        </div>

        {/* Gmail Search Bar */}
        <div className="flex-1 flex items-center gap-2.5 bg-[var(--input-bg)] rounded-full px-4 py-1 border border-[var(--input-border)]">
          <Search size={12} className="text-[var(--secondary-foreground)]/60" />
          <span className="text-[10px] text-[var(--secondary-foreground)]/60 font-medium">Search mail</span>
        </div>

        {/* Gmail Brand Indicator */}
        <span className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-2.5 py-0.5 rounded border border-[var(--primary)]/15 shrink-0">
          Gmail Web
        </span>
      </div>
    );
  }

  if (clientKey === 'appleMail') {
    return (
      <div className="px-4 py-2 border-b border-[var(--card-border)]/30 bg-[var(--secondary-bg)]/20 flex items-center justify-between">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
        </div>

        {/* macOS Mail Title */}
        <span className="text-xs font-bold text-[var(--foreground)] font-sans tracking-tight">Inbox — iCloud</span>

        {/* Apple Mail Search */}
        <div className="flex items-center gap-1 bg-[var(--input-bg)] rounded px-2.5 py-0.5 border border-[var(--input-border)] w-36">
          <Search size={10} className="text-[var(--secondary-foreground)]/50" />
          <span className="text-[9px] text-[var(--secondary-foreground)]/50">Search</span>
        </div>
      </div>
    );
  }

  // Outlook
  return (
    <div className="px-4 py-2 border-b border-[var(--card-border)]/30 bg-[var(--primary)]/90 flex items-center justify-between text-white shadow-sm">
      <div className="flex items-center gap-2">
        <Mail size={12} />
        <span className="text-[10px] font-bold tracking-wide">Outlook</span>
      </div>
      <div className="bg-white/10 rounded px-2 py-0.5 text-[9px] text-white/80 w-40 flex items-center gap-1 border border-white/5">
        <Search size={10} className="text-white/60" />
        <span>Search mail</span>
      </div>
    </div>
  );
}

function DraftEmailRow({ client, email }) {
  const avatar = getAvatarColors(email.sender);

  return (
    <article className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3.5 shadow-sm transition-all duration-200 border-l-4 border-l-[var(--primary)]">
      <div className="flex items-start gap-3">
        <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatar.gradient} text-[10px] font-black text-white shadow-sm`}>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${avatar.gradient}`} />
          <span className="relative z-10">{avatar.initials}</span>
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--primary)] border-2 border-[var(--background)] animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-black text-[var(--foreground)]">
              {email.sender || 'Sender'}
            </span>
            <span className="text-[9px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded-full border border-[var(--primary)]/10 shrink-0">
              Active Draft
            </span>
          </div>

          <div className="mt-1">
            <p className="truncate text-xs font-black text-[var(--foreground)]">
              {truncateText(email.subject || 'Subject line preview', client.subjectLimit)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--secondary-foreground)] font-medium leading-relaxed">
              {truncateText(email.preview || 'Preview text appears here.', client.previewLimit)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[var(--card-border)]/20 flex items-center justify-between text-[9px] text-[var(--secondary-foreground)]/70">
        <span>To: <span className="font-mono font-bold text-[var(--foreground)]">{email.inbox || 'subscriber@example.com'}</span></span>
        <span className="font-semibold text-[var(--primary)]">Ideal Subject Limit: {client.subjectLimit} ch</span>
      </div>
    </article>
  );
}

function MockEmailRow({ mail, client }) {
  return (
    <article className="rounded-lg border border-[var(--card-border)]/30 bg-[var(--background)]/40 p-3 transition-all duration-200 hover:bg-[var(--secondary-bg)]/20 hover:border-[var(--card-border)]/65">
      <div className="flex items-start gap-3">
        <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${mail.gradient} text-[10px] font-bold text-white shadow-sm opacity-80`}>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${mail.gradient}`} />
          <span className="relative z-10">{mail.initials}</span>
          {mail.unread && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-[var(--background)]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`truncate text-xs ${mail.unread ? 'font-black text-[var(--foreground)]' : 'font-semibold text-[var(--foreground)]/80'}`}>
              {mail.sender}
            </span>
            <span className="text-[9px] text-[var(--secondary-foreground)]/50 font-medium shrink-0">
              {mail.time}
            </span>
          </div>

          <div className="mt-0.5">
            <p className={`truncate text-xs ${mail.unread ? 'font-bold text-[var(--foreground)]/90' : 'font-medium text-[var(--foreground)]/70'}`}>
              {truncateText(mail.subject, client.subjectLimit)}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-[var(--secondary-foreground)]/60 font-medium">
              {truncateText(mail.body, client.previewLimit)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
