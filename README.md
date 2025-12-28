# İlacım Cebimde - Yönetim Paneli

**İlacım Cebimde** uygulaması için geliştirilmiş, Next.js 16 ve Firebase tabanlı yönetim panelidir. Bu proje, kullanıcı yönetimi, yetkilendirme (Admin Claims) ve yönetimsel işlemlerin gerçekleştirilmesi amacıyla tasarlanmıştır.

## 🚀 Özellikler

- **Yetkilendirme ve Kimlik Doğrulama**: Firebase Authentication ile güvenli giriş ve kayıt işlemleri.
- **Admin Rol Yönetimi**: Özel `admin` claim'leri ile rol tabanlı erişim kontrolü (RBAC).
- **Yönetim Paneli (`/yonetim`)**: Yetkili kullanıcılar için özel yönetim arayüzü.
- **Modern Arayüz**: Tailwind CSS v4 ve Lucide React ikonları ile şık ve responsive tasarım.
- **Security**: Middleware ile korunan rotalar ve Server Actions ile güvenli veri işlemleri.

## 🛠️ Teknolojiler

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Dil**: [TypeScript](https://www.typescriptlang.org/)
- **Backend / Auth**: [Firebase](https://firebase.google.com/) (Client SDK & Admin SDK)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Proje Yapısı

```
src/
├── actions/       # Server Actions (Backend mantığı)
├── app/           # Next.js App Router sayfaları
│   ├── login/     # Giriş sayfası
│   ├── register/  # Kayıt sayfası
│   ├── yonetim/   # Admin yönetim paneli
│   └── ...
├── context/       # React Context (örn. AuthContext)
├── libs/          # Firebase ve yardımcı kütüphaneler
├── services/      # İş mantığı servisleri
└── tools/         # Araçlar (örn. Admin yetkisi atama)
```

## ⚙️ Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu klonlayın:**

    ```bash
    git clone git@github.com:mahmut483/ilacim-cebimde.git
    cd ilacim-cebimde-yonetim
    ```

2.  **Bağımlılıkları yükleyin:**

    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    Kök dizinde `.env.local` dosyası oluşturun ve Firebase yapılandırma bilgilerinizi ekleyin:

    ```env
    # Firebase Client SDK
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    # Firebase Admin SDK
    FIREBASE_PROJECT_ID=...
    FIREBASE_CLIENT_EMAIL=...
    FIREBASE_PRIVATE_KEY="...private key content..."
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 🔐 Yönetici Yetkisi Atama

İlk yöneticiyi oluşturmak veya bir kullanıcıya admin yetkisi vermek için:

1.  `/setup-admin-claim` sayfasına gidin (veya `src/tools/setAdminClaim.ts` aracını kullanın).
2.  Gerekli işlemleri yaparak kullanıcının `admin` custom claim'ine sahip olduğundan emin olun.

## 📜 Lisans

Bu proje özel mülkiyettir. İzinsiz kopyalanması veya dağıtılması yasaktır.
