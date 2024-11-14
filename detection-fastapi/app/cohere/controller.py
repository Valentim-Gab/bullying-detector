import cohere
from fastapi.responses import JSONResponse
from app.main import app
from dotenv import load_dotenv
import os

load_dotenv()

cohere_key = os.getenv('COHERE_KEY')
co = cohere.ClientV2(cohere_key)


@app.get('/detect/cohere/text')
async def detect_harassment_mistral_text(text_input):
    res = co.chat(
        model="command-r-plus",
        messages=[
            {
                "role": "user",
                "content": f"Detecte se na seguinte frase há assédio moral e responda apenas 'True' ou 'False'. "
                           f"Justifique resumidamente. Frase: {text_input}"
            }
        ]
    )

    if not res:
        return JSONResponse(content={"detected": 'false'})

    message = res.message.content[0].text
    split_msg = message.removeprefix('True. ')
    result = False

    if message:
        result = str(message).startswith('True')

    return JSONResponse(content={"detected": result, "message": split_msg})
