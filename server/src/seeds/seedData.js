const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Movie.deleteMany();
    await Cinema.deleteMany();
    await Showtime.deleteMany();
    await Booking.deleteMany();
    console.log(' Cleared old collections.');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'IMovies Admin',
        email: 'admin@imovies.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+1 555-0199'
      },
      {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'Password@123',
        role: 'user',
        phone: '+1 555-0144'
      },
      {
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'Password@123',
        role: 'user',
        phone: '+1 555-0188'
      }
    ]);
    console.log(` Created ${users.length} users.`);

    // 2. Create Cinemas
    const cinemas = await Cinema.create([
      {
        name: 'IMAX Grand Cineplex',
        location: 'Downtown Center',
        city: 'Metropolis',
        address: '742 Evergreen Terrace, Suite 100',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Seats', 'Valet Parking', 'Gourmet Dining'],
        contactPhone: '+1 (800) 555-4629',
        screens: [
          {
            screenNumber: 1,
            name: 'IMAX Screen 1',
            soundSystem: 'Dolby Atmos 12.1',
            screenType: 'IMAX',
            totalSeats: 60,
            seatLayout: {
              rows: 6,
              cols: 10,
              tiers: [
                { name: 'Silver', rowLabels: ['A', 'B'], basePrice: 220 },
                { name: 'Gold', rowLabels: ['C', 'D'], basePrice: 320 },
                { name: 'VIP', rowLabels: ['E', 'F'], basePrice: 480 }
              ]
            }
          },
          {
            screenNumber: 2,
            name: 'Dolby Screen 2',
            soundSystem: 'Dolby Atmos 7.1',
            screenType: 'Standard',
            totalSeats: 60,
            seatLayout: {
              rows: 6,
              cols: 10,
              tiers: [
                { name: 'Silver', rowLabels: ['A', 'B'], basePrice: 180 },
                { name: 'Gold', rowLabels: ['C', 'D'], basePrice: 260 },
                { name: 'VIP', rowLabels: ['E', 'F'], basePrice: 380 }
              ]
            }
          }
        ]
      },
      {
        name: 'Cinépolis Royal Gold Class',
        location: 'Westfield Galleria Mall',
        city: 'Metropolis',
        address: '102 Ocean Boulevard, Level 4',
        facilities: ['VIP Recliners', 'Dolby Cinema', 'In-Seat Butler Service', 'Free Parking', 'Cocktail Lounge'],
        contactPhone: '+1 (800) 555-2463',
        screens: [
          {
            screenNumber: 1,
            name: 'Gold Class Hall 1',
            soundSystem: 'Dolby Atmos Premium',
            screenType: 'Gold Class',
            totalSeats: 60,
            seatLayout: {
              rows: 6,
              cols: 10,
              tiers: [
                { name: 'Silver', rowLabels: ['A', 'B'], basePrice: 250 },
                { name: 'Gold', rowLabels: ['C', 'D'], basePrice: 380 },
                { name: 'VIP', rowLabels: ['E', 'F'], basePrice: 550 }
              ]
            }
          }
        ]
      },
      {
        name: 'PVR 4DX & Superplex',
        location: 'Phoenix Tech Park',
        city: 'Silicon Bay',
        address: '500 Innovation Way, Building C',
        facilities: ['4DX Motion Seats', 'Dolby Atmos', 'Café & Bakery', 'Wheelchair Accessible'],
        contactPhone: '+1 (800) 555-7890',
        screens: [
          {
            screenNumber: 1,
            name: '4DX Motion Screen',
            soundSystem: 'Auro 11.1 3D',
            screenType: '4DX',
            totalSeats: 60,
            seatLayout: {
              rows: 6,
              cols: 10,
              tiers: [
                { name: 'Silver', rowLabels: ['A', 'B'], basePrice: 240 },
                { name: 'Gold', rowLabels: ['C', 'D'], basePrice: 350 },
                { name: 'VIP', rowLabels: ['E', 'F'], basePrice: 490 }
              ]
            }
          }
        ]
      }
    ]);
    console.log(` Created ${cinemas.length} cinemas.`);

    // 3. Create Movies
    const movies = await Movie.create([
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        duration: 166,
        language: 'English',
        releaseDate: new Date('2024-03-01'),
        rating: 8.8,
        votesCount: 3240,
        certificate: 'PG-13',
        director: 'Denis Villeneuve',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Zendaya', role: 'Chani', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: true,
        isUpcoming: false,
        status: 'Now Showing'
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring moral dilemmas and scientific breakthroughs.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genre: ['Biography', 'Drama', 'History'],
        duration: 180,
        language: 'English',
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        votesCount: 4120,
        certificate: 'R',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: true,
        isUpcoming: false,
        status: 'Now Showing'
      },
      {
        title: 'Interstellar',
        description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        duration: 169,
        language: 'English',
        releaseDate: new Date('2014-11-07'),
        rating: 8.7,
        votesCount: 5200,
        certificate: 'PG-13',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80' },
          { name: 'Anne Hathaway', role: 'Brand', photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: true,
        isUpcoming: false,
        status: 'Now Showing'
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
        posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        genre: ['Animation', 'Action', 'Adventure'],
        duration: 140,
        language: 'English',
        releaseDate: new Date('2023-06-02'),
        rating: 8.7,
        votesCount: 2980,
        certificate: 'PG',
        director: 'Joaquim Dos Santos, Kemp Powers',
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales (voice)', photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: false,
        isUpcoming: false,
        status: 'Now Showing'
      },
      {
        title: 'The Dark Knight',
        description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
        genre: ['Action', 'Crime', 'Drama'],
        duration: 152,
        language: 'English',
        releaseDate: new Date('2008-07-18'),
        rating: 9.0,
        votesCount: 7800,
        certificate: 'PG-13',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Christian Bale', role: 'Bruce Wayne / Batman', photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80' },
          { name: 'Heath Ledger', role: 'Joker', photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: false,
        isUpcoming: false,
        status: 'Now Showing'
      },
      {
        title: 'Avatar: The Way of Water',
        description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        genre: ['Action', 'Adventure', 'Fantasy'],
        duration: 192,
        language: 'English',
        releaseDate: new Date('2022-12-16'),
        rating: 7.6,
        votesCount: 2400,
        certificate: 'PG-13',
        director: 'James Cameron',
        cast: [
          { name: 'Sam Worthington', role: 'Jake Sully', photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
          { name: 'Zoe Saldana', role: 'Neytiri', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: false,
        isUpcoming: false,
        status: 'Now Showing'
      },
      {
        title: 'Gladiator II',
        description: 'After his home is conquered by the tyrannical emperors who now lead Rome, Lucius must enter the Colosseum and look to his past to find strength and honor to return the glory of Rome to its people.',
        posterUrl: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        genre: ['Action', 'Adventure', 'Drama'],
        duration: 148,
        language: 'English',
        releaseDate: new Date('2024-11-22'),
        rating: 8.4,
        votesCount: 1540,
        certificate: 'R',
        director: 'Ridley Scott',
        cast: [
          { name: 'Paul Mescal', role: 'Lucius Verus', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
          { name: 'Pedro Pascal', role: 'Marcus Acacius', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: false,
        isUpcoming: true,
        status: 'Upcoming'
      },
      {
        title: 'Avengers: Secret Wars',
        description: 'Earth’s mightiest heroes and allies across multiple realities join forces to face the ultimate collapse of the multiverse in the climactic showdown of the Marvel Cinematic Universe.',
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
        trailerUrl: '',
        genre: ['Action', 'Sci-Fi', 'Fantasy'],
        duration: 180,
        language: 'English',
        releaseDate: new Date('2027-05-07'),
        rating: 9.2,
        votesCount: 890,
        certificate: 'PG-13',
        director: 'Anthony and Joe Russo',
        cast: [
          { name: 'Robert Downey Jr.', role: 'Doctor Doom', photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' }
        ],
        isFeatured: false,
        isUpcoming: true,
        status: 'Upcoming'
      }
    ]);
    console.log(` Created ${movies.length} movies.`);

    // 4. Create Showtimes for Today and Next 3 Days
    const showtimesToInsert = [];
    const today = new Date();

    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const dates = [0, 1, 2, 3].map((offset) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      return formatDate(d);
    });

    const nowShowingMovies = movies.filter((m) => m.status === 'Now Showing');
    const timeSlots = ['10:30 AM', '02:00 PM', '06:15 PM', '09:45 PM'];

    for (const movie of nowShowingMovies) {
      for (const cinema of cinemas) {
        for (const dateStr of dates) {
          // Add 2 to 3 showtimes per day per cinema for this movie
          const selectedSlots = timeSlots.slice(0, 3);
          selectedSlots.forEach((slot, index) => {
            const screen = cinema.screens[index % cinema.screens.length];

            // Add some initial booked seats on today's shows for demo realism
            const bookedSeats = [];
            if (dateStr === dates[0]) {
              bookedSeats.push(
                { seatNumber: 'C4', userId: users[1]._id, bookedAt: new Date() },
                { seatNumber: 'C5', userId: users[1]._id, bookedAt: new Date() },
                { seatNumber: 'E7', userId: users[2]._id, bookedAt: new Date() }
              );
            }

            showtimesToInsert.push({
              movie: movie._id,
              cinema: cinema._id,
              screenNumber: screen.screenNumber,
              showDate: dateStr,
              startTime: slot,
              format: screen.screenType === 'IMAX' ? 'IMAX 2D' : screen.screenType === '4DX' ? '4DX' : '2D',
              language: movie.language,
              tierPricing: {
                silver: screen.seatLayout.tiers[0]?.basePrice || 180,
                gold: screen.seatLayout.tiers[1]?.basePrice || 280,
                vip: screen.seatLayout.tiers[2]?.basePrice || 420
              },
              bookedSeats,
              totalSeats: screen.totalSeats,
              status: 'active'
            });
          });
        }
      }
    }

    const createdShowtimes = await Showtime.insertMany(showtimesToInsert);
    console.log(` Created ${createdShowtimes.length} showtimes.`);

    // 5. Create Initial Sample Bookings for User
    const sampleShowtime = createdShowtimes[0];
    const initialBooking = await Booking.create({
      bookingReference: 'IMV-DEMO-7X9Q',
      user: users[1]._id, // Alex Johnson
      showtime: sampleShowtime._id,
      movie: sampleShowtime.movie,
      cinema: sampleShowtime.cinema,
      seats: [
        { seatNumber: 'C4', tier: 'Gold', price: 280 },
        { seatNumber: 'C5', tier: 'Gold', price: 280 }
      ],
      seatNumbers: ['C4', 'C5'],
      screenNumber: sampleShowtime.screenNumber,
      showDate: sampleShowtime.showDate,
      showTime: sampleShowtime.startTime,
      subtotal: 560,
      convenienceFee: 40,
      taxes: 28,
      totalAmount: 628,
      paymentDetails: {
        method: 'Card',
        transactionId: 'TXN-9A8B7C6D',
        paymentStatus: 'Completed'
      },
      status: 'confirmed'
    });

    console.log(` Created sample booking: ${initialBooking.bookingReference}`);

    console.log('\n Database seeding finished successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account: admin@imovies.com  | Password: Admin@123');
    console.log('User Account:  alex@example.com   | Password: Password@123');
    console.log('User Account:  sarah@example.com  | Password: Password@123');
    console.log('----------------------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
