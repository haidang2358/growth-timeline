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
    populateMonthSelect();
    configureYearInput();
    renderTimeline();
    setupEventListeners();
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

function configureYearInput() {
    const yearInput = document.getElementById('entryYear');
    if (!yearInput) return;

    const currentYear = new Date().getFullYear();
    yearInput.setAttribute('min', BIRTH_YEAR);
    yearInput.setAttribute('max', currentYear + 10);
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

function openEntryModal(entryId = null, presetMonth = null, presetYear = null) {
    if (!entryId && presetMonth && presetYear) {
        const existingEntry = entries.find(e => e.month === presetMonth && e.year === presetYear);
        if (existingEntry) {
            openEntryModal(existingEntry.id);
            return;
        }
    }

    currentEditingId = entryId;
    const modal = document.getElementById('entryModal');
    const form = document.getElementById('entryForm');
    const title = document.getElementById('modalTitle');
    const monthSelect = document.getElementById('entryMonth');
    const yearInput = document.getElementById('entryYear');
    const noteInput = document.getElementById('entryNote');
    
    if (entryId) {
        const entry = entries.find(e => e.id === entryId);
        if (entry) {
            title.textContent = 'Edit Entry';
            monthSelect.value = entry.month;
            yearInput.value = entry.year;
            noteInput.value = entry.note || '';
            selectedPhotos = entry.photos ? [...entry.photos] : [];
            renderPhotoPreview();
        }
    } else {
        title.textContent = 'Add New Memory';
        form.reset();
        selectedPhotos = [];
        renderPhotoPreview();

        const now = new Date();
        const defaultMonth = presetMonth || now.getMonth() + 1;
        const defaultYear = presetYear || now.getFullYear();

        monthSelect.value = defaultMonth;
        yearInput.value = Math.max(defaultYear, BIRTH_YEAR);
        noteInput.value = '';
    }
    
    modal.style.display = 'block';
    monthSelect.focus();
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

    const existingEntry = entries.find(e => e.month === month && e.year === year);
    if (!currentEditingId && existingEntry) {
        const replace = confirm('A memory for this month already exists. Replace it with your new details?');
        if (!replace) {
            return;
        }
        currentEditingId = existingEntry.id;
        if (selectedPhotos.length === 0 && existingEntry.photos) {
            selectedPhotos = [...existingEntry.photos];
        }
    }

    const entryId = currentEditingId || Date.now().toString();
    const entry = {
        id: entryId,
        month,
        year,
        note,
        photos: selectedPhotos,
        createdAt: currentEditingId ?
            entries.find(e => e.id === currentEditingId)?.createdAt || Date.now() :
            Date.now()
    };

    const index = entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
        entries[index] = entry;
    } else {
        entries.push(entry);
    }

    saveEntries();
    renderTimeline();
    closeEntryModal();
}

function generateTimelinePeriods() {
    const periods = [];
    const start = new Date(BIRTH_YEAR, BIRTH_MONTH - 1, 1);
    const now = new Date();
    let end = new Date(now.getFullYear(), now.getMonth(), 1);

    if (entries.length > 0) {
        const latestEntryDate = entries.reduce((latest, entry) => {
            const entryDate = new Date(entry.year, entry.month - 1, 1);
            return entryDate > latest ? entryDate : latest;
        }, new Date(start));
        if (latestEntryDate > end) {
            end = latestEntryDate;
        }
    }

    const cursor = new Date(end);
    while (cursor >= start) {
        periods.push({
            month: cursor.getMonth() + 1,
            year: cursor.getFullYear()
        });
        cursor.setMonth(cursor.getMonth() - 1);
    }

    return periods;
}

function createYearMarker(year) {
    const marker = document.createElement('div');
    marker.className = 'timeline-year-marker';
    marker.innerHTML = `<span class="year-badge">${year}</span>`;
    return marker;
}

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    const periods = generateTimelinePeriods();

    if (entries.length === 0) {
        const intro = document.createElement('div');
        intro.className = 'timeline-intro';
        intro.innerHTML = `
            <h3>Start capturing her journey</h3>
            <p>Select any month below to add notes and photos.</p>
        `;
        timeline.appendChild(intro);
    }

    let currentYearMarker = null;
    const currentDate = new Date();

    periods.forEach(({ month, year }) => {
        if (year !== currentYearMarker) {
            currentYearMarker = year;
            timeline.appendChild(createYearMarker(year));
        }

        const entry = entries.find(e => e.month === month && e.year === year);
        const entryEl = createEntryElement(entry, month, year, currentDate);
        timeline.appendChild(entryEl);
    });
}

function createEntryElement(entry, month, year, currentDate) {
    const div = document.createElement('div');
    div.className = 'timeline-entry';

    const age = calculateAge(month, year);
    const dateStr = `${months[month - 1]} ${year}`;
    const isCurrentMonth = year === currentDate.getFullYear() && month === currentDate.getMonth() + 1;

    if (isCurrentMonth) {
        div.classList.add('current');
    }

    if (entry) {
        div.onclick = () => openDetailModal(entry.id);

        const previewNote = entry.note ?
            (entry.note.length > 150 ? entry.note.substring(0, 150) + '...' : entry.note) :
            'No note added yet';

        let photosHtml = '';
        if (entry.photos && entry.photos.length > 0) {
            const previewPhotos = entry.photos.slice(0, 3);
            photosHtml = '<div class="entry-photos-preview">';
            previewPhotos.forEach(photo => {
                photosHtml += `<img src="${photo.data}" alt="Photo" class="photo-thumb">`;
            });
            if (entry.photos.length > 3) {
                photosHtml += `<div class="photo-thumb photo-thumb-more">+${entry.photos.length - 3}</div>`;
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
    } else {
        div.classList.add('empty');
        div.onclick = () => openEntryModal(null, month, year);
        div.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${dateStr}</div>
                <div class="entry-age">${age}</div>
            </div>
            <div class="entry-preview empty">No memory captured yet. Click to add one!</div>
            <div class="entry-actions">
                <button type="button" class="btn btn-primary btn-small">Add Memory</button>
            </div>
        `;

        const addButton = div.querySelector('button');
        addButton.onclick = (event) => {
            event.stopPropagation();
            openEntryModal(null, month, year);
        };
    }

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

