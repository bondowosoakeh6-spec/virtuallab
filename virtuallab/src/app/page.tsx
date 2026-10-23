import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl text-gray-900">VirtualLab</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Laboratorium Virtual
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  Analisis Kimia
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                Platform pembelajaran praktikum analisis kimia secara digital. 
                Lakukan eksperimen proksimat, volumetri, dan titrasi kapan saja, di mana saja.
              </p>
              <div className="mt-10 flex gap-4">
                <Link
                  href="/register"
                  className="gradient-primary text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition text-lg"
                >
                  Mulai Sekarang
                </Link>
                <Link
                  href="/login"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition text-lg"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Fitur Utama
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Analisis Proksimat',
                  desc: 'Kadar Air, Kadar Abu, Kadar Protein (Kjeldahl), dan Karbohidrat (Luff Schoorl)',
                  icon: '🧪',
                },
                {
                  title: 'Analisis Volumetri',
                  desc: 'Massa Molar, Bobot Ekuivalen, Standardisasi, Penetapan Kadar, dan Kurva Titrasi',
                  icon: '⚗️',
                },
                {
                  title: 'Manajemen Kelas',
                  desc: 'Kelola kelas, tugas, penilaian otomatis, umpan balik, dan laporan lengkap',
                  icon: '📚',
                },
                {
                  title: 'Perhitungan Otomatis',
                  desc: 'Engine kalkulasi presisi tinggi yang divalidasi terhadap Excel source of truth',
                  icon: '🔬',
                },
                {
                  title: 'Langkah demi Langkah',
                  desc: 'Setiap perhitungan ditampilkan step-by-step dengan rumus dan referensi Excel',
                  icon: '📊',
                },
                {
                  title: 'Ekspor Laporan',
                  desc: 'Ekspor hasil perhitungan dan nilai ke format PDF dan Excel',
                  icon: '📄',
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition"
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="font-semibold text-lg text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-gray-600 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Siap untuk mulai?
            </h2>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">
              Daftar sekarang dan akses semua eksperimen analisis kimia secara gratis.
            </p>
            <Link
              href="/register"
              className="inline-block mt-8 gradient-primary text-white px-10 py-4 rounded-lg font-medium hover:opacity-90 transition text-lg"
            >
              Daftar Gratis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          © 2024 VirtualLab Analisis Kimia. Dikembangkan untuk pembelajaran analisis kimia.
        </div>
      </footer>
    </div>
  );
}
