# My Little One's Growth Timeline

A beautiful, interactive website to track your daughter's growth timeline with photos and notes for each month and year.

## Features

- 📅 **Timeline View**: Visual timeline showing all entries from March 2023 onwards
- 📸 **Photo Support**: Add multiple photos for each entry
- 📝 **Notes**: Write special memories and milestones for each month
- 💾 **Local Storage**: All data is saved locally in your browser
- 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## How to Use

1. **Open the Website**: Simply open `index.html` in your web browser
2. **Add an Entry**: Click the "+" button in the bottom right corner
3. **Fill in Details**:
   - Select the month and year
   - Write a note about that special time
   - Upload photos (multiple photos supported)
4. **View Entries**: Click on any timeline entry to see full details
5. **Edit/Delete**: From the detail view, you can edit or delete entries

## Technical Details

- Pure HTML, CSS, and JavaScript (no dependencies)
- Uses browser Local Storage for data persistence
- Automatically calculates age for each entry based on birth date (March 2023)
- Photos are stored as base64-encoded data

## Browser Compatibility

Works on all modern browsers that support:
- Local Storage
- FileReader API
- CSS Grid and Flexbox

## Data Storage

All entries are stored in your browser's local storage. To backup your data:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Find Local Storage
4. Copy the value for 'growthTimelineEntries'

To restore, paste the JSON data back into local storage with the same key name.

