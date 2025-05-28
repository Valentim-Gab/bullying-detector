import os
import sys
import whisper
import io

# Garante saída UTF-8 (essencial para manter acentos ao usar via Node.js)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Adicione o caminho do ffmpeg instalado pelo Chocolatey ao PATH do processo
os.environ["PATH"] += os.pathsep + r"C:\ProgramData\chocolatey\bin"

audio_path = sys.argv[1]
model = whisper.load_model("large")
result = model.transcribe(audio_path, language="pt")
transcribed_text = result['text']

print(transcribed_text)

# pip install openai-whisper
# pyinstaller --onefile transcribeAudio.py
# pyinstaller transcribeAudio.spec
