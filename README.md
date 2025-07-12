# InWaRMa - Intelligent Warehouse Resource Management

A comprehensive warehouse management platform designed to identify and act on near-expiry inventory through intelligent alerts, promotions, and pickup coordination.

![InWaRMa Dashboard](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Express](https://img.shields.io/badge/Express-5.1.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue)

## 🚀 Features

- **📊 Real-time Dashboard** - Live overview of warehouse operations
- **📦 Inventory Management** - Track products, quantities, and expiry dates
- **🔔 Smart Alerts** - Automated notifications for expiring items
- **🎯 Promotions** - Create and manage discount campaigns for near-expiry items
- **📈 Analytics & Reporting** - Data-driven insights with charts
- **🚚 Pickup Coordination** - Streamlined customer pickup management
- **⚡ Responsive Design** - Works on all devices and screen sizes

## 🏗️ Project Structure

```
InWaRMa/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── backend/           # Express + TypeScript + Prisma
│   ├── src/
│   ├── prisma/
│   └── package.json
└── README.md
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/SunMoon97/InWaRMa.git
cd InWaRMa
```

### 2. Database Setup

1. **Install PostgreSQL** if you haven't already:
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create a database:**
   ```sql
   CREATE DATABASE inwarma_db;
   ```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# Set up the database
npm run db:generate
npm run db:push

# Start the backend server
npm run dev
```

The backend will be running on `http://localhost:5000`

### 4. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running on `http://localhost:3000`

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

- **Products**: Product catalog with SKU, category, and description
- **Inventory Items**: Stock items with quantities, expiry dates, and locations
- **Alerts**: Automated notifications for expiring items and low stock
- **Promotions**: Discount campaigns for near-expiry items
- **Pickups**: Customer pickup coordination

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add new inventory item

### Alerts
- `GET /api/alerts` - Get all alerts
- `PATCH /api/alerts/:id` - Update alert status

### Promotions
- `GET /api/promotions` - Get active promotions

### Pickups
- `GET /api/pickups` - Get all pickups
- `POST /api/pickups` - Create new pickup

### Analytics
- `GET /api/analytics` - Get warehouse analytics

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Data visualization
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database management
- **PostgreSQL** - Database
- **CORS** - Cross-origin requests

## 🚀 Development

### Running Both Servers

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Database Management

- **Prisma Studio**: `npm run db:studio` (in backend directory)
- **Generate Client**: `npm run db:generate`
- **Push Schema**: `npm run db:push`
- **Create Migration**: `npm run db:migrate`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/inwarma_db"
PORT=5000
NODE_ENV=development
```

## 🎯 Key Features Implemented

### ✅ Functional Buttons
- **Dashboard**: Navigation, upload, create promotions, schedule pickups
- **Inventory**: Add, edit, delete, export, upload with CSV
- **Alerts**: Mark as read, settings, take action, delete
- **All Pages**: Complete CRUD operations with modals

### ✅ Real-time Data
- Live dashboard updates
- Real-time alert management
- Dynamic inventory tracking

### ✅ File Operations
- CSV export/import functionality
- Template downloads
- Data backup and restore

### ✅ User Experience
- Responsive design
- Loading states
- Error handling
- Confirmation dialogs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support or questions:
- Open an issue in the repository
- Check the [setup guide](setup.md) for detailed instructions
- Review the troubleshooting section below

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check your DATABASE_URL in the `.env` file
- Ensure the database exists: `CREATE DATABASE inwarma_db;`

### Port Conflicts
- If port 3000 is in use, Vite will automatically try port 3001
- If port 5000 is in use, change the PORT in your `.env` file

### Frontend Can't Connect to Backend
- Ensure the backend is running on port 5000
- Check that CORS is enabled (it should be by default)
- Verify the API_BASE_URL in `frontend/src/services/api.ts`

### Common Issues
1. **Module not found errors**: Run `npm install` in both frontend and backend directories
2. **Prisma errors**: Run `npm run db:generate` in the backend directory
3. **Build errors**: Ensure TypeScript is properly configured

## 📈 Roadmap

- [ ] User authentication and authorization
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Integration with external APIs
- [ ] Automated testing suite
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

---

**Made with ❤️ for efficient warehouse management** 