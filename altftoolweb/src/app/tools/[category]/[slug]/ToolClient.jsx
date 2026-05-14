"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, createElement, useMemo } from "react";
import { Search } from "lucide-react";
import DataStateNotice from "@/components/ui/DataStateNotice";
import { loadToolModule } from "../../toolLoaderResolver";
import ToolDetailChrome from "./ToolDetailChrome";
import { ToolModuleSkeleton } from "./ToolDetailSkeleton";

class ToolRuntimeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.slug !== this.props.slug && this.state.error) {
      this.setState({ error: null, resetKey: 0 });
    }
  }

  reset = () => {
    this.setState((state) => ({
      error: null,
      resetKey: state.resetKey + 1,
    }));
  };

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto w-full max-w-5xl space-y-3">
          <DataStateNotice
            tone="danger"
            title="Tool workspace could not load"
            message="This microtool hit a runtime error. Retry the workspace or open the tools catalog while we keep the route shell stable."
            actionLabel="Try again"
            onAction={this.reset}
          />
          <div className="flex flex-wrap gap-2">
            <Link
              href="/tools/all"
              className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary)"
            >
              <Search className="h-4 w-4" />
              Browse tools
            </Link>
          </div>
        </div>
      );
    }

    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}

export default function ToolClient({ slug, category = "all" }) {
  const Tool = useMemo(
    () =>
      dynamic(() => loadToolModule(slug), {
        ssr: false,
        loading: () => <ToolModuleSkeleton />,
      }),
    [slug],
  );

  return (
    <ToolDetailChrome slug={slug} category={category}>
      <ToolRuntimeBoundary slug={slug}>
        {createElement(Tool)}
      </ToolRuntimeBoundary>
    </ToolDetailChrome>
  );
}
