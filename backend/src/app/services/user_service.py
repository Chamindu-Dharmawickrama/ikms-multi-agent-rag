"""User service for managing user data."""

from typing import Optional
from datetime import datetime
import json
from ..db.connection import get_db_connection
from ..db.models import UserDB


class UserService:
    """Service for managing users in the database."""

    def create_or_update_user(
        self,
        user_id: str,
        email: str,
        name: Optional[str] = None,
        picture: Optional[str] = None,
    ) -> UserDB:
        """Create a new user or update existing user's last login.
        
        Args:
            user_id: Unique identifier from Google OAuth
            email: User's email address
            name: User's display name
            picture: URL to user's profile picture
            
        Returns:
            UserDB instance
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    # Try to insert, update on conflict
                    cursor.execute("""
                        INSERT INTO users (user_id, email, name, picture, created_at, last_login)
                        VALUES (%s, %s, %s, %s, NOW(), NOW())
                        ON CONFLICT (user_id) 
                        DO UPDATE SET
                            last_login = NOW(),
                            name = COALESCE(EXCLUDED.name, users.name),
                            picture = COALESCE(EXCLUDED.picture, users.picture)
                        RETURNING user_id, email, name, picture, created_at, last_login, metadata
                    """, (user_id, email, name, picture))

                    user_row = cursor.fetchone()
                    connection.commit()

                    return UserDB(
                        user_id=user_row["user_id"],
                        email=user_row["email"],
                        name=user_row["name"],
                        picture=user_row["picture"],
                        created_at=user_row["created_at"],
                        last_login=user_row["last_login"],
                        metadata=user_row["metadata"]
                    )
        except Exception as e:
            raise Exception(f"Database error creating/updating user: {str(e)}") from e

    def get_user(self, user_id: str) -> Optional[UserDB]:
        """Get a user by user ID.
        
        Args:
            user_id: The user's unique identifier
            
        Returns:
            UserDB instance or None if not found
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT user_id, email, name, picture, created_at, last_login, metadata
                        FROM users
                        WHERE user_id = %s
                    """, (user_id,))

                    user_row = cursor.fetchone()
                    if not user_row:
                        return None

                    return UserDB(
                        user_id=user_row["user_id"],
                        email=user_row["email"],
                        name=user_row["name"],
                        picture=user_row["picture"],
                        created_at=user_row["created_at"],
                        last_login=user_row["last_login"],
                        metadata=user_row["metadata"]
                    )
        except Exception as e:
            raise Exception(f"Database error getting user: {str(e)}") from e

    def get_user_by_email(self, email: str) -> Optional[UserDB]:
        """Get a user by email address.
        
        Args:
            email: The user's email address
            
        Returns:
            UserDB instance or None if not found
        """
        try:
            with get_db_connection() as connection:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT user_id, email, name, picture, created_at, last_login, metadata
                        FROM users
                        WHERE email = %s
                    """, (email,))

                    user_row = cursor.fetchone()
                    if not user_row:
                        return None

                    return UserDB(
                        user_id=user_row["user_id"],
                        email=user_row["email"],
                        name=user_row["name"],
                        picture=user_row["picture"],
                        created_at=user_row["created_at"],
                        last_login=user_row["last_login"],
                        metadata=user_row["metadata"]
                    )
        except Exception as e:
            raise Exception(f"Database error getting user by email: {str(e)}") from e


# Singleton instance
_user_service: Optional[UserService] = None


def get_user_service() -> UserService:
    """Get the UserService singleton instance."""
    global _user_service
    if _user_service is None:
        _user_service = UserService()
    return _user_service
