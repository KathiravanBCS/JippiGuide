# JippiGuide Tourist Guide Application

This is a Next.js application for managing and exploring tourist destinations, packages, galleries, stories, and trip plans.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (recommended for package management)

## Installation

1. **Clone the repository:**
   ```powershell
   git clone https://github.com/KathiravanBCS/JippiGuide.git
   cd JippiGuide
   ```

2. **Install dependencies:**
   ```powershell
   pnpm install
   ```

## Running the Application

1. **Start the development server:**
   ```powershell
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

2. **Build for production:**
   ```powershell
   pnpm build
   pnpm start
   ```
   The production server will run at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` - Main application pages and API routes
- `components/` - Reusable React components
- `data/` - Static data files
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and server logic
- `public/` - Static assets
- `styles/` - Global and component styles
- `types/` - TypeScript type definitions

## Environment Variables

If you use Supabase or other external services, create a `.env.local` file in the root directory and add your environment variables as needed:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Setup (Optional)

If you want to set up a local database, use the SQL scripts in `scripts/`:

1. Create a database (e.g., PostgreSQL).
2. Run the SQL script:
   ```powershell
   psql -U <username> -d <database> -f scripts/travel_guide.sql
   ```

## Useful Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linter

## Support

For issues or questions, please open an issue in the [GitHub repository](https://github.com/KathiravanBCS/JippiGuide).

---

Enjoy exploring and managing your travel plans with JippiGuide!
