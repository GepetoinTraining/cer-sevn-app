from fastapi import FastAPI, HTTPException, Response, Depends, status
from pydantic import BaseModel
from fastapi.security import APIKeyCookie
import jwt # Requires 'pip install python-jose[cryptography]' and 'pip install python-multipart' for form data
from datetime import datetime, timedelta, timezone
import os # To read secret key from environment variable
# Assuming you have a way to access your Prisma client or database
# This is a placeholder - replace with your actual DB access logic
from db_utils import get_user_by_pin # Placeholder function

# --- Configuration ---
# Store these securely in environment variables (e.g., in Vercel)
# You MUST set these in your Vercel Environment Variables
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "YOUR_SUPER_SECRET_KEY") # CHANGE THIS!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8 # 8 hours

# --- Pydantic Models ---
class LoginRequest(BaseModel):
    pin: str

class TokenData(BaseModel):
    pin: str | None = None # Or use user ID if preferred

# --- Security ---
cookie_scheme = APIKeyCookie(name="session_token", auto_error=False)

# --- FastAPI App (within the 'api' folder) ---
# Vercel expects the app instance to be named 'app'
# If this file is api/auth/login.py, Vercel routes /api/python/auth/login here.
app = FastAPI()

# --- Helper Functions ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Default expiration time
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- API Endpoint ---
@app.post("/") # Route relative to the file location in /api
async def login_for_access_token(request: LoginRequest, response: Response):
    # !!! IMPORTANT: Replace get_user_by_pin with your actual database query !!!
    # !!! You MUST securely hash/verify the PIN, don't store plain text PINs !!!
    user = await get_user_by_pin(request.pin) # Fetch user from DB based on PIN

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="PIN inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # PIN is valid, create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        # Include necessary user info in the token payload
        data={"sub": user["id"], "pin": user["pin"], "role": user["roleKey"], "school": user["schoolSlug"], "sector": user["sectorKey"]},
        expires_delta=access_token_expires
    )

    # Set token in an httpOnly cookie
    response.set_cookie(
        key="session_token",
        value=access_token,
        httponly=True,
        max_age=int(access_token_expires.total_seconds()),
        expires=int(access_token_expires.total_seconds()), # For older browsers
        samesite="lax", # Consider 'strict' if applicable
        secure=True # IMPORTANT: Only set secure=True if served over HTTPS (Vercel does this)
    )

    # Return basic user info needed for redirection
    return {"message": "Login successful", "schoolSlug": user["schoolSlug"]}

# --- Placeholder Database Function ---
# Replace this with your actual Prisma/database interaction logic
async def get_user_by_pin(pin: str):
    # WARNING: THIS IS A PLACEHOLDER AND INSECURE
    # You MUST query your database and verify the PIN securely (e.g., using bcrypt)
    print(f"Attempting to find user with PIN: {pin}") # Log for debugging
    if pin == "1234": # Example: Replace with DB lookup and hash verification
         return {"id": "user1", "pin": "1234", "roleKey": "sr", "schoolSlug": "knn", "sectorKey": "comercial"}
    if pin == "5678":
         return {"id": "user2", "pin": "5678", "roleKey": "lider", "schoolSlug": "phenom", "sectorKey": "marketing"}
    return None
