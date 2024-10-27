import openai
from app.core.config import settings

openai.api_key = settings.OPENAI_API_KEY

async def get_openai_edit(full_content: str, selected_text: str, suggestion: str) -> str:
    prompt = (
        "You are an assistant helping to edit lecture notes.\n\n"
        "Here is the full content of the lecture:\n"
        f"{full_content}\n\n"
        "The user wants to modify the following part:\n"
        f"\"{selected_text}\"\n\n"
        "Their suggestion for modification is:\n"
        f"\"{suggestion}\"\n\n"
        "Please provide the updated lecture content with the suggested modification applied."
    )

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        temperature=0.7,
        max_tokens=1500,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
    )

    if response and response.choices:
        return response.choices[0].text.strip()
    else:
        raise ValueError("Invalid response from OpenAI API")