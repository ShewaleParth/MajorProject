import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    margin: '20px',
                    border: '2px solid #ff4444',
                    borderRadius: '8px',
                    backgroundColor: '#fff5f5'
                }}>
                    <h1 style={{ color: '#ff4444' }}>⚠️ Something went wrong</h1>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Click for error details
                        </summary>
                        <p style={{ marginTop: '10px' }}>
                            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                        </p>
                        <p>
                            <strong>Stack:</strong>
                            <pre style={{
                                backgroundColor: '#f5f5f5',
                                padding: '10px',
                                borderRadius: '4px',
                                overflow: 'auto'
                            }}>
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </p>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
