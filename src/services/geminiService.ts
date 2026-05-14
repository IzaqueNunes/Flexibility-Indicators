import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  article_analysis: {
    flexibilidade_por_design: Indicator;
    flexibilidade_por_desvio: Indicator;
    flexibilidade_por_underspecification: Indicator;
    flexibilidade_por_mudanca: Indicator;
  };
}

interface Indicator {
  status: "Encontrado" | "Possível Indício" | "Não Encontrado";
  trecho_exato: string;
  justificativa: string;
}

export async function analyzeArticle(text: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemInstruction = `Você é um especialista acadêmico em Business Process Management (BPM). 
Sua tarefa é analisar o texto de um artigo e identificar indicadores de flexibilidade de processo.

Definições:
1. Flexibilidade por Design: Capacidade de incorporar caminhos de execução alternativos no modelo de processo em tempo de projeto.
2. Flexibilidade por Desvio: Capacidade de uma instância de processo desviar em tempo de execução do caminho sem alterar o modelo.
3. Flexibilidade por Underspecification: Capacidade de executar um modelo de processo incompleto em tempo de execução (uso de placeholders).
4. Flexibilidade por Mudança: Capacidade de modificar um modelo de processo em tempo de execução migrando instâncias para o novo modelo.

Se o texto não declarar explicitamente o tipo mas sugerir fortemente, use 'Possível Indício'. 
Justificativas devem ser em Português.

Retorne estritamente um objeto JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise o seguinte texto acadêmico e identifique os indicadores de flexibilidade solicitados:\n\n${text}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          article_analysis: {
            type: Type.OBJECT,
            properties: {
              flexibilidade_por_design: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["Encontrado", "Possível Indício", "Não Encontrado"] },
                  trecho_exato: { type: Type.STRING },
                  justificativa: { type: Type.STRING }
                },
                required: ["status", "trecho_exato", "justificativa"]
              },
              flexibilidade_por_desvio: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["Encontrado", "Possível Indício", "Não Encontrado"] },
                  trecho_exato: { type: Type.STRING },
                  justificativa: { type: Type.STRING }
                },
                required: ["status", "trecho_exato", "justificativa"]
              },
              flexibilidade_por_underspecification: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["Encontrado", "Possível Indício", "Não Encontrado"] },
                  trecho_exato: { type: Type.STRING },
                  justificativa: { type: Type.STRING }
                },
                required: ["status", "trecho_exato", "justificativa"]
              },
              flexibilidade_por_mudanca: {
                type: Type.OBJECT,
                properties: {
                  status: { type: Type.STRING, enum: ["Encontrado", "Possível Indício", "Não Encontrado"] },
                  trecho_exato: { type: Type.STRING },
                  justificativa: { type: Type.STRING }
                },
                required: ["status", "trecho_exato", "justificativa"]
              }
            },
            required: [
              "flexibilidade_por_design",
              "flexibilidade_por_desvio",
              "flexibilidade_por_underspecification",
              "flexibilidade_por_mudanca"
            ]
          }
        },
        required: ["article_analysis"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Erro ao processar a resposta do modelo AI.");
  }
}
