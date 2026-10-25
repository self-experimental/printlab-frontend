import { Notification } from '@mantine/core';
import styles from '../styles/home-page.module.css';

interface UploadNoticeProps {
  error: string;
  message: string;
  visible: boolean;
  onClose: () => void;
}
export function UploadNotice({ error, message, visible, onClose }: UploadNoticeProps) {
  return visible ? (
    <Notification
      role={error ? 'alert' : 'status'}
      title={error ? 'Не удалось открыть модель' : 'Модель открыта'}
      color={error ? 'red' : 'teal'}
      className={styles['home-page__toast']}
      onClose={onClose}
      closeButtonProps={{ 'aria-label': 'Закрыть уведомление' }}
    >
      {error || message}
    </Notification>
  ) : (
    <div role="status" className={styles['home-page__silent']}>
      {message}
    </div>
  );
}
