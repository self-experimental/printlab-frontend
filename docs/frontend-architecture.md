# Архитектура фронтенда Print Lab

Страница собирает готовые блоки, а не управляет загрузкой STL и расчётом геометрии внутри большого TSX-файла. Используется композиция небольших компонентов, без отдельной библиотеки UI и без искусственного переноса предметного кода в shared.

| Каталог                            | Ответственность                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `src/pages/home/home-page.tsx`     | Сборка главной страницы и передача обработчиков                              |
| `src/pages/home/ui`                | Отображение: шапка, модель, форма, уведомление, результаты, график и таблица |
| `src/pages/home/hooks`             | Связь сценариев страницы, тема, состояние и время жизни уведомления          |
| `src/pages/home/styles`            | CSS Modules страницы с именованием БЭМ                                       |
| `src/features/model-viewer/hooks`  | Асинхронная загрузка, защита от устаревшего чтения, поворот и масштаб        |
| `src/features/model-viewer/utils`  | Чистая проекция геометрии и форматирование размеров                          |
| `src/features/model-viewer/styles` | CSS Modules просмотрщика, блок `model-viewer`                                |
| `src/features/model-viewer/stl.ts` | Чтение и проверка ASCII / бинарного STL                                      |
| `src/features/optimization/hooks`  | Сохранение и сброс параметров запроса                                        |
| `src/features/optimization/model`  | Тип запроса и фиксированные экспериментальные данные макета                  |
| `src/static`                       | Исходный логотип из Figma и иконки интерфейса                                |
| `src/features/optimization/utils`  | Преобразование формы в запрос и координат графика                            |

`BrandLogo` и `PrimaryButton` — небольшие элементы интерфейса; `HomeHeader`, `ModelPanel`, `OptimizationForm` и `OptimizationResults` составляют из них экран. В результатах отдельно выделены `ResultSummary`, `ExperimentChart` и `ExperimentTable`. Это композиция в направлении атомарного подхода, без навязанной всему проекту иерархии atoms/molecules/organisms.

Имена CSS-классов соответствуют БЭМ: `home-page`, `home-page__header`, `home-page--light`, `home-page__toast--error`; просмотрщик использует отдельный блок `model-viewer`. CSS Modules сохраняют изоляцию селекторов. Общие стили исходного каркаса остаются в `src/app/styles.css`.

## Поведение и проверки

Рефакторинг не подключает API и не меняет фиксированные рекомендации из макета. Кнопка «Запустить оптимизацию» по-прежнему выбирает локальный пример. Сохранены валидация STL, защита от устаревших результатов чтения, очистка результатов при изменении формы, обе темы и уведомления без затемнения.

Проверки: `npm run check` (21 тест, ESLint, форматирование, TypeScript, production-сборка) и 8 сценариев Playwright на desktop/mobile, включая Axe. Пороги покрытия не снижались. Снимки интерфейса и сравнение до/после помогают проверить, что перенос стилей не изменил расположение элементов.

## Установка обновления из архива

Скопируйте `src`, `docs` и `CONTRIBUTING.md` из `printlab-architecture-update.zip` в существующий проект с заменой совпадающих файлов. Два старых файла стилей перенесены в каталоги `styles`; после копирования удалите только:

- `src/pages/home/home-page.module.css`
- `src/features/model-viewer/model-viewer.module.css`

Новые файлы уже находятся в `src/pages/home/styles/home-page.module.css` и `src/features/model-viewer/styles/model-viewer.module.css`. Устанавливать зависимости не требуется.

В PowerShell из корня проекта:

```powershell
Remove-Item .\src\pages\home\home-page.module.css, .\src\features\model-viewer\model-viewer.module.css -ErrorAction SilentlyContinue
npm.cmd run check
```

Сохраните изменения коммитом «Разделяет фронтенд на компоненты, хуки и утилиты», затем выполните Sync Changes в текущей ветке: уже открытый PR обновится. Для новой задачи используйте согласованную с куратором ветку `SELF-N`.
