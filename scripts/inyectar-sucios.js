const fs = require('fs');
const path = require('path');

const archivo = path.join(__dirname, '..', 'data', 'raw', 'eventos.csv');

const sucios = [
    'sucio-fecha,fecha-invalida,GET,/api/clientes,200,5',
    'sucio-metodo,2026-10-05T04:40:00.000Z,INVALIDO,/api/clientes,200,5',
    'sucio-status,2026-10-05T04:40:00.000Z,GET,/api/clientes,999,5',
    'sucio-duracion,2026-10-05T04:40:00.000Z,GET,/api/clientes,200,-10'
];

fs.appendFileSync(archivo, '\r\n' + sucios.join('\r\n') + '\r\n');

console.log('4 eventos sucios agregados');