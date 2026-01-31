import { GoogleGenAI } from "@google/genai";
import { Book } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getBookRecommendations = async (
  query: string,
  inventory: Book[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Desculpe, não consegui conectar ao meu cérebro digital no momento.";

  // Simplify inventory to save tokens, only sending necessary fields
  const simplifiedInventory = inventory.map(b => ({
    id: b.id,
    title: b.title,
    author: b.author,
    category: b.category,
    description: b.description
  }));

  const systemInstruction = `
    Você é a "Libris", uma assistente virtual especializada e amigável da livraria "Libris Book".
    
    Seu objetivo é ajudar clientes a encontrar livros no nosso inventário.
    Use o inventário fornecido abaixo para basear suas recomendações.
    
    Regras:
    1. Se o usuário pedir uma recomendação, sugira até 3 livros do inventário que melhor se encaixem.
    2. Sempre cite o título exato do livro.
    3. Seja breve, persuasivo e cordial.
    4. Se o usuário perguntar algo fora do contexto de livros/livraria, traga gentilmente de volta para o tema.
    5. Formate a resposta usando Markdown para negrito nos títulos.
    
    Inventário Atual (JSON):
    ${JSON.stringify(simplifiedInventory)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não encontrei uma resposta adequada.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Tive um problema ao consultar as estantes. Tente novamente em instantes.";
  }
};