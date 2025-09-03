import requests
from fastapi.responses import JSONResponse
from fastapi import Query
from app.main import app
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

gemini_token = os.getenv('GEMINI_TOKEN')

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
headers = {
    "X-goog-api-key": f"{gemini_token}",
}

@app.get('/detect/gemini/text')
async def detect_bullying_gemini_text(
        text_input: str = Query(..., description="Texto a ser analisado"),
        context: str = Query(None, description="Contexto opcional"),
):
    messages = [
        {
            "role": "user",
            "parts": [
                {
                    "text": "Você é um avaliador de linguagem ofensiva. Sempre responda APENAS com um JSON válido no "
                        "formato: { \"avaliation\": 0 a 5, \"justification\": \"texto explicando a nota\" }. Onde "
                        "0 significa nenhuma ofensa e 5 significa ofensa extremamente grave."
                }
            ]
        },
        {
            "role": "user",
            "parts": [
                {
                    "text": "Avalie a intensidade de ofensa na frase abaixo."
                        + (" Considere também o contexto, se fornecido." if context else "")
                }
            ]
        }
    ]

    if context:
        messages.append({
            "role": "user",
            "parts": [
                {
                    "text": f"Contexto: {context}"
                }
            ]
        })

    messages.append({
        "role": "user",
        "parts": [
            {
                "text": f"Frase: {text_input}"
            }
        ]
    })

    data = {
        "contents": messages
    }

    res = requests.post(url, headers=headers, json=data)

    print(f"GEMINI STATUS CODE: {res.status_code}", flush=True)

    if not res.ok:
        return JSONResponse(content={"detected": False, "error": "Erro na requisição à API do Gemini."})

    try:
        completion = res.json()
        full_response = completion["candidates"][0]["content"]["parts"][0]["text"].strip()

        # Remove blocos de código markdown, se existirem
        cleaned_response = re.sub(r"^```[a-zA-Z]*\n", "", full_response)
        cleaned_response = re.sub(r"\n```$", "", cleaned_response)

        parsed_response = json.loads(cleaned_response)
        print(f'GEMINI: {parsed_response}')

        return JSONResponse(
            content={
                "detected": True,
                "avaliation": parsed_response.get("avaliation"),
                "message": parsed_response.get("justification")
            }
        )
    except Exception as e:
        print("Erro ao processar resposta:", e)
        return JSONResponse(content={"detected": False, "error": "Resposta inválida da IA."})
