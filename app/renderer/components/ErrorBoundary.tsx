import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from 'lucide-react';

interface Props {
children: ReactNode;
}

interface State {
hasError: boolean;
error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
public state: State = {
hasError: false
};

public static getDerivedStateFromError(error: Error): State {
return { hasError: true, error };
}

public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
console.error("Uncaught error:", error, errorInfo);
}

public render() {
if (this.state.hasError) {
return (
<div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-md text-center border border-red-200 dark:border-red-900">
<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong.</h1>
<p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
{this.state.error?.message || "An unexpected error occurred in the renderer process."}
</p>
<button
onClick={() => window.location.reload()}
className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
>
Reload Application
</button>
</div>
</div>
);
}

code
Code
download
content_copy
expand_less
return this.props.children;

}
}

export default ErrorBoundary;
