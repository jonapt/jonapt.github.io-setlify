import { AuthManager } from './auth.js';
import { StorageManager } from './storage.js';
import { UI } from './ui.js';
import { SetList, Song } from './models.js';

class SetlifyApp {
    constructor() {
        this.auth = new AuthManager();
        this.setlists = [];
        this.currentSetlistId = null;
        this.currentSongIndex = null;
        this.isLoading = false;
        
        // Escuchar cambios de autenticación
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.loadUserData();
                this.showAppContent();
                UI.showToast(`👋 Bienvenido, ${user.displayName || user.email}`);
            } else {
                this.showLoginScreen();
            }
        });
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showLoginScreen();
    }

    setupEventListeners() {
        // Eventos de autenticación
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterScreen();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreenOnly();
        });

        document.getElementById('showForgotPassword')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showResetPasswordScreen();
        });

        document.getElementById('backToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginScreenOnly();
        });

        document.getElementById('resetPasswordForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleResetPassword();
        });

        // Eventos de la app
        document.getElementById('btnAddSetlist')?.addEventListener('click', () => {
            this.showAddSetlistModal();
        });

        document.getElementById('btnAddSong')?.addEventListener('click', () => {
            this.showAddSongModal();
        });

        document.getElementById('btnBackToSetlists')?.addEventListener('click', () => {
            UI.showView('setlists-view');
            this.renderSetlists();
        });

        document.getElementById('btnBackToSongs')?.addEventListener('click', () => {
            UI.showView('songs-view');
            this.renderSongs();
        });

        document.getElementById('setlists-list')?.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                this.openSetlist(card.dataset.id);
            }
        });

        document.getElementById('songs-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.song-item');
            if (item) {
                this.openSong(parseInt(item.dataset.index));
            }
        });

        document.getElementById('btnExport')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('btnImport')?.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput')?.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
            }
        });

        document.getElementById('modal')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                UI.closeModal();
            }
        });

        // Evento para publicar setlist
        document.getElementById('btnPublishSetlist')?.addEventListener('click', () => {
            this.publishCurrentSetlist();
        });
    }

    // ========== MÉTODOS DE AUTENTICACIÓN ==========

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            UI.showToast('⚠️ Por favor ingresa email y contraseña');
            return;
        }

        UI.showToast('🔄 Iniciando sesión...');
        const result = await this.auth.login(email, password);
        if (!result.success) {
            UI.showToast('❌ Error: ' + result.error);
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (!name || !email || !password) {
            UI.showToast('⚠️ Todos los campos son requeridos');
            return;
        }

        if (password !== confirmPassword) {
            UI.showToast('⚠️ Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            UI.showToast('⚠️ La contraseña debe tener al menos 6 caracteres');
            return;
        }

        UI.showToast('🔄 Registrando usuario...');
        const result = await this.auth.register(email, password, name);
        if (!result.success) {
            UI.showToast('❌ Error: ' + result.error);
        }
    }

    async handleLogout() {
        UI.showConfirm('¿Estás seguro de que quieres cerrar sesión?', async () => {
            await this.auth.logout();
            this.setlists = [];
            this.showLoginScreen();
            UI.showToast('👋 Sesión cerrada');
        });
    }

    async handleResetPassword() {
        const email = document.getElementById('resetEmail').value.trim();
        if (!email) {
            UI.showToast('⚠️ Por favor ingresa tu email');
            return;
        }

        UI.showToast('🔄 Enviando enlace de recuperación...');
        const result = await this.auth.resetPassword(email);
        if (result.success) {
            UI.showToast('✅ Revisa tu correo para restablecer la contraseña');
            this.showLoginScreenOnly();
        } else {
            UI.showToast('❌ Error: ' + result.error);
        }
    }

    // ========== MÉTODOS DE DATOS ==========

    async loadUserData() {
        const user = this.auth.getUser();
        if (!user) return;

        try {
            UI.showToast('📥 Cargando tus datos...');
            this.setlists = await StorageManager.loadUserSetlists(user.uid);
            this.renderSetlists();
            UI.showToast(`✅ ${this.setlists.length} set lists cargados`);
        } catch (error) {
            console.error('Error cargando datos:', error);
            UI.showToast('❌ Error cargando tus datos');
        }
    }

    async saveUserData() {
        const user = this.auth.getUser();
        if (!user) return;

        if (this.isLoading) return;
        this.isLoading = true;

        try {
            await StorageManager.saveUserSetlists(user.uid, this.setlists);
        } catch (error) {
            console.error('Error guardando:', error);
            UI.showToast('❌ Error guardando datos');
        } finally {
            this.isLoading = false;
        }
    }

    // ========== MÉTODOS DE VISTA ==========

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContent').style.display = 'none';
    }

    showAppContent() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').style.display = 'block';
        
        const user = this.auth.getUser();
        if (user) {
            document.getElementById('userEmail').textContent = user.email;
        }
    }

    showRegisterScreen() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('resetPasswordForm').style.display = 'none';
    }

    showLoginScreenOnly() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('resetPasswordForm').style.display = 'none';
    }

    showResetPasswordScreen() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('resetPasswordForm').style.display = 'block';
    }

    // ========== MÉTODOS DE SETLISTS ==========

    renderSetlists() {
        UI.renderSetlists(this.setlists);
    }

    renderSongs() {
        const setlist = this.getCurrentSetlist();
        if (setlist) {
            UI.renderSongs(setlist);
        }
    }

    getCurrentSetlist() {
        return this.setlists.find(s => s.id === this.currentSetlistId);
    }

    openSetlist(id) {
        this.currentSetlistId = id;
        UI.showView('songs-view');
        this.renderSongs();
    }

    openSong(index) {
        const setlist = this.getCurrentSetlist();
        if (!setlist || !setlist.songs[index]) return;
        this.currentSongIndex = index;
        UI.renderLyrics(setlist.songs[index]);
        UI.showView('lyrics-view');
    }

    showAddSetlistModal() {
        const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        UI.showModal(
            '🎵 Nuevo Set List',
            [
                { id: 'name', label: 'Nombre del Set List', type: 'text', required: true },
                { id: 'key', label: 'Tonalidad', type: 'select', options: keys, value: 'C', required: true }
            ],
            async (data) => {
                if (!data.name.trim()) {
                    UI.showToast('⚠️ Por favor ingresa un nombre');
                    return;
                }
                const setlist = new SetList(null, data.name.trim(), data.key);
                this.setlists.push(setlist);
                await this.saveUserData();
                this.renderSetlists();
                UI.closeModal();
                UI.showToast('✅ Set List creado exitosamente');
            },
            'Crear'
        );
    }

    showAddSongModal() {
        const setlist = this.getCurrentSetlist();
        if (!setlist) {
            UI.showToast('⚠️ Primero selecciona un Set List');
            return;
        }

        UI.showModal(
            '🎶 Agregar Canción',
            [
                { id: 'title', label: 'Título', type: 'text', required: true },
                { id: 'artist', label: 'Artista', type: 'text' },
                { id: 'key', label: 'Tonalidad', type: 'text', value: setlist.key, required: true },
                { id: 'lyrics', label: 'Letra', type: 'textarea' }
            ],
            async (data) => {
                if (!data.title.trim()) {
                    UI.showToast('⚠️ Por favor ingresa un título');
                    return;
                }
                const song = new Song(null, data.title.trim(), data.artist.trim(), data.key, data.lyrics);
                setlist.addSong(song);
                await this.saveUserData();
                this.renderSongs();
                UI.closeModal();
                UI.showToast('✅ Canción agregada exitosamente');
            },
            'Agregar'
        );
    }

    async publishCurrentSetlist() {
        const setlist = this.getCurrentSetlist();
        if (!setlist) {
            UI.showToast('⚠️ No hay set list seleccionado');
            return;
        }

        if (setlist.songs.length === 0) {
            UI.showToast('⚠️ El set list está vacío. Agrega canciones primero.');
            return;
        }

        UI.showConfirm(
            `¿Publicar "${setlist.name}" para que otros músicos lo vean?`,
            async () => {
                const result = await StorageManager.publishSetlist(setlist);
                if (result.success) {
                    UI.showToast('✅ Set List publicado exitosamente');
                } else {
                    UI.showToast('❌ Error al publicar: ' + result.error);
                }
            }
        );
    }

    // ========== MÉTODOS DE EXPORTACIÓN/IMPORTACIÓN ==========

    exportData() {
        if (this.setlists.length === 0) {
            UI.showToast('⚠️ No hay datos para exportar');
            return;
        }

        const json = JSON.stringify(this.setlists.map(s => s.toJSON()), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `setlify-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        UI.showToast('📤 Datos exportados exitosamente');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) {
                    UI.showToast('❌ Formato de archivo inválido');
                    return;
                }

                UI.showConfirm(
                    `Se importarán ${data.length} set lists. ¿Reemplazar o agregar?`,
                    async () => {
                        const imported = data.map(item => SetList.fromJSON(item));
                        // Reemplazar (agregar al final)
                        this.setlists = [...this.setlists, ...imported];
                        await this.saveUserData();
                        this.renderSetlists();
                        UI.showToast(`✅ ${imported.length} set lists importados`);
                    }
                );
            } catch (error) {
                UI.showToast('❌ Error al importar: archivo inválido');
                console.error(error);
            }
        };
        reader.readAsText(file);
        document.getElementById('fileInput').value = '';
    }

    // ========== SAVE Y RENDER ==========

    async saveAndRender() {
        await this.saveUserData();
        const view = document.querySelector('.view.active');
        if (view?.id === 'setlists-view') {
            this.renderSetlists();
        } else if (view?.id === 'songs-view') {
            this.renderSongs();
        }
    }
}

// Inicializar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SetlifyApp();
});