"""Authentication API endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import httpx
from ..core.auth import verify_google_token, create_access_token, get_current_user
from ..services.user_service import get_user_service

auth_router = APIRouter(prefix="/auth")

# In-memory cache for profile images
_profile_image_cache: dict[str, bytes] = {}


class GoogleAuthRequest(BaseModel):
    """Request body for Google authentication."""
    token: str


class AuthResponse(BaseModel):
    """Response body for authentication."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    """Response body for user information."""
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None


@auth_router.post("/google", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def google_auth(payload: GoogleAuthRequest) -> AuthResponse:
    """Authenticate user with Google OAuth token.
    
    This endpoint:
    - Verifies the Google OAuth token
    - Creates or updates the user in the database
    - Generates a JWT access token
    - Returns the token and user information
    """
    try:
        # Verify Google token and get user info
        user_info = verify_google_token(payload.token)
        
        # Create or update user in database
        user_service = get_user_service()
        user = user_service.create_or_update_user(
            user_id=user_info["user_id"],
            email=user_info["email"],
            name=user_info.get("name"),
            picture=user_info.get("picture"),
        )
        
        # Create JWT access token
        access_token = create_access_token(user.user_id, user.email)
        
        return AuthResponse(
            access_token=access_token,
            user={
                "user_id": user.user_id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture,
            }
        )
    except HTTPException as e:
        # Re-raise HTTPException with original status and detail
        print(f"Authentication error: {e.detail}")
        raise
    except Exception as e:
        print(f"Unexpected authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@auth_router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_current_user_info(current_user: dict = Depends(get_current_user)) -> UserResponse:
    """Get current authenticated user information.
    
    Requires a valid JWT token in the Authorization header.
    """
    try:
        user_service = get_user_service()
        user = user_service.get_user(current_user["user_id"])
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            user_id=user.user_id,
            email=user.email,
            name=user.name,
            picture=user.picture,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user info: {str(e)}"
        )


@auth_router.post("/verify", status_code=status.HTTP_200_OK)
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify that the provided JWT token is valid.

    Returns the decoded user information if valid.
    """
    return {
        "valid": True,
        "user_id": current_user["user_id"],
        "email": current_user["email"],
    }


@auth_router.get("/profile-image/{user_id}")
async def get_profile_image(user_id: str):
    """Proxy endpoint for profile images with caching.

    This endpoint solves the Google profile image rate limiting (429) issue by:
    1. Caching profile images in memory
    2. Making only one request to Google per user
    3. Serving cached images for subsequent requests
    """
    try:
        # Check if image is already cached
        if user_id in _profile_image_cache:
            return Response(
                content=_profile_image_cache[user_id],
                media_type="image/jpeg"
            )

        # Get user from database to retrieve the Google picture URL
        user_service = get_user_service()
        user = user_service.get_user(user_id)

        if not user or not user.picture:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile image not found"
            )

        # Fetch the image from Google
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(user.picture)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Failed to fetch profile image"
                )

            # Cache the image
            image_data = response.content
            _profile_image_cache[user_id] = image_data

            return Response(
                content=image_data,
                media_type=response.headers.get("content-type", "image/jpeg")
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve profile image: {str(e)}"
        )
