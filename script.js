// Birth date: March 2023
const BIRTH_MONTH = 3;
const BIRTH_YEAR = 2023;

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

let entries = [];
let currentEditingId = null;
let selectedPhotos = [];

document.addEventListener('DOMContentLoaded', () => {
    loadEntries();
    populateMonthSelect();
    renderTimeline();
    setupEventListeners();
});

function setupEventListeners() {
    const existingAddBtn = document.querySelector('.add-entry-btn');
    const addBtn = existingAddBtn || document.createElement('button');

    if (!existingAddBtn) {
        addBtn.type = 'button';
        addBtn.className = 'add-entry-btn';
        addBtn.innerHTML = '+';
        document.body.appendChild(addBtn);
    }

    addBtn.onclick = () => openEntryModal();

    document.querySelector('.close').onclick = closeEntryModal;
    document.querySelector('.close-detail').onclick = closeDetailModal;
    document.getElementById('cancelBtn').onclick = closeEntryModal;

    document.getElementById('entryForm').onsubmit = handleFormSubmit;
    document.getElementById('entryPhotos').addEventListener('change', handlePhotoSelect);

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
    if (select.options.length > 1) return;

    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        select.appendChild(option);
    });
}

function generateTimelineRange() {
    const now = new Date();
    let startYear = BIRTH_YEAR;
    let startMonth = BIRTH_MONTH;
    let endYear = now.getFullYear();
    let endMonth = now.getMonth() + 1;

    entries.forEach(entry => {
        if (entry.year < startYear || (entry.year === startYear && entry.month < startMonth)) {
            startYear = entry.year;
            startMonth = entry.month;
        }
        if (entry.year > endYear || (entry.year === endYear && entry.month > endMonth)) {
            endYear = entry.year;
            endMonth = entry.month;
        }
    });

    if (endYear < startYear || (endYear === startYear && endMonth < startMonth)) {
        endYear = startYear;
        endMonth = startMonth;
    }

    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
    const range = [];

    for (let i = totalMonths; i >= 0; i--) {
        const offset = startMonth - 1 + i;
        const month = (offset % 12) + 1;
        const year = startYear + Math.floor(offset / 12);
        range.push({ month, year });
    }

    return range;
}

function isFutureMonth(month, year) {
    const now = new Date();
    if (year > now.getFullYear()) return true;
    if (year === now.getFullYear() && month > now.getMonth() + 1) return true;
    return false;
}

function calculateAge(month, year) {
    const monthOffset = (year - BIRTH_YEAR) * 12 + (month - BIRTH_MONTH);

    if (monthOffset < 0) {
        return 'Not born yet';
    }

    const future = isFutureMonth(month, year);

    if (monthOffset === 0) {
        return future ? 'Will be newborn' : 'Newborn';
    }

    const years = Math.floor(monthOffset / 12);
    const remainingMonths = monthOffset % 12;
    const parts = [];

    if (years > 0) {
        parts.push(`${years} year${years === 1 ? '' : 's'}`);
    }

    if (remainingMonths > 0) {
        parts.push(`${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`);
    }

    const ageText = parts.join(', ') || 'Newborn';

    return future ? `Will be ${ageText}` : `${ageText} old`;
}

function openEntryModal(entryId = null, presetMonth = null, presetYear = null) {
    currentEditingId = entryId;
    const modal = document.getElementById('entryModal');
    const form = document.getElementById('entryForm');
    const title = document.getElementById('modalTitle');
    const monthField = document.getElementById('entryMonth');
    const yearField = document.getElementById('entryYear');
    const noteField = document.getElementById('entryNote');
    const photoInput = document.getElementById('entryPhotos');

    if (entryId) {
        const entry = entries.find(e => e.id === entryId);
        if (!entry) {
            alert('Unable to find this entry.');
            return;
        }
        title.textContent = 'Edit Entry';
        monthField.value = entry.month;
        yearField.value = entry.year;
        noteField.value = entry.note || '';
        selectedPhotos = entry.photos ? entry.photos.map(photo => ({ ...photo })) : [];
        renderPhotoPreview();
    } else {
        title.textContent = 'Add New Entry';
        form.reset();
        const now = new Date();
        monthField.value = presetMonth || (now.getMonth() + 1);
        yearField.value = presetYear || now.getFullYear();
        noteField.value = '';
        selectedPhotos = [];
        renderPhotoPreview();
    }

    if (photoInput) {
        photoInput.value = '';
    }

    modal.style.display = 'block';
}

function closeEntryModal() {
    document.getElementById('entryModal').style.display = 'none';
    currentEditingId = null;
    selectedPhotos = [];
    document.getElementById('entryForm').reset();
    const photoInput = document.getElementById('entryPhotos');
    if (photoInput) {
        photoInput.value = '';
    }
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
        img.alt = photo.name || `Photo ${index + 1}`;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-photo';
        removeBtn.type = 'button';
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

    const month = parseInt(document.getElementById('entryMonth').value, 10);
    const year = parseInt(document.getElementById('entryYear').value, 10);
    const note = document.getElementById('entryNote').value.trim();

    if (!month || !year) {
        alert('Please select both month and year.');
        return;
    }

    if (year < BIRTH_YEAR || (year === BIRTH_YEAR && month < BIRTH_MONTH)) {
        alert('Please select a month on or after March 2023.');
        return;
    }

    const editingEntry = currentEditingId ? entries.find(e => e.id === currentEditingId) : null;
    const entryId = editingEntry ? editingEntry.id : Date.now().toString();
    const createdAt = editingEntry?.createdAt || Date.now();

    const entry = {
        id: entryId,
        month,
        year,
        note,
        photos: selectedPhotos.map(photo => ({ ...photo })),
        createdAt
    };

    entries = entries.filter(e => !(e.month === month && e.year === year && e.id !== entryId));

    const existingIndex = entries.findIndex(e => e.id === entryId);
    if (existingIndex !== -1) {
        entries[existingIndex] = entry;
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

    const range = generateTimelineRange();

    if (entries.length === 0) {
        timeline.appendChild(createTimelineIntro());
    }

    let currentYear = null;

    range.forEach(({ month, year }) => {
        if (currentYear !== year) {
            timeline.appendChild(createYearHeader(year));
            currentYear = year;
        }

        const entry = entries.find(e => e.month === month && e.year === year);
        const card = createTimelineCard(month, year, entry);
        timeline.appendChild(card);
    });
}

function createTimelineIntro() {
    const intro = document.createElement('div');
    intro.className = 'timeline-help';
    intro.innerHTML = `
        <h3>Start capturing memories</h3>
        <p>Select any month below or tap the + button to add your first entry.</p>
    `;
    return intro;
}

function createYearHeader(year) {
    const header = document.createElement('div');
    header.className = 'timeline-year';
    header.textContent = year;
    return header;
}

function createTimelineCard(month, year, entry) {
    const div = document.createElement('div');
    div.className = 'timeline-entry';
    div.dataset.month = String(month);
    div.dataset.year = String(year);

    const dateStr = `${months[month - 1]} ${year}`;
    const ageLabel = calculateAge(month, year);
    const future = isFutureMonth(month, year);

    if (future) {
        div.classList.add('upcoming');
    }

    if (entry) {
        div.classList.add('has-entry');
        div.onclick = () => openDetailModal(entry.id);

        const previewNote = entry.note
            ? (entry.note.length > 150 ? `${entry.note.substring(0, 150)}...` : entry.note)
            : 'No note added yet';

        let photosHtml = '';
        if (entry.photos && entry.photos.length > 0) {
            const previewPhotos = entry.photos.slice(0, 3);
            photosHtml = '<div class="entry-photos-preview">';
            previewPhotos.forEach(photo => {
                photosHtml += `<img src="${photo.data}" alt="Photo" class="photo-thumb">`;
            });
            if (entry.photos.length > 3) {
                photosHtml += `<div class="photo-thumb more-count">+${entry.photos.length - 3}</div>`;
            }
            photosHtml += '</div>';
        }

        div.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${dateStr}</div>
                <div class="entry-age">${ageLabel}</div>
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
                <div class="entry-age">${ageLabel}</div>
            </div>
            <div class="entry-preview empty">No memories yet for this month.</div>
            <button type="button" class="btn btn-primary add-memory-btn">Add Memory</button>
        `;

        const addButton = div.querySelector('.add-memory-btn');
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

    const noteHtml = entry.note
        ? `<div class="detail-note">${entry.note.replace(/\n/g, '<br>')}</div>`
        : '<div class="detail-note empty">No note added for this entry</div>';

    content.innerHTML = `
        ${photosHtml}
        ${noteHtml}
        <div class="detail-actions">
            <button class="btn btn-primary" onclick="openEntryModal('${entry.id}'); closeDetailModal();">Edit Entry</button>
            <button class="btn btn-secondary" onclick="deleteEntry('${entry.id}')">Delete Entry</button>
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
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                entries = parsed;
            }
        }
    } catch (e) {
        console.error('Error loading entries:', e);
        entries = [];
    }
}

