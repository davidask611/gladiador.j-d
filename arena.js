// Función para inicializar la arena
function inicializarArena() {
    cargarRankingArena();
    actualizarListaOponentes();
    verificarRecargaCombates();
}

// Función para cargar el ranking
function cargarRankingArena() {
    if (arena.ranking.length === 0) {
        arena.ranking = [
            { nombre: "DeathNote", nivel: 82, puntos: 3200 },
            { nombre: "DAGOVACITY", nivel: 85, puntos: 3100 },
            { nombre: "RIQUELME", nivel: 84, puntos: 2950 },
            { nombre: "MauryUnge", nivel: 85, puntos: 2800 },
            { nombre: "Fabisabalero", nivel: 85, puntos: 2750 }
        ];
        
        if (!arena.ranking.some(j => j.nombre === jugador.nombre)) {
            arena.ranking.push({
                nombre: jugador.nombre,
                nivel: jugador.nivel,
                puntos: arena.puntosBaseOponente,
                stats: {
                    fuerza: jugador.statsBase.fuerza,
                    agilidad: jugador.statsBase.agilidad
                }
            });
        }
    }
    
    arena.ranking.sort((a, b) => b.puntos - a.puntos);
    
    const rankingContainer = document.getElementById("ranking-arena");
    rankingContainer.innerHTML = `
        <table class="ranking-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Nivel</th>
                    <th>Puntos</th>
                </tr>
            </thead>
            <tbody>
                ${arena.ranking.map((jugadorRank, index) => `
                    <tr class="${jugadorRank.nombre === jugador.nombre ? 'jugador-actual' : ''}">
                        <td>${index + 1}. ${jugadorRank.nombre}</td>
                        <td>${jugadorRank.nivel}</td>
                        <td>${jugadorRank.puntos}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Función para actualizar lista de oponentes con balanceo
function actualizarListaOponentes() {
    const lista = document.getElementById("lista-oponentes");
    lista.innerHTML = "";
    
    const jugadorActual = arena.ranking.find(j => j.nombre === jugador.nombre) || 
                         { puntos: arena.puntosBaseOponente, nivel: jugador.nivel };
    
    const oponentes = arena.ranking
        .filter(j => j.nombre !== jugador.nombre)
        .filter(j => Math.abs(j.puntos - jugadorActual.puntos) <= arena.rangoPuntos)
        .sort((a, b) => Math.abs(a.puntos - jugadorActual.puntos) - Math.abs(b.puntos - jugadorActual.puntos));
    
    if (oponentes.length === 0) {
        lista.innerHTML = "<p>No hay oponentes disponibles con puntaje similar.</p>";
        return;
    }
    
    oponentes.forEach(oponente => {
        const diferenciaPuntos = oponente.puntos - jugadorActual.puntos;
        const diferenciaNivel = oponente.nivel - jugadorActual.nivel;
        
        const item = document.createElement("div");
        item.className = "oponente-card";
        item.innerHTML = `
            <h3>${oponente.nombre}</h3>
            <p>Nivel: ${oponente.nivel} ${diferenciaNivel > 0 ? 
               `(+${diferenciaNivel})` : 
               (diferenciaNivel < 0 ? `(${diferenciaNivel})` : '')}</p>
            <p>Puntos: ${oponente.puntos} ${diferenciaPuntos > 0 ? 
               `(+${diferenciaPuntos})` : 
               (diferenciaPuntos < 0 ? `(${diferenciaPuntos})` : '')}</p>
            <button class="btn-desafiar" onclick="seleccionarOponente('${oponente.nombre}')">
                Desafiar (${arena.combatesRestantes}/${arena.combatesDiarios})
            </button>
        `;
        lista.appendChild(item);
    });
}

// Función para seleccionar oponente
function seleccionarOponente(nombreOponente) {
    if (arena.combatesRestantes <= 0) {
        alert("No tienes combates de arena disponibles hoy. Vuelve mañana.");
        return;
    }
    
    if (Date.now() - arena.ultimoCombatePvP < arena.tiempoEsperaArena) {
        const tiempoRestante = Math.ceil((arena.tiempoEsperaArena - (Date.now() - arena.ultimoCombatePvP))) / 1000;
        alert(`Debes esperar ${tiempoRestante} segundos antes de otro combate.`);
        return;
    }
    
    oponenteSeleccionado = arena.ranking.find(j => j.nombre === nombreOponente);
    
    const oponenteContainer = document.getElementById("oponente-seleccionado");
    oponenteContainer.innerHTML = `
        <h3>Oponente seleccionado:</h3>
        <div class="oponente-info">
            <p><strong>${oponenteSeleccionado.nombre}</strong></p>
            <p>Nivel: ${oponenteSeleccionado.nivel}</p>
            <p>Puntos: ${oponenteSeleccionado.puntos}</p>
            <p>Fuerza: ${oponenteSeleccionado.stats?.fuerza || 10}</p>
            <p>Agilidad: ${oponenteSeleccionado.stats?.agilidad || 8}</p>
        </div>
        <button onclick="iniciarCombatePvP()" class="btn-combatir">Iniciar Combate</button>
    `;
}

// Función para iniciar combate PvP
function iniciarCombatePvP() {
    if (!oponenteSeleccionado || enCombatePvP || arena.combatesRestantes <= 0) return;
    
    enCombatePvP = true;
    arena.combatesRestantes--;
    arena.ultimoCombatePvP = Date.now();
    arena.totalCombates++;
    
    let log = `⚔️ Combate contra ${oponenteSeleccionado.nombre} (Nv. ${oponenteSeleccionado.nivel}) ⚔️\n\n`;
    document.getElementById("log-arena").textContent = log;
    
    // Simulación de combate por turnos
    let jugadorVida = jugador.vida;
    let oponenteVida = oponenteSeleccionado.vida || 100;
    
    // Aplicar balanceo por nivel
    const nivelDiff = oponenteSeleccionado.nivel - jugador.nivel;
    const modificadorNivel = 1 + (nivelDiff * arena.modificadorNivel);
    
    // Turnos de combate
    const intervalo = setInterval(() => {
        if (jugadorVida <= 0 || oponenteVida <= 0) {
            clearInterval(intervalo);
            return;
        }
        
        // Turno del jugador
        const danoJugador = calcularDanoPvP(jugador, oponenteSeleccionado);
        oponenteVida -= danoJugador;
        log += `Atacas a ${oponenteSeleccionado.nombre} (-${danoJugador} vida)\n`;
        
        if (oponenteVida <= 0) {
            log += `\n💀 ${oponenteSeleccionado.nombre} ha sido derrotado!\n`;
            victoriaPvP();
            clearInterval(intervalo);
            return;
        }
        
        // Turno del oponente (con balanceo de nivel)
        const danoOponente = Math.floor(calcularDanoPvP(oponenteSeleccionado, jugador) * modificadorNivel);
        jugadorVida -= danoOponente;
        log += `${oponenteSeleccionado.nombre} te ataca (-${danoOponente} vida)\n`;
        
        if (jugadorVida <= 0) {
            log += `\n☠️ Has sido derrotado por ${oponenteSeleccionado.nombre}!\n`;
            derrotaPvP();
            clearInterval(intervalo);
            return;
        }
        
        document.getElementById("log-arena").textContent = log;
    }, 1500); // 1.5 segundos entre turnos
}

// Función para calcular daño en PvP
function calcularDanoPvP(atacante, defensor) {
    const base = atacante.statsBase?.fuerza || atacante.stats?.fuerza || 5;
    const arma = atacante.equipo?.arma?.danoMax || 0;
    const defensa = defensor.armadura || defensor.stats?.constitucion || 5;
    
    // Cálculo base con variación aleatoria
    return Math.max(1, Math.floor((base + arma - defensa) * (0.8 + Math.random() * 0.4)));
}

// Función de victoria PvP
function victoriaPvP() {
    const jugadorRanking = arena.ranking.find(j => j.nombre === jugador.nombre) || 
                         { puntos: arena.puntosBaseOponente };
    const oponenteRanking = arena.ranking.find(j => j.nombre === oponenteSeleccionado.nombre);
    
    // Cálculo de puntos con balanceo
    const diferencia = oponenteRanking.puntos - jugadorRanking.puntos;
    let puntosGanados = Math.floor(arena.puntosPorVictoria * (1 + diferencia / 200));
    puntosGanados = Math.max(arena.minPuntosGanados, Math.min(arena.maxPuntosGanados, puntosGanados));
    
    // Actualizar puntos
    jugadorRanking.puntos += puntosGanados;
    oponenteRanking.puntos = Math.max(0, oponenteRanking.puntos - Math.floor(puntosGanados / 2));
    
    // Actualizar estadísticas
    arena.rachaVictorias++;
    arena.mayorRacha = Math.max(arena.mayorRacha, arena.rachaVictorias);
    arena.totalVictorias++;
    
    // Registrar en historial
    arena.historial.unshift({
        oponente: oponenteSeleccionado.nombre,
        resultado: "victoria",
        puntos: puntosGanados,
        fecha: new Date().toLocaleDateString(),
        nivelOponente: oponenteSeleccionado.nivel
    });
    
    // Limitar historial a 10 entradas
    if (arena.historial.length > 10) arena.historial.pop();
    
    // Recompensas adicionales
    const recompensaOro = Math.floor(puntosGanados * 2);
    const recompensaExp = puntosGanados * 3;
    jugador.oro += recompensaOro;
    jugador.exp += recompensaExp;
    
    // Mensaje de victoria
    let mensaje = document.getElementById("log-arena").textContent;
    mensaje += `\n🏆 **¡VICTORIA!** 🏆\n`;
    mensaje += `⭐ +${puntosGanados} puntos de arena\n`;
    mensaje += `💰 +${recompensaOro} oro | ✨ +${recompensaExp} experiencia\n`;
    mensaje += `📊 Puntos totales: ${jugadorRanking.puntos}\n`;
    mensaje += `🔥 Racha actual: ${arena.rachaVictorias} victorias\n`;
    
    document.getElementById("log-arena").textContent = mensaje;
    enCombatePvP = false;
    
    // Actualizar UI
    actualizarUI();
    cargarRankingArena();
    actualizarListaOponentes();
}

// Función de derrota PvP
function derrotaPvP() {
    const jugadorRanking = arena.ranking.find(j => j.nombre === jugador.nombre) || 
                         { puntos: arena.puntosBaseOponente };
    const oponenteRanking = arena.ranking.find(j => j.nombre === oponenteSeleccionado.nombre);
    
    // Cálculo de puntos con balanceo
    const diferencia = oponenteRanking.puntos - jugadorRanking.puntos;
    let puntosPerdidos = Math.floor(arena.puntosPorDerrota * (1 - diferencia / 400));
    puntosPerdidos = Math.max(5, Math.min(25, puntosPerdidos));
    
    // Actualizar puntos
    jugadorRanking.puntos = Math.max(0, jugadorRanking.puntos - puntosPerdidos);
    oponenteRanking.puntos += Math.floor(puntosPerdidos / 2);
    
    // Actualizar estadísticas
    arena.rachaVictorias = 0;
    
    // Registrar en historial
    arena.historial.unshift({
        oponente: oponenteSeleccionado.nombre,
        resultado: "derrota",
        puntos: -puntosPerdidos,
        fecha: new Date().toLocaleDateString(),
        nivelOponente: oponenteSeleccionado.nivel
    });
    
    // Limitar historial a 10 entradas
    if (arena.historial.length > 10) arena.historial.pop();
    
    // Mensaje de derrota
    let mensaje = document.getElementById("log-arena").textContent;
    mensaje += `\n☠️ **DERROTA** ☠️\n`;
    mensaje += `⚠️ -${puntosPerdidos} puntos de arena\n`;
    mensaje += `📊 Puntos totales: ${jugadorRanking.puntos}\n`;
    mensaje += `💡 Consejo: Mejora tu equipo y estrategia\n`;
    
    document.getElementById("log-arena").textContent = mensaje;
    enCombatePvP = false;
    
    // Actualizar UI
    actualizarUI();
    cargarRankingArena();
    actualizarListaOponentes();
}

// Función para verificar recarga diaria de combates
function verificarRecargaCombates() {
    const ahora = Date.now();
    const ultimoCombate = arena.ultimoCombate || ahora;
    
    // Si ha pasado un día (24 horas), recargar combates
    if (ahora - ultimoCombate >= 86400000) {
        arena.combatesRestantes = arena.combatesDiarios;
        arena.ultimoCombate = ahora;
    }
    
    // Actualizar UI
    const combatesElement = document.querySelector(".btn-desafiar");
    if (combatesElement) {
        combatesElement.textContent = `Desafiar (${arena.combatesRestantes}/${arena.combatesDiarios})`;
    }
}

// Función para mostrar estadísticas PvP
function mostrarEstadisticasPvP() {
    const statsContainer = document.createElement("div");
    statsContainer.className = "estadisticas-pvp";
    
    statsContainer.innerHTML = `
        <h3>📊 Tus Estadísticas PvP</h3>
        <p>Combates totales: ${arena.totalCombates}</p>
        <p>Victorias: ${arena.totalVictorias} (${arena.totalCombates > 0 ? 
           Math.round((arena.totalVictorias / arena.totalCombates) * 100) : 0}%)</p>
        <p>Racha actual: ${arena.rachaVictorias} victorias</p>
        <p>Mejor racha: ${arena.mayorRacha} victorias</p>
        
        <h4>Últimos combates:</h4>
        <ul class="historial-combates">
            ${arena.historial.map(combate => `
                <li class="${combate.resultado}">
                    ${combate.resultado === "victoria" ? "✅" : "❌"} 
                    vs ${combate.oponente} (Nv. ${combate.nivelOponente}) - 
                    ${combate.puntos > 0 ? "+" : ""}${combate.puntos} pts - 
                    ${combate.fecha}
                </li>
            `).join("")}
        </ul>
    `;
    
    // Mostrar en el log de arena
    document.getElementById("log-arena").appendChild(statsContainer);
}

// Inicializar arena al cargar
window.addEventListener('load', () => {
    setTimeout(inicializarArena, 1000); // Esperar 1 segundo para asegurar carga
});