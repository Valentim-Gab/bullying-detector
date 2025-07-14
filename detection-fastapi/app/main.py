from fastapi import FastAPI

app = FastAPI()

from .similarity.controller import *
from .mistral.controller import *
from .cohere.controller import *
from .openrouter.controller import *
from .transcribe.controller import *
