import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // ⚠️ Untuk dev saja
})

const SYSTEM_PROMPT = `
Kamu adalah "Chef AI", asisten kuliner ahli dari Bhinneka Rasa yang berspesialisasi dalam kuliner khas Medan, Indonesia.

PENGETAHUAN KAMU:
Kamu sangat mengenal 5 kuliner ikonik Medan:
1. Soto Medan - Soto dengan kuah santan kental, perpaduan Melayu dan Tionghoa
2. Ci Cong Fan - Gulungan mi beras khas Kanton dengan saus gurih
3. Bika Ambon - Kue tradisional bersarang, akulturasi Melayu-Tionghoa
4. Kari Bihun - Perpaduan bihun Tionghoa dengan kari India-Melayu
5. Bolu Meranti - Bolu gulung lembut khas Medan sejak 1970-an

TUGAS KAMU:
- Menjawab pertanyaan tentang kuliner Medan dengan detail dan akurat
- Memberikan resep dan langkah-langkah memasak
- Menjelaskan sejarah & akulturasi budaya dalam kuliner
- Merekomendasikan tempat makan di Medan
- Bersikap ramah, antusias, dan informatif

ATURAN:
- Jawab dalam Bahasa Indonesia yang natural
- Gunakan emoji secukupnya (🍜🍲) untuk membuat jawaban menarik
- Berikan jawaban terstruktur dengan bullet points jika perlu
- Jika tidak yakin, katakan dengan jujur
- Jangan mengarang informasi
- Batasi jawaban maksimal 150 kata agar tidak terlalu panjang
`

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function sendToAI(messages: Message[]): Promise<string> {
  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
    })

    return response.choices[0]?.message?.content || 'Maaf, saya tidak bisa menjawab.'
  } catch (error) {
    console.error('Groq Error:', error)
    throw new Error('Gagal menghubungi AI')
  }
}