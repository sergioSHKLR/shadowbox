import { Component, type ReactNode } from "react";

/**
 * Contains render/effect errors to one region. Without it, any uncaught throw
 * (e.g. from Leaflet inside a map effect) unmounts the whole app and blanks the page.
 */
export class Boundary extends Component<
  { children: ReactNode; fallback?: ReactNode; resetKey?: unknown; label?: string },
  { failed: boolean; key: unknown }
> {
  state = { failed: false, key: this.props.resetKey };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  static getDerivedStateFromProps(
    props: { resetKey?: unknown },
    state: { failed: boolean; key: unknown },
  ) {
    if (props.resetKey !== state.key) return { failed: false, key: props.resetKey };
    return null;
  }

  componentDidCatch(error: unknown) {
    console.warn(`[${this.props.label ?? "view"}] recovered from error:`, error instanceof Error ? error.message : error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? <p className="quiet">This section could not load. Refresh to try again.</p>;
    return this.props.children;
  }
}
