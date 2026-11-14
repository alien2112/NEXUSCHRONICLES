import { Component } from 'react';
import siteContent from '../data/siteContent.json';

const { message, reloadLabel } = siteContent.app.errorBoundary;

export default class PageBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="relative z-10 min-h-screen pt-28 px-6 text-white" role="alert">
          <p>{message}</p>
          <button type="button" className="mt-4 underline" onClick={() => window.location.reload()}>{reloadLabel}</button>
        </main>
      );
    }
    return this.props.children;
  }
}
