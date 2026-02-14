
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center font-mono">
                    <div className="max-w-4xl w-full bg-white p-8 rounded-xl shadow-2xl border border-red-200">
                        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-4xl">💥</span> Application Crashed
                        </h1>
                        <div className="bg-red-100 p-4 rounded-lg mb-6 border border-red-200">
                            <p className="font-bold text-lg">{this.state.error?.toString()}</p>
                        </div>

                        <div className="bg-slate-900 text-slate-50 p-6 rounded-lg overflow-auto max-h-[400px] text-sm leading-relaxed mb-6">
                            <h3 className="text-slate-400 mb-2 uppercase tracking-widest text-xs font-bold border-b border-slate-700 pb-2">Component Stack</h3>
                            <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.reload();
                                }}
                                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
                            >
                                Clear LocalStorage & Reload
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
