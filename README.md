# Backend Marketplace

Bun + Hono REST API untuk e-commerce marketplace.

## Tech Stack

- **Runtime:** Bun
- **Framework:** Hono
- **ORM:** Drizzle
- **Database:** MySQL
- **Auth:** JWT
- **Validation:** Zod

## Setup

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials

# Generate migrations
bun run db:generate

# Push schema to database
bun run db:push

# Run dev server
bun run dev
```

## API Endpoints

### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (protected)
- `POST /auth/logout` - Logout (protected)

### Products
- `GET /product` - List products
- `GET /product/all/paginated` - List products paginated
- `GET /product/:id` - Get product by ID
- `GET /product/slug/:slug` - Get product by slug
- `POST /product` - Create product (protected)
- `POST /product/:id` - Update product (protected)
- `DELETE /product/:id` - Delete product (protected)

### Categories
- `GET /product-category` - List categories
- `GET /product-category/all/paginated` - List paginated
- `GET /product-category/:id` - Get by ID
- `GET /product-category/slug/:slug` - Get by slug
- `POST /product-category` - Create (protected)
- `POST /product-category/:id` - Update (protected)
- `DELETE /product-category/:id` - Delete (protected)

### Stores
- `GET /store` - List stores
- `GET /store/all/paginated` - List paginated
- `GET /store/:id` - Get by ID
- `GET /store/username/:username` - Get by username
- `POST /store` - Create store (protected)
- `POST /store/:id/verified` - Verify store (protected)
- `DELETE /store/:id` - Delete (protected)
- `GET /my-store` - Get user's store (protected)

### Transactions
- `GET /transaction` - List transactions (protected)
- `GET /transaction/all/paginated` - List paginated (protected)
- `GET /transaction/:id` - Get by ID (protected)
- `POST /transaction` - Create transaction (protected)
- `POST /transaction/:id` - Update transaction (protected)

### Withdrawals
- `GET /withdrawal/all/paginated` - List paginated (protected)
- `GET /withdrawal/:id` - Get by ID (protected)
- `POST /withdrawal` - Create withdrawal (protected)
- `POST /withdrawal/:id/approve` - Approve withdrawal (protected)

### Users
- `GET /user/all/paginated` - List users (protected)

### Dashboard
- `GET /dashboard` - Get dashboard stats (protected)

### RajaOngkir Proxy
- `GET /raja-ongkir/destination` - Search destination
- `POST /raja-ongkir/cost` - Calculate shipping cost

## Environment Variables

```env
DATABASE_URL=mysql://user:password@localhost:3306/marketplace
JWT_SECRET=your-super-secret-jwt-key
RAJA_ONGKIR_API_KEY=your-api-key
MIDTRANS_SERVER_KEY=your-server-key
MIDTRANS_CLIENT_KEY=your-client-key
MIDTRANS_IS_SANDBOX=true
PORT=3000
```

## Deployment

```bash
# Build
bun run build

# Run with PM2
pm2 start dist/index.js --name api
```
