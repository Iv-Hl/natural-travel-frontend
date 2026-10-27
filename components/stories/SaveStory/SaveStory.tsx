"use client";

import { useRef, useState } from "react";
import styles from "./SaveStory.module.css";
import ErrorWhileSavingModal from "../../ErrorWhileSavingModal/ErrorWhileSavingModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";



interface SaveStoryProps {
  storyId: string;
}

export default function SaveStory({ storyId }: SaveStoryProps) {
  const { user, isLoading: isAuthLoading, updateSavedStory } = useAuth();
  const isSaved = user?.savedArticles.includes(storyId) ?? false;
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const pendingSave = useRef(false);

  const handleSaveToggle = async () => {
    if (isAuthLoading || pendingSave.current) return;

    if (!user) {
      setIsErrorModalOpen(true);
      return;
    }

    pendingSave.current = true;
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetchWithAuth(
        `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
        { method: isSaved ? "DELETE" : "POST" },
      );

      if (!response.ok) {
        throw new Error("Не вдалося змінити збережену історію.");
      }

      updateSavedStory(user._id, storyId, !isSaved);
    } catch {
      setSaveError(
        "Не вдалося змінити збережену історію. Перевірте з’єднання та спробуйте ще раз.",
      );
    } finally {
      pendingSave.current = false;
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.saveBox}>
      <div className={styles.contentLayout}>
        <h3 className={styles.title}>Збережіть собі історію</h3>

        <p className={styles.description}>
          Вона буде доступна у вашому профілі у розділі збережене.
        </p>

        <button
          type="button"
          onClick={handleSaveToggle}
          disabled={isAuthLoading || isSaving}
          aria-pressed={isSaved}
          aria-busy={isSaving}
          className={`${styles.btn} ${isSaved ? styles.btnDelete : styles.btnSave}`}
        >
          {isSaving ? (
            <div className={styles.loader} />
          ) : (
            <span className={styles.btnText}>
              {isSaved ? "Видалити" : "Зберегти"}
            </span>
          )}
        </button>
        {saveError && <p role="alert">{saveError}</p>}
      </div>
      {isErrorModalOpen && (
        <ErrorWhileSavingModal onClose={() => setIsErrorModalOpen(false)} />
      )}
    </section>
  );
}
