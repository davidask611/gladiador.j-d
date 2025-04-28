// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo = "info") {
    const notificacion = document.createElement("div");
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add("fade-out");
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
}

// Generar IDs únicos
function generarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Efectos visuales
function mostrarEfectoCompra(item, conRubies) {
    const efecto = document.createElement("div");
    efecto.className = `efecto-compra ${conRubies ? "rubies" : "oro"}`;
    efecto.innerHTML = `+1 ${item.nombre}`;
    document.getElementById("tienda-container").appendChild(efecto);
    
    efecto.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-50px)' }
    ], {
        duration: 1000,
        easing: "ease-out"
    }).onfinish = () => efecto.remove();
}

// Función para generar nuevos items en la tienda
function generarNuevosBienes() {
    try {
        tienda.itemsDisponibles = [];
        
        // Ajustar cantidad según nivel del jugador
        const baseItems = 3 + Math.floor(jugador.nivel / 5);
        const cantidadItems = Math.min(baseItems + Math.floor(Math.random() * 3), 8);
        
        // Calcular calidad base según nivel
        const calidadBase = Math.min(1 + jugador.nivel * 0.1, 3);
        
        // Posibilidad de rebaja (10% chance)
        tienda.rebajaActiva = Math.random() < 0.1;
        if (tienda.rebajaActiva) {
            mostrarNotificacion("¡Rebaja especial en la tienda!", "destacado");
        }
        
        for (let i = 0; i < cantidadItems; i++) {
            // Variar el nivel del item (+/- 20%)
            const nivelItem = jugador.nivel * (0.8 + Math.random() * 0.4);
            const item = generarItemAleatorio(nivelItem, calidadBase);
            
            // Ajustar precios
            let multiplicadorPrecio = tienda.precioMultiplier * (0.9 + Math.random() * 0.2);
            if (tienda.rebajaActiva) multiplicadorPrecio *= 0.7; // 30% de descuento
            
            item.precio = Math.floor(item.precio * multiplicadorPrecio);
            
            // Items premium (rubíes)
            if (Math.random() < 0.15 + jugador.nivel * 0.01) {
                item.precioRubies = Math.max(1, Math.floor(item.precio / (40 + jugador.nivel)));
                item.precio = tienda.rebajaActiva ? Math.floor(item.precio * 0.5) : 0; // Permitir compra con oro durante rebajas
                item.calidad = "premium";
            }
            
            tienda.itemsDisponibles.push(item);
        }
        
        programarNuevosBienes();
        actualizarTiendaUI();
        
    } catch (error) {
        console.error("Error generando nuevos bienes:", error);
        mostrarNotificacion("Error al generar items de la tienda", "error");
    }
}

// Programar próxima actualización de tienda
function programarNuevosBienes() {
    tienda.tiempoProximosBienes = Date.now() + TIEMPO_ACTUALIZACION_TIENDA;
    localStorage.setItem('tiendaProximosBienes', tienda.tiempoProximosBienes);
    localStorage.setItem('tiendaItems', JSON.stringify(tienda.itemsDisponibles));
}

// Función para comprar un item de la tienda
function comprarItem(itemIndex, conRubies = false) {
    try {
        const item = tienda.itemsDisponibles[itemIndex];
        if (!item) {
            mostrarNotificacion("El item seleccionado ya no está disponible", "error");
            return;
        }
        
        // Validar método de pago
        const precio = conRubies ? item.precioRubies : item.precio;
        const moneda = conRubies ? "rubies" : "oro";
        const monedaTexto = conRubies ? "rubíes" : "oro";
        
        if (precio === undefined || precio <= 0) {
            mostrarNotificacion(`Este ítem no se puede comprar con ${monedaTexto}`, "error");
            return;
        }
        
        if (jugador[moneda] < precio) {
            mostrarNotificacion(`No tienes suficiente ${monedaTexto} (Necesitas ${precio})`, "error");
            return;
        }
        
        if (jugador.inventario.length >= MAX_INVENTARIO) {
            mostrarNotificacion("¡Inventario lleno! Vende algunos items primero.", "error");
            return;
        }
        
        // Procesar compra
        jugador[moneda] -= precio;
        const nuevoItem = { 
            ...item,
            id: generarUUID(),
            comprado: Date.now(),
            precioOriginal: item.precio // Guardar precio original para ventas
        };
        
        jugador.inventario.push(nuevoItem);
        tienda.itemsDisponibles.splice(itemIndex, 1);
        
        // Efectos y actualizaciones
        mostrarEfectoCompra(nuevoItem, conRubies);
        mostrarNotificacion(`¡${nuevoItem.nombre} adquirido! (-${precio} ${monedaTexto})`, "exito");
        
        // Actualizar interfaces de forma optimizada
        actualizarInterfaces();
        
        // Actualizar progreso de misiones
        actualizarProgresoMisiones('conseguirItem', 1);
        if (conRubies) {
            actualizarProgresoMisiones('gastarRubies', precio);
        } else {
            actualizarProgresoMisiones('gastarOro', precio);
        }
        
        // Guardar estado
        guardarEstadoJugador();
        
    } catch (error) {
        console.error("Error en compra:", error);
        mostrarNotificacion("Error al procesar la compra", "error");
    }
}

// Función para vender un item
function venderItem(itemIndex) {
    try {
        const item = jugador.inventario[itemIndex];
        if (!item) {
            mostrarNotificacion("Ítem no encontrado en el inventario", "error");
            return;
        }

        // Verificar si el item está equipado
        const itemEquipado = Object.values(jugador.equipo).some(e => e && e.id === item.id);
        if (itemEquipado) {
            mostrarNotificacion("¡No puedes vender un item equipado!", "error");
            return;
        }

        // Calcular precio de venta (50% del precio base o 70% si es premium)
        const precioVenta = Math.floor((item.precioOriginal || item.precio) * 
                           (item.calidad === "premium" ? 0.7 : 0.5));
        
        // Vender el item
        jugador.oro += precioVenta;
        jugador.inventario.splice(itemIndex, 1);
        
        // Mostrar notificación
        mostrarNotificacion(`¡${item.nombre} vendido por ${precioVenta} oro!`, "exito");
        
        // Actualizar interfaces
        actualizarInterfaces();
        actualizarProgresoMisiones('conseguirOro', precioVenta);
        
        // Guardar estado
        guardarEstadoJugador();
        
    } catch (error) {
        console.error("Error vendiendo item:", error);
        mostrarNotificacion("Error al procesar la venta", "error");
    }
}

// Actualización optimizada de todas las interfaces
function actualizarInterfaces() {
    // Usar debounce para evitar múltiples actualizaciones
    if (this.updateTimeout) clearTimeout(this.updateTimeout);
    
    this.updateTimeout = setTimeout(() => {
        actualizarUI();
        actualizarTiendaUI();
        actualizarInventarioUI();
        actualizarInventarioTienda();
        actualizarVestuarioUI();
    }, 50);
}

// Función para actualizar la UI de la tienda
function actualizarTiendaUI() {
    const contenedorTienda = document.getElementById("tienda-items");
    const contenedorTemporizador = document.getElementById("tienda-temporizador");
    const rebajaBadge = document.getElementById("tienda-rebaja-badge");
    
    if (!contenedorTienda || !contenedorTemporizador) return;
    
    // Mostrar/u ocultar badge de rebaja
    if (rebajaBadge) {
        rebajaBadge.style.display = tienda.rebajaActiva ? "block" : "none";
    }
    
    // Actualizar items de la tienda
    contenedorTienda.innerHTML = "";
    
    if (tienda.itemsDisponibles.length === 0) {
        contenedorTienda.innerHTML = "<p class='tienda-vacia'>No hay items disponibles en la tienda</p>";
    } else {
        tienda.itemsDisponibles.forEach((item, index) => {
            const itemElement = document.createElement("div");
            itemElement.className = `item-tienda ${item.calidad || ""}`;
            itemElement.draggable = true;
            itemElement.dataset.index = index;
            itemElement.dataset.tipo = "tienda";
            
            // Precio con descuento si hay rebaja (asegurar entero)
            const precioMostrado = tienda.rebajaActiva && item.precio > 0 ? 
                                 Math.floor(item.precio * 0.7) : Math.floor(item.precio);
            
            itemElement.innerHTML = `
                <div class="item-tienda-header">
                    <img src="${item.img}" alt="${item.nombre}" draggable="false">
                    ${item.calidad === "premium" ? '<span class="premium-badge">★</span>' : ''}
                </div>
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p class="item-desc">${item.descripcion}</p>
                    <div class="item-precios">
                        ${item.precioRubies ? 
                            `<p class="precio-rubies" title="Precio con rubíes">💎 ${Math.floor(item.precioRubies)}</p>` : ''}
                        ${item.precio > 0 ? 
                            `<p class="precio-oro ${tienda.rebajaActiva ? 'rebaja' : ''}" title="Precio con oro">
                                ${tienda.rebajaActiva ? `<span class="precio-tachado">${Math.floor(item.precio)}</span> ` : ''}
                                ${Math.floor(precioMostrado)} 💰
                            </p>` : ''}
                    </div>
                </div>
                <div class="item-tooltip">
                    <h4>${item.nombre}</h4>
                    <p>${item.descripcion}</p>
                    ${Object.entries(item)
                        .filter(([key, val]) => ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val)
                        .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: +${Math.floor(val)}`)
                        .join('<br>')}
                    ${item.calidad === "premium" ? '<br><br><em>Item exclusivo</em>' : ''}
                </div>
            `;
            
            // Evento de doble click para compra rápida (mostrar valores enteros en confirm)
            itemElement.addEventListener("dblclick", () => {
                if (item.precioRubies) {
                    if (confirm(`¿Comprar ${item.nombre} por ${Math.floor(item.precioRubies)} rubíes?`)) {
                        comprarItem(index, true);
                    }
                } else if (item.precio > 0) {
                    if (confirm(`¿Comprar ${item.nombre} por ${Math.floor(precioMostrado)} oro?`)) {
                        comprarItem(index);
                    }
                }
            });
            
            itemElement.addEventListener("dragstart", dragStart);
            contenedorTienda.appendChild(itemElement);
        });
    }
    
    // Actualizar temporizador
    actualizarTemporizadorTienda();
}

// Función para actualizar el temporizador de la tienda
function actualizarTemporizadorTienda() {
    const contenedorTemporizador = document.getElementById("tienda-temporizador");
    if (!contenedorTemporizador) return;
    
    const tiempoAlmacenado = localStorage.getItem('tiendaProximosBienes');
    if (!tiempoAlmacenado || tienda.itemsDisponibles.length === 0) {
        generarNuevosBienes();
        return;
    }
    
    const tiempoRestante = parseInt(tiempoAlmacenado) - Date.now();
    
    if (tiempoRestante <= 0) {
        generarNuevosBienes();
    } else {
        // Convertir a horas, minutos, segundos
        const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);
        
        contenedorTemporizador.innerHTML = `
            <h3>Nuevos items en:</h3>
            <div class="temporizador">
                ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}
            </div>
            <p>Items disponibles: ${tienda.itemsDisponibles.length}</p>
            ${tienda.rebajaActiva ? '<p class="rebaja-texto">¡Rebaja activa!</p>' : ''}
        `;
        
        setTimeout(actualizarTemporizadorTienda, 1000);
    }
}

// Función para actualizar el inventario en la tienda
function actualizarInventarioTienda() {
    const inventarioContainer = document.getElementById("inventario-tienda-container");
    if (!inventarioContainer) return;
    
    inventarioContainer.innerHTML = "";
    
    if (jugador.inventario.length === 0) {
        inventarioContainer.innerHTML = "<p class='inventario-vacio'>Inventario vacío</p>";
        return;
    }
    
    jugador.inventario.forEach((item, index) => {
        const itemElement = document.createElement("div");
        itemElement.className = `item-inventario ${estaEquipado(item.id) ? "equipado" : ""}`;
        itemElement.draggable = true;
        itemElement.dataset.index = index;
        itemElement.dataset.tipo = "inventario";
        
        // Calcular precio de venta
        const precioVenta = Math.floor((item.precioOriginal || item.precio) / 
                             (item.calidad === "premium" ? 1.4 : 2));
        
    itemElement.innerHTML = `
        <div class="item-inventario-img">
            <img src="${item.img}" alt="${item.nombre}" draggable="false">
            ${estaEquipado(item.id) ? '<span class="equipado-badge">E</span>' : ''}
        </div>
        <div class="item-tooltip">
            <h4>${item.nombre}</h4>
            <p>${item.descripcion}</p>
            ${Object.entries(item)
                .filter(([key, val]) => ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val)
                .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: +${Math.floor(val)}`)
                .join('<br>')}
            <br><br>💰 Valor de venta: ${Math.floor((item.precioOriginal || item.precio) / (item.calidad === "premium" ? 1.4 : 2))} oro
            ${item.calidad === "premium" ? '<br><em>Item premium</em>' : ''}
        </div>
         `;
        
        // Evento de doble click para venta rápida
        itemElement.addEventListener("dblclick", () => {
            if (confirm(`¿Vender ${item.nombre} por ${precioVenta} oro?`)) {
                venderItem(index);
            }
        });
        
        itemElement.addEventListener("dragstart", dragStart);
        inventarioContainer.appendChild(itemElement);
    });
}

// Funciones para el arrastre y soltado
function dragStart(e) {
    e.dataTransfer.setData("text/plain", JSON.stringify({
        tipo: e.target.dataset.tipo,
        index: e.target.dataset.index
    }));
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");
}

function dragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
}

function drop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    
    try {
        const data = JSON.parse(e.dataTransfer.getData("text/plain"));
        
        // Compra desde tienda
        if (data.tipo === "tienda" && e.currentTarget.closest("#inventario-tienda-container")) {
            const item = tienda.itemsDisponibles[parseInt(data.index)];
            if (item.precioRubies) {
                if (confirm(`¿Comprar ${item.nombre} por ${item.precioRubies} rubíes?`)) {
                    comprarItem(parseInt(data.index), true);
                }
            } else if (item.precio > 0) {
                const precio = tienda.rebajaActiva ? Math.floor(item.precio * 0.7) : item.precio;
                if (confirm(`¿Comprar ${item.nombre} por ${precio} oro?`)) {
                    comprarItem(parseInt(data.index));
                }
            }
        }
        // Venta a la tienda
        else if (data.tipo === "inventario" && e.currentTarget.closest("#tienda-items")) {
            const item = jugador.inventario[parseInt(data.index)];
            const precioVenta = Math.floor((item.precioOriginal || item.precio) / 
                               (item.calidad === "premium" ? 1.4 : 2));
            
            if (confirm(`¿Vender ${item.nombre} por ${precioVenta} oro?`)) {
                venderItem(parseInt(data.index));
            }
        }
    } catch (error) {
        console.error("Error en drop:", error);
    }
}

// Inicializar la tienda
function inicializarTienda() {
    // Configurar eventos de arrastre
    setupDragAndDrop();
    
    // Cargar tienda desde localStorage o generar nueva
    const tiendaGuardada = localStorage.getItem('tiendaItems');
    const tiempoProximosBienes = localStorage.getItem('tiendaProximosBienes');
    
    if (tiendaGuardada && tiempoProximosBienes) {
        try {
            tienda.itemsDisponibles = JSON.parse(tiendaGuardada);
            tienda.tiempoProximosBienes = parseInt(tiempoProximosBienes);
            
            // Verificar si es necesario generar nuevos items
            if (Date.now() > tienda.tiempoProximosBienes || tienda.itemsDisponibles.length === 0) {
                generarNuevosBienes();
            }
        } catch (e) {
            console.error("Error cargando tienda:", e);
            generarNuevosBienes();
        }
    } else {
        generarNuevosBienes();
    }
    
    actualizarTiendaUI();
}

// Configurar eventos de drag and drop
function setupDragAndDrop() {
    const dropZones = [
        "tienda-items", 
        "inventario-tienda-container",
        "inventario-container"
    ];
    
    dropZones.forEach(zoneId => {
        const zone = document.getElementById(zoneId);
        if (!zone) return;
        
        zone.addEventListener("dragover", dragOver);
        zone.addEventListener("dragleave", dragLeave);
        zone.addEventListener("drop", drop);
    });
    
    // Reiniciar clase dragging al finalizar
    document.addEventListener("dragend", (e) => {
        document.querySelectorAll(".dragging").forEach(el => {
            el.classList.remove("dragging");
        });
    });
}

// Verificar si un item está equipado
function estaEquipado(itemId) {
    return Object.values(jugador.equipo).some(item => item && item.id === itemId);
}

// Guardar estado del jugador optimizado
function guardarEstadoJugador() {
    const datosGuardar = {
        oro: jugador.oro,
        rubies: jugador.rubies,
        inventario: jugador.inventario.map(item => ({
            id: item.id,
            nombre: item.nombre,
            tipo: item.tipo,
            precio: item.precio,
            precioOriginal: item.precioOriginal,
            calidad: item.calidad
        }))
    };
    
    localStorage.setItem('jugadorData', JSON.stringify(datosGuardar));
}

// Filtrar inventario con soporte para drag and drop
function filtrarInventario(filtro) {
    const itemsContainer = document.getElementById("items-container");
    if (!itemsContainer) return;
    
    itemsContainer.innerHTML = "";
    
    let itemsFiltrados = jugador.inventario;
    
    if (filtro !== 'todos') {
        itemsFiltrados = jugador.inventario.filter(item => {
            if (filtro === 'armas') return item.tipo === 'arma';
            if (filtro === 'armaduras') return ['casco', 'pechera', 'guantes', 'botas', 'escudo'].includes(item.tipo);
            if (filtro === 'accesorios') return ['anillo', 'pendiente'].includes(item.tipo);
            if (filtro === 'consumibles') return item.tipo === 'pocion';
            return true;
        });
    }
    
    if (itemsFiltrados.length === 0) {
        itemsContainer.innerHTML = "<p class='inventario-vacio'>No hay items de este tipo</p>";
        return;
    }
    
    itemsFiltrados.forEach((item, index) => {
        const originalIndex = jugador.inventario.findIndex(i => i.id === item.id);
        if (originalIndex === -1) return;
        
        const itemElement = document.createElement("div");
        itemElement.className = `item-inventario ${estaEquipado(item.id) ? "equipado" : ""}`;
        itemElement.draggable = true;
        itemElement.dataset.index = originalIndex;
        itemElement.dataset.tipo = "inventario";
        
        itemElement.innerHTML = `
            <div class="item-inventario-img">
                <img src="${item.img}" alt="${item.nombre}" draggable="false">
                ${estaEquipado(item.id) ? '<span class="equipado-badge">E</span>' : ''}
            </div>
            <div class="item-tooltip">
                <h4>${item.nombre}</h4>
                <p>${item.tipo === 'pocion' ? `Curación: +${item.curacion}<br>` : ''}                
                ${item.descripcion}<br>
                ${Object.entries(item)
                    .filter(([key, val]) => ['fuerza', 'habilidad', 'agilidad', 'constitucion', 'carisma', 'inteligencia'].includes(key) && val)
                    .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: +${val}`)
                    .join('<br>')}
                <br><br>💰 Valor: ${Math.floor((item.precioOriginal || item.precio) / 2)} oro
                ${item.calidad === "premium" ? '<br><em>Item premium</em>' : ''}
            </div>
        `;
        
        itemElement.addEventListener("click", () => equiparItem(item.id));
        itemElement.addEventListener("dragstart", dragStart);
        itemsContainer.appendChild(itemElement);
    });
}

function formatearValor(valor) {
    // Redondear hacia abajo (floor) para mostrar solo la parte entera
    return Math.floor(valor);
}

// Ejemplo de uso en tu código:
const dañoFormateado = formatearValor(9.843233850031746); // Devuelve 9
const defensaFormateada = formatearValor(23.999999); // Devuelve 23



// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    inicializarTienda();
    actualizarInventarioTienda();
});