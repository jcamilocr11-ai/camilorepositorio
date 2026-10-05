const fs = require('fs');
const path = require('path');

const archivoEntrada = process.argv[2] || path.join(__dirname, '..', 'data', 'processed', 'eventos_validos.csv');
const archivoSalida = process.argv[3] || path.join(__dirname, '..', 'data', 'reports', 'reporte_valido.csv');

const contenido = fs.readFileSync(archivoEntrada, 'utf8');
const lineas = contenido.trim().split(/\r?\n/);

const eventos = [];

for (let i = 1; i < lineas.length; i++) {
    const partes = lineas[i].split(',');

    eventos.push({
        method: partes[2],
        path: partes[3],
        status: parseInt(partes[4]),
        tiempo: parseFloat(partes[5])
    });
}

const totalEventos = eventos.length;

const tiempos = eventos.map(evento => evento.tiempo).sort((a, b) => a - b);

const sumaTiempos = tiempos.reduce((total, tiempo) => total + tiempo, 0);

const promedio = sumaTiempos / totalEventos;

const posicionP95 = Math.ceil(totalEventos * 0.95) - 1;
const p95 = tiempos[posicionP95];

const metodos = {};
const rutas = {};
const estados = {};

eventos.forEach(evento => {
    if (!metodos[evento.method]) {
        metodos[evento.method] = 0;
    }

    metodos[evento.method]++;

    if (!rutas[evento.path]) {
        rutas[evento.path] = 0;
    }

    rutas[evento.path]++;

    if (!estados[evento.status]) {
        estados[evento.status] = 0;
    }

    estados[evento.status]++;
});

let reporte = 'tipo,valor,cantidad\n';

reporte += `total_eventos,${totalEventos},${totalEventos}\n`;

Object.keys(metodos).forEach(method => {
    reporte += `metodo_${method},${method},${metodos[method]}\n`;
});

Object.keys(rutas).forEach(ruta => {
    reporte += `ruta,${ruta},${rutas[ruta]}\n`;
});

Object.keys(estados).forEach(status => {
    reporte += `status,${status},${estados[status]}\n`;
});

reporte += `tiempo_promedio_ms,${promedio.toFixed(2)},-\n`;
reporte += `p95_ms,${p95},-\n`;

const carpetaSalida = path.dirname(archivoSalida);

if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
}

fs.writeFileSync(archivoSalida, reporte);

console.log('Analisis de eventos completado');
console.log('Eventos analizados:', totalEventos);
console.log('Tiempo promedio:', promedio.toFixed(2), 'ms');
console.log('P95:', p95, 'ms');
console.log('Reporte generado en:', archivoSalida);