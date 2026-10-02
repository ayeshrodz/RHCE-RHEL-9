import { Component, lazy, Suspense } from 'react';

class WidgetBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="widget" role="alert">
          <p>This activity could not load. Your saved progress is kept.</p>
          <button className="btn" onClick={() => window.location.reload()}>
            Reload the page
          </button>
        </div>
      );
    return this.props.children;
  }
}
export function lazyWidget(load) {
  const Widget = lazy(load);
  return function DeferredWidget(props) {
    return (
      <WidgetBoundary>
        <Suspense
          fallback={
            <div className="widget" role="status">
              Loading activity…
            </div>
          }
        >
          <Widget {...props} />
        </Suspense>
      </WidgetBoundary>
    );
  };
}
