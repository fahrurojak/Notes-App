class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* Add styles for header */
                header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #2c2c2e;
                    color: #e5e5ea;
                    padding: 1rem;
                    text-align: center;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
                    border-bottom: 1px solid #ffffff;
                }
                header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                header input {
                    padding: 0.5rem;
                    border: 1px solid #48484a;
                    border-radius: 8px;
                    background-color: #3a3a3c;
                    color: #e5e5ea;
                    font-size: 0.875rem;
                    width: 100%;
                    max-width: 300px;
                    outline: none;
                    transition: border-color 0.3s;
                }
                header input::placeholder {
                    color: #b9b9b9;
                }
                header input:focus {
                    border-color: #007aff;
                }
            </style>
            <header>
                <h1>My Notes</h1>
                <input type="text" id="searchInput" class="search-input" placeholder="Search notes...">
            </header>
        `;
    }
}
class NoteItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['title', 'body', 'createdat', 'archived'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    render() {
        const title = this.getAttribute('title');
        const body = this.getAttribute('body');
        const createdAt = this.getAttribute('createdat');
        const archived = this.getAttribute('archived') === 'true';

        this.shadowRoot.innerHTML = `
         <style>
    .note {
        position: relative;
        background: #2c2c2e;
        padding: 1rem;
        margin: 1rem 0;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    .note::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border: 2px solid white;
        border-radius: 5px;
        box-sizing: border-box;
        animation: border-rotate 4s linear infinite;
    }

    @keyframes border-rotate {
        0% {
            clip-path: polygon(0 0, 100% 0, 100% 2px, 0 2px);
        }
        25% {
            clip-path: polygon(100% 0, 100% 100%, 98% 100%, 98% 0);
        }
        50% {
            clip-path: polygon(100% 100%, 0 100%, 0 98%, 100% 98%);
        }
        75% {
            clip-path: polygon(0 100%, 0 0, 2px 0, 2px 100%);
        }
        100% {
            clip-path: polygon(0 0, 100% 0, 100% 2px, 0 2px);
        }
    }

    .note-title {
        font-weight: bold;
        font-size: 1.2rem;
    }

    .note-body {
        margin: 0.5rem 0;
    }

    .note-date {
        font-size: 0.8rem;
        color: #888;
    }

    .note-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 0.5rem;
    }

    .note-actions button {
        border: none;
        background: none;
        cursor: pointer;
        font-size: 0.8rem;
    }

    .archive-btn {
        color: ${archived ? '#0f0' : '#fff263'};
    }

    .archive-btn:hover {
        background-color: #e0ffe0;
        color: #007a00;
    }

    .delete-btn {
        color: #ff3b3b;
    }

    .delete-btn:hover {
        background-color: #ffcccc;
        color: #d32f2f;
    }
</style>
            <div class="note">
                <div class="note-title">${title}</div>
                <div class="note-body">${body}</div>
                <div class="note-date">Created at: ${new Date(createdAt).toLocaleDateString()}</div>
                <div class="note-actions">
                    <button class="archive-btn">${archived ? 'Unarchive' : 'Archive'}</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.archive-btn').addEventListener('click', () => {
            const noteIndex = notesData.findIndex(note => note.title === title && note.body === body);
            if (noteIndex > -1) {
                notesData[noteIndex].archived = !archived;
                renderNotes();
            }
        });

        this.shadowRoot.querySelector('.delete-btn').addEventListener('click', () => {
            const noteIndex = notesData.findIndex(note => note.title === title && note.body === body);
            if (noteIndex > -1) {
                notesData.splice(noteIndex, 1);
                renderNotes();
            }
        });
    }
}

class NoteForm extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .form-container input, .form-container textarea {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .form-container button {
                    padding: 0.5rem;
                    border: none;
                    background: #007BFF;
                    color: white;
                    border-radius: 5px;
                    cursor: pointer;
                }
            </style>
            <div class="form-container">
                <input type="text" id="noteTitle" placeholder="Note Title">
                <textarea id="noteBody" placeholder="Note Content"></textarea>
                <button id="saveNote">Save Note</button>
            </div>
        `;

        this.shadowRoot.querySelector('#saveNote').addEventListener('click', () => {
            const noteTitle = this.shadowRoot.querySelector('#noteTitle').value;
            const noteBody = this.shadowRoot.querySelector('#noteBody').value;

            if (noteTitle && noteBody) {
                const newNote = {
                    id: `notes-${Math.random().toString(36).substr(2, 9)}`,
                    title: noteTitle,
                    body: noteBody,
                    createdAt: new Date().toISOString(),
                    archived: false
                };

                notesData.push(newNote);
                renderNotes();
                document.getElementById('modal').style.display = 'none';
            } else {
                alert('Please fill out both the title and content.');
            }
        });
    }
}

class NoteFilter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .filter-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 1rem;
                }

                .filter-input {
                    padding: 0.5rem;
                    border: 1px solid #48484a;
                    border-radius: 8px;
                    background-color: #3a3a3c;
                    color: #e5e5ea;
                    font-size: 0.875rem;
                    outline: none;
                }

                .filter-input::placeholder {
                    color: #b9b9b9;
                }
            </style>
            <div class="filter-container">
                <input type="text" id="filterInput" class="filter-input" placeholder="Search notes...">
            </div>
        `;

        this.shadowRoot.querySelector('#filterInput').addEventListener('input', (event) => {
            const query = event.target.value.toLowerCase();
            const filteredNotes = notesData.filter(note =>
                note.title.toLowerCase().includes(query) ||
                note.body.toLowerCase().includes(query)
            );

            const notesContainer = document.getElementById('notes-container');
            const archivedNotesContainer = document.getElementById('archived-notes-container');

            notesContainer.innerHTML = '';
            archivedNotesContainer.innerHTML = '';

            filteredNotes.forEach(note => {
                const noteElement = document.createElement('note-item');
                noteElement.setAttribute('title', note.title);
                noteElement.setAttribute('body', note.body);
                noteElement.setAttribute('createdat', note.createdAt);
                noteElement.setAttribute('archived', note.archived);

                if (note.archived) {
                    archivedNotesContainer.appendChild(noteElement);
                } else {
                    notesContainer.appendChild(noteElement);
                }
            });
        });
    }
}
customElements.define('app-header', AppHeader);
customElements.define('note-item', NoteItem);
customElements.define('note-form', NoteForm);
customElements.define('note-filter', NoteFilter);
