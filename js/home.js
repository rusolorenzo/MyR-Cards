document.querySelectorAll('.reveal').forEach((el) => { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }, { threshold: .15 }); io.observe(el) });
document.querySelectorAll('.reveal').forEach((el) => {
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.2 });
  io.observe(el);
});
