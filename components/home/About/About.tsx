import Image from 'next/image';
import styles from './About.module.css';


export function About() {
  return (
    <section className={styles.about}>
        <div className={styles.aboutWrapper}>
          <div className={styles.aboutContent}>
            <h2 className={styles.aboutTitle}>
              Мандруй екологічно та відкривай нові горизонти
            </h2>

            <p className={styles.aboutDescription}>
              Наш проєкт створений для тих, хто хоче досліджувати Україну
              відповідально. Ми допоможемо знайти унікальні маршрути, які
              поєднують красу природи, локальну культуру та принципи сталого
              туризму.
            </p>

            <ul className={styles.aboutList}>
              <li className={styles.aboutItem}>
                <h3 className={styles.aboutItemTitle}>
                  Еко-маршрути по Україні
                </h3>

                <p className={styles.aboutText}>
                  Від Карпат до Чорного моря — добірка локацій, де можна
                  подорожувати без шкоди для довкілля.
                </p>
              </li>

              <li className={styles.aboutItem}>
                <h3 className={styles.aboutItemTitle}>
                  Практичні екологічні поради
                </h3>

                <p className={styles.aboutText}>
                  Дізнайся, як зменшити свій екологічний слід під час мандрів
                  та зробити подорож комфортною й свідомою.
                </p>
              </li>
            </ul>
          </div>

          <div className={styles.aboutImg}>
             <Image
              src="/images/travel-eco.jpg"
              alt="Мандруй екологічно"
              className={styles.image}
              width={644}
              height={686}
              sizes="
                (max-width: 767px) calc(100vw - 40px),
                (max-width: 1439px) 704px,
                644px
              "
              quality={70}
            />
          </div>
        </div>
    </section>
  );
}
