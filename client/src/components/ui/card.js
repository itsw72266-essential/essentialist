import React from 'react';

// Tiny helper to join class names without extra deps
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('p-4 md:p-6 border-b border-gray-100', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return (
    <div
      className={cn('p-4 md:p-6', className)}
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn('p-4 md:p-6 border-t border-gray-100', className)}
      {...props}
    />
  );
}

export default Card;