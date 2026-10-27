import css from "./Loader.module.css";

export const Loader = () => (
  <div className={css.loader} role="status" aria-label="Завантаження">
    <span className={css.spinner} />
  </div>
);
