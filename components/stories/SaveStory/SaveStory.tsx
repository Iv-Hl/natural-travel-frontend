"use client";

import { useState } from "react";
import axios from "axios";
import styles from "./SaveStory.module.css";

interface SaveStoryProps {
  storyId: string;
}

export default function SaveStory({ storyId }: SaveStoryProps) {
  // Имитация авторизации (поставьте false, чтобы протестировать состояние для гостя)
  const isAuthenticated = true; 

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToggle = async () => {
    // 1. Взаимодействие с НЕ авторизованным пользователем 
    if (!isAuthenticated) {
      alert("Будь ласка, увійдіть в акаунт, щоб зберігати історії!");
      return;
    }

    // 2. Взаимодействие с авторизованным пользователем
    setIsLoading(true);
    try {
      if (isSaved) {
        // Наш бэкенд DELETE-роут удаления истории
        await axios.delete(`/api/users/me/saved-stories/${storyId}`);
        setIsSaved(false);
      } else {
        // Наш бэкенд POST-роут сохранения истории
        await axios.post(`/api/users/me/saved-stories/${storyId}`);
        setIsSaved(true);
      }
    } catch (error) {
      alert("Помилка при зміні статусу історії:");
      console.error(error);
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
          className={`${styles.btn} ${isSaved ? styles.btnDelete : styles.btnSave}`}
        >
          {isLoading ? (
            <div className={styles.loader} />
          ) : (
           
            <span className={styles.btnText}>
              {isSaved ? "Видалити" : "Зберегти"}
            </span>
          )}
        </button>
      </div>
    </section>
  );
}