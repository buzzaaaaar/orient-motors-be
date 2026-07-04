require('dotenv').config();
const mongoose = require('mongoose');
const User    = require('./models/User');
const Part    = require('./models/Part');
const Vehicle = require('./models/Vehicle');
const PartVehicleCompatibility = require('./models/PartVehicleCompatibility');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/orient_motors';

/* ─── Vehicles ────────────────────────────────────────────────────────────── */
const VEHICLES = [
  { make: 'Toyota', model: 'Corolla',   trim: 'GLi',   yearFrom: 2015, yearTo: 2019, engineCode: '2ZR-FE',  chassisCode: 'ZRE172', bodyType: 'Sedan',  transmission: 'auto',   fuelType: 'petrol'   },
  { make: 'Toyota', model: 'Corolla',   trim: 'Altis', yearFrom: 2019, yearTo: 2023, engineCode: 'M20A-FKS',chassisCode: 'ZWE211', bodyType: 'Sedan',  transmission: 'auto',   fuelType: 'hybrid'   },
  { make: 'Toyota', model: 'Hilux',     trim: 'Revo',  yearFrom: 2016, yearTo: 2022, engineCode: '2GD-FTV', chassisCode: 'GUN125', bodyType: 'Pickup', transmission: 'manual', fuelType: 'diesel'   },
  { make: 'Toyota', model: 'Land Cruiser', trim: 'LC200', yearFrom: 2015, yearTo: 2021, engineCode: '1VD-FTV', chassisCode: 'UZJ200', bodyType: 'SUV', transmission: 'auto',   fuelType: 'diesel'   },
  { make: 'Honda',  model: 'Civic',     trim: 'VTi',   yearFrom: 2016, yearTo: 2021, engineCode: 'L15B7',   chassisCode: 'FC1',    bodyType: 'Sedan',  transmission: 'auto',   fuelType: 'petrol'   },
  { make: 'Honda',  model: 'City',      trim: 'Aspire',yearFrom: 2017, yearTo: 2022, engineCode: 'L15Z1',   chassisCode: 'GM6',    bodyType: 'Sedan',  transmission: 'auto',   fuelType: 'petrol'   },
  { make: 'Honda',  model: 'HR-V',      trim: 'EX',    yearFrom: 2015, yearTo: 2022, engineCode: 'R20A2',   chassisCode: 'RU1',    bodyType: 'SUV',    transmission: 'auto',   fuelType: 'hybrid'   },
  { make: 'Suzuki', model: 'Swift',     trim: 'DLX',   yearFrom: 2018, yearTo: 2023, engineCode: 'K12C',    chassisCode: 'ZC33S',  bodyType: 'Hatch',  transmission: 'manual', fuelType: 'petrol'   },
  { make: 'Suzuki', model: 'Cultus',    trim: 'VXR',   yearFrom: 2017, yearTo: 2023, engineCode: 'K10B',    chassisCode: 'GC612',  bodyType: 'Hatch',  transmission: 'manual', fuelType: 'petrol'   },
  { make: 'Daihatsu',model:'Mira',      trim: 'X',     yearFrom: 2014, yearTo: 2020, engineCode: 'KF-VE',   chassisCode: 'L275S',  bodyType: 'Hatch',  transmission: 'auto',   fuelType: 'petrol'   },
];

/* ─── Parts ───────────────────────────────────────────────────────────────── */
const PARTS = [
  {
    originalPartNumber: '04465-02220',
    partName: 'Front Brake Pad Set',
    category: 'Brake', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '04465-02220', oemManufacturer: 'Toyota' }, { oemNumber: 'GDB3217', oemManufacturer: 'TRW' }],
    description: 'OEM front disc brake pads. Recommended replacement every 40,000 km.',
    status: 'active',
  },
  {
    originalPartNumber: '04466-12110',
    partName: 'Rear Brake Pad Set',
    category: 'Brake', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '04466-12110', oemManufacturer: 'Toyota' }, { oemNumber: 'GDB3459', oemManufacturer: 'TRW' }],
    description: 'OEM rear disc brake pads for drum-to-disc converted models.',
    status: 'active',
  },
  {
    originalPartNumber: '47750-02200',
    partName: 'Rear Brake Drum',
    category: 'Brake', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '47750-02200', oemManufacturer: 'Toyota' }],
    description: 'Cast iron rear brake drum. Inspect for scoring before replacement.',
    status: 'active',
  },
  {
    originalPartNumber: '90915-YZZD2',
    partName: 'Engine Oil Filter',
    category: 'Filter', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '90915-YZZD2', oemManufacturer: 'Toyota' }, { oemNumber: 'OC295', oemManufacturer: 'Mahle' }],
    description: 'Spin-on engine oil filter. Replace every oil change.',
    status: 'active',
  },
  {
    originalPartNumber: '17801-31090',
    partName: 'Air Filter Element',
    category: 'Filter', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '17801-31090', oemManufacturer: 'Toyota' }, { oemNumber: 'C26010', oemManufacturer: 'Mahle' }],
    description: 'Panel-type air filter. Replace every 30,000 km or as required.',
    status: 'active',
  },
  {
    originalPartNumber: '87139-30040',
    partName: 'Cabin Air Filter',
    category: 'Filter', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '87139-30040', oemManufacturer: 'Toyota' }],
    description: 'Activated carbon cabin air filter for HVAC system.',
    status: 'active',
  },
  {
    originalPartNumber: '23300-75020',
    partName: 'Fuel Filter',
    category: 'Filter', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '23300-75020', oemManufacturer: 'Toyota' }, { oemNumber: 'KL103', oemManufacturer: 'Mahle' }],
    description: 'In-line fuel filter. Replace every 40,000 km.',
    status: 'active',
  },
  {
    originalPartNumber: '16400-0H010',
    partName: 'Radiator Assembly',
    category: 'Cooling', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '16400-0H010', oemManufacturer: 'Toyota' }],
    description: 'Aluminium core radiator with plastic tanks. Inspect for leaks annually.',
    status: 'active',
  },
  {
    originalPartNumber: '16271-20010',
    partName: 'Radiator Upper Hose',
    category: 'Cooling', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '16271-20010', oemManufacturer: 'Toyota' }],
    description: 'Moulded rubber upper radiator hose.',
    status: 'active',
  },
  {
    originalPartNumber: '88440-0K170',
    partName: 'A/C Compressor',
    category: 'Air Conditioning', brand: 'Denso',
    oemNumbers: [{ oemNumber: '88440-0K170', oemManufacturer: 'Toyota' }, { oemNumber: '447260-6410', oemManufacturer: 'Denso' }],
    description: 'Variable displacement A/C compressor. Includes clutch assembly.',
    status: 'active',
  },
  {
    originalPartNumber: '28100-0L020',
    partName: 'Starter Motor',
    category: 'Electrical', brand: 'Denso',
    oemNumbers: [{ oemNumber: '28100-0L020', oemManufacturer: 'Toyota' }, { oemNumber: '281000L020', oemManufacturer: 'Denso' }],
    description: '12V starter motor, 1.4 kW.',
    status: 'active',
  },
  {
    originalPartNumber: '27060-0L010',
    partName: 'Alternator Assembly',
    category: 'Electrical', brand: 'Denso',
    oemNumbers: [{ oemNumber: '27060-0L010', oemManufacturer: 'Toyota' }, { oemNumber: '101211-3610', oemManufacturer: 'Denso' }],
    description: '12V / 80A alternator with internal regulator.',
    status: 'active',
  },
  {
    originalPartNumber: '90919-02240',
    partName: 'Spark Plug',
    category: 'Engine', brand: 'Denso',
    oemNumbers: [{ oemNumber: '90919-02240', oemManufacturer: 'Toyota' }, { oemNumber: 'SK20HR11', oemManufacturer: 'NGK' }],
    description: 'Iridium spark plug. Replace every 100,000 km.',
    status: 'active',
  },
  {
    originalPartNumber: '11127-28010',
    partName: 'Valve Cover Gasket',
    category: 'Engine', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '11127-28010', oemManufacturer: 'Toyota' }],
    description: 'Rubber-coated steel valve cover gasket. Replace on oil seep.',
    status: 'active',
  },
  {
    originalPartNumber: '04351-52010',
    partName: 'CV Joint Boot Kit — Front LH',
    category: 'Drivetrain', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '04351-52010', oemManufacturer: 'Toyota' }],
    description: 'Left-hand front CV axle boot and grease kit.',
    status: 'active',
  },
  {
    originalPartNumber: '48231-52290',
    partName: 'Front Coil Spring — LH',
    category: 'Suspension', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '48231-52290', oemManufacturer: 'Toyota' }],
    description: 'Left-hand front suspension coil spring.',
    status: 'active',
  },
  {
    originalPartNumber: '48510-80423',
    partName: 'Front Shock Absorber',
    category: 'Suspension', brand: 'KYB',
    oemNumbers: [{ oemNumber: '48510-80423', oemManufacturer: 'Toyota' }, { oemNumber: '339390', oemManufacturer: 'KYB' }],
    description: 'Gas-charged front strut shock absorber.',
    status: 'active',
  },
  {
    originalPartNumber: '45503-39135',
    partName: 'Tie Rod End — RH',
    category: 'Steering', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '45503-39135', oemManufacturer: 'Toyota' }],
    description: 'Right-hand outer tie rod end. Check for play every service.',
    status: 'discontinued',
  },
  {
    originalPartNumber: '45503-39145',
    partName: 'Tie Rod End — RH (Revised)',
    category: 'Steering', brand: 'Toyota Genuine',
    oemNumbers: [{ oemNumber: '45503-39145', oemManufacturer: 'Toyota' }],
    description: 'Revised right-hand outer tie rod end. Supersedes 45503-39135.',
    status: 'active',
  },
  {
    originalPartNumber: '44310-0K100',
    partName: 'Power Steering Pump',
    category: 'Steering', brand: 'Jtekt',
    oemNumbers: [{ oemNumber: '44310-0K100', oemManufacturer: 'Toyota' }, { oemNumber: '7690955090', oemManufacturer: 'Jtekt' }],
    description: 'Hydraulic power steering pump with reservoir. 120 bar max pressure.',
    status: 'active',
  },
];

/* ─── Compatibility links  [partIndex, vehicleIndex] ─────────────────────── */
// Indices refer to positions in PARTS[] and VEHICLES[] arrays above.
const COMPAT_LINKS = [
  // Front Brake Pads → Toyota Corolla GLi 2015-2019, Corolla Altis 2019-2023, Honda Civic
  [0, 0], [0, 1], [0, 4],
  // Rear Brake Pads → Corolla GLi, Corolla Altis, Honda City
  [1, 0], [1, 1], [1, 5],
  // Rear Brake Drum → Suzuki Swift, Suzuki Cultus, Daihatsu Mira
  [2, 7], [2, 8], [2, 9],
  // Oil Filter → Corolla GLi, Corolla Altis, Hilux, Honda Civic, Honda City
  [3, 0], [3, 1], [3, 2], [3, 4], [3, 5],
  // Air Filter → Corolla GLi, Corolla Altis, Honda HR-V
  [4, 0], [4, 1], [4, 6],
  // Cabin Air Filter → Corolla Altis, Honda Civic, Honda City
  [5, 1], [5, 4], [5, 5],
  // Fuel Filter → Hilux, Land Cruiser
  [6, 2], [6, 3],
  // Radiator → Corolla GLi, Corolla Altis, Honda Civic
  [7, 0], [7, 1], [7, 4],
  // Radiator Upper Hose → Corolla GLi, Hilux
  [8, 0], [8, 2],
  // A/C Compressor → Hilux, Land Cruiser, Honda HR-V
  [9, 2], [9, 3], [9, 6],
  // Starter Motor → Corolla GLi, Honda City, Suzuki Cultus
  [10, 0], [10, 5], [10, 8],
  // Alternator → Corolla GLi, Corolla Altis, Suzuki Swift
  [11, 0], [11, 1], [11, 7],
  // Spark Plug → Corolla GLi, Honda Civic, Honda City, Suzuki Swift
  [12, 0], [12, 4], [12, 5], [12, 7],
  // Valve Cover Gasket → Corolla GLi, Corolla Altis
  [13, 0], [13, 1],
  // CV Boot → Corolla GLi, Honda Civic
  [14, 0], [14, 4],
  // Front Coil Spring → Corolla GLi, Honda Civic
  [15, 0], [15, 4],
  // Front Shock → Corolla GLi, Corolla Altis, Honda Civic
  [16, 0], [16, 1], [16, 4],
  // Tie Rod End (discontinued) → Corolla GLi
  [17, 0],
  // Tie Rod End (revised/active) → Corolla GLi, Corolla Altis
  [18, 0], [18, 1],
  // Power Steering Pump → Hilux, Land Cruiser
  [19, 2], [19, 3],
];

/* ─── Seed ────────────────────────────────────────────────────────────────── */
const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Vehicle.deleteMany({});
  await Part.deleteMany({});
  await PartVehicleCompatibility.deleteMany({});
  console.log('✔ Cleared existing vehicles, parts, and compatibilities.');

  /* 1 — Admin user */
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    const passwordHash = await User.hashPassword('admin123');
    admin = await User.create({
      username: 'admin',
      passwordHash,
      fullName: 'System Administrator',
      role: 'admin',
    });
    console.log('✔  Admin user created  (username: admin  /  password: admin123)');
    console.log('   ⚠  Change this password after first login!');
  } else {
    console.log('–  Admin user already exists, skipping.');
  }

  /* 2 — Vehicles */
  const vehicleDocs = [];
  for (const v of VEHICLES) {
    const existing = await Vehicle.findOne({ make: v.make, model: v.model, yearFrom: v.yearFrom });
    if (existing) {
      console.log(`–  Vehicle already exists: ${v.make} ${v.model} ${v.yearFrom}`);
      vehicleDocs.push(existing);
    } else {
      const doc = await Vehicle.create({ ...v, createdBy: admin._id, updatedBy: admin._id });
      console.log(`✔  Vehicle created: ${doc.make} ${doc.model} ${doc.yearFrom}–${doc.yearTo}`);
      vehicleDocs.push(doc);
    }
  }

  /* 3 — Parts  (link supersededBy after all parts created) */
  const partDocs = [];
  for (const p of PARTS) {
    const existing = await Part.findOne({ originalPartNumber: p.originalPartNumber });
    if (existing) {
      console.log(`–  Part already exists: ${p.originalPartNumber}`);
      partDocs.push(existing);
    } else {
      const doc = await Part.create({ ...p, createdBy: admin._id, updatedBy: admin._id });
      console.log(`✔  Part created: ${doc.originalPartNumber} — ${doc.partName}`);
      partDocs.push(doc);
    }
  }

  /* Wire supersededBy: 45503-39135 (index 17) → 45503-39145 (index 18) */
  const oldTieRod = partDocs[17];
  const newTieRod = partDocs[18];
  if (oldTieRod && newTieRod && !oldTieRod.supersededBy) {
    oldTieRod.supersededBy = newTieRod._id;
    oldTieRod.status = 'superseded';
    await oldTieRod.save();
    console.log('✔  Superseded link: 45503-39135 → 45503-39145');
  }

  /* 4 — Compatibility links */
  let created = 0, skipped = 0;
  for (const [pIdx, vIdx] of COMPAT_LINKS) {
    const part    = partDocs[pIdx];
    const vehicle = vehicleDocs[vIdx];
    if (!part || !vehicle) continue;

    const existing = await PartVehicleCompatibility.findOne({ partId: part._id, vehicleId: vehicle._id });
    if (existing) { skipped++; continue; }

    await PartVehicleCompatibility.create({
      partId:    part._id,
      vehicleId: vehicle._id,
      fuelTypes: ['petrol', 'diesel', 'hybrid'],
      transmissions: ['manual', 'auto'],
      createdBy: admin._id,
    });
    created++;
  }
  console.log(`✔  Compatibility links: ${created} created, ${skipped} already existed`);

  await mongoose.disconnect();
  console.log('\nSeed complete.');
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
