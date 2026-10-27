"use client";

import { useEffect, useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import AuthNavigation from "@/components/auth/AuthNavigation/AuthNavigation";
import styles from "@/components/auth/AuthForm.module.css";
import { routes } from "@/constants/routes";
import { submitAuthForm } from "@/lib/api/auth";
import { loginSchema } from "@/lib/validation/auth";
import { useAuth } from "@/components/providers/AuthProvider";

type LoginValues = {
  email: string;
  password: string;
};

const initialValues: LoginValues = { email: "", password: "" };

export default function Login() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!errorMessage) return;
    const timeoutId = window.setTimeout(() => setErrorMessage(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [errorMessage]);

  const loginMutation = useMutation({
    mutationFn: (values: LoginValues) =>
      submitAuthForm("/api/auth/login", values),
    onSuccess: async () => {
      await refreshAuth();
      router.replace(routes.home);
      router.refresh();
    },
  });

  return (
    <section className={styles.content} aria-labelledby="login-title">
      <AuthNavigation activePage="login" />

      <div className={styles.sectionTitle}>
        <h1 className={styles.title} id="login-title">
          Р’С…С–Рґ
        </h1>
        <p className={styles.lead}>
          Р’С–С‚Р°С”РјРѕ Р·РЅРѕРІСѓ Сѓ СЃРїС–Р»СЊРЅРѕС‚С–
          РјР°РЅРґСЂС–РІРЅРёРєС–РІ!
        </p>
      </div>

      <Formik<LoginValues>
        initialValues={initialValues}
        validationSchema={loginSchema}
        onSubmit={async (values) => {
          setErrorMessage(null);
          try {
            await loginMutation.mutateAsync({
              ...values,
              email: values.email.trim().toLowerCase(),
            });
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "РќРµ РІРґР°Р»РѕСЃСЏ СѓРІС–Р№С‚Рё. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.",
            );
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <>
            {errorMessage && (
              <div
                className={styles.errorToast}
                role="alert"
                aria-live="assertive"
              >
                <span className={styles.toastIcon} aria-hidden="true">
                  !
                </span>
                <p className={styles.toastMessage}>{errorMessage}</p>
                <button
                  className={styles.toastClose}
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  aria-label="Р—Р°РєСЂРёС‚Рё РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ"
                >
                  Г—
                </button>
              </div>
            )}

            <Form className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="login-email">
                  РџРѕС€С‚Р°*
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
                  РџР°СЂРѕР»СЊ*
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

              <button
                className={styles.submitButton}
                type="submit"
                disabled={isSubmitting || loginMutation.isPending}
              >
                {isSubmitting || loginMutation.isPending
                  ? "Р’С…РѕРґРёРјРѕвЂ¦"
                  : "РЈРІС–Р№С‚Рё"}
              </button>
            </Form>
          </>
        )}
      </Formik>
    </section>
  );
}
