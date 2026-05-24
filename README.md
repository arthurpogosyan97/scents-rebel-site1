# SCENTS REBEL Shop

Интерактивный сайт-магазин ароматических свечей SCENTS REBEL.

## Что внутри

- Каталог товаров с фильтрами и поиском
- Корзина и промокод `AROMA10`
- Форма оформления заказа
- Отправка заказов в Telegram-бота через серверный endpoint
- Анимации дыма, hover-анимации карточек и промо-блок первого заказа

## Структура

```text
.
├── index.html
├── styles.css
├── app.js
├── server.mjs
├── package.json
├── .env.example
└── images/
```

## Локальный запуск

Нужен Node.js.

```bash
npm start
```

После запуска сайт будет доступен по адресу:

```text
http://localhost:4173
```

## Telegram-заказы

Для отправки заказов в Telegram нужно задать переменные окружения:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

На Windows PowerShell:

```powershell
$env:TELEGRAM_BOT_TOKEN="your_bot_token"
$env:TELEGRAM_CHAT_ID="your_chat_id"
npm start
```

Не загружайте настоящий токен бота в GitHub. Файл `.env` добавлен в `.gitignore`.

## Публикация на GitHub

1. Создайте новый репозиторий на GitHub.
2. Загрузите в него все файлы из этой папки.
3. Не добавляйте `.env` и реальные токены.

Если сайт будет размещаться как статический на GitHub Pages, форма Telegram-заказа работать не будет без отдельного backend-хостинга, потому что GitHub Pages не запускает `server.mjs`.
