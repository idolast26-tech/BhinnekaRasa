export interface QuizOption {
  text: string;
  correct?: boolean;
  food?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  questions: QuizQuestion[];
}

export const quizzes: Quiz[] = [
  {
    id: 1,
    title: "Personality Kuis",
    description: "Temukan makanan yang sesuai dengan kepribadianmu",
    icon: "",
    color: "from-purple-500 via-pink-500 to-rose-500",
    questions: [
      {
        id: 1,
        question: "Apa aktivitas favoritmu di akhir pekan?",
        options: [
          { text: "Jalan-jalan kuliner", food: "Kebab Medan" },
          { text: "Masak di rumah", food: "Nasi Kuning" },
          { text: "Nonton film", food: "Bika Ambon" },
          { text: "Olahraga", food: "Mie Gomak" }
        ]
      },
      {
        id: 2,
        question: "Bagaimana caramu menghadapi masalah?",
        options: [
          { text: "Langsung bertindak", food: "Kebab Medan" },
          { text: "Berpikir matang", food: "Nasi Kuning" },
          { text: "Minta bantuan", food: "Soto Medan" },
          { text: "Santai saja", food: "Bika Ambon" }
        ]
      },
      {
        id: 3,
        question: "Pilih suasana makan yang kamu sukai!",
        options: [
          { text: "Restoran mewah", food: "Kebab Medan" },
          { text: "Kaki lima", food: "Mie Gomak" },
          { text: "Rumah", food: "Nasi Kuning" },
          { text: "Kafe cozy", food: "Bika Ambon" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Main Kuis",
    description: "Uji pengetahuanmu tentang kuliner Medan",
    icon: "🎯",
    color: "from-amber-400 via-orange-500 to-amber-600",
    questions: [
      {
        id: 1,
        question: "Apa bahan utama Bika Ambon?",
        options: [
          { text: "Tepung terigu", correct: false },
          { text: "Tepung tapioka", correct: true },
          { text: "Tepung beras", correct: false },
          { text: "Tepung ketan", correct: false }
        ]
      },
      {
        id: 2,
        question: "Mie Gomak berasal dari suku apa?",
        options: [
          { text: "Melayu", correct: false },
          { text: "Tionghoa", correct: false },
          { text: "Batak", correct: true },
          { text: "Jawa", correct: false }
        ]
      },
      {
        id: 3,
        question: "Bumbu khas dalam Mie Gomak adalah?",
        options: [
          { text: "Kemiri", correct: false },
          { text: "Andaliman", correct: true },
          { text: "Ketumbar", correct: false },
          { text: "Jinten", correct: false }
        ]
      }
    ]
  }
]