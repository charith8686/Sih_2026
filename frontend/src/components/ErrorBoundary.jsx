import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          padding: "2rem"
        }}>
          <div style={{
            maxWidth: "500px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
            textAlign: "center"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              margin: "0 auto 1rem auto"
            }}>
              ⚠️
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "1.2rem", fontWeight: 700 }}>
              Something went wrong
            </h3>
            <p style={{ margin: "0 0 1.5rem 0", color: "#64748b", fontSize: "0.85rem", lineHeight: 1.4 }}>
              The Legal Metrology system encountered an unexpected UI render error. You can reload the page or return to the dashboard.
            </p>
            {this.state.error && (
              <pre style={{
                textAlign: "left",
                backgroundColor: "#f1f5f9",
                padding: "0.75rem",
                borderRadius: "6px",
                fontSize: "0.72rem",
                color: "#b91c1c",
                overflowX: "auto",
                marginBottom: "1.5rem"
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              style={{
                padding: "0.6rem 1.25rem",
                backgroundColor: "#1e3a8a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Reload System Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
