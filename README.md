# 🎬 Video Compressor Pro (MORE THAN 9GB!)

A **fully functional** web application for compressing large video files (up to 10GB+) with real-time progress tracking and quality preservation. Built with React frontend, Node.js backend, and FFmpeg integration.

![Video Compressor Pro](https://img.shields.io/badge/Video%20Compression-FFmpeg--Powered-blue)
![Supports](https://img.shields.io/badge/Supports-Up%20to%2010GB+-green)
![Status](https://img.shields.io/badge/Status-Fully%20Functional-success)

---

## ✨ Features

### 🎯 **Real Video Compression**
- **Up to 10GB file support** - Handle massive video files
- **Real FFmpeg Processing** - Not just simulation!
- **Quality Preservation** - Maintain video quality during compression
- **Multiple Output Formats** - MP4, AVI, MKV, MOV, and more
- **Real-time Progress** - Live compression status updates

### 🛠️ **Quality Settings**
- **High Quality**: Preserves original quality (minimal compression)
- **Balanced**: Best size/quality ratio (recommended)
- **Smallest Size**: Maximum compression (smaller files)

### 💫 **User Experience**
- **Drag & Drop Interface** - Easy file selection
- **Real-time Progress Bar** - Live FFmpeg compression status
- **File Preview** - Shows original file details
- **Results Dashboard** - Compression savings and statistics
- **Secure Downloads** - Direct server download links

### 🔧 **Technical Features**
- **RESTful API** - Modern backend architecture
- **CORS Enabled** - Frontend-backend communication
- **Error Handling** - Comprehensive error management
- **File Validation** - Server-side video format verification
- **Cleanup System** - Automatic temporary file removal

### 📢 **AdSense Ready**
- ✅ Google AdSense verification complete
- ✅ Meta tag and script integration
- ✅ Publisher ID: `ca-pub-9953179201685717`
- ✅ ads.txt file configured
- ✅ Ad placements ready

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **FFmpeg** installed on system
- Modern web browser

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yaskovbs/Video-Compressor-MORE-THAN-9GB-Pro.git
cd video-compressor-more-than-9gb-pro
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install FFmpeg** (Windows with Chocolatey):
```bash
choco install ffmpeg
```

4. **Environment setup:**
```bash
cp .env.example .env
# Edit .env if needed (optional)
```

5. **Start the application:**
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend
npm run dev
```

6. **Open your browser:**
- Frontend: http://localhost:5174/
- Backend API: http://localhost:3001/

---

## 🏗️ Architecture

```
Video Compressor Pro/
├── frontend/          # React TypeScript app
│   ├── components/    # UI components
│   └── App.tsx        # Main React app
├── backend/           # Node.js/Express server
│   ├── server.js      # Express server with FFmpeg
│   ├── uploads/       # Temporary upload storage
│   └── processed/     # Compressed file storage
├── public/            # Static assets
└── docs/              # Documentation
```

### API Endpoints

```http
POST /compress        # Upload and compress video
GET  /status/:jobId   # Check compression status
GET  /download/:jobId # Download compressed video
```

---

## 🛠️ Technologies

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast development server
- **CSS-in-JS** - Inline styling

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **FFmpeg** - Video compression engine
- **Multer** - File upload handling
- **Fluent-FFmpeg** - FFmpeg wrapper
- **UUID** - Job ID generation

---

## 🎯 How It Works

1. **Upload**: User selects video file (up to 10GB)
2. **Configure**: Choose compression quality setting
3. **Process**: FFmpeg compresses video in real-time
4. **Track**: Real-time progress updates via polling
5. **Download**: Secure download of compressed file

### FFmpeg Compression Settings

| Quality | Video Bitrate | Audio Bitrate | Preset | Notes |
|---------|---------------|---------------|--------|--------|
| High Quality | 8000k | 128k | slow | Best quality |
| Balanced | 4000k | 96k | medium | Recommended |
| Small Size | 1500k | 64k | fast | Smallest files |

---

## 📊 Performance

- **File Size Limit**: 10GB per file
- **Processing**: Asynchronous background compression
- **Storage**: Temporary file auto-cleanup (1 hour)
- **Progress**: Real-time FFmpeg progress tracking
- **Memory**: Efficient streaming for large files

---

## 🔒 Security

- **Server-side Validation** - File type and size checks
- **Temporary Storage** - Auto cleanup prevents disk fill
- **CORS Protection** - Cross-origin request handling
- **Error Sanitization** - Safe error messages
- **File Extension Validation** - Video format filtering

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Yosef Baskin** - yaskovbs@gmail.com

---

## 🙏 Acknowledgments

- **FFmpeg** - The powerful multimedia framework
- **Google AdSense** - Monetization platform
- **React & Node.js** communities

---

**Ready to compress massive video files? 🗜️ Start now!**
