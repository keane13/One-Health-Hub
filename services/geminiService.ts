// Fix: Provides the full content for services/geminiService.ts.
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, PredictionResult, Disease } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Gets a response from the chatbot model based on the conversation history, a new message, and a knowledge base context.
 * @param history The previous messages in the conversation.
 * @param newMessage The new message from the user.
 * @param context A string containing the content from user-uploaded documents for RAG.
 * @returns A string containing the model's response.
 */
export const getChatbotResponse = async (history: ChatMessage[], newMessage: string, context: string): Promise<string> => {
    const model = 'gemini-2.5-flash';

    const chatHistory = history.slice(1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));
    
    const messageWithContext = context 
        ? `Gunakan informasi dalam konteks di bawah ini untuk menjawab pertanyaan saya. Konteks ini dapat mencakup konten dari dokumen yang diunggah dan/atau daftar tautan referensi. Prioritaskan konten dokumen, tetapi gunakan juga tautan untuk informasi tambahan jika relevan. Jika jawabannya tidak ada di dalam sumber yang diberikan, katakan bahwa Anda tidak dapat menemukan informasinya.\n\n---\nKonteks:\n${context}\n---\n\nPertanyaan saya: ${newMessage}`
        : newMessage;


    const chat = ai.chats.create({
        model,
        history: chatHistory,
        config: {
            systemInstruction: 'You are a helpful AI assistant for the One Health Platform. Your name is One AI. You specialize in topics related to human, animal, and environmental health, particularly zoonotic diseases. You must answer in Bahasa Indonesia. Be friendly and informative.',
        },
    });

    const response = await chat.sendMessage({ message: messageWithContext });
    return response.text;
};

/**
 * Analyzes disease data from a CSV file and generates a prediction and insights.
 * @param disease The disease being analyzed.
 * @param csvData The historical case data in CSV format.
 * @param interventions A dictionary of public health interventions and their effectiveness percentage.
 * @param modelName The machine learning model methodology to apply for the analysis.
 * @param predictionPeriod The number of months to predict into the future.
 * @returns A PredictionResult object with insights, risk level, recommendations, and chart data.
 */
export const getPrediction = async (disease: Disease, csvData: string, interventions: {[key: string]: number}, modelName: string, predictionPeriod: number): Promise<PredictionResult> => {
    const model = 'gemini-2.5-pro'; // Use a more powerful model for data analysis

    const interventionPrompt = Object.keys(interventions).length > 0
        ? `
      Selanjutnya, pertimbangkan potensi dampak dari intervensi kesehatan masyarakat berikut yang sedang diterapkan pada tingkat efektivitas/implementasi yang ditentukan:
      ${Object.entries(interventions).map(([name, effectiveness]) => `- ${name} (Efektivitas diperkirakan ${effectiveness}%)`).join('\n')}
      Analisis, penilaian risiko, rekomendasi, dan prediksi grafik Anda harus mencerminkan bagaimana intervensi ini, pada tingkat yang ditentukan, dapat mengubah lintasan penyakit dibandingkan dengan data historis saja. Efektivitas yang lebih tinggi harus mengarah pada pengurangan kasus yang lebih signifikan dalam prediksi Anda.
      `
        : '';
    
    const modelInstructionPrompt = `
      Untuk analisis Anda, terapkan metodologi model **${modelName}**. Wawasan dan prediksi Anda harus konsisten dengan prinsip-prinsip model ini. Sebagai contoh:
      - Jika **Random Forest**, fokus pada identifikasi faktor-faktor prediktif utama dari data dan bagaimana kumpulan pohon keputusan akan menginterpretasikan tren. Prediksi harus mencerminkan agregasi dari beberapa jalur prediktif.
      - Jika **Regresi Linier**, fokus pada identifikasi tren linier yang jelas, musiman, dan kemiringan pertumbuhan kasus. Prediksi harus merupakan proyeksi berdasarkan hubungan linier ini.
      - Jika **LSTM (Long Short-Term Memory)**, fokus pada penangkapan dependensi jangka panjang dan pola sekuensial kompleks dalam data deret waktu yang mungkin terlewatkan oleh model yang lebih sederhana.
      - Jika **Temporal Fusion Transformer (TFT)**, lakukan peramalan multi-cakrawala yang menginterpretasikan berbagai fitur dari data historis, mengidentifikasi tren jangka panjang dan perubahan mendadak, mirip dengan bagaimana model transformer akan menimbang berbagai bagian dari urutan input.
    `;

    const prompt = `
      Analisis data CSV berikut untuk ${disease.name}. Data ini mewakili kasus yang dilaporkan dari waktu ke waktu.
      PENTING: Semua teks dalam respons JSON Anda (wawasan, rekomendasi) HARUS dalam Bahasa Indonesia.
      
      Data CSV:
      \`\`\`csv
      ${csvData}
      \`\`\`
      
      **Model Analisis:** Anda harus melakukan analisis menggunakan prinsip-prinsip model **${modelName}**.
      ${modelInstructionPrompt}

      ${interventionPrompt}
      
      Berdasarkan data, model analisis yang Anda pilih, dan setiap intervensi yang ditentukan, berikan analisis dan prediksi terperinci dalam format JSON. Ikuti instruksi ini dengan cermat:
      1.  **insights**: Tulis paragraf singkat (2-3 kalimat) dalam Bahasa Indonesia yang merangkum tren dan pola utama menurut metodologi ${modelName}. Jika intervensi diberikan, sebutkan kemungkinan dampaknya.
      2.  **riskLevel**: Nilai tingkat risiko saat ini untuk wabah. Kategorikan sebagai 'Low', 'Medium', 'High', atau 'Very High'.
      3.  **recommendations**: Berikan daftar berpoin berisi 3-5 rekomendasi yang dapat ditindaklanjuti dalam Bahasa Indonesia.
      4.  **chartData**: Proyeksikan jumlah kasus untuk ${predictionPeriod} bulan ke depan. Nilai 'predicted' harus menjadi proyeksi Anda. Untuk periode mendatang ini, nilai 'cases' harus dihilangkan. Sertakan 5 titik data aktual terakhir sebelum prediksi Anda.
      
      Anda harus mengembalikan respons dalam format JSON yang valid sesuai dengan skema yang disediakan.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            insights: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Very High'] },
            recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            chartData: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        cases: { type: Type.NUMBER },
                        predicted: { type: Type.NUMBER }
                    },
                    required: ['name']
                }
            }
        },
        required: ['insights', 'riskLevel', 'recommendations', 'chartData']
    };

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
        }
    });

    const jsonString = response.text.trim();
    try {
        const result = JSON.parse(jsonString);
        // Ensure that omitted values for charting are treated as null.
        result.chartData = result.chartData.map((d: any) => ({
            name: d.name,
            cases: d.cases !== undefined ? d.cases : null,
            predicted: d.predicted !== undefined ? d.predicted : null,
        }));
        return result as PredictionResult;
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", e);
        console.error("Raw response:", jsonString);
        throw new Error("The AI returned an invalid response. Please try again.");
    }
};