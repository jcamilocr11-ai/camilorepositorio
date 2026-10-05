const http = require('http');

const url = new URL(process.argv[2]);
const total = parseInt(process.argv[3]);
const concurrencia = parseInt(process.argv[4]);

let completadas = 0;
let exitosas = 0;
let siguiente = 0;

function hacerPeticion() {
    if (siguiente >= total) {
        return;
    }

    siguiente++;

    const req = http.get(url, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            exitosas++;
        }

        res.on('data', () => {});

        res.on('end', () => {
            completadas++;

            if (completadas === total) {
                console.log('Solicitudes completadas:', completadas);
                console.log('Solicitudes exitosas:', exitosas);
            } else {
                hacerPeticion();
            }
        });
    });

    req.on('error', () => {
        completadas++;

        if (completadas === total) {
            console.log('Solicitudes completadas:', completadas);
            console.log('Solicitudes exitosas:', exitosas);
        } else {
            hacerPeticion();
        }
    });
}

for (let i = 0; i < concurrencia; i++) {
    hacerPeticion();
}