# 🧠 Smart Expense Tracker with AI

A full-stack expense tracking application with AI-powered insights, receipt OCR, and spending predictions.

## ✨ Features

- 🔐 **User Authentication** - Secure login and registration
- 💰 **Expense Management** - Add, view, and delete expenses
- 📊 **AI-Powered Insights** - Smart spending analysis and predictions
- 📸 **Receipt OCR** - Extract data from receipt images (basic implementation)
- 📈 **Interactive Charts** - Visual spending breakdowns
- 🎯 **Category Auto-Detection** - AI suggests expense categories
- 💡 **Smart Recommendations** - Budget tips and savings opportunities

## 🛠️ Tech Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **SQLAlchemy** - ORM
- **JWT** - Authentication
- **Pandas** - Data analysis
- **SQLite** - Database

### Frontend
- **React 18**
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **React-Chartjs-2** - Chart components

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## 🚀 Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Frontend Setup

```bash
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on `http://localhost:3000`

## 📖 Usage

1. **Register** a new account or **Login** with existing credentials
2. **Add Expenses** manually or by uploading receipts
3. View all your **expenses** with filtering options
4. Check the **Dashboard** for spending overview
5. Explore **AI Insights** for spending analysis and predictions

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all user expenses
- `POST /api/expenses` - Add new expense
- `DELETE /api/expenses/<id>` - Delete expense

### Insights
- `GET /api/insights` - Get spending insights
- `GET /api/predict` - Get next month prediction
- `POST /api/categories/predict` - Predict category for description

### Receipt Processing
- `POST /api/upload-receipt` - Upload and process receipt

### Budget
- `GET /api/budget` - Get user budgets
- `POST /api/budget` - Set category budget

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Uploaded receipts (auto-created)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ExpenseList.js
│   │   │   ├── AddExpense.js
│   │   │   ├── UploadReceipt.js
│   │   │   ├── Insights.js
│   │   │   └── Navbar.js
│   │   ├── utils/
│   │   │   └── api.js      # API utility functions
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 🎨 Key Features Explained

### AI Category Prediction
The system automatically suggests categories based on keywords in merchant names and descriptions:
- Food: restaurant, cafe, grocery, etc.
- Transport: uber, taxi, gas, etc.
- Shopping: amazon, walmart, store, etc.
- Entertainment: netflix, movie, game, etc.

### Spending Insights
- Monthly spending totals
- Category-wise breakdown
- Month-over-month comparison
- Average transaction analysis
- Largest expense tracking

### Spending Prediction
Uses historical data to predict next month's spending based on:
- Average monthly spending
- Spending trends
- Number of transactions

## 🔧 Configuration

### Backend Configuration
Edit `backend/app.py`:
```python
app.config['JWT_SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expenses.db'
```

### Frontend Configuration
Edit `frontend/src/utils/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';  # Change for production
```

## 🐛 Troubleshooting

### Backend Issues
- **Port 5000 already in use**: Change port in `app.py`
- **Module not found**: Ensure virtual environment is activated and dependencies are installed
- **Database errors**: Delete `expenses.db` and restart to recreate

### Frontend Issues
- **CORS errors**: Ensure backend is running and CORS is configured
- **Module not found**: Run `npm install` again
- **Port 3000 in use**: React will prompt to use different port

## 🚀 Future Enhancements

- [ ] Advanced OCR with Tesseract integration
- [ ] Multi-currency support
- [ ] Recurring expense tracking
- [ ] Budget alerts and notifications
- [ ] Export data to CSV/PDF
- [ ] Mobile app version
- [ ] Bank account integration
- [ ] Group expense sharing

## 📝 Notes

- The receipt OCR feature provides a basic implementation. For production use, integrate with Tesseract OCR or Google Vision API
- Default database is SQLite for easy setup. For production, consider PostgreSQL or MySQL
- JWT secret key should be changed in production
- Add proper error logging and monitoring for production deployment

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Feel free to fork, improve, and submit pull requests!

## 📧 Support

For issues or questions, please create an issue in the repository.

---

**Happy Expense Tracking! 🎉**
