import cohere
from fastapi.responses import JSONResponse
from fastapi import Query
from app.main import app
from dotenv import load_dotenv
import os

load_dotenv()

cohere_key = os.getenv('COHERE_KEY')
co = cohere.ClientV2(cohere_key)


@app.get('/detect/cohere/text')
async def detect_bullying_cohere_text(
        text_input: str = Query(..., description="Texto a ser analisado"),
        context: str = Query(None, description="Contexto opcional"),
):
    message = (f"Detecte se na seguinte frase há algum tipo de ofensa, bullying ou assédio moral."
               f" Avalie de 0 a 5 a intensidade da ofensa na frase. Justifique resumidamente.")

    if context:
        message = f"{message} Contexto da frase: {context}."

    message = (f"{message} Estrutura da sua resposta: [Nota - Justificativa], exemplo: '3.8 - Há ofensa porque...'."
               f" Frase: {text_input}")

    res = co.chat(
        model="command-r-plus",
        messages=[
            {
                "role": "user",
                "content": message
            }
        ]
    )

    if not res or not res.message or not res.message.content:
        return JSONResponse(content={"detected": False})

    try:
        full_response = res.message.content[0].text.strip()
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
