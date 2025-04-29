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
  // Verificar si el jugador existe en el objeto principal del juego
  if (!window.jugador) {
    console.error("El objeto jugador no está disponible");
    return false;
  }

  // Si es forzado (manual), verificar costo
  if (forzar) {
    if (jugador.rubies < 5) {
      alert('Necesitas 5 rubíes para refrescar la tienda');
      return false;
    }
    
    if (!confirm('¿Gastar 5 rubíes para refrescar la tienda?')) {
      return false;
    }
    
    jugador.rubies -= 5;
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
          ${item.precioRubies > 0 ? `💎 ${item.precioRubies}` : `🪙 ${item.precioOro}`}
        </button>
      </div>
    `).join('');
  }

  // Mostrar inventario del jugador (para vender)
  if (contenedorInventario && window.jugador && window.jugador.inventario) {
    if (jugador.inventario.length > 0) {
      contenedorInventario.innerHTML = jugador.inventario.map(item => `
        <div class="item-inventario">
          <img src="${item.img}" alt="${item.nombre}">
          <p>${item.nombre}</p>
          <button onclick="venderItem(${item.id})" class="btn-vender">
            Vender 🪙 ${Math.floor((item.precio || (item.precioRubies ? item.precioRubies * 50 : 0)) * 0.7)}
          </button>
        </div>
      `).join('');
    } else {
      contenedorInventario.innerHTML = `
        <div class="inventario-vacio" style="grid-column: 1 / -1; text-align: center; padding: 20px;">
          <p>No tienes items en tu inventario</p>
          <p>Compra algunos en la tienda o completa misiones para obtener recompensas</p>
        </div>
      `;
    }
  }
}

// Inicialización de la tienda
function inicializarTienda() {
  // Verificar si el jugador ya está definido en el objeto principal del juego
  if (!window.jugador) {
    console.error("El objeto jugador no está disponible");
    return;
  }
  
  // Iniciar el temporizador antes de generar items
  reiniciarTemporizador();
  
  // Generar items iniciales sin costo
  generarItems();
}

// Funciones para comprar/vender items
function comprarItem(itemId) {
  const item = tienda.itemsDisponibles.find(i => i.id === itemId);
  if (!item) return;
  
  // Verificar espacio en el inventario
  if (jugador.inventario.length >= MAX_INVENTARIO) {
    alert('¡Tu inventario está lleno! No puedes comprar más items.');
    return;
  }
  
  if (item.precioRubies > 0) {
    if (jugador.rubies < item.precioRubies) {
      alert('No tienes suficientes rubíes para comprar este item');
      return;
    }
    jugador.rubies -= item.precioRubies;
  } else {
    if (jugador.oro < item.precioOro) {
      alert('No tienes suficiente oro para comprar este item');
      return;
    }
    jugador.oro -= item.precioOro;
  }
  
  // Añadir el item al inventario del jugador
  jugador.inventario.push(item);
  
  // Actualizar todas las interfaces relevantes
  actualizarTiendaUI();
  actualizarRecursosUI();
  actualizarInventarioUI(); // Actualiza la vista general del inventario
  actualizarUI(); // Actualiza toda la UI del juego
  
  // Actualizar progreso de misiones si corresponde
  actualizarProgresoMisiones('conseguirItem', 1);
  
  alert(`¡Has comprado ${item.nombre} con éxito!`);
}

function venderItem(itemId) {
  const itemIndex = jugador.inventario.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;
  
  const item = jugador.inventario[itemIndex];
  const precioVenta = Math.floor((item.precio || (item.precioRubies ? item.precioRubies * 50 : 0)) * 0.7);
  
  if (!confirm(`¿Vender ${item.nombre} por ${precioVenta} oro?`)) return;
  
  jugador.oro += precioVenta;
  jugador.inventario.splice(itemIndex, 1);
  
  // Actualizar todas las interfaces relevantes
  actualizarTiendaUI();
  actualizarRecursosUI();
  actualizarInventarioUI(); // Actualiza la vista general del inventario
  actualizarUI(); // Actualiza toda la UI del juego
  
  alert(`¡Has vendido ${item.nombre} por ${precioVenta} oro!`);
}

function actualizarRecursosUI() {
  if (window.jugador) {
    const oroElement = document.getElementById('oro-value');
    const rubiesElement = document.getElementById('rubies-value');
    
    if (oroElement) oroElement.textContent = jugador.oro;
    if (rubiesElement) rubiesElement.textContent = jugador.rubies;
  }
}

// Hacer la función de refresco disponible globalmente
window.refrescarTienda = refrescarTienda;

// Llamar a inicializarTienda cuando la página cargue
window.addEventListener('load', function() {
  // Esperar un momento para asegurar que el objeto jugador esté disponible
  setTimeout(inicializarTienda, 100);
});