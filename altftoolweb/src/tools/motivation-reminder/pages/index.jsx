"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Check,
  X,
  Calendar,
} from "lucide-react";

export default function MotivationReminder() {
  const [reminders, setReminders] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    time: "09:00",
    message: "",
    enabled: true,
  });
  const [notificationPermission, setNotificationPermission] =
    useState("default");

  // Load reminders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("motivationReminders");
    if (saved) {
      setReminders(JSON.parse(saved));
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem("motivationReminders", JSON.stringify(reminders));
    }
  }, [reminders]);

  // Check reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      reminders.forEach((reminder) => {
        if (reminder.enabled && reminder.time === currentTime) {
          if (reminder.lastTriggered !== currentTime) {
            showNotification(reminder.message);
            // Update last triggered time
            setReminders((prev) =>
              prev.map((r) =>
                r.id === reminder.id ? { ...r, lastTriggered: currentTime } : r
              )
            );
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [reminders]);

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        showNotification("Great! You'll now receive motivation reminders.");
      }
    }
  };

  const showNotification = (message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💪 Motivation Reminder", {
        body: message,
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>✨</text></svg>",
        badge:
          "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>💪</text></svg>",
        tag: "motivation-reminder",
        requireInteraction: false,
      });
    }
  };

  const addReminder = () => {
    if (!newReminder.message.trim()) {
      alert("Please enter a motivation message!");
      return;
    }

    const reminder = {
      id: Date.now(),
      time: newReminder.time,
      message: newReminder.message,
      enabled: true,
      lastTriggered: null,
    };

    setReminders([...reminders, reminder]);
    setNewReminder({ time: "09:00", message: "", enabled: true });
    setShowAddForm(false);
  };

  const deleteReminder = (id) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const toggleReminder = (id) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const motivationalQuotes = [
    "Believe you can and you're halfway there.",
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "You are never too old to set another goal or to dream a new dream.",
    "The only impossible journey is the one you never begin.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
  ];

  const selectQuote = (quote) => {
    setNewReminder({ ...newReminder, message: quote });
  };

  const testNotification = () => {
    if (Notification.permission === "granted") {
      showNotification(
        "This is a test notification! Your reminders will look like this."
      );
    } else {
      alert("Please enable notifications first!");
    }
  };

  return (
    <div className="min-h-screen bg-(--background) py-12 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-(--primary)/10 mb-2">
            <Sparkles className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-(--foreground) tracking-tight">
            Stay Motivated Every Day
          </h1>
          <p className="text-lg text-(--muted-foreground) max-w-2xl mx-auto">
            Schedule daily motivation reminders to keep you inspired and focused on your goals directly in your browser.
          </p>
        </div>

        {/* Notification Permission Card */}
        {notificationPermission !== "granted" && (
          <div className="bg-(--card) border border-(--primary) text-(--foreground) rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-(--primary)" />
            <div className="flex items-start gap-4">
              <Bell className="w-8 h-8 shrink-0 mt-1 text-(--primary)" />
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Enable Notifications</h3>
                <p className="mb-4 text-(--muted-foreground)">
                  Allow notifications to receive your daily motivation reminders at scheduled times.
                </p>
                <button
                  onClick={requestNotificationPermission}
                  className="bg-(--primary) text-white font-semibold px-6 py-2 rounded-xl hover:bg-(--primary)/90 transition-all active:scale-[0.98]"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-(--card) p-6 rounded-2xl border border-(--border) shadow-sm">
          <h2 className="text-2xl font-bold text-(--foreground)">Your Reminders</h2>
          <div className="flex gap-3 w-full sm:w-auto">
            {notificationPermission === "granted" && (
              <button
                onClick={testNotification}
                className="flex-1 sm:flex-none bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) font-medium px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-(--border)"
              >
                <Bell className="w-4 h-4" />
                Test
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex-1 sm:flex-none bg-(--primary) hover:bg-(--primary)/90 text-white font-semibold px-6 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Reminder
            </button>
          </div>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="bg-(--card) rounded-2xl shadow-sm border border-(--border) p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-xl font-bold text-(--foreground) mb-4">
              Create New Reminder
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-(--foreground) font-semibold mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, time: e.target.value })
                  }
                  className="w-full h-12 bg-(--background) border border-(--border) text-(--foreground) rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-(--foreground) font-semibold mb-2">
                  Motivation Message
                </label>
                <textarea
                  value={newReminder.message}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, message: e.target.value })
                  }
                  placeholder="Enter your motivation message..."
                  className="w-full h-24 bg-(--background) border border-(--border) text-(--foreground) rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 transition-all resize-none"
                />
              </div>

              {/* Quick Quotes */}
              <div>
                <label className="block text-(--foreground) font-semibold mb-2">
                  Or Choose a Quote
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                  {motivationalQuotes.map((quote, index) => (
                    <button
                      key={index}
                      onClick={() => selectQuote(quote)}
                      className="bg-(--background) hover:bg-(--muted) text-(--foreground) text-left px-4 py-3 rounded-xl text-sm transition-all border border-(--border)"
                    >
                      "{quote.substring(0, 45)}..."
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addReminder}
                className="flex-1 bg-(--primary) text-white font-semibold px-6 py-3 rounded-xl hover:bg-(--primary)/90 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Save Reminder
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-(--background) border border-(--border) hover:bg-(--muted) text-(--foreground) font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="bg-(--card) rounded-2xl shadow-sm border border-(--border) p-12 text-center">
              <div className="w-16 h-16 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-(--primary)" />
              </div>
              <h3 className="text-xl font-semibold text-(--foreground) mb-2">
                No Reminders Yet
              </h3>
              <p className="text-(--muted-foreground) mb-6">
                Create your first motivation reminder to get started!
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-(--primary) text-white font-semibold px-6 py-3 rounded-xl hover:bg-(--primary)/90 transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Reminder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`bg-(--card) rounded-2xl p-6 transition-all border ${
                    reminder.enabled
                      ? "border-(--primary)/30 hover:border-(--primary)/60 shadow-sm"
                      : "border-(--border) opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        reminder.enabled
                          ? "bg-(--primary)/10"
                          : "bg-(--muted)"
                      }`}
                    >
                      <Clock
                        className={`w-6 h-6 ${
                          reminder.enabled
                            ? "text-(--primary)"
                            : "text-(--muted-foreground)"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`text-2xl font-bold ${reminder.enabled ? 'text-(--primary)' : 'text-(--foreground)'}`}>
                            {reminder.time}
                          </p>
                          {reminder.enabled && (
                            <p className="text-xs text-green-500 font-medium">
                              Active
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleReminder(reminder.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              reminder.enabled
                                ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                : "bg-(--muted) text-(--muted-foreground) hover:bg-(--border)"
                            }`}
                          >
                            {reminder.enabled ? "ON" : "OFF"}
                          </button>
                          <button
                            onClick={() => deleteReminder(reminder.id)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-(--foreground) leading-relaxed mt-2 text-sm break-words">
                        {reminder.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-(--card) rounded-2xl border border-(--border) p-6 text-center hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-6 h-6 text-(--primary)" />
            </div>
            <h3 className="font-bold text-(--foreground) mb-2">Smart Reminders</h3>
            <p className="text-sm text-(--muted-foreground)">
              Receive OS-level notifications at your scheduled times without keeping the tab focused.
            </p>
          </div>
          <div className="bg-(--card) rounded-2xl border border-(--border) p-6 text-center hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-(--primary)" />
            </div>
            <h3 className="font-bold text-(--foreground) mb-2">Custom Messages</h3>
            <p className="text-sm text-(--muted-foreground)">
              Create your own motivational messages or pick from our curated collection of quotes.
            </p>
          </div>
          <div className="bg-(--card) rounded-2xl border border-(--border) p-6 text-center hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-(--primary)" />
            </div>
            <h3 className="font-bold text-(--foreground) mb-2">Daily Routine</h3>
            <p className="text-sm text-(--muted-foreground)">
              Build consistent motivation habits and train yourself to focus throughout the day.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
