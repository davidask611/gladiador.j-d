// --- DATOS DEL JUEGO ---
const jugador = {
    nombre: "Ovak",
    nivel: 7,
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

const misiones = {
    diarias: [
        {
            id: 1,
            titulo: "Cazador novato",
            descripcion: "Derrota 3 enemigos en cualquier ubicación.",
            tipo: "diaria",
            progreso: 0,
            requerido: 3,
            recompensa: { oro: 50, exp: 20 },
            completada: false
        },
        {
            id: 2,
            titulo: "Entrenamiento intenso",
            descripcion: "Mejora cualquier atributo 2 veces.",
            tipo: "diaria",
            progreso: 0,
            requerido: 2,
            recompensa: { oro: 30, rubies: 1 },
            completada: false
        }
    ],
    historia: [
        {
            id: 3,
            titulo: "Primeros pasos",
            descripcion: "Alcanza el nivel 5.",
            tipo: "historia",
            progreso: 0,
            requerido: 5,
            recompensa: { oro: 100, exp: 50, item: "arma" },
            completada: false
        }
    ]
};

// Inicializar misiones en el jugador (si no existen)
if (!jugador.misiones) {
    jugador.misiones = {
        diarias: JSON.parse(JSON.stringify(misiones.diarias)),
        historia: JSON.parse(JSON.stringify(misiones.historia))
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
        nombre: "Rata gigante", 
        nivel: [1, 2],
        vida: 59, 
        vidaMax: 140,
        ataque: 2, 
        defensa: 1, 
        fuerza: 1,
        habilidad: 2,
        agilidad: 2,
        constitucion: 2,
        carisma: 1,
        inteligencia: 2,
        imagen: "enemigo/rata.png",
        derrotado: false,
        oro: 10,
        exp: 15,
        descripcion: "Fuerza: Diminuto, Habilidad: Débil, Agilidad: Muy débil, Constitución: Diminuto, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Insignificante, Daño: Diminuto"
    },
    { 
        id: 2,
        nombre: "Lince salvaje", 
        nivel: [2, 5],
        vida: 118, 
        vidaMax: 350,
        ataque: 3, 
        defensa: 1, 
        fuerza: 2,
        habilidad: 3,
        agilidad: 2,
        constitucion: 2,
        carisma: 1,
        inteligencia: 2,
        imagen: "enemigo/lince.png",
        derrotado: false,
        oro: 20,
        exp: 25,
        descripcion: "Fuerza: Diminuto, Habilidad: Débil, Agilidad: Muy débil, Constitución: Diminuto, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Insignificante, Daño: Diminuto"
    },
    { 
        id: 3,
        nombre: "Lobo feroz", 
        nivel: [4, 8],
        vida: 237, 
        vidaMax: 560,
        ataque: 4, 
        defensa: 1, 
        fuerza: 3,
        habilidad: 2,
        agilidad: 2,
        constitucion: 2,
        carisma: 1,
        inteligencia: 2,
        imagen: "enemigo/lobo.png",
        derrotado: false,
        oro: 35,
        exp: 40,
        descripcion: "Fuerza: Muy débil, Habilidad: Muy débil, Agilidad: Muy débil, Constitución: Diminuto, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Insignificante, Daño: Insignificante"
    },
    { 
        id: 4,
        nombre: "Oso pardo", 
        nivel: [8, 10],
        vida: 475, 
        vidaMax: 700,
        ataque: 6, 
        defensa: 3, 
        fuerza: 5,
        habilidad: 2,
        agilidad: 2,
        constitucion: 4,
        carisma: 1,
        inteligencia: 2,
        imagen: "enemigo/oso.png",
        derrotado: false,
        oro: 50,
        exp: 60,
        descripcion: "Fuerza: Inferior a la media, Habilidad: Diminuto, Agilidad: Diminuto, Constitución: Débil, Carisma: Diminuto, Inteligencia: Diminuto, Armadura: Muy débil, Daño: Muy débil"
    }
];

// Ubicaciones con rangos de nivel
const ubicaciones = {
    'Bosque Sombrio': { 
        niveles: [1, 10],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
    },
    'Puerto Pirata': { 
        niveles: [11, 20],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
    },
    'Montañas Nubladas': { 
        niveles: [21, 30],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
    },
    'Cueva del Lobo': { 
        niveles: [31, 40],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
    },
    'Templo Antiguo': { 
        niveles: [41, 50],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
    },
    'Pueblo Bárbaro': { 
        niveles: [51, 60],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
    },
    'Campamento Bandido': { 
        niveles: [61, 70],
        enemigos: [1, 2, 3, 4] // IDs de enemigos (Rata gigante , Lince salvaje , Lobo feroz y Oso pardo)
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
        
        itemElement.onclick = () => equiparItem(item.id);
        itemsContainer.appendChild(itemElement);
    });
}

function equiparItem(itemId) {
    const item = jugador.inventario.find(i => i.id === itemId);
    if (!item) return;

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

// --- SISTEMA DE COMBATES ---
// function cargarCombates() {
//     if (localStorage.getItem('combatesDisponibles')) {
//         jugador.combatesDisponibles = parseInt(localStorage.getItem('combatesDisponibles'));
//     }

//     if (localStorage.getItem('ultimoCombate')) {
//         const ahora = new Date().getTime();
//         const ultimoCombate = parseInt(localStorage.getItem('ultimoCombate'));
//         const tiempoTranscurrido = ahora - ultimoCombate;
        
//         const combatesRecuperados = Math.floor(tiempoTranscurrido / jugador.tiempoRecarga);
        
//         if (combatesRecuperados > 0) {
//             jugador.combatesDisponibles = Math.min(jugador.combatesMaximos, jugador.combatesDisponibles + combatesRecuperados);
//             localStorage.setItem('combatesDisponibles', jugador.combatesDisponibles.toString());
            
//             const tiempoRestante = tiempoTranscurrido % jugador.tiempoRecarga;
//             localStorage.setItem('ultimoCombate', (ahora - tiempoRestante).toString());
//         }
//     }
// }

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
            <p>Fuerza: ${enemigo.fuerza}</p>
            <p>Habilidad: ${enemigo.habilidad}</p>
            <p>Agilidad: ${enemigo.agilidad}</p>
            <p>Constitución: ${enemigo.constitucion}</p>
        `;
        
        // Solo permite clic si hay combates disponibles y el enemigo no está derrotado
        if (!enemigo.derrotado && jugador.combatesDisponibles > 0) {
            card.addEventListener("click", () => atacar(index));
        }
        grid.appendChild(card);
    });
}

function atacar(indexEnemigo) {
    if (jugador.combatesDisponibles <= 0) {
        document.getElementById("log-combate").textContent = "¡No tienes combates disponibles! Espera a que se recarguen.";
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
                log += `💰 Oro: ${enemigo.oro} | ✨ Exp: ${enemigo.exp}\n`;
                
                victoria(); // Esto mostrará el resumen completo después
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
        usarCombate();
    }

    // Verificar victoria/derrota global
    if (enemigosActuales.every(e => e.derrotado)) {
        victoria(); // Muestra el resumen completo de la ubicación
    } else if (!jugadorVivo) {
        derrota();
    }
    verificarCuracionAutomatica(); // <-- Añadir esta línea
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
    
    // Aplicar bonus de carisma al oro
    const bonusCarisma = 1 + (jugador.statsBase.carisma * 0.1);
    const oroFinal = Math.floor(recompensaOro * bonusCarisma);
    
    // Depuración (opcional)
    console.log(`Oro base: ${recompensaOro} + Bonus carisma (x${bonusCarisma.toFixed(1)}) = ${oroFinal}`);

    // Aplicar recompensas al jugador
    jugador.oro += oroFinal;
    jugador.exp += recompensaExp;
    jugador.victorias++;
    actualizarProgresoMisiones('enemigo');

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
    actualizarProgresoMisiones('nivel');
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
    
    // Modificar el mensaje de alerta para eliminar la referencia a puntos de entrenamiento
    alert(`¡Subiste al nivel ${jugador.nivel}! +${20 + (jugador.statsBase.constitucion * 2)} de vida máxima.`);
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
}

function actualizarBotonStat(stat, costo) {
    // Textos que identifican cada botón (deben coincidir exactamente con el HTML)
    const textosStats = {
        fuerza: "💪 Fuerza",
        habilidad: "🎯 Habilidad",
        agilidad: "🏃 Agilidad",
        constitucion: "❤️ Constitución",
        carisma: "✨ Carisma",
        inteligencia: "🧠 Inteligencia"
    };

    // Encontrar el botón CORRECTO usando el texto del stat
    const botones = document.querySelectorAll('.stat-card button');
    botones.forEach(boton => {
        if (boton.textContent.includes(textosStats[stat])) {
            // Actualizar el texto del botón (usamos innerHTML solo si necesitas el <small>)
            boton.innerHTML = `+${costo} oro <small>(1 Punto)</small>`;
            
            // Asegurarnos de que el evento onclick esté correctamente asignado
            boton.onclick = function() { mejorarStat(stat); };
            
            // Agregar atributo data-stat para referencia futura
            boton.setAttribute('data-stat', stat);
        }
    });
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
        alert("No tienes suficientes rubíes. Necesitas al menos 1 rubí para comprar un combate.");
    }
}

// --- INICIALIZACIÓN ---
function cargarJuego() {
    // const datosGuardados = localStorage.getItem('gladiatusSave');
    // if (datosGuardados) {
    //     const datos = JSON.parse(datosGuardados);
    //     Object.assign(jugador, datos);
    //     // Inicializar rubíes si no existen en los datos guardados
    //     if (jugador.rubies === undefined) {
    //         jugador.rubies = 0;
    //     }
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
    actualizarMisionesUI('todas');

    // Actualizar botones de entrenamiento al inicio
    Object.keys(jugador.mejorasStats).forEach(stat => {
        const costoBase = jugador.costosEntrenamiento[stat];
        const proximoCosto = costoBase + (jugador.mejorasStats[stat] * costoBase); // Usar costoBase en lugar de 50
        actualizarBotonStat(stat, proximoCosto);
    });
}

function actualizarMisionesUI(filtro = 'todas') {
    const lista = document.getElementById("lista-misiones");
    lista.innerHTML = "";

    let misionesMostrar = [];
    if (filtro === 'diarias') misionesMostrar = [...jugador.misiones.diarias];
    else if (filtro === 'historia') misionesMostrar = [...jugador.misiones.historia];
    else misionesMostrar = [...jugador.misiones.diarias, ...jugador.misiones.historia];

    if (misionesMostrar.length === 0) {
        lista.innerHTML = "<p>No hay misiones disponibles.</p>";
        return;
    }

    misionesMostrar.forEach(mision => {
        const porcentaje = Math.min(100, (mision.progreso / mision.requerido) * 100);
        const card = document.createElement("div");
        card.className = `mision-card ${mision.completada ? 'completada' : ''}`;
        card.innerHTML = `
            <h3>${mision.titulo}</h3>
            <p>${mision.descripcion}</p>
            <div class="mision-progreso">
                <div style="width: ${porcentaje}%"></div>
            </div>
            <p>Progreso: ${mision.progreso}/${mision.requerido}</p>
            <div class="mision-recompensa">
                Recompensa: 
                ${mision.recompensa.oro ? `<span>💰 ${mision.recompensa.oro} oro</span>` : ''}
                ${mision.recompensa.exp ? `<span>✨ ${mision.recompensa.exp} exp</span>` : ''}
                ${mision.recompensa.rubies ? `<span>💎 ${mision.recompensa.rubies} rubí</span>` : ''}
            </div>
            ${mision.completada ? '<button class="btn-reclamar" onclick="reclamarRecompensa(' + mision.id + ')">Reclamar</button>' : ''}
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
                 jugador.misiones.historia.find(m => m.id === id);
    
    if (!mision || !mision.completada) return;

    // Dar recompensas
    if (mision.recompensa.oro) jugador.oro += mision.recompensa.oro;
    if (mision.recompensa.exp) jugador.exp += mision.recompensa.exp;
    if (mision.recompensa.rubies) jugador.rubies += mision.recompensa.rubies;
    if (mision.recompensa.item) {
        const item = generarItemAleatorio(jugador.nivel);
        jugador.inventario.push(item);
    }

    // Eliminar misión (si es diaria)
    if (mision.tipo === 'diaria') {
        jugador.misiones.diarias = jugador.misiones.diarias.filter(m => m.id !== id);
    }

    actualizarUI();
    actualizarMisionesUI(document.querySelector(".filtros-misiones button.activo").textContent.toLowerCase());
}

// --- Funciones para actualizar progreso ---
function actualizarProgresoMisiones(tipo, cantidad = 1) {
    let misionesActualizables = [];
    if (tipo === 'enemigo') {
        misionesActualizables = jugador.misiones.diarias.filter(m => 
            m.descripcion.includes("Derrota") && !m.completada
        );
    } else if (tipo === 'nivel') {
        misionesActualizables = jugador.misiones.historia.filter(m => 
            m.descripcion.includes("Alcanza") && !m.completada
        );
    }

    misionesActualizables.forEach(mision => {
        mision.progreso += cantidad;
        if (mision.progreso >= mision.requerido) {
            mision.completada = true;
        }
    });
}

window.addEventListener('load', cargarJuego);
// window.addEventListener('beforeunload', () => {
//     localStorage.setItem('gladiatusSave', JSON.stringify(jugador));
// });
