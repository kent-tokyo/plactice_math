/**
 * Inline script to prevent flash of wrong theme on page load.
 * Runs before React hydrates. Reads theme from localStorage
 * and removes `dark` class if user prefers light mode.
 *
 * Content is a static string literal — no user-controlled input.
 */

const THEME_INIT_SCRIPT = [
  '(function(){',
  'var t=localStorage.getItem("theme");',
  'if(t==="light")document.documentElement.classList.remove("dark");',
  'else if(!t&&window.matchMedia("(prefers-color-scheme: light)").matches)',
  'document.documentElement.classList.remove("dark")',
  '})()',
].join('');

export function ThemeScript() {
  // eslint-disable-next-line react/no-danger -- safe: static string, no user input
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
