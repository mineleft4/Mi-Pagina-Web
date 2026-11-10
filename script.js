
"use strict";

// =====================================
// 1. MENU DE NAVEGACION
// =====================================

const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", function () {
    const abierto = menu.classList.toggle("abierto");

    menuToggle.setAttribute("aria-expanded", String(abierto));
    menuToggle.setAttribute(
        "aria-label",
        abierto ? "Cerrar menú" : "Abrir menú"
    );
});

menu.querySelectorAll("a").forEach(function (enlace) {
    enlace.addEventListener("click", function () {
        menu.classList.remove("abierto");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Abrir menú");
    });
});

// =====================================
// 2. RECOMENDACIONES POR SISTEMA
// =====================================

const textoSistema = document.getElementById("sistemaDetectado");
const contenedorSistema = document.getElementById("recomendacionesSistema");
const sistemaIcono = document.getElementById("sistemaIcono");

const botonCambiar = document.getElementById("cambiarSistema");
const selectorSistema = document.getElementById("selectorSistema");
const sistemaManual = document.getElementById("sistemaManual");
const botonAplicar = document.getElementById("aplicarSistema");

const recomendacionesPorSistema = {
    windows: {
        nombre: "Windows",
        icono: "🪟",
        consejos: [
            "Presiona Ctrl + Shift + Esc para abrir el Administrador de tareas.",
            "En Procesos, revisa las columnas CPU y Memoria para detectar aplicaciones con consumo elevado.",
            "En Aplicaciones de inicio, desactiva los programas que no necesites al encender el equipo.",
            "Cierra aplicaciones que reconozcas y que no estés utilizando.",
            "Mantén Windows y tus programas actualizados."
        ]
    },

    mac: {
        nombre: "macOS",
        icono: "🍎",
        consejos: [
            "Abre Monitor de Actividad desde Aplicaciones > Utilidades.",
            "En la pestaña CPU, revisa qué aplicaciones consumen más procesador.",
            "En Memoria, revisa la presión de memoria para comprobar si tienes recursos suficientes.",
            "En Ajustes del Sistema > General > Ítems de inicio y extensiones, revisa las aplicaciones que se abren automáticamente.",
            "Cierra las aplicaciones que no utilices y mantén macOS actualizado."
        ]
    },

    linux: {
        nombre: "Linux",
        icono: "🐧",
        consejos: [
            "Abre el Monitor del sistema de tu entorno de escritorio.",
            "Revisa el consumo de CPU y memoria RAM de los procesos activos.",
            "Cierra las aplicaciones que no necesites.",
            "Revisa las aplicaciones de inicio automático disponibles en tu distribución.",
            "Mantén el sistema y los programas actualizados mediante las herramientas oficiales de tu distribución."
        ]
    }
};

// Detectar el sistema operativo de forma aproximada
function detectarSistema() {
    const plataforma =
        navigator.userAgentData?.platform ||
        navigator.platform ||
        "";

    const agente = navigator.userAgent || "";
    const datos = (plataforma + " " + agente).toLowerCase();

    if (/iphone|ipad|ipod/.test(datos)) {
        return "mac";
    }

    if (/android/.test(datos)) {
        return "linux";
    }

    if (/windows|win32|win64/.test(datos)) {
        return "windows";
    }

    if (/macintosh|macintel|mac os|mac_powerpc/.test(datos)) {
        return "mac";
    }

    if (/linux|x11/.test(datos)) {
        return "linux";
    }

    return null;
}

// Crear y mostrar las recomendaciones
function mostrarRecomendaciones(sistema) {
    const informacion = recomendacionesPorSistema[sistema];

    if (!informacion) {
        textoSistema.textContent = "Sistema no identificado";
        sistemaIcono.textContent = "💻";

        const mensaje = document.createElement("p");
        mensaje.textContent =
            "Selecciona Windows, macOS o Linux para consultar las recomendaciones.";

        contenedorSistema.replaceChildren(mensaje);
        return;
    }

    textoSistema.textContent = informacion.nombre;
    sistemaIcono.textContent = informacion.icono;

    const titulo = document.createElement("h3");
    titulo.textContent = "Consejos para " + informacion.nombre;

    const lista = document.createElement("ol");

    informacion.consejos.forEach(function (consejo) {
        const elemento = document.createElement("li");
        elemento.textContent = consejo;
        lista.appendChild(elemento);
    });

    contenedorSistema.replaceChildren(titulo, lista);

    // Actualizar también el sistema seleccionado en el formulario
    document.getElementById("sistemaUsuario").value = sistema;
}

// Detectar el sistema al cargar la página
const sistemaDetectado = detectarSistema();

if (sistemaDetectado) {
    sistemaManual.value = sistemaDetectado;
    mostrarRecomendaciones(sistemaDetectado);
} else {
    mostrarRecomendaciones(null);
}

// Permitir cambiar manualmente el sistema
botonCambiar.addEventListener("click", function () {
    selectorSistema.hidden = !selectorSistema.hidden;
});

botonAplicar.addEventListener("click", function () {
    mostrarRecomendaciones(sistemaManual.value);
    selectorSistema.hidden = true;
});

// =====================================
// 3. FORMULARIO DE RECOMENDACIONES
// =====================================

const formulario = document.getElementById("formularioRecomendacion");
const mensajeFormulario = document.getElementById("mensajeFormulario");
const botonEnviar = document.getElementById("botonEnviar");

// Cambia esta ruta si tu servidor utiliza otra dirección.
const URL_SERVIDOR = "/api/recomendaciones";

function mostrarMensaje(texto, tipo) {
    mensajeFormulario.textContent = texto;
    mensajeFormulario.className = tipo;
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value;
    const sistema = document.getElementById("sistemaUsuario").value;
    const recomendacion =
        document.getElementById("recomendacion").value.trim();

    if (!categoria || !sistema || !recomendacion) {
        mostrarMensaje(
            "Completa todos los campos obligatorios.",
            "error"
        );
        return;
    }

    if (recomendacion.length < 10) {
        mostrarMensaje(
            "Escribe una recomendación de al menos 10 caracteres.",
            "error"
        );
        return;
    }

    const datos = {
        nombre: nombre || "Usuario anónimo",
        categoria: categoria,
        sistema: sistema,
        recomendacion: recomendacion
    };

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Enviando...";

    try {
        const respuesta = await fetch(URL_SERVIDOR, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        if (!respuesta.ok) {
            throw new Error("El servidor rechazó la solicitud.");
        }

        mostrarMensaje(
            "¡Tu recomendación se envió correctamente!",
            "exito"
        );

        formulario.reset();

        // Mantener seleccionado el sistema que se está consultando
        if (sistemaDetectado) {
            document.getElementById("sistemaUsuario").value =
                sistemaManual.value || sistemaDetectado;
        }

    } catch (error) {
        mostrarMensaje(
            "No se pudo enviar la recomendación. Comprueba que el servidor esté funcionando.",
            "error"
        );

    } finally {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar recomendación";
    }
});
