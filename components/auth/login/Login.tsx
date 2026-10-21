"use client";

import { ErrorMessage, Field, Form, Formik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AuthNavigation from "@/components/auth/AuthNavigation/AuthNavigation";
import styles from "@/components/auth/AuthForm.module.css";
import { routes } from "@/constants/routes";
import { submitAuthForm } from "@/lib/api/auth";
import { loginSchema } from "@/lib/validation/auth";

type LoginValues = {
  email: string;
  password: string;
};

const initialValues: LoginValues = { email: "", password: "" };

export default function Login() {
  const router = useRouter();
  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) =>
      submitAuthForm("/api/auth/login", values),
    onSuccess: () => {
      router.replace(routes.home);
      router.refresh();
    },
  });

  return (
    <section className={styles.content} aria-labelledby="login-title">
      <AuthNavigation activePage="login" />

      <div className={styles.sectionTitle}>
        <h1 className={styles.title} id="login-title">
          Вхід
        </h1>
        <p className={styles.lead}>Вітаємо знову у спільноті мандрівників!</p>
      </div>

      <Formik<LoginValues>
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values, { setStatus }) => {
          setStatus(undefined);
          try {
            await loginMutation.mutateAsync({
              ...values,
              email: values.email.trim().toLowerCase(),
            });
          } catch (error) {
            setStatus(
              error instanceof Error
                ? error.message
                : "Не вдалося увійти. Спробуйте ще раз.",
            );
          }
        }}
      >
        {({ errors, touched, isSubmitting, status }) => (
          <Form className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-email">
                Пошта*
              </label>
              <Field
                className={styles.input}
                id="login-email"
                name="email"
                type="email"
                placeholder="hello@podorozhnyky.ua"
                autoComplete="email"
                maxLength={64}
                aria-invalid={Boolean(touched.email && errors.email)}
                aria-describedby={
                  touched.email && errors.email
                    ? "login-email-error"
                    : undefined
                }
              />
              <ErrorMessage name="email">
                {(message) => (
                  <p
                    className={styles.fieldError}
                    id="login-email-error"
                    role="alert"
                  >
                    {message}
                  </p>
                )}
              </ErrorMessage>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="login-password">
                Пароль*
              </label>
              <Field
                className={styles.input}
                id="login-password"
                name="password"
                type="password"
                placeholder="********"
                autoComplete="current-password"
                maxLength={128}
                aria-invalid={Boolean(touched.password && errors.password)}
                aria-describedby={
                  touched.password && errors.password
                    ? "login-password-error"
                    : undefined
                }
              />
              <ErrorMessage name="password">
                {(message) => (
                  <p
                    className={styles.fieldError}
                    id="login-password-error"
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
              disabled={isSubmitting || loginMutation.isPending}
            >
              {isSubmitting || loginMutation.isPending ? "Входимо…" : "Увійти"}
            </button>
          </Form>
        )}
      </Formik>
    </section>
  );
}
