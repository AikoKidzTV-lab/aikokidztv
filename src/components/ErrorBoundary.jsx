import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 text-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
            <p className="text-gray-400 mb-8">Please check your connection and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-accent text-black font-bold rounded-lg hover:bg-accent/80 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
