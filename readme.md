# BTK Hackathon - Mayıs AI Search

Mayıs, Gemini AI destekli gerçek zamanlı arama asistanı. WebSocket tabanlı iletişim ve MongoDB entegrasyonu ile güçlendirilmiş modern bir arama deneyimi sunar.

## 🚀 Özellikler

- 🤖 Gemini 1.5 destekli AI arama
- 🔄 Gerçek zamanlı akış yanıtları
- 🔒 MongoDB ile güvenli veri depolama
- 🔐 Uçtan uca şifreleme
- 🌐 WebSocket tabanlı iletişim
- ⚡ Hız sınırlama ve güvenlik özellikleri
- 📝 Arama geçmişi yönetimi
- 🔍 Kullanıcı bağlamına duyarlı yanıtlar
- 🌍 Çoklu dil desteği

## 🛠️ Teknolojiler

### Backend
- Node.js & TypeScript
- Express.js
- MongoDB
- WebSocket (ws)
- Gemini AI API
- Puppeteer

### Frontend
- React.js
- TypeScript
- TailwindCSS

## 📋 Gereksinimler

- Node.js >= 18
- MongoDB
- pnpm (önerilen) veya npm
- Gemini API anahtarı

## 🚀 Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/your-username/btk-hackathon.git
cd btk-hackathon
```

2. Backend için bağımlılıkları yükleyin:
```bash
cd backend
pnpm install
```

3. Frontend için bağımlılıkları yükleyin:
```bash
cd frontend
pnpm install
```

4. Backend için .env dosyası oluşturun:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/aisearch
GEMINI_API_KEY=your-api-key
DB_SECRET=your-secure-key
CSRF_SECRET=your-csrf-secret
```

## 🎮 Çalıştırma

### Backend:
```bash
cd backend
pnpm dev
```

### Frontend:
```bash
cd frontend
pnpm dev
```

## 📚 API Dokümantasyonu

Swagger UI: http://localhost:3000/api-docs

## 🔒 Güvenlik Özellikleri

- CSRF koruması
- Rate limiting
- Veri şifreleme
- Güvenli proxy yönetimi
- Origin kontrolü

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.
