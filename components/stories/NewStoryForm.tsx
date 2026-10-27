"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Formik, Form, Field, ErrorMessage } from "formik";
import styles from "./NewStoryForm.module.css";
import type { Category } from "@/types/category";
import { getCategories } from "@/lib/api/categories";
import * as Yup from "yup";
import { createStory } from "@/lib/api/stories";
import { useRouter } from "next/navigation";
import { routes } from "@/constants/routes";

interface NewStoryFormValues {
  title: string;
  category: string;
  article: string;
}

const initialValues: NewStoryFormValues = {
  title: "",
  category: "",
  article: "",
};
// Валідаційна схема для форми
const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(2, "Заголовок має містити щонайменше 2 символи")
    .max(40, "Заголовок має містити не більше 40 символів")
    .required("Введіть заголовок"),

  category: Yup.string().required("Оберіть категорію"),

  article: Yup.string()
    .trim()
    .min(12, "Текст має містити щонайменше 12 символів")
    .max(3000, "Текст має містити не більше 3000 символів")
    .required("Введіть текст історії"),
});

export default function NewStoryForm() {
  const fileInputRef = useRef<HTMLInputElement>(null); // реф для доступу до елемента input type="file"

  // Зберігаємо URL поточного зображення, щоб звільнити його,
  // коли фото замінюється або компонент закривається.
  const imageUrlRef = useRef<string | null>(null);

  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [imagePreview, setImagePreview] = useState(""); // стан для збереження URL обраного файлу фото для попереднього перегляду
  const [imageFile, setImageFile] = useState<File | null>(null); // стан для збереження обраного файлу фото
  const [imageError, setImageError] = useState(""); // стан для помилки при завантаженні фото
  const [submitError, setSubmitError] = useState(""); // стан для помилки при сабміті форми

  // Звільняємо ресурси, зайняті URL попереднього зображення.
  const revokeImageUrl = () => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }
  };

  // Очищаємо URL, коли компонент демонтується,
  // наприклад під час переходу на іншу сторінку.
  useEffect(() => {
    return () => {
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, []);

  //     Що тут відбувається:
  // - useEffect запускає завантаження після появи компонента на сторінці.
  // - getCategories() викликає наш API /api/categories.
  // - setCategories(data) записує отримані категорії у стан.
  // - categories.map(...), який уже є в JSX, відобразить їх у списку.
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Помилка завантаження категорій:", error);
      }
    }

    loadCategories();
  }, []);

  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Створити нову історію</h1>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setSubmitError("");
            if (!imageFile) {
              setImageError("Завантажте фото обкладинки");
              return;
            }

            const formData = new FormData();

            formData.append("title", values.title.trim());
            formData.append("category", values.category);
            formData.append("article", values.article.trim());
            formData.append("image", imageFile); // на formData.append("image", imageFile): назва image повинна збігатися з назвою поля, яке очікує бекенд.

            const story = await createStory(formData);
            //  Тут ми використовуємо routes.story(storyId), який уже є у твоєму файлі constants/routes.ts.

            // Важливо: це працюватиме, якщо бекенд повертає ID історії у відповіді як id або _id. Якщо структура відповіді інша, підлаштуємо код під неї.

            const storyId = story.id ?? story._id;

            if (!storyId) {
              throw new Error("Історію створено, але сервер не повернув її ID");
            }

            router.push(routes.story(storyId));
          } catch (error) {
            console.error("Помилка створення історії:", error);
            setSubmitError(
              error instanceof Error
                ? error.message
                : "Не вдалося створити історію. Спробуйте ще раз.",
            );
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, resetForm, isSubmitting }) => (
          <Form className={styles.form}>
            <div className={styles.imageField}>
              <span className={styles.labelArticle}>Обкладинка статті</span>

              <div className={styles.imagePreview}>
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Обкладинка історії"
                    fill
                    unoptimized
                    className={styles.previewImage}
                  />
                ) : (
                  <Image
                    src="/images/placeholder-image.png"
                    alt="Плейсхолдер зображення"
                    width={335}
                    height={223}

                    className={styles.placeholder}
                  />
                )}
              </div>

              <label className={styles.uploadButton}>
                Завантажити фото
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  ref={fileInputRef} // прив'язуємо реф до елемента input type="file"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];

                    if (!file) return;

                    revokeImageUrl();
                    setImageFile(null);
                    setImagePreview("");

                    if (!file.type.startsWith("image/")) {
                      setImageError("Оберіть файл зображення");
                      event.currentTarget.value = "";
                      return;
                    }

                    if (file.size > 1024 * 1024) {
                      setImageError("Розмір фото не повинен перевищувати 1 МБ");
                      event.currentTarget.value = "";
                      return;
                    }
                    // Створюємо URL для попереднього перегляду валідного зображення.
                    const imageUrl = URL.createObjectURL(file);
                    imageUrlRef.current = imageUrl;

                    setImageFile(file);
                    setImagePreview(imageUrl);
                    setImageError("");
                  }}
                />
              </label>
              {imageError && (
                <p className={styles.error} role="alert">
                  {imageError}
                </p>
              )}
            </div>

            <div className={styles.fieldsContainer}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="title">
                  Заголовок
                </label>
                <Field
                  id="title"
                  name="title"
                  className={styles.input}
                  placeholder="Введіть заголовок історії"
                />
                <ErrorMessage
                  name="title"
                  component="p"
                  className={styles.error}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="category">
                  Категорія
                </label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  className={styles.input}
                >
                  <option value="">Категорія</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="category"
                  component="p"
                  className={styles.error}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="article">
                  Текст історії
                </label>
                <Field
                  as="textarea"
                  id="article"
                  name="article"
                  className={styles.textarea}
                  placeholder="Ваша історія тут"
                />
                <ErrorMessage
                  name="article"
                  component="p"
                  className={styles.error}
                />
              </div>
            </div>
            {submitError && (
              <p className={styles.error} role="alert">
                {submitError}
              </p>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => {
                  revokeImageUrl();
                  resetForm();
                  setImageFile(null);
                  setImagePreview("");
                  setImageError("");
                  setSubmitError("");
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  } //   очищаємо значення input type="file" через реф
                }}
              >
                Відмінити
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={
                  isSubmitting ||
                  !values.title.trim() ||
                  values.title.trim().length < 2 ||
                  values.title.trim().length > 40 ||
                  !values.category ||
                  values.article.trim().length < 12 ||
                  values.article.trim().length > 3000 ||
                  !imageFile
                }
              >
                {isSubmitting ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
}
