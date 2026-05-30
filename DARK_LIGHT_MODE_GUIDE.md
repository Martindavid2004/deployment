# Dark/Light Mode Implementation Guide

## Overview
The application now has a complete dark and light mode system. Users can toggle between themes using the button in the navbar, and their preference is saved to localStorage.

## Architecture

### Theme CSS Variables
The theme system uses CSS variables defined in `src/index.css`:

**Dark Mode (Default):**
```css
--bg-primary: #0f172a      /* Main background */
--bg-secondary: #1e293b    /* Secondary surfaces */
--bg-tertiary: #334155     /* Tertiary surfaces */
--bg-hover: #475569        /* Hover states */
--text-primary: #f1f5f9    /* Main text */
--text-secondary: #cbd5e1  /* Secondary text */
--text-tertiary: #94a3b8   /* Tertiary text */
--border-color: #334155    /* Borders */
```

**Light Mode:**
Automatically switched when `.light-theme` class is added to the `<html>` element.

### File Structure
- `src/context/ThemeContext.jsx` - Optional React Context for theme management
- `src/index.css` - Global styles and CSS variables
- `tailwind.config.cjs` - Tailwind CSS configuration
- `src/App.jsx` - Theme state and toggle logic
- `src/components/Navbar.jsx` - Theme toggle button

## Usage in Components

### Using CSS Variables (Recommended)
```jsx
<div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
  Content
</div>
```

### Using Tailwind Classes
```jsx
<div className="bg-slate-950 dark:bg-white text-slate-100 dark:text-slate-900">
  Content
</div>
```

### Using the Theme Context (Optional)
```jsx
import { useTheme } from '../context/ThemeContext';

export default function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## Styling Checklist for New Components

When creating new components that need to support both themes:

- [ ] Use CSS variables for colors: `var(--bg-primary)`, `var(--text-primary)`, etc.
- [ ] Use `var(--border-color)` or `var(--border-light)` for borders
- [ ] Add `transition-colors duration-300` to elements that change color on theme switch
- [ ] Test the component in both **dark mode** and **light mode**
- [ ] Ensure text contrast meets WCAG standards in both modes
- [ ] Use Tailwind's dark mode syntax for class-based styling:
  ```jsx
  className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
  ```

## Available CSS Variables

### Background Colors
- `--bg-primary` - Main page background
- `--bg-secondary` - Card and container backgrounds
- `--bg-tertiary` - Subtle background highlights
- `--bg-hover` - Hover state backgrounds

### Text Colors
- `--text-primary` - Main body text
- `--text-secondary` - Secondary/muted text
- `--text-tertiary` - Very subtle text

### Borders & Dividers
- `--border-color` - Standard border color
- `--border-light` - Lighter border color

### Input Styles
- `--input-bg` - Input field background
- `--input-border` - Input field border
- `--input-text` - Input field text

### Accent Colors (Same in Both Modes)
The emerald and sky colors remain consistent:
- `--emerald-500` - Primary accent
- `--sky-400` - Secondary accent

## Theme Toggle Implementation

The theme toggle button is in the navbar and automatically:
1. Toggles the `light-theme` class on the document root
2. Saves the preference to localStorage
3. Persists across page reloads
4. Updates all CSS variables instantly

## Testing Themes

To test your component in both modes:

1. **Toggle the theme** using the moon/sun button in the navbar
2. **Check all states:**
   - Normal state
   - Hover state
   - Focus state
   - Active/selected state
   - Disabled state

3. **Check text contrast** in both modes using a contrast checker

## Troubleshooting

### Colors not changing on theme toggle
- Verify you're using CSS variables: `var(--bg-primary)`
- Avoid hardcoded colors like `#1e293b` or Tailwind classes without dark: prefix
- Check browser console for any CSS errors

### Theme reverts on page reload
- Ensure localStorage is enabled in the browser
- Check that `STORAGE_KEY` in App.jsx is not being overwritten

### Navbar toggle button not visible
- Check that the moon/sun icons from lucide-react are imported
- Verify the button has proper z-index (should be `z-40`)

## Migration Guide

If updating existing components to support the new theme system:

1. Replace hardcoded colors with CSS variables
2. Add `transition-colors duration-300` class to elements
3. Update Tailwind classes to use `dark:` prefix or CSS variables
4. Test in both light and dark modes
5. Update related tests if necessary

## Future Enhancements

Possible improvements:
- [ ] Add system preference detection (prefers-color-scheme)
- [ ] Add more theme options (high contrast, etc.)
- [ ] Create theme customization panel
- [ ] Add transition animations for theme changes
- [ ] Support multiple color schemes

## Support

For issues or questions about the theme system, refer to the CSS variables in `src/index.css` or check the implementation in `src/App.jsx`.
