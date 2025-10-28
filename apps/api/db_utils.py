import prisma
from prisma import Prisma
from prisma.models import User, Organization, Role
from passlib.context import CryptContext

# Configure passlib for hashing (using bcrypt as the default)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_pin(prisma_client: Prisma, pin_identifier: str, pin: str) -> dict[str, str] | None:
    """
    Finds a user by their unique pinIdentifier and verifies the provided PIN.
    Includes Organization and Role data.
    Returns user details if found and verified, otherwise None.
    """
    try:
        user = await prisma_client.user.find_first(
            where={'pinIdentifier': pin_identifier},
            include={'organization': True, 'role': True}
        )

        if not user or not user.hashedPin or not user.organization or not user.role:
            return None # User not found or essential data missing

        if not verify_pin(pin, user.hashedPin):
            return None # PIN verification failed

        # Return relevant user details
        return {
            "id": user.id,
            "name": user.name,
            "schoolSlug": user.organization.slug,
            "role": user.role.key, # Assuming Role model has a 'key' field like 'diretor', 'lider', 'sr', 'jr'
        }

    except Exception as e:
        print(f"Error fetching user by PIN identifier {pin_identifier}: {e}")
        return None

def hash_pin(pin: str) -> str:
    """Hashes a plain text PIN using bcrypt."""
    return pwd_context.hash(pin)

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    """Verifies a plain text PIN against a stored hash."""
    return pwd_context.verify(plain_pin, hashed_pin)

# Placeholder for fetching organization ID by slug (used in user creation)
async def get_organization_id_by_slug(prisma_client: Prisma, slug: str) -> str | None:
    """Finds an organization by its slug and returns its ID."""
    try:
        org = await prisma_client.organization.find_unique(where={'slug': slug})
        return org.id if org else None
    except Exception as e:
        print(f"Error fetching organization by slug {slug}: {e}")
        return None

# Placeholder for fetching sector ID by key and org ID (used in user creation)
async def get_sector_id_by_key(prisma_client: Prisma, key: str, org_id: str) -> str | None:
    """Finds a sector by its key within a specific organization and returns its ID."""
    try:
        sector = await prisma_client.sector.find_first(
            where={'key': key, 'organizationId': org_id}
        )
        return sector.id if sector else None
    except Exception as e:
        print(f"Error fetching sector {key} for org {org_id}: {e}")
        return None

# Placeholder for fetching role ID by key (used in user creation)
async def get_role_id_by_key(prisma_client: Prisma, key: str) -> str | None:
    """Finds a role by its key and returns its ID."""
    try:
        role = await prisma_client.role.find_unique(where={'key': key})
        return role.id if role else None
    except Exception as e:
        print(f"Error fetching role by key {key}: {e}")
        return None

