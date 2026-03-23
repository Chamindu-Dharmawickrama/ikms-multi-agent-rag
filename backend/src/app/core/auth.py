"""Authentication utilities for JWT and Google OAuth."""

from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests
from google.oauth2 import id_token
from .config import get_settings

security = HTTPBearer()


def create_access_token(user_id: str, email: str) -> str:
    """Create JWT access token for a user.
    
    Args:
        user_id: User's unique identifier
        email: User's email address
        
    Returns:
        JWT token string
    """
    settings = get_settings()
    
    expiration = datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours)
    
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expiration,
        "iat": datetime.utcnow(),
    }
    
    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )
    
    return token


def verify_token(token: str) -> dict:
    """Verify and decode JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    settings = get_settings()
    
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token and extract user info.
    
    Args:
        token: Google OAuth token
        
    Returns:
        Dictionary with user information (sub, email, name, picture)
        
    Raises:
        HTTPException: If token is invalid
    """
    settings = get_settings()
    
    # Check if Google Client ID is configured
    if not settings.google_client_id or settings.google_client_id == "":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Client ID not configured. Please set GOOGLE_CLIENT_ID in backend/.env file"
        )
    
    try:
        # Verify Google token with clock skew tolerance (10 seconds)
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.google_client_id,
            clock_skew_in_seconds=10
        )
        
        return {
            "user_id": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture"),
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(e)}"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """FastAPI dependency to get current authenticated user.
    
    Args:
        credentials: HTTP Authorization credentials from request
        
    Returns:
        Dictionary with user information from token
        
    Raises:
        HTTPException: If token is missing or invalid
    """
    token = credentials.credentials
    return verify_token(token)
