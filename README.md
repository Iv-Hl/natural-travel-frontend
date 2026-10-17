# Природні мандри

Frontend спільноти для публікації та збереження історій подорожей Україною.

## Стек

Next.js 15, React 19, TypeScript, CSS Modules, Formik, Yup, Swiper.

## Запуск

Node.js 22 або 24 LTS, npm. Команди для PowerShell:

```powershell
npm ci
npm run dev
```

Сайт: http://localhost:3001.

У `.env.local`:

```dotenv
BACKEND_API_URL=http://localhost:3000/api
```

Секрети й `.env.local` у Git не додаємо.

## Перевірки

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run build
```

## Робота команди

Гілка на задачу → PR у `main` → review → merge.

Каркас містить заготовки сторінок. Auth і API ще не підключено.

У dev-залежностях є попередження `braces`. Не запускайте `npm audit fix --force`.