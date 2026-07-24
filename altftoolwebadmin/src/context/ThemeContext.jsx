"use client";

// Compatibility boundary for existing admin imports. Theme behavior is shared
// with the public app through @altftool/ui.
export {
  ThemeProvider as AdminThemeProvider,
  useThemeMode as useAdminTheme,
} from "@altftool/ui";
