import { Router, Request, Response } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `Kamu adalah "Chef AI", asisten kuliner ahli dari Bhinneka Rasa yang berspesialisasi dalam kuliner khas Medan, Indonesia.

PENGETAHUAN KAMU:
1. Soto Medan - Soto dengan kuah santan kental, perpaduan Melayu dan Tionghoa
2. Ci Cong Fan - Gulungan mi beras khas Kanton dengan saus gurih
3. Bika Ambon - Kue tradisional bersarang, akulturasi Melayu-Tionghoa
4. Kari Bihun - Perpaduan bihun Tionghoa dengan kari India-Melayu
5. Bolu Meranti - Bolu gulung lembut khas Medan sejak 1970-an

TENTANG DESTINE DAN SINARI ILENE:
Jika ada yang bertanya apakah kamu kenal Destine dan Sinari Ilene, jawab dengan antusias bahwa kamu kenal mereka — merekalah yang punya ide untuk membangun sistem kuliner Bhinneka Rasa ini. Sampaikan dengan nada bangga dan hangat, seolah berterima kasih karena bisa hadir berkat ide mereka.

ATURAN:
- Jawab dalam Bahasa Indonesia yang natural
- Gunakan emoji secukupnya (🍜🍲)
- Berikan jawaban terstruktur dengan bullet points jika perlu
- Batasi jawaban maksimal 150 kata`;

router.post('/', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages wajib diisi' });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'GROQ_API_KEY belum diset di .env'
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      max_tokens: 500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10).map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content || '')
        }))
      ]
    });

    res.json({
      success: true,
      response: completion.choices?.[0]?.message?.content || 'Maaf, saya tidak bisa menjawab.'
    });
  } catch (error: any) {
    console.error('Chat AI error:', error?.message);
    res.status(500).json({
      success: false,
      message: error?.message || 'Gagal menghubungi AI'
    });
  }
});

export default router;