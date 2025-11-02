# DealFinder - Vanilla HTML/CSS/JS Client

This is a vanilla HTML, CSS, and JavaScript version of the DealFinder price comparison application. It replaces the React client with a lightweight, framework-free implementation.

## Features

- **No Build Step**: Pure HTML, CSS, and JavaScript - no compilation needed
- **Tailwind CSS**: Using Tailwind CSS via CDN for styling
- **Single Page Application**: Client-side routing using vanilla JavaScript
- **All Original Features**:
  - Landing page with hero section
  - Product search and comparison
  - Voice search
  - AI-powered summaries
  - Filtering and sorting
  - Responsive design

## File Structure

```
client2/
├── index.html      # Main HTML file with both landing and search pages
├── styles.css      # Custom CSS animations and utilities
├── router.js       # Client-side routing logic
├── landing.js      # Landing page functionality
├── search.js       # Search page functionality
└── README.md       # This file
```

## Usage

1. **Simple HTTP Server**: Since this uses ES modules and fetch API, you'll need to serve it over HTTP (not file://)

   Using Python:

   ```bash
   cd client2
   python -m http.server 8000
   ```

   Using Node.js (http-server):

   ```bash
   cd client2
   npx http-server -p 8000
   ```

   Using PHP:

   ```bash
   cd client2
   php -S localhost:8000
   ```

2. **Access the Application**: Open `http://localhost:8000` in your browser

3. **Server Setup**: Make sure the backend server is running on `http://localhost:3001`

## API Configuration

The search functionality connects to the backend API at `http://localhost:3001`. If your server runs on a different port or domain, update the `API_BASE` constant in `search.js`:

```javascript
const API_BASE = "http://localhost:3001";
```

## Browser Support

- Modern browsers with ES6+ support
- Voice search requires Chrome/Edge (webkitSpeechRecognition)
- Fetch API support required

## Differences from React Version

- Single HTML file with hidden/shown sections instead of component rendering
- Manual DOM manipulation instead of React's virtual DOM
- Vanilla JavaScript routing instead of React Router
- Event listeners instead of React hooks
- No build process - ready to use directly
