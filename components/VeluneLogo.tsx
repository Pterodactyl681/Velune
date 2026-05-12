type VeluneLogoProps = {
  className?: string;
};

export function VeluneLogo({ className }: VeluneLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 68 68"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M43.7 7.5C39.7 5.8 35.2 5.1 30.7 5.7C15.1 7.8 4.2 22.2 6.3 37.8C8.4 53.4 22.8 64.3 38.4 62.2C49.9 60.6 59 52.4 62.1 41.9C58.3 48.7 51.4 53.7 42.9 54.9C28.3 56.9 14.9 46.7 12.9 32.1C10.9 17.5 21.1 4.1 35.7 2.1C38.6 1.7 41.5 1.9 44.1 2.5C44.9 2.7 44.6 7.9 43.7 7.5Z"
        fill="currentColor"
      />
      <path
        d="M35 24.5L38 32L45.5 35L38 38L35 45.5L32 38L24.5 35L32 32L35 24.5Z"
        fill="currentColor"
      />
      <circle cx="49.5" cy="20.5" r="3.7" fill="currentColor" />
    </svg>
  );
}
