// Define the custom elements for note form and note item
class NoteForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .note-form {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .note-form input, .note-form textarea {
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 0.75rem;
                    font-size: 1rem;
                }
                .note-form button {
                    background-color: #007bff;
                    color: #ffffff;
                    border: none;
                    border-radius: 5px;
                    padding: 0.75rem;
                    font-size: 1rem;
                    cursor: pointer;
                }
                .note-form button:hover {
                    background-color: #0056b3;
                }
            </style>
            <form class="note-form">
                <input type="text" id="note-title" placeholder="Title" required>
                <textarea id="note-body" placeholder="Note content" required></textarea>
                <button type="submit" disabled>Add Note</button>
            </form>
        `;

        this.form = this.shadowRoot.querySelector('form');
        this.titleInput = this.shadowRoot.querySelector('#note-title');
        this.bodyInput = this.shadowRoot.querySelector('#note-body');
        this.submitButton = this.shadowRoot.querySelector('button');

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = this.titleInput.value;
            const body = this.bodyInput.value;
            this.dispatchEvent(new CustomEvent('add-note', {
                detail: { title, body },
                bubbles: true,
                composed: true
            }));
            this.form.reset();
            this.submitButton.disabled = true;
        });

        this.titleInput.addEventListener('input', this.validateForm.bind(this));
        this.bodyInput.addEventListener('input', this.validateForm.bind(this));
    }

    validateForm() {
        const titleValid = this.titleInput.value.trim().length > 0;
        const bodyValid = this.bodyInput.value.trim().length > 0;

        this.submitButton.disabled = !(titleValid && bodyValid);
    }
}

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
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
                    color: #333;
                }
                .note-item p {
                    margin: 0.5rem 0;
                    color: #666;
                }
                .note-item .note-controls {
                    margin-top: auto;
                    display: flex;
                    gap: 0.5rem;
                }
                .note-item button {
                    background-color: #007bff;
                    color: #ffffff;
                    border: none;
                    border-radius: 5px;
                    padding: 0.5rem 1rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                }
                .note-item button:hover {
                    background-color: #0056b3;
                }
                .note-item button.archive {
                    background-color: #ffc107;
                }
                .note-item button.archive:hover {
                    background-color: #e0a800;
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
        });

        this.shadowRoot.querySelector('.delete').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('delete-note', {
                detail: { id },
                bubbles: true,
                composed: true
            }));
        });
    }
}

customElements.define('note-form', NoteForm);
customElements.define('note-item', NoteItem);

document.addEventListener('DOMContentLoaded', () => {
    const notesContainer = document.getElementById('notes-container');
    const archivedNotesContainer = document.getElementById('archived-notes-container');
    const modal = document.getElementById('modal');
    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.getElementById('closeModal');

    // Ensure modal is initially hidden
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

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    const saveNotes = () => {
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    };

    const renderNotes = () => {
        notesContainer.innerHTML = '';
        archivedNotesContainer.innerHTML = '';

        notes.forEach(note => {
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
        });
    };

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
        if (noteIndex > -1) {
            notes.splice(noteIndex, 1);
            saveNotes();
        }
    });

    const closeModal = () => {
        modal.style.display = 'none';
    };

    renderNotes();
});
