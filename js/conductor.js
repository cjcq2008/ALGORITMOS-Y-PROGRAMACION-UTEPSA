// Revisar respuestas y actualizar la puntuacion del recorrido actual.
const modo = "conductor";
if (document.body.dataset.modo !== modo) throw new Error("Este script corresponde al modo conductor.");
const niveles = document.querySelectorAll(".nivel");
const claveProgreso = "aulaVial-" + modo + "-respuestas";
let respuestasRevisadas = {};

const puntajeTotal = document.getElementById("puntajeTotal");
const totalRevisadas = document.getElementById("respuestasRevisadas");
const precisionRespuestas = document.getElementById("precisionRespuestas");
const barraProgreso = document.getElementById("barraProgreso");
const textoProgreso = document.getElementById("textoProgreso");
const botonReiniciar = document.getElementById("reiniciarPuntuacion");

function guardarRespuestas() {
    try {
        localStorage.setItem(claveProgreso, JSON.stringify(respuestasRevisadas));
    } catch (error) {
        // El juego sigue funcionando aunque el navegador no permita guardar.
    }
}

function mostrarResultado(nivel, correcta, guardada = false) {
    const mensaje = nivel.querySelector(".resultado");
    const selector = nivel.querySelector("select");

    if (correcta) {
        mensaje.textContent = guardada ? "✅ Esta respuesta estaba correcta." : "✅ ¡Muy bien! Respuesta correcta.";
        mensaje.className = "resultado resultado-correcto";
    } else {
        const opcionCorrecta = nivel.querySelector('option[value="' + nivel.dataset.correcta + '"]');
        mensaje.textContent = "❌ La respuesta no es correcta. Respuesta correcta: " + opcionCorrecta.textContent + ".";
        mensaje.className = "resultado resultado-incorrecto";
    }
}

function actualizarPuntuacion() {
    let aciertos = 0;
    let revisadas = 0;

    niveles.forEach(function (nivel) {
        const selector = nivel.querySelector("select");
        const respuesta = respuestasRevisadas[selector.id];

        if (respuesta && respuesta.seleccionada === selector.value) {
            revisadas++;
            if (respuesta.correcta) aciertos++;
        }
    });

    puntajeTotal.textContent = aciertos + " / " + niveles.length;
    totalRevisadas.textContent = revisadas + " / " + niveles.length;
    precisionRespuestas.textContent = revisadas ? Math.round(aciertos / revisadas * 100) + "%" : "—";
    barraProgreso.style.width = Math.round(revisadas / niveles.length * 100) + "%";

    if (revisadas === 0) {
        textoProgreso.textContent = "Todavía no revisaste ninguna respuesta.";
    } else if (revisadas === niveles.length) {
        textoProgreso.textContent = "¡Terminaste todas las preguntas de este recorrido!";
    } else {
        textoProgreso.textContent = "Has revisado " + revisadas + " de " + niveles.length + " instrucciones.";
    }
}

function revisarNivel(nivel) {
    const selector = nivel.querySelector("select");

    if (selector.value === "") {
        const mensaje = nivel.querySelector(".resultado");
        mensaje.textContent = "Selecciona una respuesta antes de revisar.";
        mensaje.className = "resultado resultado-pendiente";
        return;
    }

    const correcta = selector.value === nivel.dataset.correcta;
    respuestasRevisadas[selector.id] = {
        seleccionada: selector.value,
        correcta: correcta
    };

    mostrarResultado(nivel, correcta);
    guardarRespuestas();
    actualizarPuntuacion();
}

function cargarRespuestas() {
    try {
        respuestasRevisadas = JSON.parse(localStorage.getItem(claveProgreso)) || {};
    } catch (error) {
        respuestasRevisadas = {};
    }

    niveles.forEach(function (nivel) {
        const selector = nivel.querySelector("select");
        const botonRevisar = nivel.querySelector(".boton-revisar");
        const respuestaGuardada = respuestasRevisadas[selector.id];

        botonRevisar.addEventListener("click", function () {
            revisarNivel(nivel);
        });

        selector.addEventListener("change", function () {
            delete respuestasRevisadas[selector.id];
            const mensaje = nivel.querySelector(".resultado");
            mensaje.textContent = "Respuesta cambiada. Vuelve a revisarla.";
            mensaje.className = "resultado resultado-pendiente";
            guardarRespuestas();
            actualizarPuntuacion();
        });

        if (respuestaGuardada && respuestaGuardada.seleccionada) {
            selector.value = respuestaGuardada.seleccionada;
            if (selector.value !== "") {
                const correcta = selector.value === nivel.dataset.correcta;
                respuestasRevisadas[selector.id].correcta = correcta;
                mostrarResultado(nivel, correcta, true);
            } else {
                delete respuestasRevisadas[selector.id];
            }
        }
    });

    actualizarPuntuacion();
}

botonReiniciar.addEventListener("click", function () {
    respuestasRevisadas = {};
    niveles.forEach(function (nivel) {
        nivel.querySelector("select").value = "";
        const mensaje = nivel.querySelector(".resultado");
        mensaje.textContent = "";
        mensaje.className = "resultado";
    });
    guardarRespuestas();
    actualizarPuntuacion();
});

cargarRespuestas();
