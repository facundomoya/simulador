# Simulador de Etapas Fenológicas para Pelayo S.A.

## Descripción del Proyecto

Este simulador web permite **modelar y visualizar las etapas fenológicas del cultivo de la soja**, específicamente diseñado para **Pelayo S.A.** La herramienta calcula los días correspondientes a cada etapa fenológica (desde **VN** hasta **R8**), considerando variables climáticas generadas aleatoriamente mediante técnicas de simulación estocástica.

## Características Principales

- **Generación de números aleatorios**:  
  Utiliza el método **congruencial mixto** para obtener variables pseudoaleatorias.

- **Distribuciones estadísticas utilizadas**:
  - **Normal** → para simular **temperatura diaria**
  - **Uniforme** → para simular **velocidad del viento**

- **Variables simuladas**:
  - Temperatura diaria (°C)
  - GDD (Grados Día de Crecimiento) diario y acumulado
  - Velocidad del viento (km/h)
  - Días de lluvia (🌧️)
  - Etapas fenológicas (VN, R1 a R8)
  - Días de monitoreo (👁️)

## Tecnologías Utilizadas

- HTML5, CSS3, JavaScript
- Bootstrap 5.3 → diseño responsive
- Font Awesome → iconos vectoriales
- SweetAlert2 → mensajes emergentes modernos

## Instrucciones de Uso

### 1. Selección de fecha inicial
- Navegá por los meses (Diciembre a Abril) usando los botones `"<"` y `">"`
- Hacé clic en el día que desees como **inicio de la simulación**

### 2. Ejecución de la simulación
- Presioná el botón **"Simular"**
- El sistema calculará automáticamente todas las variables día por día

### 3. Visualización de resultados
- Cada día se colorea según la etapa fenológica alcanzada
- Aparecen íconos:
  - 🌧️ para días de **lluvia**
  - 👁️ para días de **monitoreo**
- Al hacer clic en un día, se muestran sus datos en el **panel lateral**

### 4. Reinicio
- Usá el botón **"Reiniciar"** para comenzar una nueva simulación

## Fundamento Matemático

### Generación de números aleatorios
Se implementa un **Generador Congruencial Mixto** con la fórmula:

Xₙ₊₁ = (a · Xₙ + c) mod m

Donde:
- `X₀` es la semilla inicial
- `a`, `c`, `m` son constantes enteras

Este generador se usa para:
- Generar variables uniformes 0≤u≤1 
- Mezclar días del mes
- Asignar lluvia y viento diarios

### Distribuciones utilizadas

#### Distribución Normal (Temperatura diaria)
Se usa una distribución normal acotada:

temp = max(min(N(μ, σ), μ + σ), μ - σ)

Donde:
- `μ`: media mensual
- `σ`: desviación estándar mensual

#### Distribución Uniforme (Viento diario)
El viento se genera como:

viento = a + (b - a) · u

Donde `a` y `b` son valores límites mensuales.

### Cálculo del GDD (Grado Día de Crecimiento)

GDD = temperatura_diaria - 10°C


### Etapas Fenológicas del Cultivo

Las etapas se determinan según el **GDD acumulado**:

| Etapa | Rango GDD acumulado |
|-------|----------------------|
| VN    | 0 – 500              |
| R1    | 501 – 600            |
| R2    | 601 – 750            |
| R3    | 751 – 900            |
| R4    | 901 – 1050           |
| R5    | 1051 – 1250          |
| R6    | 1251 – 1400          |
| R7    | 1401 – 1500          |
| R8    | > 1500               |

## Estado del proyecto
Completado ✔️

El simulador está funcional y listo para su uso.

## Descripción de archivos:
- **css/style.css**: Estilos personalizados para la aplicación
- **js/scripts.js**: Lógica principal del simulador
- **js/calculadorIndex.js**: Animaciones para la página de inicio
- **public/favicon.png**: Icono de la aplicación
- **public/video.mp4**: Video de fondo para la página principal
- **index.html**: Landing page de presentación
- **simulador.html**: Aplicación del simulador principal

## Equipo de Desarrollo

Este proyecto fue desarrollado por Facundo Moya estudiante de **Ingeniería en Sistemas de Información** de la **Universidad Tecnológica Nacional - Facultad Regional Tucumán (UTN-FRT)** para la materia **Simulación**, en colaboración con **Pelayo S.A.**

## Gestión del Código

El desarrollo del proyecto se realizó utilizando un flujo de trabajo simple con Git, donde:

- **Única rama activa**: `master` (ahora llamada `main` en muchos repositorios)

## Cómo clonar el repositorio

Sigue estos pasos para clonar el proyecto en tu máquina local:

1. Abre una terminal o consola de comandos.

2. Ejecuta el siguiente comando para clonar el repositorio:

```bash
git clone https://github.com/facundomoya/simulador-pelayosa.git
