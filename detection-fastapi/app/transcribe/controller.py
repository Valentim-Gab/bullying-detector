from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
from app.main import app
import whisper
import tempfile
import shutil
import os

@app.post("/transcribe-audio")
async def transcribe_audio(file: UploadFile = File(...)):
    print('Bateu')
    
    try:
        ext = os.path.splitext(file.filename)[1] or ".mp3"

        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        model = whisper.load_model("large")
        result = model.transcribe(tmp_path, language="pt")
        transcribed_text = result.get("text", "")

        os.remove(tmp_path) 

        return JSONResponse(content={"text": transcribed_text})

    except Exception as e:
        print("Erro ao transcrever:", e)
        return JSONResponse(status_code=400, content={"error": "Falha ao transcrever áudio"})
