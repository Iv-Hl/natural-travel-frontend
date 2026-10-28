# 🌿 Природні мандри

Frontend вебзастосунку спільноти для публікації, перегляду та збереження історій подорожей Україною.

**Природні мандри** — це проєкт, створений для людей, які люблять подорожувати, відкривати нові місця та ділитися власним досвідом мандрівок.

## ✨ Основні можливості

- Перегляд історій подорожей Україною.
- Ознайомлення з популярними історіями.
- Зручна адаптація інтерфейсу для різних розмірів екрана.
- Форми з валідацією введених даних.
- Підготовлена структура для подальшої інтеграції з backend API та авторизацією.

> Проєкт перебуває в розробці. Частина функціональності може бути представлена заготовками та потребувати подальшої реалізації.

## 🛠️ Технології

- **Next.js 15** — React-фреймворк та App Router.
- **React 19** — побудова інтерфейсу користувача.
- **TypeScript** — типізація та надійність коду.
- **CSS Modules** — ізольовані стилі компонентів.
- **Formik** — керування формами.
- **Yup** — валідація даних форм.
- **Swiper** — інтерактивні слайдери.
- **ESLint** — перевірка якості коду.
- **Prettier** — форматування коду.

## 📋 Вимоги

Перед початком роботи встановіть:

- [Node.js](https://nodejs.org/) версії 22 або 24 LTS.
- npm, який постачається разом із Node.js.
- Git.

## 🚀 Встановлення та запуск

### 1. Клонування репозиторію

```powershell
git clone https://github.com/Iv-Hl/natural-travel-frontend.git
cd natural-travel-frontend
```

### 2. Встановлення залежностей

```powershell
npm ci
```

Команда `npm ci` встановлює залежності відповідно до `package-lock.json`.

### 3. Налаштування змінних середовища

Створіть у корені проєкту файл `.env.local` і додайте адресу backend API:

```dotenv
BACKEND_API_URL=http://localhost:3000/api
```

Переконайтеся, що backend запущений і доступний за вказаною адресою.

### 4. Запуск у режимі розробки

```powershell
npm run dev
```

Відкрийте сайт у браузері:

**http://localhost:3001**

Якщо backend не запущений, функції, що потребують API, можуть бути недоступними.

## 🧪 Перевірка проєкту

Перед створенням Pull Request виконайте доступні перевірки:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run build
```

- `format:check` — перевіряє форматування коду.
- `lint` — перевіряє код за правилами ESLint.
- `typecheck` — перевіряє типи TypeScript.
- `build` — перевіряє, чи збирається production-версія застосунку.

Запускайте команди з кореневої директорії frontend-проєкту.

## 📁 Структура проєкту

```text
natural-travel-frontend/
├── app/          # Сторінки та маршрути Next.js App Router
├── components/   # Повторно використовувані компоненти
├── constants/    # Константи проєкту
├── lib/          # Допоміжні функції та утиліти
├── public/       # Статичні файли та зображення
├── types/        # Типи TypeScript
├── .env.local    # Локальні змінні середовища (не комітити)
├── package.json
├── package-lock.json
└── README.md
```

## 🔗 Backend

Frontend призначений для роботи разом із backend-частиною проєкту.

Репозиторій backend: [project-NaturalTravel](https://github.com/Iv-Hl/project-NaturalTravel)

Локальна адреса API:

```text
http://localhost:3000/api
```

Адреса frontend у режимі розробки:

```text
http://localhost:3001
```

## 👥 Командна робота

Для внесення змін використовуйте такий робочий процес:

1. Створіть окрему гілку для своєї задачі.
2. Реалізуйте зміни та перевірте код.
3. Створіть Pull Request у гілку `main`.
4. Дочекайтеся code review.
5. Після погодження виконайте merge.

Назви гілок мають відображати призначення змін, наприклад:

```text
feature/popular-stories
fix/story-card-layout
refactor/auth-provider
```

## 🔐 Безпека

- Не додавайте `.env.local` та інші файли із секретами до Git.
- Не зберігайте паролі, токени чи приватні ключі безпосередньо в коді.
- Не запускайте `npm audit fix --force` без узгодження з командою: ця команда може встановити несумісні версії залежностей.
- Якщо виникають попередження щодо залежностей, зокрема `braces`, перевіряйте їх окремо та погоджуйте зміни з командою.

## 📌 Статус проєкту

Проєкт перебуває в активній розробці. Структура frontend поступово розширюється, а інтеграція з backend та реалізація функціональності виконуються відповідно до командних задач.

---

**Природні мандри** — відкривай Україну, ділися історіями, надихайся подорожами. 🌿

## 👥 Contributors

<a href="https://github.com/Iv-Hl"><img src="https://avatars.githubusercontent.com/u/152782728?s=64&v=4" width="70" height="70" alt="Iv-Hl" /></a>
<a href="https://github.com/karnaukhalina15-jpg"><img src="https://avatars.githubusercontent.com/u/250217422?s=64&v=4" width="70" height="70" alt="karnaukhalina15-jpg" /></a>
<a href="https://github.com/Liliia-Fodorova"><img src="https://avatars.githubusercontent.com/u/229702113?s=64&v=4" width="70" height="70" alt="Liliia-Fodorova" /></a>
<a href="https://github.com/Volodymyr-2356"><img src="https://avatars.githubusercontent.com/u/247371418?s=64&v=4" width="70" height="70" alt="Volodymyr-2356" /></a>
<a href="https://github.com/Avelexis"><img src="https://avatars.githubusercontent.com/u/242055935?s=64&v=4" width="70" height="70" alt="Avelexis" /></a>
<a href="https://github.com/Roman2846"><img src="https://avatars.githubusercontent.com/u/129865734?s=64&v=4" width="70" height="70" alt="Roman2846" /></a>
<a href="https://github.com/Anton-Symonenko"><img src="https://avatars.githubusercontent.com/u/160412817?s=64&v=4" width="70" height="70" alt="Anton-Symonenko" /></a>
<a href="https://github.com/OLadbe"><img src="https://avatars.githubusercontent.com/u/157425421?s=64&v=4" width="70" height="70" alt="OLadbe" /></a>
<a href="https://github.com/Oleksandra-Lelak"><img src="https://avatars.githubusercontent.com/u/191617065?s=64&v=4" width="70" height="70" alt="Oleksandra-Lelak" /></a>
<a href="https://github.com/Rdazochka"><img src="https://avatars.githubusercontent.com/u/250003396?s=64&v=4" width="70" height="70" alt="Rdazochka" /></a>
<a href="https://github.com/ivshynalarysa"><img src="https://avatars.githubusercontent.com/u/182507994?s=64&v=4" width="70" height="70" alt="ivshynalarysa" /></a>

[View all contributors on GitHub](https://github.com/Iv-Hl/natural-travel-frontend/graphs/contributors)
