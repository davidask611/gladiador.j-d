// Base de datos de usuarios (simulada)
const usuariosDB = JSON.parse(localStorage.getItem('usuariosDB')) || {};

function showTab(tabId) {
    // Ocultar todos los formularios
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Mostrar el formulario seleccionado
    document.getElementById(`${tabId}-form`).classList.add('active');
    
    // Actualizar pestañas activas
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Limpiar mensajes
    document.querySelectorAll('.auth-message').forEach(msg => {
        msg.style.display = 'none';
    });
}

function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `auth-message ${isError ? 'error' : 'success'}`;
    element.style.display = 'block';
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!username || !password) {
        showMessage('login-message', 'Por favor completa todos los campos', true);
        return;
    }
    
    if (!usuariosDB[username]) {
        showMessage('login-message', 'Usuario no encontrado', true);
        return;
    }
    
    if (usuariosDB[username].password !== password) {
        showMessage('login-message', 'Contraseña incorrecta', true);
        return;
    }
    
    showMessage('login-message', 'Inicio de sesión exitoso! Redirigiendo...');
    
    // Guardar usuario actual en localStorage
    localStorage.setItem('usuarioActual', JSON.stringify({
        username: username,
        jugador: usuariosDB[username].jugador
    }));
    
    // Redirigir después de 1.5 segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

function register() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirm = document.getElementById('register-confirm').value.trim();
    
    if (!username || !password || !confirm) {
        showMessage('register-message', 'Por favor completa todos los campos', true);
        return;
    }
    
    if (password !== confirm) {
        showMessage('register-message', 'Las contraseñas no coinciden', true);
        return;
    }
    
    if (usuariosDB[username]) {
        showMessage('register-message', 'Este usuario ya existe', true);
        return;
    }
    
    if (username.length < 4) {
        showMessage('register-message', 'El usuario debe tener al menos 4 caracteres', true);
        return;
    }
    
    if (password.length < 6) {
        showMessage('register-message', 'La contraseña debe tener al menos 6 caracteres', true);
        return;
    }
    
    // Crear nuevo usuario con datos iniciales del jugador
    usuariosDB[username] = {
        password: password,
        jugador: {
            nombre: username,
            nivel: 1,
            vida: 100,
            vidaMax: 100,
            exp: 0,
            expParaSubir: 100,
            oro: 50,
            rubies: 0,
            victorias: 0,
            familia: "Sin clan",
            danoMin: 2,
            danoMax: 2,
            armadura: 0,
            precision: 75,
            evasion: 10,
            combatesDisponibles: 12,
            combatesMaximos: 12,
            statsBase: {
                fuerza: 5,
                habilidad: 5,
                agilidad: 5,
                constitucion: 5,
                carisma: 5,
                inteligencia: 5
            },
            inventario: []
        }
    };
    
    // Guardar en localStorage
    localStorage.setItem('usuariosDB', JSON.stringify(usuariosDB));
    
    showMessage('register-message', 'Registro exitoso! Por favor inicia sesión.');
    
    // Cambiar a pestaña de login después de 1.5 segundos
    setTimeout(() => {
        showTab('login');
        document.getElementById('login-username').value = username;
        document.getElementById('login-password').value = '';
        document.getElementById('login-password').focus();
    }, 1500);
}

// Cargar datos del usuario si ya está logueado
document.addEventListener('DOMContentLoaded', () => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioActual) {
        window.location.href = 'index.html';
    }
});

function logout() {
    // Eliminar el usuario actual del localStorage
    localStorage.removeItem('usuarioActual');
    
    // Redirigir a la página de login
    window.location.href = 'cuenta.html';
}