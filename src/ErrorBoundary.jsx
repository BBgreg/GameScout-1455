import React from 'react';
import ErrorDisplay from './common/ErrorDisplay';
import * as FiIcons from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-4">
          <ErrorDisplay 
            error={this.state.error || "Something went wrong. Please refresh the page and try again."}
            title="Application Error"
            icon={FiIcons.FiAlertOctagon}
            bgClass="bg-red-900/50"
            textClass="text-red-200"
            iconClass="text-red-400"
            titleClass="text-red-300"
          />
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;