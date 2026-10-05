const fs = require('fs');
const path = require('path');

const archivoEntrada = path.join(__dirname, '..', 'data', 'clientes.csv');
const carpetaSalida = path.join(__dirname, '..', 'data', 'processed');

const archivoValidos = path.join(carpetaSalida, 'clientes_validos.csv');
const archivoRechazados = path.join(carpetaSalida, 'clientes_rechazados.csv');
const archivoCalidad = path.join(carpetaSalida, 'calidad.csv');

const contenido = fs.readFileSync(archivoEntrada, 'utf8');
const lineas = contenido.trim().split('\n');

const encabezado = lineas[0];
const validos = [encabezado];
const rechazados = ['id,nombre,correo,telefono,ciudad,edad,motivo'];

let errores = [];

for (let i = 1; i < lineas.length; i++) {
    const partes = lineas[i].split(',');

    const id = partes[0];
    const nombre = partes[1];
    const correo = partes[2];
    const telefono = partes[3];
    const ciudad = partes[4];
    const edad = partes[5];

    errores = [];

    if (!id) {
        errores.push('id_vacio');
    }

    if (!nombre) {
        errores.push('nombre_vacio');
    }

    if (!correo || !correo.includes('@') || !correo.includes('.')) {
        errores.push('correo_invalido');
    }

    if (!telefono || telefono.length !== 10 || isNaN(telefono)) {
        errores.push('telefono_invalido');
    }

    if (!ciudad) {
        errores.push('ciudad_vacia');
    }

    if (!edad || isNaN(edad) || parseInt(edad) <= 0) {
        errores.push('edad_invalida');
    }

    if (errores.length === 0) {
        validos.push(lineas[i]);
    } else {
        rechazados.push(lineas[i] + ',' + errores.join('|'));
    }
}

if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
}

fs.writeFileSync(archivoValidos, validos.join('\n') + '\n');
fs.writeFileSync(archivoRechazados, rechazados.join('\n') + '\n');

const total = lineas.length - 1;
const totalValidos = validos.length - 1;
const totalRechazados = rechazados.length - 1;
const porcentajeCalidad = (totalValidos / total) * 100;

let calidad = 'metrica,valor\n';
calidad += `total_registros,${total}\n`;
calidad += `registros_validos,${totalValidos}\n`;
calidad += `registros_rechazados,${totalRechazados}\n`;
calidad += `porcentaje_calidad,${porcentajeCalidad.toFixed(2)}%\n`;

fs.writeFileSync(archivoCalidad, calidad);

console.log('Validacion de calidad completada');
console.log('Total registros:', total);
console.log('Registros validos:', totalValidos);
console.log('Registros rechazados:', totalRechazados);
console.log('Porcentaje de calidad:', porcentajeCalidad.toFixed(2) + '%');
console.log('Archivos generados en:', carpetaSalida);