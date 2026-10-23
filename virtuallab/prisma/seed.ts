/**
 * =================================================================
 * VirtualLab AKUANALIS - Database Seed Script
 * =================================================================
 * 
 * ⚠️  WARNING: DEVELOPMENT CREDENTIALS ONLY
 * The passwords in this file are for DEVELOPMENT/TESTING purposes only.
 * NEVER use these credentials in production environments.
 * 
 * Credentials:
 *   Admin:      admin@virtuallab.local     / Admin123!
 *   Instructor: dosen@virtuallab.local      / Dosen123!
 *   Student:    student@virtuallab.local    / Student123!
 * 
 * Run: npx tsx prisma/seed.ts
 * =================================================================
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('  -> Seeding users...');
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const dosenPasswordHash = await bcrypt.hash('Dosen123!', 12);
  const studentPasswordHash = await bcrypt.hash('Student123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@virtuallab.local' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@virtuallab.local',
      passwordHash: passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'dosen@virtuallab.local' },
    update: {},
    create: {
      name: 'Dr. Ahmad Fauzi',
      email: 'dosen@virtuallab.local',
      passwordHash: dosenPasswordHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
    },
  });

  await prisma.instructor.upsert({
    where: { userId: instructor.id },
    update: {},
    create: {
      userId: instructor.id,
      employeeNumber: 'NIP198501',
    },
  });

  const studentEmails = [
    { email: 'student@virtuallab.local', name: 'Budi Santoso', num: '2024001' },
    { email: 'mahasiswa2@virtuallab.local', name: 'Siti Aminah', num: '2024002' },
    { email: 'mahasiswa3@virtuallab.local', name: 'Joko Widodo', num: '2024003' },
    { email: 'mahasiswa4@virtuallab.local', name: 'Rina Nose', num: '2024004' },
    { email: 'mahasiswa5@virtuallab.local', name: 'Agus Yudhoyono', num: '2024005' },
  ];

  for (const s of studentEmails) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });

    await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        studentNumber: s.num,
      },
    });
  }
}

async function seedClassAndMembers() {
  console.log('  -> Seeding class and members...');
  const instructorUser = await prisma.user.findUnique({ where: { email: 'dosen@virtuallab.local' } });
  
  if (!instructorUser) return;

  const instructor = await prisma.instructor.findUnique({ where: { userId: instructorUser.id } });
  if (!instructor) return;

  const newClass = await prisma.class.upsert({
    where: { code: 'KIM-301' },
    update: {},
    create: {
      name: 'Praktikum Kimia Analitik',
      code: 'KIM-301',
      course: 'Kimia Analitik',
      semester: 'Ganjil',
      academicYear: '2024/2025',
      instructorId: instructor.id,
    },
  });

  // ClassMember references Student.id (not User.id)
  const students = await prisma.student.findMany();
  
  for (const student of students) {
    await prisma.classMember.upsert({
      where: {
        classId_studentId: {
          classId: newClass.id,
          studentId: student.id,
        },
      },
      update: {},
      create: {
        classId: newClass.id,
        studentId: student.id,
        joinedAt: new Date(),
      },
    });
  }
}

async function seedLabModules() {
  console.log('  -> Seeding lab modules (12 modules)...');
  const modules = [
    {
      slug: 'kadar-air',
      name: 'Analisis Kadar Air',
      category: 'Proksimat',
      description: 'Penentuan kadar air metode gravimetri (oven)',
      theory: 'Kadar air ditentukan berdasarkan selisih bobot sebelum dan sesudah pengeringan dalam oven pada suhu 100-105°C hingga bobot konstan. Prinsip: air dalam bahan pangan diuapkan, selisih bobot dianggap sebagai kadar air.',
      procedure: '1. Timbang wadah kosong (W0)\n2. Timbang sampel + wadah (W1)\n3. Keringkan dalam oven 100-105°C selama 3-5 jam\n4. Dinginkan dalam desikator\n5. Timbang wadah + sampel kering (W2)\n6. Hitung: Kadar Air (%) = ((W1-W2)/(W1-W0)) × 100',
      isActive: true,
    },
    {
      slug: 'kadar-abu',
      name: 'Analisis Kadar Abu',
      category: 'Proksimat',
      description: 'Penentuan kadar abu metode pengabuan kering (dry ashing)',
      theory: 'Kadar abu adalah residu anorganik dari pembakaran bahan organik. Pengabuan kering dilakukan pada suhu 550-600°C dalam tanur (muffle furnace) hingga diperoleh abu putih.',
      procedure: '1. Timbang krusibel kosong (W0)\n2. Timbang sampel + krusibel (W1)\n3. Arangkan di hotplate\n4. Abukan dalam tanur 550°C selama 4-6 jam\n5. Dinginkan dalam desikator\n6. Timbang krusibel + abu (W2)\n7. Hitung: Kadar Abu (%) = ((W2-W0)/(W1-W0)) × 100',
      isActive: true,
    },
    {
      slug: 'kadar-protein',
      name: 'Analisis Kadar Protein',
      category: 'Proksimat',
      description: 'Penentuan kadar protein metode Kjeldahl (dengan standardisasi)',
      theory: 'Metode Kjeldahl menentukan nitrogen total dalam sampel melalui tiga tahap: destruksi, destilasi, dan titrasi. Kadar protein dihitung dengan mengalikan kadar nitrogen dengan faktor konversi.',
      procedure: '1. Destruksi: sampel + H2SO4 pekat + katalisator, dipanaskan\n2. Destilasi: tambah NaOH berlebih, uap NH3 ditampung dalam asam borat\n3. Standardisasi penitar\n4. Titrasi destilat dengan larutan standar\n5. Hitung %N dan kalikan faktor konversi protein',
      isActive: true,
    },
    {
      slug: 'protein-standardless',
      name: 'Analisis Protein Standardless',
      category: 'Proksimat',
      description: 'Penentuan kadar protein tanpa standardisasi penitar',
      theory: 'Variasi metode Kjeldahl dimana konsentrasi penitar sudah diketahui secara pasti sehingga tidak memerlukan standardisasi ulang.',
      procedure: '1. Destruksi sampel\n2. Destilasi\n3. Titrasi langsung dengan konsentrasi penitar yang sudah diketahui\n4. Hitung kadar protein',
      isActive: true,
    },
    {
      slug: 'karbohidrat-luff-schoorl',
      name: 'Analisis Karbohidrat Luff Schoorl',
      category: 'Proksimat',
      description: 'Penentuan gula reduksi metode Luff Schoorl',
      theory: 'Gula reduksi mereduksi Cu²⁺ dalam larutan Luff Schoorl menjadi Cu₂O. Kelebihan Cu²⁺ ditentukan secara iodometri. Selisih volume Na₂S₂O₃ blanko dan sampel dikonversi menjadi mg gula menggunakan tabel Luff Schoorl.',
      procedure: '1. Siapkan larutan sampel\n2. Tambahkan larutan Luff Schoorl\n3. Panaskan 10 menit\n4. Dinginkan, tambahkan KI dan H2SO4\n5. Titrasi dengan Na2S2O3\n6. Konversi volume titrasi ke mg gula menggunakan tabel Luff Schoorl',
      isActive: true,
    },
    {
      slug: 'standardisasi-volumetri',
      name: 'Standardisasi Volumetri',
      category: 'Volumetri',
      description: 'Standardisasi larutan penitar dengan larutan standar primer',
      theory: 'Standardisasi adalah penentuan konsentrasi eksak suatu larutan menggunakan larutan standar primer. Rumus: Cx = (Vy × Cy) / Vx.',
      procedure: '1. Pipet volume tertentu larutan standar (Y)\n2. Tambahkan indikator\n3. Titrasi dengan larutan X (duplo)\n4. Catat volume titrasi\n5. Hitung konsentrasi X',
      isActive: true,
    },
    {
      slug: 'standardisasi-penetapan-kadar',
      name: 'Standardisasi dan Penetapan Kadar',
      category: 'Volumetri',
      description: 'Gabungan standardisasi penitar dan penetapan kadar analit dalam satu eksperimen',
      theory: 'Modul gabungan yang menggabungkan standardisasi larutan penitar dan penetapan kadar analit. Setelah konsentrasi penitar diketahui, langsung digunakan untuk titrasi sampel analit.',
      procedure: '1. Standardisasi penitar\n2. Pipet sampel analit\n3. Titrasi dengan penitar terstandarisasi\n4. Hitung kadar analit',
      isActive: true,
    },
    {
      slug: 'penetapan-kadar',
      name: 'Penetapan Kadar',
      category: 'Volumetri',
      description: 'Penetapan kadar analit dengan titrasi volumetri',
      theory: 'Penetapan kadar menggunakan titrasi volumetri. Kadar = (V × Ar/Mr × C × F) / V_sampel.',
      procedure: '1. Pipet volume tertentu sampel\n2. Tambahkan indikator\n3. Titrasi dengan penitar terstandar\n4. Hitung kadar (g/L)',
      isActive: true,
    },
    {
      slug: 'massa-molar',
      name: 'Massa Molar',
      category: 'Kimia Dasar',
      description: 'Perhitungan massa molar senyawa dari komposisi unsur',
      theory: 'Massa molar (Mr) adalah jumlah massa atom relatif (Ar) dari semua atom penyusun senyawa, dikalikan jumlah atomnya. Mr = Σ(ni × Ari).',
      procedure: '1. Identifikasi unsur penyusun senyawa\n2. Cari Ar tiap unsur dari tabel periodik\n3. Kalikan Ar dengan jumlah atom (n)\n4. Jumlahkan semua kontribusi massa',
      isActive: true,
    },
    {
      slug: 'bobot-ekivalen',
      name: 'Bobot Ekivalen',
      category: 'Kimia Dasar',
      description: 'Perhitungan bobot ekivalen senyawa',
      theory: 'Bobot ekivalen (BE) = Mr / n, dimana n adalah jumlah ekivalen (jumlah ion H⁺, OH⁻, atau elektron yang ditransfer per molekul).',
      procedure: '1. Hitung massa molar senyawa\n2. Tentukan jumlah ekivalen (n)\n3. Hitung BE = Mr / n',
      isActive: true,
    },
    {
      slug: 'kurva-titrasi',
      name: 'Kurva Titrasi',
      category: 'Volumetri',
      description: 'Pembuatan kurva titrasi asam-basa',
      theory: 'Kurva titrasi menunjukkan perubahan pH sebagai fungsi volume titran yang ditambahkan. Tiga daerah utama: sebelum titik ekuivalen (Henderson-Hasselbalch), pada titik ekuivalen (hidrolisis garam), dan setelah titik ekuivalen (kelebihan basa/asam).',
      procedure: '1. Masukkan data Ka/Kb\n2. Tentukan volume dan konsentrasi analit\n3. Simulasikan penambahan titran bertahap\n4. Hitung pH pada setiap titik\n5. Plot kurva pH vs Volume',
      isActive: true,
    },
    {
      slug: 'database-unsur-kimia',
      name: 'Database Unsur Kimia',
      category: 'Referensi',
      description: 'Database tabel periodik unsur kimia (SPU)',
      theory: 'Tabel periodik menyusun 118 unsur kimia berdasarkan nomor atom, konfigurasi elektron, dan sifat kimia berulang. Data meliputi simbol, nomor atom, massa atom relatif (Ar), golongan, dan periode.',
      procedure: '1. Cari unsur berdasarkan simbol atau nama\n2. Lihat data Ar, nomor atom, golongan\n3. Gunakan untuk perhitungan massa molar',
      isActive: true,
    },
  ];

  for (const m of modules) {
    await prisma.labModule.upsert({
      where: { slug: m.slug },
      update: {},
      create: m,
    });
  }
}

async function seedExperiments() {
  console.log('  -> Seeding experiments...');
  const modules = await prisma.labModule.findMany();
  const labClass = await prisma.class.findUnique({ where: { code: 'KIM-301' } });
  
  if (!labClass) return;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  for (const m of modules) {
    // We assume title uniquely identifies experiment within a class for our seed purposes, 
    // or just use first-or-create pattern if unique constraint doesn't exist, we will use findFirst and create.
    const existing = await prisma.experiment.findFirst({
      where: { moduleId: m.id, classId: labClass.id }
    });
    
    if (!existing) {
      await prisma.experiment.create({
        data: {
          moduleId: m.id,
          classId: labClass.id,
          title: `Eksperimen: ${m.name}`,
          description: `Pelaksanaan ${m.name}`,
          instructions: 'Ikuti prosedur di modul.',
          maxScore: 100,
          deadline: deadline,
          isPublished: true,
        }
      });
    }
  }
}

async function seedChemicalElements() {
  console.log('  -> Seeding chemical elements...');
  const elements = [
    { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, groupName: 'Nonmetal', period: 1, category: 'Reactive nonmetal' },
    { atomicNumber: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026, groupName: 'Noble gas', period: 1, category: 'Noble gas' },
    { atomicNumber: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, groupName: 'Alkali metal', period: 2, category: 'Alkali metal' },
    { atomicNumber: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122, groupName: 'Alkaline earth metal', period: 2, category: 'Alkaline earth metal' },
    { atomicNumber: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, groupName: 'Metalloid', period: 2, category: 'Metalloid' },
    { atomicNumber: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, groupName: 'Nonmetal', period: 2, category: 'Polyatomic nonmetal' },
    { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, groupName: 'Nonmetal', period: 2, category: 'Diatomic nonmetal' },
    { atomicNumber: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, groupName: 'Nonmetal', period: 2, category: 'Diatomic nonmetal' },
    { atomicNumber: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.998, groupName: 'Halogen', period: 2, category: 'Diatomic nonmetal' },
    { atomicNumber: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.180, groupName: 'Noble gas', period: 2, category: 'Noble gas' },
    { atomicNumber: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990, groupName: 'Alkali metal', period: 3, category: 'Alkali metal' },
    { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305, groupName: 'Alkaline earth metal', period: 3, category: 'Alkaline earth metal' },
    { atomicNumber: 13, symbol: 'Al', name: 'Aluminum', atomicMass: 26.982, groupName: 'Post-transition metal', period: 3, category: 'Post-transition metal' },
    { atomicNumber: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, groupName: 'Metalloid', period: 3, category: 'Metalloid' },
    { atomicNumber: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.974, groupName: 'Nonmetal', period: 3, category: 'Polyatomic nonmetal' },
    { atomicNumber: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06, groupName: 'Nonmetal', period: 3, category: 'Polyatomic nonmetal' },
    { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, groupName: 'Halogen', period: 3, category: 'Diatomic nonmetal' },
    { atomicNumber: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.95, groupName: 'Noble gas', period: 3, category: 'Noble gas' },
    { atomicNumber: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.098, groupName: 'Alkali metal', period: 4, category: 'Alkali metal' },
    { atomicNumber: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.078, groupName: 'Alkaline earth metal', period: 4, category: 'Alkaline earth metal' },
    { atomicNumber: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.938, groupName: 'Transition metal', period: 4, category: 'Transition metal' },
    { atomicNumber: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845, groupName: 'Transition metal', period: 4, category: 'Transition metal' },
    { atomicNumber: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.933, groupName: 'Transition metal', period: 4, category: 'Transition metal' },
    { atomicNumber: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.693, groupName: 'Transition metal', period: 4, category: 'Transition metal' },
    { atomicNumber: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546, groupName: 'Transition metal', period: 4, category: 'Transition metal' },
    { atomicNumber: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38, groupName: 'Transition metal', period: 4, category: 'Transition metal' },
    { atomicNumber: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904, groupName: 'Halogen', period: 4, category: 'Diatomic nonmetal' },
    { atomicNumber: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.87, groupName: 'Transition metal', period: 5, category: 'Transition metal' },
    { atomicNumber: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90, groupName: 'Halogen', period: 5, category: 'Diatomic nonmetal' },
    { atomicNumber: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.33, groupName: 'Alkaline earth metal', period: 6, category: 'Alkaline earth metal' },
    { atomicNumber: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97, groupName: 'Transition metal', period: 6, category: 'Transition metal' },
    { atomicNumber: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.59, groupName: 'Transition metal', period: 6, category: 'Transition metal' },
    { atomicNumber: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2, groupName: 'Post-transition metal', period: 6, category: 'Post-transition metal' },
  ];

  for (const el of elements) {
    await prisma.chemicalElement.upsert({
      where: { symbol: el.symbol },
      update: {},
      create: el,
    });
  }
}

async function seedChemicalCompounds() {
  console.log('  -> Seeding chemical compounds & compound elements...');
  const compounds = [
    { name: 'Water', formula: 'H2O', molarMass: 18.015, description: 'Solvent', elements: [{ symbol: 'H', quantity: 2 }, { symbol: 'O', quantity: 1 }] },
    { name: 'Sodium Chloride', formula: 'NaCl', molarMass: 58.44, description: 'Salt', elements: [{ symbol: 'Na', quantity: 1 }, { symbol: 'Cl', quantity: 1 }] },
    { name: 'Hydrochloric Acid', formula: 'HCl', molarMass: 36.461, description: 'Acid', elements: [{ symbol: 'H', quantity: 1 }, { symbol: 'Cl', quantity: 1 }] },
    { name: 'Sodium Hydroxide', formula: 'NaOH', molarMass: 40.00, description: 'Base', elements: [{ symbol: 'Na', quantity: 1 }, { symbol: 'O', quantity: 1 }, { symbol: 'H', quantity: 1 }] },
    { name: 'Sulfuric Acid', formula: 'H2SO4', molarMass: 98.079, description: 'Acid', elements: [{ symbol: 'H', quantity: 2 }, { symbol: 'S', quantity: 1 }, { symbol: 'O', quantity: 4 }] },
    { name: 'Calcium Carbonate', formula: 'CaCO3', molarMass: 100.086, description: 'Salt', elements: [{ symbol: 'Ca', quantity: 1 }, { symbol: 'C', quantity: 1 }, { symbol: 'O', quantity: 3 }] },
    { name: 'Sodium Carbonate', formula: 'Na2CO3', molarMass: 105.989, description: 'Salt', elements: [{ symbol: 'Na', quantity: 2 }, { symbol: 'C', quantity: 1 }, { symbol: 'O', quantity: 3 }] },
    { name: 'Potassium Permanganate', formula: 'KMnO4', molarMass: 158.034, description: 'Oxidizing agent', elements: [{ symbol: 'K', quantity: 1 }, { symbol: 'Mn', quantity: 1 }, { symbol: 'O', quantity: 4 }] },
    { name: 'Sodium Thiosulfate', formula: 'Na2S2O3', molarMass: 158.11, description: 'Reducing agent', elements: [{ symbol: 'Na', quantity: 2 }, { symbol: 'S', quantity: 2 }, { symbol: 'O', quantity: 3 }] },
    { name: 'Copper Sulfate', formula: 'CuSO4', molarMass: 159.609, description: 'Salt', elements: [{ symbol: 'Cu', quantity: 1 }, { symbol: 'S', quantity: 1 }, { symbol: 'O', quantity: 4 }] },
  ];

  for (const cmp of compounds) {
    const c = await prisma.chemicalCompound.upsert({
      where: { formula: cmp.formula },
      update: {},
      create: {
        name: cmp.name,
        formula: cmp.formula,
        molarMass: cmp.molarMass,
        description: cmp.description,
      },
    });

    for (const elInfo of cmp.elements) {
      const element = await prisma.chemicalElement.findUnique({ where: { symbol: elInfo.symbol } });
      if (element) {
        // Find existing compoundElement mapping
        const existingCE = await prisma.compoundElement.findFirst({
          where: { compoundId: c.id, elementId: element.id }
        });
        if (!existingCE) {
          await prisma.compoundElement.create({
            data: {
              compoundId: c.id,
              elementId: element.id,
              quantity: elInfo.quantity,
            }
          });
        }
      }
    }
  }
}

async function seedLuffSchoorlTable() {
  console.log('  -> Seeding Luff Schoorl table...');
  let table = await prisma.luffSchoorlTable.findFirst({
    where: { name: 'Tabel Luff Schoorl Standar' },
  });

  if (table) {
    console.log('    (Luff Schoorl table already exists, skipping)');
    return;
  }

  table = await prisma.luffSchoorlTable.create({
    data: {
      name: 'Tabel Luff Schoorl Standar',
      description: 'Tabel konversi Luff Schoorl untuk penentuan gula reduksi',
    }
  });

  const values = [
    { volumeMl: 1, glucoseMg: 2.4, lactoseMg: 3.6, maltoseMg: 3.9 },
    { volumeMl: 2, glucoseMg: 4.8, lactoseMg: 7.2, maltoseMg: 7.8 },
    { volumeMl: 3, glucoseMg: 7.2, lactoseMg: 10.8, maltoseMg: 11.7 },
    { volumeMl: 4, glucoseMg: 9.7, lactoseMg: 14.4, maltoseMg: 15.6 },
    { volumeMl: 5, glucoseMg: 12.2, lactoseMg: 18.0, maltoseMg: 19.5 },
    { volumeMl: 6, glucoseMg: 14.7, lactoseMg: 21.6, maltoseMg: 23.4 },
    { volumeMl: 7, glucoseMg: 17.2, lactoseMg: 25.2, maltoseMg: 27.3 },
    { volumeMl: 8, glucoseMg: 19.8, lactoseMg: 28.8, maltoseMg: 31.2 },
    { volumeMl: 9, glucoseMg: 22.4, lactoseMg: 32.4, maltoseMg: 35.1 },
    { volumeMl: 10, glucoseMg: 25.0, lactoseMg: 36.0, maltoseMg: 39.0 },
    { volumeMl: 11, glucoseMg: 27.6, lactoseMg: 39.6, maltoseMg: 42.9 },
    { volumeMl: 12, glucoseMg: 30.3, lactoseMg: 44.0, maltoseMg: 47.6 },
    { volumeMl: 13, glucoseMg: 33.0, lactoseMg: 48.0, maltoseMg: 52.0 },
    { volumeMl: 14, glucoseMg: 35.7, lactoseMg: 52.0, maltoseMg: 56.3 },
    { volumeMl: 15, glucoseMg: 38.5, lactoseMg: 56.0, maltoseMg: 60.6 },
    { volumeMl: 16, glucoseMg: 41.3, lactoseMg: 60.0, maltoseMg: 64.9 },
    { volumeMl: 17, glucoseMg: 44.2, lactoseMg: 64.0, maltoseMg: 69.2 },
    { volumeMl: 18, glucoseMg: 47.1, lactoseMg: 68.0, maltoseMg: 73.5 },
    { volumeMl: 19, glucoseMg: 50.0, lactoseMg: 72.0, maltoseMg: 77.8 },
    { volumeMl: 20, glucoseMg: 53.0, lactoseMg: 76.0, maltoseMg: 82.1 },
    { volumeMl: 21, glucoseMg: 56.0, lactoseMg: 80.0, maltoseMg: 86.4 },
    { volumeMl: 22, glucoseMg: 59.1, lactoseMg: 84.0, maltoseMg: 90.7 },
    { volumeMl: 23, glucoseMg: 62.2, lactoseMg: 88.0, maltoseMg: 94.6 },
    { volumeMl: 24, glucoseMg: 65.4, lactoseMg: 92.0, maltoseMg: 98.9 },
    { volumeMl: 25, glucoseMg: 68.6, lactoseMg: 96.0, maltoseMg: 103.2 },
  ];

  for (const v of values) {
    await prisma.luffSchoorlValue.create({
      data: {
        tableId: table.id,
        ...v
      }
    });
  }
}

async function seedProteinFactors() {
  console.log('  -> Seeding protein conversion factors...');
  const factors = [
    { foodType: 'Bir', factor: 6.25 },
    { foodType: 'Daging & Ikan', factor: 6.25 },
    { foodType: 'Gelatin', factor: 5.55 },
    { foodType: 'Kacang Tanah', factor: 5.46 },
    { foodType: 'Kacang Kedelai', factor: 5.71 },
    { foodType: 'Beras', factor: 5.95 },
    { foodType: 'Gandum (utuh)', factor: 5.83 },
    { foodType: 'Gandum (endosperm)', factor: 5.70 },
    { foodType: 'Kasein & Susu', factor: 6.38 },
    { foodType: 'Telur', factor: 6.25 },
    { foodType: 'Jagung', factor: 6.25 },
    { foodType: 'Tahu & Tempe', factor: 5.71 },
    { foodType: 'Makanan Laut', factor: 6.25 },
    { foodType: 'Makanan Umum', factor: 6.25 },
    { foodType: 'Kacang-kacangan Lain', factor: 6.25 },
  ];

  for (const f of factors) {
    await prisma.proteinConversionFactor.upsert({
      where: { foodType: f.foodType },
      update: {},
      create: {
        foodType: f.foodType,
        factor: f.factor,
        source: 'SNI/AOAC Standard'
      },
    });
  }
}

async function seedConversionFactors() {
  console.log('  -> Seeding conversion factors...');
  const factors = [
    { category: 'mass', fromUnit: 'g', toUnit: 'mg', factor: 1000 },
    { category: 'mass', fromUnit: 'kg', toUnit: 'g', factor: 1000 },
    { category: 'mass', fromUnit: 'mg', toUnit: 'g', factor: 0.001 },
    { category: 'volume', fromUnit: 'L', toUnit: 'mL', factor: 1000 },
    { category: 'volume', fromUnit: 'mL', toUnit: 'L', factor: 0.001 },
    { category: 'concentration', fromUnit: 'M', toUnit: 'mM', factor: 1000 },
    { category: 'concentration', fromUnit: 'ppm', toUnit: 'mg/L', factor: 1 },
    { category: 'concentration', fromUnit: '%w/v', toUnit: 'g/100mL', factor: 1 },
    { category: 'concentration', fromUnit: '%w/w', toUnit: 'g/100g', factor: 1 },
    { category: 'temperature', fromUnit: 'C', toUnit: 'K', factor: 273.15, description: 'Offset for K' },
  ];

  for (const f of factors) {
    // There might not be a unique constraint on (fromUnit, toUnit) based on instructions,
    // we'll just check if it exists first.
    const existing = await prisma.conversionFactor.findFirst({
      where: { fromUnit: f.fromUnit, toUnit: f.toUnit }
    });
    if (!existing) {
      await prisma.conversionFactor.create({
        data: {
          category: f.category,
          fromUnit: f.fromUnit,
          toUnit: f.toUnit,
          factor: f.factor,
          description: f.description || '',
        }
      });
    }
  }
}

async function seedFormulas() {
  console.log('  -> Seeding formulas...');
  const modKadarAir = await prisma.labModule.findUnique({ where: { slug: 'kadar-air' } });
  const modKadarAbu = await prisma.labModule.findUnique({ where: { slug: 'kadar-abu' } });
  const modKadarProtein = await prisma.labModule.findUnique({ where: { slug: 'kadar-protein' } });
  const modKadarKarbo = await prisma.labModule.findUnique({ where: { slug: 'kadar-karbohidrat' } });
  const modMolarMass = await prisma.labModule.findUnique({ where: { slug: 'molar-mass' } });
  const modTitrasi = await prisma.labModule.findUnique({ where: { slug: 'titrasi' } });

  const formulas = [
    { modId: modKadarAir?.id, code: 'MOISTURE_CONTENT', name: 'Kadar Air', expression: '((W1 - W2) / (W1 - W0)) * 100', unit: '%' },
    { modId: modKadarAbu?.id, code: 'ASH_CONTENT', name: 'Kadar Abu', expression: '((W2 - W0) / (W1 - W0)) * 100', unit: '%' },
    { modId: modKadarProtein?.id, code: 'PROTEIN_CONTENT', name: 'Kadar Protein', expression: '((V1 - V0) * N * 14.007 * F / W) * 100', unit: '%' },
    { modId: modKadarProtein?.id, code: 'NITROGEN_CONTENT', name: 'Kadar Nitrogen', expression: '((V1 - V0) * N * 14.007 / W) * 100', unit: '%' },
    { modId: modKadarKarbo?.id, code: 'REDUCING_SUGAR', name: 'Gula Reduksi', expression: '(W_sugar * FP / W_sample) * 100', unit: '%' },
    { modId: modMolarMass?.id, code: 'MOLAR_MASS_CALC', name: 'Massa Molar', expression: 'SUM(n_i * Ar_i)', unit: 'g/mol' },
    { modId: modMolarMass?.id, code: 'EQUIVALENT_WEIGHT', name: 'Berat Ekivalen', expression: 'Mr / n', unit: 'g/eq' },
    { modId: modTitrasi?.id, code: 'MOLARITY_STANDARD', name: 'Molaritas Larutan Standar', expression: '(W / Mr) / V', unit: 'M' },
    { modId: modTitrasi?.id, code: 'ANALYTE_CONCENTRATION', name: 'Kadar Analit', expression: '(V1 * M1 * Mr) / (V_sample * 1000) * 100', unit: '%' },
  ];

  for (const f of formulas) {
    if (!f.modId) continue;
    const formula = await prisma.formula.upsert({
      where: { code: f.code },
      update: {},
      create: {
        moduleId: f.modId,
        code: f.code,
        name: f.name,
        description: f.name,
        expression: f.expression,
        unit: f.unit,
        isSystem: true,
        isActive: true,
      },
    });

    const existingVersion = await prisma.formulaVersion.findFirst({
      where: { formulaId: formula.id, version: 1 }
    });
    if (!existingVersion) {
      await prisma.formulaVersion.create({
        data: {
          formulaId: formula.id,
          version: 1,
          expression: f.expression,
        }
      });
    }
  }
}

async function seedQuizzes() {
  console.log('  -> Seeding quizzes...');
  const modules = await prisma.labModule.findMany();

  for (const mod of modules) {
    // Only seeding specific ones to avoid huge script if we don't have all data, but prompt says "create similar quiz structures for other modules (you can make them shorter)"
    const existingQuiz = await prisma.quiz.findFirst({ where: { moduleId: mod.id } });
    if (!existingQuiz) {
      const quiz = await prisma.quiz.create({
        data: {
          moduleId: mod.id,
          title: `Pre-Test ${mod.name}`,
          description: `Kuis persiapan untuk modul ${mod.name}`,
          timeLimit: 15,
          passingScore: 60,
          isActive: true,
        }
      });

      if (mod.slug === 'kadar-air') {
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: 'Apa prinsip dasar penentuan kadar air metode gravimetri?',
            questionType: 'MULTIPLE_CHOICE',
            options: ['Penguapan air pada suhu tinggi', 'Reaksi kimia dengan air', 'Titrasi dengan reagen Karl Fischer', 'Pengukuran densitas'],
            correctAnswer: 'Penguapan air pada suhu tinggi',
            points: 10,
            orderIndex: 1,
            explanation: 'Prinsipnya adalah menguapkan air dari bahan.',
          }
        });
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: 'Berapa suhu oven yang digunakan untuk pengeringan sampel?',
            questionType: 'MULTIPLE_CHOICE',
            options: ['80-90°C', '100-105°C', '120-130°C', '150-160°C'],
            correctAnswer: '100-105°C',
            points: 10,
            orderIndex: 2,
            explanation: 'Suhu ideal untuk menguapkan air tanpa merusak komponen lain.',
          }
        });
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: 'Pengeringan dianggap konstan ketika selisih penimbangan berturut-turut kurang dari?',
            questionType: 'MULTIPLE_CHOICE',
            options: ['0.1 mg', '0.5 mg', '1 mg', '5 mg'],
            correctAnswer: '0.5 mg',
            points: 10,
            orderIndex: 3,
            explanation: 'Penimbangan konstan dicapai jika selisih < 0.5 mg.',
          }
        });
      } else {
        // Generic questions for other modules
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: 'Pertanyaan umum 1 tentang ' + mod.name,
            questionType: 'MULTIPLE_CHOICE',
            options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
            correctAnswer: 'Jawaban A',
            points: 10,
            orderIndex: 1,
            explanation: '',
          }
        });
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: 'Pertanyaan umum 2 tentang ' + mod.name,
            questionType: 'MULTIPLE_CHOICE',
            options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
            correctAnswer: 'Jawaban B',
            points: 10,
            orderIndex: 2,
            explanation: '',
          }
        });
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionText: 'Pertanyaan umum 3 tentang ' + mod.name,
            questionType: 'MULTIPLE_CHOICE',
            options: ['Jawaban A', 'Jawaban B', 'Jawaban C', 'Jawaban D'],
            correctAnswer: 'Jawaban C',
            points: 10,
            orderIndex: 3,
            explanation: '',
          }
        });
      }
    }
  }
}

/**
 * Feature #74: Demo Class
 * Creates demo instructor, demo student, and demo class 'Analisis Kimia 2026'
 */
async function seedDemoClass() {
  console.log('  -> Seeding demo class (Feature #74)...');
  const demoPasswordHash = await bcrypt.hash('Demo123!', 12);

  // 1. Demo Instructor
  const demoInstructorUser = await prisma.user.upsert({
    where: { email: 'demo.instructor@virtuallab.local' },
    update: {},
    create: {
      name: 'Dr. Demo',
      email: 'demo.instructor@virtuallab.local',
      passwordHash: demoPasswordHash,
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
    },
  });

  const demoInstructor = await prisma.instructor.upsert({
    where: { userId: demoInstructorUser.id },
    update: {},
    create: {
      userId: demoInstructorUser.id,
      employeeNumber: 'DEMO-INST-001',
    },
  });

  // 2. Demo Student
  const demoStudentUser = await prisma.user.upsert({
    where: { email: 'demo.student@virtuallab.local' },
    update: {},
    create: {
      name: 'Student Demo',
      email: 'demo.student@virtuallab.local',
      passwordHash: demoPasswordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    },
  });

  const demoStudent = await prisma.student.upsert({
    where: { userId: demoStudentUser.id },
    update: {},
    create: {
      userId: demoStudentUser.id,
      studentNumber: 'DEMO-2026-001',
    },
  });

  // 3. Demo Class: Analisis Kimia 2026
  const demoClass = await prisma.class.upsert({
    where: { code: 'KIMIA2026' },
    update: {},
    create: {
      name: 'Analisis Kimia 2026',
      code: 'KIMIA2026',
      course: 'Analisis Kimia',
      semester: 'Ganjil',
      academicYear: '2025/2026',
      instructorId: demoInstructor.id,
    },
  });

  // 4. Add Student Demo as class member
  await prisma.classMember.upsert({
    where: {
      classId_studentId: {
        classId: demoClass.id,
        studentId: demoStudent.id,
      },
    },
    update: {},
    create: {
      classId: demoClass.id,
      studentId: demoStudent.id,
      joinedAt: new Date(),
    },
  });

  // 5. Create experiments for the demo class (link to existing lab modules)
  const modules = await prisma.labModule.findMany();
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 60);

  for (const m of modules) {
    const existing = await prisma.experiment.findFirst({
      where: { moduleId: m.id, classId: demoClass.id },
    });

    if (!existing) {
      await prisma.experiment.create({
        data: {
          moduleId: m.id,
          classId: demoClass.id,
          title: `Demo: ${m.name}`,
          description: `Eksperimen demo untuk ${m.name}`,
          instructions: 'Ikuti prosedur di modul.',
          maxScore: 100,
          deadline: deadline,
          isPublished: true,
        },
      });
    }
  }

  console.log('    Demo Class: Analisis Kimia 2026 (KIMIA2026)');
  console.log('    Demo Instructor: demo.instructor@virtuallab.local / Demo123!');
  console.log('    Demo Student: demo.student@virtuallab.local / Demo123!');
}

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('⚠️  WARNING: Using development-only credentials!');
  console.log('');

  try {
    await seedUsers();
    await seedClassAndMembers();
    await seedLabModules();
    await seedExperiments();
    await seedChemicalElements();
    await seedChemicalCompounds();
    await seedLuffSchoorlTable();
    await seedProteinFactors();
    await seedConversionFactors();
    await seedFormulas();
    await seedQuizzes();
    await seedDemoClass();

    console.log('');
    console.log('✅ Database seeding completed!');
    console.log('');
    console.log('📋 Login Credentials (DEVELOPMENT ONLY):');
    console.log('   Admin:      admin@virtuallab.local     / Admin123!');
    console.log('   Instructor: dosen@virtuallab.local      / Dosen123!');
    console.log('   Students:   student@virtuallab.local    / Student123!');
    console.log('               mahasiswa2-5@virtuallab.local / Student123!');
    console.log('');
    console.log('📋 Demo Class (Feature #74):');
    console.log('   Class:      Analisis Kimia 2026 (Code: KIMIA2026)');
    console.log('   Instructor: demo.instructor@virtuallab.local / Demo123!');
    console.log('   Student:    demo.student@virtuallab.local    / Demo123!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
