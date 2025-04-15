import { ComponentPropsWithRef, FC, forwardRef, ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const button = cva(
  [
    'rounded-md',
    'px-4',
    'py-2',
    'text-sm',
    'font-medium',
    'text-neutral-300',
    'disabled:bg-chatbot-950',
    'disabled:text-neutral-500',
  ],
  {
    variants: {
      variant: {
        primary: ['bg-sky-600', 'hover:bg-sky-700'],
        danger: ['text-neutral-200', 'bg-red-900', 'hover:bg-red-950'],
        default: ['border', 'border-chatbot-800', 'hover:bg-neutral-900'],
      },
      size: {
        default: [],
        small: ['text-sm', 'p-2', 'py-1'],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = VariantProps<typeof button>;

type Props = {
  children: ReactNode;
} & ButtonProps &
  ComponentPropsWithRef<'button'>;

const FormButton: FC<Props> = forwardRef(
  ({ className, children, ...props }, ref) => {
    const buttonClassName = twMerge(button(props), className);

    return (
      <button className={buttonClassName} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

FormButton.displayName = 'FormButton';

export default FormButton;
