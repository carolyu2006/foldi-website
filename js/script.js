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

  // Nav background intensity on scroll
  const nav = document.querySelector('.nav');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.style.background = 'rgba(251, 251, 253, 0.92)';
    } else {
      nav.style.background = 'rgba(251, 251, 253, 0.8)';
    }
  }, { passive: true });

  // Randomize hero preview card images — 3 left, 3 right
  const allImages = ['public/glass.png', 'public/left.png', 'public/emoji.png', 'public/right.png', 'public/text.png', 'public/blank.png'];
  const shuffled = allImages.sort(() => Math.random() - 0.5);
  const previewCards = document.querySelectorAll('.preview-card');
  previewCards.forEach((card, i) => {
    card.querySelector('img').src = shuffled[i];
  });
});
