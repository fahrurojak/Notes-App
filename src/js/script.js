const renderNotes = () => {
    const notesContainer = document.getElementById('notes-container');
    const archivedNotesContainer = document.getElementById('archived-notes-container');

    notesContainer.innerHTML = '';
    archivedNotesContainer.innerHTML = '';

    notesData.forEach(note => {
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
};

document.addEventListener('DOMContentLoaded', () => {
    renderNotes();

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (event) => {
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

    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.getElementById('closeModal');
    const modal = document.getElementById('modal');

    // Initially hide the modal
    modal.style.display = 'none';

    openModalButton.addEventListener('click', () => {
        modal.style.display = 'flex'; // Show the modal
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Hide the modal
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none'; // Hide the modal if clicked outside
        }
    });
});
