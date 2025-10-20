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
        "Você é um detector de linguagem ofensiva. Sua tarefa é avaliar frases quanto à presença de ofensa, bullying "
        "ou assédio moral. Sempre responda APENAS com um JSON válido no seguinte formato:\n"
        "{ \"classification\": 0 a 5, \"justification\": \"explicação breve\" }.\n"
        "Classificações:\n"
        "0 até 0.99 -> Contém nenhuma ou quase nenhuma ofensa;\n"
        "1 até 2.99 -> Contém pouca ou ofensa moderada;\n"
        "3 até 5 -> Contém ofensas graves ou extremamente graves.\n"
    )

    user_message = f"Frase: {text_input}"
    if context:
        user_message = f"Contexto: {context}\n{user_message}"

    try:
        res = co.chat(
            model="command-a-03-2025",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message},
            ],
        )

        if not res or not res.message or not res.message.content:
            return JSONResponse(content={"detected": False, "error": "Sem resposta da Cohere"})

        raw_text = res.message.content[0].text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`")
            raw_text = raw_text.replace("json", "").strip()
            raw_text = raw_text.strip("`").strip()

        parsed = json.loads(raw_text)

        return JSONResponse(
            content={
                "detected": True,
                "classification": parsed.get("classification"),
                "message": parsed.get("justification"),
            }
        )

    except json.JSONDecodeError as e:
        print("Erro ao processar JSON:", e)
        print("Conteúdo bruto retornado:", res.message.content[0].text)
        return JSONResponse(content={"detected": False, "error": "Formato JSON inválido da resposta"})

    except Exception as e:
        print("Erro inesperado:", e)
        return JSONResponse(content={"detected": False, "error": "Erro interno"})
