import { useEffect, useState } from 'react';

export function useUploadNotice() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const visible = Boolean(error) || message === 'Модель открыта.';
  function close() {
    setError('');
    setMessage('');
  }
  useEffect(() => {
    if (!visible || error) return;
    const timeout = window.setTimeout(() => {
      setError('');
      setMessage('');
    }, 7000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [visible, error, message]);
  return { error, message, visible, close, setError, setMessage };
}
