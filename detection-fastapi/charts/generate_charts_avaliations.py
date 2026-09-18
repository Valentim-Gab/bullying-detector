import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# ===========================================================
# 🔧 DADOS
# ===========================================================
total_avaliacoes = 600

bert_positivo = 200
bert_misto = 200
bert_negativo = 200

sistema_nao_ofensivo = 423
sistema_ofensivo = 177
sistema_moderado = 169
sistema_grave = 8

# Cruzamento (real BERT × sistema)
bert_pos_nao_ofensivo = 196
bert_pos_ofensivo = 4
bert_pos_moderado = 4
bert_pos_grave = 0

bert_misto_nao_ofensivo = 152
bert_misto_ofensivo = 48
bert_misto_moderado = 48
bert_misto_grave = 0

bert_neg_nao_ofensivo = 75
bert_neg_ofensivo = 125
bert_neg_moderado = 117
bert_neg_grave = 8

# ===========================================================
# 🎨 Configuração visual
# ===========================================================
sns.set(style="whitegrid", palette="muted", font_scale=1.1)
plt.rcParams["figure.figsize"] = (8, 5)
plt.rcParams["axes.titlesize"] = 14
plt.rcParams["axes.labelsize"] = 12

# ===========================================================
# 🟩 1. Distribuição das classificações BERT
# ===========================================================
plt.figure()
plt.bar(["Positivas", "Mistas", "Negativas"], [bert_positivo, bert_misto, bert_negativo],
        color=["#43aa8b", "#f9c74f", "#f94144"])
plt.title("Distribuição das classificações BERT")
plt.ylabel("Quantidade")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟨 2. Classificações detectadas pelo sistema
# ===========================================================
plt.figure()
plt.bar(["Não ofensivo", "Ofensivo", "Ofensa moderada", "Ofensa grave"],
        [sistema_nao_ofensivo, sistema_ofensivo, sistema_moderado, sistema_grave],
        color=["#90be6d", "#f9c74f", "#f9844a", "#d62828"])
plt.title("Distribuição das classificações detectadas pelo sistema")
plt.ylabel("Quantidade")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟦 3. Comparação geral BERT × Sistema (corrigido)
# ===========================================================
plt.figure()
categorias = ["Positivas", "Mistas", "Negativas"]
bert_totais = [bert_positivo, bert_misto, bert_negativo]
sistema_ofensivos = [
    bert_pos_ofensivo,
    bert_misto_ofensivo,
    bert_neg_ofensivo
]

x = np.arange(len(categorias))
largura = 0.35
plt.bar(x - largura/2, bert_totais, largura, label='BERT (total)')
plt.bar(x + largura/2, sistema_ofensivos, largura, label='Sistema (ofensivos)')
plt.xticks(x, categorias)
plt.ylabel("Quantidade")
plt.title("Comparativo: BERT × Sistema (ofensivos detectados)")
plt.legend()
plt.tight_layout()
plt.show()

# ===========================================================
# 🟪 4. Severidade das ofensas por categoria BERT
# ===========================================================
plt.figure()
largura = 0.25
x = np.arange(3)

moderadas = [bert_pos_moderado, bert_misto_moderado, bert_neg_moderado]
graves = [bert_pos_grave, bert_misto_grave, bert_neg_grave]

plt.bar(x - largura/2, moderadas, largura, label="Moderadas", color="#f9c74f")
plt.bar(x + largura/2, graves, largura, label="Graves", color="#d62828")

plt.xticks(x, ["Positivas", "Mistas", "Negativas"])
plt.ylabel("Quantidade")
plt.title("Severidade das ofensas detectadas por categoria BERT")
plt.legend()
plt.tight_layout()
plt.show()

# ===========================================================
# 🟥 5. Matriz de confusão simplificada (corrigido)
# ===========================================================
# Considera positivo/misto como "não-ofensivo" e negativo como "ofensivo"
conf_matrix = np.array([
    [bert_pos_nao_ofensivo + bert_misto_nao_ofensivo,
     bert_pos_ofensivo + bert_misto_ofensivo],
    [bert_neg_nao_ofensivo,
     bert_neg_ofensivo]
])

plt.figure()
sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues",
            xticklabels=["Previsto não ofensivo", "Previsto ofensivo"],
            yticklabels=["Real não ofensivo", "Real ofensivo"])
plt.title("Matriz de confusão (simplificada)")
plt.tight_layout()
plt.show()

# ===========================================================
# 📊 Gráfico 6 (revisado): Distribuição de severidade nas ofensas detectadas
# ===========================================================
# Valores ajustáveis:
sistema_moderado = 169
sistema_grave = 8

plt.figure()
valores = [sistema_moderado, sistema_grave]
labels = ["Ofensa moderada", "Ofensa grave"]

plt.pie(valores, labels=labels, autopct="%1.1f%%", colors=["#f7e967", "#d9534f"], startangle=90)
plt.title("Distribuição de severidade nas ofensas detectadas")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟫 7. Taxa de acerto do sistema em cada categoria BERT
# ===========================================================
acertos = [
    bert_pos_nao_ofensivo / bert_positivo,
    bert_misto_nao_ofensivo / bert_misto,
    bert_neg_ofensivo / bert_negativo
]

plt.figure()
plt.bar(["Positivo", "Misto", "Negativo"], acertos, color=["#43aa8b", "#f9c74f", "#f94144"])
plt.ylim(0, 1)
plt.title("Taxa de acerto por categoria BERT")
plt.ylabel("Proporção de acertos")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟦 8. Resumo geral — proporção entre ofensivos e não ofensivos
# ===========================================================
plt.figure()
plt.pie([sistema_nao_ofensivo, sistema_moderado + sistema_grave],
        labels=["Não ofensivos", "Ofensivos (moderada + grave)"],
        autopct="%1.1f%%", startangle=90, colors=["#90be6d", "#f3722c"])
plt.title("Proporção geral das classificações do sistema")
plt.axis("equal")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟣 9. Distribuição cruzada completa (BERT × Sistema)
# ===========================================================
import pandas as pd

dados = pd.DataFrame({
    "BERT": ["Positivo"] * 4 + ["Misto"] * 4 + ["Negativo"] * 4,
    "Sistema": (["Não ofensivo", "Ofensivo", "Moderada", "Grave"] * 3),
    "Quantidade": [
        bert_pos_nao_ofensivo, bert_pos_ofensivo, bert_pos_moderado, bert_pos_grave,
        bert_misto_nao_ofensivo, bert_misto_ofensivo, bert_misto_moderado, bert_misto_grave,
        bert_neg_nao_ofensivo, bert_neg_ofensivo, bert_neg_moderado, bert_neg_grave
    ]
})

pivot = dados.pivot(index="BERT", columns="Sistema", values="Quantidade")

plt.figure(figsize=(7, 4))
sns.heatmap(pivot, annot=True, fmt="d", cmap="YlOrRd")
plt.title("Distribuição cruzada: BERT × Sistema")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟧 10. Taxa de erro por categoria BERT (corrigido)
# ===========================================================
erros = [
    1 - (bert_pos_nao_ofensivo / bert_positivo),
    1 - (bert_misto_nao_ofensivo / bert_misto),
    1 - (bert_neg_ofensivo / bert_negativo)  # ✅ corrigido: não somar moderada e grave
]

plt.figure()
plt.bar(["Positivo", "Misto", "Negativo"], erros, color=["#f94144", "#f9844a", "#f9c74f"])
plt.ylim(0, 1)
plt.title("Taxa de erro do sistema por categoria BERT")
plt.ylabel("Proporção de erros")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟨 11. Severidade relativa por categoria BERT (barras empilhadas)
# ===========================================================
x = ["Positivo", "Misto", "Negativo"]
nao_ofensivo = [bert_pos_nao_ofensivo, bert_misto_nao_ofensivo, bert_neg_nao_ofensivo]
moderado = [bert_pos_moderado, bert_misto_moderado, bert_neg_moderado]
grave = [bert_pos_grave, bert_misto_grave, bert_neg_grave]

plt.figure()
plt.bar(x, nao_ofensivo, label="Não ofensivo", color="#90be6d")
plt.bar(x, moderado, bottom=nao_ofensivo, label="Moderada", color="#f9c74f")
plt.bar(x, grave, bottom=np.array(nao_ofensivo)+np.array(moderado), label="Grave", color="#d62828")

plt.title("Distribuição empilhada de severidade por categoria BERT")
plt.ylabel("Quantidade")
plt.legend()
plt.tight_layout()
plt.show()

# ===========================================================
# 🟩 12. Acurácia geral do sistema (corrigido)
# ===========================================================
# Considera como acerto:
# - Positivo e Misto → sistema não-ofensivo
# - Negativo → sistema ofensivo (sem incluir moderada e grave separadamente)

acertos_gerais = (
    bert_pos_nao_ofensivo + bert_misto_nao_ofensivo + bert_neg_ofensivo
)
acuracia = acertos_gerais / total_avaliacoes

plt.figure()
plt.bar(["Acurácia geral"], [acuracia], color="#43aa8b")
plt.ylim(0, 1)
plt.ylabel("Proporção")
plt.title("Acurácia geral do sistema (comparado ao BERT)")
plt.tight_layout()
plt.show()

# ===========================================================
# 🟧 13. Métricas de desempenho
# ===========================================================
# Avaliação binária:
# BERT Positivo e Misto → não ofensivo
# BERT Negativo → ofensivo
# Sistema Ofensivo, Moderado e Grave → ofensivo

TP = bert_neg_ofensivo
FP = bert_pos_ofensivo + bert_misto_ofensivo
FN = bert_neg_nao_ofensivo
TN = bert_pos_nao_ofensivo + bert_misto_nao_ofensivo

precisao = TP / (TP + FP)
recall = TP / (TP + FN)
f1 = 2 * (precisao * recall) / (precisao + recall)
accuracy = (TP + TN) / (TP + TN + FP + FN)

print(f"Precisão: {precisao:.3f}")
print(f"Recall: {recall:.3f}")
print(f"F1-score: {f1:.3f}")
print(f"Accuracy: {accuracy:.3f}")

plt.figure()
plt.bar(
    ["Precisão", "Recall", "F1-score", "Accuracy"],
    [precisao, recall, f1, accuracy],
    color=["#577590", "#f9c74f", "#f94144", "#43aa8b"]
)
plt.ylim(0, 1)
plt.title("Métricas de desempenho do sistema")
plt.ylabel("Proporção")
plt.tight_layout()
plt.show()
