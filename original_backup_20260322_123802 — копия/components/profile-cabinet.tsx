"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth, DEFAULT_ACHIEVEMENTS } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Trophy,
  Star,
  Gamepad2,
  Mountain,
  Repeat,
  Lock,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  Zap,
  X,
  ShieldCheck,
} from "lucide-react"

interface ProfileCabinetProps {
  onClose: () => void
}

export function ProfileCabinet({ onClose }: ProfileCabinetProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<"stats" | "achievements">("stats")

  if (!user) return null

  const getAchievementIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      gamepad: <Gamepad2 className="w-6 h-6" />,
      trophy: <Trophy className="w-6 h-6" />,
      star: <Star className="w-6 h-6" />,
      repeat: <Repeat className="w-6 h-6" />,
      mountain: <Mountain className="w-6 h-6" />,
    }
    return icons[iconName] || <Award className="w-6 h-6" />
  }

  const totalRuns = user.gameStats.reduce((sum, item) => sum + item.gamesPlayed, 0)
  const totalScore = user.gameStats.reduce((sum, item) => sum + item.totalScore, 0)
  const highestScore = user.gameStats.length > 0 ? Math.max(...user.gameStats.map((item) => item.highScore)) : 0

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-card rounded-2xl">
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              <p className="text-purple-300/70 text-sm">{user.email}</p>
              <p className="text-purple-400/50 text-xs flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" />С {formatDate(user.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/20 hover:text-white">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Админ кабинет
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-purple-300 hover:text-white hover:bg-purple-500/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-purple-500/20">
          <StatTile icon={<Gamepad2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />} value={String(totalRuns)} label="Заездов" />
          <StatTile icon={<Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />} value={totalScore.toLocaleString()} label="Очков всего" />
          <StatTile icon={<TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />} value={highestScore.toLocaleString()} label="Лучший счёт" />
          <StatTile icon={<Trophy className="w-6 h-6 text-orange-400 mx-auto mb-2" />} value={String(user.achievements.length)} label="Достижений" />
        </div>

        <div className="flex border-b border-purple-500/20">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === "stats" ? "text-white border-b-2 border-cyan-400" : "text-purple-300/70 hover:text-white"
            }`}
          >
            <Gamepad2 className="w-4 h-4 inline-block mr-2" />
            Статистика
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === "achievements" ? "text-white border-b-2 border-cyan-400" : "text-purple-300/70 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4 inline-block mr-2" />
            Достижения ({user.achievements.length}/{DEFAULT_ACHIEVEMENTS.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[40vh]">
          {activeTab === "stats" && (
            <div className="space-y-4">
              {user.gameStats.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 text-purple-400/30 mx-auto mb-4" />
                  <p className="text-purple-300/60">Вы ещё не проходили миссию.</p>
                  <p className="text-purple-400/40 text-sm mt-2">Запустите поездку, чтобы увидеть статистику.</p>
                </div>
              ) : (
                user.gameStats.map((stat) => (
                  <div key={stat.gameId} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{stat.gameName}</h3>
                        <div className="flex items-center gap-4 text-sm text-purple-300/70">
                          <span className="flex items-center gap-1">
                            <Repeat className="w-3 h-3" />
                            {stat.gamesPlayed} прохождений
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(stat.lastPlayed)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold text-lg">{stat.highScore.toLocaleString()}</p>
                      <p className="text-purple-300/50 text-xs">Лучший результат</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="grid md:grid-cols-2 gap-4">
              {DEFAULT_ACHIEVEMENTS.map((achievement) => {
                const unlocked = user.achievements.find((item) => item.id === achievement.id)
                return (
                  <div
                    key={achievement.id}
                    className={`glass-card rounded-xl p-4 flex items-start gap-4 transition-all ${
                      unlocked ? "border border-yellow-500/30" : "opacity-50"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        unlocked ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white" : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {unlocked ? getAchievementIcon(achievement.icon) : <Lock className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${unlocked ? "text-white" : "text-gray-400"}`}>{achievement.name}</h4>
                      <p className={`text-sm ${unlocked ? "text-purple-300/70" : "text-gray-500"}`}>{achievement.description}</p>
                      {unlocked && <p className="text-xs text-yellow-400/70 mt-1">Получено {formatDate(unlocked.unlockedAt)}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      {icon}
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-purple-300/70 text-xs">{label}</p>
    </div>
  )
}
