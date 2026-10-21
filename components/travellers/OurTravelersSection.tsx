"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/grid";
import "swiper/css/navigation";

import { getTravellers, Traveller } from "@/lib/api/travellers";
import css from "./OurTravelersSection.module.css";

export const OurTravelersSection = () => {
  const router = useRouter();

  const [travellers, setTravellers] = useState<Traveller[]>([]);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const swiperRef = useRef<SwiperType | null>(null);

  const syncNavState = (swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    const fetchTravellers = async () => {
      try {
        const data = await getTravellers(1, 12);
        setTravellers(data.users);
      } catch (error) {
        console.error("Помилка завантаження мандрівників:", error);
      }
    };

    fetchTravellers();
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper || travellers.length === 0) return;
    swiper.update();
    syncNavState(swiper);
  }, [travellers]);

  return (
    <section className={css.travelSection}>
      <div className="container">
        <div className={css.contentWrapper}>
          <h2 className={css.title}>Наші Мандрівники</h2>

          <Link href="/travellers" className={css.linkAll}>
            Всі мандрівники
          </Link>

          <div className={css.sliderContainer}>
            <Swiper
              modules={[Navigation, Grid]}
              spaceBetween={24}
              slidesPerView={1}
              slidesPerGroup={1}
              grid={{ rows: 3, fill: "row" }}
              breakpoints={{
                768: {
                  spaceBetween: 24,
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                  grid: { rows: 2, fill: "row" },
                },
                1366: {
                  spaceBetween: 24,
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                  grid: { rows: 1, fill: "row" },
                },
              }}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSwiper={syncNavState}
              onBreakpoint={syncNavState}
              onUpdate={syncNavState}
              onSlideChange={syncNavState}
              className={css.swiper}
            >
              {travellers.map((traveller) => (
                <SwiperSlide key={traveller._id}>
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
                    <p className={css.articles}>
                      Статей: {traveller.articlesAmount ?? 0}
                    </p>
                    <button
                      type="button"
                      className={css.profileLink}
                      onClick={() =>
                        router.push(`/travellers/${traveller._id}`)
                      }
                    >
                      Переглянути профіль
                    </button>
                  </article>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className={css.controls}>
              <button
                type="button"
                onClick={() => swiperRef.current?.slidePrev()}
                disabled={isBeginning}
                aria-label="Попередні мандрівники"
                className={css.navBtn}
              >
                <span className={css.iconWrapper}>
                  <svg width="20" height="20" aria-hidden="true">
                    <use href="../icons/symbol-defs.svg#icon-arrow_back" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                onClick={() => swiperRef.current?.slideNext()}
                disabled={isEnd}
                aria-label="Наступні мандрівники"
                className={css.navBtn}
              >
                <span className={css.iconWrapper}>
                  <svg width="20" height="20" aria-hidden="true">
                    <use href="../icons/symbol-defs.svg#icon-arrow_forward" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
