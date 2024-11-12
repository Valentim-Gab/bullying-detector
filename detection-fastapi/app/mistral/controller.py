import requests
from fastapi.responses import JSONResponse
from app.main import app
from dotenv import load_dotenv
import os

load_dotenv()

mistral_token = os.getenv('MISTRAL_TOKEN')

url = "https://api.mistral.ai/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {mistral_token}",
    "Content-Type": "application/json"
}


@app.get('/detect/mistral/text')
async def detect_harassment_mistral_text(text_input):
    data = {
        "model": "open-mistral-7b",
        "messages": [
            {"role": "user",
             "content": f"Detecte se na seguinte frase há assédio moral e responda apenas 'True' ou 'False'. "
                        f"Frase: '{text_input}'"}
        ],
        "temperature": 0.7
    }

    res = requests.post(url, headers=headers, json=data)

    if not res or res.status_code != 200:
        return JSONResponse(content={"detected": 'false'})

    completion = res.json()
    message = completion["choices"][0]["message"]["content"]

    result = False

    if message:
        result = str(message).startswith('True')

    return JSONResponse(content={"detected": result, "message": message})
