import sunUrl from '@/static/icons/sun.svg';
import moonUrl from '@/static/icons/moon.svg';
import { PrimaryButton } from './primary-button';
import { BrandLogo } from './brand-logo';
import styles from '../styles/home-page.module.css';

interface HomeHeaderProps {
  light: boolean;
  loading: boolean;
  onToggleTheme: () => void;
  onUpload: () => void;
}
export function HomeHeader(props: HomeHeaderProps) {
  const { light, loading, onToggleTheme, onUpload } = props;
  return (
    <header className={styles['home-page__header']}>
      <a className={styles['home-page__brand']} href={import.meta.env.BASE_URL}>
        <BrandLogo />
        <span>
          <strong>Print Lab</strong>
          <small>Оптимизация параметров 3D-печати</small>
        </span>
      </a>
      <div className={styles['home-page__header-actions']}>
        <button
          type="button"
          className={styles['home-page__theme']}
          onClick={onToggleTheme}
          aria-label={light ? 'Включить тёмную тему' : 'Включить светлую тему'}
        >
          <img src={light ? moonUrl : sunUrl} alt="" aria-hidden="true" />
        </button>
        <PrimaryButton onClick={onUpload} disabled={loading}>
          ↑ <span>{loading ? 'Чтение STL…' : 'Загрузить модель'}</span>
        </PrimaryButton>
      </div>
    </header>
  );
}
