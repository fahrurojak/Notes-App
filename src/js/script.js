class NoteForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                input, textarea {
                    padding: 0.5rem;
                    border: 1px solid #48484a;
                    border-radius: 8px;
                    background-color: #3a3a3c;
                    color: #e5e5ea;
                    font-size: 1rem;
                }
                input:invalid, textarea:invalid {
                    border-color: #ff3b30; /* Red border for invalid inputs */
                }
                button {
                    padding: 0.5rem;
                    border: none;
                    border-radius: 8px;
                    background-color: #007aff;
                    color: #ffffff;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s, transform 0.2s;
                }
                button:hover {
                    background-color: #0051a2;
                    transform: scale(1.05);
                }
            </style>
            <form>
                <input type="text" name="title" placeholder="Title" required>
                <textarea name="body" placeholder="Note" rows="5" required></textarea>
                <button type="submit">Add Note</button>
            </form>
        `;

        this.form = this.shadowRoot.querySelector('form');
        this.titleInput = this.shadowRoot.querySelector('input[name="title"]');
        this.bodyTextarea = this.shadowRoot.querySelector('textarea[name="body"]');

        this.titleInput.addEventListener('input', this.validateInput.bind(this));
        this.bodyTextarea.addEventListener('input', this.validateInput.bind(this));

        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    validateInput(event) {
        const input = event.target;
        if (!input.validity.valid) {
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const title = this.titleInput.value;
        const body = this.bodyTextarea.value;

        if (this.form.checkValidity()) {
            this.dispatchEvent(new CustomEvent('add-note', {
                detail: { title, body },
                bubbles: true,
                composed: true
            }));
        }
    }
}

customElements.define('note-form', NoteForm);

class NoteItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title', 'body', 'date', 'id', 'archived'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'title' || name === 'body' || name === 'date' || name === 'archived') {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title');
        const body = this.getAttribute('body');
        const date = this.getAttribute('date');
        const id = this.getAttribute('id');
        const archived = this.getAttribute('archived') === 'true';

        this.shadowRoot.innerHTML = `
            <style>
                .note-item {
                    background-color: #2c2c2e;
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), 
                    0 24px 48px rgba(0, 0, 0, 0.2);
                    flex: 1 1 calc(33.333% - 1rem);
                    margin-bottom: 1rem;
                    display: flex;
                    flex-direction: column;
                    transition: transform 0.3s;
                }
                .note-item:hover {
                    transform: scale(1.05);
                }
                .note-item h3 {
                    margin: 0;
                    font-size: 1.25rem;
                    color: #ffffff;
                }
                .note-item p {
                    margin: 0.5rem 0;
                    color: #ffffff;
                }
                .note-item .note-controls {
                    margin-top: auto;
                    display: flex;
                    gap: 0.5rem;
                }
                .note-item button {
                    background-color: #2c2c2e;
                    color: #ffffff;
                    border: 1px solid transparent;
                    border-radius: 5px;
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: border-color 0.3s;
                }
                .note-item button:hover {
                    border-color: #ffffff;
                }
                .note-item button.archive {
                    background-color: #2c2c2e;
                    border-color: #e5e5ea;
                }
                .note-item button.archive:hover {
                    border-color: #ffffff;
                }
                .note-item button.delete {
                    background-color: #2c2c2e;
                    border-color: #ffffff; 
                }
                .note-item button.delete:hover {
                    border-color: #ffffff;
                }
            </style>
            <div class="note-item">
                <h3>${title}</h3>
                <p>${body}</p>
                <p><em>${date}</em></p>
                <div class="note-controls">
                    <button class="archive">${archived ? 'Unarchive' : 'Archive'}</button>
                    <button class="delete">Delete</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.archive').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('toggle-archive', {
                detail: { id },
                bubbles: true,
                composed: true
            }));
            this.showPopup(archived ? 'Note unarchived successfully!' : 'Note archived successfully!');
        });

        this.shadowRoot.querySelector('.delete').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-note', {
                detail: { id },
                bubbles: true,
                composed: true
            }));
        });
    }

    showPopup(message) {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        popup.innerText = message;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, 2000);
    }
}

customElements.define('note-item', NoteItem);

document.addEventListener('DOMContentLoaded', () => {
    const notesContainer = document.getElementById('notes-container');
    const archivedNotesContainer = document.getElementById('archived-notes-container');
    const modal = document.getElementById('modal');
    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.getElementById('closeModal');
    const searchInput = document.getElementById('searchInput');

    modal.style.display = 'none';

    openModalButton.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Dummy data
    const notes = [
        { title: 'Meeting Notes', body: 'Discuss project timeline and deliverables.', date: '2024-07-30 10:00 AM', id: '1', archived: false },
        { title: 'Grocery List', body: 'Buy milk, bread, and eggs.', date: '2024-07-31 09:00 AM', id: '2', archived: false },
        { title: 'Workout Plan', body: 'Monday: Chest and Triceps, Tuesday: Back and Biceps.', date: '2024-07-29 08:00 AM', id: '3', archived: true }
    ];

    const saveNotes = () => {
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    };

    const renderNotes = () => {
        notesContainer.innerHTML = '';
        archivedNotesContainer.innerHTML = '';

        const searchTerm = searchInput.value.toLowerCase();

        notes.forEach(note => {
            if (note.title.toLowerCase().includes(searchTerm) || note.body.toLowerCase().includes(searchTerm)) {
                const noteElement = document.createElement('note-item');
                noteElement.setAttribute('title', note.title);
                noteElement.setAttribute('body', note.body);
                noteElement.setAttribute('date', note.date);
                noteElement.setAttribute('id', note.id);
                noteElement.setAttribute('archived', note.archived);
                if (note.archived) {
                    archivedNotesContainer.appendChild(noteElement);
                } else {
                    notesContainer.appendChild(noteElement);
                }
            }
        });
    };

    searchInput.addEventListener('input', renderNotes);

    document.addEventListener('add-note', (e) => {
        const { title, body } = e.detail;
        const date = new Date().toLocaleString();
        const id = Date.now().toString();

        notes.push({ title, body, date, id, archived: false });
        saveNotes();
        closeModal();
    });

    document.addEventListener('toggle-archive', (e) => {
        const { id } = e.detail;
        const note = notes.find(note => note.id === id);
        if (note) {
            note.archived = !note.archived;
            saveNotes();
        }
    });

    document.addEventListener('delete-note', (e) => {
        const { id } = e.detail;
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            notes.splice(noteIndex, 1);
            saveNotes();
        }
    });

    renderNotes();
});
