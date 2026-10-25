import { Button } from '@mantine/core';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="message-page">
      <p className="eyebrow">Ошибка 404</p>
      <h1>Страница не найдена</h1>
      <p>Проверьте адрес или вернитесь на главную.</p>
      <Button component={Link} mt="md" to="/">
        На главную
      </Button>
    </main>
  );
}
