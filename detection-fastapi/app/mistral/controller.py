import requests
from fastapi.responses import JSONResponse
from fastapi import Query
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
async def detect_bullying_mistral_text(
        text_input: str = Query(..., description="Texto a ser analisado"),
        context: str = Query(None, description="Contexto opcional"),
):
    message = (f"Detecte se na seguinte frase há algum tipo de ofensa, bullying ou assédio moral."
               f" Avalie de 0 a 5 a intensidade da ofensa na frase. Justifique resumidamente.")

    if context:
        message = f"{message} Contexto da frase: {context}."

    message = (f"{message} Estrutura da sua resposta: [Nota - Justificativa], exemplo: '3.8 - Há ofensa porque...'."
               f" Frase: {text_input}")

    data = {
        "model": "open-mistral-7b",
        "messages": [
            {
                "role": "user",
                "content": message
            }
        ],
        "temperature": 0.7
    }

    res = requests.post(url, headers=headers, json=data)

    if not res.ok:
        return JSONResponse(content={"detected": False})

    try:
        completion = res.json()
        full_response = completion["choices"][0]["message"]["content"].strip()
        avaliation_str, justification = full_response.split(' - ', 1)
        avaliation = float(avaliation_str.strip())
    except Exception as e:
        print(e)
        return JSONResponse(
            content={"detected": False}
        )

    return JSONResponse(
        content={
            "detected": True,
            "avaliation": avaliation,
            "justification": justification.strip()
        }
    )
