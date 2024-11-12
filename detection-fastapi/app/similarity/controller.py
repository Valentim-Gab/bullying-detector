from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.responses import JSONResponse
from app.main import app
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

db_name = os.getenv('DB_NAME')
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')

# Inicializando o modelo para gerar embeddings
model = SentenceTransformer('paraphrase-MiniLM-L6-v2')


def get_embeddings(texts):
    return model.encode(texts)


# Conexão com o banco
conn = psycopg2.connect(database=db_name, user=db_user, password=db_password, host=db_host, port=db_port)
cur = conn.cursor()

# Buscar frases do banco de dados
cur.execute("SELECT phrase FROM harassment_phrase")
phrases = [row[0] for row in cur.fetchall()]


@app.get('/detect/similarity/embeddings')
async def detect_harassment_similarity_embeddings(text_input):
    texts_to_compare = phrases + [text_input]
    embeddings = get_embeddings(texts_to_compare)

    # Calcular a similaridade entre o texto de entrada e as frases do banco
    input_embedding = embeddings[-1]
    phrase_embeddings = embeddings[:-1]

    similarities = cosine_similarity([input_embedding], phrase_embeddings)
    similarity_threshold = 0.8  # Novo valor de corte

    detected = any(sim > similarity_threshold for sim in similarities[0])

    return JSONResponse(content={"detected": detected})
