import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <h1>Une erreur est survenue</h1>
          <p>Veuillez recharger la page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
