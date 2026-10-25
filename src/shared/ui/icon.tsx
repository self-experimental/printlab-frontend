const paths = {
  upload: 'M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',
  close: 'm6 6 12 12M6 18 18 6',
  left: 'm10 7-5 5 5 5m-5-5h14',
  right: 'm14 7 5 5-5 5m5-5H5',
  up: 'm7 10 5-5 5 5m-5-5v14',
  down: 'm7 14 5 5 5-5m-5 5V5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  reset: 'M4 4v6h6M4 10a8 8 0 1 1 0 4',
} as const;

export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
