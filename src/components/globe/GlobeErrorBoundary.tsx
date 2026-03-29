"use client";

import { Component, type ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class GlobeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Knowledge graph unavailable</p>
            <p className="text-xs mt-1 opacity-60">WebGL may not be supported in this browser</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
