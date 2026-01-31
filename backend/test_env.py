from dotenv import load_dotenv
import os

load_dotenv()

print("GEMINI =", os.getenv("GEMINI_API_KEY"))
print("JWT =", os.getenv("JWT_SECRET_KEY"))
print("FLASK =", os.getenv("FLASK_SECRET_KEY"))
