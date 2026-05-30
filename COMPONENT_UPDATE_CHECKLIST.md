# Component Update Checklist for Dark/Light Mode

Use this checklist when updating components to support dark and light modes.

## Before You Start
- [ ] Read `DARK_LIGHT_MODE_GUIDE.md`
- [ ] Review `src/components/ThemeExamples.jsx` for patterns
- [ ] Have a reference of available CSS variables (see below)

## Component Update Steps

### Step 1: Identify Hardcoded Colors
- [ ] Search for hex colors (`#...`)
- [ ] Search for color-specific Tailwind classes (`bg-slate-*`, `text-slate-*`, `border-slate-*`)
- [ ] List all colors that change between themes

### Step 2: Replace with CSS Variables
- [ ] Replace `bg-slate-950` with `style={{ backgroundColor: 'var(--bg-primary)' }}`
- [ ] Replace `text-slate-100` with `style={{ color: 'var(--text-primary)' }}`
- [ ] Replace `border-slate-800` with `style={{ borderColor: 'var(--border-color)' }}`

### Step 3: Add Transitions
- [ ] Add `transition-colors duration-300` to elements with color changes
- [ ] Test that color changes are smooth, not jarring

### Step 4: Test Both Themes
- [ ] [ Dark Mode ] Visual inspection - does it look good?
- [ ] [ Dark Mode ] Text contrast - is it readable?
- [ ] [ Light Mode ] Visual inspection - does it look good?
- [ ] [ Light Mode ] Text contrast - is it readable?

### Step 5: Test Interactive States
- [ ] Hover states are visible in both themes
- [ ] Focus states are visible in both themes
- [ ] Active/selected states are visible in both themes
- [ ] Disabled states are visible in both themes

### Step 6: Finalize
- [ ] Remove any remaining hardcoded colors
- [ ] Test on mobile and desktop
- [ ] Update related unit tests if any

## CSS Variables Quick Reference

### Backgrounds
```
var(--bg-primary)      Main page background
var(--bg-secondary)    Cards, containers, panels
var(--bg-tertiary)     Subtle highlights, secondary surfaces
var(--bg-hover)        Hover state backgrounds
```

### Text
```
var(--text-primary)    Main body text
var(--text-secondary)  Secondary text, descriptions
var(--text-tertiary)   Muted text, placeholders
```

### Borders
```
var(--border-color)    Standard border (forms, cards)
var(--border-light)    Light border (dividers, subtle edges)
```

### Form Inputs
```
var(--input-bg)        Input field background
var(--input-border)    Input field border
var(--input-text)      Input field text
```

### Accent Colors (No Theme Variation)
```
var(--emerald-500)     Primary accent (#22c55e)
var(--sky-400)         Secondary accent (#38bdf8)
```

## Component Types & Common Updates

### Page Components (Home, Dashboard, Problems, etc.)
- [ ] Main container background
- [ ] Section backgrounds
- [ ] Text colors
- [ ] Border colors

### Card Components
- [ ] Card background
- [ ] Card title and text colors
- [ ] Card border
- [ ] Card hover effects

### Button Components
- [ ] Button background colors
- [ ] Button text colors
- [ ] Button hover states
- [ ] Button focus states

### Form Components
- [ ] Input backgrounds
- [ ] Input text colors
- [ ] Input border colors
- [ ] Placeholder colors
- [ ] Focus states

### Navigation Components
- [ ] Nav background
- [ ] Nav text colors
- [ ] Active/inactive link colors
- [ ] Hover states

### Data Display (Tables, Lists)
- [ ] Row backgrounds
- [ ] Row text colors
- [ ] Alternate row colors
- [ ] Hover row colors
- [ ] Header colors

### Status/Alert Components
- [ ] Success colors (keep emerald)
- [ ] Error colors (red, but ensure contrast)
- [ ] Warning colors (amber, but ensure contrast)
- [ ] Info colors (sky/blue, but ensure contrast)

## Pattern Examples

### Simple Container
```jsx
<div style={{ 
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)',
}} className="border rounded-lg p-4 transition-colors duration-300">
  Content
</div>
```

### Card with Header/Body
```jsx
<div style={{ backgroundColor: 'var(--bg-secondary)' }} className="rounded-lg border transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
  <div style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }} className="border-b p-4">
    <h2 style={{ color: 'var(--text-primary)' }}>Title</h2>
  </div>
  <div className="p-4" style={{ color: 'var(--text-primary)' }}>
    Content
  </div>
</div>
```

### Interactive Button
```jsx
<button style={{
  backgroundColor: 'var(--bg-tertiary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-light)',
}} className="px-4 py-2 border rounded-lg transition-all duration-200 hover:opacity-80 focus:ring-2 focus:ring-emerald-500">
  Click me
</button>
```

## Validation Checklist

After updating a component:

- [ ] **No console errors** - Check browser console
- [ ] **No hardcoded colors** - Search for `#` and Tailwind color names
- [ ] **CSS variables used** - All colors use `var(--...)`
- [ ] **Transitions smooth** - No jarring color changes
- [ ] **Dark mode looks good** - Navigate and check all pages
- [ ] **Light mode looks good** - Toggle and check all pages
- [ ] **Contrast adequate** - Use WebAIM contrast checker
- [ ] **Interactive states work** - Hover, focus, active all visible
- [ ] **Mobile responsive** - Check on small screens

## Components to Update (Priority)

### High Priority (Used Frequently)
- [ ] `Home.jsx` - Landing page
- [ ] `Dashboard.jsx` - Main dashboard
- [ ] `Problems.jsx` - Problems list
- [ ] `Profile.jsx` - User profile

### Medium Priority (Common Use)
- [ ] `Workspace.jsx` - Code editor view
- [ ] `Competitive.jsx` - Competitive mode
- [ ] All page components

### Lower Priority (Less Time Critical)
- [ ] Admin components
- [ ] Game specific components
- [ ] Modal/dialog components

## Testing Template

For each component, test this template:

```
COMPONENT: ________________
UPDATED: Yes / No
DATE: ________________

DARK MODE TESTS:
☐ Container visible
☐ Text readable
☐ Borders visible
☐ Interactive states work

LIGHT MODE TESTS:
☐ Container visible
☐ Text readable
☐ Borders visible
☐ Interactive states work

CONTRAST RATIO SCORES:
- Normal text: _____ (target: 4.5:1)
- Large text: _____ (target: 3:1)
- UI Components: _____ (target: 3:1)

NOTES:
_________________________________
```

## Quick Commands

Find all hardcoded colors:
```bash
# Search for hex colors
grep -r "#[0-9A-Fa-f]\{3,6\}" src/

# Search for Tailwind color classes
grep -r "bg-slate-\|text-slate-\|border-slate-" src/
```

## Help & Support

- Refer to `DARK_LIGHT_MODE_GUIDE.md` for detailed documentation
- Check `ThemeExamples.jsx` for code patterns
- Review the updated `Navbar.jsx` and `App.jsx` for reference implementations

---

**Remember**: The goal is consistency across the app. When in doubt, use a CSS variable!
