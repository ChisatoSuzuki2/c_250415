import { FC, ReactNode } from 'react';

type Props = {
  tooltipContent: JSX.Element;
  children: ReactNode;
  position?: Position;
};

type Position = 'left' | 'center' | 'right' | 'bottom';

const positionCss = (position?: Position) => {
  switch (position) {
    case 'left':
      return '-top-12 right-0 translate-x-2';
    case 'right':
      return '-top-12 left-0 -translate-x-2';
    case 'bottom':
      return 'top-full left-1/2 -translate-x-1/2';
    default:
      // 'center' or undefined
      return '-top-12 left-1/2 -translate-x-1/2';
  }
};

const Tooltip: FC<Props> = ({ tooltipContent, children, position }) => {
  return (
    <>
      <span className="group relative">
        <span
          className={`absolute whitespace-nowrap rounded-md bg-neutral-950 p-2 ${positionCss(
            position,
          )} pointer-events-none opacity-0 transition group-hover:opacity-100`}
        >
          {tooltipContent}
        </span>
        {children}
      </span>
    </>
  );
};

export default Tooltip;
