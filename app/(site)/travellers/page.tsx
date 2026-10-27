"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

import { getTravellers, type Traveller } from "@/lib/api/travellers";
import { Loader } from "@/components/Loader/Loader";
import { TravellerCard } from "@/components/TravellerCard/TravellerCard";
import css from "./TravellersList.module.css";

const PER_PAGE = 12;

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "Не вдалося завантажити мандрівників"
    );
  }
  return "Сталася невідома помилка";
};

export default function TravellersPage() {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [page, setPage] = useState(0); // 0 = ще нічого не завантажено
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLUListElement | null>(null);
  const scrollToIndexRef = useRef<number | null>(null);

  const loadPage = useCallback(async (nextPage: number, startIndex: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getTravellers(nextPage, PER_PAGE);

      setTravellers((prev) => {
        const ids = new Set(prev.map((t) => t._id));
        return [...prev, ...data.users.filter((u) => !ids.has(u._id))];
      });

      setPage(nextPage);
      setHasMore(nextPage < data.totalPages);

      if (nextPage > 1) {
        scrollToIndexRef.current = startIndex;
      }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, 0);
  }, [loadPage]);

  useEffect(() => {
    const index = scrollToIndexRef.current;
    if (index === null) return;

    listRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    scrollToIndexRef.current = null;
  }, [travellers]);

  const handleLoadMore = () => {
    void loadPage(page + 1, travellers.length);
  };

  const handleRetry = () => {
    const targetPage = page === 0 ? 1 : page + 1;
    void loadPage(targetPage, travellers.length);
  };

  return (
    <section className={css.section}>
      <h1 className={css.title}>Мандрівники</h1>

      {travellers.length > 0 && (
        <ul className={css.list} ref={listRef}>
          {travellers.map((traveller) => (
            <li key={traveller._id} className={css.item}>
              <TravellerCard traveller={traveller} />
            </li>
          ))}
        </ul>
      )}

      {travellers.length === 0 && isLoading && <Loader />}

      {travellers.length === 0 && !isLoading && error && (
        <div className={css.errorWrapper}>
          <p className={css.message}>{error}</p>
          <button type="button" className={css.loadMore} onClick={handleRetry}>
            Спробувати ще раз
          </button>
        </div>
      )}

      {travellers.length === 0 && !isLoading && !error && page > 0 && (
        <p className={css.message}>Мандрівників поки немає.</p>
      )}

      {error && travellers.length > 0 && (
        <div className={css.errorWrapper}>
          <p className={css.message}>{error}</p>
          <button type="button" className={css.loadMore} onClick={handleRetry}>
            Спробувати ще раз
          </button>
        </div>
      )}

      {hasMore && travellers.length > 0 && !error && (
        <div className={css.actions}>
          <button
            type="button"
            className={css.loadMore}
            onClick={handleLoadMore}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? "Завантаження..." : "Показати ще"}
          </button>
        </div>
      )}
    </section>
  );
}
