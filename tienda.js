// Configuración de la tienda
window.tienda = {
  itemsDisponibles: [],
  tiempoRefresco: 120, // 2 minutos en segundos
  temporizador: 120, // Inicializado con el valor correcto
  temporizadorInterval: null
};

// Función para formatear el tiempo (MM:SS)
function formatearTiempo(segundos) {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return `${minutos}:${segs < 10 ? '0' + segs : segs}`;
}

// Función principal para generar items
function generarItems(forzar = false) {
  // Si es forzado (manual), verificar costo
  if (forzar) {
    if (window.jugador.rubies < 5) {
      alert('Necesitas 5 rubíes para refrescar la tienda');
      return false;
    }
    
    if (!confirm('¿Gastar 5 rubíes para refrescar la tienda?')) {
      return false;
    }
    
    window.jugador.rubies -= 5;
    actualizarRecursosUI();
  }

  // Generar nuevos items
  tienda.itemsDisponibles = [];
  const tipos = ['arma', 'casco', 'pechera', 'anillo', 'pocion'];
  
  for (let i = 0; i < 6; i++) {
    const tipo = tipos[Math.floor(Math.random() * tipos.length)];
    const nivel = Math.floor(Math.random() * 10) + 1;
    const esPremium = Math.random() > 0.8; // 20% de chance

    const item = {
      id: Date.now() + i,
      nombre: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} Nv.${nivel}`,
      tipo,
      nivel,
      precioOro: Math.floor(nivel * 15 * (Math.random() + 0.5)),
      precioRubies: esPremium ? Math.floor(nivel * 2) : 0,
      danoMin: tipo === 'arma' ? Math.floor(nivel * 1.5) : 0,
      danoMax: tipo === 'arma' ? Math.floor(nivel * 2.5) : 0,
      defensa: ['casco', 'pechera'].includes(tipo) ? Math.floor(nivel * 1.2) : 0,
      img: `ropa/${tipo}.png`
    };
    tienda.itemsDisponibles.push(item);
  }
  
  // Reiniciar el temporizador
  reiniciarTemporizador();
  actualizarTiendaUI();
  
  if (forzar) {
    alert('¡La tienda ha sido refrescada con nuevos items!');
  }
  return true;
}

// Función para refrescar manualmente (con costo)
function refrescarTienda() {
  return generarItems(true);
}

// Reiniciar el temporizador
// En la función reiniciarTemporizador()
function reiniciarTemporizador() {
  // Limpiar el temporizador anterior si existe
  if (tienda.temporizadorInterval) {
    clearInterval(tienda.temporizadorInterval);
  }
  
  // Asegurarse que el temporizador tenga un valor numérico válido
  tienda.temporizador = Number(tienda.tiempoRefresco) || 120;
  
  // Actualizar UI inmediatamente
  actualizarTemporizadorUI();
  
  // Iniciar el contador
  tienda.temporizadorInterval = setInterval(() => {
    tienda.temporizador--;
    actualizarTemporizadorUI();
    
    if (tienda.temporizador <= 0) {
      generarItems(); // Generar nuevos items automáticamente (sin costo)
    }
  }, 1000);
}
// Actualizar la UI del temporizador
function actualizarTemporizadorUI() {
  // Verificar que el temporizador sea un número válido
  if (isNaN(tienda.temporizador)) {
    tienda.temporizador = tienda.tiempoRefresco;
  }
  
  const tiempoFormateado = formatearTiempo(tienda.temporizador);
  const elemento = document.getElementById('tienda-temporizador');
  
  if (elemento) {
    elemento.textContent = tiempoFormateado;
    
    // Cambiar color cuando queden menos de 30 segundos
    if (tienda.temporizador <= 30) {
      elemento.style.color = 'red';
      elemento.style.fontWeight = 'bold';
    } else {
      elemento.style.color = '';
      elemento.style.fontWeight = '';
    }
  } else {
    console.error('Elemento del temporizador no encontrado');
  }
}

// Actualizar la UI de la tienda e inventario
function actualizarTiendaUI() {
  const contenedorTienda = document.getElementById('tienda-items');
  const contenedorInventario = document.getElementById('inventario-tienda');
  
  // Mostrar items de la tienda
  if (contenedorTienda) {
    contenedorTienda.innerHTML = tienda.itemsDisponibles.map(item => `
      <div class="item-tienda">
        <img src="${item.img}" alt="${item.nombre}">
        <h4>${item.nombre}</h4>
        <p>${item.tipo === 'arma' ? `Daño: ${item.danoMin}-${item.danoMax}` : `Defensa: +${item.defensa}`}</p>
        <button onclick="comprarItem(${item.id})" class="${item.precioRubies > 0 ? 'btn-premium' : 'btn-oro'}">
          ${item.precioRubies > 0 ? `💎 ${item.precioRubies}` : `💰 ${item.precioOro}`}
        </button>
      </div>
    `).join('');
  }

  // Mostrar inventario del jugador (para vender)
  if (contenedorInventario) {
    if (window.jugador?.inventario?.length > 0) {
      contenedorInventario.innerHTML = window.jugador.inventario.map(item => `
        <div class="item-inventario">
          <img src="${item.img}" alt="${item.nombre}">
          <p>${item.nombre}</p>
          <button onclick="venderItem(${item.id})" class="btn-vender">Vender (${Math.floor(item.precioOro * 0.5)}💰)</button>
        </div>
      `).join('');
    } else {
      contenedorInventario.innerHTML = `
        <div class="inventario-vacio">
          <p>No tienes items en tu inventario</p>
        </div>
      `;
    }
  }
}

// Inicialización de la tienda
function inicializarTienda() {
  // Crear jugador básico si no existe
  if (!window.jugador) {
    window.jugador = {
      inventario: [],
      oro: 100,
      rubies: 5
    };
  }
  
  // Iniciar el temporizador antes de generar items
  reiniciarTemporizador();
  
  // Generar items iniciales sin costo
  generarItems();
}

// Llamar a inicializarTienda cuando la página cargue
window.addEventListener('load', inicializarTienda);

// Función para comprar un item (ya existe, pero la modificamos)
function comprarItem(itemId) {
  // Validar que el jugador existe
  if (!window.jugador) {
    console.error('Error: No se encontró el objeto jugador');
    return false;
  }

  // Buscar el item en la tienda
  const item = tienda.itemsDisponibles.find(i => i.id === itemId);
  if (!item) {
    console.error(`Error: Item con ID ${itemId} no encontrado en la tienda`);
    return false;
  }

  // Verificar inventario lleno
  if (window.jugador.inventario.length >= MAX_INVENTARIO) {
    alert('¡Tu inventario está lleno! No puedes comprar más items.');
    return false;
  }

  // Proceso de compra con rubíes
  if (item.precioRubies > 0) {
    if (window.jugador.rubies < item.precioRubies) {
      alert(`Necesitas ${item.precioRubies} rubíes para comprar este item (tienes ${window.jugador.rubies})`);
      return false;
    }
    
    if (!confirm(`¿Gastar ${item.precioRubies} rubíes en ${item.nombre}?`)) {
      return false;
    }
    
    window.jugador.rubies -= item.precioRubies;
  } 
  // Proceso de compra con oro
  else {
    if (window.jugador.oro < item.precioOro) {
      alert(`Necesitas ${item.precioOro} de oro para comprar este item (tienes ${window.jugador.oro})`);
      return false;
    }
    
    if (!confirm(`¿Gastar ${item.precioOro} de oro en ${item.nombre}?`)) {
      return false;
    }
    
    window.jugador.oro -= item.precioOro;
  }

  // Clonar el item para evitar referencias
  const itemComprado = {...item};
  
  // Añadir al inventario
  window.jugador.inventario.push(itemComprado);

  // Actualizar interfaces
  try {
    actualizarTiendaUI();
    actualizarRecursosUI();
    // También asegúrate de llamar a actualizarUI() general si existe
    if (typeof actualizarUI === 'function') {
      actualizarUI();
    }
    
    if (typeof actualizarInventarioUI === 'function') {
      actualizarInventarioUI();
    }
    
    // Actualizar progreso de misiones (si existe)
    if (typeof actualizarProgresoMisiones === 'function') {
      actualizarProgresoMisiones('conseguirItem', 1);
    }
  } catch (error) {
    console.error('Error al actualizar interfaces:', error);
  }

  // Notificación de compra exitosa
  const mensajeExito = item.precioRubies > 0 
    ? `¡Has comprado ${item.nombre} por ${item.precioRubies} rubíes!`
    : `¡Has comprado ${item.nombre} por ${item.precioOro} de oro!`;
  
  alert(mensajeExito);
  return true;
}

function venderItem(itemId) {
  const itemIndex = window.jugador.inventario.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = window.jugador.inventario[itemIndex];
  const precioVenta = Math.floor(item.precioOro * 0.5); // Vender al 50% del precio original

  if (!confirm(`¿Vender ${item.nombre} por ${precioVenta} de oro?`)) {
    return;
  }

  // Eliminar el item del inventario y dar oro al jugador
  window.jugador.inventario.splice(itemIndex, 1);
  window.jugador.oro += precioVenta;

  // Actualizar ambas UIs
  actualizarTiendaUI();
  actualizarRecursosUI();
  
  if (typeof actualizarInventarioUI === 'function') {
    actualizarInventarioUI();
  }

  alert(`¡Has vendido ${item.nombre} por ${precioVenta} de oro!`);
}

function actualizarRecursosUI() {
  if (!window.jugador) return;
  
  // Actualizar todos los elementos de oro y rubíes en todas las secciones
  document.querySelectorAll('[id*="oro"], [id*="rubies"]').forEach(el => {
    if (el.id.includes("oro")) {
      el.textContent = window.jugador.oro;
    } else if (el.id.includes("rubies")) {
      el.textContent = window.jugador.rubies;
    }
  });
  
  // Actualizar botones que dependen de estos valores
  document.querySelectorAll("button[onclick='comprarCombate()']").forEach(btn => {
    btn.disabled = window.jugador.rubies < 1;
  });
}

function generarItemsTienda() {
  const tiendaContainer = document.getElementById("tienda-items");
  tiendaContainer.innerHTML = "";

  // 1. Generar 6-8 items con nivel acorde al jugador (±5 niveles)
  const cantidadItems = 6 + Math.floor(Math.random() * 3);
  const nivelBase = Math.max(1, jugador.nivel - 3 + Math.floor(Math.random() * 7));

  for (let i = 0; i < cantidadItems; i++) {
    const item = generarItemAleatorio(nivelBase);
    
    // 2. Aplicar afijos adicionales en la tienda (33% de chance extra)
    if (Math.random() < 0.33 && item.rareza !== "común") {
      item.nombre = generarNombreConAfijos(item, { forceSuffix: true });
    }

    // 3. Ajustar precio por afijos (multiplicador 1.2x por afijo)
    const multiplicadorAfijos = 1 + (0.2 * (item.nombre.split(" ").length - 2)); // Ej: "Espada" vs "Siniestro Espada del Abismo"
    item.precio = Math.floor(item.precio * multiplicadorAfijos * (item.rareza === "legendario" ? 1.5 : 1));

    // 4. Renderizar en UI
    renderizarItemTienda(item, tiendaContainer);
  }
}

function renderizarItemTienda(item, container) {
  const itemElement = document.createElement("div");
  itemElement.className = "item-tienda";
  itemElement.style.borderColor = item.colorRareza;
  itemElement.innerHTML = `
    <div class="item-header" style="color: ${item.colorRareza}">
      <h3>${item.nombre}</h3>
      <span class="item-tier">Nv. ${item.nivel}</span>
    </div>
    <img src="${item.img}" alt="${item.nombre}">
    <div class="item-stats">
      ${item.danoMin ? `<p>Daño: <strong>${item.danoMin}-${item.danoMax}</strong></p>` : ""}
      ${item.defensa ? `<p>Defensa: <strong>+${item.defensa}</strong></p>` : ""}
      ${item.efectoUnico ? `<p class="efecto-unico">✨ ${item.efectoUnico}</p>` : ""}
    </div>
    <p class="precio-tienda">💰 ${item.precio} oro</p>
    <button onclick="comprarItemTienda(${item.id})">Comprar</button>
  `;
  container.appendChild(itemElement);
}

function comprarItemTienda(itemId) {
  const item = tienda.itemsDisponibles.find(i => i.id === itemId);
  if (!item) return;

  if (jugador.oro >= item.precio) {
    jugador.oro -= item.precio;
    jugador.inventario.push(item);
    actualizarUI();
    actualizarTiendaUI();
  } else {
    alert("¡No tienes suficiente oro!");
  }
}

// Hacer la función de refresco disponible globalmente
window.refrescarTienda = refrescarTienda;