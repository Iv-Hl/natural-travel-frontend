"use client";

import { ErrorMessage, Field, Form, Formik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AuthNavigation from "@/components/auth/AuthNavigation/AuthNavigation";
import styles from "@/components/auth/AuthForm.module.css";
import { routes } from "@/constants/routes";
import { submitAuthForm } from "@/lib/api/auth";
import { registerSchema } from "@/lib/validation/auth";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

const initialValues: RegisterValues = { name: "", email: "", password: "" };

export default function Register() {
  const router = useRouter();
  const registerMutation = useMutation({
    mutationFn: (values: RegisterValues) =>
      submitAuthForm("/api/auth/register", values),
    onSuccess: () => {
      router.replace(routes.home);
      router.refresh();
    },
  });

  return (
    <section className={styles.content} aria-labelledby="register-title">
      <AuthNavigation activePage="register" />

      <div className={styles.sectionTitle}>
        <h1 className={styles.title} id="register-title">
          Реєстрація
        </h1>
        <p className={styles.lead}>Раді вас бачити у спільноті мандрівників!</p>
      </div>

      <Formik<RegisterValues>
        initialValues={initialValues}
        validationSchema={registerSchema}
        onSubmit={async (values, { setStatus }) => {
          setStatus(undefined);
          try {
            await registerMutation.mutateAsync({
              ...values,
              name: values.name.trim(),
              email: values.email.trim().toLowerCase(),
            });
          } catch (error) {
            setStatus(
              error instanceof Error
                ? error.message
                : "Не вдалося зареєструватися. Спробуйте ще раз.",
            );
          }
        }}
      >
        {({ errors, touched, isSubmitting, status }) => (
          <Form className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="register-name">
                Ім’я та Прізвище*
              </label>
              <Field
                className={styles.input}
                id="register-name"
                name="name"
                type="text"
                placeholder="Ваше ім’я та прізвище"
                autoComplete="name"
                maxLength={32}
                aria-invalid={Boolean(touched.name && errors.name)}
                aria-describedby={
                  touched.name && errors.name
                    ? "register-name-error"
                    : undefined
                }
              />
              <ErrorMessage name="name">
                {(message) => (
                  <p
                    className={styles.fieldError}
                    id="register-name-error"
                    role="alert"
                  >
                    {message}
                  </p>
                )}
              </ErrorMessage>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="register-email">
                Пошта*
              </label>
              <Field
                className={styles.input}
                id="register-email"
                name="email"
                type="email"
                placeholder="hello@podorozhnyky.ua"
                autoComplete="email"
                maxLength={64}
                aria-invalid={Boolean(touched.email && errors.email)}
                aria-describedby={
                  touched.email && errors.email
                    ? "register-email-error"
                    : undefined
                }
              />
              <ErrorMessage name="email">
                {(message) => (
                  <p
                    className={styles.fieldError}
                    id="register-email-error"
                    role="alert"
                  >
                    {message}
                  </p>
                )}
              </ErrorMessage>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="register-password">
                Пароль*
              </label>
              <Field
                className={styles.input}
                id="register-password"
                name="password"
                type="password"
                placeholder="********"
                autoComplete="new-password"
                maxLength={128}
                aria-invalid={Boolean(touched.password && errors.password)}
                aria-describedby={
                  touched.password && errors.password
                    ? "register-password-error"
                    : undefined
                }
              />
              <ErrorMessage name="password">
                {(message) => (
                  <p
                    className={styles.fieldError}
                    id="register-password-error"
                    role="alert"
                  >
                    {message}
                  </p>
                )}
              </ErrorMessage>
            </div>

            {typeof status === "string" && (
              <p className={styles.formError} role="alert">
                {status}
              </p>
            )}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isSubmitting || registerMutation.isPending}
            >
              {isSubmitting || registerMutation.isPending
                ? "Реєструємо…"
                : "Зареєструватися"}
            </button>
          </Form>
        )}
      </Formik>
    </section>
  );
}
