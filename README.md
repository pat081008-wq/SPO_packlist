# Adventures of S&P&O — Holiday Packing Tracker

A mobile-friendly web app to track packing for holidays. Built as a static site — no server, no build step, no dependencies beyond a Google Fonts import.

## 📱 Features

- Tab per packing list (Mushu, Olly Bath, Olly General, Olly Kitchen, Extras)
- Item name + quantity on each row
- Tap any item to mark it packed / unpacked
- Per-tab reset button to clear all checkmarks
- Global progress bar across all lists
- State persists in `localStorage` — survives page refreshes
- Fully mobile-optimised layout

## 🗂 File Structure

```
spo-packing-tracker/
├── index.html   — App shell, hero SVG illustration, HTML structure
├── style.css    — All styles (design tokens, layout, components)
├── data.js      — Packing list data (edit this to update lists)
├── app.js       — App logic (rendering, state, events)
└── README.md
```

## ✏️ Updating the Lists

All list content lives in **`data.js`**. To add, remove, or rename items, edit the `packingData` array directly.

Each list entry follows this shape:

```js
{
  id: "unique_id",       // used internally for state keys — no spaces
  label: "Display Name", // shown on the tab button
  icon: "🎒",            // emoji shown on tab and card header
  items: [
    { name: "Item Name", qty: "1" },
    { name: "Another Item", qty: "2/day" },
    { name: "No Qty Item", qty: "—" },
  ]
}
```

To **add a new list/tab**, add a new object to the `packingData` array in `data.js`.

## 🚀 Deploying via GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Save — your app will be live at `https://<your-username>.github.io/<repo-name>/`

## 🌐 Running Locally

No build step needed. Just open `index.html` in a browser, or serve with any static file server:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080` in your browser.
