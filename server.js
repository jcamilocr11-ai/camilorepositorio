const http = require('http');

const servidor = http.createServer((req, res) => {

    if (req.url === '/hola') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hola, servidor funcionando');
    }

    else if (req.url === '/saludo') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hola Camilo, bienvenido');
    }

    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
    }
});

servidor.listen(3000, '0.0.0.0', () => {
    console.log('Servidor ejecutandose en el puerto 3000');
});