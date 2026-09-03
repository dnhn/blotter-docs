import { currentTheme, onThemeChange, setTheme, type Theme } from './theme';

function reflect(button: HTMLButtonElement, theme: Theme): void {
  button.setAttribute('aria-pressed', String(theme === 'dark'));
  button.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
}

const buttons = [
  ...document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]'),
].filter((button) => !button.dataset.mounted);

for (const button of buttons) {
  button.dataset.mounted = 'true';
  reflect(button, currentTheme());
  button.addEventListener('click', () => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}

if (buttons.length) {
  onThemeChange((theme) => {
    for (const button of buttons) reflect(button, theme);
  });
}
