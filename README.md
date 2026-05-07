# TrainifyAI Admin Dashboard

Admin management panel for TrainifyAI. Built with Next.js, React Query, and Recharts.

## Features

- **User Management** - List, filter, and manage users
  - Ban/suspend users
  - Reset free tier usage
  - Override subscriptions manually
  - View user details and activity

- **Monitoring** - Real-time platform insights
  - Dashboard metrics (users, active subscriptions, MRR)
  - Revenue analytics with charts
  - System health monitoring
  - API and database status

- **Audit Logging** - Track all admin actions
  - Immutable audit trail
  - Filter by action type
  - View admin action details

- **Authentication** - Secure admin access
  - Magic link authentication via Supabase
  - Role-based access (superadmin, admin)
  - Session management

## Setup

### Prerequisites

- Node.js 18+ 
- Supabase account with database migrations applied
- Main app deployed and running
- Admin users configured in database

### Installation

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Update .env.local with your Supabase credentials and main app API URL
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
NEXT_PUBLIC_MAIN_APP_API=        # Main app API base URL (e.g., https://trainifyai.com/api)
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3001
```

### Production Deployment

#### Deploy to Vercel

```bash
# Push code to GitHub
git push

# In Vercel dashboard:
# 1. Create new project from repository
# 2. Set environment variables (Production)
# 3. Configure custom domain: admin.trainifyai.com
# 4. Deploy
```

#### Configure Custom Domain

1. In Vercel project settings: Domains → Add custom domain
2. Add `admin.trainifyai.com`
3. Follow DNS configuration steps for your domain registrar
4. Update Supabase auth redirect URLs:
   - `https://admin.trainifyai.com/auth/callback`

## Usage

### First Admin Setup

After deployment, manually add first superadmin to database:

```sql
-- In Supabase SQL editor
INSERT INTO admin_users (user_id, role)
VALUES ('YOUR_USER_ID', 'superadmin');
```

To get your user ID:
1. Go to Supabase Authentication → Users
2. Find your user email
3. Copy the user ID (UUID)

### Adding Team Members

1. Login to admin dashboard as superadmin
2. Go to Users → select user
3. Look for "Invite as Admin" action (future feature)
4. For now, manually add via SQL:

```sql
INSERT INTO admin_users (user_id, role, invited_by)
VALUES ('TEAM_MEMBER_USER_ID', 'admin', 'YOUR_USER_ID');
```

### Admin Roles

- **Superadmin** - Full control
  - Ban/suspend users
  - Override subscriptions
  - Invite other admins
  - View audit logs
  
- **Admin** - Monitoring & support
  - View users and details
  - Reset usage counters
  - View monitoring dashboard
  - View audit logs (read-only)

## API Integration

Admin dashboard calls main app's `/api/admin/*` endpoints:

- `GET /api/admin/users` - List users
- `GET /api/admin/users/[id]` - User details
- `POST /api/admin/users/[id]/ban` - Ban user
- `POST /api/admin/users/[id]/suspend` - Suspend user
- `POST /api/admin/users/[id]/reset-usage` - Reset usage
- `POST /api/admin/users/[id]/subscription-override` - Change tier
- `GET /api/admin/analytics/dashboard` - Metrics
- `GET /api/admin/analytics/revenue` - Revenue stats
- `GET /api/admin/system/health` - System health
- `GET /api/admin/audit-log` - Audit trail

All requests require valid JWT token with admin role.

## Development Notes

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Data Fetching**: TanStack React Query
- **Charts**: Recharts

### File Structure

```
admin/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard
│   ├── users/
│   │   ├── page.tsx            # Users list
│   │   └── [id]/page.tsx       # User detail
│   ├── monitoring/
│   │   └── page.tsx            # Analytics & health
│   ├── audit-log/
│   │   └── page.tsx            # Audit trail
│   └── auth/
│       ├── login/page.tsx      # Login page
│       └── callback/page.tsx   # Auth callback
├── components/
│   ├── AdminLayout.tsx         # Sidebar + nav
│   └── Navbar.tsx              # Top nav with user info
├── lib/
│   ├── auth.ts                 # Supabase auth helpers
│   └── api.ts                  # Admin API client
├── types/
│   └── index.ts                # TypeScript types
└── [config files]
```

## Troubleshooting

### Can't login
- Check Supabase credentials in .env.local
- Verify auth redirect URL in Supabase: `http://localhost:3001/auth/callback` (dev)
- Ensure user exists in Supabase Auth

### API calls failing
- Verify `NEXT_PUBLIC_MAIN_APP_API` points to correct app
- Check admin user has role in `admin_users` table
- Check JWT token is valid (short-lived, needs refresh)

### Missing admin endpoints
- Run database migration: `002_admin_system.sql`
- Verify main app has `/api/admin/*` routes deployed
- Check main app has admin middleware installed

## Performance Tips

- Dashboard metrics refresh every 30 seconds (adjust in code)
- Revenue metrics refresh every 60 seconds
- Use React Query's caching and background refetching
- Audit log pagination defaults to 50 items/page

## Security

- ✅ All requests require valid JWT token
- ✅ Server-side role verification on main app
- ✅ RLS policies enforce database access control
- ✅ Audit logging tracks all admin actions
- ✅ Immutable audit trail (no deletions allowed)
- ✅ Rate limiting on main app endpoints

## License

Proprietary
