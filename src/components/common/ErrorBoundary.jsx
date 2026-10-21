import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('Page failed to render', error, info); }
  render() {
    if (this.state.error) return (
      <div role="alert" className="p-8 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white space-y-4">
        <h1 className="text-2xl font-bold">This page could not load</h1>
        <p>Please try again. If the problem continues, check the browser console for details.</p>
        <button className="px-4 py-2 rounded-xl bg-brand-600 text-white" onClick={() => window.location.reload()}>Reload page</button>
        <a className="ml-4 underline" href="/">Go to dashboard</a>
      </div>
    );
    return this.props.children;
  }
}
