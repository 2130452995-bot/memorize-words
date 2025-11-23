import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, DictionaryResult } from "../types";

// Initialize GenAI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation (Dictionary Lookup) ---

export const lookupWord = async (
  term: string,
  sourceLang: Language,
  targetLang: Language
): Promise<DictionaryResult> => {
  
  const systemInstruction = `You are a fun, witty, and culturally savvy language tutor. 
  The user speaks ${sourceLang} and is learning ${targetLang}.
  
  The user has entered: "${term}".
  
  TASK:
  1. Detect if "${term}" is in ${sourceLang} or ${targetLang}.
  2. If it is in ${sourceLang}, translate it to the most natural/common word or phrase in ${targetLang}. Use that translation as the main "term".
  3. If it is already in ${targetLang}, use it as the main "term".
  4. Generate a dictionary entry for this ${targetLang} term.
  
  Rules:
  1. Definition: Natural language explanation in ${sourceLang}.
  2. Examples: Provide 2 distinct example sentences in ${targetLang} with ${sourceLang} translations.
  3. Usage Context: This is the "Vibe Check". Be conversational, like a friend. Explain cultural context, when to use it (and when not to), the tone (casual/formal), and list 2-3 synonyms or easily confused words with brief distincts. AVOID textbook jargon. Be concise.
  
  Return strict JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Explain the concept.`,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: `The word or phrase in ${targetLang}` },
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                target: { type: Type.STRING, description: `Sentence in ${targetLang}` },
                native: { type: Type.STRING, description: `Translation in ${sourceLang}` },
              },
            },
          },
          usageContext: {
            type: Type.OBJECT,
            properties: {
              tone: { type: Type.STRING },
              culture: { type: Type.STRING },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              nuance: { type: Type.STRING },
            },
          },
        },
        required: ["term", "definition", "examples", "usageContext"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as DictionaryResult;
};

// --- Image Generation ---

export const generateConceptImage = async (term: string, targetLang: Language): Promise<string> => {
  // Using Flash Image for speed, or Pro Image for quality. Given instructions, Flash Image is standard for general use.
  const prompt = `A simple, vibrant, fun, flat-design style vector illustration representing the concept of "${term}" in the context of the ${targetLang} language/culture. Bright colors, white background. Minimalist.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: prompt,
    // Removed config with responseMimeType as it causes 400 error for this model.
    // The model returns image data in parts directly.
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  return "https://picsum.photos/400/400"; // Fallback
};

// --- Story Generation ---

export const generateStory = async (words: string[], targetLang: Language, sourceLang: Language): Promise<string> => {
  const prompt = `Create a short, funny, and coherent story in ${targetLang} (with ${sourceLang} translation in parentheses after each sentence) using the following words: ${words.join(', ')}. Keep it under 200 words.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  
  return response.text || "Could not generate story.";
};

// --- Audio (TTS) ---

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

export const playTTS = async (text: string, lang: Language) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is a good general voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) return;

    const ctx = getAudioContext();
    if(ctx.state === 'suspended') await ctx.resume();

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      ctx,
      24000,
      1,
    );

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.start();
    
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

// --- Chat ---

export const createChat = (term: string, sourceLang: Language, targetLang: Language) => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a helpful language assistant. The user is asking about the word "${term}". The user speaks ${sourceLang} and is learning ${targetLang}. Keep answers concise, helpful, and friendly.`,
        }
    });
}