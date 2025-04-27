// Sistema de Arena PvP (versión mejorada)
const arena = {
    ranking: [], // Almacenará los rankings de jugadores
    tiempoEsperaArena: 30000, // 30 segundos entre combates PvP
    ultimoCombatePvP: 0,
    puedeDesafiar: true,
    puntosPorVictoria: 20, // Puntos base que ganas al vencer
    puntosPorDerrota: 10, // Puntos base que pierdes al perder
    puntosBaseOponente: 1000, // Puntos iniciales para nuevos jugadores
    
    // Nuevo: Límites de combate
    combatesDiarios: 5,
    combatesRestantes: 5,
    ultimoCombate: null,
    recargaHoraria: 3600000, // 1 hora en ms
    
    // Nuevo: Estadísticas PvP
    historial: [],
    rachaVictorias: 0,
    mayorRacha: 0,
    totalCombates: 0,
    totalVictorias: 0,
    
    // Nuevo: Balanceo
    modificadorNivel: 0.05, // 5% por nivel de diferencia
    rangoPuntos: 150, // ±150 puntos para emparejamiento
    maxPuntosGanados: 50,
    minPuntosGanados: 10
};

let oponenteSeleccionado = null;
let enCombatePvP = false;

// Constantes del juego
const MAX_INVENTARIO = 30;
// const TIEMPO_RECARGA_COMBATES = 300000; // 5 minutos en ms
// const TIEMPO_CURACION = 120000; // 2 minutos en ms
// const TIEMPO_EVENTO = 1800000; // 30 minutos en ms
// const TIEMPO_ENTRE_EVENTOS = 259200000; // 3 días en ms
let tiempoEsperaCombate = 15000; // 15 segundos en milisegundos
let tiempoUltimoAtaque = 0; // Tiempo del último ataque
let puedeAtacar = true; // Ya lo tienes declarado
document.getElementById("atacar-ya").style.display = "none";
// --- DATOS DEL JUEGO ---
const jugador = {
    nombre: "Ovak",
    nivel: 1,
    vida: 100,
    vidaMax: 100,
    exp: 0,
    expParaSubir: 100,
    oro: 50,
    rubies: 0,  // Nueva propiedad
    victorias: 0,
    familia: "Sin clan",
    danoMin: 2,  // Cambiado a daño mínimo base
    danoMax: 2,  // Cambiado a daño máximo base
    armadura: 0,
    precision: 75,
    evasion: 10,
    combatesDisponibles: 12,
    combatesMaximos: 12,
    ultimoCombate: null,
    ultimaCuracion: null,
    tiempoCuracion: 120000, // 2 minutos en milisegundos
    vidaPorCuracion: 20,
    intervaloCuracion: null, // Para almacenar el intervalo del temporizador
    tiempoRecarga: 300000, // 5 minutos en milisegundos

    statsBase: {
        fuerza: 5,
        habilidad: 5,
        agilidad: 5,
        constitucion: 5,
        carisma: 5,
        inteligencia: 5
    },
    
    statsMaximos: {
        fuerza: 1000,
        habilidad: 1000,
        agilidad: 1000,
        constitucion: 1000,
        carisma: 1000,
        inteligencia: 1000
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
    
    inventario: [],

    mejorasStats: { // Contador de mejoras por stat
        fuerza: 0,
        habilidad: 0,
        agilidad: 0,
        constitucion: 0,
        carisma: 0,
        inteligencia: 0
    },
    costosEntrenamiento: { // Costos base (primera mejora)
        fuerza: 50,
        habilidad: 50,
        agilidad: 25,
        constitucion: 25,
        carisma: 50,
        inteligencia: 50
    },
}  

// Añade estos recursos al objeto jugador
if (!jugador.recursos) {
    jugador.recursos = {
        madera: 0,
        mineral: 0,
        pieles: 0,
        gemas: 0
    };
}

if (!jugador.fabrica) {
    jugador.fabrica = {
        colaProduccion: [],
        recetasDesbloqueadas: [1, 2, 3, 4, 5, 6, 7] // IDs de recetas básicas desbloqueadas
    };
}

// Cargar datos del jugador si hay un usuario logueado
const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
if (usuarioActual && usuarioActual.jugador) {
    Object.assign(jugador, usuarioActual.jugador);
}

const misiones = {
    diarias: [
        // Misiones básicas de combate
        {
            id: 1,
            titulo: "Cazador Novato",
            descripcion: "Derrota 3 enemigos en cualquier ubicación.",
            tipo: "diaria",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 50, exp: 20 },
            completada: false
        },
        {
            id: 2,
            titulo: "Matador de Bestias",
            descripcion: "Derrota 5 enemigos de tipo animal (Spiders, Bull Fighters, Hounds).",
            tipo: "diaria",
            progreso: 0,
            requerido: 5,
            recompensa: { oro: 80, exp: 40 },
            completada: false
        },
        // Misiones de equipo
        {
            id: 3,
            titulo: "Equipamiento Básico",
            descripcion: "Equipa 3 items diferentes (arma, armadura y accesorio).",
            tipo: "diaria",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 60, rubies: 1 },
            completada: false
        },
        {
            id: 4,
            titulo: "Coleccionista",
            descripcion: "Consigue 2 nuevos items en tu inventario.",
            tipo: "diaria",
            progreso: 0,
            requerido: 2,
            recompensa: { oro: 70, exp: 30 },
            completada: false
        },
        // Misiones de atributos
        {
            id: 5,
            titulo: "Entrenamiento Intensivo",
            descripcion: "Mejora cualquier atributo 2 veces.",
            tipo: "diaria",
            progreso: 0,
            requerido: 2,
            recompensa: { oro: 30, rubies: 1 },
            completada: false
        },
        {
            id: 6,
            titulo: "Especialización",
            descripcion: "Mejora un mismo atributo 3 veces.",
            tipo: "diaria",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 100, exp: 50 },
            completada: false
        },
        // Misiones de recursos
        {
            id: 7,
            titulo: "Ahorrador",
            descripcion: "Consigue 200 de oro.",
            tipo: "diaria",
            progreso: 0,
            requerido: 200,
            recompensa: { exp: 50, rubies: 1 },
            completada: false
        },
        {
            id: 8,
            titulo: "Canje de Victorias",
            descripcion: "Canjea victorias por rubies 1 vez.",
            tipo: "diaria",
            progreso: 0,
            requerido: 1,
            recompensa: { oro: 100, exp: 30 },
            completada: false
        },
        // Misiones de exploración
        {
            id: 9,
            titulo: "Explorador",
            descripcion: "Visita 2 ubicaciones diferentes.",
            tipo: "diaria",
            progreso: 0,
            requerido: 2,
            recompensa: { oro: 50, exp: 40 },
            completada: false
        },
        {
            id: 10,
            titulo: "Conquistador",
            descripcion: "Derrota al menos 1 enemigo en 3 ubicaciones diferentes.",
            tipo: "diaria",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 120, rubies: 2 },
            completada: false
        }
    ],
    historia: [
        // Misiones de progresión inicial
        {
            id: 11,
            titulo: "Primeros Pasos",
            descripcion: "Alcanza el nivel 5.",
            tipo: "historia",
            progreso: 0,
            requerido: 5,
            recompensa: { 
                oro: 100, 
                exp: 50, 
                item: {
                    tipo: "arma",
                    nivelMin: 5,
                    nivelMax: 20,
                    rareza: "común" // Puede ser "común", "raro", "épico", etc.
                }
            },
            completada: false
        },
        {
            id: 12,
            titulo: "Forjando Leyenda",
            descripcion: "Alcanza el nivel 10.",
            tipo: "historia",
            progreso: 0,
            requerido: 10,
            recompensa: { oro: 250, exp: 100, rubies: 2 },
            completada: false
        },

        // Misiones de combate épico (con recompensa de armadura ajustada)
        {
            id: 13,
            titulo: "Cazador de Bestias",
            descripcion: "Derrota 20 enemigos de cualquier tipo.",
            tipo: "historia",
            progreso: 0,
            requerido: 20,
            recompensa: { 
                oro: 200, 
                exp: 80, 
                item: {
                    tipo: "armadura",
                    nivelMin: 5,
                    nivelMax: 20,
                    rareza: "raro" // Recompensa mejorada para misiones más difíciles
                }
            },
            completada: false
        },

        {
            id: 14,
            titulo: "Reto del Guerrero",
            descripcion: "Derrota 3 enemigos sin recibir daño.",
            tipo: "historia",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 150, rubies: 3 },
            completada: false
        },
        // Misiones de equipo
        {
            id: 15,
            titulo: "Equipo Legendario",
            descripcion: "Equipa 5 items de nivel 10 o superior.",
            tipo: "historia",
            progreso: 0,
            requerido: 5,
            recompensa: { oro: 300, exp: 120 },
            completada: false
        },
        {
            id: 16,
            titulo: "Maestro de Armas",
            descripcion: "Consigue un arma con al menos 10 de daño máximo.",
            tipo: "historia",
            progreso: 0,
            requerido: 1,
            recompensa: { exp: 150, rubies: 5 },
            completada: false
        },

        // Misiones de atributos (con recompensa de accesorio ajustada)
        {
            id: 17,
            titulo: "Perfeccionamiento",
            descripcion: "Lleva un atributo a 20 puntos.",
            tipo: "historia",
            progreso: 0,
            requerido: 20,
            recompensa: { 
                oro: 200, 
                exp: 100, 
                item: {
                    tipo: "accesorio",
                    nivelMin: 5,
                    nivelMax: 20,
                    rareza: "épico" // Recompensa de alta calidad
                }
            },
            completada: false
        },

        {
            id: 18,
            titulo: "Equilibrio Interior",
            descripcion: "Ten al menos 10 puntos en 3 atributos diferentes.",
            tipo: "historia",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 180, rubies: 3 },
            completada: false
        }
    ]
};

// Inicializar misiones en el jugador (si no existen)
if (!jugador.misiones) {
    jugador.misiones = {
        diarias: JSON.parse(JSON.stringify(misiones.diarias)),
        historia: JSON.parse(JSON.stringify(misiones.historia)),
        // fabrica: JSON.parse(JSON.stringify(misionesFabrica)) // Asegúrate de que esto está incluido
    };
}

// Tipos de items y sus imágenes
const tiposItems = {
    casco: { nombre: "Casco", img: "ropa/casco.png" },
    pechera: { nombre: "Pechera", img: "ropa/pechera.png" },
    guantes: { nombre: "Guantes", img: "ropa/guantes.png" },
    botas: { nombre: "Botas", img: "ropa/botas.png" },
    arma: { nombre: "Arma", img: "ropa/espada.png" },
    escudo: { nombre: "Escudo", img: "ropa/escudo.png" },
    anillo: { nombre: "Anillo", img: "ropa/anillo.png" },
    pendiente: { nombre: "Pendiente", img: "ropa/pendiente.png" }
};

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
                ${item.tipo === 'pocion' ? `Curación: +${item.curacion}<br>` : ''}                
                ${item.descripcion}<br>
                ${Object.entries(item)
                    .filter(([key, val]) => ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val)
                    .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: +${val}`)
                    .join('<br>')}
            </div>
        `;
        
        itemElement.onclick = () => equiparItem(item.id);
        itemsContainer.appendChild(itemElement);
    });
}

function equiparItem(itemId) {
    const item = jugador.inventario.find(i => i.id === itemId);
    if (!item) return;

    // Verificar si es una poción
    if (item.tipo === 'pocion') {
        usarPocion(item);
        return;
    }

    // Verificar nivel del jugador vs nivel del ítem
    if (item.nivel > jugador.nivel) {
        alert(`¡No tienes el nivel suficiente para equipar este ítem!\nNecesitas ser nivel ${item.nivel} (Tu nivel: ${jugador.nivel})`);
        return;
    }

    let slot;
    switch(item.tipo) {
        case 'anillo':
            slot = jugador.equipo.anillo1 ? 'anillo2' : 'anillo1';
            break;
        case 'arma':
        case 'escudo':
        case 'casco':
        case 'pechera':
        case 'guantes':
        case 'botas':
        case 'pendiente':
            slot = item.tipo;
            break;
        default: return;
    }
    
    // Desequipar primero si ya hay algo en ese slot
    if (jugador.equipo[slot]) {
        desequiparItem(slot);
    }
    
    // Equipar el nuevo item
    const itemIndex = jugador.inventario.findIndex(i => i.id === itemId);
    jugador.equipo[slot] = jugador.inventario[itemIndex];
    jugador.inventario.splice(itemIndex, 1);
    
    // Aplicar bonificaciones
    aplicarBonificacionesItem(jugador.equipo[slot], 'add');
    actualizarUI();
    actualizarProgresoMisiones('equiparItem', 1);
}

// Función auxiliar para aplicar/remover bonificaciones
function aplicarBonificacionesItem(item, action) {
    const multiplier = action === 'add' ? 1 : -1;
    Object.entries(item).forEach(([key, val]) => {
        if (['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val) {
            jugador.statsBase[key] += val * multiplier;
        }
    });

    // Actualizar armadura cuando el item no es un arma
    if (item.tipo !== 'arma' && item.defensa) {
        jugador.armadura += item.defensa * multiplier;
    }
}    

function desequiparItem(slot) {
    const item = jugador.equipo[slot];
    if (!item) return;

    console.log(`[DEBUG] Desequipando: ${item.nombre} de slot ${slot}`); 

    aplicarBonificacionesItem(item, 'remove');
    jugador.inventario.push(item);
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

            // Añadir evento para desequipar
            slotElement.onclick = () => desequiparItem(slot);
        } else {
            // Limpiar eventos si no hay item
            slotElement.onclick = null;
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

function usarCombate() {
    if (jugador.combatesDisponibles > 0) {
        jugador.combatesDisponibles--;
        localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
        localStorage.setItem('ultimoCombate', new Date().getTime().toString());
        
        actualizarCombatesUI(); // Esto iniciará el temporizador automáticamente
        
        // Elimina este setTimeout ya que actualizarCombatesUI() ahora se maneja sola
        // if (jugador.combatesDisponibles < jugador.combatesMaximos) {
        //    setTimeout(actualizarCombatesUI, jugador.tiempoRecarga);
        // }
        
        return true;
    }
    return false;
}


// --- FUNCIONES DE INTERFAZ ---
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.add('activa');
    
    // Si la sección es "misiones", activar el filtro "Todas" por defecto
    if (seccionId === 'misiones') {
        // Remover la clase "activo" de todos los botones de filtro
        document.querySelectorAll('.filtros-misiones button').forEach(btn => {
            btn.classList.remove('activo');
        });
        
        // Activar el botón "Todas"
        const btnTodas = document.querySelector('.filtros-misiones button[onclick*="filtrarMisiones(\'todas\')"]');
        if (btnTodas) {
            btnTodas.classList.add('activo');
        }
        
        // Mostrar todas las misiones
        actualizarMisionesUI('todas');
    }
    
    // Reiniciar combate si se abre la sección de combate
    if (seccionId === 'combate') {
        enCombate = false;
        enemigosActuales = [];
        actualizarEnemigosUI();
        document.getElementById("log-combate").textContent = "Selecciona una ubicación para comenzar el combate";
    }

    if (seccionId === 'fabrica') {
        actualizarRecursosUI();
        actualizarColaProduccionUI();
        filtrarRecetas('todas');
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
    document.getElementById("rubies-value").textContent = jugador.rubies;
    document.querySelector("button[onclick='comprarCombate()']").disabled = jugador.rubies < 1;
    document.getElementById("oro-entrenamiento-value").textContent = jugador.oro;

    // Calcular daño total
    let danoMinTotal = 2;
    let danoMaxTotal = 2;
    
    Object.values(jugador.equipo).forEach(item => {
        if (item && item.tipo === 'arma') {
            danoMinTotal += item.danoMin;
            danoMaxTotal += item.danoMax;
        }
    });
    
    danoMinTotal += jugador.statsBase.fuerza;
    danoMaxTotal += jugador.statsBase.fuerza;
    
    document.getElementById("dano-value").textContent = `${danoMinTotal}-${danoMaxTotal}`;
    
    // Stats generales (se mantienen igual)
    document.getElementById("fuerza-value").textContent = jugador.statsBase.fuerza;
    document.getElementById("habilidad-value").textContent = jugador.statsBase.habilidad;
    document.getElementById("agilidad-value").textContent = jugador.statsBase.agilidad;
    document.getElementById("constitucion-value").textContent = jugador.statsBase.constitucion;
    document.getElementById("carisma-value").textContent = jugador.statsBase.carisma;
    document.getElementById("inteligencia-value").textContent = jugador.statsBase.inteligencia;
    
    // --- NUEVA SECCIÓN DE ENTRENAMIENTO MODIFICADA ---
  
    // Calcular bonos de items
    const bonosItems = {
        fuerza: 0,
        habilidad: 0,
        agilidad: 0,
        constitucion: 0,
        carisma: 0,
        inteligencia: 0
    };

    // Sumar bonos de items equipados
    Object.values(jugador.equipo).forEach(item => {
        if (item) {
            Object.entries(item).forEach(([key, val]) => {
                if (['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key)) {
                    bonosItems[key] += val;
                }
            });
        }
    });

    // Actualizar UI para cada stat
    const stats = ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'];
    stats.forEach(stat => {
        const base = jugador.statsBase[stat] - bonosItems[stat]; // Valor base sin items
        document.getElementById(`${stat}-total`).textContent = jugador.statsBase[stat]; // Total
        document.getElementById(`${stat}-base`).textContent = base; // Base
        document.getElementById(`${stat}-item`).textContent = `+${bonosItems[stat]}`; // Bonus items
        // document.getElementById(`${stat}-max`).textContent = jugador.statsMaximos[stat]; // Máximo
    });
    // --- FIN DE SECCIÓN MODIFICADA ---
    
    // Resto de funciones (se mantienen igual)
    actualizarInventarioUI();
    actualizarVestuarioUI();
    actualizarUbicacionesUI();
    
    // localStorage.setItem('gladiatusSave', JSON.stringify(jugador));

    if (jugador.vida >= jugador.vidaMax && jugador.intervaloCuracion) {
        clearInterval(jugador.intervaloCuracion);
        document.getElementById("curacion-timer").textContent = "Completo";
    }
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
        // Verificar que la ubicación existe
        if (!ubicaciones[nombreUbicacion]) {
            console.error("Ubicación no encontrada:", nombreUbicacion);
            return;
        }
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
        fuerza: Math.floor(enemigo.fuerza * factorEscala),
        habilidad: Math.floor(enemigo.habilidad * factorEscala),
        agilidad: Math.floor(enemigo.agilidad * factorEscala),
        constitucion: Math.floor(enemigo.constitucion * factorEscala),
        carisma: Math.floor(enemigo.carisma * factorEscala),
        inteligencia: Math.floor(enemigo.inteligencia * factorEscala),
        oro: Math.floor(enemigo.oro * factorEscala),
        exp: Math.floor(enemigo.exp * factorEscala),
        derrotado: false
    };
});

        // Iniciar combate con estos enemigos (sin descontar combate todavía)
        enemigosActuales = [...enemigosEscalados];
        enCombate = true;
        ubicacionActual = nombreUbicacion;
        actualizarEnemigosUI();
        document.getElementById("log-combate").textContent = 
            `Explorando ${nombreUbicacion} (Nivel ${ubicacion.niveles[0]}-${ubicacion.niveles[1]})... ¡Selecciona un enemigo para atacar!`;
        actualizarCombatesUI();
        actualizarProgresoMisiones('visitarUbicacion', 1);
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
            <h3>${enemigo.nombre} (Nv. ${enemigo.nivel[0]}-${enemigo.nivel[1]})</h3>
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

    // Al final del ataque exitoso:
    tiempoUltimoAtaque = ahora;
    puedeAtacar = false;
    
    // Mostrar el temporizador
    mostrarTemporizadorEspera();
    
    // Permitir atacar de nuevo cuando termine el tiempo
    setTimeout(() => {
        puedeAtacar = true;
        // El mensaje ya lo muestra mostrarTemporizadorEspera()
    }, tiempoEsperaCombate);

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

function mostrarTemporizadorEspera() {
    const contadorElement = document.getElementById("contador-espera");
    const barraElement = document.getElementById("barra-espera");
    const contenedor = document.getElementById("temporizador-espera");
    
    if (!contadorElement || !barraElement) return;
    
    const ahora = Date.now();
    const tiempoRestante = tiempoEsperaCombate - (ahora - tiempoUltimoAtaque);
    const segundos = Math.ceil(tiempoRestante / 1000);
    
    if (tiempoRestante > 0) {
        // Temporizador en progreso
        contenedor.classList.remove("temporizador-finalizado");
        contadorElement.textContent = segundos;
        barraElement.value = segundos;
        setTimeout(mostrarTemporizadorEspera, 1000);
    } else {
        // Temporizador finalizado
        contenedor.classList.add("temporizador-finalizado");
        contadorElement.textContent = "0";
        barraElement.value = 0;
        
        // Opcional: Efecto de sonido
        if (typeof audioAtacarYa !== 'undefined') {
            audioAtacarYa.play().catch(e => console.log("Audio no disponible:", e));
        }
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

function victoria(recibioDaño) {
     let recompensaOro = 0;
     let recompensaExp = 0;
     let itemsObtenidos = [];
    
     // Calcular recompensas de enemigos derrotados
     console.log("Enemigos derrotados:");
     enemigosActuales.forEach(enemigo => {
         if (enemigo.derrotado) {
             console.log(`- ${enemigo.nombre}: Oro=${enemigo.oro}, Exp=${enemigo.exp}`);
             recompensaOro += enemigo.oro;
             recompensaExp += enemigo.exp;
         }
     });
    
     const nivelZona = ubicaciones[ubicacionActual].niveles[0]; // Ahora seguro que existe
     // Aplicar bonus de carisma al oro
     const bonusCarisma = 1 + (jugador.statsBase.carisma * 0.1);
     const oroFinal = Math.floor(recompensaOro * bonusCarisma);
     const oroConBonus = aplicarBonusEvento('oro', oroFinal);
     jugador.oro += oroConBonus;
    
     const expConBonus = aplicarBonusEvento('exp', recompensaExp);
     jugador.exp += expConBonus;
    
    
     // Depuración (opcional)
     console.log(`Oro base: ${recompensaOro} + Bonus carisma (x${bonusCarisma.toFixed(1)}) = ${oroFinal}`);

     // Aplicar recompensas al jugador
     jugador.oro += oroFinal;
     jugador.exp += recompensaExp;
     jugador.victorias++;

     // Generar ítem (20% de probabilidad - solo una vez)
     if (Math.random() <= 0.2) {
         const nivelZona = ubicaciones[ubicacionActual].niveles[0];
         const nuevoItem = generarItemAleatorio(nivelZona);
         jugador.inventario.push(nuevoItem);
         itemsObtenidos.push(nuevoItem);
         console.log("Item obtenido:", nuevoItem);
     }

     // Construir mensaje detallado
     let mensaje = document.getElementById("log-combate").textContent;
     mensaje += `\n\n⚔️ **¡VICTORIA EN ${ubicacionActual.toUpperCase()}!** ⚔️\n`;
     mensaje += `\n▸ 💰 Oro: ${oroFinal} (Bonus carisma: x${bonusCarisma.toFixed(1)})`;
     mensaje += `\n▸ ✨ Experiencia: ${recompensaExp}`;
    
     if (itemsObtenidos.length > 0) {
         mensaje += `\n\n🎁 **¡ITEM OBTENIDO!**`;
         itemsObtenidos.forEach(item => {
             mensaje += `\n▸ ${item.nombre} (${item.descripcion})`;
         });
     } else {
         mensaje += `\n\n🔍 No encontraste items esta vez.`;
     }

     // Actualizar UI y finalizar combate
     document.getElementById("log-combate").textContent = mensaje;
     enCombate = false;
     ubicacionActual = "";
    
     // Verificar subida de nivel
     if (jugador.exp >= jugador.expParaSubir) {
         subirNivel();
     }
    
     actualizarUI();
    
     // Depuración final
     console.log("Estado del jugador:", {
         oro: jugador.oro,
         exp: jugador.exp,
         rubies: jugador.rubies,
         victorias: jugador.victorias
     });

     actualizarProgresoMisiones('enemigo', 1); // Contar enemigos derrotados
     if (!recibioDaño) {
         actualizarProgresoMisiones('enemigoSinDaño', 1); // Para misiones de "sin recibir daño"
     }

     if (itemsObtenidos.length > 0) {
         actualizarProgresoMisiones('conseguirItem', itemsObtenidos.length);
         actualizarProgresoMisiones('conseguirOro');
     }
 }

function derrota() {
    jugador.vida = Math.floor(jugador.vidaMax == 0);
    document.getElementById("log-combate").textContent += "\n\n☠️ Has sido derrotado. Has sido derrotado... ¡Regresa a la ciudad para curarte!";
    enCombate = false;
    ubicacionActual = "";
    actualizarUI();
}

function iniciarCuracion() {
    // Detener cualquier temporizador existente
    if (jugador.intervaloCuracion) {
        clearInterval(jugador.intervaloCuracion);
        jugador.intervaloCuracion = null;
    }

    // Solo iniciar si la vida no está al máximo
    if (jugador.vida < jugador.vidaMax) {
        const ahora = new Date().getTime();
        jugador.ultimaCuracion = ahora;
        
        let tiempoRestante = jugador.tiempoCuracion;
        actualizarTemporizadorUI(tiempoRestante);
        
        jugador.intervaloCuracion = setInterval(() => {
            tiempoRestante -= 1000;
            
            if (tiempoRestante <= 0) {
                aplicarCuracion();
                tiempoRestante = jugador.tiempoCuracion;
                jugador.ultimaCuracion = new Date().getTime();
            }
            
            actualizarTemporizadorUI(tiempoRestante);
            
            // Detener si la vida llega al máximo
            if (jugador.vida >= jugador.vidaMax) {
                clearInterval(jugador.intervaloCuracion);
                document.getElementById("curacion-timer").textContent = "Completo";
            }
        }, 1000);
    } else {
        document.getElementById("curacion-timer").textContent = "Completo";
    }
}

function canjearVictorias() {
    if (jugador.victorias >= 10) {
        const confirmar = confirm("¿Deseas canjear 10 victorias por 1 rubí?");
        if (confirmar) {
            jugador.victorias -= 10;
            jugador.rubies += 1;
            actualizarUI();
            alert("¡Canje exitoso! Has obtenido 1 rubí.");
        }
    } else {
        alert("Necesitas al menos 10 victorias para canjear por 1 rubí.");
    }
}

// Añadir esta función para verificar y activar la curación automáticamente
function verificarCuracionAutomatica() {
    if (jugador.vida < jugador.vidaMax && !jugador.intervaloCuracion) {
        iniciarCuracion();
        actualizarProgresoMisiones('canjearVictorias', 1);
    }
}

function actualizarTemporizadorUI(ms) {
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    document.getElementById("curacion-timer").textContent = 
        `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}

function aplicarCuracion() {
    const vidaAnterior = jugador.vida;
    jugador.vida = Math.min(jugador.vidaMax, jugador.vida + jugador.vidaPorCuracion);
    const vidaRecuperada = jugador.vida - vidaAnterior;
    
    if (vidaRecuperada > 0) {
        document.getElementById("log-combate").textContent = 
            `💚 Recuperaste ${vidaRecuperada} vida (curación automática cada 2 minutos).`;
        actualizarUI();
    }
}

function forzarCuracion() {
    // Verificar si ya está al máximo
    if (jugador.vida >= jugador.vidaMax) {
        document.getElementById("log-combate").textContent = "💚 Ya estás al máximo de vida.";
        return;
    }
    
    // Reiniciar el temporizador
    iniciarCuracion();
    document.getElementById("log-combate").textContent = 
        "⏳ Temporizador de curación reiniciado. La próxima curación será en 2 minutos.";
}

// --- SISTEMA DE ENTRENAMIENTO ---
function subirNivel() {
    jugador.nivel++;
    jugador.exp = 0;
    jugador.expParaSubir = Math.floor(jugador.expParaSubir * 1.5);
    jugador.vidaMax += 20 + (jugador.statsBase.constitucion * 2);
    jugador.vida = jugador.vidaMax;
    
    if (jugador.nivel % 2 === 0) {
        Object.keys(jugador.statsMaximos).forEach(stat => {
            jugador.statsMaximos[stat]++;
        });
    }
    
    alert(`¡Subiste al nivel ${jugador.nivel}! +${20 + (jugador.statsBase.constitucion * 2)} de vida máxima.`);
    
    // Actualizar misiones de nivel
    actualizarProgresoMisiones('nivel');
    
    actualizarUI();
}

function mejorarStat(stat) {
    const mejorasActuales = jugador.mejorasStats[stat];
    const costoBase = jugador.costosEntrenamiento[stat];
    const costo = costoBase + (mejorasActuales * costoBase); // Ej: 25, 50, 75... o 50, 100, 150...
    
    if (jugador.oro < costo) {
        alert(`Necesitas ${costo} oro (tienes ${jugador.oro})`);
        return;
    }
    
    if (jugador.statsBase[stat] >= jugador.statsMaximos[stat]) {
        alert(`¡Máximo alcanzado (${jugador.statsMaximos[stat]})!`);
        return;
    }
    
    // Aplicar la mejora
    jugador.statsBase[stat]++;
    jugador.mejorasStats[stat]++;
    jugador.oro -= costo;
    
    // Bonus de constitución
    if (stat === 'constitucion') {
        const vidaExtra = 5;
        jugador.vidaMax += vidaExtra;
        jugador.vida += vidaExtra;
    }
    
    // Actualizar el botón con el NUEVO costo (importante: mejorasActuales + 1)
    const proximoCosto = costoBase + ((mejorasActuales + 1) * costoBase);
    actualizarBotonStat(stat, proximoCosto); // <-- Esta línea es clave
    
    actualizarUI();
    verificarCuracionAutomatica();
    actualizarProgresoMisiones('mejorarStat', 1, stat);
}

function actualizarBotonStat(stat, costo) {
    // Buscar directamente por el atributo data-stat (más eficiente y seguro)
    const boton = document.querySelector(`button[data-stat="${stat}"]`);
    
    if (boton) {
        boton.innerHTML = `+${costo} oro <small>(1 Punto)</small>`;
        boton.onclick = function() { mejorarStat(stat); };
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

// --- INICIALIZACIÓN ---
function cargarJuego() {
    // const datosGuardados = localStorage.getItem('gladiatusSave');
    // if (datosGuardados) {
    //     const datos = JSON.parse(datosGuardados);
    //     Object.assign(jugador, datos);
    //     // Inicializar rubies si no existen en los datos guardados
    //     if (jugador.rubies === undefined) {
    //         jugador.rubies = 0;
    //     }
    // }

    // // Verificar si hay un usuario logueado
    // const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    // if (!usuarioActual) {
    //     mostrarSeccion('cuenta');
    //     return;
    // }

    // Iniciar el sistema de curación
    iniciarCuracion();

    // Generar algunos items iniciales para prueba
    if (jugador.inventario.length === 0) {
        const espadaInicial = {
            id: 1,
            nombre: "Espada de madera",
            tipo: "arma",
            danoMin: 2,
            danoMax: 4,
            defensa: 0,
            img: "ropa/espada.png",
            descripcion: "Daño: 2-4",
            precio: 30
        };

        const escudoInicial = {
            id: 2,
            nombre: "Escudo de madera",
            tipo: "escudo",
            danoMin: 0,
            danoMax: 0,
            defensa: 3,
            img: "ropa/escudo.png",
            descripcion: "Defensa: +3",
            precio: 45
        };       
    
        jugador.inventario.push(espadaInicial, escudoInicial);
        equiparItem(1); // Equipar espada
        equiparItem(2); // Equipar escudo       
    }
    
    cargarCombates();
    actualizarUI();
    actualizarCombatesUI();
    verificarCuracionAutomatica();

    // Actualizar botones de entrenamiento al inicio
    Object.keys(jugador.mejorasStats).forEach(stat => {
        const costoBase = jugador.costosEntrenamiento[stat];
        const proximoCosto = costoBase + (jugador.mejorasStats[stat] * costoBase); // Usar costoBase en lugar de 50
        actualizarBotonStat(stat, proximoCosto);
    });

    reiniciarMisiones(); // <-- Reemplazar reiniciarMisionesDiarias() por esto
    actualizarMisionesUI('todas');
    iniciarEventosProgramados();
    if (jugador.fabrica.colaProduccion.length > 0) {
        actualizarProduccion();
    actualizarProgresoMisiones('nivel');
    }
}

function actualizarMisionesUI(filtro = 'todas') {
    const lista = document.getElementById("lista-misiones");
    lista.innerHTML = "";

    let misionesMostrar = [];
    
    // Filtrar misiones basadas en el tipo y si han sido reclamadas
    if (filtro === 'diarias') {
        misionesMostrar = [...jugador.misiones.diarias].filter(m => !(m.completada && m.reclamada));
    } else if (filtro === 'historia') {
        misionesMostrar = [...jugador.misiones.historia].filter(m => !(m.completada && m.reclamada));
    } else if (filtro === 'fabrica') {
        misionesMostrar = [...jugador.misiones.fabrica].filter(m => !(m.completada && m.reclamada));
    } else {
        misionesMostrar = [
            ...jugador.misiones.diarias,
            ...jugador.misiones.historia,
            ...jugador.misiones.fabrica
        ].filter(m => !(m.completada && m.reclamada));
    }

    if (misionesMostrar.length === 0) {
        lista.innerHTML = `
            <div class="sin-misiones">
                <img src="img/misiones-vacias.png" alt="No hay misiones">
                <p>No hay misiones disponibles</p>
                ${filtro === 'diarias' ? '<small>Las misiones diarias se reinician cada 24 horas</small>' : ''}
            </div>
        `;
        return;
    }

    misionesMostrar.forEach(mision => {
        const porcentaje = Math.min(100, (mision.progreso / mision.requerido) * 100);
        const card = document.createElement("div");
        card.className = `mision-card ${mision.completada ? 'completada' : ''}`;
        card.id = `mision-${mision.id}`;
        
        // Destacar recompensas importantes
        const recompensaHTML = `
            <div class="recompensas">
                ${mision.recompensa.oro ? `<span class="recompensa oro">💰 ${mision.recompensa.oro}</span>` : ''}
                ${mision.recompensa.exp ? `<span class="recompensa exp">✨ ${mision.recompensa.exp}</span>` : ''}
                ${mision.recompensa.rubies ? `<span class="recompensa rubi">💎 ${mision.recompensa.rubies}</span>` : ''}
                ${mision.recompensa.item ? `<span class="recompensa item">🎁 Item especial</span>` : ''}
            </div>
        `;

        card.innerHTML = `
            <div class="mision-header">
                <h3>${mision.titulo}</h3>
                <span class="mision-tipo ${mision.tipo}">${mision.tipo === 'diaria' ? 'Diaria' : 'Historia'}</span>
            </div>
            <p class="mision-desc">${mision.descripcion}</p>
            <div class="mision-progreso">
                <div style="width: ${porcentaje}%"></div>
                <span>${mision.progreso}/${mision.requerido}</span>
            </div>
            ${recompensaHTML}
            ${mision.completada ? 
                '<button class="btn-reclamar" onclick="reclamarRecompensa(' + mision.id + ')">Reclamar Recompensa</button>' : 
                ''}
        `;
        lista.appendChild(card);
    });
}

function filtrarMisiones(filtro) {
    document.querySelectorAll(".filtros-misiones button").forEach(btn => {
        btn.classList.remove("activo");
    });
    event.target.classList.add("activo");
    actualizarMisionesUI(filtro);
}

function reclamarRecompensa(id) {
    let mision = jugador.misiones.diarias.find(m => m.id === id) || 
                 jugador.misiones.historia.find(m => m.id === id) ||
                 jugador.misiones.fabrica.find(m => m.id === id);
    
    if (!mision || !mision.completada) return;

    // Dar recompensas
    if (mision.recompensa.oro) jugador.oro += mision.recompensa.oro;
    if (mision.recompensa.exp) {
        jugador.exp += mision.recompensa.exp;
        if (jugador.exp >= jugador.expParaSubir) {
            subirNivel();
        }
    }
    if (mision.recompensa.rubies) jugador.rubies += mision.recompensa.rubies;
    if (mision.recompensa.item) {
        const item = generarItemAleatorio(jugador.nivel);
        jugador.inventario.push(item);
    }

     // Manejar recompensa de receta para misiones de fábrica
     if (mision.recompensa.receta) {
        if (!jugador.fabrica.recetasDesbloqueadas.includes(mision.recompensa.receta)) {
            jugador.fabrica.recetasDesbloqueadas.push(mision.recompensa.receta);
            alert(`¡Has desbloqueado la receta para ${recetasFabrica.find(r => r.id === mision.recompensa.receta).nombre}!`);
        }
    }

    if (jugador.inventario.length >= MAX_INVENTARIO) {
        alert("¡Inventario lleno! No puedes recibir más items.");
        return;
    }

    if (mision.recompensa.oro) {
        const oroConBonus = aplicarBonusEvento('oro', mision.recompensa.oro);
        jugador.oro += oroConBonus;
    }
    if (mision.recompensa.exp) {
        const expConBonus = aplicarBonusEvento('exp', mision.recompensa.exp);
        jugador.exp += expConBonus;
    }
    if (mision.recompensa.rubies) {
        const rubiesConBonus = aplicarBonusEvento('rubies', mision.recompensa.rubies);
        jugador.rubies += rubiesConBonus;
    }

    // Eliminar misión (solo diarias y fábrica, historia permanece)
    if (mision.tipo === 'diaria') {
        jugador.misiones.diarias = jugador.misiones.diarias.filter(m => m.id !== id);
    } else if (mision.tipo === 'fabrica') {
        jugador.misiones.fabrica = jugador.misiones.fabrica.filter(m => m.id !== id);
    } else {
        mision.reclamada = true;
    }    

    // Actualizar UI
    const filtroActivo = document.querySelector(".filtros-misiones button.activo")?.textContent.toLowerCase() || 'todas';
    actualizarMisionesUI(filtroActivo);
    actualizarUI();
}

function reiniciarMisiones() {
    const ahora = new Date();
    const ultimoReinicioDiarias = localStorage.getItem('ultimoReinicioDiarias');
    const ultimoReinicioHistoria = localStorage.getItem('ultimoReinicioHistoria');

    // Reiniciar misiones diarias cada 24 horas
    if (!ultimoReinicioDiarias || ahora - new Date(ultimoReinicioDiarias) >= 86400000) {
        jugador.misiones.diarias = JSON.parse(JSON.stringify(misiones.diarias));
        localStorage.setItem('ultimoReinicioDiarias', ahora.toString());
    }

    // Reiniciar misiones de historia cada 7 días (604800000 ms)
    if (!ultimoReinicioHistoria || ahora - new Date(ultimoReinicioHistoria) >= 604800000) {
        jugador.misiones.historia = JSON.parse(JSON.stringify(misiones.historia));
        localStorage.setItem('ultimoReinicioHistoria', ahora.toString());
    }
}

function completarMision(mision) {
    if (mision.progreso >= mision.requerido && !mision.completada) {
        mision.completada = true;
        // Efecto visual
        document.getElementById(`mision-${mision.id}`).classList.add('completada-flash');
        setTimeout(() => {
            document.getElementById(`mision-${mision.id}`).classList.remove('completada-flash');
        }, 1000);
        // Notificación
        alert(`¡Misión "${mision.titulo}" completada!`);
    }
}

// --- Funciones para actualizar progreso ---
function actualizarProgresoMisiones(tipo, cantidad = 1, stat = null, ubicacion = null) {
    const todasMisiones = [...jugador.misiones.diarias, ...jugador.misiones.historia];

    todasMisiones.forEach(mision => {
        if (mision.completada) return;

        // Misiones de derrotar enemigos (genéricas o por tipo)
        if (tipo === 'enemigo') {
            if (mision.descripcion.includes("Derrota") && !mision.descripcion.includes("sin recibir daño")) {
                mision.progreso += cantidad;
            }
        }

        // Misiones de derrotar enemigos sin recibir daño
        if (tipo === 'enemigoSinDaño') {
            if (mision.descripcion.includes("sin recibir daño")) {
                mision.progreso += cantidad;
            }
        }

        // Misiones de equipar items
        if (tipo === 'equiparItem') {
            if (mision.descripcion.includes("Equipa")) {
                mision.progreso += cantidad;
            }
        }

        // Misiones de conseguir items
        if (tipo === 'conseguirItem') {
            if (mision.descripcion.includes("Consigue") && mision.descripcion.includes("items")) {
                mision.progreso += cantidad;
            }
        }

        // Misiones de subir de nivel
        if (tipo === 'nivel') {
            if (mision.descripcion.includes("Alcanza el nivel")) {
                // Extraer el nivel requerido de la descripción
                const nivelRequerido = parseInt(mision.descripcion.match(/nivel (\d+)/)[1]);
                
                // Actualizar progreso basado en el nivel actual del jugador
                if (jugador.nivel >= nivelRequerido) {
                    mision.progreso = mision.requerido; // Forzar completado
                } else {
                    mision.progreso = jugador.nivel; // Mostrar progreso actual
                }
                
                // Marcar como completada si se alcanzó el nivel
                if (jugador.nivel >= nivelRequerido && !mision.completada) {
                    mision.completada = true;
                    const card = document.querySelector(`#mision-${mision.id}`);
                    if (card) card.classList.add('completada-flash');
                }
            }
        }

        // Misiones de mejorar atributos
        if (tipo === 'mejorarStat') {
            // Misión: "Mejora cualquier atributo X veces"
            if (mision.descripcion.includes("Mejora cualquier atributo")) {
                mision.progreso += cantidad;
            }
            // Misión: "Mejora un mismo atributo X veces"
            else if (mision.descripcion.includes("Mejora un mismo atributo")) {
                if (!mision.ultimoStat) mision.ultimoStat = stat;
                if (mision.ultimoStat === stat) {
                    mision.progreso += cantidad;
                } else {
                    mision.progreso = 1; // Reiniciar si cambia de stat
                    mision.ultimoStat = stat;
                }
            }
            // Misión: "Lleva un atributo a X puntos"
            else if (mision.descripcion.includes("Lleva un atributo a")) {
                mision.progreso = Math.max(mision.progreso, jugador.statsBase[stat]);
            }
        }

        // Misiones de visitar ubicaciones
        if (tipo === 'visitarUbicacion') {
            if (mision.descripcion.includes("Visita") || mision.descripcion.includes("ubicaciones")) {
                mision.progreso += cantidad;
            }
        }

        // Misiones de conseguir oro
        if (tipo === 'conseguirOro') {
            if (mision.descripcion.includes("Consigue") && mision.descripcion.includes("oro")) {
                mision.progreso = Math.max(mision.progreso, jugador.oro);
            }
        }

        // Misiones de canjear victorias
        if (tipo === 'canjearVictorias') {
            if (mision.descripcion.includes("Canjea victorias")) {
                mision.progreso += cantidad;
            }
        }

        // Verificar si la misión se completó
        if (mision.progreso >= mision.requerido) {
            mision.completada = true;
            const card = document.querySelector(`#mision-${mision.id}`);
            if (card) card.classList.add('completada-flash');
        }
    });

    // Misiones de fábrica
    if (tipo === 'fabricarItem') {
        jugador.misiones.fabrica.forEach(mision => {
            // Misión genérica (ej: "Fabrica 3 items")
            if (mision.descripcion.includes("Fabrica") && mision.descripcion.includes("items")) {
                mision.progreso += cantidad;
            }
            // // Misión específica (ej: "Fabrica 5 armas")
            // else if (mision.descripcion.includes("Fabrica") && subtipo && mision.descripcion.includes(subtipo)) {
            //     mision.progreso += cantidad;
            // }
        });
    }
    
    if (tipo === 'recurso') {
        jugador.misiones.fabrica.forEach(mision => {
            if (mision.descripcion.includes("Consigue") && 
                mision.descripcion.includes("recurso")) {
                mision.progreso += cantidad;
            }
        });
    }

    // Verificar completado para misiones de fábrica
    jugador.misiones.fabrica.forEach(mision => {
        if (mision.progreso >= mision.requerido && !mision.completada) {
            mision.completada = true;
            
            // Aplicar recompensa de receta si existe
            if (mision.recompensa.receta) {
                if (!jugador.fabrica.recetasDesbloqueadas.includes(mision.recompensa.receta)) {
                    jugador.fabrica.recetasDesbloqueadas.push(mision.recompensa.receta);
                    alert(`¡Has desbloqueado una nueva receta!`);
                }
            }
            
            // Efecto visual
            const card = document.querySelector(`#mision-${mision.id}`);
            if (card) card.classList.add('completada-flash');
        }
    });    

    // Actualizar la UI de misiones si estamos en esa sección
    if (document.getElementById('misiones').classList.contains('activa')) {
        const filtroActivo = document.querySelector('.filtros-misiones button.activo')?.textContent.toLowerCase() || 'todas';
        actualizarMisionesUI(filtroActivo);
    }

    // Actualizar toda la UI para reflejar cambios (oro, exp, etc.)
    actualizarUI();
}

function generarItem(recompensa) {
    if (recompensa.item) {
        const nivelItem = Math.floor(
            Math.random() * (recompensa.item.nivelMax - recompensa.item.nivelMin + 1)
        ) + recompensa.item.nivelMin;
        
        return {
            tipo: recompensa.item.tipo,
            nivel: nivelItem,
            rareza: recompensa.item.rareza || "común"
        };
    }
    return null;
}

// --- SISTEMA DE EVENTOS PROGRAMADOS ---
const eventos = {
    lista: [
        {
            id: 1,
            nombre: "¡Fiebre del Oro!",
            descripcion: "Durante este evento, todas las recompensas de oro se duplican.",
            tipo: "oro",
            bonus: 2.0, // Multiplicador de oro
            duracion: 1800000, // 30 minutos en milisegundos
            orden: 1
        },
        {
            id: 2,
            nombre: "¡Auge de rubies!",
            descripcion: "Posibilidad de obtener rubies al completar misiones y derrotar enemigos.",
            tipo: "rubies",
            bonus: 0.3, // Probabilidad de obtener rubies (30%)
            duracion: 1800000,
            orden: 2
        },
        {
            id: 3,
            nombre: "¡Entrenamiento Intensivo!",
            descripcion: "Ganas el doble de experiencia en combates y misiones.",
            tipo: "exp",
            bonus: 2.0, // Multiplicador de experiencia
            duracion: 1800000,
            orden: 3
        },
        {
            id: 4,
            nombre: "¡Bonanza Total!",
            descripcion: "Oro, rubies y experiencia aumentados durante el evento.",
            tipo: "combo",
            bonus: {
                oro: 1.5,
                rubies: 0.2,
                exp: 1.5
            },
            duracion: 1800000,
            orden: 4
        },
        {
            id: 5,
            nombre: "¡Ruleta de la Fortuna!",
            descripcion: "Gira la ruleta para obtener grandes premios o perder algo.",
            tipo: "azar",
            duracion: 1800000,
            orden: 5
        }
    ],
    activo: null,
    temporizador: null,
    ultimoEvento: null,
    intervaloEntreEventos: 259200000 // 3 días en milisegundos (1000 * 60 * 60 * 24 * 3)
};

function iniciarEventosProgramados() {
    // Verificar si ya hay un evento activo
    if (eventos.activo) return;
    
    const ahora = new Date().getTime();
    
    // Cargar último evento desde localStorage
    if (localStorage.getItem('ultimoEvento')) {
        eventos.ultimoEvento = JSON.parse(localStorage.getItem('ultimoEvento'));
    }
    
    // Determinar qué evento toca ahora
    let siguienteEvento;
    
    if (!eventos.ultimoEvento) {
        // Primer evento (Oro)
        siguienteEvento = eventos.lista.find(e => e.orden === 1);
    } else {
        const tiempoDesdeUltimoEvento = ahora - eventos.ultimoEvento.fin;
        
        if (tiempoDesdeUltimoEvento >= eventos.intervaloEntreEventos) {
            // Calcular siguiente evento en el ciclo
            const siguienteOrden = eventos.ultimoEvento.orden % 5 + 1;
            siguienteEvento = eventos.lista.find(e => e.orden === siguienteOrden);
        } else {
            // Programar próximo evento cuando sea el momento
            const tiempoRestante = eventos.intervaloEntreEventos - tiempoDesdeUltimoEvento;
            setTimeout(iniciarEventosProgramados, tiempoRestante);
            return;
        }
    }
    
    // Activar el evento
    activarEvento(siguienteEvento);
    
    // Programar próximo evento
    setTimeout(iniciarEventosProgramados, eventos.intervaloEntreEventos + siguienteEvento.duracion);
}

function activarEvento(evento) {
    eventos.activo = {...evento};
    eventos.activo.inicio = new Date().getTime();
    eventos.activo.fin = eventos.activo.inicio + evento.duracion;
    
    // Guardar en localStorage
    localStorage.setItem('eventoActivo', JSON.stringify(eventos.activo));
    localStorage.setItem('ultimoEvento', JSON.stringify(eventos.activo));
    
    // Mostrar notificación
    mostrarNotificacionEvento(evento);
    
    // Establecer temporizador para finalizar el evento
    eventos.temporizador = setTimeout(() => {
        finalizarEvento();
    }, evento.duracion);
    
    // Actualizar UI
    actualizarEventoUI();
}

function finalizarEvento() {
    if (!eventos.activo) return;
    
    // Mostrar mensaje de finalización
    document.getElementById("log-combate").textContent += `\n\nEl evento "${eventos.activo.nombre}" ha terminado.`;
    
    // Limpiar evento
    eventos.activo = null;
    clearTimeout(eventos.temporizador);
    localStorage.removeItem('eventoActivo');
    
    // Actualizar UI
    actualizarEventoUI();
}

function aplicarBonusEvento(tipo, cantidad) {
    if (!eventos.activo) return cantidad;
    
    switch(eventos.activo.tipo) {
        case 'oro':
            if (tipo === 'oro') return Math.floor(cantidad * eventos.activo.bonus);
            break;
        case 'rubies':
            if (tipo === 'rubies' && Math.random() < eventos.activo.bonus) {
                return cantidad + 1; // +1 rubí adicional con 30% de probabilidad
            }
            break;
        case 'exp':
            if (tipo === 'exp') return Math.floor(cantidad * eventos.activo.bonus);
            break;
        case 'combo':
            if (tipo === 'oro') return Math.floor(cantidad * eventos.activo.bonus.oro);
            if (tipo === 'exp') return Math.floor(cantidad * eventos.activo.bonus.exp);
            if (tipo === 'rubies' && Math.random() < eventos.activo.bonus.rubies) {
                return cantidad + 1; // +1 rubí adicional con 20% de probabilidad
            }
            break;
    }
    
    return cantidad;
}

// Modificar la función mostrarNotificacionEvento
function mostrarNotificacionEvento(evento) {
    let mensaje = `🎉 **EVENTO ESPECIAL: ${evento.nombre.toUpperCase()}** 🎉\n`;
    mensaje += `⏳ Duración: 30 minutos\n\n`;
    mensaje += `${evento.descripcion}\n\n`;
    
    switch(evento.tipo) {
        case 'oro':
            mensaje += `▸ Todas las recompensas de oro ×${evento.bonus}\n`;
            break;
        case 'rubies':
            mensaje += `▸ +${evento.bonus * 100}% de probabilidad de obtener rubies\n`;
            break;
        case 'exp':
            mensaje += `▸ Todas las recompensas de experiencia ×${evento.bonus}\n`;
            break;
        case 'combo':
            mensaje += `▸ Oro ×${evento.bonus.oro}, Exp ×${evento.bonus.exp}\n`;
            mensaje += `▸ +${evento.bonus.rubies * 100}% de probabilidad de rubies\n`;
            break;
        case 'azar':
            mensaje += `▸ Visita la sección de combate para girar la ruleta\n`;
            break;
    }
}

function girarRuleta() {
    if (!eventos.activo || eventos.activo.tipo !== 'azar') {
        alert("No hay un evento de ruleta activo actualmente.");
        return;
    }

    const resultados = [
        { texto: "¡Ganaste 100 de oro!", oro: 100, exp: 0, rubies: 0 },
        { texto: "¡Ganaste 50 de experiencia!", oro: 0, exp: 50, rubies: 0 },
        { texto: "¡Ganaste 1 rubí!", oro: 0, exp: 0, rubies: 1 },
        { texto: "¡Premio mayor! 200 oro + 2 rubies", oro: 200, exp: 0, rubies: 2 },
        { texto: "¡Ganaste 80 de experiencia!", oro: 0, exp: 80, rubies: 0 },
        { texto: "¡Perdiste 50 de oro...", oro: -50, exp: 0, rubies: 0 },
        { texto: "Nada esta vez. Sigue intentando!", oro: 0, exp: 0, rubies: 0 },
        { texto: "¡Ganaste 30 de oro y 30 de experiencia!", oro: 30, exp: 30, rubies: 0 }
    ];

    const resultado = resultados[Math.floor(Math.random() * resultados.length)];
    
    // Aplicar resultados
    if (resultado.oro > 0 || jugador.oro >= Math.abs(resultado.oro)) {
        jugador.oro += resultado.oro;
    }
    jugador.exp += resultado.exp;
    jugador.rubies += resultado.rubies;
    
    // Mostrar resultado
    const ruletaContainer = document.getElementById("ruleta-container");
    ruletaContainer.innerHTML = `
        <div class="resultado-ruleta">
            <h3>${resultado.texto}</h3>
            ${resultado.oro > 0 ? `<p>Oro: +${resultado.oro}</p>` : resultado.oro < 0 ? `<p>Oro: ${resultado.oro}</p>` : ''}
            ${resultado.exp > 0 ? `<p>Experiencia: +${resultado.exp}</p>` : ''}
            ${resultado.rubies > 0 ? `<p>rubies: +${resultado.rubies}</p>` : ''}
            <button onclick="cerrarRuleta()">Cerrar</button>
        </div>
    `;
    
    actualizarUI();
}

function cerrarRuleta() {
    document.getElementById("ruleta-container").innerHTML = '';
}

function actualizarEventoUI() {
    const container = document.getElementById("evento-activo-container");
    const info = document.getElementById("evento-activo-info");
    const timer = document.getElementById("evento-timer");
    const btnRuletaContainer = document.getElementById("btn-ruleta-container");

    // Limpiar contenedores
    if (info) info.innerHTML = '';
    if (timer) timer.textContent = '';
    
    // Si hay un evento activo
    if (eventos.activo) {
        // Mostrar el panel del evento
        container.style.display = "block";
        
        // Configurar la información del evento
        info.innerHTML = `
            <h3>${eventos.activo.nombre}</h3>
            <p>${eventos.activo.descripcion}</p>
            <div class="beneficios-evento">
                ${obtenerBeneficiosEventoHTML(eventos.activo)}
            </div>
        `;
        
        // Configurar el temporizador
        const ahora = new Date().getTime();
        const finEvento = eventos.activo.inicio + eventos.activo.duracion;
        const tiempoRestante = finEvento - ahora;
        
        // Si el evento aún no ha terminado
        if (tiempoRestante > 0) {
            // Actualizar el temporizador inmediatamente
            actualizarTemporizadorEvento(tiempoRestante);
            
            // Actualizar el temporizador cada segundo
            if (eventos.temporizadorUI) {
                clearInterval(eventos.temporizadorUI);
            }
            
            eventos.temporizadorUI = setInterval(() => {
                const ahora = new Date().getTime();
                const tiempoRestante = finEvento - ahora;
                
                if (tiempoRestante <= 0) {
                    clearInterval(eventos.temporizadorUI);
                    timer.textContent = "Evento terminado";
                    return;
                }
                
                actualizarTemporizadorEvento(tiempoRestante);
            }, 1000);
            
            // Mostrar botón de ruleta si es el evento de azar
            if (eventos.activo.tipo === 'azar' && btnRuletaContainer) {
                btnRuletaContainer.innerHTML = `
                    <button class="btn-ruleta" onclick="girarRuleta()">
                        🎡 Girar Ruleta
                    </button>
                `;
            }
        } else {
            timer.textContent = "Evento terminado";
            if (btnRuletaContainer) btnRuletaContainer.innerHTML = '';
        }
    } else {
        // No hay evento activo, ocultar el panel
        container.style.display = "none";
        if (btnRuletaContainer) btnRuletaContainer.innerHTML = '';
        
        // Limpiar temporizador UI si existe
        if (eventos.temporizadorUI) {
            clearInterval(eventos.temporizadorUI);
            eventos.temporizadorUI = null;
        }
    }
}

// Función auxiliar para actualizar el temporizador
function actualizarTemporizadorEvento(tiempoRestante) {
    const timer = document.getElementById("evento-timer");
    if (!timer) return;
    
    const minutos = Math.floor(tiempoRestante / 60000);
    const segundos = Math.floor((tiempoRestante % 60000) / 1000);
    
    timer.innerHTML = `
        <strong>Tiempo restante:</strong> 
        ${minutos}:${segundos < 10 ? '0' : ''}${segundos}
    `;
}

// Función auxiliar para obtener los beneficios del evento en HTML
function obtenerBeneficiosEventoHTML(evento) {
    switch(evento.tipo) {
        case 'oro':
            return `<p>💰 <strong>Oro ×${evento.bonus}</strong></p>`;
        case 'rubies':
            return `<p>💎 <strong>+${evento.bonus * 100}% rubies</strong></p>`;
        case 'exp':
            return `<p>✨ <strong>Experiencia ×${evento.bonus}</strong></p>`;
        case 'combo':
            return `
                <p>💰 <strong>Oro ×${evento.bonus.oro}</strong></p>
                <p>✨ <strong>Experiencia ×${evento.bonus.exp}</strong></p>
                <p>💎 <strong>+${evento.bonus.rubies * 100}% rubies</strong></p>
            `;
        case 'azar':
            return `<p>🎡 <strong>Gira la ruleta para premios especiales</strong></p>`;
        default:
            return '';
    }
}

function probarEvento(idEvento) {
    const evento = eventos.lista.find(e => e.id === idEvento);
    if (evento) {
        activarEvento(evento);
    } else {
        console.error("Evento no encontrado. IDs disponibles:", eventos.lista.map(e => e.id));
    }
}

const eventosActivos = [
    {
        id: 1,
        nombre: "¡Fiebre del Oro!",
        descripcion: "Todas las recompensas de oro se duplican",
        tipo: "oro",
        bonus: 2.0,
        icono: "💰",
        activo: false
    },
    {
        id: 2,
        nombre: "¡Auge de rubies!",
        descripcion: "30% de probabilidad de obtener rubies adicionales",
        tipo: "rubies",
        bonus: 0.3,
        icono: "💎",
        activo: false
    },
    {
        id: 3,
        nombre: "¡Entrenamiento Intensivo!",
        descripcion: "Doble experiencia en combates",
        tipo: "exp",
        bonus: 2.0,
        icono: "✨",
        activo: false
    },
    {
        id: 4,
        nombre: "¡Bonanza Total!",
        descripcion: "Oro +50%, EXP +50% y 20% de rubies",
        tipo: "combo",
        bonus: {
            oro: 1.5,
            exp: 1.5,
            rubies: 0.2
        },
        icono: "🌟",
        activo: false
    },
    {
        id: 5,
        nombre: "¡Ruleta de la Fortuna!",
        descripcion: "Gira para obtener premios o penalizaciones",
        tipo: "azar",
        icono: "🎰",
        activo: false,
        premios: [
            { tipo: "oro", cantidad: 200 },
            { tipo: "rubies", cantidad: 3 },
            { tipo: "item", rareza: "raro" },
            { tipo: "penalizacion", texto: "Pierdes 50 de oro" }
        ]
    }
];

    // Sistema de rotación automática
    let ultimoCambioEvento = localStorage.getItem('ultimoCambioEvento') || 0;
    const TIEMPO_ROTACION = 3 * 24 * 60 * 60 * 1000; // 3 días en milisegundos

function rotarEvento() {
    const ahora = Date.now();
    
    // Si pasaron 3 días desde el último cambio
    if (ahora - ultimoCambioEvento >= TIEMPO_ROTACION) {
        // Desactivar todos los eventos primero
        eventosActivos.forEach(e => e.activo = false);
        
        // Seleccionar evento aleatorio (excepto el último activo para evitar repeticiones)
        const eventosDisponibles = eventosActivos.filter(e => !e.activo);
        const eventoAleatorio = eventosDisponibles[Math.floor(Math.random() * eventosDisponibles.length)];
        
        eventoAleatorio.activo = true;
        ultimoCambioEvento = ahora;
        localStorage.setItem('ultimoCambioEvento', ultimoCambioEvento);
        
        console.log(`Nuevo evento activado: ${eventoAleatorio.nombre}`);
        
        // Desactivar automáticamente después de 24 horas
        setTimeout(() => {
            eventoAleatorio.activo = false;
            console.log(`Evento ${eventoAleatorio.nombre} desactivado`);
        }, 24 * 60 * 60 * 1000);
    }
}

// Verificar al iniciar el juego
rotarEvento();
// Verificar cada hora por si pasaron los 3 días
setInterval(rotarEvento, 60 * 60 * 1000);

function aplicarBonus(recompensa) {
    let modificada = {...recompensa};
    
    eventosActivos.filter(e => e.activo).forEach(evento => {
        switch(evento.tipo) {
            case "oro":
                modificada.oro = Math.floor(modificada.oro * evento.bonus);
                break;
            case "exp":
                modificada.exp = Math.floor(modificada.exp * evento.bonus);
                break;
            case "rubies":
                if (Math.random() < evento.bonus) modificada.rubies = (modificada.rubies || 0) + 1;
                break;
            case "combo":
                modificada.oro = Math.floor(modificada.oro * evento.bonus.oro);
                modificada.exp = Math.floor(modificada.exp * evento.bonus.exp);
                if (Math.random() < evento.bonus.rubies) modificada.rubies = (modificada.rubies || 0) + 1;
                break;
        }
    });
    
    return modificada;
}

function actualizarUIEvento() {
    const evento = eventosActivos.find(e => e.activo);
    const contenedor = document.getElementById("evento-activo");
    
    if (evento) {
        contenedor.innerHTML = `
            <div class="evento-banner" style="border-color: ${getColorPorTipo(evento.tipo)}">
                <span>${evento.icono} EVENTO ACTIVO</span>
                <h3>${evento.nombre}</h3>
                <p>${evento.descripcion}</p>
                ${evento.tipo === "azar" ? 
                    '<button onclick="girarRuleta()">GIRAR RUELTA</button>' : 
                    '<small>Disponible por 24 horas</small>'
                }
            </div>
        `;
    } else {
        const tiempoRestante = TIEMPO_ROTACION - (Date.now() - ultimoCambioEvento);
        const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        contenedor.innerHTML = `<p>Próximo evento en ${horas} horas</p>`;
    }
}

// Funciones auxiliares:
function chanceItemConEvento() {
    const baseChance = 0.2; // 20% base
    const eventoItems = eventosActivos.find(e => e.activo && e.tipo === "items");
    return eventoItems ? baseChance * eventoItems.bonus : baseChance;
}

function calcularRubiesConEvento() {
    const baseChance = 0.1; // 10% base
    let chance = baseChance;
    
    eventosActivos.filter(e => e.activo).forEach(evento => {
        if (evento.tipo === "rubies") chance += evento.bonus;
        if (evento.tipo === "combo") chance += evento.bonus.rubies;
    });
    
    return Math.random() < chance ? 1 : 0;
}

function aplicarBonificacionesEvento(recompensa) {
    const modificada = {...recompensa};
    
    eventosActivos.filter(e => e.activo).forEach(evento => {
        switch(evento.tipo) {
            case "oro":
                modificada.oro = Math.floor(modificada.oro * evento.bonus);
                break;
            case "exp":
                modificada.exp = Math.floor(modificada.exp * evento.bonus);
                break;
            case "combo":
                if (evento.bonus.oro) modificada.oro = Math.floor(modificada.oro * evento.bonus.oro);
                if (evento.bonus.exp) modificada.exp = Math.floor(modificada.exp * evento.bonus.exp);
                break;
        }
    });
    
    return modificada;
}

function usarPocion(pocion) {
    // Calcular la cantidad de curación basada en porcentaje de vida máxima
    const cantidadCuracion = Math.floor(jugador.vidaMax * pocion.curacion);
    
    // Calcular cuánta vida se puede recuperar (sin exceder el máximo)
    const vidaRecuperada = Math.min(jugador.vidaMax - jugador.vida, cantidadCuracion);
    
    // Verificar si realmente necesita curación
    if (vidaRecuperada <= 0) {
        const logCombate = document.getElementById("log-combate");
        logCombate.textContent = `💚 No necesitas usar ${pocion.nombre}. Ya tienes la vida al máximo (${jugador.vida}/${jugador.vidaMax}).` + 
            (logCombate.textContent ? `\n\n${logCombate.textContent}` : '');
        return;
    }
    
    // Aplicar la curación
    jugador.vida += vidaRecuperada;
    
    // Eliminar la poción del inventario
    const index = jugador.inventario.findIndex(i => i.id === pocion.id);
    if (index !== -1) {
        jugador.inventario.splice(index, 1);
    }
    
    // Mostrar mensaje
    const porcentajeCurado = (pocion.curacion * 100).toFixed(0);
    const logCombate = document.getElementById("log-combate");
    logCombate.textContent = `💚 Has usado ${pocion.nombre} y recuperado ${vidaRecuperada} vida (${porcentajeCurado}% de tu vida máxima).` + 
        (logCombate.textContent ? `\n\n${logCombate.textContent}` : '');
    
    // Actualizar la UI
    actualizarUI();
    
    // Detener la curación automática si estamos al máximo
    if (jugador.vida >= jugador.vidaMax && jugador.intervaloCuracion) {
        clearInterval(jugador.intervaloCuracion);
        document.getElementById("curacion-timer").textContent = "Completo";
    }
}

window.addEventListener('load', cargarJuego);
// window.addEventListener('beforeunload', () => {
//     localStorage.setItem('gladiatusSave', JSON.stringify(jugador));
// });
