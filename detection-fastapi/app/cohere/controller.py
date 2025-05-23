import cohere
from fastapi.responses import JSONResponse
from fastapi import Query
from app.main import app
from dotenv import load_dotenv
import os
import json

load_dotenv()

cohere_key = os.getenv('COHERE_KEY')
co = cohere.ClientV2(cohere_key)


@app.get('/detect/cohere/text')
async def detect_bullying_cohere_text(
        text_input: str = Query(..., description="Texto a ser analisado"),
        context: str = Query(None, description="Contexto opcional"),
):
    system_message = (
        "Você é um avaliador de linguagem ofensiva. Sua tarefa é avaliar frases quanto à presença de ofensa, bullying "
        "ou assédio moral. Sempre responda APENAS com um JSON válido no seguinte formato:\n"
        "{ \"avaliation\": 0 a 5, \"justification\": \"explicação breve\" }.\n"
        "0 = nenhuma ofensa, 5 = ofensa extremamente grave."
    )

    user_message = f"Frase: {text_input}"
    if context:
        user_message = f"Contexto: {context}\n{user_message}"

    res = co.chat(
        model="command-r-plus",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ]
    )

    if not res or not res.message or not res.message.content:
        return JSONResponse(content={"detected": False, "error": "Sem resposta da Cohere"})

    try:
        content = res.message.content[0].text.strip()
        parsed = json.loads(content)
        print(f'COHERE: {parsed}')

        return JSONResponse(
            content={
                "detected": True,
                "avaliation": parsed.get("avaliation"),
                "message": parsed.get("justification")
            }
        )

    except Exception as e:
        print("Erro ao processar resposta da Cohere:", e)
        return JSONResponse(content={"detected": False, "error": "Resposta inválida da IA"})
