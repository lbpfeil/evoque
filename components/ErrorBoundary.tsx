import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center border border-zinc-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h1>
                        <p className="text-zinc-500 mb-6 text-sm leading-relaxed">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>

                        {this.state.error && (
                            <div className="mb-6 p-3 bg-zinc-50 rounded text-left overflow-auto max-h-32">
                                <p className="text-xs font-mono text-red-600 break-all">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-black text-white rounded-md font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
