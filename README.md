# Nebula Browser

[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-brightgreen.svg)](LICENSE)

A modern, open-source browser built with Electron.

---

## 🚀 Overview
Nebula Browser is a full-featured desktop browser app made with [Electron](https://www.electronjs.org/). It offers a unique, modern homepage, Chrome-style tabs, custom theming, quick links, and a responsive UI. The project is designed to be both a learning showcase and a practical, installable browser for Windows.

---

## ✨ Features
- **Custom Homepage:** Beautiful, branded welcome page with search, quick links, and wallpaper support
- **Tab System:** Chrome/Edge-style tabs with independent browsing per tab
- **Quick Links:** Add, remove, and reorder your favorite sites with icons
- **Custom Wallpaper:** Set your own background for the homepage
- **Dark/Light/Auto Theme:** Toggle between themes, with glassmorphism effects
- **Mobile Responsive:** Homepage and UI adapt to mobile/small screens
- **Bookmarks & History:** Save and revisit your favorite sites
- **Settings Modal:** Change homepage/search engine (for future expansion)
- **Notifications:** Modern, animated feedback for user actions
- **Production Build:** Easily create a Windows installer (EXE) to share with anyone

---

## 🛠️ Tech Stack
- **Electron** (main framework)
- **HTML, CSS, JavaScript** (UI & logic)
- **Node.js** (backend for Electron)
- **electron-builder** (for packaging Windows installer)
- **LocalStorage** (for quick links, wallpaper, theme)
- **electron-store** (for bookmarks/history/settings persistence)

---

## 📦 How to Run (Development)
1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd broswer
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the app:**
   ```sh
   npm start
   ```
   The browser will open in a desktop window.

---

## 🏗️ How to Build (Windows Installer)
1. **Install electron-builder (if not already):**
   ```sh
   npm install --save-dev electron-builder
   ```
2. **Build the installer:**
   ```sh
   npm run build
   ```
3. **Find your EXE:**
   - Go to the `dist/` folder. You’ll see `Nebula Browser Setup.exe`.
   - Share this file with anyone—they can install Nebula Browser on their Windows PC!

---

## 💡 Why is Nebula Browser Useful?
- **Personalized Experience:** Custom homepage, theming, and quick links make it truly yours.
- **Modern UI:** Looks and feels like Chrome/Edge, but with your own branding and features.
- **Learning Project:** Great for understanding Electron, desktop app development, and modern web UI/UX.
- **Shareable:** Build and distribute your own browser as a real Windows app.
- **Mobile Friendly:** Homepage and widgets look great on all screen sizes.

---

## 📱 Screenshots
<img width="2862" height="1624" alt="ss" src="https://github.com/user-attachments/assets/720f6cfd-06cc-428d-bcf1-faefdd521056" />

---

## 🖥️ Download

You can download the latest Windows build of Nebula Browser here:

🔗 [Download Nebula Browser (.exe)](https://drive.google.com/file/d/1id2k7-HyQHz19CMbI2BTDyOOcwj4bQdN/view?usp=sharing)

> Note: This is a standalone `.exe` file built for Windows. No installation needed — just run and explore!

---

## 🙏 Credits & Inspiration
- [Electron](https://www.electronjs.org/)
- [Google Chrome](https://www.google.com/chrome/) & [Microsoft Edge](https://www.microsoft.com/edge) (UI inspiration)
- [Open source icons & wallpapers]

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

**Made with ❤️ by Rohit Kumar Bansal** 
