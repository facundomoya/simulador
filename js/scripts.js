const calendarEl = document.getElementById('calendar');
const monthTitle = document.getElementById('monthTitle');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnSimular = document.getElementById('btnSimular');

const gddDailyEl = document.getElementById('gddDaily');
const gddAcumEl = document.getElementById('gddAcum');

const Tbase = 10;

const monthsToSimulate = [
  { year: 2025, month: 12, name: 'Diciembre' },
  { year: 2026, month: 1, name: 'Enero' },
  { year: 2026, month: 2, name: 'Febrero' },
  { year: 2026, month: 3, name: 'Marzo' },
  { year: 2026, month: 4, name: 'Abril' }
];

const tempRanges = {
  12: [17, 26],
  1: [22, 30],
  2: [20, 32],
  3: [10, 26],
  4: [8, 24]
};

const etapas = [
  { label: 'vn', nombre: 'Vn', min: 0, max: 500 },
  { label: 'r1', nombre: 'R1', min: 500, max: 600 },
  { label: 'r2', nombre: 'R2', min: 600, max: 750 },
  { label: 'r3', nombre: 'R3', min: 750, max: 900 },
  { label: 'r4', nombre: 'R4', min: 900, max: 1050 },
  { label: 'r5', nombre: 'R5', min: 1050, max: 1250 },
  { label: 'r6', nombre: 'R6', min: 1250, max: 1400 },
  { label: 'r7', nombre: 'R7', min: 1400, max: 1500 },
  { label: 'r8', nombre: 'R8', min: 1500, max: 1600 }
];

let currentMonthIndex = 0;
let allData = [];
let gddTotal = 0;
let reachedR8 = false;
let selectedDay = null;
let simulationDone = false;

function randomUniform(min, max) {
  const u = Math.random(); // u ∈ [0,1)
  const x = min + (max - min) * u;
  return x;
}

function simulateMonth(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const [minTemp, maxTemp] = tempRanges[month];
  const days = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const Tmax = randomUniform(minTemp, maxTemp);
    const Tmin = randomUniform(minTemp, Tmax);
    const gddDiarioCalc = ((Tmax - Tmin) / 2) * Tbase;

    let gddDiario = null;
    let gddAcum;
    let etapa;

    if (!reachedR8) {
      gddAcum = gddTotal + gddDiarioCalc;
      etapa = etapas.find(e => gddAcum >= e.min && gddAcum < e.max);

      if (etapa && etapa.label === 'r8') {
        reachedR8 = true;
        gddDiario = gddDiarioCalc;
        gddAcum = gddTotal + gddDiario;
        gddTotal = gddAcum;
      } else {
        gddDiario = gddDiarioCalc;
        gddTotal += gddDiarioCalc;
      }
    } else {
      gddAcum = gddTotal;
      etapa = etapas.find(e => gddAcum >= e.min && gddAcum < e.max);
      gddDiario = null;
    }

    days.push({
      day: i,
      gddDiario,
      gddAcum,
      etapa: etapa?.label || 'vn',
      etapaNombre: etapa?.nombre || 'Vn'
    });
  }

  return days;
}

function simular() {
  allData = [];
  gddTotal = 0;
  reachedR8 = false;
  simulationDone = true;
  selectedDay = null;
  gddDailyEl.textContent = 'Seleccione un día';
  gddAcumEl.textContent = 'Seleccione un día';

  for (const m of monthsToSimulate) {
    const data = simulateMonth(m.year, m.month);
    allData.push({ ...m, data });
  }

  renderCalendar();

  Swal.fire({
    title: 'Simulación exitosa',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  });
}

function renderCalendar() {
  calendarEl.innerHTML = '';
  const currentMonth = monthsToSimulate[currentMonthIndex];
  monthTitle.textContent = `${currentMonth.name} ${currentMonth.year}`;

  const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();

  if (!simulationDone) {
    for (let i = 1; i <= daysInMonth; i++) {
      const dayEl = document.createElement('div');
      dayEl.textContent = i;
      dayEl.classList.add('vn');
      calendarEl.appendChild(dayEl);
    }
    return;
  }

  const monthData = allData[currentMonthIndex].data;

  monthData.forEach((dayData, i) => {
    const dayEl = document.createElement('div');
    dayEl.classList.add(dayData.etapa);

    const dayText = document.createElement('span');
    dayText.textContent = dayData.gddDiario === null ? '-' : dayData.day;
    dayEl.appendChild(dayText);

    if (dayData.etapa !== 'vn') {
      const rLabel = document.createElement('div');
      rLabel.classList.add('r-label');
      rLabel.textContent = dayData.etapa.toUpperCase();
      dayEl.appendChild(rLabel);
    }

    if (selectedDay === i) {
      dayEl.classList.add('selected');
    }

    dayEl.addEventListener('click', () => {
      if (!simulationDone) return;

      selectedDay = i;
      updateInfo(dayData);
      renderCalendar();
    });

    calendarEl.appendChild(dayEl);
  });
}

function updateInfo(dayData) {
  gddDailyEl.textContent = dayData.gddDiario === null ? '-' : dayData.gddDiario.toFixed(2);
  gddAcumEl.textContent = dayData.gddAcum.toFixed(2);
}

btnSimular.addEventListener('click', simular);

btnPrev.addEventListener('click', () => {
  if (currentMonthIndex > 0) {
    currentMonthIndex--;
    selectedDay = null;
    gddDailyEl.textContent = 'Seleccione un día';
    gddAcumEl.textContent = 'Seleccione un día';
    renderCalendar();
  }
});

btnNext.addEventListener('click', () => {
  if (currentMonthIndex < monthsToSimulate.length - 1) {
    currentMonthIndex++;
    selectedDay = null;
    gddDailyEl.textContent = 'Seleccione un día';
    gddAcumEl.textContent = 'Seleccione un día';
    renderCalendar();
  }
});

renderCalendar();
