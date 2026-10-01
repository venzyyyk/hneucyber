# KHNUE Cyber — лендинг кибертурниров ХНЕУ

Next.js 16 (App Router) · TypeScript · Tailwind v4 · zod.
Заявки: Telegram-бот + Google Sheets (Apps Script). Админка на `/admin`, контент хранится в репо и меняется коммитами.

```bash
npm i
cp .env.example .env.local   # для админки локально достаточно ADMIN_PASSWORD
npm run dev                  # http://localhost:3000, админка — http://localhost:3000/admin
```

Node 20.9+.

## Страницы

| Путь | Что там |
|---|---|
| `/` | Hero, система турниров, этапы, геоточка, партнёры, навигация |
| `/register` | Правила + форма: соло / команда (размер из настроек) |
| `/gallery` | Фото по событиям, фильтр, лайтбокс |
| `/admin` | Админка (ссылок на неё на сайте нет, в поиск не индексируется) |

## Админка

Вход по одному паролю (`ADMIN_PASSWORD`), сессия в httpOnly-куке на 7 дней. Защищено дважды: `proxy.ts` на `/admin/*` и `/api/admin/*` и проверка в каждом серверном действии. 10 попыток входа за 15 минут с одного IP.

| Раздел | Что можно |
|---|---|
| Заявки | Список из Google Sheets, поиск, фильтр соло/команды, раскрыть состав, удалить заявку, выгрузить CSV |
| Турнир и тексты | Дисциплина, дата, размер команды, запасной, статус регистрации (открыта / скоро / закрыта) и объявление, тексты главной, этапы, цифры, локация, партнёры с загрузкой логотипов, контакты, заглавная картинка |
| Правила | Разделы и пункты: добавить, удалить, переставить |
| Галерея | События (добавить / удалить / переставить / редактировать), загрузка фото пачкой (сжимаются в браузере до 2400px WebP), удаление фото |

### Как сохраняется

Режим выбирается не по платформе, а по тому, задан ли `GITHUB_TOKEN`:

- **На хостинге (Render / Vercel):** каждое «Сохранить» — один коммит в репо через GitHub API (`content/*.json` + картинки в `public/`). Хостинг видит коммит и пересобирает сайт, изменения через 1–2 минуты. История правок = история коммитов.
  **Почему не прямо в файлы:** у Render и Vercel файловая система временная — всё, что процесс записал на диск, стирается при следующем деплое и при засыпании/рестарте сервиса. Поэтому на хостинге только GitHub-режим. Без `GITHUB_TOKEN` разделы редактирования показывают «хранилище не настроено».
- **Локально `npm run dev` без `GITHUB_TOKEN`:** пишет прямо в файлы проекта, `next dev` подхватывает сразу. Это для теста перед деплоем.
- Открыть в двух вкладках и сохранить обе — вторая получит ошибку, а не перезапишет первую.
- Контент можно и дальше править руками в `content/*.json`.

### Деплой на Render (Web Service)

1. **Токен:** GitHub → Settings → Developer settings → Fine-grained tokens → Generate. Repository access: только этот репо. Permissions → Contents: **Read and write**.
2. **Render → New → Web Service**, подключи этот GitHub-репозиторий:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Auto-Deploy: **On** — это обязательно, иначе после коммита от админки Render не пересоберёт и изменения не появятся.
3. **Environment** (вкладка Environment у сервиса):
   - `ADMIN_PASSWORD` — пароль админки
   - `GITHUB_TOKEN` — токен из п.1
   - `GITHUB_REPO` — `owner/repo` (напр. `venzyyyk/khnue-cyber`). На Render **обязательно** — сам он это не подставит.
   - `GITHUB_BRANCH` — если прод-ветка не `main`
   - ключи Telegram / Sheets
4. Деплой. Админка на `https://твой-сервис.onrender.com/admin`.

> Render Free засыпает после 15 мин без запросов и просыпается ~30 сек на первом заходе. Сам сайт от этого не ломается, просто первый запрос медленный.

На **Vercel** то же самое: Environment Variables `ADMIN_PASSWORD`, `GITHUB_TOKEN` (и `GITHUB_REPO`/`GITHUB_BRANCH` можно не задавать — подтянутся из `VERCEL_GIT_*`), затем Redeploy.

## Заявки

Каждая заявка идёт в Telegram и Google Sheets параллельно. Если один канал упал — второй всё равно сохранит. Если на проде не задан ни один — API отвечает 503.

### Telegram
1. @BotFather → `/newbot` → токен в `TELEGRAM_BOT_TOKEN`.
2. Добавь бота в чат оргов, напиши что-нибудь, открой `https://api.telegram.org/bot<TOKEN>/getUpdates` → `chat.id` в `TELEGRAM_CHAT_ID`.

### Google Sheets
1. Новая таблица → Расширения → Apps Script → вставь `google-apps-script/Code.gs`.
2. Project Settings → Script properties → `SECRET` = любая длинная строка.
3. Deploy → New deployment → Web app, Execute as: Me, Access: Anyone → URL `…/exec` в `SHEETS_WEBHOOK_URL`, тот же секрет в `SHEETS_WEBHOOK_SECRET`.
4. **Если скрипт уже был задеплоен раньше** — вставь новую версию `Code.gs` и сделай Deploy → Manage deployments → Edit → Version: New version. Без этого раздел «Заявки» в админке не сможет читать и удалять.

Одна строка = один игрок, все ячейки как текст, защита от formula injection.

## Структура

```
app/(site)/          публичные страницы
app/admin/           админка: login, (panel)/…, actions.ts (server actions)
app/api/register     приём заявок
app/api/admin/       загрузка картинок и превью файлов из репо
content/*.json       весь контент сайта (редактируется админкой)
lib/content/schema   zod-схемы контента — одни и те же для сайта и админки
lib/admin/           сессия, хранилище (GitHub / локальные файлы)
proxy.ts             охрана /admin
```

## TODO перед запуском

- [ ] Реальные логотипы, название молодёжки, ссылка на TG-канал (всё через админку)
- [ ] Финальные тексты и правила
- [ ] Фото в галерею, дата турнира
- [ ] `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO`, ключи Telegram / Sheets в env хостинга
