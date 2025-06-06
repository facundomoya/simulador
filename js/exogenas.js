let mes = 1; //numero del mes de diciembre a abril
let etapaActual = "Vn"; // Renombrada para evitar conflicto con la función
let dm = 0; // Días de monitoreo
let gdda = 0; // GDD acumulado
let gdd = 0; // GDD del día

function variablesExogenas() {
  while (mes <= 5) {
    if (gdda <= 1600) {
      if (mes === 1) {
        let a = 12;
        let b = 23;
        let pp = 0.32; //precipitaciones
        let x = 24;
        let y = 7;
        let cd = 31;
        monitoreo(x, y, cd, a, b, pp);
      } else if (mes === 2) {
        let a = 12;
        let b = 22;
        let pp = 0.35;
        let x = 25;
        let y = 7;
        let cd = 31;
        monitoreo(x, y, cd, a, b, pp);
      } else if (mes === 3) {
        let a = 11;
        let b = 20;
        let pp = 0.32;
        let x = 23;
        let y = 7;
        let cd = 28;
        monitoreo(x, y, cd, a, b, pp);
      } else if (mes === 4) {
        let a = 10;
        let b = 19;
        let pp = 0.29;
        let x = 21.5;
        let y = 6.5;
        let cd = 31;
        monitoreo(x, y, cd, a, b, pp);
      } else if (mes === 5) {
        let a = 9;
        let b = 19;
        let pp = 0.17;
        let x = 18;
        let y = 6;
        let cd = 30;
        monitoreo(x, y, cd, a, b, pp);
      }
    }
    mes++;
  }
}

function monitoreo(x, y, cd, a, b, pp) {
  let d = 1; // Día del mes
  while (d <= cd) {
    let temp = normal(x, y); // Cálculo de la distribución normal
    gdd = temp - 10; //temperatura
    gdda += gdd; // Acumula gdd a gdda
    let resultado = calcularEtapa(gdda); // Llama a la función para obtener etapa y fm
    if (resultado.etapa !== "Vn") {
      dm = dm + 1; //dm es dia del monitoreo
      if (dm >= resultado.fm) {
        if (temp <= 35) {
          let u = Math.random(); // Genera número aleatorio entre 0 y 1
          let viento = a + (b - a) * u; // Cálculo de viento
          if (viento <= 25) {
            u = Math.random(); // Genera número aleatorio entre 0 y 1
            if (u <= pp) {
              // Aquí agregas tu lógica si es true
            } else {
              dm = 0;
              console.log("Se realiza monitoreo");
            }
          }
        }
      }
    }
    d++;
  }
  return;
}

function normal(x, y) {
  let temp = d3.randomNormal(x, y)();
  temp = Math.max(temp, x - y);    // límite inferior
  temp = Math.min(temp, x + y);    // límite superior
  return temp;
}

function calcularEtapa(gdda) {
  let etapa; // Variable local para evitar conflictos
  let fm; // Frecuencia de monitoreo

  if (gdda <= 500) {
    etapa = "Vn";
  } else if (gdda <= 600) {
    fm = 7;
    etapa = "R1";
  } else if (gdda <= 750) {
    fm = 7;
    etapa = "R2";
  } else if (gdda <= 900) {
    fm = 3;
    etapa = "R3";
  } else if (gdda <= 1050) {
    fm = 3;
    etapa = "R4";
  } else if (gdda <= 1250) {
    fm = 3;
    etapa = "R5";
  } else if (gdda <= 1400) {
    fm = 7;
    etapa = "R6";
  } else if (gdda <= 1500) {
    fm = 7;
    etapa = "R7";
  } else {
    fm = 7;
    etapa = "R8";
  }
  return { etapa, fm }; // Devuelve un objeto con etapa y fm
}


//no se realiza monitoreo en la etapa de Vn ni tampooco si la temperatura es mayor a 35
// ni si el viento es mayor a 25 km/h