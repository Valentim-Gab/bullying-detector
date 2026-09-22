from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.responses import JSONResponse
from fastapi import Query
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
cur.execute("SELECT phrase FROM bullying_phrase WHERE is_bullying")
phrases = [row[0] for row in cur.fetchall()]


def similarity_to_classification(similarity):
    if similarity < 0.7:
        # 0.0 -> 0.0
        # 0.7 -> 0.9
        return (similarity / 0.7) * 0.9

    if similarity < 0.8:
        # 0.7 -> 1.0
        # 0.8 -> 2.9
        return 1.0 + ((similarity - 0.7) / 0.1) * 1.9

    # 0.8 -> 3.0
    # 1.0 -> 5.0
    return 3.0 + ((similarity - 0.8) / 0.2) * 2.0


@app.get('/detect/similarity/embeddings')
async def detect_harassment_similarity_embeddings(
    text_input: str = Query(...)
):
    texts_to_compare = phrases + [text_input]
    embeddings = get_embeddings(texts_to_compare)

    input_embedding = embeddings[-1]
    phrase_embeddings = embeddings[:-1]


    similarities = cosine_similarity(
        [input_embedding],
        phrase_embeddings,
    )

    max_similarity = float(max(similarities[0]))
    classification = similarity_to_classification(max_similarity)

    detected = max_similarity >= 0.7

    return JSONResponse(
        content={
            'detected': detected,
            'similarity': round(max_similarity, 4),
            'classification': round(classification, 2),
        }
    )