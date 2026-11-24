# Расписание ВГТК (PWA)

PWA для просмотра расписания занятий ВГТК на сегодня и завтра: React 19, Vite, HeroUI, Tailwind CSS.

```bash
cp .env.example .env   # SCHEDULE_API_URL — адрес бэкенда, dev-сервер проксирует на него /api
npm install
npm run dev
```

## Архитектура — Feature-Sliced Design

```
src/
├── app/        # точка входа, провайдеры (тема, язык), глобальные стили, service worker
├── pages/      # экраны: schedule, settings, install
├── widgets/    # schedule-viewer — расписание со свайпом дней и pull-to-refresh
├── features/   # действия пользователя: select-group, change-group, refresh-schedule,
│               # install-app, change-theme, change-language, change-scale, contact-support
├── entities/   # schedule (API, парсинг, стор, список занятий), group (нормализация, сохранение)
└── shared/     # api-клиент, i18n, конфиг, утилиты (store, storage, platform...), UI-кит
```

Правила:

- слой импортирует только слои ниже себя: `app → pages → widgets → features → entities → shared`;
- слайсы одного слоя друг друга не импортируют;
- снаружи слайса импортируется только его публичный API (`index.js`), через алиас `@/`.
