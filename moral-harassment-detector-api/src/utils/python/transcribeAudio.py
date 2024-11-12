import whisper
import sys

audio_path = sys.argv[1]
model = whisper.load_model("large")
result = model.transcribe(audio_path, language="pt")
transcribed_text = result['text']

print(transcribed_text)

# pip install openai-whisper
# pyinstaller --onefile transcribeAudio.py
# pyinstaller transcribeAudio.spec
