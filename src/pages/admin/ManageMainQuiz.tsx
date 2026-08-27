import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, BookOpen, CheckCircle2 } from 'lucide-react'
import { adminFetch } from '../../services/adminApi'

import API_BASE_URL from '../../config/api'

interface Option {
  id?: number
  option_text: string
  option_letter: string
  is_correct: number
}

interface Question {
  id: number
  question_text: string
  options: Option[]
}

const SECTIONS = [
  { id: 1, name: 'Soto Medan', range: [1, 10] },
  { id: 2, name: 'Ci Cong Fan', range: [11, 20] },
  { id: 3, name: 'Bika Ambon', range: [21, 30] },
  { id: 4, name: 'Kari Bihun', range: [31, 40] },
  { id: 5, name: 'Bolu Meranti', range: [41, 50] }
]

export default function ManageMainQuiz() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [formData, setFormData] = useState({
    question_text: '',
    options: [
      { option_text: '', option_letter: 'A', is_correct: 0 },
      { option_text: '', option_letter: 'B', is_correct: 0 },
      { option_text: '', option_letter: 'C', is_correct: 0 },
      { option_text: '', option_letter: 'D', is_correct: 0 }
    ]
  })

  useEffect(() => { fetchQuestions() }, [])

  const fetchQuestions = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/main-questions`)
      const data = await res.json()
      if (data.success) setQuestions(data.data)
    } catch (error) { console.error('Error:', error) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingQuestion 
        ? `${API_BASE_URL}/admin/main-questions/${editingQuestion.id}`
        : `${API_BASE_URL}/admin/main-questions`
      const method = editingQuestion ? 'PUT' : 'POST'

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(formData)
      })

      const data = await res.json()
      if (data.success) {
        alert(editingQuestion ? 'Berhasil diupdate!' : 'Berhasil ditambahkan!')
        fetchQuestions()
        setShowForm(false)
        setEditingQuestion(null)
      }
    } catch (error) { alert('Terjadi kesalahan!') }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus?')) return
    try {
      const res = await adminFetch(`${API_BASE_URL}/admin/main-questions/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) { alert('Berhasil dihapus!'); fetchQuestions() }
    } catch (error) { alert('Gagal menghapus!') }
  }

  const handleEdit = (q: Question) => {
    setEditingQuestion(q)
    setFormData({ question_text: q.question_text, options: q.options })
    setShowForm(true)
  }

  const updateOption = (idx: number, field: keyof Option, value: string | number) => {
    const newOptions = [...formData.options]
    newOptions[idx] = { ...newOptions[idx], [field]: value }
    if (field === 'is_correct' && value === 1) {
      newOptions.forEach((opt, i) => { if (i !== idx) newOptions[i].is_correct = 0 })
    }
    setFormData({ ...formData, options: newOptions })
  }

  const getSectionName = (qId: number) => {
    const section = SECTIONS.find(s => qId >= s.range[0] && qId <= s.range[1])
    return section?.name || 'Lainnya'
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Kelola Main Quiz</h1>
                <p className="text-sm text-gray-500">{questions.length} pertanyaan</p>
              </div>
            </div>
            <button onClick={() => { setShowForm(true); setEditingQuestion(null); setFormData({ question_text: '', options: [{ option_text: '', option_letter: 'A', is_correct: 0 }, { option_text: '', option_letter: 'B', is_correct: 0 }, { option_text: '', option_letter: 'C', is_correct: 0 }, { option_text: '', option_letter: 'D', is_correct: 0 }] }) }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition font-medium">
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
                  <textarea value={formData.question_text} onChange={(e) => setFormData({...formData, question_text: e.target.value})} required rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Opsi Jawaban (pilih satu yang benar)</label>
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <button type="button" onClick={() => updateOption(idx, 'is_correct', opt.is_correct ? 0 : 1)} className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${opt.is_correct ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {opt.is_correct ? <CheckCircle2 className="w-5 h-5" /> : opt.option_letter}
                      </button>
                      <input type="text" value={opt.option_text} onChange={(e) => updateOption(idx, 'option_text', e.target.value)} placeholder="Teks opsi..." required className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 outline-none" />
                    </div>
                  ))}
                  <p className="text-xs text-gray-500">💡 Klik huruf opsi untuk menandai jawaban yang benar</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group by Section */}
        {SECTIONS.map(section => {
          const sectionQuestions = questions.filter(q => q.id >= section.range[0] && q.id <= section.range[1])
          if (sectionQuestions.length === 0) return null
          return (
            <div key={section.id} className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {section.name} (Soal {section.range[0]}-{section.range[1]})
              </h2>
              <div className="space-y-3">
                {sectionQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{q.id}</span>
                        <p className="text-gray-700 font-medium">{q.question_text}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-11">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className={`rounded-lg p-3 text-sm ${opt.is_correct ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className="font-bold mr-2">{opt.option_letter}.</span>
                          <span className={opt.is_correct ? 'text-green-700 font-medium' : 'text-gray-600'}>{opt.option_text}</span>
                          {opt.is_correct && <CheckCircle2 className="w-4 h-4 text-green-600 inline ml-2" />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}