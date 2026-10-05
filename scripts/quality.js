const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const archivoEntrada = path.join(__dirname, '..', 'data', 'raw', 'eventos.csv');
const carpetaSalida = path.join(__dirname, '..', 'data', 'processed');
const carpetaReportes = path.join(__dirname, '..', 'data', 'reports');

const archivoValidos = path.join(carpetaSalida, 'eventos_validos.csv');
const archivoRechazados = path.join(carpetaSalida, 'eventos_rechazados.csv');
const archivoCalidad = path.join(carpetaReportes, 'calidad.csv');

const contenido = fs.readFileSync(archivoEntrada, 'utf8');

const registros = parse(contenido, {
    columns: true,
    skip_empty_lines: true
});

const validos = [];
const rechazados = [];

registros.forEach(evento => {

    const errores = [];

    if (!evento.timestamp || isNaN(Date.parse(evento.timestamp))) {
    errores.push('fecha_invalida');
}

    if (!['GET', 'POST', 'PUT', 'DELETE'].includes(evento.method)) {
        errores.push('metodo_invalido');
    }

    if (!evento.path || !evento.path.startsWith('/')) {
        errores.push('ruta_invalida');
    }

    const status = Number(evento.status_code);

    if (!Number.isInteger(status) || status < 100 || status > 599) {
        errores.push('status_invalido');
    }

    const duracion = Number(evento.response_time_ms);

    if (isNaN(duracion) || duracion < 0) {
        errores.push('duracion_invalida');
    }

    if (!evento.event_id) {
        errores.push('id_vacio');
    }

    if (errores.length === 0) {
        validos.push(evento);
    } else {
        rechazados.push({
            ...evento,
            motivo: errores.join('|')
        });
    }

});

if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
}

if (!fs.existsSync(carpetaReportes)) {
    fs.mkdirSync(carpetaReportes, { recursive: true });
}

const contenidoValidos = stringify(validos, {
    header: true,
    columns: [
        'event_id',
        'timestamp',
        'method',
        'path',
        'status_code',
        'response_time_ms'
    ]
});

const contenidoRechazados = stringify(rechazados, {
    header: true,
    columns: [
        'event_id',
        'timestamp',
        'method',
        'path',
        'status_code',
        'response_time_ms',
        'motivo'
    ]
});

fs.writeFileSync(archivoValidos, contenidoValidos);
fs.writeFileSync(archivoRechazados, contenidoRechazados);

const total = registros.length;
const totalValidos = validos.length;
const totalRechazados = rechazados.length;
const porcentajeValido = total === 0 ? 0 : (totalValidos / total) * 100;

const calidad = stringify([
    {
        total: total,
        validos: totalValidos,
        rechazados: totalRechazados,
        porcentaje_valido: porcentajeValido.toFixed(2)
    }
], {
    header: true,
    columns: [
        'total',
        'validos',
        'rechazados',
        'porcentaje_valido'
    ]
});

fs.writeFileSync(archivoCalidad, calidad);

console.log('ETL de eventos completada');
console.log('Total eventos:', total);
console.log('Eventos validos:', totalValidos);
console.log('Eventos rechazados:', totalRechazados);
console.log('Porcentaje valido:', porcentajeValido.toFixed(2) + '%');
console.log('Eventos validos:', archivoValidos);
console.log('Eventos rechazados:', archivoRechazados);
console.log('Calidad:', archivoCalidad);