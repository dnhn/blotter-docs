/**
 * Call `onEnter` / `onLeave` as an element scrolls into and out of view.
 * Returns a function that stops watching. No-op where the API is missing.
 */
export function watchVisibility(
  el: Element,
  onEnter: () => void,
  onLeave: () => void,
): () => void {
  if (typeof IntersectionObserver === 'undefined') return () => {};
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onEnter();
        else onLeave();
      }
    },
    { rootMargin: '10% 0px' },
  );
  observer.observe(el);
  return () => observer.disconnect();
}
