# LearnHub — MERN Online Course Purchasing Platform

A full-stack course marketplace (MongoDB, Express, React, Node) with JWT auth,
Bootstrap 5 UI, an Amazon-style checkout flow, and race-condition-safe seat
management for concurrent purchases.

## 1. Project Structure

```
mern-course-platform/
├── backend/
│   ├── config/db.js                 # MongoDB connection
│   ├── models/                      # User, Course, Order schemas
│   ├── middleware/                  # authMiddleware, errorMiddleware
│   ├── controllers/                 # authController, courseController, orderController
│   ├── routes/                      # authRoutes, courseRoutes, orderRoutes
│   ├── utils/generateToken.js
│   ├── seeder.js                    # sample course data
│   ├── server.js                    # app entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/axios.js             # axios instance + JWT interceptor
        ├── context/AuthContext.js   # global auth state
        ├── components/              # Navbar, CourseCard, Spinner, Footer, PrivateRoute
        ├── pages/                   # Login, Register, Dashboard, CourseDetails,
        │                            # Checkout, OrderSuccess, PurchaseHistory
        ├── App.js
        ├── App.css
        └── index.js
```

## 2. Prerequisites

- Node.js v18+
- MongoDB running locally, OR a free MongoDB Atlas cluster
  (Atlas is recommended — it's a replica set, which enables real
  multi-document transactions for the seat-booking logic below)

## 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and JWT_SECRET
npm run seed        # populates the database with sample courses
npm run dev          # starts the API on http://localhost:5000
```

## 4. Frontend Setup

```bash
cd frontend
npm install
npm start            # starts the React app on http://localhost:3000
```

The frontend is pre-configured (via package.json "proxy") to forward
`/api/*` requests to `http://localhost:5000` in development.

## 5. Create a test account

Open http://localhost:3000/register and sign up, or use the API directly:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 6. API Reference

| Method | Endpoint                  | Access  | Description                        |
|--------|----------------------------|---------|-------------------------------------|
| POST   | /api/auth/register         | Public  | Register a new user                |
| POST   | /api/auth/login            | Public  | Login, returns JWT                 |
| GET    | /api/auth/profile          | Private | Get logged-in user profile         |
| POST   | /api/auth/logout           | Private | Logout                             |
| GET    | /api/courses               | Public  | List courses (search/filter/paginate) |
| GET    | /api/courses/:id           | Public  | Get single course                  |
| POST   | /api/courses               | Admin   | Create course                      |
| PUT    | /api/courses/:id           | Admin   | Update course                      |
| DELETE | /api/courses/:id           | Admin   | Delete course                      |
| POST   | /api/orders                | Private | Purchase a course                  |
| GET    | /api/orders/my-orders      | Private | Get logged-in user's purchases     |
| GET    | /api/orders/:id            | Private | Get single order (confirmation)    |

All `Private`/`Admin` routes require an `Authorization: Bearer <token>` header.

## 7. Concurrency & Scalability Notes

- **No overselling:** seat decrements use an atomic
  `findOneAndUpdate({ _id, vacantSeats: { $gt: 0 } }, { $inc: { vacantSeats: -1 } })`.
  Two simultaneous "Buy Now" clicks can never push seats below zero, because
  MongoDB evaluates the filter and update as a single atomic operation per
  document.
- **Transactions:** when connected to a MongoDB replica set/Atlas cluster,
  the purchase flow wraps the seat decrement, order creation, and user
  update in a session transaction, so a failure midway rolls everything
  back cleanly. On a standalone MongoDB instance (no transaction support),
  the code automatically falls back to the atomic `$inc` guard alone, which
  by itself is still sufficient to prevent overselling.
- **Rate limiting:** `express-rate-limit` protects the API from abuse and
  brute-force login attempts under high traffic.
- **Stateless auth:** JWT-based auth means any number of API instances can
  be run behind a load balancer without shared session storage.
- **Indexes:** Course collection has indexes on `category` and a text index
  on `title/description/category` for fast search.

## 8. Payments

The checkout page supports Credit Card, Debit Card, UPI, Net Banking,
Wallet, Cash on Delivery, and PayPal as selectable methods. The backend
records the chosen method and marks the order `success` after validating
the request (this is a demo payment simulation). To go live, swap the
simulated confirmation in `orderController.js` -> `purchaseCourse` for a
real Stripe/PayPal server-side charge confirmation before creating the
order.

## 9. Environment Variables (backend/.env)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/course_platform
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

## 10. Production Build

```bash
cd frontend
npm run build     # outputs static build to frontend/build
```

Serve the build via any static host (Netlify, Vercel, Nginx, or Express's
`express.static`), and deploy the backend to a Node host (Render, Railway,
EC2, etc.) with `NODE_ENV=production` and a real MongoDB Atlas URI.