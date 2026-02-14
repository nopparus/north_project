
import React from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onReset?: () => void; // called when user clicks logout on error screen
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || String(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[FiberFlow] Uncaught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
          <div className="max-w-md w-full bg-slate-900 border border-red-800/40 rounded-2xl p-8 shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-900/40 p-4 rounded-2xl">
                <AlertTriangle className="text-red-400" size={36} />
              </div>
            </div>
            <h2 className="text-xl font-black text-white mb-2">เกิดข้อผิดพลาด</h2>
            <p className="text-sm text-slate-400 mb-2">แอปพลิเคชันเกิดข้อผิดพลาดที่ไม่คาดคิด</p>
            {this.state.errorMessage && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 mb-6 text-left">
                <p className="text-[10px] font-mono text-red-400 break-all">{this.state.errorMessage}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all text-sm"
              >
                <RefreshCw size={15} />
                รีเฟรช
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all text-sm"
              >
                <LogOut size={15} />
                ออกระบบ
              </button>
            </div>
            <p className="text-[10px] text-slate-600 mt-4">
              หากปัญหายังคงอยู่ กรุณาออกระบบแล้วเข้าใหม่
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
