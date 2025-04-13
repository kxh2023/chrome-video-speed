# Video Speed Controller Chrome Extension

A Chrome extension built with React, TypeScript, and Tailwind CSS that allows users to adjust the playback speed of videos on any webpage.

## Features

- Adjust video playback speed from 0.25x to 3.0x
- Visual slider for fine-tuning speed
- Quick preset speed buttons
- Works on all HTML5 video elements
- Shows count of videos detected on the page

## Installation

1. Clone or download this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder from this project

## Development

- `npm run dev` - Start development server
- `npm run build` - Build the extension
- `npm run lint` - Run ESLint

## How It Works

The extension injects a content script that can modify the playback rate of all video elements on the current page. When you open the popup, it communicates with this content script to get and set video speeds.

## License

MIT
