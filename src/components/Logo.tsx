import React from 'react';

const NAVY = '#1C2653';
const TEAL = '#2ED3C2';

interface LogoProps {
  className?: string;
}

/**
 * Icon: rounded "b" mark with magnifier lens and orbital dots
 * (recreation of the DataYar brand icon)
 */
export const LogoIcon: React.FC<LogoProps> = ({ className = 'w-9 h-9' }) => (
  <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* stem of the "b" */}
    <rect x="35" y="25" width="50" height="150" rx="25" fill={NAVY} />
    {/* bowl of the "b" */}
    <rect x="35" y="60" width="140" height="115" rx="46" fill={NAVY} />
    {/* top dot */}
    <circle cx="60" cy="44" r="17" fill={TEAL} />
    {/* magnifier ring */}
    <circle cx="106" cy="104" r="38" fill="none" stroke={NAVY} strokeWidth="20" />
    <circle cx="106" cy="104" r="38" fill="none" stroke="#000000" opacity="0" />
    {/* lens */}
    <circle cx="106" cy="104" r="25" fill={TEAL} />
    {/* handle */}
    <line x1="134" y1="132" x2="163" y2="161" stroke={NAVY} strokeWidth="24" strokeLinecap="round" />
    {/* bottom orbital arc */}
    <path d="M56 148 Q 103 178 150 148" fill="none" stroke={TEAL} strokeWidth="11" strokeLinecap="round" />
    <circle cx="56" cy="148" r="13" fill={TEAL} />
    <circle cx="103" cy="163" r="13" fill={TEAL} />
    <circle cx="150" cy="148" r="13" fill={TEAL} />
  </svg>
);

/**
 * Wordmark: "DataYar" in geometric rounded letterforms with teal
 * molecular dots (recreation of the DataYar wordmark)
 */
export const LogoWordmark: React.FC<LogoProps> = ({ className = 'h-6 w-auto' }) => (
  <svg viewBox="0 0 780 200" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="DataYar" role="img">
    <g stroke={NAVY} strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* D */}
      <path d="M57 33 V167" />
      <path d="M57 33 H85 A67 67 0 0 1 85 167 H57" />
      {/* a */}
      <circle cx="212" cy="127" r="41" />
      <path d="M253 86 V167" />
      {/* t */}
      <path d="M305 42 V148 a19 19 0 0 0 19 19 h10" />
      <path d="M277 88 H333" />
      {/* a */}
      <circle cx="397" cy="127" r="41" />
      <path d="M438 86 V167" />
      {/* Y */}
      <path d="M470 33 L520 110" />
      <path d="M570 33 L520 110" />
      <path d="M520 110 V167" />
      {/* a */}
      <circle cx="642" cy="127" r="41" />
      <path d="M683 86 V167" />
      {/* r */}
      <path d="M715 100 V167" />
      <path d="M715 120 a34 34 0 0 1 34 -30 h6" />
    </g>

    <g stroke={TEAL} strokeWidth="12" strokeLinecap="round">
      {/* molecular bond through D */}
      <line x1="16" y1="100" x2="98" y2="100" />
      {/* Y branch bonds */}
      <line x1="470" y1="33" x2="520" y2="110" />
      <line x1="570" y1="33" x2="520" y2="110" />
    </g>

    <g fill={TEAL}>
      {/* D bond dots */}
      <circle cx="16" cy="100" r="17" />
      <circle cx="98" cy="100" r="12" />
      {/* a counter dots */}
      <circle cx="212" cy="127" r="14" />
      <circle cx="397" cy="127" r="14" />
      <circle cx="642" cy="127" r="14" />
      {/* t crossbar dot */}
      <circle cx="281" cy="88" r="12" />
      {/* Y dots */}
      <circle cx="470" cy="33" r="14" />
      <circle cx="570" cy="33" r="14" />
      <circle cx="520" cy="110" r="15" />
      {/* r tip dot */}
      <circle cx="757" cy="88" r="12" />
    </g>
  </svg>
);
