"use client";

import { useState } from "react";
import axios from "axios";
import styles from "./SaveStory.module.css";
import  ErrorWhileSavingModal  from "../../ErrorWhileSavingModal/ErrorWhileSavingModal";
import { useAuth } from "@/components/providers/AuthProvider";

interface SaveStoryProps {
  storyId: string;
  initialIsSaved: boolean;
}

export default function SaveStory({ storyId, initialIsSaved }: SaveStoryProps) {
  
  const  isAuthenticated  = useAuth(); 

  const [isSaved, setIsSaved] = useState<boolean>(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleSaveToggle = async () => {
    
    if (!isAuthenticated) {
      alert("Будь ласка, увійдіть в акаунт, щоб зберігати історії!");
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        
        await axios.delete(`/api/users/me/saved-stories/${storyId}`);
        setIsSaved(false);
      } else {
       
        await axios.post(`/api/users/me/saved-stories/${storyId}`);
        setIsSaved(true);
      }
    } catch (error) {
      setIsErrorModalOpen(true);
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
      {isErrorModalOpen && (
      <ErrorWhileSavingModal
          onClose={() => setIsErrorModalOpen(false)}
        />
        )}
    </section>
  );
}