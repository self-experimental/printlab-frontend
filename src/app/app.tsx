import { BrowserRouter } from 'react-router';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { theme } from './theme';
import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

export function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppRoutes />
        </BrowserRouter>
      </ErrorBoundary>
    </MantineProvider>
  );
}
