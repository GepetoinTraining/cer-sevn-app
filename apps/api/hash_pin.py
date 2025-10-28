import argparse
from passlib.context import CryptContext

# IMPORTANT: Ensure this configuration matches the one used for verification
# in your db_utils.py or authentication logic.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_pin(plain_pin: str) -> str:
    """Hashes a plain PIN using the configured context."""
    return pwd_context.hash(plain_pin)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Hash a PIN securely using passlib (bcrypt).")
    parser.add_argument("pin", type=str, help="The plain PIN to hash.")

    args = parser.parse_args()

    if not args.pin:
        print("Error: Please provide a PIN to hash.")
    else:
        hashed_pin_output = hash_pin(args.pin)
        print(f"Plain PIN: {args.pin}")
        print(f"Hashed PIN: {hashed_pin_output}")
        print("\nStore this Hashed PIN in your database.")
