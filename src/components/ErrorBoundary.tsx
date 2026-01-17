import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("🚨 Error caught by boundary:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Error details:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", textAlign: "center", fontFamily: "monospace" }}>
          <h1>❌ Application Error</h1>
          <p>{this.state.error?.message}</p>
          <p style={{ color: "#666", fontSize: "12px" }}>Check console for more details</p>
        </div>
      );
    }

    return this.props.children;
  }
}
