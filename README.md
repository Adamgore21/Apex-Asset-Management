# APEX Asset Management

Enterprise-grade asset tracking and management platform. Built for organizations that need precise control over their asset inventory.

## Features

- **Complete Asset Lifecycle**: Track assets from acquisition through retirement
- **Smart Categorization**: Organize assets by type for better inventory control
- **Status Monitoring**: Real-time status tracking (active, inactive, maintenance, retired)
- **Comprehensive Tracking**: Serial numbers, purchase dates, valuations, and locations
- **Enterprise UI**: Modern, responsive interface designed for productivity
- **Robust API**: RESTful FastAPI backend with full CRUD operations and interactive documentation

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, Python 3.11
- **Frontend**: React 18, Axios
- **Database**: SQLite (development), easily swappable for PostgreSQL
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Running with Docker Compose

1. Clone the repository:
```bash
git clone <repository-url>
cd Apex-Asset-Management
```

2. Start the application:
```bash
docker compose up --pull always
```

3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

### Running Locally (without Docker)

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints

### Categories
- `POST /categories` - Create a category
- `GET /categories` - List all categories

### Assets
- `POST /assets` - Create an asset
- `GET /assets` - List all assets
- `GET /assets/{asset_id}` - Get asset details
- `PUT /assets/{asset_id}` - Update an asset
- `DELETE /assets/{asset_id}` - Delete an asset

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
Apex-Asset-Management/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # Main API application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── database.py      # Database configuration
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssetForm.js
│   │   │   ├── AssetList.js
│   │   │   └── CategoryForm.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Environment Variables

### Backend
- `DATABASE_URL` - Database connection string (default: sqlite:///./assets.db)

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8000)

## Development Tips

- Hot reload is enabled for both backend and frontend in docker-compose
- Backend changes auto-reload with `uvicorn --reload`
- Frontend changes auto-reload with React's development server
- Database file is stored in `backend_data` volume for persistence

## Database Schema

### Categories Table
- `id` (Integer, Primary Key)
- `name` (String, Unique)
- `description` (String)
- `created_at` (DateTime)

### Assets Table
- `id` (Integer, Primary Key)
- `name` (String)
- `description` (String)
- `category_id` (Foreign Key → Categories)
- `serial_number` (String, Unique)
- `purchase_date` (DateTime)
- `value` (Float)
- `location` (String)
- `status` (String: active, inactive, maintenance, retired)
- `created_at` (DateTime)
- `updated_at` (DateTime)

## License

MIT License
