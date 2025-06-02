const calendarEl = document.getElementById('calendar');
const monthTitle = document.getElementById('monthTitle');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnSimular = document.getElementById('btnSimular');
const estadoCultivoEl = document.getElementById('estadoCultivo');
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
  { label: 'r8', nombre: 'R8', min: 1500, max: 1700 }
];

let currentMonthIndex = 0;
let allData = [];
let gddTotal = 0;
let reachedR8 = false;
let selectedDay = null;
let simulationDone = false;
let startDate = null;

function randomUniform(min, max) {
  return min + Math.random() * (max - min);
}

function simulateMonth(year, month, monthIndex) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const [minTemp, maxTemp] = tempRanges[month];
  const days = [];

  for (let i = 0; i < daysInMonth; i++) {
    const day = i + 1;
    const Tmax = randomUniform(minTemp, maxTemp);
    const Tmin = randomUniform(minTemp, Tmax);
    const gddDiarioCalc = ((Tmax - Tmin) / 2) * Tbase;

    let gddDiario = null;
    let gddAcum = gddTotal;
    let etapa = etapas.find(e => gddAcum >= e.min && gddAcum < e.max);

    const isAfterStart =
      startDate &&
      (monthIndex > startDate.monthIndex ||
        (monthIndex === startDate.monthIndex && i >= startDate.dayIndex));

    if (!reachedR8 && isAfterStart) {
      gddAcum = gddTotal + gddDiarioCalc;
      etapa = etapas.find(e => gddAcum >= e.min && gddAcum < e.max);
      gddDiario = gddDiarioCalc;
      gddTotal = gddAcum;

      if (etapa?.label === 'r8' && gddAcum >= 1600) {
        reachedR8 = true;
      }
    }

    days.push({
      day,
      gddDiario,
      gddAcum,
      etapa: etapa?.label || 'vn',
      etapaNombre: etapa?.nombre || 'Vn',
      isAfterStart
    });
  }

  return days;
}

function simular() {
  if (!startDate) {
    Swal.fire({
      title: 'Seleccione un día de siembra primero',
      icon: 'warning'
    });
    return;
  }

  allData = [];
  gddTotal = 0;
  reachedR8 = false;
  simulationDone = true;
  selectedDay = null;

  gddDailyEl.textContent = 'Seleccione un día';
  gddAcumEl.textContent = 'Seleccione un día';
  estadoCultivoEl.textContent = 'Seleccione un día';

  for (let i = 0; i < monthsToSimulate.length; i++) {
    const m = monthsToSimulate[i];
    const data = simulateMonth(m.year, m.month, i);
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
      dayEl.classList.add('day-box');
      dayEl.textContent = i;

      dayEl.addEventListener('click', () => {
        startDate = {
          monthIndex: currentMonthIndex,
          dayIndex: i - 1
        };
        renderCalendar();
      });

      if (
        startDate &&
        currentMonthIndex === startDate.monthIndex &&
        i - 1 === startDate.dayIndex
      ) {
        dayEl.classList.add('selected');
      }

      calendarEl.appendChild(dayEl);
    }
    return;
  }

  // Buscar primer día que alcanza o supera 1600 GDD
  let r8MonthIndex = -1;
  let r8DayIndex = -1;
  outerLoop:
  for (let mIndex = 0; mIndex < allData.length; mIndex++) {
    const monthData = allData[mIndex].data;
    for (let dIndex = 0; dIndex < monthData.length; dIndex++) {
      if (monthData[dIndex].gddAcum >= 1600) {
        r8MonthIndex = mIndex;
        r8DayIndex = dIndex;
        break outerLoop;
      }
    }
  }

  const monthData = allData[currentMonthIndex].data;

  for (let i = 0; i < daysInMonth; i++) {
    const dayData = monthData[i];
    const dayEl = document.createElement('div');
    dayEl.classList.add('day-box');

    const isBeforeStart =
      startDate &&
      (currentMonthIndex < startDate.monthIndex ||
        (currentMonthIndex === startDate.monthIndex && i < startDate.dayIndex));

    let isDisabled = false;
    let isR8Day = false;

    if (r8MonthIndex !== -1) {
      if (currentMonthIndex > r8MonthIndex) {
        isDisabled = true;
      } else if (currentMonthIndex === r8MonthIndex) {
        if (i > r8DayIndex) {
          isDisabled = true;
        } else if (i === r8DayIndex) {
          isR8Day = true;
        }
      }
    }

    if (isBeforeStart || isDisabled) {
      dayEl.classList.add('disabled');
      dayEl.textContent = dayData.day;
      calendarEl.appendChild(dayEl);
      continue;
    }

    if (isR8Day) {
      dayEl.classList.add('r8');
      dayEl.textContent = dayData.day;
      const rLabel = document.createElement('div');
      rLabel.classList.add('r-label');
      rLabel.textContent = 'R8';
      dayEl.appendChild(rLabel);
    } else {
      dayEl.classList.add(dayData.etapa);
      dayEl.textContent = dayData.day;
      const rLabel = document.createElement('div');
      rLabel.classList.add('r-label');
      rLabel.textContent = dayData.etapa.toUpperCase();
      dayEl.appendChild(rLabel);
    }

    if (selectedDay === i) {
      dayEl.classList.add('selected');
    }

    dayEl.addEventListener('click', () => {
      if (!simulationDone || isBeforeStart || isDisabled) return;
      selectedDay = i;
      updateInfo(dayData);
      renderCalendar();
    });

    calendarEl.appendChild(dayEl);
  }
}

function updateInfo(dayData) {
  gddDailyEl.textContent = dayData.gddDiario === null ? '-' : dayData.gddDiario.toFixed(2);
  gddAcumEl.textContent = dayData.gddAcum.toFixed(2);

  const descripciones = {
    vn: 'Emergencia',
    r1: 'Inicio de floración',
    r2: 'Floración plena',
    r3: 'Formación de vainas',
    r4: 'Vaina completa',
    r5: 'Grano iniciando',
    r6: 'Llenado de granos',
    r7: 'Madurez fisiológica',
    r8: 'Madurez de cosecha'
  };

  const descripcion = descripciones[dayData.etapa] || 'Desconocido';
  estadoCultivoEl.textContent = `${dayData.etapa.toUpperCase()}: ${descripcion}`;
}

btnSimular.addEventListener('click', simular);

btnPrev.addEventListener('click', () => {
  if (currentMonthIndex > 0) {
    currentMonthIndex--;
    selectedDay = null;
    gddDailyEl.textContent = 'Seleccione un día';
    gddAcumEl.textContent = 'Seleccione un día';
    estadoCultivoEl.textContent = 'Seleccione un día';
    renderCalendar();
  }
});

btnNext.addEventListener('click', () => {
  if (currentMonthIndex < monthsToSimulate.length - 1) {
    currentMonthIndex++;
    selectedDay = null;
    gddDailyEl.textContent = 'Seleccione un día';
    gddAcumEl.textContent = 'Seleccione un día';
    estadoCultivoEl.textContent = 'Seleccione un día';
    renderCalendar();
  }
});

renderCalendar();
