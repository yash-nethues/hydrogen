import { useEffect } from 'react';

export function useSmoothScroll() {
  useEffect(() => {
    const handleClick = (ev: Event) => {
      ev.preventDefault();

      const item = (ev.target as HTMLElement).closest('[data-scroll-to]') as HTMLElement;
      if (!item) return;

      let scrollElem = item.getAttribute('data-scroll-to') || '';
      const delay = parseInt(item.getAttribute('data-delay') || '0', 10);
      let click = item.getAttribute('data-click') ? parseInt(item.getAttribute('data-click') || '1') : 1;

      // Handle tab toggle
      if (item.classList.contains('is-tab')) {
        const targetEl = document.querySelector(scrollElem);
        click = targetEl?.classList.contains('active') ? 0 : 1;
      }

      // Get scroll target
      let scrollTriggerElem = document.querySelector(scrollElem);
      if (!scrollTriggerElem && scrollElem.includes('#')) {
        const [, name] = scrollElem.split('#');
        scrollTriggerElem = document.querySelector(`[name="${name}"]`);
      }

      if (!scrollTriggerElem) return;

      if (click && scrollTriggerElem instanceof HTMLElement) {
        scrollTriggerElem.click();
      }

      setTimeout(() => {
        const header = document.querySelector('.headerSticky');
        const headerOffset = header?.classList.contains('fixed-header') ? header.offsetHeight : 0;

        const targetTop = scrollTriggerElem.getBoundingClientRect().top + window.scrollY;
        const scrollOffset = targetTop - headerOffset;

        window.scroll({
          top: scrollOffset,
          left: 0,
          behavior: 'smooth'
        });
      }, delay);
    };

    const scrollElems = document.querySelectorAll('.scroll-to-element-jq');
    scrollElems.forEach((el) => {
      el.addEventListener('click', handleClick);
    });

    return () => {
      scrollElems.forEach((el) => {
        el.removeEventListener('click', handleClick);
      });
    };
  }, []);
}
