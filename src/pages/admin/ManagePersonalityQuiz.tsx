import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Brain } from 'lucide-react'
import { adminFetch } from '../../services/adminApi'

import API_BASE_URL from '../../config/api'

interface Option {
  id?: number
  option_text: string
  option_letter: string
  food_target: string
}

interface Question {
  id: number
  question_text: string
  options: Option[]
}

export default function ManagePersonalityQuiz() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    question_text: '',
    options: [
      { option_text: '', option_letter: 'A', food_target: 'KB' },
      { option_text: '', option_letter: 'B', food_target: 'SM' },
      { option_text: '', option_letter: 'C', food_target: 'BM' },
      { option_text: '', option_letter: 'D', food_target: 'BA' },
      { option_text: '', option_letter: 'E', food_target: 'CF' }
    ]
  })

  useEffect(() => { fetchQuestions() }, [])

  const fetchQuestions = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/personality-questions`)
      const data = await res.json()
      if (data.success) setQuestions(data.data)
    } catch (error) {
      console.error('Error:', error)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingQuestion 
        ? `${API_BASE_URL}/admin/personality-questions/${editingQuestion.id}`
        : `${API_BASE_URL}/admin/personality-questions`
      const method = editingQuestion ? 'PUT' : 'POST'

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        alert(editingQuestion ? 'Pertanyaan berhasil diupdate!' : 'Pertanyaan berhasil ditambahkan!')
        fetchQuestions()
        setShowForm(false)
        setEditingQuestion(null)
      }
    } catch (error) { alert('Terjadi kesalahan!') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus pertanyaan ini?')) return
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/personality-questions/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { alert('Berhasil dihapus!'); fetchQuestions() }
    } catch (error) { alert('Gagal menghapus!') }
  }

  const handleEdit = (q: Question) => {
    setEditingQuestion(q)
    setFormData({ question_text: q.question_text, options: q.options })
    setShowForm(true)
  }

  const updateOption = (idx: number, field: keyof Option, value: string) => {
    const newOptions = [...formData.options]
    newOptions[idx] = { ...newOptions[idx], [field]: value }
    setFormData({ ...formData, options: newOptions })
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Kelola Personality Quiz</h1>
                <p className="text-sm text-gray-500">{questions.length} pertanyaan</p>
              </div>
            </div>
            <button onClick={() => { setShowForm(true); setEditingQuestion(null); setFormData({ question_text: '', options: [{ option_text: '', option_letter: 'A', food_target: 'KB' }, { option_text: '', option_letter: 'B', food_target: 'SM' }, { option_text: '', option_letter: 'C', food_target: 'BM' }, { option_text: '', option_letter: 'D', food_target: 'BA' }, { option_text: '', option_letter: 'E', food_target: 'CF' }] }) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-medium">
              <Plus className="w-4 h-4" /> Tambah Pertanyaan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pertanyaan</label>
                  <textarea value={formData.question_text} onChange={(e) => setFormData({...formData, question_text: e.target.value})} required rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Opsi Jawaban</label>
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <span className="w-8 h-10 flex items-center justify-center bg-purple-100 text-purple-700 rounded-lg font-bold">{opt.option_letter}</span>
                      <input type="text" value={opt.option_text} onChange={(e) => updateOption(idx, 'option_text', e.target.value)} placeholder="Teks opsi..." required className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-purple-500 outline-none" />
                      <select value={opt.food_target} onChange={(e) => updateOption(idx, 'food_target', e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 focus:border-purple-500 outline-none">
                        <option value="KB">KB - Kari Bihun</option>
                        <option value="SM">SM - Soto Medan</option>
                        <option value="BM">BM - Bolu Meranti</option>
                        <option value="BA">BA - Bika Ambon</option>
                        <option value="CF">CF - Cicongfan</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Soal #{q.id}</h3>
                    <p className="text-gray-700">{q.question_text}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 ml-13">
                {q.options.map((opt, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                    <div className="font-bold text-purple-600 mb-1">{opt.option_letter}. {opt.food_target}</div>
                    <p className="text-gray-600 text-xs line-clamp-2">{opt.option_text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}