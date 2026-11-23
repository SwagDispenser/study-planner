# Study Planner — лабораторна №11

React 19.3.1, React Router 8.5.2, TypeScript, React Hook Form, Zod та SCSS + BEM.
Node.js ≥22.22.0. Продовження REST/API-функціоналу лабораторної №10.

Непарний варіант: **Data Mode** — `createBrowserRouter`, `RouterProvider`,
захист `/profile` через `loader` і `redirect`. Гілка: `feature/routing-auth`.

## Запуск

У папці `study-planner`:

```bash
npm ci
cp .env.example .env
npm run dev
```

Якщо `.env` уже налаштований, копіювати його повторно не потрібно.
Базова адреса: `VITE_API_URL=https://dummyjson.com`. `.env` виключений із Git.

## Маршрути та форми

- `/` перенаправляє на `/tasks`.
- `/tasks` — список, попередня/наступна сторінка, кнопка `+` для створення.
- `/tasks/:taskId` — GET деталей за route param, автор, дата, редагування та видалення з підтвердженням.
- `/tasks?status=completed&priority=high` — приклад фільтрів. Фільтри читаються лише з URL та зберігаються після оновлення сторінки.
- `/login` — React Hook Form + Zod: обов’язковий username, пароль від 6 символів.
- `/profile` — захищений маршрут із username, email, статусом та Logout.
- Невідомі маршрути показують сторінку «Сторінку не знайдено».

Спільний layout містить Header, навігацію та Outlet. Link/NavLink забезпечують
переходи без перезавантаження документа.

Один `TaskFormDialog` працює в режимах create/edit з полями title, description,
category та priority. Валідація — React Hook Form + Zod. Нативний dialog забезпечує
модальність і фокус; Escape та «Скасувати» закривають форму. Під час submit поля й
кнопки заблоковані. Після успіху dialog закривається, UI оновлюється, показується Toast.

## Автентифікація та доступ

Тестовий акаунт з умови: **emilys / emilyspass**.

Login виконує POST `/auth/login`, потім GET `/auth/me` із отриманим accessToken.
Auth Context надає user, accessToken, isAuthenticated, login та logout.
Єдина сесія в пам’яті доступна також loader та API-клієнту. Перезавантаження
вкладки завершує сесію; збереження токенів і refresh flow не реалізовані.

Список і деталі доступні гостям. Створення, редагування, зміна completed та видалення
перевіряють авторизацію перед виконанням операції, зокрема в repository.
Гостя при спробі створення/редагування/видалення перенаправляє на Login.
HTTP-клієнт централізовано додає `Authorization: Bearer <token>` для активної сесії.
Після Logout захищений маршрут знову перенаправляє на Login.

## API та стан

Збережено httpClient, Task Repository, GET/POST/PATCH/DELETE, пагінацію, loading,
error з повторною спробою, empty та success. GET списку й деталей скасовуються
через AbortController; скасування не показується як помилка.

DummyJSON лише симулює mutation. Журнал успішних змін у пам’яті підтримує їх
відображення при переходах між сторінками. Після перезавантаження зміни зникають.
Нові записи мають унікальні від’ємні id, оскільки симульовані POST можуть повертати
однаковий id. Їхні подальші деталі/edit/delete repository обробляє локально;
для початкових серверних записів використовуються HTTP GET/PATCH/DELETE.

Поля createdBy і createdAt явно позначено в domain-моделі як client-owned metadata.
Для нових записів це username поточного користувача й час створення. Для серверних
записів автор визначається за userId, дата невідома — інтерфейс не вигадує її.
Опис, категорія та пріоритет також залишаються metadata сесії.

Фільтр і статистика стосуються поточної сторінки. Нові записи додаються на першу
сторінку понад 10 серверних; пагінація використовує серверний total.

## Перевірка

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Тести перевіряють REST repository, блокування mutation для гостей, Bearer header,
схеми форм, login/me, спільну сесію та redirect protected loader після logout.

Для ручної перевірки: гість → Profile → Login; валідація порожніх полів і короткого
пароля; вхід тестовим акаунтом; створення через `+`; редагування серверного завдання
в деталях; видалення з підтвердженням; Escape/Cancel у dialog; фільтри після reload;
Logout і повторна спроба відкрити Profile. Для перевірки HTTP PATCH/DELETE обирайте
початковий серверний запис.

Приклад Conventional Commit: `feat(lab-11): add routing and protected auth`.
