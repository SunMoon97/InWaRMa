# InWaRMa Setup Guide

## Quick Start

This guide will help you set up the InWaRMa warehouse management system.

### Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **npm** or **yarn**

### Step 1: Database Setup

1. **Install PostgreSQL** if you haven't already:
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create a database:**
   ```sql
   CREATE DATABASE inwarma_db;
   ```

### Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory with:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/inwarma_db"
   PORT=5000
   NODE_ENV=development
   ```
   
   Replace `username:password` with your PostgreSQL credentials.

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:3000`

### Step 4: Verify Setup

1. **Backend Health Check:**
   Visit `http://localhost:5000/api/health` - should return `{"status":"OK","message":"InWaRMa API is running"}`

2. **Frontend Dashboard:**
   Visit `http://localhost:3000` - should show the InWaRMa dashboard

### Troubleshooting

#### Database Connection Issues
- Verify PostgreSQL is running
- Check your DATABASE_URL in the `.env` file
- Ensure the database exists: `CREATE DATABASE inwarma_db;`

#### Port Conflicts
- If port 3000 is in use, Vite will automatically try port 3001
- If port 5000 is in use, change the PORT in your `.env` file

#### Frontend Can't Connect to Backend
- Ensure the backend is running on port 5000
- Check that CORS is enabled (it should be by default)
- Verify the API_BASE_URL in `frontend/src/services/api.ts`

### Development Commands

#### Backend
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
```

#### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database Management

**Prisma Studio** (Database GUI):
```bash
cd backend
npm run db:studio
```
This opens a web interface at `http://localhost:5555` to manage your database.

### Sample Data

To add sample data for testing:

1. **Open Prisma Studio:**
   ```bash
   cd backend
   npm run db:studio
   ```

2. **Add sample products and inventory items through the web interface**

3. **Or use the API endpoints:**
   ```bash
   # Add a product
   curl -X POST http://localhost:5000/api/products \
     -H "Content-Type: application/json" \
     -d '{"name":"Sample Product","sku":"SAMPLE001","category":"FMCG","description":"A sample product","unit":"pieces"}'
   ```

### Production Deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the backend:**
   ```bash
   cd backend
   npm run build
   ```

3. **Set up environment variables for production**

4. **Deploy to your preferred hosting platform**

### Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure database connection is working
4. Check that both servers are running on the correct ports

For additional help, please refer to the main README.md file. 