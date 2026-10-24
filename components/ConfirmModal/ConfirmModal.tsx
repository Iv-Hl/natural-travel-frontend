"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ConfirmModal.module.css";

interface ConfirmModalProps {
  title: string;
  description?: string;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const backdropPointerDownRef = useRef(false);
  const confirmingRef = useRef(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null,
  );
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const bodyStyle = document.body.style;
    const previousOverflow = ["overflow-x", "overflow-y"].map((property) => ({
      property,
      value: bodyStyle.getPropertyValue(property),
      priority: bodyStyle.getPropertyPriority(property),
    }));

    dialog.showModal();
    bodyStyle.setProperty("overflow", "hidden", "important");
    cancelRef.current?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      for (const { property, value, priority } of previousOverflow) {
        bodyStyle.setProperty(property, value, priority);
      }
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  const handleConfirm = async () => {
    if (confirmingRef.current) return;

    confirmingRef.current = true;
    setIsConfirming(true);
    setConfirmationError(null);

    try {
      await onConfirm();
    } catch {
      setConfirmationError("Не вдалося виконати дію. Спробуйте ще раз.");
    } finally {
      confirmingRef.current = false;
      setIsConfirming(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onPointerDown={(event) => {
        backdropPointerDownRef.current = event.target === event.currentTarget;
      }}
      onPointerUp={(event) => {
        if (event.target !== event.currentTarget) {
          backdropPointerDownRef.current = false;
        }
      }}
      onClick={(event) => {
        if (
          backdropPointerDownRef.current &&
          event.target === event.currentTarget
        ) {
          onCancel();
        }
        backdropPointerDownRef.current = false;
      }}
    >
      <div className={styles.dialog}>
        <button
          className={styles.closeButton}
          type="button"
          onClick={onCancel}
          aria-label="Закрити діалог"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <use href="/icons/symbol-defs.svg#icon-close" />
          </svg>
        </button>

        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          )}
          {confirmationError && (
            <p className={styles.error} role="alert">
              {confirmationError}
            </p>
          )}
          {isConfirming && (
            <p className={styles.status} role="status">
              Виконується дія…
            </p>
          )}
          <div className={styles.actions}>
            <button
              ref={cancelRef}
              className={`${styles.button} ${styles.secondary}`}
              type="button"
              onClick={onCancel}
            >
              {cancelButtonText}
            </button>
            <button
              className={`${styles.button} ${styles.primary}`}
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              aria-busy={isConfirming}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
