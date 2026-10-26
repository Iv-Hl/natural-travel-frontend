import styles from "./PopularStoriesLoader.module.css";

const PopularStoriesLoader = () => {
  return (
    <section
      className={styles.section}
      aria-busy="true"
      aria-label="Завантаження популярних статей"
    >
      <h2 className={styles.sectionTitle}>Популярні статті</h2>

      <div className={styles.loadingGrid}>
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={`${styles.skeletonCard} ${
              item === 2
                ? styles.tabletCard
                : item === 3
                  ? styles.desktopCard
                  : ""
            }`}
            aria-hidden="true"
          >
            <div className={styles.skeletonImage} />

            <div className={styles.skeletonContent}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
              <div className={styles.skeletonFooter} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.loadingIndicator} role="status">
        <span className={styles.spinner} />
        <span>Завантажуємо популярні статті...</span>
      </div>
    </section>
  );
};

export default PopularStoriesLoader;
