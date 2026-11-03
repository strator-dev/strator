import React from "react";

type IconProps = { size?: number; className?: string };

function icon(paths: React.ReactNode, strokeWidth = 2) {
  return function Icon({ size = 14, className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {paths}
      </svg>
    );
  };
}

export const PauseIcon = icon(
  <>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </>,
);
export const RecordIcon = icon(<circle cx="12" cy="12" r="6" />);
export const ClearIcon = icon(
  <>
    <circle cx="12" cy="12" r="8" />
    <path d="M6.5 17.5l11-11" />
  </>,
);
export const DownloadIcon = icon(
  <>
    <path d="M12 4v11" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </>,
);
export const SettingsIcon = icon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </>,
);
export const CloseIcon = icon(<path d="M6 6l12 12M18 6L6 18" />);
export const MaximizeIcon = icon(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />);
export const MinimizeIcon = icon(<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />);
export const SearchIcon = icon(
  <>
    <circle cx="11" cy="11" r="6" />
    <path d="M20 20l-4.5-4.5" />
  </>,
);
export const UsersIcon = icon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
    <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.8c1.6.8 2.6 2.6 3 5.2" />
  </>,
);
export const ListIcon = icon(<path d="M4 6h16M4 12h10M4 18h6" />, 1.6);
export const SpinnerIcon = icon(<path d="M12 3a9 9 0 1 1-9 9" />, 3);
export const ArrowIcon = icon(<path d="M5 12h14M13 6l6 6-6 6" />);
export const PanelLeftIcon = icon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </>,
);
export const PanelRightIcon = icon(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M15 4v16" />
  </>,
);
export const ChevronLeftIcon = icon(<path d="M15 6l-6 6 6 6" />);
export const ChevronRightIcon = icon(<path d="M9 6l6 6-6 6" />);
