function animateCounter(id, target, duration, suffix = '') {
  const element = document.getElementById(id);
  let start = 0;
  const stepTime = Math.max(1, Math.floor(duration / target)); //reduce el tiempo a 1ms para animaciones más rápidas

  const timer = setInterval(() => {
    start += Math.ceil(target / (duration / stepTime)); //incremento mas grande para ir más rápido
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
  animateCounter('counter-bolsas', 334000, 1000); //reduce la duración a 2000ms
  animateCounter('counter-empleados', 90, 800, '');
});