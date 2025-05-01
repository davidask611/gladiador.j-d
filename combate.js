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

function atacar(indexEnemigo) {
    console.log("[DEBUG] Iniciando función atacar()");
    console.log("[DEBUG] indexEnemigo:", indexEnemigo);
    console.log("[DEBUG] enemigosActuales:", enemigosActuales);

    const ahora = Date.now();
    console.log("[DEBUG] Tiempo actual:", ahora);
    console.log("[DEBUG] tiempoUltimoAtaque:", tiempoUltimoAtaque);
    console.log("[DEBUG] puedeAtacar:", puedeAtacar);

    if (!puedeAtacar) {
        console.log("[DEBUG] No se puede atacar - en tiempo de espera");
        const tiempoRestante = Math.ceil((tiempoEsperaCombate - (ahora - tiempoUltimoAtaque))) / 1000;
        document.getElementById("log-combate").textContent = `Debes esperar ${tiempoRestante} segundos antes de atacar de nuevo.`;
        return;
    }

    if (!usarCombate()) {
        console.log("[DEBUG] usarCombate() devolvió false - no se puede combatir");
        return;
    }

    // Configurar temporizador
    tiempoUltimoAtaque = ahora;
    puedeAtacar = false;
    console.log("[DEBUG] Actualizado tiempoUltimoAtaque y puedeAtacar");
    
    const contenedor = document.getElementById("temporizador-espera");
    console.log("[DEBUG] Contenedor temporizador:", contenedor);
    contenedor.innerHTML = `
        <p class="tiempo-restante">Tiempo de espera: <span id="contador-espera">15</span>s</p>
        <progress id="barra-espera" value="15" max="15"></progress>
        <p id="atacar-ya" class="mensaje-ataque">¡ATACAR YA, GLADIADOR! ⚔️</p>
    `;

    mostrarTemporizadorEspera();
    console.log("[DEBUG] Temporizador mostrado");

    // Lógica de combate
    const enemigo = enemigosActuales[indexEnemigo];
    console.log("[DEBUG] Enemigo seleccionado:", enemigo);
    let log = `⚔️ **Combate contra ${enemigo.nombre}** ⚔️\n\n`;
    let jugadorVivo = true;
    let enemigoVivo = true;
    let recibioDaño = false;

    // 1. Calcular daño del jugador
    const dañoBaseJugador = statsCombate.danoMin + Math.floor(Math.random() * (statsCombate.danoMax - statsCombate.danoMin + 1));
    const precision = 75 + (jugador.statsBase.habilidad * 5);
    console.log("[DEBUG] Daño base jugador:", dañoBaseJugador);
    console.log("[DEBUG] Precisión:", precision);
    
    if (Math.random() * 100 <= precision) {
        console.log("[DEBUG] Ataque exitoso");
        const dañoJugador = Math.max(1, dañoBaseJugador - enemigo.defensa);
        enemigo.vida -= dañoJugador;
        console.log("[DEBUG] Daño infligido:", dañoJugador);
        console.log("[DEBUG] Vida restante enemigo:", enemigo.vida);
        log += `🗡️ Golpeas al ${enemigo.nombre} (-${dañoJugador} vida).\n`;

        if (enemigo.vida <= 0) {
            console.log("[DEBUG] Enemigo derrotado");
            enemigo.vida = 0;
            enemigo.derrotado = true;
            enemigoVivo = false;
            log += `💀 **¡Has derrotado al ${enemigo.nombre}!**\n`;
            victoria(recibioDaño);
        }
    } else {
        console.log("[DEBUG] Ataque fallido");
        log += `❌ Fallaste tu ataque contra el ${enemigo.nombre}.\n`;
    }

    // 2. Turno del enemigo (si sigue vivo)
    if (enemigoVivo) {
        console.log("[DEBUG] Turno del enemigo");
        const evasion = 10 + (jugador.statsBase.agilidad * 3);
        console.log("[DEBUG] Evasión:", evasion);
        
        if (Math.random() * 100 > evasion) {
            console.log("[DEBUG] Enemigo ataca con éxito");
            const dañoEnemigo = Math.max(1, enemigo.ataque - statsCombate.armadura);
            statsCombate.vida -= dañoEnemigo;
            recibioDaño = true;
            console.log("[DEBUG] Daño recibido:", dañoEnemigo);
            console.log("[DEBUG] Vida restante jugador:", statsCombate.vida);
            log += `🛡️ ${enemigo.nombre} te contraataca (-${dañoEnemigo} vida).\n`;

            if (statsCombate.vida <= 0) {
                console.log("[DEBUG] Jugador derrotado");
                statsCombate.vida = 0;
                jugadorVivo = false;
                log += `☠️ **¡Has sido derrotado por ${enemigo.nombre}!**\n`;
                derrota();
            }
        } else {
            console.log("[DEBUG] Enemigo falló el ataque");
            log += `🎯 ¡Esquivaste el ataque del ${enemigo.nombre}!\n`;
        }
    }

    document.getElementById("log-combate").textContent = log;
    console.log("[DEBUG] Log de combate actualizado");
    actualizarEnemigosUI();
    console.log("[DEBUG] UI enemigos actualizada");
    actualizarUI();
    console.log("[DEBUG] UI jugador actualizada");

    // 3. Verificar si todos los enemigos están derrotados
    if (enemigosActuales.every(e => e.derrotado)) {
        console.log("[DEBUG] Todos los enemigos derrotados");
        victoria(recibioDaño);
    }
    
    console.log("[DEBUG] Función atacar() completada");
}

function victoria(recibioDaño) {
    console.groupCollapsed('[DEBUG] Ejecutando función victoria()');
    console.log('[DEBUG] Parámetro recibioDaño:', recibioDaño);
    console.log('[DEBUG] Estado inicial del jugador:', {
        oro: jugador.oro,
        exp: jugador.exp,
        victorias: jugador.victorias,
        inventario: jugador.inventario.length
    });

    // 1. Calcular recompensas
    console.log('[DEBUG] Paso 1: Calcular recompensas');
    const enemigosDerrotados = enemigosActuales.filter(enemigo => enemigo.derrotado && !enemigo.recompensaOtorgada);
    console.log('[DEBUG] Enemigos derrotados sin recompensa:', enemigosDerrotados);

    let recompensaOro = enemigosDerrotados.reduce((total, enemigo) => {
        enemigo.recompensaOtorgada = true;
        console.log(`[DEBUG] Otorgando recompensa de ${enemigo.oro} oro por ${enemigo.nombre}`);
        return total + enemigo.oro;
    }, 0);

    let recompensaExp = enemigosDerrotados.reduce((total, enemigo) => {
        console.log(`[DEBUG] Otorgando ${enemigo.exp} exp por ${enemigo.nombre}`);
        return total + enemigo.exp;
    }, 0);

    console.log('[DEBUG] Recompensas base - Oro:', recompensaOro, 'Exp:', recompensaExp);

    // 2. Aplicar bonus de carisma
    console.log('[DEBUG] Paso 2: Aplicar bonus de carisma');
    const bonusCarisma = 1 + (jugador.statsBase.carisma * 0.1);
    const oroFinal = Math.floor(recompensaOro * bonusCarisma);
    const expFinal = Math.floor(recompensaExp * bonusCarisma);
    console.log('[DEBUG] Bonus carisma:', bonusCarisma, 'Oro final:', oroFinal, 'Exp final:', expFinal);


    // 3. Aplicar recompensas
    console.log('[DEBUG] Paso 3: Aplicar recompensas');
    if (oroFinal > 0) {
        console.log(`[DEBUG] Añadiendo ${oroFinal} oro al jugador`);
        jugador.oro += oroFinal;
    } else {
        console.log('[DEBUG] No se añade oro (oroFinal <= 0)');
    }
    
    if (expFinal > 0) {
        console.log(`[DEBUG] Añadiendo ${expFinal} exp al jugador`);
        jugador.exp += expFinal;
    } else {
        console.log('[DEBUG] No se añade experiencia (expFinal <= 0)');
    }
    
    jugador.victorias++;
    console.log('[DEBUG] Incrementado contador de victorias');
    // 4. Generar ítem
    console.log('[DEBUG] Paso 4: Generar ítem aleatorio');
    if (Math.random() <= 0.2) {
        console.log('[DEBUG] Probabilidad de item superada (20%)');
        if (jugador.inventario.length < MAX_INVENTARIO) {
            console.log('[DEBUG] Hay espacio en inventario');
            const item = generarItemAleatorio(ubicaciones[ubicacionActual].niveles[0]);
            console.log('[DEBUG] Item generado:', item);
            jugador.inventario.push(item);
            document.getElementById("log-combate").textContent += `\n\n🎁 ¡Has obtenido ${item.nombre}!`;
            console.log('[DEBUG] Item añadido al inventario');
        } else {
            console.log('[DEBUG] Inventario lleno - no se puede añadir item');
            document.getElementById("log-combate").textContent += `\n\n⚠️ Inventario lleno, no puedes recibir más items`;
        }
    } else {
        console.log('[DEBUG] No se generó item (probabilidad no superada)');
    }

    // 5. Mensaje de victoria
    console.log('[DEBUG] Paso 5: Crear mensaje de victoria');
    const mensajeVictoria = `⚔️ **¡VICTORIA!** ⚔️\n\n` +
                          `▸ 💰 Oro: +${oroFinal} (Total: ${jugador.oro})\n` +
                          `▸ ✨ Experiencia: +${expFinal} (${jugador.exp}/${jugador.expParaSubir})\n` +
                          `▸ 🏆 Victorias totales: ${jugador.victorias}`;
    console.log('[DEBUG] Mensaje de victoria:', mensajeVictoria);

    // 6. Actualizar log
    console.log('[DEBUG] Paso 6: Actualizar log de combate');
    const logCombate = document.getElementById("log-combate");
    console.log('[DEBUG] Contenido actual del log:', logCombate.textContent);
    logCombate.textContent = logCombate.textContent.split('\n\n')[0] + '\n\n' + mensajeVictoria;
    console.log('[DEBUG] Nuevo contenido del log:', logCombate.textContent);

    // 7. Actualizar UI
    console.log('[DEBUG] Paso 7: Actualizar UI');
    actualizarUI();
    console.log('[DEBUG] UI actualizada');

    // 8. Verificar subida de nivel
    console.log('[DEBUG] Paso 8: Verificar subida de nivel');
    console.log(`[DEBUG] Exp actual: ${jugador.exp}/${jugador.expParaSubir}`);
    if (jugador.exp >= jugador.expParaSubir) {
        console.log('[DEBUG] Subiendo nivel...');
        subirNivel();
    } else {
        console.log('[DEBUG] No hay suficiente exp para subir nivel');
        const porcentajeExp = Math.floor((jugador.exp / jugador.expParaSubir) * 100);
        console.log(`[DEBUG] Porcentaje exp: ${porcentajeExp}%`);
        document.querySelector(".progreso.exp").style.width = `${porcentajeExp}%`;
        document.getElementById("exp-porcentaje").textContent = `${porcentajeExp}%`;
    }

    // 9. Finalizar combate
    console.log('[DEBUG] Paso 9: Finalizar combate');
    enCombate = false;
    ubicacionActual = "";
    console.log('[DEBUG] Estado después de combate - enCombate:', enCombate, 'ubicacionActual:', ubicacionActual);

    // 10. Actualizar misiones
    console.log('[DEBUG] Paso 10: Actualizar misiones');
    console.log(`[DEBUG] Actualizando misiones - enemigosDerrotados: ${enemigosDerrotados.length}, recibioDaño: ${recibioDaño}`);
    actualizarProgresoMisiones('enemigo', enemigosDerrotados.length);
    if (!recibioDaño) {
        console.log('[DEBUG] Actualizando misión "derrotar sin daño"');
        actualizarProgresoMisiones('enemigoSinDaño', 1);
    }

    console.log('[DEBUG] Estado final del jugador:', {
        oro: jugador.oro,
        exp: jugador.exp,
        victorias: jugador.victorias,
        inventario: jugador.inventario.length
    });
    console.groupEnd();
}

function derrota() {
    console.groupCollapsed('[DEBUG] Ejecutando función derrota()');
    
    // 1. Verificar estado inicial
    console.log('[DEBUG] Estado inicial:');
    console.log('[DEBUG] statsCombate.vida antes:', statsCombate.vida);
    console.log('[DEBUG] statsCombate.vidaMax:', statsCombate.vidaMax);
    console.log('[DEBUG] enCombate antes:', enCombate);
    console.log('[DEBUG] ubicacionActual antes:', ubicacionActual);

    // 2. Restaurar vida al 10%
    console.log('[DEBUG] Restaurando vida al 10%...');
    statsCombate.vida = Math.floor(statsCombate.vidaMax * 0.1);
    console.log('[DEBUG] statsCombate.vida después:', statsCombate.vida);
    
    // 3. Verificar que la vida no sea 0
    if (statsCombate.vida <= 0) {
        console.warn('[WARNING] La vida del jugador es 0 o menor después de derrota!');
        statsCombate.vida = 1; // Asegurar al menos 1 de vida
        console.log('[DEBUG] Ajustada vida a mínimo 1:', statsCombate.vida);
    }

    // 4. Actualizar mensaje de log
    console.log('[DEBUG] Actualizando log de combate...');
    const logCombate = document.getElementById("log-combate");
    if (!logCombate) {
        console.error('[ERROR] No se encontró el elemento log-combate');
    } else {
        console.log('[DEBUG] Contenido actual del log:', logCombate.textContent);
        logCombate.textContent += "\n\n☠️ Has sido derrotado. Regresa a la ciudad para curarte!";
        console.log('[DEBUG] Nuevo contenido del log:', logCombate.textContent);
    }

    // 5. Cambiar estados del juego
    console.log('[DEBUG] Actualizando estados del juego...');
    enCombate = false;
    ubicacionActual = "";
    console.log('[DEBUG] enCombate después:', enCombate);
    console.log('[DEBUG] ubicacionActual después:', ubicacionActual);

    // 6. Actualizar UI
    console.log('[DEBUG] Actualizando interfaz de usuario...');
    try {
        actualizarUI();
        console.log('[DEBUG] UI actualizada correctamente');
    } catch (error) {
        console.error('[ERROR] Fallo al actualizar UI:', error);
    }

    // 7. Verificar estado final
    console.log('[DEBUG] Estado final:');
    console.log('[DEBUG] statsCombate:', {
        vida: statsCombate.vida,
        vidaMax: statsCombate.vidaMax
    });
    console.log('[DEBUG] Estados del juego:', {
        enCombate: enCombate,
        ubicacionActual: ubicacionActual
    });

    console.groupEnd();
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

        actualizarCombatesUI();
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
    // Actualizar contador de combates
    document.getElementById("combate-count").textContent = jugador.combatesDisponibles;

    const ahora = new Date().getTime();
    const ultimoCombate = parseInt(localStorage.getItem('ultimoCombate')) || ahora;
    const tiempoDesdeUltimoCombate = ahora - ultimoCombate;

    // Calcular cuántos combates se han recuperado desde el último uso
    const combatesRecuperados = Math.floor(tiempoDesdeUltimoCombate / jugador.tiempoRecarga);

    if (combatesRecuperados > 0) {
        // Si hay combates por recuperar
        jugador.combatesDisponibles = Math.min(
            jugador.combatesMaximos,
            jugador.combatesDisponibles + combatesRecuperados
        );

        // Actualizar el último combate con el tiempo sobrante
        const nuevoUltimoCombate = ultimoCombate + (combatesRecuperados * jugador.tiempoRecarga);
        localStorage.setItem('ultimoCombate', nuevoUltimoCombate.toString());
        localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
    }

    // Calcular tiempo para el próximo combate (si no están todos)
    if (jugador.combatesDisponibles < jugador.combatesMaximos) {
        const tiempoProximoCombate = jugador.tiempoRecarga - (tiempoDesdeUltimoCombate % jugador.tiempoRecarga);

        const minutos = Math.floor(tiempoProximoCombate / (1000 * 60));
        const segundos = Math.floor((tiempoProximoCombate % (1000 * 60)) / 1000);

        document.getElementById("combate-timer").textContent =
            `Recarga en ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;

        // Actualizar cada segundo
        setTimeout(actualizarCombatesUI, 1000);
    } else {
        // Todos los combates recuperados
        document.getElementById("combate-timer").textContent = 'Completo';
    }

    // Actualizar estado de los enemigos en la UI si es necesario
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