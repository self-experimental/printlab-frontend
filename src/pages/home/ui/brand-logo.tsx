import logoUrl from '@/static/images/printlab-logo.svg';
import styles from '../styles/home-page.module.css';

export function BrandLogo() {
  return <img className={styles['home-page__logo']} src={logoUrl} alt="" aria-hidden="true" />;
}
