import type { ComponentPropsWithoutRef } from 'react';
import styles from '../styles/home-page.module.css';

type PrimaryButtonProps = ComponentPropsWithoutRef<'button'>;

export function PrimaryButton({ className = '', type = 'button', ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[styles['home-page__primary'], className].join(' ')}
    />
  );
}
