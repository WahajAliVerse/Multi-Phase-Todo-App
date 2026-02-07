from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlmodel import Session
from backend.src.core.database import get_session
from backend.src.core.auth import login_user, logout_user, get_current_active_user
from backend.src.models.user import User, UserCreate, UserUpdate
from backend.src.schemas.user import UserLogin, UserPublicProfile
from backend.src.services.user_service import UserService
from backend.src.core.rate_limiter import rate_limit_auth


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register")
@rate_limit_auth
def register_user(
    user_data: UserCreate,
    response: Response,
    session: Session = Depends(get_session)
):
    """
    Register a new user
    """
    user_service = UserService()
    
    # Check if user already exists
    existing_user = user_service.get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    db_user = user_service.create_user(session, user_data)
    
    # Log in the user after registration
    login_result = login_user(response, user_data.email, user_data.password, session)
    
    # Return user profile and access token
    return {
        "user": UserPublicProfile(
            id=db_user.id,
            email=db_user.email,
            first_name=db_user.first_name,
            last_name=db_user.last_name,
            created_at=db_user.created_at,
            updated_at=db_user.updated_at
        ),
        "access_token": login_result["access_token"],
        "token_type": login_result["token_type"]
    }


@router.post("/login")
@rate_limit_auth
def login(
    request: Request,
    response: Response,
    user_credentials: UserLogin
):
    """
    Authenticate user and create session
    """
    # The login_user function handles authentication and sets the session cookie
    result = login_user(
        response, 
        user_credentials.email, 
        user_credentials.password, 
        request.state.session  # Assuming session is available in request state
    )
    return result


@router.post("/logout")
def logout(
    response: Response
):
    """
    Logout user and clear session
    """
    logout_user(response)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserPublicProfile)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current user's profile
    """
    return UserPublicProfile(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )


@router.put("/me", response_model=UserPublicProfile)
def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """
    Update current user's profile
    """
    user_service = UserService()
    
    updated_user = user_service.update_user(
        session, 
        current_user.id, 
        user_update
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserPublicProfile(
        id=updated_user.id,
        email=updated_user.email,
        first_name=updated_user.first_name,
        last_name=updated_user.last_name,
        created_at=updated_user.created_at,
        updated_at=updated_user.updated_at
    )