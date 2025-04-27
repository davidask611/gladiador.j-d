// Definición de recetas
const recetasFabrica = [
    // Armas
    {
        id: 1,
        nombre: "Espada básica",
        tipo: "arma",
        nivel: 1,
        recursos: { madera: 5, mineral: 10 },
        tiempo: 30000, // 30 segundos (en producción real sería 30 minutos)
        item: {
            nombre: "Espada de hierro",
            tipo: "arma",
            danoMin: 3,
            danoMax: 6,
            defensa: 0,
            img: "ropa/Espada_de_hierro.png",
            descripcion: "Daño: 3-6"
        }
    },
    {
        id: 2,
        nombre: "Hacha de guerra",
        tipo: "arma",
        nivel: 3,
        recursos: { madera: 8, mineral: 15 },
        tiempo: 60000, // 1 minuto
        item: {
            nombre: "Hacha de guerra",
            tipo: "arma",
            danoMin: 5,
            danoMax: 8,
            defensa: 0,
            img: "ropa/hacha.png",
            descripcion: "Daño: 5-8"
        }
    },
    
    // Armaduras
    {
        id: 3,
        nombre: "Pechera de cuero",
        tipo: "pechera",
        nivel: 2,
        recursos: { pieles: 10, mineral: 5 },
        tiempo: 45000, // 45 segundos
        item: {
            nombre: "Pechera de cuero",
            tipo: "pechera",
            danoMin: 0,
            danoMax: 0,
            defensa: 8,
            img: "ropa/pechera.png",
            descripcion: "Defensa: +8"
        }
    },
    {
        id: 4,
        nombre: "Casco de metal",
        tipo: "casco",
        nivel: 4,
        recursos: { mineral: 15, gemas: 1 },
        tiempo: 90000, // 1.5 minutos
        item: {
            nombre: "Casco de metal",
            tipo: "casco",
            danoMin: 0,
            danoMax: 0,
            defensa: 5,
            img: "ropa/casco_metal.png",
            descripcion: "Defensa: +5"
        }
    },
    
    // Accesorios
    {
        id: 5,
        nombre: "Anillo de bronce",
        tipo: "anillo",
        nivel: 3,
        recursos: { mineral: 8, gemas: 1 },
        tiempo: 30000, // 30 segundos
        item: {
            nombre: "Anillo de bronce",
            tipo: "anillo",
            fuerza: 1,
            constitucion: 1,
            img: "ropa/bronce_ring.png",
            descripcion: "Fuerza +1, Constitución +1"
        }
    },
    
    // Pociones
    {
        id: 6,
        nombre: "Poción de curación",
        tipo: "pocion",
        nivel: 1,
        recursos: { pieles: 3, gemas: 1 },
        tiempo: 15000, // 15 segundos
        item: {
            nombre: "Poción de curación",
            tipo: "pocion",
            curacion: 0.3, // Cambiado a 30% (0.3)
            img: "ropa/pocion1.png",
            descripcion: "Restaura 30% de la vida máxima"
        }
    },
    {
        id: 7,
        nombre: "Poción de curación mayor",
        tipo: "pocion",
        nivel: 5,
        recursos: { pieles: 10, gemas: 3 },
        tiempo: 60000, // 1 minuto
        item: {
            nombre: "Poción de curación mayor",
            tipo: "pocion",
            curacion: 1.0, // Cambiado a 100% (1.0)
            img: "ropa/pocion2.png",
            descripcion: "Restaura 100% de la vida máxima"
        }
    },
    
    // Más recetas avanzadas (se desbloquean con misiones/nivel)
    {
        id: 8,
        nombre: "Espada de acero",
        tipo: "arma",
        nivel: 10,
        recursos: { madera: 10, mineral: 25, gemas: 2 },
        tiempo: 120000, // 2 minutos
        item: {
            nombre: "Espada de acero",
            tipo: "arma",
            danoMin: 8,
            danoMax: 12,
            defensa: 0,
            img: "ropa/Espada_de_acero.png",
            descripcion: "Daño: 8-12"
        }
    },
    {
        id: 9,
        nombre: "Armadura completa",
        tipo: "pechera",
        nivel: 12,
        recursos: { mineral: 40, pieles: 20, gemas: 3 },
        tiempo: 180000, // 3 minutos
        item: {
            nombre: "Armadura completa",
            tipo: "pechera",
            danoMin: 0,
            danoMax: 0,
            defensa: 20,
            constitucion: 3,
            img: "ropa/pechera.png",
            descripcion: "Defensa: +20, Constitución +3"
        }
    }
];

// Misiones de fábrica
const misionesFabrica = [
    {
        id: 101,
        titulo: "Aprendiz de Artesano",
        descripcion: "Fabrica 3 items en la fábrica",
        tipo: "fabrica",
        progreso: 0,
        requerido: 3,
        recompensa: { oro: 100, receta: 8 }, // Desbloquea espada de acero
        completada: false
    },
    {
        id: 102,
        titulo: "Maestro Herrero",
        descripcion: "Fabrica 5 armas",
        tipo: "fabrica",
        progreso: 0,
        requerido: 5,
        recompensa: { oro: 150, rubies: 2, receta: 9 }, // Desbloquea armadura completa
        completada: false
    },
    {
        id: 103,
        titulo: "Recolector de Recursos",
        descripcion: "Consigue 50 unidades de cualquier recurso",
        tipo: "fabrica",
        progreso: 0,
        requerido: 50,
        recompensa: { oro: 80, exp: 30 },
        completada: false
    },
    {
        id: 104,
        titulo: "Productor de Pociones",
        descripcion: "Fabrica 10 pociones de cualquier tipo",
        tipo: "fabrica",
        progreso: 0,
        requerido: 10,
        recompensa: { oro: 120, rubies: 1 },
        completada: false
    }
];

// Añadir misiones de fábrica al juego
if (!jugador.misiones.fabrica) {
    jugador.misiones.fabrica = JSON.parse(JSON.stringify(misionesFabrica));
}

// Funciones de la fábrica
function comprarRecurso(tipo, cantidad, costo) {
    // Verificar si el jugador tiene suficiente oro
    if (jugador.oro >= costo) {
        // Restar el oro
        jugador.oro -= costo;
        
        // Añadir el recurso (asegúrate que jugador.recursos existe)
        if (!jugador.recursos) {
            jugador.recursos = {
                madera: 0,
                mineral: 0,
                pieles: 0,
                gemas: 0
            };
        }
        
        // Añadir la cantidad comprada
        jugador.recursos[tipo] += cantidad;
        
        // Actualizar la UI
        actualizarRecursosUI();
        actualizarUI(); // Para actualizar el oro
        
        // Actualizar progreso de misiones relacionadas con recursos
        actualizarProgresoMisiones('recurso', cantidad);
        
        // Mensaje de confirmación
        console.log(`Compra exitosa: ${cantidad} ${tipo} por ${costo} oro`);
    } else {
        alert(`No tienes suficiente oro. Necesitas ${costo} oro (tienes ${jugador.oro}).`);
    }
}

function actualizarRecursosUI() {
    if (!jugador.recursos) return;
    
    document.getElementById("madera-count").textContent = jugador.recursos.madera;
    document.getElementById("mineral-count").textContent = jugador.recursos.mineral;
    document.getElementById("pieles-count").textContent = jugador.recursos.pieles;
    document.getElementById("gemas-count").textContent = jugador.recursos.gemas;
}

function iniciarProduccion(recetaId) {
    const receta = recetasFabrica.find(r => r.id === recetaId);
    if (!receta) return;
    
    // Verificar recursos
    for (const [recurso, cantidad] of Object.entries(receta.recursos)) {
        if (jugador.recursos[recurso] < cantidad) {
            alert(`No tienes suficiente ${recurso}. Necesitas ${cantidad}.`);
            return;
        }
    }
    
    // Consumir recursos
    for (const [recurso, cantidad] of Object.entries(receta.recursos)) {
        jugador.recursos[recurso] -= cantidad;
    }
    
    // Agregar a la cola de producción
    const itemProduccion = {
        recetaId: receta.id,
        nombre: receta.nombre,
        tiempoTotal: receta.tiempo,
        tiempoRestante: receta.tiempo,
        completado: false,
        fechaInicio: new Date().getTime()
    };
    
    jugador.fabrica.colaProduccion.push(itemProduccion);
    
    // Iniciar temporizador si es el primer item
    if (jugador.fabrica.colaProduccion.length === 1) {
        actualizarProduccion();
    }
    
    actualizarRecursosUI();
    actualizarColaProduccionUI();
    
    // Corregido: Pasamos el tipo de receta como tercer parámetro
    actualizarProgresoMisiones('fabricarItem', 1, null, receta.tipo);
}

function actualizarProduccion() {
    // Verificar si hay items en producción
    if (jugador.fabrica.colaProduccion.length === 0) return;
    
    const ahora = new Date().getTime();
    const item = jugador.fabrica.colaProduccion[0];
    
    // Calcular tiempo transcurrido
    const tiempoTranscurrido = ahora - item.fechaInicio;
    item.tiempoRestante = Math.max(0, item.tiempoTotal - tiempoTranscurrido);
    
    // Verificar si se completó
    if (item.tiempoRestante <= 0 && !item.completado) {
        item.completado = true;
        completarProduccion(item);
    }
    
    // Actualizar UI
    actualizarColaProduccionUI();
    
    // Continuar el temporizador si aún hay tiempo restante
    if (item.tiempoRestante > 0) {
        setTimeout(actualizarProduccion, 1000);
    }
}

function completarProduccion(itemProduccion) {
    const receta = recetasFabrica.find(r => r.id === itemProduccion.recetaId);
    if (!receta) return;
    
    // Marcar como completado
    itemProduccion.completado = true;
    
    // Actualizar UI para mostrar el botón de reclamar
    actualizarColaProduccionUI();
    
    // Mostrar notificación
    const logCombate = document.getElementById("log-combate");
    logCombate.textContent = `🏭 ¡Has terminado de fabricar ${receta.nombre}! Reclámalo en la fábrica.` + 
        (logCombate.textContent ? `\n\n${logCombate.textContent}` : '');

        actualizarUI();
}

function reclamarItemProduccion(index) {
    if (index >= jugador.fabrica.colaProduccion.length) return;
    
    const item = jugador.fabrica.colaProduccion[index];
    if (!item.completado) return;
    
    const receta = recetasFabrica.find(r => r.id === item.recetaId);
    if (!receta) return;
    
    // Crear el item
    const nuevoItem = {
        ...receta.item,
        id: Date.now(),
        fabricado: true
    };
    
    // Agregar al inventario
    jugador.inventario.push(nuevoItem);
    
    // Eliminar de la cola de producción
    jugador.fabrica.colaProduccion.splice(index, 1);
    
    // Iniciar siguiente item si hay más
    if (jugador.fabrica.colaProduccion.length > 0) {
        jugador.fabrica.colaProduccion[0].fechaInicio = new Date().getTime();
        actualizarProduccion();
    }
    
    // Mostrar notificación
    const logCombate = document.getElementById("log-combate");
    logCombate.textContent = `🎉 ¡Has reclamado ${receta.nombre}! Se ha añadido a tu inventario.` + 
        (logCombate.textContent ? `\n\n${logCombate.textContent}` : '');
    
    actualizarUI();
    actualizarColaProduccionUI();
}

// Funciones de UI para la fábrica
function actualizarColaProduccionUI() {
    const container = document.getElementById("cola-produccion-list");
    container.innerHTML = "";
    
    if (jugador.fabrica.colaProduccion.length === 0) {
        container.innerHTML = "<p>No hay items en producción actualmente</p>";
        return;
    }
    
    jugador.fabrica.colaProduccion.forEach((item, index) => {
        const elemento = document.createElement("div");
        elemento.className = "item-produccion";
        
        const minutos = Math.floor(item.tiempoRestante / 60000);
        const segundos = Math.floor((item.tiempoRestante % 60000) / 1000);
        
        elemento.innerHTML = `
            <div class="item-en-proceso">
                <span>${item.completado ? '✅' : '🛠️'} ${item.nombre}</span>
                <div class="temporizador-produccion">
                    ${item.completado ? 'Completado' : `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`}
                </div>
                ${item.completado ? 
                    `<button class="btn-reclamar" onclick="reclamarItemProduccion(${index})" style="display: block;">Reclamar</button>` : 
                    `<button class="btn-reclamar" style="display: none;">Reclamar</button>`
                }
            </div>
        `;
        
        container.appendChild(elemento);
    });
}

function filtrarRecetas(filtro) {
    const lista = document.getElementById("lista-recetas");
    lista.innerHTML = "";
    
    let recetasMostrar = recetasFabrica.filter(receta => 
        jugador.fabrica.recetasDesbloqueadas.includes(receta.id)
    );
    
    if (filtro !== 'todas') {
        recetasMostrar = recetasMostrar.filter(receta => {
            if (filtro === 'armas') return receta.tipo === 'arma';
            if (filtro === 'armaduras') return ['casco', 'pechera', 'guantes', 'botas', 'escudo'].includes(receta.tipo);
            if (filtro === 'accesorios') return ['anillo', 'pendiente'].includes(receta.tipo);
            if (filtro === 'pociones') return receta.tipo === 'pocion';
            return true;
        });
    }
    
    if (recetasMostrar.length === 0) {
        lista.innerHTML = "<p>No hay recetas disponibles con este filtro</p>";
        return;
    }
    
    recetasMostrar.forEach(receta => {
        const card = document.createElement("div");
        card.className = "receta-card";
        
        // Verificar si hay suficientes recursos
        let recursosHTML = "";
        let puedeFabricar = true;
        
        for (const [recurso, cantidad] of Object.entries(receta.recursos)) {
            const suficiente = jugador.recursos[recurso] >= cantidad;
            if (!suficiente) puedeFabricar = false;
            
            recursosHTML += `
                <p class="${suficiente ? 'suficiente' : 'insuficiente'}">
                    ${recurso.charAt(0).toUpperCase() + recurso.slice(1)}: 
                    <span>${jugador.recursos[recurso]}/${cantidad}</span>
                </p>
            `;
        }
        
        // Calcular tiempo en minutos y segundos
        const minutos = Math.floor(receta.tiempo / 60000);
        const segundos = Math.floor((receta.tiempo % 60000) / 1000);
        
        card.innerHTML = `
            <h4>${receta.nombre} (Nv. ${receta.nivel})</h4>
            <div class="receta-recursos">
                ${recursosHTML}
            </div>
            <p class="receta-tiempo">Tiempo de producción: ${minutos}m ${segundos}s</p>
            <button ${!puedeFabricar ? 'disabled' : ''} 
                    onclick="iniciarProduccion(${receta.id})">
                Fabricar
            </button>
        `;
        
        lista.appendChild(card);
    });
}