# DDOS-GUARD Mission

Сюжетная веб-игра на `Next.js`, где маскот DDOS-GUARD доставляет пакет данных пользователю через станции защиты. После прохождения игрок оставляет свои данные, которые сохраняются в админ-панель.

## Что реализовано

- Одна основная игра-миссия вместо набора мини-игр
- Клиентская авторизация для игрока
- Игровой маршрут на canvas
- Станции с вопросами по кибербезопасности
- Сохранение заявок игроков после прохождения
- Админ-панель с просмотром заявок
- SQLite-база для backend-данных

## Стек

- `Next.js 16` (`App Router`)
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Radix UI`
- `Lucide React`
- `node:sqlite` для встроенной SQLite-базы
- `localStorage` для клиентского аккаунта игрока и локальной игровой статистики

## Архитектура

### Frontend

- [app/page.tsx](C:\Users\User\Desktop\original\app\page.tsx)  
  Главная точка входа. Показывает логин или основное приложение.

- [components/main-app.tsx](C:\Users\User\Desktop\original\components\main-app.tsx)  
  Главный экран после входа: миссия, рейтинг, переход в игру и в админку.

- [app/games/hill-climb/page.tsx](C:\Users\User\Desktop\original\app\games\hill-climb\page.tsx)  
  Основная сюжетная игра на `canvas`.

- [components/login-page.tsx](C:\Users\User\Desktop\original\components\login-page.tsx)  
  Логин, регистрация и подтверждение кода.

- [components/profile-cabinet.tsx](C:\Users\User\Desktop\original\components\profile-cabinet.tsx)  
  Кабинет игрока: статистика и достижения.

- [components/game-assistant.tsx](C:\Users\User\Desktop\original\components\game-assistant.tsx)  
  Помощник по миссии.

### Backend

- [app/api/submissions/route.ts](C:\Users\User\Desktop\original\app\api\submissions\route.ts)  
  Принимает данные игрока после прохождения и сохраняет их в БД.

- [app/api/admin/login/route.ts](C:\Users\User\Desktop\original\app\api\admin\login\route.ts)  
  Вход в админку по ключу.

- [app/api/admin/session/route.ts](C:\Users\User\Desktop\original\app\api\admin\session\route.ts)  
  Проверка активной админ-сессии.

- [app/api/admin/submissions/route.ts](C:\Users\User\Desktop\original\app\api\admin\submissions\route.ts)  
  Выдаёт список заявок для админ-панели.

- [app/api/admin/logout/route.ts](C:\Users\User\Desktop\original\app\api\admin\logout\route.ts)  
  Выход из админки.

### Data layer

- [lib/db.ts](C:\Users\User\Desktop\original\lib\db.ts)  
  SQLite-слой: таблицы `submissions` и `admin_sessions`, чтение и запись данных.

- [lib/admin.ts](C:\Users\User\Desktop\original\lib\admin.ts)  
  Проверка ключа админки, создание cookie-сессии, logout.

- [lib/auth-context.tsx](C:\Users\User\Desktop\original\lib\auth-context.tsx)  
  Клиентский auth-context игрока.

## Где хранятся данные

- SQLite-база: `data/app.sqlite`
- JSON-снимок заявок: `data/player-submissions.json`

## Как работает игра

1. Игрок входит в систему.
2. На главном экране запускает миссию.
3. В игре едет по маршруту и доезжает до станций защиты.
4. На станциях отвечает на вопросы.
5. После финиша оставляет свои данные.
6. Эти данные уходят в backend и сохраняются в SQLite.
7. Админ заходит в `/admin` и видит все заявки.

## Как работает админка

1. Админ открывает `/admin`
2. Вводит ключ админки
3. Backend создаёт `httpOnly` cookie-сессию
4. Админка читает заявки уже по сессии

Текущий ключ:

```txt
DDG-OPS-2026
```

## Скрипты

```bash
npm install
npm run dev
npm run build
npm run start
```

## Локальный запуск

### Dev

```bash
npm install
npm run dev
```

Открыть:

```txt
http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

## Важные замечания

- Авторизация игрока сейчас клиентская и хранится в `localStorage`
- Админские данные и заявки игроков уже хранятся на серверной стороне в SQLite
- В проекте используется встроенный `node:sqlite`, это работает на `Node 22+`

## Что можно улучшать дальше

- Перевести и игроков тоже на серверную БД
- Усилить визуальный дизайн игры и HUD
- Добавить экспорт заявок из админки
- Добавить полноценные роли и защищённую серверную авторизацию
