document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in class to animated elements
  const animatedSelectors = [
    '.feature-row',
    '.section-header',
    '.mac-content',
    '.cta-title',
    '.cta-subtitle',
  ];

  animatedSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('fade-in');
    });
  });

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

});
