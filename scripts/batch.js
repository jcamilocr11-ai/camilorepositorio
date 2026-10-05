const fs = require('fs');
const path = require('path');

const archivoEntrada = path.join(__dirname, '..', 'data', 'raw', 'eventos.csv');
const carpetaSalida = path.join(__dirname, '..', 'data', 'reports');
const archivoSalida = path.join(carpetaSalida, 'reporte_batch.csv');

const contenido = fs.readFileSync(archivoEntrada, 'utf8');
const lineas = contenido.trim().split('\n');

const eventos = [];

for (let i = 1; i < lineas.length; i++) {
    const partes = lineas[i].split(',');

    eventos.push({
        method: partes[2],
        path: partes[3],
        status: parseInt(partes[4]),
        tiempo: parseInt(partes[5])
    });
}

const totalEventos = eventos.length;

const metodos = {};

eventos.forEach(evento => {
    if (!metodos[evento.method]) {
        metodos[evento.method] = 0;
    }

    metodos[evento.method]++;
});

const rutas = {};

eventos.forEach(evento => {
    if (!rutas[evento.path]) {
        rutas[evento.path] = 0;
    }

    rutas[evento.path]++;
});

const estados = {};

eventos.forEach(evento => {
    if (!estados[evento.status]) {
        estados[evento.status] = 0;
    }

    estados[evento.status]++;
});

const tiempos = eventos.map(evento => evento.tiempo);
tiempos.sort((a, b) => a - b);

const suma = tiempos.reduce((total, tiempo) => total + tiempo, 0);
const promedio = suma / tiempos.length;

const posicion = Math.ceil(tiempos.length * 0.95) - 1;
const p95 = tiempos[posicion];

let reporte = 'tipo,valor,cantidad\n';

reporte += `total_eventos,${totalEventos},${totalEventos}\n`;

Object.keys(metodos).forEach(metodo => {
    reporte += `metodo_${metodo},${metodo},${metodos[metodo]}\n`;
});

Object.keys(rutas).forEach(ruta => {
    reporte += `ruta,${ruta},${rutas[ruta]}\n`;
});

Object.keys(estados).forEach(estado => {
    reporte += `status,${estado},${estados[estado]}\n`;
});

reporte += `tiempo_promedio_ms,${promedio.toFixed(2)},-\n`;
reporte += `p95_ms,${p95},-\n`;

if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
}

fs.writeFileSync(archivoSalida, reporte);

console.log('Procesamiento Batch completado');
console.log('Eventos procesados:', totalEventos);
console.log('Tiempo promedio:', promedio.toFixed(2), 'ms');
console.log('P95:', p95, 'ms');
console.log('Reporte generado en:', archivoSalida);
