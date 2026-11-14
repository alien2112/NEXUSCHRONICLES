import { useEffect, useRef } from 'react';

// Native modality keeps the background inert and handles Tab containment.
// Keep the caller's original overlay classes to preserve its presentation.
export default function Modal({ children, className = '', label, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`app-dialog ${className}`}
      aria-label={label}
      aria-modal="true"
      tabIndex={-1}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.key !== 'Tab') return;
        const controls = [...ref.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
          .filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'));
        const first = controls[0];
        const last = controls.at(-1);
        if (!first) {
          event.preventDefault();
          ref.current.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      {children}
    </dialog>
  );
}
