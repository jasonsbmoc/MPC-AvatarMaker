# Medium Pub Crawl 2026 - Avatar Maker

A web tool that allows users to create custom profile pictures with themed frames for the Medium Pub Crawl 2026 event.

## Features

- **Upload & Preview**: Drag-and-drop or click to upload profile pictures
- **Frame Selection**: Choose from 4 different frame styles
- **Color Options**: Select from 5 color variants (Yellow, Pink, Lavender, Red, and Multicolor)
- **Pan & Zoom**:
  - Desktop: Click and drag to reposition, use slider to zoom
  - Mobile: Touch to drag, pinch to zoom
- **Download**:
  - Desktop: Direct download as PNG
  - Mobile: Native share sheet for easy saving to Photos

## Project Structure

```
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles
├── js/
│   └── main.js         # Application logic
├── Frames/             # Frame overlay images (20 PNGs)
│   ├── Frame-01-*.png
│   ├── Frame-02-*.png
│   ├── Frame-03-*.png
│   └── Frame-04-*.png
├── Images/             # Assets
│   ├── PubCrawl-TicketLogo.png
│   └── AvatarMaker-OG.jpg
└── README.md           # This file
```

## Usage

### Local Development

1. Clone this repository
2. Run a local server (required for CORS):
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser

### GitHub Pages Deployment

1. Push to your GitHub repository
2. Go to Settings → Pages
3. Select your branch (usually `main`)
4. Your site will be live at `https://yourusername.github.io/repo-name/`

## Technologies

- HTML5 Canvas for image compositing
- Vanilla JavaScript (no frameworks)
- CSS3 for styling
- Web Share API for mobile sharing
- Inter font family

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)

## License

All rights reserved.
