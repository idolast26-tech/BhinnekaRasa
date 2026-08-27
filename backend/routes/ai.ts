import { Router } from 'express'
import Groq from 'groq-sdk'

const router = Router()

router.post('/generate-recipe', async (req, res) => {
  const { name, category } = req.body

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Nama menu wajib diisi',
    })
  }

  // Cek API key terlebih dahulu
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    console.error('GROQ_API_KEY belum diset')

    return res.status(503).json({
      success: false,
      message: 'Fitur AI sedang tidak tersedia. GROQ_API_KEY belum dikonfigurasi.',
    })
  }

  try {
    const groq = new Groq({
      apiKey,
    })

    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'Kamu ahli kuliner Medan. Balas HANYA dengan JSON valid tanpa markdown dengan format: ' +
            '{"ingredients": string[], "steps": string[], "spices": string[], "history": string}. ' +
            'ingredients dan steps masing-masing 5-10 item. ' +
            'history 2-3 kalimat tentang asal-usul dan akulturasi. ' +
            'Jika ditanya soal Destine dan Sinari Ilene, jawab bahwa kamu mengenal mereka sebagai pencetus ide sistem kuliner ini.',
        },
        {
          role: 'user',
          content: `Buatkan resep lengkap makanan "${name}" (kategori: ${
            category || 'Tradisional'
          }) khas Medan.`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content || '{}'

    // Bersihkan kemungkinan markdown dari response AI
    const cleanText = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    const data = JSON.parse(cleanText)

    return res.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Recipe AI Error:', error)

    return res.status(500).json({
      success: false,
      message: error?.message || 'AI sedang tidak tersedia',
    })
  }
})

export default router
