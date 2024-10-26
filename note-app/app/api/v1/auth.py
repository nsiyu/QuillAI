from fastapi import APIRouter
from app.schemas.auth import UserLogin
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(user: UserLogin):
    return await AuthService.sign_in(user.email, user.password)