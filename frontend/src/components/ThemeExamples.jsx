/**
 * EXAMPLE: How to Add Dark Mode Support to Any Component
 * 
 * Here are several patterns you can use in your components
 */

// ===== METHOD 1: Using CSS Variables (Recommended) =====
export function ComponentWithCSSVariables() {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border-color)',
      }}
      className="p-4 rounded-lg border transition-colors duration-300"
    >
      <h2>CSS Variables Method</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        This is the recommended approach for new components
      </p>
    </div>
  );
}

// ===== METHOD 2: Using Tailwind Dark Mode =====
export function ComponentWithTailwind() {
  return (
    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <h2>Tailwind Dark Mode Method</h2>
      <p className="text-slate-600 dark:text-slate-400">
        Use the dark: prefix for Tailwind classes
      </p>
    </div>
  );
}

// ===== METHOD 3: Hybrid Approach (CSS Variables + Tailwind) =====
export function ComponentHybrid() {
  return (
    <div
      className="p-4 rounded-lg border transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        borderColor: 'var(--border-light)',
      }}
    >
      <h2 className="font-bold mb-2">Hybrid Method</h2>
      <div className="space-y-2">
        <p>CSS Variables for base colors</p>
        <p className="text-sm text-opacity-75" style={{ color: 'var(--text-secondary)' }}>
          Tailwind for layout and spacing
        </p>
      </div>
    </div>
  );
}

// ===== METHOD 4: Button Component Example =====
export function ThemeSensitiveButton({ children, variant = 'primary' }) {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#22c55e', // emerald-500
          color: 'white',
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-light)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-color)',
        };
      default:
        return {};
    }
  };

  return (
    <button
      style={getStyles()}
      className="px-4 py-2 rounded-lg border font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {children}
    </button>
  );
}

// ===== METHOD 5: Card Component with Multiple Sections =====
export function ThemeAwareCard({ title, description, content }) {
  return (
    <div
      className="rounded-lg overflow-hidden border transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          borderColor: 'var(--border-color)',
        }}
      >
        <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        {description && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
      </div>

      {/* Content */}
      <div
        className="px-6 py-4"
        style={{ color: 'var(--text-primary)' }}
      >
        {content}
      </div>
    </div>
  );
}

// ===== METHOD 6: Form Input Example =====
export function ThemeAwareInput({ placeholder, ...props }) {
  return (
    <input
      placeholder={placeholder}
      className="w-full px-4 py-2 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      style={{
        backgroundColor: 'var(--input-bg)',
        color: 'var(--input-text)',
        borderColor: 'var(--input-border)',
      }}
      {...props}
    />
  );
}

// ===== METHOD 7: Status Indicator Example =====
export function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return { bg: '#10b981', text: '#ffffff' }; // emerald
      case 'warning':
        return { bg: '#f59e0b', text: '#ffffff' }; // amber
      case 'error':
        return { bg: '#ef4444', text: '#ffffff' }; // red
      case 'pending':
        return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
      default:
        return { bg: 'var(--bg-tertiary)', text: 'var(--text-primary)' };
    }
  };

  const colors = getStatusColor();

  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {status}
    </span>
  );
}

// ===== QUICK REFERENCE TABLE =====
/*
CSS VARIABLE          | Dark Mode      | Light Mode    | Usage
--bg-primary          | #0f172a        | #ffffff       | Page background
--bg-secondary        | #1e293b        | #f8fafc       | Cards, containers
--bg-tertiary         | #334155        | #e2e8f0       | Subtle backgrounds
--bg-hover            | #475569        | #cbd5e1       | Hover states
--text-primary        | #f1f5f9        | #1e293b       | Main text
--text-secondary      | #cbd5e1        | #334155       | Secondary text
--text-tertiary       | #94a3b8        | #64748b       | Subtle text
--border-color        | #334155        | #e2e8f0       | Standard borders
--border-light        | #475569        | #cbd5e1       | Light borders
--input-bg            | #1e293b        | #f8fafc       | Input background
--input-border        | #334155        | #e2e8f0       | Input border
--input-text          | #f1f5f9        | #1e293b       | Input text
*/

// ===== TESTING YOUR COMPONENT =====
/*
1. Wrap your component in the app root (App.jsx will handle theme context)
2. Click the moon/sun icon in the navbar to toggle theme
3. Verify all colors change appropriately
4. Check hover, focus, and active states in both themes
5. Test text contrast - aim for WCAG AA standards (4.5:1 for normal text)
6. Check that transitions are smooth

Example test component:
<>
  <ComponentWithCSSVariables />
  <ComponentWithTailwind />
  <ThemeAwareButton variant="primary">Primary</ThemeAwareButton>
  <ThemeAwareButton variant="secondary">Secondary</ThemeAwareButton>
  <ThemeAwareCard title="Test Card" content="Content" />
</>
*/

export default {
  ComponentWithCSSVariables,
  ComponentWithTailwind,
  ComponentHybrid,
  ThemeSensitiveButton,
  ThemeAwareCard,
  ThemeAwareInput,
  StatusBadge,
};
