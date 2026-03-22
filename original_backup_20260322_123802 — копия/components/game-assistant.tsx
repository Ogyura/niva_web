"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Bot, ChevronDown, HelpCircle, Route, Shield, Database } from "lucide-react"

interface GameAssistantProps {
  onClose: () => void
}

const FAQ = [
  {
    id: "flow",
    question: "Как устроена миссия?",
    answer:
      "Вы едете по маршруту и встречаете станции DDOS-GUARD. На каждой станции маскот останавливает машину, даёт короткий факт и задаёт вопрос. Правильный ответ открывает путь дальше.",
  },
  {
    id: "goal",
    question: "Какая главная цель?",
    answer:
      "Нужно довезти пакет данных до пользователя и завершить передачу. После финиша игрок оставляет контакты, и они сохраняются в админ-панель.",
  },
  {
    id: "coins",
    question: "Что с монетами и лишним мусором?",
    answer:
      "Лишняя награда убрана. В центре внимания только поездка, сюжетные остановки, факты и контрольные вопросы.",
  },
  {
    id: "stations",
    question: "Какие станции встречаются?",
    answer:
      "В миссии есть Edge Station, Shield Station и Origin Station. Каждая отвечает за свой этап защиты и подаёт игроку небольшой сюжетный контекст.",
  },
  {
    id: "admin",
    question: "Что видит админ?",
    answer:
      "Админ получает список игроков, их контакты, заметки, дату прохождения, результат миссии и дистанцию. Данные хранятся через серверный API, а не только в браузере.",
  },
]

export function GameAssistant({ onClose }: GameAssistantProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Array<{ type: "user" | "bot"; text: string }>>([
    {
      type: "bot",
      text: "Я помощник по миссии DDOS-GUARD. Выберите вопрос, и я быстро объясню, как устроен проект.",
    },
  ])

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestion(questionId)
    const question = FAQ.find((item) => item.id === questionId)
    if (!question) return

    setChatHistory((prev) => [
      ...prev,
      { type: "user", text: question.question },
      { type: "bot", text: question.answer },
    ])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl h-[600px] flex flex-col glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Помощник миссии</h2>
              <p className="text-purple-300/70 text-xs">Одна игра, один маршрут, понятная логика</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-purple-300 hover:text-white hover:bg-purple-500/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-none"
                    : "glass-card text-purple-100 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-purple-500/20 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-100 flex items-center gap-2">
              <Route className="w-4 h-4" />
              Сюжетный маршрут
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-100 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Вопросы по пути
            </div>
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 text-sm text-cyan-100 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Данные в админке
            </div>
          </div>

          <p className="text-purple-300/70 text-sm mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Выберите вопрос:
          </p>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {FAQ.map((item) => (
              <button
                key={item.id}
                onClick={() => handleQuestionSelect(item.id)}
                className={`w-full glass-card rounded-lg px-3 py-2 text-left hover:bg-white/10 transition-colors ${
                  selectedQuestion === item.id ? "border border-cyan-500/50" : ""
                }`}
              >
                <span className="text-white text-sm flex items-center gap-2">
                  <ChevronDown className="w-4 h-4 -rotate-90 text-cyan-300" />
                  {item.question}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
