"use client";

import { Component } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Last line of defence inside a widget iframe.
 *
 * A widget runs on someone else's page, where a blank frame is the worst
 * possible failure: the publisher cannot debug it and the visitor sees nothing.
 * A render error therefore degrades into a visible notice plus a link out to
 * the full tool, which `target="_top"` opens in the host page, not in the frame.
 *
 * Shared by every /embed/widget route so all three families fail the same way.
 */
export default class EmbedErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="m-4 flex items-center gap-3 rounded-[12px] border border-(--border) bg-(--surface) p-4 text-sm text-(--foreground)"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-(--warning)" aria-hidden="true" />
          <p>
            This widget hit a snag.{" "}
            <a
              href={this.props.fallbackHref}
              target="_top"
              className="font-semibold text-(--primary-text) underline underline-offset-2"
            >
              Open the full tool on AltFTool
            </a>
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
