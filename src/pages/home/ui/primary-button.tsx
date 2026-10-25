import { Button, type ButtonProps } from '@mantine/core';
import type { ComponentPropsWithoutRef } from 'react';

type PrimaryButtonProps = ButtonProps & ComponentPropsWithoutRef<'button'>;

export function PrimaryButton({ className = '', type = 'button', ...props }: PrimaryButtonProps) {
  return <Button {...props} type={type} className={className} />;
}
