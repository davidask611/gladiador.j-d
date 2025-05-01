// --- VARIABLES DE COMBATE ---
let enCombate = false;
let enemigosActuales = [];
let ubicacionActual = "";
let tiempoEsperaCombate = 15000; // 15 segundos en ms
let tiempoUltimoAtaque = 0;
let puedeAtacar = true;
document.getElementById("atacar-ya").style.display = "none";

// --- ESTADÍSTICAS DE COMBATE DEL JUGADOR ---
const statsCombate = {
    vida: 100,
    vidaMax: 100,
    danoMin: 2,
    danoMax: 4,
    armadura: 0,
    precision: 75,
    evasion: 10,
    combatesDisponibles: 12,
    combatesMaximos: 12,
    tiempoRecarga: 300000, // 5 minutos en milisegundos
    tiempoCuracion: 120000, // 2 minutos en milisegundos
    vidaPorCuracion: 20,
    intervaloCuracion: null,
    ultimoCombate: null,
    ultimaCuracion: null,
};

// --- SISTEMA DE CURACIÓN ---
function iniciarCuracion() {
    // Detener cualquier temporizador existente
    if (statsCombate.intervaloCuracion) {
        clearInterval(statsCombate.intervaloCuracion);
        statsCombate.intervaloCuracion = null;
    }

    // Solo iniciar si la vida no está al máximo
    if (statsCombate.vida < statsCombate.vidaMax) {
        const ahora = new Date().getTime();
        jugador.ultimaCuracion = ahora;

        let tiempoRestante = statsCombate.tiempoCuracion;
        actualizarTemporizadorUI(tiempoRestante);

        statsCombate.intervaloCuracion = setInterval(() => {
            tiempoRestante -= 1000;

            if (tiempoRestante <= 0) {
                aplicarCuracion();
                tiempoRestante = statsCombate.tiempoCuracion;
                jugador.ultimaCuracion = new Date().getTime();
            }

            actualizarTemporizadorUI(tiempoRestante);

            // Detener si la vida llega al máximo
            if (statsCombate.vida >= statsCombate.vidaMax) {
                clearInterval(statsCombate.intervaloCuracion);
                document.getElementById("curacion-timer").textContent = "Completo";
            }
        }, 1000);
    } else {
        document.getElementById("curacion-timer").textContent = "Completo";
    }
}

function aplicarCuracion() {
    const vidaAnterior = statsCombate.vida;
    statsCombate.vida = Math.min(statsCombate.vidaMax, statsCombate.vida + statsCombate.vidaPorCuracion);
    const vidaRecuperada = statsCombate.vida - vidaAnterior;

    if (vidaRecuperada > 0) {
        document.getElementById("log-combate").textContent =
            `💚 Recuperaste ${vidaRecuperada} vida (curación automática cada 2 minutos).`;
        actualizarUI();
    }
}

function forzarCuracion() {
    if (statsCombate.vida >= statsCombate.vidaMax) {
        document.getElementById("log-combate").textContent = "💚 Ya estás al máximo de vida.";
        return;
    }

    iniciarCuracion();
    document.getElementById("log-combate").textContent =
        "⏳ Temporizador de curación reiniciado. La próxima curación será en 2 minutos.";
}

function verificarCuracionAutomatica() {
    if (statsCombate.vida < statsCombate.vidaMax && !statsCombate.intervaloCuracion) {
        iniciarCuracion();
    }
}

// --- SISTEMA DE POCIONES ---
function usarPocion(pocion) {
    const cantidadCuracion = Math.floor(statsCombate.vidaMax * pocion.curacion);
    const vidaRecuperada = Math.min(statsCombate.vidaMax - statsCombate.vida, cantidadCuracion);

    if (vidaRecuperada <= 0) {
        const logCombate = document.getElementById("log-combate");
        logCombate.textContent = `💚 No necesitas usar ${pocion.nombre}. Ya tienes la vida al máximo (${statsCombate.vida}/${statsCombate.vidaMax}).` +
            (logCombate.textContent ? `\n\n${logCombate.textContent}` : '');
        return;
    }

    statsCombate.vida += vidaRecuperada;
    const index = jugador.inventario.findIndex(i => i.id === pocion.id);
    if (index !== -1) {
        jugador.inventario.splice(index, 1);
    }

    const porcentajeCurado = (pocion.curacion * 100).toFixed(0);
    const logCombate = document.getElementById("log-combate");
    logCombate.textContent = `💚 Has usado ${pocion.nombre} y recuperado ${vidaRecuperada} vida (${porcentajeCurado}% de tu vida máxima).` +
        (logCombate.textContent ? `\n\n${logCombate.textContent}` : '');

    actualizarUI();

    if (statsCombate.vida >= statsCombate.vidaMax && statsCombate.intervaloCuracion) {
        clearInterval(statsCombate.intervaloCuracion);
        document.getElementById("curacion-timer").textContent = "Completo";
    }
}

// Enemigos base (actualizados con nuevas estadísticas)
const enemigosBase = [
    {
        id: 1,
        nombre: "Spider",
        nivel: [1, 2],
        vida: 50,
        vidaMax: 100,
        ataque: 3,
        defensa: 1,
        imagen: "enemigo/Spider.png",
        derrotado: false,
        oro: 10,
        exp: 15,
        descripcion: "Fuerza: Diminuto, Habilidad: Débil, Agilidad: Muy débil, Constitución: Diminuto, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Insignificante, Daño: Diminuto"
    },
    {
        id: 2,
        nombre: "Budge Dragon",
        nivel: [2, 5],
        vida: 101,
        vidaMax: 200,
        ataque: 6,
        defensa: 3,
        imagen: "enemigo/Budge Dragon.png",
        derrotado: false,
        oro: 20,
        exp: 25,
        descripcion: "Fuerza: Diminuto, Habilidad: Débil, Agilidad: Muy débil, Constitución: Diminuto, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Insignificante, Daño: Diminuto"
    },
    {
        id: 3,
        nombre: "Bull Fighter",
        nivel: [4, 8],
        vida: 201,
        vidaMax: 400,
        ataque: 9,
        defensa: 6,
        imagen: "enemigo/Bull Fighter.png",
        derrotado: false,
        oro: 35,
        exp: 40,
        descripcion: "Fuerza: Muy débil, Habilidad: Muy débil, Agilidad: Muy débil, Constitución: Diminuto, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Insignificante, Daño: Insignificante"
    },
    {
        id: 4,
        nombre: "Hound",
        nivel: [8, 10],
        vida: 401,
        vidaMax: 600,
        ataque: 12,
        defensa: 9,
        imagen: "enemigo/Hound.png",
        derrotado: false,
        oro: 50,
        exp: 60,
        descripcion: "Fuerza: Inferior a la media, Habilidad: Diminuto, Agilidad: Diminuto, Constitución: Débil, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Muy débil, Daño: Muy débil"
    }
];

// Ubicaciones con rangos de nivel
const ubicaciones = {
    'Lorencia': {
        niveles: [1, 10],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    },
    'Noria': {
        niveles: [11, 20],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    },
    'Dungeon': {
        niveles: [21, 30],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    },
    'Devias': {
        niveles: [31, 40],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    },
    'Lost Tower': {
        niveles: [41, 50],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    },
    'Atlans': {
        niveles: [51, 60],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    },
    'Tarkan': {
        niveles: [61, 70],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Spider , Budge Dragon , Bull Fighter y Hound)
    }
};

// --- FUNCIONES PRINCIPALES ---
function seleccionarUbicacion(nombreUbicacion) {
    if (!ubicaciones[nombreUbicacion]) {
        console.error("Ubicación no encontrada:", nombreUbicacion);
        return;
    }
    const ubicacion = ubicaciones[nombreUbicacion];

    if (jugador.nivel < ubicacion.niveles[0]) {
        document.getElementById("log-combate").textContent =
            `¡Necesitas ser nivel ${ubicacion.niveles[0]} para explorar ${nombreUbicacion}!`;
        return;
    }

    if (jugador.combatesDisponibles <= 0) {
        document.getElementById("log-combate").textContent =
            "No tienes combates disponibles para explorar " + nombreUbicacion;
        return;
    }

    // Filtrar y escalar enemigos
    const enemigosUbicacion = enemigosBase.filter(enemigo =>
        ubicacion.enemigos.includes(enemigo.id));
    
    const enemigosEscalados = enemigosUbicacion.map(enemigo => {
        const nivelBase = ubicacion.niveles[0];
        const factorEscala = 1 + (jugador.nivel - nivelBase) * 0.1;

        return {
            ...enemigo,
            vida: Math.floor(enemigo.vida * factorEscala),
            vidaMax: Math.floor(enemigo.vidaMax * factorEscala),
            ataque: Math.floor(enemigo.ataque * factorEscala),
            defensa: Math.floor(enemigo.defensa * factorEscala),
            oro: Math.floor(enemigo.oro * factorEscala),
            exp: Math.floor(enemigo.exp * factorEscala),
            derrotado: false
        };
    });

    enemigosActuales = [...enemigosEscalados];
    enCombate = true;
    ubicacionActual = nombreUbicacion;
    
    actualizarEnemigosUI();
    document.getElementById("log-combate").textContent =
        `Explorando ${nombreUbicacion}... ¡Selecciona un enemigo para atacar!`;
    
    actualizarProgresoMisiones('visitarUbicacion', 1);
}

// --- FUNCIÓN DE ATAQUE SIMPLIFICADA (TURNO ÚNICO) ---
function atacar(indexEnemigo) {
    const ahora = Date.now();
    
    // Verificar si puede atacar basado en el temporizador
    if (!puedeAtacar) {
        const tiempoRestante = Math.ceil((tiempoEsperaCombate - (ahora - tiempoUltimoAtaque))) / 1000;
        document.getElementById("log-combate").textContent = `Debes esperar ${tiempoRestante} segundos antes de atacar de nuevo.`;
        return;
    }

    if (!ubicacionActual) {
        console.error("No hay ubicación actual definida");
        return;
    }
    
    if (jugador.combatesDisponibles <= 0) {
        document.getElementById("log-combate").textContent = "¡No tienes combates disponibles! Espera a que se recarguen.";
        return;
    }

    // Descontar combate al inicio para evitar problemas
    if (!usarCombate()) {
        return;
    }

    // Reiniciar el temporizador visualmente
    tiempoUltimoAtaque = ahora;
    puedeAtacar = false;
    
    // Restaurar elementos del temporizador
    const contenedor = document.getElementById("temporizador-espera");
    contenedor.innerHTML = `
        <p class="tiempo-restante">Tiempo de espera: <span id="contador-espera">15</span>s</p>
        <progress id="barra-espera" value="15" max="15"></progress>
        <p id="atacar-ya" class="mensaje-ataque">¡ATACAR YA, GLADIADOR! ⚔️</p>
    `;
    
    // Iniciar el temporizador nuevamente
    mostrarTemporizadorEspera();

    const enemigo = enemigosActuales[indexEnemigo];
    let log = `⚔️ **Combate contra ${enemigo.nombre}** ⚔️\n\n`;
    let jugadorVivo = true;
    let enemigoVivo = true;
    let recibioDaño = false;

    // Batalla automática hasta que alguien muera
    while (jugadorVivo && enemigoVivo) {
        // Turno del jugador
        const precision = 75 + (jugador.statsBase.habilidad * 5);
        if (Math.random() * 100 <= precision) {
            const dañoJugador = Math.max(1, jugador.statsBase.fuerza + jugador.danoMin - enemigo.defensa);
            enemigo.vida -= dañoJugador;
            log += `🗡️ Golpeas al ${enemigo.nombre} (-${dañoJugador} vida).\n`;
            
            if (enemigo.vida <= 0) {
                enemigo.vida = 0;
                enemigo.derrotado = true;
                enemigoVivo = false;
                
                log += `💀 **¡Has derrotado al ${enemigo.nombre}!**\n`;
                log += `💰 Oro: ${enemigo.oro} | ✨ Exp: ${enemigo.exp}\n`;
                
                victoria(recibioDaño);
                break;
            }
        } else {
            log += `❌ Fallaste tu ataque contra el ${enemigo.nombre}.\n`;
        }

        // Turno del enemigo (si sigue vivo)
        if (enemigoVivo) {
            const evasion = 10 + (jugador.statsBase.agilidad * 3);
            if (Math.random() * 100 > evasion) {
                const dañoEnemigo = Math.max(1, enemigo.ataque - jugador.armadura);
                jugador.vida -= dañoEnemigo;
                recibioDaño = true;
                log += `🛡️ ${enemigo.nombre} te contraataca (-${dañoEnemigo} vida).\n`;
                
                if (jugador.vida <= 0) {
                    jugador.vida = 0;
                    jugadorVivo = false;
                    log += `☠️ **¡Has sido derrotado por ${enemigo.nombre}!**\n`;
                    break;
                }
            } else {
                log += `🎯 ¡Esquivaste el ataque del ${enemigo.nombre}!\n`;
            }
        }
    }

    // Actualizar UI
    document.getElementById("log-combate").textContent = log;
    actualizarEnemigosUI();
    actualizarUI();

    // Verificar victoria/derrota global
    if (enemigosActuales.every(e => e.derrotado)) {
        victoria(recibioDaño);
    } else if (!jugadorVivo) {
        derrota();
    }
    
    verificarCuracionAutomatica();
    actualizarUI();
}

// --- FUNCIÓN VICTORIA SIMPLIFICADA ---
function victoria(recibioDaño) {
    // Calcular recompensas solo del enemigo derrotado
    const enemigoDerrotado = enemigosActuales.find(e => e.derrotado && !e.recompensaOtorgada);
    if (!enemigoDerrotado) return;

    enemigoDerrotado.recompensaOtorgada = true;
    
    // Bonus de carisma
    const bonusCarisma = 1 + (jugador.statsBase.carisma * 0.1);
    const oroFinal = Math.floor(enemigoDerrotado.oro * bonusCarisma);
    const expFinal = Math.floor(enemigoDerrotado.exp * bonusCarisma);

    // Aplicar recompensas
    jugador.oro += oroFinal;
    jugador.exp += expFinal;
    jugador.victorias++;

    // Mensaje de victoria
    let mensaje = document.getElementById("log-combate").textContent;
    mensaje += `\n\n⚔️ **¡VICTORIA!** ⚔️\n` +
               `💰 Oro: +${oroFinal} | ✨ Exp: +${expFinal}`;

    // 20% de chance de obtener item
    if (Math.random() <= 0.2 && jugador.inventario.length < MAX_INVENTARIO) {
        const item = generarItemAleatorio(ubicaciones[ubicacionActual].niveles[0]);
        jugador.inventario.push(item);
        mensaje += `\n🎁 **¡ITEM OBTENIDO!** ${item.nombre}`;
    }

    document.getElementById("log-combate").textContent = mensaje;
    actualizarUI();

    // Verificar subida de nivel
    if (jugador.exp >= jugador.expParaSubir) {
        subirNivel();
    }

    // Actualizar misiones
    actualizarProgresoMisiones('enemigo', 1);
    if (!recibioDaño) {
        actualizarProgresoMisiones('enemigoSinDaño', 1);
    }
}

// --- FUNCIÓN DERROTA SIMPLIFICADA ---
function derrota() {
    statsCombate.vida = Math.max(1, Math.floor(statsCombate.vidaMax * 0.1)); // 10% de vida
    document.getElementById("log-combate").textContent += "\n\n☠️ **DERROTA** - Vida reducida al 10%";
    enCombate = false;
    ubicacionActual = "";
    actualizarUI();
}

function huir() {
    if (!enCombate) return;

    const chanceHuida = 30 + jugador.statsBase.agilidad;
    if (Math.random() * 100 < chanceHuida) {
        document.getElementById("log-combate").textContent = "🏃 Lograste huir del combate.";
        enCombate = false;
        enemigosActuales = [];
        actualizarEnemigosUI();
    } else {
        let dañoTotal = 0;
        enemigosActuales.forEach(enemigo => {
            if (!enemigo.derrotado) {
                const dañoEnemigo = Math.max(1, enemigo.ataque - jugador.armadura);
                statsCombate.vida -= dañoEnemigo;
                dañoTotal += dañoEnemigo;
            }
        });

        document.getElementById("log-combate").textContent =
            `❌ No puedes huir... ¡Los enemigos te atacan! (-${dañoTotal} vida)`;

        if (statsCombate.vida <= 0) derrota();
        actualizarUI();
    }
}

// --- TEMPORIZADOR DE ESPERA ---
function mostrarTemporizadorEspera() {
    const contadorElement = document.getElementById("contador-espera");
    const barraElement = document.getElementById("barra-espera");
    const contenedor = document.getElementById("temporizador-espera");

    if (!contadorElement || !barraElement) return;

    const ahora = Date.now();
    const tiempoRestante = tiempoEsperaCombate - (ahora - tiempoUltimoAtaque);
    const segundos = Math.ceil(tiempoRestante / 1000);

    if (tiempoRestante > 0) {
        contenedor.classList.remove("temporizador-finalizado");
        contadorElement.textContent = segundos;
        barraElement.value = segundos;
        setTimeout(mostrarTemporizadorEspera, 1000);
        puedeAtacar = false;
    } else {
        contenedor.innerHTML = `<p>¡Ya puedes atacar! ⚔️</p>`;
        puedeAtacar = true;

        setTimeout(() => {
            if (puedeAtacar) {
                contenedor.innerHTML = '';
            }
        }, 5000);
    }
}

// --- FUNCIONES AUXILIARES ---
function actualizarEnemigosUI() {
    const grid = document.getElementById("enemigos-grid");
    grid.innerHTML = "";

    enemigosActuales.forEach((enemigo, index) => {
        const sinCombates = jugador.combatesDisponibles <= 0;
        const clases = [
            'enemigo-card',
            enemigo.derrotado ? 'derrotado' : '',
            sinCombates ? 'sin-combates' : ''
        ].filter(Boolean).join(' ');

        const card = document.createElement("div");
        card.className = clases;
        card.innerHTML = `
            <img src="${enemigo.imagen}" alt="${enemigo.nombre}">
            <h3>${enemigo.nombre} (Nv. ${enemigo.nivel[0]}-${enemigo.nivel[1]})</h3>
            <div class="barra-vida">
                <div class="vida-actual" style="width: ${(enemigo.vida / enemigo.vidaMax) * 100}%"></div>
            </div>
            <p>Vida: ${enemigo.vida}/${enemigo.vidaMax}</p>
            <p>Ataque: ${enemigo.ataque}</p>
            <p>Defensa: ${enemigo.defensa}</p>
        `;

        if (!enemigo.derrotado && jugador.combatesDisponibles > 0) {
            card.addEventListener("click", () => atacar(index));
        }
        grid.appendChild(card);
    });
}

function actualizarUbicacionesUI() {
    const gridUbicaciones = document.querySelector(".grid-ubicaciones");
    gridUbicaciones.innerHTML = "";

    Object.entries(ubicaciones).forEach(([nombre, datos]) => {
        const btn = document.createElement("button");
        btn.className = "ubicacion-btn";
        btn.textContent = `${nombre} (Nv. ${datos.niveles[0]}-${datos.niveles[1]})`;

        // Deshabilitar si el jugador no tiene el nivel suficiente
        if (jugador.nivel < datos.niveles[0]) {
            btn.disabled = true;
            btn.title = `Requiere nivel ${datos.niveles[0]}`;
        } else if (jugador.nivel > datos.niveles[1]) {
            btn.classList.add("ubicacion-facil");
            btn.title = "Esta zona es muy fácil para tu nivel";
        }

        btn.addEventListener("click", () => seleccionarUbicacion(nombre));
        gridUbicaciones.appendChild(btn);
    });
}

function usarCombate() {
    if (jugador.combatesDisponibles > 0) {
        jugador.combatesDisponibles--;
        localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
        localStorage.setItem('ultimoCombate', new Date().getTime().toString());
        
        actualizarCombatesUI(); // Esto iniciará el temporizador automáticamente
        
        //  Elimina este setTimeout ya que actualizarCombatesUI() ahora se maneja sola
        //  if (jugador.combatesDisponibles < jugador.combatesMaximos) {
        //     setTimeout(actualizarCombatesUI, jugador.tiempoRecarga);
        //  }
        
        return true;
    }
    return false;
}

function cargarCombates() {
    if (localStorage.getItem('combatesDisponibles')) {
        jugador.combatesDisponibles = parseInt(localStorage.getItem('combatesDisponibles'));
    }

    if (localStorage.getItem('ultimoCombate')) {
        const ahora = new Date().getTime();
        const ultimoCombate = parseInt(localStorage.getItem('ultimoCombate'));
        const tiempoTranscurrido = ahora - ultimoCombate;

        // Asumiendo que tienes esta propiedad en el objeto jugador
        const tiempoRecarga = jugador.tiempoRecarga || 300000; // 5 minutos por defecto

        const combatesRecuperados = Math.floor(tiempoTranscurrido / tiempoRecarga);

        if (combatesRecuperados > 0) {
            jugador.combatesDisponibles = Math.min(jugador.combatesMaximos, jugador.combatesDisponibles + combatesRecuperados);
            localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());

            const tiempoRestante = tiempoTranscurrido % tiempoRecarga;
            localStorage.setItem('ultimoCombate', (ahora - tiempoRestante).toString());
        }
    }
}

function actualizarCombatesUI() {
    // 1. Actualizar el contador de combates
    document.getElementById("combate-count").textContent = jugador.combatesDisponibles;

    // 2. Obtener tiempos actuales
    const ahora = new Date().getTime();
    const ultimoCombate = parseInt(localStorage.getItem('ultimoCombate')) || ahora;
    const tiempoTranscurrido = ahora - ultimoCombate;

    // 3. Calcular combates recuperados
    let combatesRecuperados = Math.floor(tiempoTranscurrido / jugador.tiempoRecarga);
    
    // 4. Actualizar combates disponibles si hay recuperación
    if (combatesRecuperados > 0) {
        jugador.combatesDisponibles = Math.min(
            jugador.combatesMaximos,
            jugador.combatesDisponibles + combatesRecuperados
        );
        
        // Actualizar el almacenamiento
        const nuevoUltimoCombate = ultimoCombate + (combatesRecuperados * jugador.tiempoRecarga);
        localStorage.setItem('ultimoCombate', nuevoUltimoCombate.toString());
        localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
        
        // Recalcular tiempo transcurrido con el nuevo último combate
        tiempoTranscurrido = ahora - nuevoUltimoCombate;
    }

    // 5. Calcular y mostrar tiempo restante
    if (jugador.combatesDisponibles < jugador.combatesMaximos) {
        const tiempoRestante = jugador.tiempoRecarga - (tiempoTranscurrido % jugador.tiempoRecarga);
        
        // Calcular minutos y segundos
        const minutos = Math.floor(tiempoRestante / (1000 * 60));
        const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
        
        // Mostrar con formato MM:SS
        document.getElementById("combate-timer").textContent = 
            `Recarga en ${minutos}:${segundos.toString().padStart(2, '0')}`;
        
        // Actualizar cada segundo
        setTimeout(actualizarCombatesUI, 1000);
    } else {
        document.getElementById("combate-timer").textContent = 'Completo';
    }

    // 6. Actualizar UI de enemigos si es necesario
    if (enCombate) {
        actualizarEnemigosUI();
    }
}

function comprarCombate() {
    if (jugador.rubies >= 1) {
        const confirmar = confirm("¿Deseas gastar 1 rubí para comprar un combate adicional?");
        if (confirmar) {
            jugador.rubies -= 1;
            jugador.combatesDisponibles += 1;

            // Asegurarse de no exceder el máximo
            if (jugador.combatesDisponibles > jugador.combatesMaximos) {
                jugador.combatesDisponibles = jugador.combatesMaximos;
            }

            actualizarUI();
            actualizarCombatesUI();
            alert("¡Compra exitosa! Has obtenido 1 combate adicional.");
        }
    } else {
        alert("No tienes suficientes rubies. Necesitas al menos 1 rubí para comprar un combate.");
    }
}

// Exportar las nuevas funciones
window.actualizarUbicacionesUI = actualizarUbicacionesUI;
window.usarCombate = usarCombate;
window.seleccionarUbicacion = seleccionarUbicacion;
window.atacar = atacar;
window.huir = huir;
window.actualizarEnemigosUI = actualizarEnemigosUI;
window.cargarCombates = cargarCombates;
window.actualizarCombatesUI = actualizarCombatesUI;
window.comprarCombate = comprarCombate;
window.iniciarCuracion = iniciarCuracion;
window.usarPocion = usarPocion;
window.forzarCuracion = forzarCuracion;
window.verificarCuracionAutomatica = verificarCuracionAutomatica;