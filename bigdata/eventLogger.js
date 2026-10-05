const fs = require('fs');
const path = require('path');

const carpeta = path.join(__dirname, '..', 'data', 'raw');
const archivo = path.join(carpeta, 'eventos.csv');

if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
}

if (!fs.existsSync(archivo)) {
    fs.writeFileSync(
        archivo,
        'event_id,timestamp,method,path,status_code,response_time_ms\n'
    );
}

function registrarEvento(req, statusCode, responseTime) {
    const eventId = Date.now() + '-' + Math.floor(Math.random() * 10000);
    const timestamp = new Date().toISOString();

    const linea =
        eventId + ',' +
        timestamp + ',' +
        req.method + ',' +
        req.url + ',' +
        statusCode + ',' +
        responseTime + '\n';

    fs.appendFileSync(archivo, linea);

    return eventId;
}

module.exports = registrarEvento;

