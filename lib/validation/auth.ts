import * as Yup from "yup";

export const registerSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(32, "Ім’я має містити не більше 32 символів")
    .required("Введіть ім’я та прізвище"),
  email: Yup.string()
    .trim()
    .email("Введіть коректну адресу електронної пошти")
    .max(64, "Email має містити не більше 64 символів")
    .required("Введіть email"),
  password: Yup.string()
    .min(8, "Пароль має містити щонайменше 8 символів")
    .max(128, "Пароль має містити не більше 128 символів")
    .required("Введіть пароль"),
});

export const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Введіть коректну адресу електронної пошти")
    .max(64, "Email має містити не більше 64 символів")
    .required("Введіть email"),
  password: Yup.string()
    .min(8, "Пароль має містити щонайменше 8 символів")
    .max(128, "Пароль має містити не більше 128 символів")
    .required("Введіть пароль"),
});
