export function ThemeProvider({ children }) {
  
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("dark");
  }

  return children;
}
