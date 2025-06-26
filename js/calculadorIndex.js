function animateCounter(id, target, duration, suffix = '') {
  const element = document.getElementById(id);
  let start = 0;
  const stepTime = Math.max(1, Math.floor(duration / target)); // Reduje el mínimo a 1ms para mayor velocidad

  const timer = setInterval(() => {
    start += Math.ceil(target / (duration / stepTime)); // Incremento más grande para ir más rápido
    if (start > target) start = target;
    element.textContent = '+' + start.toLocaleString() + suffix;
    if (start >= target) {
      clearInterval(timer);
    }
  }, stepTime);
}

window.addEventListener('load', () => {
  animateCounter('counter-rubro', 36, 800, ' años');
  animateCounter('counter-produccion', 25, 800, ' años');
  animateCounter('counter-bolsas', 334000, 1000); // Reduje la duración a 2000ms (2 segundos)
  animateCounter('counter-empleados', 90, 800, '');
});