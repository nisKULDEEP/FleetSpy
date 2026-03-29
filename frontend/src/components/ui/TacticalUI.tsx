import React from 'react';
import { cn } from '@/src/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-on-surface text-surface hover:bg-zinc-800',
      secondary: 'bg-primary-container text-on-surface hover:bg-primary',
      outline: 'bg-transparent border-2 border-on-surface text-on-surface hover:bg-on-surface hover:text-surface',
      ghost: 'bg-transparent text-on-surface hover:bg-surface-container-low',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'font-display uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-sm',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-outline">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-surface-container-low border-b-2 border-outline-variant px-4 py-3 text-sm font-sans outline-none transition-colors focus:border-primary-container',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

export const Card = ({ children, className, title, subtitle }: { children: React.ReactNode; className?: string; title?: string; subtitle?: string }) => {
  return (
    <div className={cn('bg-surface p-6 tactical-shadow border-l-4 border-primary-container', className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-xl font-display leading-tight">{title}</h3>}
          {subtitle && <p className="text-[10px] font-semibold tracking-widest text-outline uppercase mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
