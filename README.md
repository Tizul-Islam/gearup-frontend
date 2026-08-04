# GearUp - Equipment Rental Platform

A modern equipment rental platform built with Next.js 13, React 18, and Express.js backend. The platform allows customers to rent gear, providers to list equipment, and admins to manage the entire system.

## Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Authentication**: JWT with HttpOnly cookies
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Payment**: Stripe Integration
- **Validation**: Zod schemas

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd B7A4
```

2. **Install Backend Dependencies**
```bash
cd GearUp
npm install
```

3. **Setup Environment Variables**
Create `.env` file in `GearUp` directory:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/gearup
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PORT=5001
```

4. **Run Database Migrations**
```bash
cd GearUp
npx prisma migrate dev
npx prisma db seed
```

5. **Start Backend Server**
```bash
cd GearUp
npm run dev
```
Backend will run on `http://localhost:5001`

6. **Install Frontend Dependencies**
```bash
cd gearup-frontend
npm install
```

7. **Setup Frontend Environment**
Create `.env.local` file in `gearup-frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

8. **Start Frontend Server**
```bash
cd gearup-frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## Test Credentials

### Admin Account
- **Email**: `admin@gearup.com`
- **Password**: `admin123`
- **Role**: ADMIN

### Test Users
- **Provider**: `provider@gearup.com` / `provider123`
- **Customer**: `customer@gearup.com` / `customer123`

## Project Structure

### Frontend (`gearup-frontend/`)
```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Public pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── shared/           # Shared components
├── hooks/                # Custom React hooks
│   ├── use-auth.ts      # Authentication hooks
│   ├── use-gear.ts      # Gear data hooks
│   └── use-provider.ts  # Provider hooks
├── services/             # API service layer
│   └── api.ts           # Axios instance with interceptors
└── lib/                  # Utility functions
```

### Backend (`GearUp/`)
```
src/
├── app.ts                # Express app setup
├── config/               # Configuration files
├── modules/              # Feature modules
│   ├── auth/            # Authentication
│   ├── user/            # User management
│   ├── category/        # Category management
│   ├── gear/            # Gear/Equipment
│   ├── rental/          # Rental orders
│   ├── payment/         # Stripe payments
│   ├── review/          # Reviews
│   └── admin/           # Admin operations
├── middlewares/         # Express middlewares
├── lib/                 # Utilities (Prisma, etc.)
└── errors/              # Error handling
```

## Features

### Customer Features
- Browse and search gear
- Filter by category, price, brand
- View gear details and reviews
- Create rental orders
- Make payments via Stripe
- Track rental status
- Leave reviews

### Provider Features
- List gear for rent
- Manage inventory (CRUD)
- View and manage rental orders
- Update order status
- Track earnings

### Admin Features
- User management (suspend/activate)
- Category management
- View all gear listings
- Monitor all rentals
- Platform statistics
- System oversight

## API Documentation

Complete API integration documentation is available in `API_INTEGRATION.md` at the root of the project.

## Key Features Implemented

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Customer, Provider, Admin)
- Protected routes via middleware
- Automatic token refresh

### State Management
- TanStack Query for server state
- Optimistic updates for better UX
- Cache invalidation strategies
- Loading states and error handling

### UI/UX
- Modern, clean design with TailwindCSS
- Fully responsive (mobile-first)
- Loading skeletons
- Toast notifications (Sonner)
- Dark/Light mode support (bonus)

### Error Handling
- Consistent API error responses
- User-friendly error messages
- Error boundaries
- Graceful 404/500 pages

## Payment Integration

Real Stripe payment integration:
- Checkout session creation
- Webhook handling for payment confirmation
- Success/failure route handling
- Rental status updates on payment

## Development

### Conventional Commits
This project follows conventional commit standards:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation
- `refactor:` - Code refactoring

### Database Schema
Prisma schema is located in `GearUp/prisma/schema.prisma`

## Deployment

### Backend
- Port: 5001
- CORS configured for frontend origin
- Environment variables required

### Frontend
- Port: 3000
- Proxy configuration for API calls
- Can be deployed on Vercel

## Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Role-based UI rendering
- [ ] Gear browsing and filtering
- [ ] Gear CRUD operations (Provider)
- [ ] Rental order creation (Customer)
- [ ] Payment flow (Stripe)
- [ ] Order status updates (Provider)
- [ ] Admin user management
- [ ] Admin category management
- [ ] Error handling and validation

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Run migrations: `npx prisma migrate dev`

2. **CORS Errors**
   - Check backend CORS configuration
   - Ensure frontend URL is in allowed origins

3. **Authentication Issues**
   - Clear browser cookies
   - Check JWT_SECRET in .env
   - Verify token refresh logic

## License

This project is for educational purposes.

## Contact

For questions or issues, please contact the development team.

---

**Note**: This is a full-stack rental platform project demonstrating modern web development practices with Next.js 13, React 18, and Express.js.
