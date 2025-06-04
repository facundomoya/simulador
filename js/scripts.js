const meses = [
  { nombre: "Diciembre", dias: 31, a: 12, b: 23, pp: 0.32, x: 24, y: 7 },
  { nombre: "Enero", dias: 31, a: 12, b: 22, pp: 0.35, x: 25, y: 7 },
  { nombre: "Febrero", dias: 28, a: 11, b: 20, pp: 0.32, x: 23, y: 7 },
  { nombre: "Marzo", dias: 31, a: 10, b: 19, pp: 0.29, x: 21.5, y: 6.5 },
  { nombre: "Abril", dias: 30, a: 9, b: 19, pp: 0.17, x: 18, y: 6 }
];

let mesActual = 0;
let diasData = [];
let diaInicioSimulacion = null; // día elegido para empezar simulación
let diaSeleccionado = null;     // día seleccionado para mostrar info
let simulacionHecha = false;    // indica si ya se simuló para bloquear días

function normal(x, y) {
  let temp = d3.randomNormal(x, y)();
  return Math.max(temp, x - y); // Nunca menor que media - desviación
}


function calcularEtapa(gdda) {
  let etapa, fm;
  if (gdda <= 500) {
    etapa = "vn"; fm = null;
  } else if (gdda <= 600) {
    etapa = "r1"; fm = 7;
  } else if (gdda <= 750) {
    etapa = "r2"; fm = 7;
  } else if (gdda <= 900) {
    etapa = "r3"; fm = 3;
  } else if (gdda <= 1050) {
    etapa = "r4"; fm = 3;
  } else if (gdda <= 1250) {
    etapa = "r5"; fm = 3;
  } else if (gdda <= 1400) {
    etapa = "r6"; fm = 7;
  } else if (gdda <= 1500) {
    etapa = "r7"; fm = 7;
  } else {
    etapa = "r8"; fm = 7;
  }
  return { etapa, fm };
}

function generarDatosBase() {
  diasData = [];
  let gddaAcumulado = 0;
  let dm = 0; // contador monitoreo
  meses.forEach((mesObj, idx) => {
    for (let d = 1; d <= mesObj.dias; d++) {
      if (gddaAcumulado >= 1600) {
        diasData.push({
          mes: idx,
          dia: d,
          temp: null,
          gdd: null,
          gdda: gddaAcumulado.toFixed(1),
          viento: null,
          etapa: null,
          monitoreo: false,
          lluvia: false
        });
        continue;
      }

      const temp = normal(mesObj.x, mesObj.y);
      const gdd = temp - 10;
      gddaAcumulado += gdd;
      if (gddaAcumulado > 1600) gddaAcumulado = 1600;

      const u = Math.random();
      const viento = mesObj.a + (mesObj.b - mesObj.a) * u;

      const lluvia = Math.random() < mesObj.pp;

      const etapaData = calcularEtapa(gddaAcumulado);
      const etapa = etapaData.etapa;
      const fm = etapaData.fm;

      let hacerMonitoreo = false;

      if (etapa !== "vn") {
        dm++;
        if (fm && dm >= fm) {
          if (temp < 35 && viento <= 25 && !lluvia) {
            hacerMonitoreo = true;
            dm = 0;
          }
        }
      } else {
        dm = 0;
      }

      diasData.push({
        mes: idx,
        dia: d,
        temp: temp.toFixed(1),
        gdd: gdd.toFixed(1),
        gdda: gddaAcumulado.toFixed(1),
        viento: viento.toFixed(1),
        etapa,
        monitoreo: hacerMonitoreo,
        lluvia
      });
    }
  });
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

  // Índices globales
  const ultimoDiaR8Index = diasData.findIndex(d => d.etapa === "r8");
  let indiceInicioSimulacionGlobal = -1;
  if (diaInicioSimulacion) {
    indiceInicioSimulacionGlobal = diasData.findIndex(d => d.mes === diaInicioSimulacion.mes && d.dia === diaInicioSimulacion.dia);
  }

  for (let dia = 1; dia <= meses[mesActual].dias; dia++) {
    const diaDiv = document.createElement("div");
    const indexDiaGlobal = diasData.findIndex(d => d.mes === mesActual && d.dia === dia);
    const datosDia = diasData[indexDiaGlobal];

    if (!simulacionHecha) {
      // Antes de simular: todos blancos y activos
      diaDiv.textContent = dia;
      diaDiv.style.cursor = "pointer";
      diaDiv.style.backgroundColor = "white";
      diaDiv.style.color = "black";
      diaDiv.style.fontSize = "1.9rem";
      diaDiv.className = "";

      if (diaInicioSimulacion && diaInicioSimulacion.mes === mesActual && diaInicioSimulacion.dia === dia) {
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
      // Simulación hecha: bloquea fuera del rango y colorea dentro

      if (indexDiaGlobal < indiceInicioSimulacionGlobal || indexDiaGlobal > ultimoDiaR8Index) {
        // Días fuera de rango bloqueados
        diaDiv.textContent = dia;
        diaDiv.style.opacity = "0.4";
        diaDiv.style.cursor = "default";
        diaDiv.style.color = "gray";
        diaDiv.style.fontSize = "1.9rem";
        diaDiv.className = "";

      } else {
        // Días activos y coloreados
        diaDiv.className = datosDia.etapa;

        diaDiv.innerHTML = `
          <span class="day-number">${dia}</span>
          ${datosDia.lluvia ? '<i class="fa-solid fa-cloud-showers-heavy" title="Lluvia"></i>' : ''}
          ${datosDia.monitoreo ? '<i class="fa-solid fa-eye" title="Monitoreo"></i>' : ''}
        `;

        diaDiv.style.cursor = "pointer";

        if (diaSeleccionado && diaSeleccionado.mes === mesActual && diaSeleccionado.dia === dia) {
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
    const indexDiaGlobal = diasData.findIndex(d => d.mes === diaSeleccionado.mes && d.dia === diaSeleccionado.dia);
    datos = diasData[indexDiaGlobal];
  } else if (diaInicioSimulacion && simulacionHecha) {
    const indexDiaGlobal = diasData.findIndex(d => d.mes === diaInicioSimulacion.mes && d.dia === diaInicioSimulacion.dia);
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
  document.getElementById("estadoCultivo").textContent = datos.etapa.toUpperCase();
}

function validarSimulacion() {
  if (!diaInicioSimulacion) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Debe seleccionar un día para iniciar la simulación."
    });
    return false;
  }
  return true;
}

document.getElementById("btnSimular").addEventListener("click", () => {
  if (!validarSimulacion()) return;

  simulacionHecha = true;
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

generarDatosBase();
renderizarCalendario();
actualizarPanelInfo();
