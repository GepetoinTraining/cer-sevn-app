from fastapi import FastAPI, HTTPException, status, Depends
from pydantic import BaseModel, Field
from passlib.context import CryptContext # For hashing
# Use relative import for db utils if needed, or define DB access here/elsewhere
# from ..db_utils import some_db_function
import os

# --- Configuration ---
# IMPORTANT: Use the SAME configuration as your verification logic
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Placeholder: Replace with actual Prisma/DB connection logic
# In a real app, you'd likely use Prisma Client JS via a bridge,
# or a Python ORM/driver like psycopg2/asyncpg.
async def get_db_connection():
    # Simulate DB connection setup/yield
    print("Simulating DB connection")
    yield {"connection": "mock_db"} # Replace with actual connection
    print("Simulating DB connection close")

# --- Pydantic Models ---
class UserCreateRequest(BaseModel):
    name: str
    pin: str = Field(..., min_length=4) # Add validation
    schoolSlug: str # e.g., 'knn' or 'phenom'
    sectorKey: str
    roleKey: str

class UserResponse(BaseModel):
    id: str
    name: str
    message: str

# --- FastAPI App ---
# Vercel needs the app instance named 'app'
# If this file is api/users/create.py, Vercel routes /api/python/users/create here.
app = FastAPI()

# --- Helper Functions ---
def hash_pin(plain_pin: str) -> str:
    """Hashes a plain PIN using the configured context."""
    return pwd_context.hash(plain_pin)

# --- API Endpoint ---
@app.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreateRequest, db = Depends(get_db_connection)):
    print(f"Received user creation request: {user_data.dict()}")

    # --- TODO: Add Authorization Check ---
    # Verify that the user making this request has permission (e.g., is 'diretor')
    # This would typically involve checking the JWT token from the request header/cookie

    # Hash the PIN before storing
    hashed_pin_value = hash_pin(user_data.pin)
    print(f"Hashing PIN for user: {user_data.name}")

    # --- TODO: Database Interaction ---
    # 1. Look up Organization ID based on user_data.schoolSlug
    # 2. Look up Sector ID based on org ID and user_data.sectorKey
    # 3. Look up Role ID based on user_data.roleKey
    # 4. Check if a user with this PIN or name already exists (handle potential conflicts)
    # 5. Create the new User record in the database using Prisma Client/ORM/driver,
    #    storing the 'hashed_pin_value', not the plain 'user_data.pin'.

    # --- Placeholder Response ---
    # Replace with actual data from the created user record
    new_user_id = f"new_user_{user_data.name.lower().replace(' ', '')}"
    print(f"Simulating user creation with ID: {new_user_id}")
    # --- End Placeholder ---

    # Don't return the PIN or hash in the response
    return UserResponse(
        id=new_user_id,
        name=user_data.name,
        message="Usuário criado com sucesso!"
    )

# --- Example of how you might integrate Prisma Client (requires more setup like a bridge) ---
# from prisma import Prisma
# async def create_user_prisma(user_data: UserCreateRequest):
#     async with Prisma() as prisma:
#         org = await prisma.organization.find_unique(where={"slug": user_data.schoolSlug})
#         if not org: raise HTTPException(status_code=400, detail="Organization not found")
#         # ... find sector, role ...
#         hashed_pin_value = hash_pin(user_data.pin)
#         new_user = await prisma.user.create(data={
#             "name": user_data.name,
#             "hashedPin": hashed_pin_value,
#             "organizationId": org.id,
#             # ... sectorId, roleId ...
#         })
#         return new_user
