import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.note.deleteMany();
  await prisma.document.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.transport.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.day.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.trip.deleteMany();

  const trip = await prisma.trip.create({
    data: {
      name: 'Thailand Adventure 🇹🇭',
      description: 'Two weeks exploring the best of Thailand — temples, beaches, street food, and island hopping!',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-29'),
      homeCurrency: 'USD',
      exchangeRate: 33.5,
    },
  });

  // Destinations
  const bangkok = await prisma.destination.create({
    data: { tripId: trip.id, name: 'Bangkok', lat: 13.7563, lng: 100.5018, sortOrder: 0 },
  });
  const chiangMai = await prisma.destination.create({
    data: { tripId: trip.id, name: 'Chiang Mai', lat: 18.7883, lng: 98.9853, sortOrder: 1 },
  });
  const phuket = await prisma.destination.create({
    data: { tripId: trip.id, name: 'Phuket', lat: 7.8804, lng: 98.3923, sortOrder: 2 },
  });
  const kohSamui = await prisma.destination.create({
    data: { tripId: trip.id, name: 'Koh Samui', lat: 9.5120, lng: 100.0136, sortOrder: 3 },
  });

  // Days
  const days = [];
  const startDate = new Date('2026-11-15');
  const citySchedule = [
    { dest: bangkok, days: [0, 1, 2] },
    { dest: chiangMai, days: [3, 4, 5] },
    { dest: phuket, days: [6, 7, 8, 9] },
    { dest: kohSamui, days: [10, 11, 12, 13] },
  ];
  const dayTitles = [
    'Arrival & Khao San Road',
    'Grand Palace & Temples',
    'Floating Market & Street Food',
    'Fly to Chiang Mai',
    'Old City & Temples',
    'Elephant Sanctuary',
    'Fly to Phuket',
    'Patong Beach Day',
    'Phi Phi Island Day Trip',
    'Old Phuket Town',
    'Ferry to Koh Samui',
    'Beach & Relaxation',
    'Ang Thong Marine Park',
    'Departure Day',
  ];

  for (const schedule of citySchedule) {
    for (const dayOffset of schedule.days) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayOffset);
      const day = await prisma.day.create({
        data: {
          tripId: trip.id,
          destinationId: schedule.dest.id,
          date,
          dayNumber: dayOffset + 1,
          title: dayTitles[dayOffset],
          sortOrder: dayOffset,
        },
      });
      days.push(day);
    }
  }

  // Activities
  const activities = [
    // Bangkok
    { tripId: trip.id, destinationId: bangkok.id, dayId: days[0].id, name: 'Grand Palace', category: 'temple', estimatedCost: 500, duration: '2 hours', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 13.7500, lng: 100.4914, sortOrder: 0 },
    { tripId: trip.id, destinationId: bangkok.id, dayId: days[0].id, name: 'Wat Pho (Reclining Buddha)', category: 'temple', estimatedCost: 200, duration: '1.5 hours', priority: 'must-do', interestP1: 5, interestP2: 4, lat: 13.7465, lng: 100.4930, sortOrder: 1 },
    { tripId: trip.id, destinationId: bangkok.id, dayId: days[1].id, name: 'Chatuchak Weekend Market', category: 'market', estimatedCost: 1000, duration: '3 hours', priority: 'must-do', interestP1: 4, interestP2: 5, lat: 13.7999, lng: 100.5506, sortOrder: 0 },
    { tripId: trip.id, destinationId: bangkok.id, dayId: days[1].id, name: 'Wat Arun', category: 'temple', estimatedCost: 100, duration: '1 hour', priority: 'must-do', interestP1: 4, interestP2: 5, lat: 13.7437, lng: 100.4888, sortOrder: 1 },
    { tripId: trip.id, destinationId: bangkok.id, dayId: days[2].id, name: 'Damnoen Saduak Floating Market', category: 'market', estimatedCost: 500, duration: '3 hours', priority: 'nice-to-have', interestP1: 3, interestP2: 5, lat: 13.5239, lng: 99.9575, sortOrder: 0 },
    { tripId: trip.id, destinationId: bangkok.id, dayId: days[2].id, name: 'Khao San Road Night Life', category: 'nightlife', estimatedCost: 800, duration: '3 hours', priority: 'nice-to-have', interestP1: 4, interestP2: 3, lat: 13.7588, lng: 100.4974, sortOrder: 1 },
    // Chiang Mai
    { tripId: trip.id, destinationId: chiangMai.id, dayId: days[3].id, name: 'Doi Suthep Temple', category: 'temple', estimatedCost: 50, duration: '2 hours', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 18.8048, lng: 98.9217, sortOrder: 0 },
    { tripId: trip.id, destinationId: chiangMai.id, dayId: days[4].id, name: 'Sunday Walking Street Market', category: 'market', estimatedCost: 500, duration: '2.5 hours', priority: 'must-do', interestP1: 4, interestP2: 5, lat: 18.7876, lng: 98.9928, sortOrder: 0 },
    { tripId: trip.id, destinationId: chiangMai.id, dayId: days[5].id, name: 'Elephant Nature Park', category: 'nature', estimatedCost: 2500, duration: 'Full day', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 19.1750, lng: 98.7720, sortOrder: 0 },
    { tripId: trip.id, destinationId: chiangMai.id, dayId: days[4].id, name: 'Thai Cooking Class', category: 'culture', estimatedCost: 1200, duration: '4 hours', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 18.7953, lng: 98.9685, sortOrder: 1 },
    // Phuket
    { tripId: trip.id, destinationId: phuket.id, dayId: days[6].id, name: 'Patong Beach', category: 'beach', estimatedCost: 0, duration: 'Half day', priority: 'must-do', interestP1: 4, interestP2: 5, lat: 7.8961, lng: 98.2961, sortOrder: 0 },
    { tripId: trip.id, destinationId: phuket.id, dayId: days[7].id, name: 'Phi Phi Islands Tour', category: 'tour', estimatedCost: 2000, duration: 'Full day', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 7.7407, lng: 98.7784, sortOrder: 0 },
    { tripId: trip.id, destinationId: phuket.id, dayId: days[8].id, name: 'Big Buddha', category: 'temple', estimatedCost: 0, duration: '1.5 hours', priority: 'nice-to-have', interestP1: 3, interestP2: 4, lat: 7.8278, lng: 98.3126, sortOrder: 0 },
    { tripId: trip.id, destinationId: phuket.id, dayId: days[9].id, name: 'Old Phuket Town Walking Tour', category: 'culture', estimatedCost: 0, duration: '2 hours', priority: 'nice-to-have', interestP1: 3, interestP2: 4, lat: 7.8847, lng: 98.3857, sortOrder: 0 },
    // Koh Samui
    { tripId: trip.id, destinationId: kohSamui.id, dayId: days[10].id, name: 'Chaweng Beach', category: 'beach', estimatedCost: 0, duration: 'Half day', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 9.5311, lng: 100.0601, sortOrder: 0 },
    { tripId: trip.id, destinationId: kohSamui.id, dayId: days[11].id, name: 'Ang Thong National Marine Park', category: 'tour', estimatedCost: 2500, duration: 'Full day', priority: 'must-do', interestP1: 5, interestP2: 5, lat: 9.6167, lng: 99.6833, sortOrder: 0 },
    { tripId: trip.id, destinationId: kohSamui.id, dayId: days[12].id, name: 'Fisherman\'s Village Night Market', category: 'market', estimatedCost: 600, duration: '2 hours', priority: 'nice-to-have', interestP1: 4, interestP2: 4, lat: 9.5581, lng: 100.0609, sortOrder: 0 },
  ];

  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }

  // Accommodations
  await prisma.accommodation.createMany({
    data: [
      {
        tripId: trip.id, destinationId: bangkok.id, name: 'Riva Surya Bangkok', type: 'hotel',
        checkIn: new Date('2026-11-15'), checkOut: new Date('2026-11-18'),
        pricePerNight: 3500, totalCost: 10500, currency: 'THB',
        lat: 13.7577, lng: 100.4921, isBooked: false, roomType: 'Deluxe River View',
        notes: 'Beautiful riverside hotel near Grand Palace',
      },
      {
        tripId: trip.id, destinationId: chiangMai.id, name: 'Ping Nakara Boutique Hotel', type: 'hotel',
        checkIn: new Date('2026-11-18'), checkOut: new Date('2026-11-21'),
        pricePerNight: 2800, totalCost: 8400, currency: 'THB',
        lat: 18.7932, lng: 98.9914, isBooked: false, roomType: 'Superior Room',
        notes: 'Colonial-style boutique hotel in old city',
      },
      {
        tripId: trip.id, destinationId: phuket.id, name: 'The Shore at Katathani', type: 'resort',
        checkIn: new Date('2026-11-21'), checkOut: new Date('2026-11-25'),
        pricePerNight: 5000, totalCost: 20000, currency: 'THB',
        lat: 7.8173, lng: 98.3005, isBooked: false, roomType: 'Pool Villa',
        notes: 'Luxury beachfront resort with private pool',
      },
      {
        tripId: trip.id, destinationId: kohSamui.id, name: 'Anantara Bophut Resort', type: 'resort',
        checkIn: new Date('2026-11-25'), checkOut: new Date('2026-11-29'),
        pricePerNight: 4500, totalCost: 18000, currency: 'THB',
        lat: 9.5575, lng: 100.0526, isBooked: false, roomType: 'Beachfront Suite',
        notes: 'Beachside resort at Bophut',
      },
    ],
  });

  // Transports
  await prisma.transport.createMany({
    data: [
      {
        tripId: trip.id, type: 'flight', fromLocation: 'Home', toLocation: 'Bangkok (BKK)',
        departureDate: new Date('2026-11-15'), departureTime: '08:00',
        arrivalDate: new Date('2026-11-15'), arrivalTime: '14:30',
        operator: 'Thai Airways', price: 25000, currency: 'THB', isBooked: false, sortOrder: 0,
      },
      {
        tripId: trip.id, type: 'flight', fromLocation: 'Bangkok (DMK)', toLocation: 'Chiang Mai (CNX)',
        departureDate: new Date('2026-11-18'), departureTime: '10:00',
        arrivalDate: new Date('2026-11-18'), arrivalTime: '11:15',
        operator: 'AirAsia', price: 1500, currency: 'THB', isBooked: false, sortOrder: 1,
      },
      {
        tripId: trip.id, type: 'flight', fromLocation: 'Chiang Mai (CNX)', toLocation: 'Phuket (HKT)',
        departureDate: new Date('2026-11-21'), departureTime: '12:00',
        arrivalDate: new Date('2026-11-21'), arrivalTime: '14:30',
        operator: 'Nok Air', price: 2000, currency: 'THB', isBooked: false, sortOrder: 2,
      },
      {
        tripId: trip.id, type: 'ferry', fromLocation: 'Phuket', toLocation: 'Koh Samui',
        departureDate: new Date('2026-11-25'), departureTime: '08:00',
        arrivalDate: new Date('2026-11-25'), arrivalTime: '14:00',
        operator: 'Lomprayah', price: 1800, currency: 'THB', isBooked: false, sortOrder: 3,
      },
      {
        tripId: trip.id, type: 'flight', fromLocation: 'Koh Samui (USM)', toLocation: 'Bangkok (BKK)',
        departureDate: new Date('2026-11-29'), departureTime: '10:00',
        arrivalDate: new Date('2026-11-29'), arrivalTime: '11:15',
        operator: 'Bangkok Airways', price: 3500, currency: 'THB', isBooked: false, sortOrder: 4,
      },
      {
        tripId: trip.id, type: 'flight', fromLocation: 'Bangkok (BKK)', toLocation: 'Home',
        departureDate: new Date('2026-11-29'), departureTime: '15:00',
        arrivalDate: new Date('2026-11-29'), arrivalTime: '22:00',
        operator: 'Thai Airways', price: 25000, currency: 'THB', isBooked: false, sortOrder: 5,
      },
    ],
  });

  // Budget items
  await prisma.budgetItem.createMany({
    data: [
      { tripId: trip.id, category: 'flights', description: 'International flights (round trip)', planned: 50000, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'flights', description: 'Internal flights', planned: 5000, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'accommodation', description: 'Hotels & resorts (14 nights)', planned: 56900, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'food', description: 'Street food & restaurants', planned: 20000, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'transport', description: 'Local transport, ferries, taxis', planned: 8000, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'activities', description: 'Tours, temples, experiences', planned: 15000, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'shopping', description: 'Markets, souvenirs, clothes', planned: 10000, actual: 0, currency: 'THB' },
      { tripId: trip.id, category: 'emergency', description: 'Emergency fund', planned: 10000, actual: 0, currency: 'THB' },
    ],
  });

  // Packing items
  const packingData = [
    // Documents
    { category: 'documents', name: 'Passports', sortOrder: 0 },
    { category: 'documents', name: 'Travel insurance printout', sortOrder: 1 },
    { category: 'documents', name: 'Flight confirmations', sortOrder: 2 },
    { category: 'documents', name: 'Hotel booking confirmations', sortOrder: 3 },
    { category: 'documents', name: 'Vaccination records', sortOrder: 4 },
    { category: 'documents', name: 'Emergency contact card', sortOrder: 5 },
    { category: 'documents', name: 'Copies of all documents', sortOrder: 6 },
    // Clothes
    { category: 'clothes', name: 'Lightweight t-shirts (5-6)', sortOrder: 0 },
    { category: 'clothes', name: 'Shorts (3-4)', sortOrder: 1 },
    { category: 'clothes', name: 'Modest clothing for temples (long pants, covered shoulders)', sortOrder: 2 },
    { category: 'clothes', name: 'Swimsuits (2)', sortOrder: 3 },
    { category: 'clothes', name: 'Light rain jacket', sortOrder: 4 },
    { category: 'clothes', name: 'Comfortable walking shoes', sortOrder: 5 },
    { category: 'clothes', name: 'Flip flops / sandals', sortOrder: 6 },
    { category: 'clothes', name: 'Sleepwear', sortOrder: 7 },
    { category: 'clothes', name: 'Underwear & socks', sortOrder: 8 },
    { category: 'clothes', name: 'Sun hat', sortOrder: 9 },
    // Toiletries
    { category: 'toiletries', name: 'Sunscreen SPF 50+', sortOrder: 0 },
    { category: 'toiletries', name: 'Mosquito repellent (DEET)', sortOrder: 1 },
    { category: 'toiletries', name: 'After-sun / aloe vera gel', sortOrder: 2 },
    { category: 'toiletries', name: 'Toothbrush & toothpaste', sortOrder: 3 },
    { category: 'toiletries', name: 'Deodorant', sortOrder: 4 },
    { category: 'toiletries', name: 'Shampoo & conditioner (travel size)', sortOrder: 5 },
    { category: 'toiletries', name: 'Hand sanitizer', sortOrder: 6 },
    { category: 'toiletries', name: 'Wet wipes', sortOrder: 7 },
    // Electronics
    { category: 'electronics', name: 'Phone + charger', sortOrder: 0 },
    { category: 'electronics', name: 'Power adapter (Type A/B/C for Thailand)', sortOrder: 1 },
    { category: 'electronics', name: 'Portable power bank', sortOrder: 2 },
    { category: 'electronics', name: 'Camera + SD cards', sortOrder: 3 },
    { category: 'electronics', name: 'Universal adapter', sortOrder: 4 },
    { category: 'electronics', name: 'Earbuds / headphones', sortOrder: 5 },
    // Beach
    { category: 'beach', name: 'Snorkel mask', sortOrder: 0 },
    { category: 'beach', name: 'Dry bag (waterproof)', sortOrder: 1 },
    { category: 'beach', name: 'Beach towel (quick-dry)', sortOrder: 2 },
    { category: 'beach', name: 'Reef-safe sunscreen', sortOrder: 3 },
    { category: 'beach', name: 'Water shoes', sortOrder: 4 },
    // Medicine
    { category: 'medicine', name: 'Anti-diarrhea medicine (Imodium)', sortOrder: 0 },
    { category: 'medicine', name: 'Pain relievers (Ibuprofen)', sortOrder: 1 },
    { category: 'medicine', name: 'Antihistamines', sortOrder: 2 },
    { category: 'medicine', name: 'Motion sickness pills', sortOrder: 3 },
    { category: 'medicine', name: 'Band-aids & antiseptic', sortOrder: 4 },
    { category: 'medicine', name: 'Any prescription medications', sortOrder: 5 },
    // Misc
    { category: 'misc', name: 'Day backpack', sortOrder: 0 },
    { category: 'misc', name: 'Reusable water bottle', sortOrder: 1 },
    { category: 'misc', name: 'Packing cubes', sortOrder: 2 },
    { category: 'misc', name: 'Neck pillow for flights', sortOrder: 3 },
    { category: 'misc', name: 'Ziplock bags', sortOrder: 4 },
    { category: 'misc', name: 'Small padlock for hostel lockers', sortOrder: 5 },
  ];

  await prisma.packingItem.createMany({
    data: packingData.map((item) => ({ ...item, tripId: trip.id })),
  });

  // Notes
  await prisma.note.createMany({
    data: [
      {
        tripId: trip.id,
        title: '🇹🇭 Thai Phrases Cheat Sheet',
        category: 'phrase',
        isPinned: true,
        content: `## Greetings
- Hello: สวัสดี (Sawadee) + ครับ/ค่ะ (krap/ka)
- Thank you: ขอบคุณ (Khop khun) + ครับ/ค่ะ
- Yes: ใช่ (Chai)
- No: ไม่ (Mai)
- Sorry/Excuse me: ขอโทษ (Khor thot)

## Food
- Delicious: อร่อย (Aroi)
- Not spicy: ไม่เผ็ด (Mai phet)
- A little spicy: เผ็ดนิดหน่อย (Phet nit noi)
- Check please: เช็คบิล (Check bin)
- Water: น้ำ (Nam)
- No sugar: ไม่ใส่น้ำตาล (Mai sai nam tan)

## Getting Around
- How much?: เท่าไร่ (Tao rai?)
- Too expensive: แพงไป (Paeng pai)
- Where is...?: ...อยู่ที่ไหน (...yoo tee nai?)
- Go to...: ไป... (Pai...)
- Left: ซ้าย (Sai)
- Right: ขวา (Kwa)
- Straight: ตรงไป (Trong pai)

## Emergency
- Help!: ช่วยด้วย (Chuay duay!)
- Hospital: โรงพยาบาล (Rong payabaan)
- Police: ตำรวจ (Tamruat)`,
      },
      {
        tripId: trip.id,
        title: '🚨 Emergency Contacts',
        category: 'emergency',
        isPinned: true,
        content: `## Emergency Numbers
- **Tourist Police**: 1155 (English speaking)
- **Police**: 191
- **Ambulance**: 1669
- **Fire**: 199

## Embassies in Bangkok
- **US Embassy**: +66 2 205 4000
- **UK Embassy**: +66 2 305 8333
- **Australian Embassy**: +66 2 344 6300

## Other
- **Travel Insurance Hotline**: [Add your number]
- **Credit Card Lost**: [Add your bank's number]
- **Hotel contacts**: [Save each hotel's number]`,
      },
      {
        tripId: trip.id,
        title: '🍜 Restaurant Recommendations',
        category: 'restaurant',
        isPinned: false,
        content: `## Bangkok
- **Jay Fai** - Michelin-star street food (crab omelette) — book ahead!
- **Thipsamai** - Best pad thai in Bangkok
- **Or Tor Kor Market** - Fresh tropical fruits

## Chiang Mai
- **Khao Soi Khun Yai** - Famous khao soi noodles
- **SP Chicken** - Best roast chicken

## Phuket
- **Raya Restaurant** - Thai-Chinese cuisine
- **Bang Pae Seafood** - Fresh seafood by the water`,
      },
      {
        tripId: trip.id,
        title: '⚠️ Visa & Entry Requirements',
        category: 'tip',
        isPinned: false,
        content: `## Entry Requirements (Check before travel!)
- Most nationalities: 30-day visa exemption
- Passport must be valid for 6+ months
- Proof of onward travel may be required
- Travel insurance recommended
- No COVID restrictions as of 2024 (verify closer to date)

## Important Notes
- Dress modestly for temples (cover shoulders & knees)
- Remove shoes before entering temples
- Don't touch monks (especially women)
- Don't point feet at Buddha images
- Respect the Thai monarchy — lèse-majesté laws are strict`,
      },
    ],
  });

  console.log('✅ Seed data created successfully!');
  console.log(`   Trip: ${trip.name}`);
  console.log(`   Destinations: Bangkok, Chiang Mai, Phuket, Koh Samui`);
  console.log(`   Days: 14`);
  console.log(`   Activities: ${activities.length}`);
  console.log(`   Packing items: ${packingData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
