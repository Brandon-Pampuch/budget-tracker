# Budget Tracker PWA

A simple Progressive Web App for tracking your income and expenses on your iPhone.

## Features

- Track income and expenses
- Categorize transactions
- View current balance and summaries
- Works offline
- Installable on iPhone home screen
- Data saved locally on your device

## Installation on iPhone

### Step 1: Generate Icons
1. Open `create-icons.html` in a web browser
2. Download both `icon-192.png` and `icon-512.png`
3. Save them in the `budget-app` folder

### Step 2: Host the App
You need to serve the app over HTTPS. Choose one option:

**Option A: Using Python (if installed)**
```bash
cd budget-app
python3 -m http.server 8000
```

**Option B: Using npx (if Node.js installed)**
```bash
cd budget-app
npx serve
```

**Option C: Deploy to GitHub Pages (Free hosting)**
1. Create a GitHub repository
2. Upload all files from `budget-app`
3. Go to Settings > Pages
4. Select main branch and save
5. Access via `https://yourusername.github.io/repo-name`

### Step 3: Install on iPhone
1. Open Safari on your iPhone
2. Navigate to your hosted app URL
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Name it "Budget Tracker" and tap "Add"
6. The app icon will appear on your home screen

## Usage

1. **Add Transaction**: Fill in description, amount, category, and select income or expense
2. **View Balance**: See your current balance at the top
3. **Track Totals**: View total income and expenses
4. **Delete Transactions**: Tap delete button on any transaction
5. **Offline Support**: Works without internet after first load

## File Structure

```
budget-app/
├── index.html          - Main HTML file
├── styles.css          - Mobile-optimized styles
├── app.js             - Budget tracking logic
├── manifest.json      - PWA configuration
├── service-worker.js  - Offline functionality
├── icon-192.png       - App icon (192x192)
├── icon-512.png       - App icon (512x512)
└── README.md          - This file
```

## Data Storage

All data is stored in your browser's localStorage. Your transactions are:
- Saved automatically
- Only on your device
- Persistent across sessions
- Lost if you clear browser data
