import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}, ref) => {
  
  // Base styles that apply to all buttons
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl 
    transition-all duration-200 focus:outline-none focus:ring-4 
    disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
    transform hover:scale-[1.02] active:scale-[0.98]
  `;

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-5 py-4 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]'
  };

  // Variant styles with soft, modern colors
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25
      hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
      focus:ring-blue-500/30 disabled:from-blue-300 disabled:to-blue-300 disabled:shadow-blue-500/10
    `,
    secondary: `
      bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 border border-slate-300/50 shadow-sm
      hover:from-slate-200 hover:to-slate-300 hover:border-slate-400/50 hover:shadow-md hover:-translate-y-0.5
      focus:ring-slate-500/30 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400
      dark:from-slate-700 dark:to-slate-800 dark:text-slate-200 dark:border-slate-600/50
      dark:hover:from-slate-600 dark:hover:to-slate-700 dark:disabled:text-slate-500
    `,
    success: `
      bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25
      hover:from-emerald-600 hover:to-green-700 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5
      focus:ring-emerald-500/30 disabled:from-emerald-300 disabled:to-green-300 disabled:shadow-emerald-500/10
    `,
    warning: `
      bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25
      hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5
      focus:ring-amber-500/30 disabled:from-amber-300 disabled:to-orange-300 disabled:shadow-amber-500/10
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25
      hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5
      focus:ring-red-500/30 disabled:from-red-300 disabled:to-rose-300 disabled:shadow-red-500/10
    `,
    ghost: `
      bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800
      focus:ring-slate-500/20 disabled:text-slate-400 disabled:hover:bg-transparent
      dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200
    `,
    outline: `
      bg-transparent border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400
      focus:ring-blue-500/30 disabled:border-blue-200 disabled:text-blue-300 disabled:hover:bg-transparent
      dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950/50
    `
  };

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  // Loading spinner component
  const LoadingSpinner = () => (
    <svg 
      className="w-4 h-4 animate-spin" 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeDasharray="32" 
        strokeDashoffset="32"
        className="opacity-30"
      />
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeDasharray="8" 
        strokeDashoffset="8"
        className="opacity-80"
      />
    </svg>
  );

  const combinedClassName = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${widthStyles}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      ref={ref}
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && !isLoading && leftIcon}
          {children}
          {rightIcon && !isLoading && rightIcon}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

// Usage Examples:
/*
// Basic usage
<Button>Click me</Button>

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With icons
import { User, ArrowRight, Download } from 'lucide-react';
<Button leftIcon={<User className="w-4 h-4" />}>Profile</Button>
<Button rightIcon={<ArrowRight className="w-4 h-4" />}>Continue</Button>
<Button leftIcon={<Download className="w-4 h-4" />} variant="success">Download</Button>

// Loading state
<Button isLoading>Processing</Button>

// Disabled state
<Button disabled>Disabled</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// Custom styling
<Button className="custom-class" onClick={() => console.log('clicked')}>
  Custom Button
</Button>
*/