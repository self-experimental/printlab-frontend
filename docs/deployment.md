# Размещение статической сборки

Соберите `npm run build` и разместите содержимое `dist/` на статическом сервере. Перед сборкой задайте нужные публичные переменные окружения. Для загрузки моделей нужен запущенный backend и перенаправление `/api/` на него.

## Пример Nginx для корня домена

```nginx
server {
    listen 80;
    server_name printlab.example.com;
    root /var/www/printlab/dist;
    index index.html;

    location /api/ {
        client_max_body_size 16m;
        proxy_pass http://127.0.0.1:8080;
        proxy_read_timeout 60s;
    }

    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Это пример маршрутизации и кэширования, а не полная инфраструктурная конфигурация. Для реального домена настройте HTTPS и конкретные пути. Правило `/api/` сохраняет префикс при передаче на backend и исключает SPA fallback. Лимит запроса учитывает multipart-обёртку; лимит самого STL на backend — 15 МиБ. Vite proxy применяется только при локальном запуске и preview.

Файлы `/assets/` имеют хеши и могут кэшироваться надолго. `index.html` должен перепроверяться, чтобы браузер получал ссылки на новую сборку. Отсутствующий ресурс в `/assets/` возвращает 404. Неизвестный маршрут приложения возвращает оболочку SPA с HTTP 200, затем React показывает страницу «не найдено».

## Подкаталог

Для размещения по `/printlab/`:

```sh
npm run build -- --base=/printlab/
```

Разместите файлы под этим URL. В статическом сервере fallback должен вести на `/printlab/index.html`, а правило ресурсов — на `/printlab/assets/`. Базовый путь маршрутизатора берётся из сборки.

Проверьте главную, прямую ссылку на вложенный маршрут, перезагрузку страницы и загрузку ресурсов. `npm run preview -- --base=/printlab/` позволяет проверить такой вариант локально.
