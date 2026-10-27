"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Traveller } from "@/lib/api/travellers";
import css from "./TravellerCard.module.css";

interface TravellerCardProps {
  traveller: Traveller;
}

export const TravellerCard = ({ traveller }: TravellerCardProps) => {
  const router = useRouter();

  return (
    <article className={css.card}>
      <div className={css.avatarWrapper}>
        <Image
          src={
            traveller.avatarUrl ||
            "https://ac.goit.global/fullstack/react/default-avatar.jpg"
          }
          alt={traveller.name}
          width={130}
          height={130}
          className={css.avatar}
        />
      </div>

      <h3 className={css.name}>{traveller.name}</h3>

      <p className={css.articles}>Статей: {traveller.articlesAmount ?? 0}</p>

      <button
        type="button"
        className={css.profileLink}
        onClick={() => router.push(`/travellers/${traveller._id}`)}
      >
        Переглянути профіль
      </button>
    </article>
  );
};
