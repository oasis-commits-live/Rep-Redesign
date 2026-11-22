import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RepLogo } from './RepLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: '',
  };

  static getDerivedStateFromError(error: Error): State {
    let friendly = 'Something unexpected happened. Please reload to continue.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed && typeof parsed.error === 'string') {
        if (/permission/i.test(parsed.error)) {
          friendly = 'We could not sync that action due to account permissions. Please reload or sign in again.';
        } else if (/quota/i.test(parsed.error)) {
          friendly = 'Daily database limit reached. Your data is safe locally and will sync once the limit resets.';
        }
      }
    } catch {
      // Standard error message
    }
    return { hasError: true, message: friendly };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-black px-6 text-center">
          <div className="w-16 h-16 rounded-[20px] mb-5">
            <RepLogo size={64} radius={20} />
          </div>
          <h1 className="text-[22px] font-bold text-[#1c1c1e] dark:text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-[14px] text-[#636366] dark:text-[#aeaeb2] max-w-xs mb-6 leading-relaxed">
            {this.state.message}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 rounded-[14px] bg-[#34C759] text-white text-[15px] font-semibold"
          >
            Reload Rep
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
