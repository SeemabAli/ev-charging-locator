import mongoose from 'mongoose';
import { ENV } from '../config/env';
import { User } from '../models/User';
import { Station } from '../models/Station';
import { ChargingPoint } from '../models/ChargingPoint';
import { Slot } from '../models/Slot';
import { Booking } from '../models/Booking';

export const seedDatabase = async () => {
  try {
    if (!ENV.MONGO_URI) {
      console.error('MONGO_URI is not set. Cannot run seed script.');
      process.exit(1);
    }

    console.log('Connecting to database for seeding...');
    await mongoose.connect(ENV.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Cleaning existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Station.deleteMany({}),
      ChargingPoint.deleteMany({}),
      Slot.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    // 1. Create Users
    console.log('Creating demo users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@evcharge.com',
      password: 'AdminPassword123!',
      role: 'admin',
      phone: '+1-555-0101',
    });

    const operator = await User.create({
      name: 'ChargeNet Operator Inc.',
      email: 'operator@chargenet.com',
      password: 'OperatorPassword123!',
      role: 'operator',
      phone: '+1-555-0102',
    });

    const driver = await User.create({
      name: 'Alex Johnson (EV Driver)',
      email: 'driver@evcharge.com',
      password: 'DriverPassword123!',
      role: 'user',
      phone: '+1-555-0103',
    });

    console.log(`Created Users: Admin (${admin.email}), Operator (${operator.email}), Driver (${driver.email})`);

    // 2. Create Stations
    console.log('Creating demo charging stations...');
    const station1 = await Station.create({
      name: 'Downtown SuperCharge Hub',
      operator: operator._id,
      description: 'High-speed 150kW DC Fast Charging hub located directly in the downtown retail plaza with café and rest facilities.',
      address: '100 Main Street, Suite 10',
      city: 'Metro City',
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128], // [lng, lat]
      },
      operatingHours: { open: '00:00', close: '23:59' },
      amenities: ['24/7 Restrooms', 'Coffee Shop', 'High-speed WiFi', 'Convenience Store'],
      status: 'approved',
      images: [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      ],
    });

    const station2 = await Station.create({
      name: 'Westside GreenEnergy Park',
      operator: operator._id,
      description: 'Solar-assisted level 2 and DC rapid chargers situated in the Westside business park.',
      address: '450 West Olympic Boulevard',
      city: 'Metro City',
      location: {
        type: 'Point',
        coordinates: [-74.015, 40.72],
      },
      operatingHours: { open: '06:00', close: '22:00' },
      amenities: ['Covered Canopy', 'EV Lounge', 'Tire Pressure Station'],
      status: 'approved',
      images: [
        'https://images.unsplash.com/photo-1558441719-72f5d91811a7?auto=format&fit=crop&w=800&q=80',
      ],
    });

    const station3 = await Station.create({
      name: 'North Highway Rapid Oasis',
      operator: operator._id,
      description: 'Convenient en-route highway charging station with ultra-fast 350kW CCS chargers for long-distance commuters.',
      address: 'Mile 42 North Interstate Way',
      city: 'North Valley',
      location: {
        type: 'Point',
        coordinates: [-73.98, 40.75],
      },
      operatingHours: { open: '00:00', close: '23:59' },
      amenities: ['Diner', 'Restrooms', 'Pet Relief Area'],
      status: 'pending', // Pending admin approval test
      images: [],
    });

    // 3. Create Charging Points
    console.log('Adding charging points...');
    const cp1 = await ChargingPoint.create({
      station: station1._id,
      identifier: 'Bay 01 - Ultra DC',
      connectorType: 'CCS 2 (DC Fast)',
      powerKw: 150,
      pricingPerKwh: 0.42,
      status: 'available',
    });

    const cp2 = await ChargingPoint.create({
      station: station1._id,
      identifier: 'Bay 02 - Rapid DC',
      connectorType: 'CHAdeMO (DC)',
      powerKw: 50,
      pricingPerKwh: 0.35,
      status: 'available',
    });

    const cp3 = await ChargingPoint.create({
      station: station1._id,
      identifier: 'Bay 03 - AC Destination',
      connectorType: 'Type 2 (AC)',
      powerKw: 22,
      pricingPerKwh: 0.25,
      status: 'available',
    });

    const cp4 = await ChargingPoint.create({
      station: station2._id,
      identifier: 'Port A - Fast Dual',
      connectorType: 'CCS 2 (DC Fast)',
      powerKw: 100,
      pricingPerKwh: 0.38,
      status: 'available',
    });

    // 4. Create Slots for Today and Tomorrow
    console.log('Generating booking slots...');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const slotTimes = [
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
    ];

    let sampleBookedSlot: any = null;

    for (const d of [today, tomorrow]) {
      for (let i = 0; i < slotTimes.length; i++) {
        const time = slotTimes[i];
        // Make the 10:00 slot on cp1 booked as a demo
        const isBooked = d === today && i === 2;

        const slot = await Slot.create({
          chargingPoint: cp1._id,
          station: station1._id,
          date: d,
          startTime: time.start,
          endTime: time.end,
          isBooked,
        });

        if (isBooked) {
          sampleBookedSlot = slot;
        }

        // Also add slots for cp2
        await Slot.create({
          chargingPoint: cp2._id,
          station: station1._id,
          date: d,
          startTime: time.start,
          endTime: time.end,
          isBooked: false,
        });
      }
    }

    // 5. Create a sample reservation for the driver
    if (sampleBookedSlot) {
      console.log('Creating demo booking reservation...');
      await Booking.create({
        user: driver._id,
        station: station1._id,
        chargingPoint: cp1._id,
        slot: sampleBookedSlot._id,
        date: sampleBookedSlot.date,
        startTime: sampleBookedSlot.startTime,
        endTime: sampleBookedSlot.endTime,
        totalAmount: 18.5,
        status: 'confirmed',
      });
    }

    console.log('==================================================');
    console.log('🌱 Database seeded successfully!');
    console.log('   Admin:    admin@evcharge.com     / AdminPassword123!');
    console.log('   Operator: operator@chargenet.com / OperatorPassword123!');
    console.log('   Driver:   driver@evcharge.com    / DriverPassword123!');
    console.log('==================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
