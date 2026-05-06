interface SvgProps {
  className?: string;
  width?: number;
  height?: number;
}

const IconStroke = (children: React.ReactNode) =>
  ({ className, width = 14, height = 14 }: SvgProps) => (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className} width={width} height={height}
    >
      {children}
    </svg>
  );

export const Icons = {
  calendar: IconStroke(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>),
  doc:      IconStroke(<><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M14 3v6h5M9 14h7M9 18h5"/></>),
  users:    IconStroke(<><circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="10" r="2.4"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6M14 19c0-2.4 1.7-4.5 4-5"/></>),
  trend:    IconStroke(<><path d="M3 17l5-5 4 4 8-9"/><path d="M14 7h6v6"/></>),
  review:   IconStroke(<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>),
  check:    IconStroke(<><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></>),
  money:    IconStroke(<><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/></>),
  pipe:     IconStroke(<><path d="M3 12h6l3-6 3 12 3-6h3"/></>),
};

export function StatIcon({ name, className }: { name: string; className?: string }) {
  const C = Icons[name as keyof typeof Icons] || Icons.trend;
  return <C className={className} />;
}
