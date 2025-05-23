import requests
from fastapi.responses import JSONResponse
from fastapi import Query
from app.main import app
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()

openrouter_token = os.getenv('OPENROUTER_TOKEN')

url = "https://openrouter.ai/api/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {openrouter_token}",
    "Content-Type": "application/json"
}


@app.get('/detect/openrouter/text')
async def detect_bullying_openrouter_text(
        text_input: str = Query(..., description="Texto a ser analisado"),
        context: str = Query(None, description="Contexto opcional"),
):
    system_prompt = (
        "Você é um avaliador de linguagem ofensiva. Sua tarefa é detectar se há ofensa, bullying ou assédio moral "
        "em frases, considerando o contexto, quando fornecido. Responda APENAS com um JSON no formatom, cuidar aspas "
        "duplas para não invalidar o JSON:{ \"avaliation\": 0 a 5, \"justification\": \"explicação breve\" }.\n"
        "0 = nenhuma ofensa, 5 = ofensa extremamente grave."
    )

    user_prompt = f"Frase: {text_input}"
    if context:
        user_prompt = f"Contexto: {context}\n{user_prompt}"

    data = {
        "model": "deepseek/deepseek-prover-v2:free",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "stream": False
    }

    res = requests.post(url, headers=headers, json=data)

    if not res.ok:
        print("Erro HTTP:", res.status_code)
        return JSONResponse(content={"detected": False, "error": "Falha na requisição à OpenRouter"})

    try:
        completion = res.json()
        raw_content = completion["choices"][0]["message"]["content"].strip()
        print(f'DEEP_SEEK: {raw_content}')

        print(f'DEEP_SEEK: {raw_content}')
        raw_content = re.sub(r"^```(?:json)?|```$", "", raw_content.strip(), flags=re.MULTILINE).strip()

        parsed = json.loads(raw_content)
        print(f'DEEP_SEEK: {parsed}')

        return JSONResponse(
            content={
                "detected": True,
                "avaliation": parsed.get("avaliation"),
                "message": parsed.get("justification")
            }
        )

    except Exception as e:
        print("Erro ao processar resposta:", e)
        return JSONResponse(content={"detected": False, "error": "Formato inesperado na resposta da IA"})
