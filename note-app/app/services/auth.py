from fastapi import HTTPException, status
from app.core.supabase import supabase

class AuthService:
    @staticmethod
    async def sign_up(email: str, password: str):
        try:
            response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            return response.user
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )

    @staticmethod
    async def sign_in(email: str, password: str):
        try:
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return response
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

    @staticmethod
    async def sign_out(jwt: str):
        try:
            supabase.auth.sign_out()
            return {"message": "Successfully signed out"}
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
