// --- DATOS DEL JUEGO ---
const jugador = {
    nombre: "Ovak",
    nivel: 1,
    vida: 100,
    vidaMax: 100,
    exp: 0,
    expParaSubir: 100,
    oro: 50,
    victorias: 0,
    familia: "Sin clan",
    puntosEntrenamiento: 0,
    danoMin: 2,  // Cambiado a daño mínimo base
    danoMax: 2,  // Cambiado a daño máximo base
    armadura: 0,
    precision: 75,
    evasion: 10,
    combatesDisponibles: 12,
    combatesMaximos: 12,
    ultimoCombate: null,
    tiempoRecarga: 120000, // 2 minutos en milisegundos
    
    statsBase: {
        fuerza: 5,
        habilidad: 5,
        agilidad: 5,
        constitucion: 5,
        carisma: 5,
        inteligencia: 5
    },
    
    statsMaximos: {
        fuerza: 9,
        habilidad: 9,
        agilidad: 9,
        constitucion: 9,
        carisma: 9,
        inteligencia: 9
    },
    
    equipo: {
        casco: null,
        pechera: null,
        guantes: null,
        botas: null,
        arma: null,
        escudo: null,
        anillo1: null,
        anillo2: null,
        pendiente: null
    },
    
    inventario: []
};

// Tipos de items y sus imágenes
const tiposItems = {
    casco: { nombre: "Casco", img: "casco.png" },
    pechera: { nombre: "Pechera", img: "pechera.png" },
    guantes: { nombre: "Guantes", img: "guantes.png" },
    botas: { nombre: "Botas", img: "botas.png" },
    arma: { nombre: "Arma", img: "espada.png" },
    escudo: { nombre: "Escudo", img: "escudo.png" },
    anillo: { nombre: "Anillo", img: "anillo.png" },
    pendiente: { nombre: "Pendiente", img: "pendiente.png" }
};

// Enemigos base
const enemigosBase = [
    { 
        id: 1,
        nombre: "Rata gigante", 
        vida: 30, 
        vidaMax: 30,
        ataque: 5, 
        defensa: 2, 
        imagen: "rata.png",
        derrotado: false,
        oro: 10,
        exp: 15
    },
    { 
        id: 2,
        nombre: "Lince salvaje", 
        vida: 50,
        vidaMax: 50,
        ataque: 8, 
        defensa: 3, 
        imagen: "lince.png",
        derrotado: false,
        oro: 20,
        exp: 25
    },
    { 
        id: 3,
        nombre: "Lobo feroz", 
        vida: 70,
        vidaMax: 70,
        ataque: 12, 
        defensa: 5, 
        imagen: "lobo.png",
        derrotado: false,
        oro: 35,
        exp: 40
    },
    { 
        id: 4,
        nombre: "Oso pardo", 
        vida: 100,
        vidaMax: 100,
        ataque: 15, 
        defensa: 8, 
        imagen: "oso.png",
        derrotado: false,
        oro: 50,
        exp: 60
    }
];

// Ubicaciones con rangos de nivel
const ubicaciones = {
    'Bosque Sombrio': { 
        niveles: [1, 10],
        enemigos: [1, 2] // IDs de enemigos (Rata gigante y Lince salvaje)
    },
    'Puerto Pirata': { 
        niveles: [11, 20],
        enemigos: [2, 3]  // Lince salvaje y Lobo feroz
    },
    'Montañas Nubladas': { 
        niveles: [21, 30],
        enemigos: [3, 4] // Lobo feroz y Oso pardo
    },
    'Cueva del Lobo': { 
        niveles: [31, 40],
        enemigos: [3] // Solo Lobo feroz
    },
    'Templo Antiguo': { 
        niveles: [41, 50],
        enemigos: [1, 4] // Rata gigante y Oso pardo
    },
    'Pueblo Bárbaro': { 
        niveles: [51, 60],
        enemigos: [2, 3, 4] // Lince, Lobo y Oso
    },
    'Campamento Bandido': { 
        niveles: [61, 70],
        enemigos: [1, 2, 3] // Rata, Lince y Lobo
    }
};

let enemigosActuales = [];
let enCombate = false;
let ubicacionActual = "";

// --- FUNCIONES DE ITEMS ---
function generarItemAleatorio(nivelZona) {
    const tipos = Object.keys(tiposItems);
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const nivel = Math.floor(Math.random() * 10) + nivelZona;
    
    // Variables para el item
    let danoMin = 0;
    let danoMax = 0;
    let defensa = 0;
    let descripcion = "";
    
    if (tipo === 'arma') {
        danoMin = Math.floor(Math.random() * 3) + nivel;
        danoMax = danoMin + Math.floor(Math.random() * 3) + 2;
        descripcion = `Daño: ${danoMin}-${danoMax}`;
    } else {
        defensa = Math.floor(Math.random() * 31) + 20;
        descripcion = `Defensa: +${defensa}`;
    }
    
    // Atributo aleatorio a mejorar
    const stats = ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'];
    const statMejorado = stats[Math.floor(Math.random() * stats.length)];
    const bonusStat = Math.floor(Math.random() * 11) + 5;
    
    return {
        id: Date.now(),
        nombre: `${tiposItems[tipo].nombre} Nv${nivel}`,
        tipo: tipo,
        nivel: nivel,
        defensa: defensa,
        danoMin: danoMin,
        danoMax: danoMax,
        [statMejorado]: bonusStat,
        img: tiposItems[tipo].img,
        descripcion: descripcion,
        precio: nivel * 20 + (defensa + danoMax) * 2
    };
}

function filtrarInventario(filtro) {
    const itemsContainer = document.getElementById("items-container");
    itemsContainer.innerHTML = "";
    
    let itemsFiltrados = jugador.inventario;
    
    if (filtro !== 'todos') {
        itemsFiltrados = jugador.inventario.filter(item => {
            if (filtro === 'armas') return item.tipo === 'arma';
            if (filtro === 'armaduras') return ['casco', 'pechera', 'guantes', 'botas', 'escudo'].includes(item.tipo);
            if (filtro === 'accesorios') return ['anillo', 'pendiente'].includes(item.tipo);
            return true;
        });
    }
    
    if (itemsFiltrados.length === 0) {
        itemsContainer.innerHTML = "<p>No tienes items de este tipo.</p>";
        return;
    }
    
    itemsFiltrados.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "item-inventario";
        itemElement.innerHTML = `
            <img src="${item.img}" alt="${item.nombre}">
            <div class="item-tooltip">
                <strong>${item.nombre}</strong><br>
                ${item.descripcion}<br>
                ${Object.entries(item)
                    .filter(([key, val]) => ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val)
                    .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: +${val}`)
                    .join('<br>')}
            </div>
        `;
        
        itemElement.addEventListener("click", () => equiparItem(item.id));
        itemsContainer.appendChild(itemElement);
    });
}

function equiparItem(itemId) {
    const item = jugador.inventario.find(i => i.id === itemId);
    if (!item) return;
    
    // Determinar el slot correcto (especial para anillos)
    let slot = item.tipo;
    if (item.tipo === 'anillo') {
        slot = jugador.equipo.anillo1 ? 'anillo2' : 'anillo1';
    }
    
    // Verificar si ya está equipado
    if (jugador.equipo[slot] && jugador.equipo[slot].id === itemId) {
        desequiparItem(slot);
        return;
    }
    
    // Primero desequipar el item actual si existe
    if (jugador.equipo[slot]) {
        desequiparItem(slot);
    }
    
    // Equipar el nuevo item
    jugador.equipo[slot] = item;
    
    // Aplicar bonificaciones de stats
    Object.entries(item).forEach(([key, val]) => {
        if (['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val) {
            jugador.statsBase[key] += val;
        }
    });
    
    actualizarUI();
}

function desequiparItem(slot) {
    const item = jugador.equipo[slot];
    if (!item) return;
    
    // Remover bonificaciones de stats
    Object.entries(item).forEach(([key, val]) => {
        if (['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val) {
            jugador.statsBase[key] -= val;
        }
    });
    
    jugador.equipo[slot] = null;
    actualizarUI();
}

function actualizarInventarioUI() {
    filtrarInventario('todos');
}

function actualizarVestuarioUI() {
    Object.keys(jugador.equipo).forEach(slot => {
        const slotElement = document.getElementById(`${slot}-img`);
        slotElement.innerHTML = "";
        
        if (jugador.equipo[slot]) {
            const img = document.createElement("img");
            img.src = jugador.equipo[slot].img;
            img.alt = jugador.equipo[slot].nombre;
            slotElement.appendChild(img);
        }
    });
    
    // Actualizar resumen de equipo
    const resumenElement = document.getElementById("resumen-equipo");
    const bonos = {
        dañoMin: 0,
        dañoMax: 0,
        defensa: 0,
        stats: {}
    };
    
    Object.values(jugador.equipo).forEach(item => {
        if (item) {
            if (item.tipo === 'arma') {
                bonos.dañoMin += item.danoMin;
                bonos.dañoMax += item.danoMax;
            } else {
                bonos.defensa += item.defensa;
            }
            
            Object.entries(item).forEach(([key, val]) => {
                if (['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val) {
                    bonos.stats[key] = (bonos.stats[key] || 0) + val;
                }
            });
        }
    });
    
    // Calcular daño total
    const danoBaseMin = 2;
    const danoBaseMax = 2;
    const danoTotalMin = danoBaseMin + bonos.dañoMin + jugador.statsBase.fuerza;
    const danoTotalMax = danoBaseMax + bonos.dañoMax + jugador.statsBase.fuerza;
    
    let resumenHTML = `<h3>Bonos del Equipo</h3>
                      <p>Daño: ${danoTotalMin}-${danoTotalMax} (Base: ${danoBaseMin}-${danoBaseMax}`;
    
    if (bonos.dañoMin > 0 || bonos.dañoMax > 0) {
        resumenHTML += ` + Arma: ${bonos.dañoMin}-${bonos.dañoMax}`;
    }
    
    resumenHTML += ` + Fuerza: ${jugador.statsBase.fuerza})</p>
                   <p>Defensa: +${bonos.defensa}</p>`;
    
    if (Object.keys(bonos.stats).length > 0) {
        resumenHTML += `<h4>Atributos:</h4>`;
        Object.entries(bonos.stats).forEach(([stat, valor]) => {
            resumenHTML += `<p>${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${valor}</p>`;
        });
    }
    
    resumenElement.innerHTML = resumenHTML;
}

// --- SISTEMA DE COMBATES ---
function cargarCombates() {
    if (localStorage.getItem('combatesDisponibles')) {
        jugador.combatesDisponibles = parseInt(localStorage.getItem('combatesDisponibles'));
    }

    if (localStorage.getItem('ultimoCombate')) {
        const ahora = new Date().getTime();
        const ultimoCombate = parseInt(localStorage.getItem('ultimoCombate'));
        const tiempoTranscurrido = ahora - ultimoCombate;
        
        const combatesRecuperados = Math.floor(tiempoTranscurrido / jugador.tiempoRecarga);
        
        if (combatesRecuperados > 0) {
            jugador.combatesDisponibles = Math.min(jugador.combatesMaximos, jugador.combatesDisponibles + combatesRecuperados);
            localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
            
            const tiempoRestante = tiempoTranscurrido % jugador.tiempoRecarga;
            localStorage.setItem('ultimoCombate', (ahora - tiempoRestante).toString());
        }
    }
}

function actualizarCombatesUI() {
    document.getElementById("combate-count").textContent = jugador.combatesDisponibles;
    
    if (jugador.combatesDisponibles <= 0) {
        const ahora = new Date().getTime();
        const ultimoCombate = parseInt(localStorage.getItem('ultimoCombate') || ahora);
        const tiempoProximoCombate = ultimoCombate + jugador.tiempoRecarga - ahora;
        
        if (tiempoProximoCombate > 0) {
            const minutos = Math.floor(tiempoProximoCombate / (1000 * 60));
            const segundos = Math.floor((tiempoProximoCombate % (1000 * 60)) / 1000);
            
            document.getElementById("combate-timer").textContent = 
                `Recarga en ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
            
            setTimeout(actualizarCombatesUI, 1000);
        }
    } else {
        document.getElementById("combate-timer").textContent = '';
    }
    
    // Actualizar estado de los enemigos en la UI
    if (enCombate) {
        actualizarEnemigosUI();
    }
}

function usarCombate() {
    if (jugador.combatesDisponibles > 0) {
        jugador.combatesDisponibles--;
        localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
        localStorage.setItem('ultimoCombate', new Date().getTime().toString());
        
        actualizarCombatesUI();
        
        if (jugador.combatesDisponibles < jugador.combatesMaximos) {
            setTimeout(actualizarCombatesUI, jugador.tiempoRecarga);
        }
        return true;
    }
    return false;
}

// --- FUNCIONES DE INTERFAZ ---
function mostrarSeccion(seccionId) {
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    document.getElementById(seccionId).classList.add('activa');
    
    if (seccionId === 'combate') {
        // Al mostrar la sección de combate, reiniciamos el estado
        enCombate = false;
        enemigosActuales = [];
        actualizarEnemigosUI();
        document.getElementById("log-combate").textContent = "Selecciona una ubicación para comenzar el combate";
    }
}

function actualizarUI() {
    const porcentajeVida = Math.floor((jugador.vida / jugador.vidaMax) * 100);
    const porcentajeExp = Math.floor((jugador.exp / jugador.expParaSubir) * 100);
    
    // Actualizar todos los valores visibles
    document.getElementById("nombre-personaje").textContent = jugador.nombre;
    document.getElementById("nivel-value").textContent = jugador.nivel;
    document.getElementById("nivel-jugador").textContent = jugador.nivel;
    document.getElementById("vida-porcentaje").textContent = `${porcentajeVida}%`;
    document.querySelector(".progreso.vida").style.width = `${porcentajeVida}%`;
    document.getElementById("exp-porcentaje").textContent = `${porcentajeExp}%`;
    document.querySelector(".progreso.exp").style.width = `${porcentajeExp}%`;
    document.getElementById("oro-value").textContent = jugador.oro;
    document.getElementById("armadura-value").textContent = jugador.armadura;
    document.getElementById("victorias").textContent = `Victorias: ${jugador.victorias}`;
    document.getElementById("familia").textContent = `Familia: ${jugador.familia}`;
    
    // Calcular daño total
    let danoMinTotal = 2; // Daño base mínimo
    let danoMaxTotal = 2; // Daño base máximo
    
    // Sumar daño de todas las armas equipadas
    Object.values(jugador.equipo).forEach(item => {
        if (item && item.tipo === 'arma') {
            danoMinTotal += item.danoMin;
            danoMaxTotal += item.danoMax;
        }
    });
    
    // Sumar bonificación por fuerza
    danoMinTotal += jugador.statsBase.fuerza;
    danoMaxTotal += jugador.statsBase.fuerza;
    
    document.getElementById("dano-value").textContent = `${danoMinTotal}-${danoMaxTotal}`;
    
    // Stats
    document.getElementById("fuerza-value").textContent = jugador.statsBase.fuerza;
    document.getElementById("habilidad-value").textContent = jugador.statsBase.habilidad;
    document.getElementById("agilidad-value").textContent = jugador.statsBase.agilidad;
    document.getElementById("constitucion-value").textContent = jugador.statsBase.constitucion;
    document.getElementById("carisma-value").textContent = jugador.statsBase.carisma;
    document.getElementById("inteligencia-value").textContent = jugador.statsBase.inteligencia;
    
    // Entrenamiento
    document.getElementById("puntos-entrenamiento").textContent = jugador.puntosEntrenamiento;
    
    const stats = ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'];
    stats.forEach(stat => {
        document.getElementById(`${stat}-total`).textContent = jugador.statsBase[stat];
        document.getElementById(`${stat}-base`).textContent = jugador.statsBase[stat];
        document.getElementById(`${stat}-max`).textContent = jugador.statsMaximos[stat];
    });
    
    // Actualizar inventario y vestuario
    actualizarInventarioUI();
    actualizarVestuarioUI();
    actualizarUbicacionesUI();
    
    localStorage.setItem('gladiatusSave', JSON.stringify(jugador));
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

// --- SISTEMA DE COMBATE ---
function seleccionarUbicacion(nombreUbicacion) {
    const ubicacion = ubicaciones[nombreUbicacion];
    
    // Verificar nivel del jugador
    if (jugador.nivel < ubicacion.niveles[0]) {
        document.getElementById("log-combate").textContent = 
            `¡Necesitas ser nivel ${ubicacion.niveles[0]} para explorar ${nombreUbicacion}!`;
        return;
    }
    
    if (jugador.nivel > ubicacion.niveles[1]) {
        document.getElementById("log-combate").textContent = 
            `¡${nombreUbicacion} es demasiado fácil para tu nivel (${jugador.nivel})!`;
        return;
    }

    if (jugador.combatesDisponibles <= 0) {
        document.getElementById("log-combate").textContent = 
            "No tienes combates disponibles para explorar " + nombreUbicacion;
        return;
    }

    // Filtrar enemigos basados en la ubicación seleccionada
    const enemigosUbicacion = enemigosBase.filter(enemigo => 
        ubicacion.enemigos.includes(enemigo.id));
    
    // Escalar enemigos según el nivel del jugador
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
    
    // Iniciar combate con estos enemigos
    if (!usarCombate()) {
        document.getElementById("log-combate").textContent = 
            "No tienes combates disponibles. Espera a que se recarguen.";
        return;
    }
    
    enemigosActuales = [...enemigosEscalados];
    enCombate = true;
    ubicacionActual = nombreUbicacion;
    actualizarEnemigosUI();
    document.getElementById("log-combate").textContent = 
        `Explorando ${nombreUbicacion} (Nivel ${ubicacion.niveles[0]}-${ubicacion.niveles[1]})... ¡Selecciona un enemigo para atacar!`;
    actualizarCombatesUI();
}

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
            <h3>${enemigo.nombre}</h3>
            <div class="barra-vida">
                <div class="vida-actual" style="width: ${(enemigo.vida / enemigo.vidaMax) * 100}%"></div>
            </div>
            <p>Vida: ${enemigo.vida}/${enemigo.vidaMax}</p>
            <p>Ataque: ${enemigo.ataque}</p>
            <p>Defensa: ${enemigo.defensa}</p>
        `;
        
        // Solo permite clic si hay combates disponibles y el enemigo no está derrotado
        if (!enemigo.derrotado && jugador.combatesDisponibles > 0) {
            card.addEventListener("click", () => atacar(index));
        }
        grid.appendChild(card);
    });
}

function atacar(indexEnemigo) {
    if (jugador.combatesDisponibles <= 0 || jugador.vida <= 0) {
        document.getElementById("log-combate").textContent = "¡No tienes combates disponibles ni vida! Espera a que se recarguen.";
        return;
    }

    const enemigo = enemigosActuales[indexEnemigo];
    let log = `⚔️ **Combate contra ${enemigo.nombre}** ⚔️\n\n`;
    let jugadorVivo = true;
    let enemigoVivo = true;

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

    // Descontar combate solo al finalizar la batalla
    if (!jugadorVivo || !enemigoVivo) {
        usarCombate(); // Resta 1 combate disponible
    }

    // Verificar si todos los enemigos están derrotados (victoria en la ubicación)
    if (enemigosActuales.every(e => e.derrotado)) {
        victoria();
    } else if (!jugadorVivo) {
        derrota();
    }
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
                jugador.vida -= dañoEnemigo;
                dañoTotal += dañoEnemigo;
            }
        });
        
        document.getElementById("log-combate").textContent = 
            `❌ No puedes huir... ¡Los enemigos te atacan! (-${dañoTotal} vida)`;
        
        if (jugador.vida <= 0) derrota();
        actualizarUI();
    }
}

function victoria() {
    let recompensaOro = 0;
    let recompensaExp = 0;
    
    enemigosActuales.forEach(enemigo => {
        if (enemigo.derrotado) {
            recompensaOro += enemigo.oro;
            recompensaExp += enemigo.exp;
        }
    });
    
    const bonusCarisma = 1 + (jugador.statsBase.carisma * 0.1);
    const oroFinal = Math.floor(recompensaOro * bonusCarisma);
    
    jugador.oro += oroFinal;
    jugador.exp += recompensaExp;
    jugador.victorias++;
    
    document.getElementById("log-combate").textContent += 
        `\n\n🎉 ¡Victoria en ${ubicacionActual}! Ganaste ${oroFinal} oro y ${recompensaExp} experiencia.`;
    
    // 50% de chance de obtener un item
    if (Math.random() > 0.5) {
        const nivelZona = ubicaciones[ubicacionActual].niveles[0];
        const nuevoItem = generarItemAleatorio(nivelZona);
        jugador.inventario.push(nuevoItem);
        document.getElementById("log-combate").textContent += 
            `\n\n🎁 ¡Has obtenido ${nuevoItem.nombre}!`;
    }
    
    enCombate = false;
    ubicacionActual = "";
    
    if (jugador.exp >= jugador.expParaSubir) {
        subirNivel();
    }
    
    actualizarUI();
}

function derrota() {
    jugador.vida = Math.floor(jugador.vidaMax == 0);
    document.getElementById("log-combate").textContent += "\n\n☠️ Has sido derrotado. Has sido derrotado... ¡Regresa a la ciudad para curarte!";
    enCombate = false;
    ubicacionActual = "";
    actualizarUI();
}

function curar() {
    if (jugador.vida < jugador.vidaMax) {
        const vidaFaltante = jugador.vidaMax - jugador.vida;
        // Calcular costo: 5 oro por cada 20 de vida (redondeado hacia arriba)
        const costo = Math.ceil(vidaFaltante / 20) * 5;
        
        if (jugador.oro >= costo) {
            jugador.oro -= costo;
            jugador.vida = jugador.vidaMax; // Curar completamente
            document.getElementById("log-combate").textContent = `💊 Te curaste por ${costo} oro.`;
        } else {
            const vidaPosible = Math.floor(jugador.oro / 5) * 20;
            if (vidaPosible > 0) {
                jugador.oro -= Math.ceil(vidaPosible / 20) * 5;
                jugador.vida += vidaPosible;
                document.getElementById("log-combate").textContent = `💊 Recuperaste ${vidaPosible} vida por ${Math.ceil(vidaPosible / 20) * 5} oro.`;
            } else {
                document.getElementById("log-combate").textContent = "💰 No tienes suficiente oro (mínimo 5 oro para 20 de vida).";
            }
        }
    } else {
        document.getElementById("log-combate").textContent = "💊 Ya estás al máximo de vida.";
    }
    actualizarUI();
}

// --- SISTEMA DE ENTRENAMIENTO ---
function subirNivel() {
    jugador.nivel++;
    jugador.exp = 0;
    jugador.expParaSubir = Math.floor(jugador.expParaSubir * 1.5);
    jugador.puntosEntrenamiento += 1;
    jugador.vidaMax += 20 + (jugador.statsBase.constitucion * 2);
    jugador.vida = jugador.vidaMax;
    
    if (jugador.nivel % 2 === 0) {
        Object.keys(jugador.statsMaximos).forEach(stat => {
            jugador.statsMaximos[stat]++;
        });
    }
    
    alert(`¡Subiste al nivel ${jugador.nivel}! +1 puntos de entrenamiento y +${20 + (jugador.statsBase.constitucion * 2)} de vida máxima.`);
    actualizarUI();
}

function mejorarStat(stat) {
    if (jugador.puntosEntrenamiento <= 0) {
        alert("¡No tienes puntos de entrenamiento!");
        return;
    }
    
    if (jugador.statsBase[stat] >= jugador.statsMaximos[stat]) {
        alert(`¡Ya alcanzaste el máximo (${jugador.statsMaximos[stat]}) para este nivel!`);
        return;
    }
    
    jugador.statsBase[stat]++;
    jugador.puntosEntrenamiento--;
    
    switch(stat) {
        case 'constitucion':
            const vidaExtra = 5;
            jugador.vidaMax += vidaExtra;
            jugador.vida += vidaExtra;
            break;
    }
    
    actualizarUI();
}

// --- INICIALIZACIÓN ---
function cargarJuego() {
    const datosGuardados = localStorage.getItem('gladiatusSave');
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);
        Object.assign(jugador, datos);
    }
    
    // Generar algunos items iniciales para prueba
    if (jugador.inventario.length === 0) {
        const espadaInicial = {
            id: 1,
            nombre: "Espada de madera",
            tipo: "arma",
            danoMin: 2,
            danoMax: 4,
            defensa: 0,
            img: "espada.png",
            descripcion: "Daño: 2-4",
            precio: 30
        };
        
        const armaduraInicial = {
            id: 2,
            nombre: "Armadura de cuero",
            tipo: "pechera",
            danoMin: 0,
            danoMax: 0,
            defensa: 3,
            img: "pechera.png",
            descripcion: "Defensa: +3",
            precio: 45
        };
 
        const cascoInicial = {
            id: 2,
            nombre: "casco de cuero",
            tipo: "casco",
            danoMin: 0,
            danoMax: 0,
            defensa: 3,
            img: "casco.png",
            descripcion: "Defensa: +3",
            precio: 45
        };  
        
        const guantesInicial = {
            id: 2,
            nombre: "guantes de cuero",
            tipo: "guantes",
            danoMin: 0,
            danoMax: 0,
            defensa: 3,
            img: "guantes.png",
            descripcion: "Defensa: +3",
            precio: 45
        };        

        const botasInicial = {
            id: 2,
            nombre: "botas de cuero",
            tipo: "botas",
            danoMin: 0,
            danoMax: 0,
            defensa: 3,
            img: "botas.png",
            descripcion: "Defensa: +3",
            precio: 45
        };
        
        const escudoInicial = {
            id: 2,
            nombre: "escudo de madera",
            tipo: "escudo",
            danoMin: 0,
            danoMax: 0,
            defensa: 3,
            img: "escudo.png",
            descripcion: "Defensa: +3",
            precio: 45
        };           
        
        jugador.inventario.push(espadaInicial, armaduraInicial, cascoInicial ,guantesInicial ,botasInicial , escudoInicial);
        equiparItem(1); // Equipar espada
        equiparItem(2); // Equipar armadura 
    }
    
    cargarCombates();
    actualizarUI();
    actualizarCombatesUI();
}

window.addEventListener('load', cargarJuego);
window.addEventListener('beforeunload', () => {
    localStorage.setItem('gladiatusSave', JSON.stringify(jugador));
});