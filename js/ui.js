class UI {
    static showView(viewId) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const view = document.getElementById(viewId);
        if (view) view.classList.add('active');
    }

    static renderSetlists(setlists) {
        const container = document.getElementById('setlists-list');
        if (!container) return;

        if (setlists.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p style="color: var(--text-secondary); text-align: center; padding: 60px 0;">
                        🎵 No hay set lists creados.<br>
                        ¡Crea tu primer set list!
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = setlists.map(setlist => `
            <div class="card" data-id="${setlist.id}">
                <h3>${this.escapeHtml(setlist.name)}</h3>
                <span class="key-badge">🎼 ${setlist.key}</span>
                <div class="song-count">${setlist.getSongCount()} canciones</div>
                ${setlist.isPublic ? '<span class="public-badge">🌐 Público</span>' : ''}
            </div>
        `).join('');
    }

    static renderSongs(setlist) {
        const container = document.getElementById('songs-list');
        if (!container) return;

        document.getElementById('setlist-title').textContent = setlist.name;

        // Mostrar botón de publicar
        const publishBtn = document.getElementById('btnPublishSetlist');
        if (publishBtn) {
            publishBtn.style.display = setlist.songs.length > 0 ? 'inline-block' : 'none';
        }

        if (setlist.songs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">
                        📝 No hay canciones en este set list.<br>
                        ¡Agrega tu primera canción!
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = setlist.songs.map((song, index) => `
            <div class="song-item" data-index="${index}">
                <div class="song-info">
                    <div class="song-title">${this.escapeHtml(song.title)}</div>
                    <div class="song-artist">${this.escapeHtml(song.artist || 'Artista desconocido')}</div>
                </div>
                <span class="song-key">🎼 ${song.key}</span>
            </div>
        `).join('');
    }

    static renderLyrics(song) {
        document.getElementById('song-title').textContent = song.title;
        const container = document.getElementById('lyrics-content');
        if (!container) return;
        container.textContent = song.lyrics || '📝 No hay letra disponible.';
    }

    static showModal(title, fields, onSubmit, submitLabel = 'Guardar') {
        const modal = document.getElementById('modal');
        const body = document.getElementById('modal-body');
        if (!modal || !body) return;

        let html = `<h3>${title}</h3>`;
        fields.forEach(field => {
            html += `
                <div class="form-group">
                    <label>${field.label}</label>
                    ${field.type === 'textarea' 
                        ? `<textarea id="${field.id}" ${field.required ? 'required' : ''}>${field.value || ''}</textarea>`
                        : field.type === 'select'
                        ? `<select id="${field.id}" ${field.required ? 'required' : ''}>
                            ${field.options.map(opt => 
                                `<option value="${opt}" ${opt === field.value ? 'selected' : ''}>${opt}</option>`
                            ).join('')}
                        </select>`
                        : `<input type="${field.type || 'text'}" id="${field.id}" value="${field.value || ''}" ${field.required ? 'required' : ''}>`
                    }
                </div>
            `;
        });

        html += `
            <div class="modal-actions">
                <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn-primary" id="modalSubmit">${submitLabel}</button>
            </div>
        `;

        body.innerHTML = html;
        modal.classList.add('active');

        document.getElementById('modalSubmit').addEventListener('click', () => {
            const formData = {};
            fields.forEach(field => {
                const element = document.getElementById(field.id);
                if (element) {
                    formData[field.id] = element.value;
                }
            });
            onSubmit(formData);
        });
    }

    static closeModal() {
        const modal = document.getElementById('modal');
        if (modal) modal.classList.remove('active');
    }

    static showConfirm(message, onConfirm) {
        const modal = document.getElementById('modal');
        const body = document.getElementById('modal-body');
        if (!modal || !body) return;

        body.innerHTML = `
            <h3>Confirmar</h3>
            <p style="margin: 16px 0; color: var(--text-secondary);">${message}</p>
            <div class="modal-actions">
                <button class="btn-secondary" onclick="UI.closeModal()">Cancelar</button>
                <button class="btn-primary" id="confirmBtn">Confirmar</button>
            </div>
        `;

        modal.classList.add('active');
        document.getElementById('confirmBtn').addEventListener('click', () => {
            UI.closeModal();
            onConfirm();
        });
    }

    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static showToast(message, duration = 3000) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #1A1A2E;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: fadeIn 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// Hacer UI global para que funcione con onclick
window.UI = UI;