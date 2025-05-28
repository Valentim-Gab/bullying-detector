import requests
from fastapi.responses import JSONResponse
from fastapi import Query
from app.main import app
from dotenv import load_dotenv
import os
import json

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
    messages = [
        {
            "role": "system",
            "content": "Você é um avaliador de linguagem ofensiva. Sempre responda APENAS com um JSON válido no "
                       "formato: { \"avaliation\": 0 a 5, \"justification\": \"texto explicando a nota\" }. Onde "
                       "0 significa nenhuma ofensa e 5 significa ofensa extremamente grave."
        },
        {
            "role": "user",
            "content": "Avalie a intensidade de ofensa na frase abaixo."
                      + (" Considere também o contexto, se fornecido." if context else "")
        }
    ]

    if context:
        messages.append({
            "role": "user",
            "content": f"Contexto: {context}"
        })

    messages.append({
        "role": "user",
        "content": f"Frase: {text_input}"
    })

    data = {
        "model": "open-mistral-7b",
        "messages": messages,
        "temperature": 0.3
    }

    res = requests.post(url, headers=headers, json=data)

    print(f"STATUS CODE: {res.status_code}", flush=True)

    if not res.ok:
        return JSONResponse(content={"detected": False, "error": "Erro na requisição à API da Mistral."})

    try:
        completion = res.json()
        full_response = completion["choices"][0]["message"]["content"].strip()

        # Tenta converter diretamente a resposta para JSON
        parsed_response = json.loads(full_response)
        print(f'MISTRAL: {parsed_response}')

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
