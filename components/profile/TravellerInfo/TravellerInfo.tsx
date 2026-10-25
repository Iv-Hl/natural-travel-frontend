"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getTravellerById } from "@/lib/api/travellers";
import styles from "./TravellerInfo.module.css";

interface TravellerInfoProps {
  userId: string;
}

const defaultAvatar =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

export default function TravellerInfo({ userId }: TravellerInfoProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["traveller", userId],
    queryFn: () => getTravellerById(userId),
    enabled: Boolean(userId),
  });

  if (isPending) {
    return <p>Завантаження профілю мандрівника...</p>;
  }

  if (isError || !data?.user) {
    return <p role="alert">Не вдалося завантажити профіль мандрівника.</p>;
  }

  const { user } = data;
  const articlesCount = data.pagination.totalItems;

  return (
    <section className={styles.travellerCard}>
      <div className={styles.avatarWrapper}>
        <Image
          src={user.avatarUrl || defaultAvatar}
          alt={user.name || "Мандрівник"}
          width={80}
          height={80}
          className={styles.avatar}
          unoptimized
        />
      </div>

      <div className={styles.details}>
        <h1 className={styles.name}>{user.name}</h1>
        <p className={styles.count}>Статей: {articlesCount}</p>
      </div>
    </section>
  );
}
