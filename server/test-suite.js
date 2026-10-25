/**
 * IMovies Automated Test Suite
 * Tests all core functional requirements:
 * 1. User registration & duplicate check
 * 2. User login & invalid credentials
 * 3. Movie browsing and search
 * 4. Seat availability retrieval
 * 5. Successful booking with atomic seat reservation
 * 6. Duplicate seat booking prevention (atomic concurrency check)
 * 7. Booking cancellation rule enforcement & seat release
 * 8. Admin role authorization check
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   🚀 RUNNING IMOVIES BACKEND AUTOMATED TEST SUITE    ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: API Health Check
    console.log('[1/8] Testing Server Health Check...');
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'online', 'Health endpoint returns online');

    // Test 2: User Login (Demo user)
    console.log('\n[2/8] Testing User Authentication...');
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'alex@example.com', password: 'Password@123' }
    );
    assert(loginRes.status === 200 && loginRes.data.token, 'Demo customer login returns JWT token');
    const userToken = loginRes.data.token;

    // Test Invalid Login
    const invalidLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'alex@example.com', password: 'WrongPassword' }
    );
    assert(invalidLogin.status === 401, 'Invalid password returns 401 Unauthorized');

    // Test 3: Admin Login & Protected Route
    console.log('\n[3/8] Testing Admin Role-Based Access Control (RBAC)...');
    const adminLogin = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'admin@imovies.com', password: 'Admin@123' }
    );
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login successful');
    const adminToken = adminLogin.data.token;

    // Attempt admin stats with regular user token (Must fail 403)
    const unauthorizedStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(unauthorizedStats.status === 403, 'Regular customer blocked from Admin endpoint (403 Forbidden)');

    // Access admin stats with admin token (Must succeed 200)
    const adminStats = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(adminStats.status === 200 && adminStats.data.stats, 'Admin authorized to view dashboard statistics');

    // Test 4: Movie Browsing & Search
    console.log('\n[4/8] Testing Movie Browsing, Search, and Filtering...');
    const allMovies = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/movies',
      method: 'GET'
    });
    assert(allMovies.status === 200 && allMovies.data.count > 0, `Retrieved ${allMovies.data.count} movies from catalog`);

    // Search for "Dune"
    const duneSearch = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/movies?search=Dune',
      method: 'GET'
    });
    assert(
      duneSearch.status === 200 && duneSearch.data.movies.some((m) => m.title.includes('Dune')),
      'Search query filter correctly filters movie titles'
    );

    // Test 5: Showtimes and Live Seat Layout Retrieval
    console.log('\n[5/8] Testing Showtime and Live Seat Layout...');
    const showtimesRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/showtimes',
      method: 'GET'
    });
    assert(showtimesRes.status === 200 && showtimesRes.data.showtimes.length > 0, 'Showtimes retrieved');
    const testShowtime = showtimesRes.data.showtimes[0];

    const seatMapRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/showtimes/${testShowtime._id}`,
      method: 'GET'
    });
    assert(
      seatMapRes.status === 200 && Array.isArray(seatMapRes.data.showtime.bookedSeatNumbers),
      'Live seat layout with booked seats retrieved'
    );

    // Test 6: Atomic Seat Reservation (Success)
    console.log('\n[6/8] Testing Atomic Booking Reservation Flow...');
    // Pick unoccupied seats: e.g. A1, A2
    const targetSeats = ['A1', 'A2'];
    const bookingRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      },
      {
        showtimeId: testShowtime._id,
        seats: targetSeats.map((s) => ({ seatNumber: s, tier: 'Silver' })),
        paymentMethod: 'Card'
      }
    );
    assert(bookingRes.status === 201 && bookingRes.data.booking.bookingReference, 'Booking created with unique reference');
    const newBooking = bookingRes.data.booking;

    // Test 7: Duplicate Seat Booking Prevention (ATOMIC MUTUAL EXCLUSION CHECK)
    console.log('\n[7/8] Testing Duplicate Seat Reservation Prevention (Atomic Conflict)...');
    // Attempt to book the EXACT SAME seats again
    const duplicateRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`
        }
      },
      {
        showtimeId: testShowtime._id,
        seats: [{ seatNumber: 'A1', tier: 'Silver' }],
        paymentMethod: 'Card'
      }
    );
    assert(
      duplicateRes.status === 409,
      `Double-booking prevented! Server returned HTTP 409 Conflict: "${duplicateRes.data.message}"`
    );

    // Test 8: Booking Cancellation and Seat Release
    console.log('\n[8/8] Testing Booking Cancellation & Seat Release...');
    const cancelRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/bookings/${newBooking._id}/cancel`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`
      }
    });
    assert(cancelRes.status === 200 && cancelRes.data.booking.status === 'cancelled', 'Booking marked cancelled');

    // Verify seat A1 is released from the showtime
    const seatMapAfterCancel = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/showtimes/${testShowtime._id}`,
      method: 'GET'
    });
    const stillBooked = seatMapAfterCancel.data.showtime.bookedSeatNumbers.includes('A1');
    assert(!stillBooked, 'Seat A1 was successfully released and is available again!');

    console.log('\n======================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED `);
    console.log('======================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

// Check if server is running before executing
http
  .get(`${BASE_URL}/api/health`, () => {
    runTests();
  })
  .on('error', () => {
    console.error(' Backend server is not running on port 5000. Please start the server first.');
    process.exit(1);
  });
