import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { forwardRef, useEffect, useRef, type ReactNode, type RefObject } from "react";

/**
 * Enlarge (Sergio, Oct 2026): a small corner button that opens a panel's content in a large modal.
 * Radix Dialog gives the focus trap, Esc to close and focus return; the corner button is outline when idle and filled while open,
 * like the Travel Book fullscreen button. Used only on the Logbook mini map and the uniform plate, never on text panels.
 */
export const EnlargeButton = forwardRef<HTMLButtonElement, { open: boolean; label: string; onClick: () => void }>(function EnlargeButton({ open, label, onClick }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={`nav-btn icon-btn logbook-enlarge${open ? " on" : ""}`}
      aria-label={label}
      title={label}
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <Maximize2 size={16} strokeWidth={2} aria-hidden="true" />
    </button>
  );
});

export function EnlargeDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  className,
  returnFocus,
  children,
}: {
  /** Element that gets focus back on close (the corner button), since the plate tap is not a Radix trigger. */
  returnFocus?: RefObject<HTMLElement | null>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  const frame = typeof document === "undefined" ? null : document.querySelector(".app-shell");
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={typeof HTMLElement !== "undefined" && frame instanceof HTMLElement ? frame : undefined}>
        <Dialog.Overlay className="enlarge-overlay" />
        <Dialog.Content
          className={`enlarge-modal${className ? ` ${className}` : ""}`}
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            const el = returnFocus?.current;
            if (el) {
              event.preventDefault();
              el.focus();
            }
          }}
        >
          <header className="enlarge-head">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {subtitle ? <p className="enlarge-sub">{subtitle}</p> : null}
            </div>
            <Dialog.Close className="nav-btn icon-btn enlarge-close" aria-label="Close">
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="enlarge-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Large plate with arrows, arrow keys and swipe between the command's plates. */
export function PlateViewer({
  plates,
  index,
  onIndex,
}: {
  plates: { src: string; caption: string; file: string }[];
  index: number;
  onIndex: (index: number) => void;
}) {
  const count = plates.length;
  const plate = plates[Math.max(0, Math.min(count - 1, index))];
  const go = (delta: number) => count > 1 && onIndex((index + delta + count) % count);
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goRef.current(-1);
      if (event.key === "ArrowRight") goRef.current(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const touch = useRef<{ x: number; y: number } | null>(null);
  if (!plate) return null;
  return (
    <div
      className="plate-viewer"
      onTouchStart={(event) => {
        const t = event.touches[0];
        touch.current = t ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(event) => {
        const start = touch.current;
        const t = event.changedTouches[0];
        touch.current = null;
        if (!start || !t) return;
        const dx = t.clientX - start.x;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(t.clientY - start.y)) go(dx < 0 ? 1 : -1);
      }}
    >
      <figure className="plate-viewer-figure">
        <img key={plate.file} src={plate.src} alt={plate.caption} />
      </figure>
      {count > 1 ? (
        <div className="plate-viewer-nav">
          <button type="button" className="nav-btn icon-btn" aria-label="Previous plate" onClick={() => go(-1)}>
            <ChevronLeft size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <p aria-live="polite">{plate.caption} · {index + 1} of {count}</p>
          <button type="button" className="nav-btn icon-btn" aria-label="Next plate" onClick={() => go(1)}>
            <ChevronRight size={20} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <p className="plate-viewer-caption">{plate.caption}</p>
      )}
    </div>
  );
}
