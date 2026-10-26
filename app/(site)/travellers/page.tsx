"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { getTravellers, type Traveller } from "@/lib/api/travellers";
import { Loader } from "@/components/Loader/Loader";
import { TravellerCard } from "@/components/TravellerCard/TravellerCard";
import css from "./TravellersList.module.css";

interface TravellersPageProps {
  perPage?: number;
}

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

export default function TravellersPage({ perPage = 12 }: TravellersPageProps) {
  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [page, setPage] = useState(0); // 0 = ще нічого не завантажено
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const listRef = useRef<HTMLUListElement | null>(null);
  const scrollToIndexRef = useRef<number | null>(null);

  const loadPage = useCallback(
    async (nextPage: number, startIndex: number) => {
      setIsLoading(true);

      try {
        const data = await getTravellers(nextPage, perPage);

        setTravellers((prev) => {
          const ids = new Set(prev.map((t) => t._id));
          return [...prev, ...data.users.filter((u) => !ids.has(u._id))];
        });

        setPage(nextPage);
        setHasMore(nextPage < data.totalPages);

        if (nextPage > 1) {
          scrollToIndexRef.current = startIndex;
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [perPage],
  );

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

  return (
    <section className={css.section}>
      <div className="container">
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

        {travellers.length === 0 && !isLoading && page > 0 && (
          <p className={css.message}>Мандрівників поки немає.</p>
        )}

        {hasMore && travellers.length > 0 && (
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
      </div>
    </section>
  );
}
