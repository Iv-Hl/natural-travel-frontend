import Image from "next/image";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.imageWrapper}>
        <Image
          className={styles.image}
          src="/images/mountains-hero.jpg"
          alt="Дика природа та ліс серед гір"
          width={1288}
          height={1160}
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1439px) 50vw, 600px"
        />
      </div>
      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          Відкрий Україну заново — еко-мандри для натхнення
        </h1>

        <p className={styles.description}>
          Подорожуй екологічно, відкривай заповідні місця, гори та річки
          України. Ми зібрали маршрути, які допоможуть побачити красу природи
          без шкоди для неї.
        </p>

        <a className={styles.cta} href="#join">
          Доєднатись до мандрів
        </a>
      </div>
    </section>
  );
}
