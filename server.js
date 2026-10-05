const http = require('http');

const fs = require('fs');

const path = require('path');

const registrarEvento = require('./bigdata/eventLogger');

const archivo = path.join(__dirname, 'data', 'clientes.csv');

function leerDatos() {

    const contenido = fs.readFileSync(archivo, 'utf8');

    const lineas = contenido.trim().split('\n');

    const datos = [];

    for (let i = 1; i < lineas.length; i++) {

        const partes = lineas[i].split(',');

        datos.push({

            id: parseInt(partes[0]),

            nombre: partes[1],

            correo: partes[2],

            telefono: partes[3],

            ciudad: partes[4],

            edad: parseInt(partes[5])

        });

    }

    return datos;

}

function guardarDatos(datos) {

    let contenido = 'id,nombre,correo,telefono,ciudad,edad\n';

    datos.forEach(dato => {

        contenido += `${dato.id},${dato.nombre},${dato.correo},${dato.telefono},${dato.ciudad},${dato.edad}\n`;

    });

    fs.writeFileSync(archivo, contenido);

}

function leerArchivo(ruta) {

    return fs.readFileSync(ruta, 'utf8');

}

const servidor = http.createServer((req, res) => {

    const inicio = Date.now();

    const eventId = Date.now() + '-' + Math.floor(Math.random() * 10000);

    res.setHeader('X-Event-Id', eventId);

    const finalizarRespuesta = res.end;

    res.end = function(contenido, encoding, callback) {

        const tiempoRespuesta = Date.now() - inicio;

        registrarEvento(

            req,

            res.statusCode,

            tiempoRespuesta

        );

        finalizarRespuesta.call(res, contenido, encoding, callback);

    };

    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === '/') {

        const html = fs.readFileSync(

            path.join(__dirname, 'public', 'index.html'),

            'utf8'

        );

        res.writeHead(200, {

            'Content-Type': 'text/html; charset=utf-8'

        });

        res.end(html);

        return;

    }

    if (req.method === 'GET' && req.url === '/api/clientes') {

        const datos = leerDatos();

        res.writeHead(200);

        res.end(JSON.stringify(datos));

    }

    else if (req.method === 'GET' && req.url.startsWith('/api/clientes/')) {

        const id = parseInt(req.url.split('/')[3]);

        const datos = leerDatos();

        const dato = datos.find(d => d.id === id);

        if (!dato) {

            res.writeHead(404);

            res.end(JSON.stringify({

                mensaje: 'Dato no encontrado'

            }));

            return;

        }

        res.writeHead(200);

        res.end(JSON.stringify(dato));

    }

    else if (req.method === 'GET' && req.url === '/api/bigdata/eventos') {

        const archivoEventos = path.join(

            __dirname,

            'data',

            'raw',

            'eventos.csv'

        );

        const contenido = leerArchivo(archivoEventos);

        res.writeHead(200);

        res.end(JSON.stringify({

            archivo: 'eventos.csv',

            contenido: contenido

        }));

    }

    else if (req.method === 'GET' && req.url === '/api/bigdata/reporte-batch') {

        const archivoReporte = path.join(

            __dirname,

            'data',

            'reports',

            'reporte_batch.csv'

        );

        const contenido = leerArchivo(archivoReporte);

        res.writeHead(200);

        res.end(JSON.stringify({

            archivo: 'reporte_batch.csv',

            contenido: contenido

        }));

    }

    else if (req.method === 'GET' && req.url === '/api/bigdata/calidad') {

        const archivoCalidad = path.join(

            __dirname,

            'data',

            'processed',

            'calidad.csv'

        );

        const contenido = leerArchivo(archivoCalidad);

        res.writeHead(200);

        res.end(JSON.stringify({

            archivo: 'calidad.csv',

            contenido: contenido

        }));

    }

    else if (req.method === 'GET' && req.url === '/api/bigdata/clientes-validos') {

        const archivoValidos = path.join(

            __dirname,

            'data',

            'processed',

            'clientes_validos.csv'

        );

        const contenido = leerArchivo(archivoValidos);

        res.writeHead(200);

        res.end(JSON.stringify({

            archivo: 'clientes_validos.csv',

            contenido: contenido

        }));

    }

    else if (req.method === 'GET' && req.url === '/api/bigdata/reporte-clientes') {

        const archivoReporteClientes = path.join(

            __dirname,

            'data',

            'reports',

            'reporte_clientes.csv'

        );

        const contenido = leerArchivo(archivoReporteClientes);

        res.writeHead(200);

        res.end(JSON.stringify({

            archivo: 'reporte_clientes.csv',

            contenido: contenido

        }));

    }

    else if (req.method === 'POST' && req.url === '/api/clientes') {

        let cuerpo = '';

        req.on('data', parte => {

            cuerpo += parte;

        });

        req.on('end', () => {

            const nuevoDato = JSON.parse(cuerpo);

            const datos = leerDatos();

            nuevoDato.id = datos.length + 1;

            datos.push(nuevoDato);

            guardarDatos(datos);

            res.writeHead(201);

            res.end(JSON.stringify(nuevoDato));

        });

    }

    else if (req.method === 'PUT' && req.url.startsWith('/api/clientes/')) {

        const id = parseInt(req.url.split('/')[3]);

        let cuerpo = '';

        req.on('data', parte => {

            cuerpo += parte;

        });

        req.on('end', () => {

            const datos = leerDatos();

            const dato = datos.find(d => d.id === id);

            if (!dato) {

                res.writeHead(404);

                res.end(JSON.stringify({

                    mensaje: 'Dato no encontrado'

                }));

                return;

            }

            const datosActualizados = JSON.parse(cuerpo);

            dato.nombre = datosActualizados.nombre;

            dato.correo = datosActualizados.correo;

            dato.telefono = datosActualizados.telefono;

            dato.ciudad = datosActualizados.ciudad;

            dato.edad = datosActualizados.edad;

            guardarDatos(datos);

            res.writeHead(200);

            res.end(JSON.stringify(dato));

        });

    }

    else if (req.method === 'DELETE' && req.url.startsWith('/api/clientes/')) {

        const id = parseInt(req.url.split('/')[3]);

        const datos = leerDatos();

        const posicion = datos.findIndex(d => d.id === id);

        if (posicion === -1) {

            res.writeHead(404);

            res.end(JSON.stringify({

                mensaje: 'Dato no encontrado'

            }));

            return;

        }

        const eliminado = datos.splice(posicion, 1);

        guardarDatos(datos);

        res.writeHead(200);

        res.end(JSON.stringify(eliminado[0]));

    }

    else {

        res.writeHead(404);

        res.end(JSON.stringify({

            mensaje: 'Ruta no encontrada'

        }));

    }

});

servidor.listen(3000, '0.0.0.0', () => {

    console.log('Servidor ejecutandose en http://localhost:3000');

});