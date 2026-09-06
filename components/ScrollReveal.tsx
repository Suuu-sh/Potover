'use client';

import {useEffect, useRef, type ReactNode} from 'react';

/** Progressive enhancement: content remains visible without JavaScript or motion. */
export function ScrollReveal({children}: {children: ReactNode}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = root.current;
    if (!container || !('IntersectionObserver' in window)) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (preference.matches || entry.target.contains(document.activeElement)) return;
        const animation = entry.target.animate([
          {opacity: 0, transform: 'translateY(24px)'},
          {opacity: 1, transform: 'translateY(0)'},
        ], {
          duration: 650,
          delay: Number((entry.target as HTMLElement).dataset.revealDelay || 0),
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'backwards',
        });
        animations.set(entry.target, animation);
        animation.onfinish = () => animations.delete(entry.target);
      });
    }, {threshold: 0, rootMargin: '0px 0px -32px 0px'});

    container.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
    const stopMotion = () => {
      if (preference.matches) {
        animations.forEach(animation => animation.cancel());
        animations.clear();
      }
    };
    const revealFocused = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest('[data-reveal]');
      if (element) {
        observer.unobserve(element);
        animations.get(element)?.cancel();
        animations.delete(element);
      }
    };
    preference.addEventListener('change', stopMotion);
    container.addEventListener('focusin', revealFocused);
    return () => {
      observer.disconnect();
      animations.forEach(animation => animation.cancel());
      preference.removeEventListener('change', stopMotion);
      container.removeEventListener('focusin', revealFocused);
    };
  }, []);

  return <div ref={root} style={{display: 'contents'}}>{children}</div>;
}
