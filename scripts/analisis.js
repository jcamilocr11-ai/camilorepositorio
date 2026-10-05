const fs = require('fs');
const path = require('path');

const archivoEntrada = path.join(__dirname, '..', 'data', 'processed', 'clientes_validos.csv');
const carpetaSalida = path.join(__dirname, '..', 'data', 'reports');
const archivoSalida = path.join(carpetaSalida, 'reporte_clientes.csv');

const contenido = fs.readFileSync(archivoEntrada, 'utf8');
const lineas = contenido.trim().split('\n');

const clientes = [];

for (let i = 1; i < lineas.length; i++) {
    const partes = lineas[i].split(',');

    clientes.push({
        id: parseInt(partes[0]),
        nombre: partes[1],
        correo: partes[2],
        telefono: partes[3],
        ciudad: partes[4],
        edad: parseInt(partes[5])
    });
}

const totalClientes = clientes.length;

const edades = clientes.map(cliente => cliente.edad);

const sumaEdades = edades.reduce((total, edad) => total + edad, 0);

const promedioEdad = sumaEdades / totalClientes;

const ciudades = {};

clientes.forEach(cliente => {
    if (!ciudades[cliente.ciudad]) {
        ciudades[cliente.ciudad] = 0;
    }

    ciudades[cliente.ciudad]++;
});

let reporte = 'metrica,valor\n';

reporte += `total_clientes,${totalClientes}\n`;
reporte += `edad_promedio,${promedioEdad.toFixed(2)}\n`;

Object.keys(ciudades).forEach(ciudad => {
    reporte += `clientes_${ciudad},${ciudades[ciudad]}\n`;
});

if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida, { recursive: true });
}

fs.writeFileSync(archivoSalida, reporte);

console.log('Analisis de clientes completado');
console.log('Clientes analizados:', totalClientes);
console.log('Edad promedio:', promedioEdad.toFixed(2));
console.log('Reporte generado en:', archivoSalida);