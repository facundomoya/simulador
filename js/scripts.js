const meses = [
  { nombre: "Diciembre", dias: 31, a: 12, b: 23, pp: 0.32, x: 24, y: 7 },
  { nombre: "Enero", dias: 31, a: 12, b: 22, pp: 0.35, x: 25, y: 7 },
  { nombre: "Febrero", dias: 28, a: 11, b: 20, pp: 0.32, x: 23, y: 7 },
  { nombre: "Marzo", dias: 31, a: 10, b: 19, pp: 0.29, x: 21.5, y: 6.5 },
  { nombre: "Abril", dias: 30, a: 9, b: 19, pp: 0.17, x: 18, y: 6 },
];

let mesActual = 0;
let diasData = [];
let diaInicioSimulacion = null;
let diaSeleccionado = null;
let simulacionHecha = false;

//parámetros para el generador congruencial aditivo
const semillas = [1, 3, 5, 7];
const modulo = 16;
const totalIter = 10000;

let secuenciaU = [];
let indiceU = 0;

function crearGeneradorCongruencialMixto(n0, a, c, m) {
  let semilla = n0;

  return function() {
    semilla = (a * semilla + c) % m;
    return semilla / m;
  };
}

//genera aleatoriamente los valores de n0, a, c y m
const n0 = Math.floor(Math.random() * 10) + 1;  // 1 a 10
const a = Math.floor(Math.random() * 10) + 1;
const c = Math.floor(Math.random() * 10) + 1;
const m = Math.floor(Math.random() * 10) + 1;

//crear el generador con esos parámetros
const obtenerU = crearGeneradorCongruencialMixto(n0, a, c, m);

//funcion NORMAL
function normal(x, y) {
  let temp = d3.randomNormal(x, y)();
  temp = Math.max(temp, x - y); // límite inferior
  temp = Math.min(temp, x + y); // límite superior
  return temp;
}

//funcion para calcular la etapa del cultivo y el factor de monitoreo (fm) según los GDD acumulados
function calcularEtapa(gdda) {
  let etapa, fm;
  if (gdda <= 500) {
    etapa = "vn";
    fm = null;
  } else if (gdda <= 600) {
    etapa = "r1";
    fm = 7;
  } else if (gdda <= 750) {
    etapa = "r2";
    fm = 7;
  } else if (gdda <= 900) {
    etapa = "r3";
    fm = 3;
  } else if (gdda <= 1050) {
    etapa = "r4";
    fm = 3;
  } else if (gdda <= 1250) {
    etapa = "r5";
    fm = 3;
  } else if (gdda <= 1400) {
    etapa = "r6";
    fm = 7;
  } else if (gdda <= 1500) {
    etapa = "r7";
    fm = 7;
  } else {
    etapa = "r8";
    fm = 7;
  }
  return { etapa, fm };
}

function generarClimaBase() {
  diasData = [];
  meses.forEach((mesObj, idx) => {
    // Número exacto de días lluviosos según probabilidad
    const numLluvia = Math.round(mesObj.pp * mesObj.dias);

    // Array con índices de días del mes
    let diasMes = [...Array(mesObj.dias).keys()]; // [0, 1, ..., dias-1]

    // Barajar díasMes para elegir días de lluvia aleatoriamente
    for (let i = diasMes.length - 1; i > 0; i--) {
      const j = Math.floor(obtenerU() * (i + 1));
      [diasMes[i], diasMes[j]] = [diasMes[j], diasMes[i]];
    }

    // Elegir primeros numLluvia como días lluviosos
    let diasLluviaSet = new Set(diasMes.slice(0, numLluvia));

    for (let d = 1; d <= mesObj.dias; d++) {
      const temp = normal(mesObj.x, mesObj.y);
      const gdd = temp - 10;
      const u = obtenerU(); // para viento
      const viento = mesObj.a + (mesObj.b - mesObj.a) * u; //calculo del viento
      const lluvia = diasLluviaSet.has(d - 1);

      diasData.push({
        mes: idx,
        dia: d,
        temp: temp.toFixed(1),
        gdd: gdd.toFixed(1),
        viento: viento.toFixed(1),
        lluvia,
        etapa: null,
        gdda: null,
        monitoreo: false,
      });
    }
  });
}

function simularDesdeInicio() {
  let gddaAcumulado = 0;
  let dm = 0;
  let inicioEncontrado = false;

  for (let i = 0; i < diasData.length; i++) {
    const dia = diasData[i];

    if (!inicioEncontrado) {
      if (
        dia.mes === diaInicioSimulacion.mes &&
        dia.dia === diaInicioSimulacion.dia
      ) {
        inicioEncontrado = true;
      } else {
        dia.etapa = null;
        dia.gdda = null;
        dia.monitoreo = false;
        continue;
      }
    }

    if (gddaAcumulado >= 1600) {
      dia.etapa = null;
      dia.gdda = gddaAcumulado.toFixed(1);
      dia.monitoreo = false;
      continue;
    }

    const gdd = parseFloat(dia.gdd);
    gddaAcumulado += gdd;
    if (gddaAcumulado > 1600);

    const etapaData = calcularEtapa(gddaAcumulado);
    const etapa = etapaData.etapa;
    const fm = etapaData.fm;

    let hacerMonitoreo = false;
    if (etapa !== "vn") {
      dm++;
      if (fm && dm >= fm) {
        // aquí reemplazamos Math.random() por obtenerU()
        if (
          parseFloat(dia.temp) < 35 &&
          parseFloat(dia.viento) <= 25 &&
          !dia.lluvia
        ) {
          hacerMonitoreo = true;
          dm = 0;
        }
      }
    } else {
      dm = 0;
    }

    dia.gdda = gddaAcumulado.toFixed(1);
    dia.etapa = etapa;
    dia.monitoreo = hacerMonitoreo;
  }
}

function renderizarCalendario() {
  const calendarDiv = document.getElementById("calendar");
  calendarDiv.innerHTML = "";

  const monthTitle = document.getElementById("monthTitle");
  monthTitle.textContent = meses[mesActual].nombre;

  const firstDate = new Date(2023, 11 + mesActual, 1);
  const firstDay = firstDate.getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < startDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("inactive");
    calendarDiv.appendChild(emptyDiv);
  }

  for (let dia = 1; dia <= meses[mesActual].dias; dia++) {
    const diaDiv = document.createElement("div");
    const indexDiaGlobal = diasData.findIndex(
      (d) => d.mes === mesActual && d.dia === dia
    );
    const datosDia = diasData[indexDiaGlobal];

    if (!simulacionHecha) {
      diaDiv.textContent = dia;
      diaDiv.style.cursor = "pointer";
      diaDiv.style.backgroundColor = "white";
      diaDiv.style.color = "black";
      diaDiv.style.fontSize = "1.9rem";
      diaDiv.className = "";

      if (
        diaInicioSimulacion &&
        diaInicioSimulacion.mes === mesActual &&
        diaInicioSimulacion.dia === dia
      ) {
        diaDiv.classList.add("selected");
      }

      diaDiv.addEventListener("click", () => {
        diaInicioSimulacion = { mes: mesActual, dia };
        diaSeleccionado = null;
        simulacionHecha = false;
        actualizarPanelInfo();
        renderizarCalendario();
      });
    } else {
      if (datosDia.etapa === null) {
        diaDiv.textContent = dia;
        diaDiv.style.opacity = "0.4";
        diaDiv.style.cursor = "default";
        diaDiv.style.color = "gray";
        diaDiv.style.fontSize = "1.9rem";
        diaDiv.className = "";
      } else {
        diaDiv.className = datosDia.etapa;
        diaDiv.innerHTML = `
          <span class="day-number">${dia}</span>
          ${
            datosDia.lluvia
              ? '<i class="fa-solid fa-cloud-showers-heavy" title="Lluvia"></i>'
              : ""
          }
          ${
            datosDia.monitoreo
              ? '<i class="fa-solid fa-eye" title="Monitoreo"></i>'
              : ""
          }
        `;
        diaDiv.style.cursor = "pointer";

        if (
          diaSeleccionado &&
          diaSeleccionado.mes === mesActual &&
          diaSeleccionado.dia === dia
        ) {
          diaDiv.classList.add("selected");
        }

        diaDiv.addEventListener("click", () => {
          diaSeleccionado = { mes: mesActual, dia };
          actualizarPanelInfo();
          renderizarCalendario();
        });
      }
    }

    calendarDiv.appendChild(diaDiv);
  }
}

function actualizarPanelInfo() {
  let datos = null;
  if (diaSeleccionado) {
    const indexDiaGlobal = diasData.findIndex(
      (d) => d.mes === diaSeleccionado.mes && d.dia === diaSeleccionado.dia
    );
    datos = diasData[indexDiaGlobal];
  } else if (diaInicioSimulacion && simulacionHecha) {
    const indexDiaGlobal = diasData.findIndex(
      (d) =>
        d.mes === diaInicioSimulacion.mes && d.dia === diaInicioSimulacion.dia
    );
    datos = diasData[indexDiaGlobal];
  }

  if (!datos || !datos.etapa) {
    document.getElementById("tempDaily").textContent = "-";
    document.getElementById("gddDaily").textContent = "-";
    document.getElementById("gddAcum").textContent = "-";
    document.getElementById("vientoDaily").textContent = "-";
    document.getElementById("estadoCultivo").textContent = "-";
    return;
  }

  document.getElementById("tempDaily").textContent = `${datos.temp} °C`;
  document.getElementById("gddDaily").textContent = datos.gdd;
  document.getElementById("gddAcum").textContent = datos.gdda;
  document.getElementById("vientoDaily").textContent = datos.viento;
  document.getElementById("estadoCultivo").textContent =
    datos.etapa.toUpperCase();
}

function validarSimulacion() {
  if (!diaInicioSimulacion) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe seleccionar un día para iniciar la simulación.",
    });
    return false;
  }
  return true;
}

document.getElementById("btnSimular").addEventListener("click", () => {
  if (!validarSimulacion()) return;
  simulacionHecha = true;
  simularDesdeInicio();
  diaSeleccionado = diaInicioSimulacion;
  actualizarPanelInfo();
  renderizarCalendario();
});

document.getElementById("btnPrev").addEventListener("click", () => {
  if (mesActual > 0) {
    mesActual--;
    actualizarPanelInfo();
    renderizarCalendario();
  }
});

document.getElementById("btnNext").addEventListener("click", () => {
  if (mesActual < meses.length - 1) {
    mesActual++;
    actualizarPanelInfo();
    renderizarCalendario();
  }
});

document.getElementById("btnReset").addEventListener("click", () => {
  location.reload();
});

generarClimaBase();
renderizarCalendario();
actualizarPanelInfo();
