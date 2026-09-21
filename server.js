const http = require('http');

let datos = [
    { id: 1, nombre: 'Camilo' },
    { id: 2, nombre: 'Juan' }
];

const servidor = http.createServer((req, res) => {

    res.setHeader('Content-Type', 'application/json');

    // GET - Mostrar
    if (req.method === 'GET' && req.url === '/datos') {
        res.writeHead(200);
        res.end(JSON.stringify(datos));
    }

    // POST - Agregar
    else if (req.method === 'POST' && req.url === '/datos') {

        let cuerpo = '';

        req.on('data', parte => {
            cuerpo += parte;
        });

        req.on('end', () => {
            const nuevoDato = JSON.parse(cuerpo);

            nuevoDato.id = datos.length + 1;
            datos.push(nuevoDato);

            res.writeHead(201);
            res.end(JSON.stringify(nuevoDato));
        });
    }

    // PUT - Actualizar
    else if (req.method === 'PUT' && req.url.startsWith('/datos/')) {

        const id = parseInt(req.url.split('/')[2]);

        let cuerpo = '';

        req.on('data', parte => {
            cuerpo += parte;
        });

        req.on('end', () => {

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

            res.writeHead(200);
            res.end(JSON.stringify(dato));
        });
    }

    // DELETE - Eliminar
    else if (req.method === 'DELETE' && req.url.startsWith('/datos/')) {

        const id = parseInt(req.url.split('/')[2]);

        const posicion = datos.findIndex(d => d.id === id);

        if (posicion === -1) {
            res.writeHead(404);
            res.end(JSON.stringify({
                mensaje: 'Dato no encontrado'
            }));
            return;
        }

        const eliminado = datos.splice(posicion, 1);

        res.writeHead(200);
        res.end(JSON.stringify(eliminado[0]));
    }

    // Ruta no encontrada
    else {
        res.writeHead(404);
        res.end(JSON.stringify({
            mensaje: 'Ruta no encontrada'
        }));
    }
});

servidor.listen(3000, 'localhost', () => {
    console.log('Servidor local ejecutandose en http://localhost:3000');
});