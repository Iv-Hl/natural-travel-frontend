"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import { routes } from "@/constants/routes";
import styles from "./ErrorWhileSavingModal.module.css";

interface ErrorWhileSavingModalProps {
  onClose: () => void;
}

export default function ErrorWhileSavingModal({
  onClose,
}: ErrorWhileSavingModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loginRef = useRef<HTMLAnchorElement>(null);
  const backdropPointerDownRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement;
    const bodyStyle = document.body.style;
    const previousOverflow = ["overflow", "overflow-x", "overflow-y"].map(
      (property) => ({
        property,
        value: bodyStyle.getPropertyValue(property),
        priority: bodyStyle.getPropertyPriority(property),
      }),
    );

    dialog.showModal();
    bodyStyle.setProperty("overflow", "hidden", "important");
    loginRef.current?.focus({ preventScroll: true });

    return () => {
      dialog.close();
      for (const { property } of previousOverflow) {
        bodyStyle.removeProperty(property);
      }
      for (const { property, value, priority } of previousOverflow) {
        if (value) {
          bodyStyle.setProperty(property, value, priority);
        }
      }
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.overlay}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
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
          onClose();
        }
        backdropPointerDownRef.current = false;
      }}
    >
      <div className={styles.dialog}>
        <button
          className={styles.closeButton}
          type="button"
          onClick={onClose}
          aria-label="Закрити діалог"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <use href="/icons/symbol-defs.svg#icon-close" />
          </svg>
        </button>

        <div className={styles.content}>
          <h2 id={titleId} className={styles.title}>
            Помилка під час збереження
          </h2>
          <p id={descriptionId} className={styles.description}>
            Щоб зберегти статтю вам треба увійти, якщо ще немає облікового
            запису зареєструйтесь
          </p>
          <div className={styles.actions}>
            <Link
              ref={loginRef}
              href={routes.login}
              className={`${styles.button} ${styles.secondary}`}
              onClick={onClose}
            >
              Увійти
            </Link>
            <Link
              href={routes.register}
              className={`${styles.button} ${styles.primary}`}
              onClick={onClose}
            >
              Зареєструватись
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
