// import Image from 'next/image';
import styles from './About.module.css';

export function About() {
  return (
    <section className={styles.about}>
        <div className={styles.aboutWrapper}>
          <div className={styles.aboutContent}>
            <h1 className={styles.aboutTitle}>
              Мандруй екологічно та відкривай нові горизонти
            </h1>

            <p className={styles.aboutDescription}>
              Наш проєкт створений для тих, хто хоче досліджувати Україну
              відповідально. Ми допоможемо знайти унікальні маршрути, які
              поєднують красу природи, локальну культуру та принципи сталого
              туризму.
            </p>

            <ul className={styles.aboutList}>
              <li className={styles.aboutItem}>
                <h2 className={styles.aboutItemTitle}>
                  Еко-маршрути по Україні
                </h2>

                <p className={styles.aboutText}>
                  Від Карпат до Чорного моря — добірка локацій, де можна
                  подорожувати без шкоди для довкілля.
                </p>
              </li>

              <li className={styles.aboutItem}>
                <h2 className={styles.aboutItemTitle}>
                  Практичні екологічні поради
                </h2>

                <p className={styles.aboutText}>
                  Дізнайся, як зменшити свій екологічний слід під час мандрів
                  та зробити подорож комфортною й свідомою.
                </p>
              </li>
            </ul>
          </div>

          <div className={styles.aboutImg}>
            {/* <Image/> */}
          </div>
        </div>
    </section>
  );
}
