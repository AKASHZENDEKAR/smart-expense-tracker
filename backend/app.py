from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token,
    jwt_required, get_jwt_identity
)
from datetime import datetime, timedelta
import pandas as pd
import os

from dotenv import load_dotenv
import google.generativeai as genai

# ================== LOAD ENV ==================
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-jwt-secret-key-change-this")
FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "default-flask-secret-key-change-this")

# ================== GEMINI CONFIG (WITH ERROR HANDLING) ==================
gemini_enabled = False
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-pro")
        gemini_enabled = True
        print("✅ Gemini AI enabled")
    except Exception as e:
        print(f"⚠️ Gemini AI disabled: {e}")
        gemini_enabled = False
else:
    print("⚠️ GEMINI_API_KEY not found - AI features disabled")

# ================== APP CONFIG ==================
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///expenses.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["SECRET_KEY"] = FLASK_SECRET_KEY

CORS(app)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ================== MODELS ==================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50))
    description = db.Column(db.String(200))
    date = db.Column(db.DateTime, default=datetime.utcnow)

# ================== AUTH ==================
@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.json

        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"message": "Email already exists"}), 400

        user = User(
            username=data["username"],
            email=data["email"],
            password=bcrypt.generate_password_hash(data["password"]).decode()
        )
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        print(f"ERROR in register: {e}")
        return jsonify({"message": str(e)}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data["email"]).first()

        if not user or not bcrypt.check_password_hash(user.password, data["password"]):
            return jsonify({"message": "Invalid credentials"}), 401

        token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(days=7)
        )
        return jsonify({"access_token": token}), 200
    except Exception as e:
        print(f"ERROR in login: {e}")
        return jsonify({"message": str(e)}), 500

# ================== EXPENSES ==================
@app.route("/api/expenses", methods=["GET", "POST"])
@jwt_required()
def expenses():
    try:
        user_id = int(get_jwt_identity())

        if request.method == "POST":
            data = request.json
            
            # Parse date properly
            expense_date = datetime.utcnow()
            if 'date' in data:
                try:
                    expense_date = datetime.fromisoformat(data['date'].replace('Z', ''))
                except:
                    pass
            
            expense = Expense(
                user_id=user_id,
                amount=float(data["amount"]),
                category=data.get("category", "Other"),
                description=data.get("description", ""),
                date=expense_date
            )
            db.session.add(expense)
            db.session.commit()
            
            print(f"✅ Added expense: ₹{expense.amount} - {expense.category} - {expense.date}")
            return jsonify({"message": "Expense added"}), 201

        expenses = Expense.query.filter_by(user_id=user_id).order_by(Expense.date.desc()).all()
        return jsonify([
            {
                "id": e.id,
                "amount": e.amount,
                "category": e.category,
                "description": e.description,
                "date": e.date.isoformat()
            } for e in expenses
        ])
    except Exception as e:
        print(f"ERROR in expenses: {e}")
        return jsonify({"message": str(e)}), 500

# ================== INSIGHTS (FIXED) ==================
@app.route("/api/insights", methods=["GET"])
@jwt_required()
def insights():
    try:
        user_id = int(get_jwt_identity())
        all_expenses = Expense.query.filter_by(user_id=user_id).all()

        if not all_expenses:
            return jsonify({
                "total_current_month": 0,
                "total_transactions": 0,
                "average_transaction": 0,
                "category_breakdown": {},
                "month_over_month_change": 0
            })

        # Get current month expenses
        now = datetime.now()
        current_month = now.month
        current_year = now.year
        
        # Filter current month - FIXED
        current_month_expenses = []
        for e in all_expenses:
            exp_date = e.date
            if exp_date.month == current_month and exp_date.year == current_year:
                current_month_expenses.append(e)
        
        print(f"📊 Total expenses: {len(all_expenses)}")
        print(f"📊 Current month ({current_month}/{current_year}): {len(current_month_expenses)}")

        if not current_month_expenses:
            return jsonify({
                "total_current_month": 0,
                "total_transactions": 0,
                "average_transaction": 0,
                "category_breakdown": {},
                "month_over_month_change": 0
            })

        # Calculate using current month only
        df = pd.DataFrame([{
            "amount": e.amount,
            "category": e.category
        } for e in current_month_expenses])

        total_current = float(df["amount"].sum())
        avg_transaction = float(df["amount"].mean())
        
        print(f"💰 Total current month: ₹{total_current}")
        print(f"📊 Average: ₹{avg_transaction}")

        # Category breakdown
        category_breakdown = df.groupby("category")["amount"].sum().to_dict()
        category_breakdown = {k: float(v) for k, v in category_breakdown.items()}

        # Previous month comparison
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1
        
        prev_month_expenses = []
        for e in all_expenses:
            exp_date = e.date
            if exp_date.month == prev_month and exp_date.year == prev_year:
                prev_month_expenses.append(e)
        
        month_over_month_change = 0
        if prev_month_expenses:
            prev_total = sum(e.amount for e in prev_month_expenses)
            if prev_total > 0:
                month_over_month_change = ((total_current - prev_total) / prev_total) * 100

        return jsonify({
            "total_current_month": round(total_current, 2),
            "total_transactions": len(current_month_expenses),
            "average_transaction": round(avg_transaction, 2),
            "category_breakdown": category_breakdown,
            "month_over_month_change": round(month_over_month_change, 2)
        })
        
    except Exception as e:
        print(f"ERROR in insights: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "total_current_month": 0,
            "total_transactions": 0,
            "average_transaction": 0,
            "category_breakdown": {},
            "month_over_month_change": 0
        }), 500

# ================== 🤖 AI SUMMARY (WORKING) ==================
@app.route("/api/genai/summary", methods=["GET"])
@jwt_required()
def genai_summary():
    if not gemini_enabled:
        return jsonify({
            "ai_summary": "AI features require GEMINI_API_KEY in .env file. Get free key at: https://makersuite.google.com/app/apikey"
        })
    
    try:
        user_id = int(get_jwt_identity())
        expenses = Expense.query.filter_by(user_id=user_id).all()

        if not expenses:
            return jsonify({"ai_summary": "No expenses yet. Add some expenses to get AI insights!"})

        # Get current month expenses only
        now = datetime.now()
        current_month_expenses = [
            e for e in expenses 
            if e.date.month == now.month and e.date.year == now.year
        ]
        
        if not current_month_expenses:
            return jsonify({"ai_summary": "No expenses this month yet."})

        # Calculate totals
        total = sum(e.amount for e in current_month_expenses)
        categories = {}
        for e in current_month_expenses:
            categories[e.category] = categories.get(e.category, 0) + e.amount
        
        # Format expense data
        expense_text = "\n".join(
            [f"{cat}: ₹{amt:.2f}" for cat, amt in categories.items()]
        )

        prompt = f"""You are a financial advisor. Analyze this month's expenses and provide helpful insights.

Total spending this month: ₹{total:.2f}
Number of transactions: {len(current_month_expenses)}

Breakdown by category:
{expense_text}

Provide:
1. A brief summary (1-2 sentences)
2. One specific observation about spending patterns
3. One actionable tip to save money

Keep it concise, friendly, and under 100 words."""

        print(f"🤖 Calling Gemini AI...")
        response = model.generate_content(prompt)
        ai_text = response.text.strip()
        print(f"✅ AI Response: {ai_text[:100]}...")
        
        return jsonify({"ai_summary": ai_text})
        
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "ai_summary": f"AI temporarily unavailable. Check console for details."
        })

# ================== 🤖 AI CATEGORY ==================
@app.route("/api/genai/category", methods=["POST"])
@jwt_required()
def ai_category():
    if not gemini_enabled:
        return jsonify({"category": "Other"})
    
    try:
        description = request.json.get("description", "")

        if not description or len(description) < 3:
            return jsonify({"category": "Other"})

        prompt = f"""Classify this expense into EXACTLY ONE category from this list:
Food, Transport, Shopping, Entertainment, Bills, Health, Other

Expense description: "{description}"

Return ONLY the category name, nothing else."""

        response = model.generate_content(prompt)
        category = response.text.strip()
        
        # Validate category
        valid_categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other']
        if category not in valid_categories:
            category = 'Other'
        
        print(f"🤖 AI Category: '{description}' → {category}")
        return jsonify({"category": category})
        
    except Exception as e:
        print(f"❌ AI Category Error: {e}")
        return jsonify({"category": "Other"})

# ================== DB INIT ==================
with app.app_context():
    db.create_all()
    print("✅ Database initialized")

# ================== RUN ==================
if __name__ == "__main__":
    print("=" * 60)
    print("🧠 Smart Expense Tracker with AI")
    print("=" * 60)
    print(f"✅ Backend running on: http://localhost:5000")
    print(f"🤖 Gemini AI: {'Enabled ✅' if gemini_enabled else 'Disabled ⚠️'}")
    if not gemini_enabled:
        print("⚠️  Add GEMINI_API_KEY to .env for AI features")
        print("📝 Get free key: https://makersuite.google.com/app/apikey")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)