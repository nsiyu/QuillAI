from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from openai import AsyncOpenAI 
from app.core.config import settings
from app.core.auth import get_current_user

router = APIRouter(prefix="/lecture", tags=["lecture"])

class TranscriptRequest(BaseModel):
    text: str

class TranscriptResponse(BaseModel):
    processedText: str

@router.post("/process", response_model=TranscriptResponse)
async def process_lecture(
    request: TranscriptRequest,
    current_user = Depends(get_current_user)
):
    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        
        prompt = f"""
        You are an expert note-taker. Transform the following lecture transcript into well-structured, clear notes.
        Follow these guidelines:
        1. Organize key points into a hierarchical structure
        2. Add bullet points for main ideas
        3. Use proper formatting for headings and subheadings
        4. Correct any grammar or clarity issues
        5. Keep the original meaning intact

        Lecture transcript:
        {request.text}
        """

        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert note-taking assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )

        processed_text = response.choices[0].message.content

        return TranscriptResponse(processedText=processed_text)

    except Exception as e:
        print(f"Error in process_lecture: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))
