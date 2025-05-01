// Configuración inicial de la tienda
const tienda = {
    itemsDisponibles: [],
    precioMultiplier: 1.2,
    tiempoProximosBienes: 0,
    rebajaActiva: false
};

// Constantes
const TIEMPO_ACTUALIZACION_TIENDA = 6 * 60 * 60 * 1000; // 6 horas

// Sistema de Arena PvP (versión mejorada)
// Variables globales para la arena
const arena = {
    ranking: [],
    puntosBaseOponente: 1000,
    rangoPuntos: 150,
    combatesDiarios: 5,
    combatesRestantes: 5,
    ultimoCombatePvP: 0,
    tiempoEsperaArena: 30000, // 30 segundos
    modificadorNivel: 0.05,
    puntosPorVictoria: 20,
    minPuntosGanados: 10,
    maxPuntosGanados: 50,
    puntosPorDerrota: 15,
    totalCombates: 0,
    totalVictorias: 0,
    rachaVictorias: 0,
    mayorRacha: 0,
    historial: []
};

let oponenteSeleccionado = null;
let enCombatePvP = false;

// Función para inicializar la arena
function inicializarArena() {
    cargarRankingArena();
    actualizarListaOponentes();
    verificarRecargaCombates();
}

// Constantes del juego
const MAX_INVENTARIO = 30;
// --- DATOS DEL JUEGO ---
const jugador = {
    nombre: "Ovak",
    nivel: 1,
    exp: 0,
    expParaSubir: 100,
    oro: 50,
    rubies: 0,  // Nueva propiedad
    victorias: 0,
    familia: "Sin clan",
    danoMin: 2,
    danoMax: 2,

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
        // Armadura
        casco: null,
        pechera: null,
        guantes: null,
        botas: null,
        escudo: null,
        
        // Arma (único slot para todas las armas)
        arma: null,
        
        // Accesorios
        anillo1: null,
        anillo2: null,
        amuleto: null
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

const afijos = {
    prefijos: [
      // ====== OFENSIVOS ======
      { nombre: "Siniestro", efecto: { danoMin: 5, danoMax: 8 }, tipos: ["arma", "hacha", "arco", "baculo"], peso: 15 },
      { nombre: "Sangriento", efecto: { critico: 0.10 }, tipos: ["arma", "hacha"], peso: 10 },
      { nombre: "Pesado", efecto: { danoMin: 10, velocidadAtaque: -0.05 }, tipos: ["arma", "hacha"], peso: 8 },
      { nombre: "Ágil", efecto: { danoMax: 7, evasion: 0.08 }, tipos: ["arma", "arco"], peso: 12 },
      { nombre: "Mágico", efecto: { inteligencia: 5, danoMin: 3 }, tipos: ["baculo", "anillo"], peso: 10 },
      { nombre: "Letal", efecto: { danoCritico: 0.15, precision: -5 }, tipos: ["arma"], peso: 5 },
      { nombre: "Voraz", efecto: { roboVida: 0.03 }, tipos: ["arma", "hacha"], peso: 7 },
      { nombre: "Cazador", efecto: { danoAnimales: 0.20 }, tipos: ["arma", "arco"], peso: 10 },
      { nombre: "Gélido", efecto: { ralentizar: 0.10 }, tipos: ["arma", "baculo"], peso: 8 },
      { nombre: "Ígneo", efecto: { danoFuego: 12 }, tipos: ["arma", "hacha"], peso: 8 },
      
      // ====== DEFENSIVOS ======
      { nombre: "Fortificado", efecto: { defensa: 12, movimiento: -0.03 }, tipos: ["armadura", "escudo"], peso: 15 },
      { nombre: "Vigilante", efecto: { evasion: 0.12 }, tipos: ["armadura", "botas"], peso: 10 },
      { nombre: "Divino", efecto: { resistenciaMagica: 0.15 }, tipos: ["armadura", "amuleto"], peso: 8 },
      { nombre: "Regenerador", efecto: { regeneracionVida: 0.02 }, tipos: ["armadura", "anillo"], peso: 10 },
      { nombre: "Impenetrable", efecto: { bloqueo: 0.25 }, tipos: ["escudo"], peso: 5 },
      
      // ====== HÍBRIDOS ======
      { nombre: "Maestro", efecto: { fuerza: 3, habilidad: 3 }, tipos: ["arma", "guantes"], peso: 7 },
      { nombre: "Sabio", efecto: { inteligencia: 4, manaMax: 0.10 }, tipos: ["baculo", "amuleto"], peso: 8 }
    ],
    
    sufijos: [
      // ====== UTILIDAD ======
      { nombre: "del Abismo", efecto: { vidaMax: 0.10 }, tipos: ["armadura", "accesorio"], peso: 12 },
      { nombre: "del Dragón", efecto: { resistenciaFuego: 0.25 }, tipos: ["armadura", "escudo"], peso: 8 },
      { nombre: "del Zorro", efecto: { evasion: 0.15, roboOro: 0.05 }, tipos: ["botas", "amuleto"], peso: 10 },
      { nombre: "del Gigante", efecto: { fuerza: 5, velocidadAtaque: -0.07 }, tipos: ["armadura", "arma"], peso: 7 },
      { nombre: "del Fénix", efecto: { regeneracionVida: 0.04, resistenciaFuego: 0.20 }, tipos: ["armadura", "anillo"], peso: 5 },
      
      // ====== ESPECIALIZADOS ======
      { nombre: "de la Tormenta", efecto: { velocidadAtaque: 0.10 }, tipos: ["arma", "guantes"], peso: 10 },
      { nombre: "del Berserker", efecto: { danoMin: 8, defensa: -5 }, tipos: ["arma", "hacha"], peso: 6 },
      { nombre: "del Arquero", efecto: { precision: 15, danoMax: 5 }, tipos: ["arco"], peso: 8 },
      { nombre: "del Mago", efecto: { inteligencia: 6, manaRegen: 0.03 }, tipos: ["baculo", "amuleto"], peso: 8 },
      { nombre: "del Ladrón", efecto: { roboOro: 0.10, evasion: 0.10 }, tipos: ["arco", "botas"], peso: 7 },
      
      // ====== LEGENDARIOS ======
      { nombre: "del Héroe", efecto: { todosAtributos: 3 }, tipos: ["arma", "armadura"], peso: 3, rarezaMinima: "raro" },
      { nombre: "del Caos", efecto: { danoAleatorio: 15 }, tipos: ["arma"], peso: 2, rarezaMinima: "épico" },
      { nombre: "del Vacío", efecto: { ignorarDefensa: 0.15 }, tipos: ["arma", "baculo"], peso: 2, rarezaMinima: "épico" }
    ]
};

const itemsBase = {
    // ================== ARMADURAS ==================
    casco: [
        { nombre: "Casco de cuero", nivelMin: 1, nivelMax: 10, img: "ropa/casco_cuero.png" },
        { nombre: "Casco de oro", nivelMin: 11, nivelMax: 20, img: "ropa/casco_oro.png" },
        { nombre: "Casco de plata", nivelMin: 21, nivelMax: 30, img: "ropa/casco_plata.png" },
        { nombre: "Casco de bronce", nivelMin: 31, nivelMax: 40, img: "ropa/casco_bronce.png" },
        { nombre: "Yelmo de hierro", nivelMin: 41, nivelMax: 50, img: "ropa/yelmo_hierro.png" },
        { nombre: "Yelmo de acero", nivelMin: 51, nivelMax: 60, img: "ropa/yelmo_acero.png" },
        { nombre: "Yelmo de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/yelmo_dragon.png" }
    ],

    pechera: [
        { nombre: "Túnica de cuero", nivelMin: 1, nivelMax: 10, img: "ropa/pechera_cuero.png" },
        { nombre: "Armadura de oro", nivelMin: 11, nivelMax: 20, img: "ropa/pechera_oro.png" },
        { nombre: "Armadura de plata", nivelMin: 21, nivelMax: 30, img: "ropa/pechera_plata.png" },
        { nombre: "Armadura de bronce", nivelMin: 31, nivelMax: 40, img: "ropa/pechera_bronce.png" },
        { nombre: "Armadura de hierro", nivelMin: 41, nivelMax: 50, img: "ropa/pechera_hierro.png" },
        { nombre: "Armadura de acero", nivelMin: 51, nivelMax: 60, img: "ropa/pechera_acero.png" },
        { nombre: "Armadura de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/pechera_dragon.png" }
    ],

    guantes: [
        { nombre: "Guante de cuero", nivelMin: 1, nivelMax: 10, img: "ropa/guante_cuero.png" },
        { nombre: "Guante de oro", nivelMin: 11, nivelMax: 20, img: "ropa/guante_oro.png" },
        { nombre: "Guante de plata", nivelMin: 21, nivelMax: 30, img: "ropa/guante_plata.png" },
        { nombre: "Guante de bronce", nivelMin: 31, nivelMax: 40, img: "ropa/guante_bronce.png" },
        { nombre: "Guante de hierro", nivelMin: 41, nivelMax: 50, img: "ropa/guante_hierro.png" },
        { nombre: "Guante de acero", nivelMin: 51, nivelMax: 60, img: "ropa/guante_acero.png" },
        { nombre: "Guante de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/guante_dragon.png" }
    ],

    botas: [
        { nombre: "Bota de cuero", nivelMin: 1, nivelMax: 10, img: "ropa/bota_cuero.png" },
        { nombre: "Bota de oro", nivelMin: 11, nivelMax: 20, img: "ropa/bota_oro.png" },
        { nombre: "Bota de plata", nivelMin: 21, nivelMax: 30, img: "ropa/bota_plata.png" },
        { nombre: "Bota de bronce", nivelMin: 31, nivelMax: 40, img: "ropa/bota_bronce.png" },
        { nombre: "Bota de hierro", nivelMin: 41, nivelMax: 50, img: "ropa/bota_hierro.png" },
        { nombre: "Bota de acero", nivelMin: 51, nivelMax: 60, img: "ropa/bota_acero.png" },
        { nombre: "Bota de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/bota_dragon.png" }
    ],

    escudo: [
        { nombre: "Escudo de madera", nivelMin: 1, nivelMax: 10, img: "ropa/escudo_madera.png" },
        { nombre: "Escudo de oro", nivelMin: 11, nivelMax: 20, img: "ropa/escudo_oro.png" },
        { nombre: "Escudo de plata", nivelMin: 21, nivelMax: 30, img: "ropa/escudo_plata.png" },
        { nombre: "Escudo de bronce", nivelMin: 31, nivelMax: 40, img: "ropa/escudo_bronce.png" },
        { nombre: "Escudo de hierro", nivelMin: 41, nivelMax: 50, img: "ropa/escudo_hierro.png" },
        { nombre: "Escudo de acero", nivelMin: 51, nivelMax: 60, img: "ropa/escudo_acero.png" },
        { nombre: "Escudo de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/escudo_dragon.png" }
    ],

    // ================== ARMAS ==================
    arma: [
        { nombre: "Espada de madera", nivelMin: 1, nivelMax: 10, img: "ropa/espada_madera.png" },
        { nombre: "Espada de plata", nivelMin: 11, nivelMax: 20, img: "ropa/espada_plata.png" },
        { nombre: "Espada de bronce", nivelMin: 21, nivelMax: 30, img: "ropa/espada_bronce.png" },
        { nombre: "Espada de hierro", nivelMin: 31, nivelMax: 40, img: "ropa/espada_hierro.png" },
        { nombre: "Espada de acero", nivelMin: 41, nivelMax: 50, img: "ropa/espada_acero.png" },
        { nombre: "Espada de titanio", nivelMin: 51, nivelMax: 60, img: "ropa/espada_titanio.png" },
        { nombre: "Espada de diamante", nivelMin: 61, nivelMax: 70, img: "ropa/espada_diamante.png" }
    ],

    hacha: [
        { nombre: "Hacha de madera", nivelMin: 1, nivelMax: 10, img: "ropa/hacha_madera.png" },
        { nombre: "Hacha de plata", nivelMin: 11, nivelMax: 20, img: "ropa/hacha_plata.png" },
        { nombre: "Hacha de bronce", nivelMin: 21, nivelMax: 30, img: "ropa/hacha_bronce.png" },
        { nombre: "Hacha de hierro", nivelMin: 31, nivelMax: 40, img: "ropa/hacha_hierro.png" },
        { nombre: "Hacha de acero", nivelMin: 41, nivelMax: 50, img: "ropa/hacha_acero.png" },
        { nombre: "Hacha de titanio", nivelMin: 51, nivelMax: 60, img: "ropa/hacha_titanio.png" },
        { nombre: "Hacha de diamante", nivelMin: 61, nivelMax: 70, img: "ropa/hacha_diamante.png" }
    ],

    arco: [
        { nombre: "Arco de madera", nivelMin: 1, nivelMax: 10, img: "ropa/arco_madera.png" },
        { nombre: "Arco de plata", nivelMin: 11, nivelMax: 20, img: "ropa/arco_plata.png" },
        { nombre: "Arco de bronce", nivelMin: 21, nivelMax: 30, img: "ropa/arco_bronce.png" },
        { nombre: "Arco de hierro", nivelMin: 31, nivelMax: 40, img: "ropa/arco_hierro.png" },
        { nombre: "Arco de acero", nivelMin: 41, nivelMax: 50, img: "ropa/arco_acero.png" },
        { nombre: "Arco de titanio", nivelMin: 51, nivelMax: 60, img: "ropa/arco_titanio.png" },
        { nombre: "Arco de diamante", nivelMin: 61, nivelMax: 70, img: "ropa/arco_diamante.png" }
    ],

    baculo: [
        { nombre: "Báculo de madera", nivelMin: 1, nivelMax: 10, img: "ropa/baculo_madera.png" },
        { nombre: "Báculo de plata", nivelMin: 11, nivelMax: 20, img: "ropa/baculo_plata.png" },
        { nombre: "Báculo de bronce", nivelMin: 21, nivelMax: 30, img: "ropa/baculo_bronce.png" },
        { nombre: "Báculo de hierro", nivelMin: 31, nivelMax: 40, img: "ropa/baculo_hierro.png" },
        { nombre: "Báculo de acero", nivelMin: 41, nivelMax: 50, img: "ropa/baculo_acero.png" },
        { nombre: "Báculo de titanio", nivelMin: 51, nivelMax: 60, img: "ropa/baculo_titanio.png" },
        { nombre: "Báculo de diamante", nivelMin: 61, nivelMax: 70, img: "ropa/baculo_diamante.png" }
    ],

    // ================== ACCESORIOS ==================
    anillo: [
        { nombre: "Anillo de cobre", nivelMin: 1, nivelMax: 20, img: "ropa/anillo_cobre.png" },
        { nombre: "Anillo de plata", nivelMin: 21, nivelMax: 40, img: "ropa/anillo_plata.png" },
        { nombre: "Anillo de oro", nivelMin: 41, nivelMax: 60, img: "ropa/anillo_oro.png" },
        { nombre: "Anillo de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/anillo_dragon.png" }
    ],

    amuleto: [
        { nombre: "Amuleto de cobre", nivelMin: 1, nivelMax: 20, img: "ropa/amuleto_cobre.png" },
        { nombre: "Amuleto de plata", nivelMin: 21, nivelMax: 40, img: "ropa/amuleto_plata.png" },
        { nombre: "Amuleto de oro", nivelMin: 41, nivelMax: 60, img: "ropa/amuleto_oro.png" },
        { nombre: "Amuleto de dragón", nivelMin: 61, nivelMax: 70, img: "ropa/amuleto_dragon.png" }
    ]
};

const rarezas = [
    { nombre: "común", probabilidad: 0.60, multiplicadorStats: 1.0, color: "#FFFFFF" },      // +0%
    { nombre: "poco común", probabilidad: 0.25, multiplicadorStats: 1.15, color: "#2ECC71" }, // +15%
    { nombre: "raro", probabilidad: 0.10, multiplicadorStats: 1.3, color: "#3498DB" },        // +30%
    { nombre: "épico", probabilidad: 0.04, multiplicadorStats: 1.5, color: "#9B59B6" },       // +50%
    { nombre: "legendario", probabilidad: 0.01, multiplicadorStats: 2.0, color: "#F1C40F" }   // +100%
];

// Tipos de items y sus imágenes
const tiposItems = {
    casco: { nombre: "Casco", img: "ropa/casco.png" },
    pechera: { nombre: "Pechera", img: "ropa/pechera.png" },
    guantes: { nombre: "Guantes", img: "ropa/guantes.png" },
    botas: { nombre: "Botas", img: "ropa/botas.png" },
    arma: { nombre: "Arma", img: "ropa/espada.png" },
    escudo: { nombre: "Escudo", img: "ropa/escudo.png" },
    anillo: { nombre: "Anillo", img: "ropa/anillo.png" },
    amuleto: { nombre: "Amuleto", img: "ropa/amuleto.png" }
};


// --- FUNCIONES DE ITEMS ---
function generarItemAleatorio(nivelZona) {
    // 1. Definir tipos principales y subtipos
    const tiposItems = {
        arma: ['espada', 'hacha', 'arco', 'baculo'],
        armadura: ['casco', 'pechera', 'guantes', 'botas', 'escudo'],
        accesorio: ['anillo', 'amuleto']
    };
    
    // 2. Seleccionar tipo principal (arma, armadura o accesorio)
    const tipoPrincipal = Object.keys(tiposItems)[Math.floor(Math.random() * 3)];
    const subtipos = tiposItems[tipoPrincipal];
    const subtipo = subtipos[Math.floor(Math.random() * subtipos.length)];
    
    // 3. Seleccionar item base
    const itemsFiltrados = itemsBase[subtipo].filter(item => 
        nivelZona >= item.nivelMin && nivelZona <= item.nivelMax
    );
    
    if (itemsFiltrados.length === 0) {
        return generarItemGenerico(subtipo, nivelZona);
    }
    
    const itemBase = itemsFiltrados[Math.floor(Math.random() * itemsFiltrados.length)];
    
    // 4. Determinar rareza
    const random = Math.random();
    let rarezaSeleccionada;
    let acumulado = 0;
    
    for (const rareza of rarezas) {
        acumulado += rareza.probabilidad;
        if (random <= acumulado) {
            rarezaSeleccionada = rareza;
            break;
        }
    }
    
    // 5. Calcular estadísticas base
    let stats = calcularStatsPorTipo(subtipo, nivelZona, rarezaSeleccionada.multiplicadorStats);
    
    // 6. Crear objeto item inicial
    const item = {
        id: Date.now(),
        nombre: itemBase.nombre,
        tipo: tipoPrincipal,
        subtipo: subtipo,
        nivel: Math.floor(nivelZona * 0.8 + Math.random() * nivelZona * 0.4),
        rareza: rarezaSeleccionada.nombre,
        colorRareza: rarezaSeleccionada.color,
        img: itemBase.img,
        ...stats,
        precio: calcularPrecio(stats, rarezaSeleccionada.multiplicadorStats),
        descripcion: generarDescripcionItem(subtipo, rarezaSeleccionada.nombre)
    };
    
    // 7. Aplicar afijos si no es común
    if (item.rareza !== "común") {
        item.nombre = generarNombreConAfijos(item);
    } else {
        item.nombre = `${item.nombre} [${item.rareza}]`;
    }
    
    return item;
}

function generarNombreConAfijos(item) {
    // 1. Filtrar afijos compatibles con el subtipo del item
    const prefijosValidos = afijos.prefijos.filter(p => 
        p.tipos.includes(item.subtipo) || p.tipos.includes(item.tipo)
    );
    const sufijosValidos = afijos.sufijos.filter(s => 
        s.tipos.includes(item.subtipo) || s.tipos.includes(item.tipo)
    );

    // 2. Seleccionar afijos con ponderación
    const seleccionarAfijo = (afijos) => {
        const totalPeso = afijos.reduce((sum, a) => sum + a.peso, 0);
        let random = Math.random() * totalPeso;
        for (const afijo of afijos) {
            if (random < afijo.peso) return afijo;
            random -= afijo.peso;
        }
        return afijos[0];
    };

    const prefijo = prefijosValidos.length > 0 ? seleccionarAfijo(prefijosValidos) : null;
    const sufijo = sufijosValidos.length > 0 ? seleccionarAfijo(sufijosValidos) : null;

    // 3. Aplicar efectos de afijos
    let nombreFinal = item.nombre;
    if (prefijo) {
        nombreFinal = `${prefijo.nombre} ${nombreFinal}`;
        Object.assign(item, prefijo.efecto);
    }
    if (sufijo) {
        nombreFinal = `${nombreFinal} ${sufijo.nombre}`;
        Object.assign(item, sufijo.efecto);
    }

    return `${nombreFinal} [${item.rareza}]`;
}

function calcularStatsPorTipo(subtipo, nivel, multiplicadorRareza) {
    const statsBase = {
        // Armas
        espada: { danoMin: 3 + nivel * 2, danoMax: 5 + nivel * 3, fuerza: 1 + nivel * 0.7 },
        hacha: { danoMin: 4 + nivel * 2.5, danoMax: 6 + nivel * 3.2, constitucion: 1 + nivel * 0.5 },
        arco: { danoMin: 2 + nivel * 1.8, danoMax: 4 + nivel * 2.8, agilidad: 1 + nivel * 0.8 },
        baculo: { danoMin: 1 + nivel * 1.5, danoMax: 3 + nivel * 2.5, inteligencia: 1 + nivel * 0.9 },
        
        // Armaduras
        casco: { defensa: 5 + nivel * 2, constitucion: 1 + nivel * 0.5 },
        pechera: { defensa: 10 + nivel * 3, fuerza: 1 + nivel * 0.3 },
        guantes: { defensa: 3 + nivel * 1.5, habilidad: 1 + nivel * 0.4 },
        botas: { defensa: 4 + nivel * 1.8, agilidad: 1 + nivel * 0.6 },
        escudo: { defensa: 8 + nivel * 2.5, bloqueo: 5 + nivel * 0.2 },
        
        // Accesorios
        anillo: { carisma: 1 + nivel * 0.5, oroExtra: 0.05 * nivel },
        amuleto: { inteligencia: 1 + nivel * 0.6, expExtra: 0.1 * nivel }
    };

    const stats = statsBase[subtipo] || {};
    for (const stat in stats) {
        stats[stat] = Math.floor(stats[stat] * multiplicadorRareza);
    }

    return stats;
}

    // En calcularStatsPorTipo(), definimos mínimos/máximos:
const limitesStats = {
    arma: {
        danoMin: [3, 100],  // Mínimo 3, máximo 100
        danoMax: [5, 150]
    },
    armadura: {
        defensa: [5, 200]
    },
    accesorio: {
        atributo: [1, 30]   // Ej: +1 a +30 en un stat 
    }
};

function filtrarInventario(filtro) {
    const itemsContainer = document.getElementById("items-container");
    itemsContainer.innerHTML = "";

    let itemsFiltrados = jugador.inventario.filter(item => {
        if (filtro === 'todos') return true;
        if (filtro === 'armas') return ['arma', 'hacha', 'arco', 'baculo'].includes(item.tipo);
        if (filtro === 'armaduras') return ['casco', 'pechera', 'guantes', 'botas', 'escudo'].includes(item.tipo);
        if (filtro === 'accesorios') return ['anillo', 'amuleto'].includes(item.tipo);
        return false;
    });

    if (itemsFiltrados.length === 0) {
        itemsContainer.innerHTML = "<p>No tienes items de este tipo.</p>";
        return;
    }

    itemsFiltrados.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "item-inventario";
        itemElement.style.borderColor = item.colorRareza; // Aplicar color de rareza

        itemElement.innerHTML = `
    <img src="${item.img}" alt="${item.nombre}">
    <div class="item-tooltip">
      <strong style="color: ${item.colorRareza}">${item.nombre}</strong><br>
      ${item.descripcion}<br>
      ${item.tipo === 'arma' ? `Daño: ${item.danoMin}-${item.danoMax}<br>` : ''}
      ${item.defensa ? `Defensa: +${item.defensa}<br>` : ''}
      ${Object.entries(item)
                .filter(([key]) => ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key))
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
    switch (item.tipo) {
        case 'anillo':
            slot = jugador.equipo.anillo1 ? 'anillo2' : 'anillo1';
            break;
        case 'arma':
        case 'escudo':
        case 'casco':
        case 'pechera':
        case 'guantes':
        case 'botas':
        case 'amuleto':
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
        statsCombate.armadura += item.defensa * multiplier;
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

// Función para actualizar el inventario en la Vista General
function actualizarInventarioUI() {
    filtrarInventario('todos');
    const inventarioContainer = document.getElementById('items-container');

    if (!inventarioContainer || !window.jugador?.inventario) return;

    if (window.jugador.inventario.length === 0) {
        inventarioContainer.innerHTML = '<p>No tienes items aún.</p>';
        return;
    }

    // Modifica esta parte para que cada item tenga el onclick correcto:
    inventarioContainer.innerHTML = window.jugador.inventario.map(item => `
    <div class="item-inventario" onclick="equiparItem(${item.id})">
        <img src="${item.img}" alt="${item.nombre}">
        <p>${item.nombre}</p>
    </div>
`).join('');
}

function actualizarVestuarioUI() {
    Object.keys(jugador.equipo).forEach(slot => {
        const slotElement = document.getElementById(`${slot}-img`);
        
        // Verificar si el elemento existe
        if (!slotElement) {
            console.warn(`Elemento no encontrado: ${slot}-img`);
            return;
        }

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

// --- FUNCIONES DE INTERFAZ ---
function mostrarSeccion(seccionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });

    // Mostrar la sección seleccionada
    document.getElementById(seccionId).classList.add('activa');

    // Inicializaciones específicas de cada sección
    if (seccionId === 'tienda') {
        actualizarTiendaUI();
        actualizarInventarioUI();
    }

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
    // Específico para combate
    if (seccionId === 'combate') {
        enCombate = false;
        enemigosActuales = [];
        actualizarUbicacionesUI(); // Añadir esta línea
        actualizarEnemigosUI();
        document.getElementById("log-combate").textContent = "Selecciona una ubicación para comenzar el combate";
        actualizarCombatesUI(); // Asegurar que se actualice el contador
    }

    if (seccionId === 'fabrica') {
        actualizarRecursosUI();
        actualizarColaProduccionUI();
        filtrarRecetas('todas');
    }
}

function actualizarUI() {
    const porcentajeVida = Math.floor((statsCombate.vida / statsCombate.vidaMax) * 100);
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
    document.getElementById("armadura-value").textContent = statsCombate.armadura;
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

    if (statsCombate.vida >= statsCombate.vidaMax && jugador.intervaloCuracion) {
        clearInterval(jugador.intervaloCuracion);
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


// --- SISTEMA DE ENTRENAMIENTO ---
function subirNivel() {
    jugador.nivel++;
    jugador.exp = 0;
    jugador.expParaSubir = Math.floor(jugador.expParaSubir * 1.5);
    statsCombate.vidaMax += 20 + (jugador.statsBase.constitucion * 2);
    statsCombate.vida = statsCombate.vidaMax;

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
        statsCombate.vidaMax += vidaExtra;
        statsCombate.vida += vidaExtra;
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
        boton.onclick = function () { mejorarStat(stat); };
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

    // Inicializar la tienda
    inicializarTienda();
    reiniciarMisiones(); // <-- Reemplazar reiniciarMisionesDiarias() por esto
    actualizarMisionesUI('todas');
    iniciarEventosProgramados();
    if (jugador.fabrica.colaProduccion.length > 0) {
        actualizarProduccion();
        actualizarProgresoMisiones('nivel');
    }
    actualizarInventarioUI(); // Añade esta línea
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

    // Variables para acumular recompensas
    let oroGanado = 0;
    let expGanada = 0;
    let rubiesGanados = 0;
    let itemObtenido = null;

    // Calcular recompensas base
    if (mision.recompensa.oro) {
        oroGanado = aplicarBonusEvento('oro', mision.recompensa.oro);
    }
    if (mision.recompensa.exp) {
        expGanada = aplicarBonusEvento('exp', mision.recompensa.exp);
    }
    if (mision.recompensa.rubies) {
        rubiesGanados = aplicarBonusEvento('rubies', mision.recompensa.rubies);
    }

    // Verificar espacio en inventario antes de dar items
    if (mision.recompensa.item && jugador.inventario.length < MAX_INVENTARIO) {
        itemObtenido = generarItemAleatorio(jugador.nivel);
    }

    // Manejar recompensa de receta para misiones de fábrica
    if (mision.recompensa.receta) {
        if (!jugador.fabrica.recetasDesbloqueadas.includes(mision.recompensa.receta)) {
            jugador.fabrica.recetasDesbloqueadas.push(mision.recompensa.receta);
            alert(`¡Has desbloqueado la receta para ${recetasFabrica.find(r => r.id === mision.recompensa.receta).nombre}!`);
        }
    }

    // Mostrar confirmación al jugador
    let mensajeConfirmacion = `Reclamar recompensa:\n`;
    if (oroGanado > 0) mensajeConfirmacion += `💰 Oro: +${oroGanado}\n`;
    if (expGanada > 0) mensajeConfirmacion += `✨ Experiencia: +${expGanada}\n`;
    if (rubiesGanados > 0) mensajeConfirmacion += `💎 Rubíes: +${rubiesGanados}\n`;
    if (itemObtenido) mensajeConfirmacion += `🎁 Item: ${itemObtenido.nombre}\n`;

    if (!confirm(`${mensajeConfirmacion}\n¿Aceptar recompensa?`)) {
        return;
    }

    // Aplicar recompensas
    jugador.oro += oroGanado;
    jugador.exp += expGanada;
    jugador.rubies += rubiesGanados;

    if (itemObtenido) {
        jugador.inventario.push(itemObtenido);
    }

    // Verificar subida de nivel
    if (jugador.exp >= jugador.expParaSubir) {
        subirNivel();
    }

    // Eliminar misión (solo diarias y fábrica, historia permanece)
    if (mision.tipo === 'diaria') {
        jugador.misiones.diarias = jugador.misiones.diarias.filter(m => m.id !== id);
    } else if (mision.tipo === 'fabrica') {
        jugador.misiones.fabrica = jugador.misiones.fabrica.filter(m => m.id !== id);
    } else {
        mision.reclamada = true;
    }

    // Actualizar todas las UIs necesarias
    actualizarMisionesUI(document.querySelector(".filtros-misiones button.activo")?.textContent.toLowerCase() || 'todas');

    // Asegurar que todas las secciones se actualicen
    actualizarUI(); // Actualiza la vista general
    if (typeof actualizarRecursosUI === 'function') {
        actualizarRecursosUI(); // Actualiza específicamente recursos en todas las secciones
    }
    if (typeof actualizarInventarioUI === 'function') {
        actualizarInventarioUI(); // Actualiza el inventario
    }
    if (typeof actualizarTiendaUI === 'function') {
        actualizarTiendaUI(); // Actualiza la tienda si está abierta
    }

    // Mostrar mensaje de éxito
    alert(`¡Recompensa reclamada con éxito!\n${mensajeConfirmacion}`);
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
            window.equiparItem = equiparItem; // Al final de la función equiparItem()
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
    eventos.activo = { ...evento };
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

    switch (eventos.activo.tipo) {
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

    switch (evento.tipo) {
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
    switch (evento.tipo) {
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
    let modificada = { ...recompensa };

    eventosActivos.filter(e => e.activo).forEach(evento => {
        switch (evento.tipo) {
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
    const modificada = { ...recompensa };

    eventosActivos.filter(e => e.activo).forEach(evento => {
        switch (evento.tipo) {
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

document.addEventListener('DOMContentLoaded', cargarJuego);
// window.addEventListener('beforeunload', () => {
//     localStorage.setItem('gladiatusSave', JSON.stringify(jugador));
// });
