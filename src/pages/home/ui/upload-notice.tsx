import styles from '../styles/home-page.module.css';

interface UploadNoticeProps {
  error: string;
  message: string;
  visible: boolean;
  onClose: () => void;
}
export function UploadNotice(props: UploadNoticeProps) {
  const { error, message, visible, onClose } = props;
  return (
    <>
      {visible && (
        <div
          className={[
            styles['home-page__toast'],
            error ? styles['home-page__toast--error'] : '',
          ].join(' ')}
          role={error ? 'alert' : 'status'}
        >
          <span className={styles['home-page__toast-icon']} aria-hidden="true">
            {error ? '!' : '✓'}
          </span>
          <div>
            <strong>{error ? 'Ошибка загрузки' : 'Модель загружена'}</strong>
            <p>{error || message}</p>
          </div>
          <button type="button" aria-label="Закрыть уведомление" onClick={onClose}>
            ×
          </button>
        </div>
      )}
      {!visible && (
        <div role="status" className={styles['home-page__silent']}>
          {message}
        </div>
      )}
    </>
  );
}
