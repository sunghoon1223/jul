import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto text-center p-6 bg-white rounded-lg shadow-lg">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">앱 로딩 오류</h1>
            <p className="text-gray-600 mb-6">
              앱을 로딩하는 중에 오류가 발생했습니다.
            </p>
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                기술적인 정보 보기
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-sm font-mono">
                <p><strong>오류:</strong> {this.state.error?.message}</p>
                <p><strong>스택:</strong></p>
                <pre className="text-xs mt-1 whitespace-pre-wrap">
                  {this.state.error?.stack}
                </pre>
              </div>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}