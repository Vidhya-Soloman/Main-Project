// ErrorBoundary.jsx
import React, { Component } from "react";

class ErrorBoundary extends Component {
constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
}

static getDerivedStateFromError(error) {
    return { hasError: true };
}

componentDidCatch(error, info) {
    this.setState({ errorInfo: info });
    console.error("Error caught in ErrorBoundary:", error, info);
}

render() {
    if (this.state.hasError) {
    return (
        <div>
        <h1>Something went wrong.</h1>
        <details>
            <summary>Click to view error details</summary>
            <pre>{this.state.errorInfo.componentStack}</pre>
        </details>
        </div>
    );
    }
    return this.props.children;
}
}

export default ErrorBoundary;
