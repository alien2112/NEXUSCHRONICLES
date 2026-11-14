import { Component } from 'react';

export default class PageBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="relative z-10 min-h-screen pt-28 px-6 text-white" role="alert">
          <p>This page could not be loaded. Please reload to try again.</p>
          <button type="button" className="mt-4 underline" onClick={() => window.location.reload()}>Reload page</button>
        </main>
      );
    }
    return this.props.children;
  }
}
