// Birth date: March 2023
const BIRTH_MONTH = 3; // March
const BIRTH_YEAR = 2023;

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let entries = [];
let currentEditingId = null;
let selectedPhotos = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    renderTimeline();
    setupEventListeners();
    populateMonthSelect();
});

function setupEventListeners() {
    // Add entry button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-entry-btn';
    addBtn.innerHTML = '+';
    addBtn.onclick = () => openEntryModal();
    document.body.appendChild(addBtn);

    // Modal close buttons
    document.querySelector('.close').onclick = closeEntryModal;
    document.querySelector('.close-detail').onclick = closeDetailModal;
    document.getElementById('cancelBtn').onclick = closeEntryModal;

    // Form submission
    document.getElementById('entryForm').onsubmit = handleFormSubmit;

    // Photo input
    document.getElementById('entryPhotos').addEventListener('change', handlePhotoSelect);

    // Close modals when clicking outside
    window.onclick = (event) => {
        const entryModal = document.getElementById('entryModal');
        const detailModal = document.getElementById('detailModal');
        if (event.target === entryModal) {
            closeEntryModal();
        }
        if (event.target === detailModal) {
            closeDetailModal();
        }
    };
}

function populateMonthSelect() {
    const select = document.getElementById('entryMonth');
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        select.appendChild(option);
    });
}

function calculateAge(month, year) {
    const birthDate = new Date(BIRTH_YEAR, BIRTH_MONTH - 1);
    const entryDate = new Date(year, month - 1);
    const diffTime = entryDate - birthDate;
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    if (diffMonths < 0) return 'Not born yet';
    if (diffMonths === 0) return 'Newborn';
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} old`;
    
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    if (remainingMonths === 0) {
        return `${years} year${years > 1 ? 's' : ''} old`;
    }
    return `${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} old`;
}

function openEntryModal(entryId = null) {
    currentEditingId = entryId;
    const modal = document.getElementById('entryModal');
    const form = document.getElementById('entryForm');
    const title = document.getElementById('modalTitle');
    
    if (entryId) {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            title.textContent = 'Edit Entry';
            document.getElementById('entryMonth').value = entry.month;
            document.getElementById('entryYear').value = entry.year;
            document.getElementById('entryNote').value = entry.note || '';
            selectedPhotos = entry.photos ? [...entry.photos] : [];
            renderPhotoPreview();
        }
    } else {
        title.textContent = 'Add New Entry';
        form.reset();
        selectedPhotos = [];
        renderPhotoPreview();
    }
    
    modal.style.display = 'block';
}

function closeEntryModal() {
    document.getElementById('entryModal').style.display = 'none';
    currentEditingId = null;
    selectedPhotos = [];
    document.getElementById('entryForm').reset();
    renderPhotoPreview();
}

function handlePhotoSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedPhotos.push({
                    name: file.name,
                    data: e.target.result
                });
                renderPhotoPreview();
            };
            reader.readAsDataURL(file);
        }
    });
    event.target.value = '';
}

function renderPhotoPreview() {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    
    selectedPhotos.forEach((photo, index) => {
        const div = document.createElement('div');
        div.className = 'photo-preview-item';
        const img = document.createElement('img');
        img.src = photo.data;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-photo';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => {
            selectedPhotos.splice(index, 1);
            renderPhotoPreview();
        };
        div.appendChild(img);
        div.appendChild(removeBtn);
        preview.appendChild(div);
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const month = parseInt(document.getElementById('entryMonth').value);
    const year = parseInt(document.getElementById('entryYear').value);
    const note = document.getElementById('entryNote').value.trim();
    
    if (!month || !year) {
        alert('Please select both month and year');
        return;
    }
    
    const entry = {
        id: currentEditingId || Date.now().toString(),
        month,
        year,
        note,
        photos: selectedPhotos,
        createdAt: currentEditingId ? 
            entries.find(e => e.id === currentEditingId)?.createdAt || Date.now() :
            Date.now()
    };
    
    if (currentEditingId) {
        const index = entries.findIndex(e => e.id === currentEditingId);
        if (index !== -1) {
            entries[index] = entry;
        }
    } else {
        entries.push(entry);
    }
    
    saveEntries();
    renderTimeline();
    closeEntryModal();
}

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    if (entries.length === 0) {
        timeline.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 1.2em; margin-bottom: 10px;">No entries yet</p>
                <p>Click the + button to add your first entry!</p>
            </div>
        `;
        return;
    }
    
    // Sort entries by year and month (newest first)
    const sortedEntries = [...entries].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });
    
    sortedEntries.forEach(entry => {
        const entryEl = createEntryElement(entry);
        timeline.appendChild(entryEl);
    });
}

function createEntryElement(entry) {
    const div = document.createElement('div');
    div.className = 'timeline-entry';
    div.onclick = () => openDetailModal(entry.id);
    
    const age = calculateAge(entry.month, entry.year);
    const dateStr = `${months[entry.month - 1]} ${entry.year}`;
    const previewNote = entry.note ? 
        (entry.note.length > 150 ? entry.note.substring(0, 150) + '...' : entry.note) :
        'No note added';
    
    let photosHtml = '';
    if (entry.photos && entry.photos.length > 0) {
        const previewPhotos = entry.photos.slice(0, 3);
        photosHtml = '<div class="entry-photos-preview">';
        previewPhotos.forEach(photo => {
            photosHtml += `<img src="${photo.data}" alt="Photo" class="photo-thumb">`;
        });
        if (entry.photos.length > 3) {
            photosHtml += `<div class="photo-thumb" style="display: flex; align-items: center; justify-content: center; background: #e9ecef; color: #666; font-weight: bold;">+${entry.photos.length - 3}</div>`;
        }
        photosHtml += '</div>';
    }
    
    div.innerHTML = `
        <div class="entry-header">
            <div class="entry-date">${dateStr}</div>
            <div class="entry-age">${age}</div>
        </div>
        <div class="entry-preview">${previewNote}</div>
        ${photosHtml}
    `;
    
    return div;
}

function openDetailModal(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('detailTitle');
    const content = document.getElementById('detailContent');
    
    const age = calculateAge(entry.month, entry.year);
    const dateStr = `${months[entry.month - 1]} ${entry.year}`;
    
    title.textContent = `${dateStr} • ${age}`;
    
    let photosHtml = '';
    if (entry.photos && entry.photos.length > 0) {
        photosHtml = '<div class="detail-photos">';
        entry.photos.forEach(photo => {
            photosHtml += `<img src="${photo.data}" alt="Photo" onclick="window.open(this.src, '_blank')">`;
        });
        photosHtml += '</div>';
    }
    
    const noteHtml = entry.note ? 
        `<div class="detail-note">${entry.note.replace(/\n/g, '<br>')}</div>` :
        '<div class="detail-note empty">No note added for this entry</div>';
    
    content.innerHTML = `
        ${photosHtml}
        ${noteHtml}
        <div style="margin-top: 20px; text-align: right;">
            <button class="btn btn-primary" onclick="openEntryModal('${entry.id}'); closeDetailModal();">Edit Entry</button>
            <button class="btn btn-secondary" onclick="deleteEntry('${entry.id}')" style="margin-left: 10px;">Delete Entry</button>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

function deleteEntry(entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(e => e.id !== entryId);
        saveEntries();
        renderTimeline();
        closeDetailModal();
    }
}

// Make functions available globally for inline onclick handlers
window.openEntryModal = openEntryModal;
window.closeDetailModal = closeDetailModal;
window.deleteEntry = deleteEntry;

function saveEntries() {
    try {
        localStorage.setItem('growthTimelineEntries', JSON.stringify(entries));
    } catch (e) {
        console.error('Error saving entries:', e);
        alert('Error saving entry. Your browser may not support local storage.');
    }
}

function loadEntries() {
    try {
        const saved = localStorage.getItem('growthTimelineEntries');
        if (saved) {
            entries = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading entries:', e);
        entries = [];
    }
}

