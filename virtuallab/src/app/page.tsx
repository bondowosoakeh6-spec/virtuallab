import Link from 'next/link';
import Image from 'next/image';

function ShieldIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="18" fill="#E8F5E9" />
      <path
        d="M18 10L12 13v4c0 4.42 2.56 8.56 6 10 3.44-1.44 6-5.58 6-10v-4l-6-3z"
        fill="#4CAF50"
      />
      <path d="M16 19l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="18" fill="#E3F2FD" />
      <circle cx="18" cy="18" r="7" stroke="#1E3A8A" strokeWidth="1.5" fill="none" />
      <path d="M18 14v4l3 2" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="18" fill="#FFF3E0" />
      <rect x="12" y="20" width="3" height="6" rx="1" fill="#E65100" />
      <rect x="16.5" y="16" width="3" height="10" rx="1" fill="#F57C00" />
      <rect x="21" y="13" width="3" height="13" rx="1" fill="#FF9800" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#6B7280" />
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="#6B7280" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="12" r="5" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="#6B7280" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      <rect x="2" y="9" width="4" height="12" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      <circle cx="4" cy="4" r="2" stroke="#6B7280" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2" />
      <path d="M16 16l4 4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3h12l4 7-10 11L2 10l4-7z" stroke="#2D2B7F" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function ChevronRightSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6l6 6-6 6" stroke="#2D2B7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <Image src="/akuanalis-logo.svg" alt="AkuAnalis" width={40} height={40} />
          </div>

          {/* Search Bar */}
          <div className="relative hidden md:flex items-center flex-1 max-w-md">
            <div className="absolute left-3 pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Belajar apa hari ini?"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Beranda
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Kelas
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Bundling
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Screening CV
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-0.5 transition"
            >
              Virtual Lab
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Kontak kami
            </Link>
          </nav>

          {/* Login Button */}
          <Link
            href="/login"
            className="shrink-0 text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <main className="flex-1">
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #EEF0F8 0%, #E8EAF6 30%, #F0F2FA 70%, #EEF0F8 100%)' }}>
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-xs font-semibold tracking-wider text-gray-700 uppercase">
                  <DiamondIcon />
                  Fitur Premium
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight" style={{ color: '#1a1a2e' }}>
                  Virtual Lab
                </h1>

                {/* Description */}
                <p className="text-base md:text-lg text-gray-600 max-w-lg leading-relaxed">
                  Simulasi laboratorium digital untuk pengalaman belajar kimia yang interaktif dan mendalam. Latih insting analitis Anda tanpa risiko.
                </p>

                {/* Feature Bullets */}
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <ShieldIcon />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Aman &amp; Terkendali</h3>
                      <p className="text-gray-500 text-sm mt-0.5">Lakukan eksperimen kompleks tanpa risiko kecelakaan fisik.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <ClockIcon />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Akses 24/7</h3>
                      <p className="text-gray-500 text-sm mt-0.5">Belajar kapan saja, di mana saja. Laboratorium Anda selalu buka.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <ChartIcon />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Visualisasi Real-time</h3>
                      <p className="text-gray-500 text-sm mt-0.5">Amati reaksi kimia dan dapatkan umpan balik instan.</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-white font-medium px-8 py-4 rounded-xl text-base hover:opacity-90 transition shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#2D2B7F' }}
                  >
                    Coba Sekarang
                    <ArrowRightIcon />
                  </Link>
                </div>
              </div>

              {/* Right Column — Lab Preview Card */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg">
                  {/* Main Card */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Title bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-gray-400 font-mono tracking-wider">SIM-LAB-01</span>
                    </div>

                    {/* Content */}
                    <div className="p-6 relative" style={{ minHeight: '320px', background: 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)' }}>
                      {/* Temperature Widget */}
                      <div className="absolute top-4 left-4 bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3 z-10">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium block">Temperature</span>
                        <span className="text-xl font-bold text-indigo-600 mt-1 block" style={{ fontFamily: 'monospace' }}>24.5</span>
                      </div>

                      {/* Lab Illustration */}
                      <div className="flex items-center justify-center pt-8">
                        <Image
                          src="/lab-illustration.svg"
                          alt="Lab Equipment"
                          width={380}
                          height={220}
                          className="w-full max-w-sm"
                          priority
                        />
                      </div>

                      {/* pH Level Widget */}
                      <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-md border border-gray-100 px-4 py-3 z-10">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium block">pH Level</span>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: '51%', backgroundColor: '#2D2B7F' }} />
                          </div>
                          <span className="text-sm font-bold text-gray-800" style={{ fontFamily: 'monospace' }}>7.2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1 — Brand */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold" style={{ color: '#2D2B7F' }}>AkuAnalis</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Kota Bekasi, Jawa Barat<br />
                Indonesia
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition" aria-label="WhatsApp">
                  <WhatsAppIcon />
                </Link>
                <Link href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition" aria-label="Facebook">
                  <FacebookIcon />
                </Link>
                <Link href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition" aria-label="Instagram">
                  <InstagramIcon />
                </Link>
                <Link href="#" className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition" aria-label="LinkedIn">
                  <LinkedInIcon />
                </Link>
              </div>
            </div>

            {/* Column 2 — Profile */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold" style={{ color: '#2D2B7F' }}>Profile</h3>
              <ul className="space-y-2.5">
                {['Tentang kami', 'Keunggulan', 'Visi Misi', 'Testimoni', 'F A Q'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
                      <ChevronRightSmall />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Navigasi */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold" style={{ color: '#2D2B7F' }}>Navigasi</h3>
              <ul className="space-y-2.5">
                {['Beranda', 'Kelas Kami', 'Kontak'].map((item) => (
                  <li key={item}>
                    <Link href="#" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition">
                      <ChevronRightSmall />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4 — Partner Kami */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold" style={{ color: '#2D2B7F' }}>Partner Kami</h3>
              <div className="space-y-3">
                {/* Partner logo placeholder */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-[8px] text-gray-400 text-center font-medium uppercase tracking-wide leading-tight">RESIS<br />PROJECT</span>
                </div>
                <div className="space-y-1">
                  <Link href="#" className="block text-xs hover:underline" style={{ color: '#2D2B7F' }}>
                    Syarat &amp; Ketentuan
                  </Link>
                  <Link href="#" className="block text-xs hover:underline" style={{ color: '#2D2B7F' }}>
                    Kebijakan Privasi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <p className="text-center text-xs text-gray-400">
              © Copyright <span className="font-semibold text-gray-600">akuanalis.com</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
