"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

type ModalProps = {
  children: ReactNode;
  onClose: () => void;
  ariaLabel: string;
};

const FOCUSABLE_SELECTOR = [
  `a[href]`,
  `button:not(:disabled)`,
  `input:not(:disabled)`,
  `select:not(:disabled)`,
  `textarea:not(:disabled)`,
  `[tabindex]:not([tabindex="-1"])`,
].join(",");

export default function Modal({ children, onClose, ariaLabel }: ModalProps) {

  const modalRef = useRef<HTMLDivElement>(null); 
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const modal = modalRef.current;

    if (!modal) return;

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const getFocusableElements = () => {
      return Array.from(
        modal.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        )
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true"
      );
    };

    const focusFirstElement = () => {
      const focusableElements = getFocusableElements();

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        modal!.focus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        modal!.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    focusFirstElement();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      if (previousActiveElement?.isConnected) {
        previousActiveElement.focus();
      }
    };
  }, []);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      <div
        ref={modalRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

