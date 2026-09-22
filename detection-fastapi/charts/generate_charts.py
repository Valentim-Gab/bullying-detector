import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

# ===========================================================
# 🔧 1. DADOS
# ===========================================================
total_olid = 1738
olid_ofensivo = 1573
olid_nao_ofensivo = 165

sistema_nao_ofensivo = 56
sistema_ofensivo = 1682
sistema_moderado = 893
sistema_grave = 789

# Distribuição cruzada (real x predição)
real_ofensivo_detectado_nao_ofensivo = 31
real_ofensivo_detectado_ofensivo = 1542
real_ofensivo_detectado_moderado = 792
real_ofensivo_detectado_grave = 749

real_nao_ofensivo_detectado_nao_ofensivo = 25
real_nao_ofensivo_detectado_ofensivo = 140
real_nao_ofensivo_detectado_moderado = 101
real_nao_ofensivo_detectado_grave = 39

# ===========================================================
# 🔹 2. Configuração visual global
# ===========================================================
sns.set(style="whitegrid", palette="muted", font_scale=1.1)
plt.rcParams["figure.figsize"] = (8, 5)
plt.rcParams["axes.titlesize"] = 14
plt.rcParams["axes.labelsize"] = 12

# ===========================================================
# 📊 Gráfico 1: Distribuição geral da OLID (ofensivos vs não ofensivos)
# ===========================================================
plt.figure()
plt.bar(["Ofensivos", "Não ofensivos"], [olid_ofensivo, olid_nao_ofensivo], color=["#d9534f", "#5bc0de"])
plt.title("Distribuição dos casos da OLID")
plt.ylabel("Quantidade de casos")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 2: Classificações detectadas pelo sistema
# ===========================================================
plt.figure()
plt.bar(
    ["Não ofensivo", "Ofensivo", "Ofensa moderada", "Ofensa grave"],
    [sistema_nao_ofensivo, sistema_ofensivo, sistema_moderado, sistema_grave],
    color=["#5bc0de", "#f0ad4e", "#f7e967", "#d9534f"]
)
plt.title("Classificações detectadas pelo sistema")
plt.ylabel("Quantidade")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 3: Comparação entre OLID e sistema (ofensivos detectados)
# ===========================================================
plt.figure()
labels = ["Detectados corretamente", "Perdidos (falsos negativos)"]
valores = [real_ofensivo_detectado_ofensivo, real_ofensivo_detectado_nao_ofensivo]
plt.pie(valores, labels=labels, autopct='%1.1f%%', colors=["#5cb85c", "#d9534f"], startangle=90)
plt.title("Desempenho do sistema em casos ofensivos (OLID)")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 4: Falsos positivos e falsos negativos
# ===========================================================
# "Ofensivo" já representa o total das classificações ofensivas,
# incluindo as categorias moderada e grave.
falsos_positivos = real_nao_ofensivo_detectado_ofensivo
falsos_negativos = real_ofensivo_detectado_nao_ofensivo

plt.figure()
plt.bar(
    ["Falsos positivos", "Falsos negativos"],
    [falsos_positivos, falsos_negativos],
    color=["#f0ad4e", "#d9534f"]
)
plt.title("Erros de classificação do sistema")
plt.ylabel("Quantidade")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 5: Matriz de confusão simplificada (ofensivo vs não ofensivo)
# ===========================================================
matriz = np.array([
    [real_ofensivo_detectado_ofensivo, real_ofensivo_detectado_nao_ofensivo],
    [real_nao_ofensivo_detectado_ofensivo, real_nao_ofensivo_detectado_nao_ofensivo]
])
labels = ["Ofensivo", "Não ofensivo"]

plt.figure()
sns.heatmap(matriz, annot=True, fmt="d", cmap="YlOrRd", xticklabels=labels, yticklabels=labels)
plt.xlabel("Previsto pelo sistema")
plt.ylabel("Dado real (OLID)")
plt.title("Matriz de confusão simplificada")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 6 (corrigido): Proporção de severidade entre ofensas detectadas
# ===========================================================
plt.figure()
valores = [sistema_moderado, sistema_grave]
labels = ["Ofensa moderada", "Ofensa grave"]

plt.pie(valores, labels=labels, autopct="%1.1f%%", colors=["#f9c74f", "#f94144"], startangle=90)
plt.title("Distribuição de severidade das ofensas detectadas")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 7: Percentual de acerto do sistema
# ===========================================================
corretos = real_ofensivo_detectado_ofensivo + real_nao_ofensivo_detectado_nao_ofensivo
total = olid_ofensivo + olid_nao_ofensivo
percentual_acerto = (corretos / total) * 100 if total > 0 else 0

plt.figure()
plt.bar(["Acerto (%)"], [percentual_acerto], color="#5cb85c")
plt.ylim(0, 100)
plt.title(f"Taxa de acerto global do sistema ({percentual_acerto:.2f}%)")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 8: Resumo geral de desempenho
# ===========================================================
plt.figure()
categorias = ["Corretos", "Falsos positivos", "Falsos negativos"]
valores = [corretos, falsos_positivos, falsos_negativos]
plt.bar(categorias, valores, color=["#5cb85c", "#f0ad4e", "#d9534f"])
plt.title("Resumo geral de desempenho do sistema")
plt.ylabel("Quantidade de casos")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 9: Métricas de desempenho
# ===========================================================
# Considerando a classificação binária:
# Ofensivo = ofensivo, moderado ou grave
# Não ofensivo = não ofensivo

TP = real_ofensivo_detectado_ofensivo
FP = real_nao_ofensivo_detectado_ofensivo
FN = real_ofensivo_detectado_nao_ofensivo
TN = real_nao_ofensivo_detectado_nao_ofensivo

precisao = TP / (TP + FP) if (TP + FP) > 0 else 0
recall = TP / (TP + FN) if (TP + FN) > 0 else 0
f1_score = (
    2 * precisao * recall / (precisao + recall)
    if (precisao + recall) > 0
    else 0
)
accuracy = (TP + TN) / (TP + TN + FP + FN)

print(f"Precisão: {precisao:.3f}")
print(f"Recall: {recall:.3f}")
print(f"F1-score: {f1_score:.3f}")
print(f"Accuracy: {accuracy:.3f}")

plt.figure()
plt.bar(
    ["Precisão", "Recall", "F1-score", "Accuracy"],
    [precisao, recall, f1_score, accuracy],
    color=["#43aa8b", "#f9c74f", "#f94144", "#577590"]
)
plt.ylim(0, 1)
plt.title("Métricas de desempenho do sistema (OLID)")
plt.ylabel("Proporção")
plt.tight_layout()
plt.show()