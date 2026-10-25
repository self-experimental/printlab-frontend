import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useUploadNotice } from './use-upload-notice';

afterEach(() => {
  vi.useRealTimers();
});

it('скрывает успех через семь секунд, а ошибку оставляет до явного закрытия', () => {
  vi.useFakeTimers();
  const { result } = renderHook(useUploadNotice);
  act(() => {
    result.current.setMessage('Модель открыта.');
  });
  expect(result.current.visible).toBe(true);
  act(() => {
    vi.advanceTimersByTime(7000);
  });
  expect(result.current.visible).toBe(false);
  act(() => {
    result.current.setError('Выберите другой STL-файл.');
  });
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  expect(result.current.visible).toBe(true);
  expect(result.current.error).toBe('Выберите другой STL-файл.');
  act(() => {
    result.current.close();
  });
  expect(result.current.visible).toBe(false);
});
