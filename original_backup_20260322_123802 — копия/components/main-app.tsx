"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ProfileCabinet } from "@/components/profile-cabinet"
import { GameAssistant } from "@/components/game-assistant"
import { Button } from "@/components/ui/button"
import { Shield, Trophy, LogOut, Play, Route, Database, MessageCircle, Award, Home, Star, Sparkles } from "lucide-react"

interface LeaderboardEntry {
  username: string
  score: number
  distance: string
  date: string
  game: string
}

export function MainApp() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"home" | "leaderboard">("home")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [showAssistant, setShowAssistant] = useState(false)

  useEffect(() => {
    const loadLeaderboard = () => {
      const keys = ["hillclimbLeaderboard", "hillClimbLeaderboard", "hillClimbBlueLeaderboard"]
      const allEntries: LeaderboardEntry[] = []

      for (const key of keys) {
        const raw = localStorage.getItem(key)
        if (!raw) continue

        try {
          const parsed = JSON.parse(raw) as LeaderboardEntry[]
          allEntries.push(...parsed)
        } catch {
          continue
        }
      }

      allEntries.sort((a, b) => b.score - a.score)
      setLeaderboard(allEntries.slice(0, 12))
    }

    loadLeaderboard()
    if (activeTab === "leaderboard") {
      const timer = setInterval(loadLeaderboard, 1200)
      return () => clearInterval(timer)
    }
  }, [activeTab])

  const topScore = useMemo(() => (leaderboard[0]?.score ? leaderboard[0].score.toLocaleString() : "—"), [leaderboard])

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_10%,#1d5ec7_0%,#0c2f75_35%,#07153f_65%,#050b2a_100%)]" />
      <div className="absolute -z-10 left-[-120px] top-[-140px] h-[380px] w-[380px] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -z-10 right-[-160px] top-[120px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -z-10 left-[35%] bottom-[-140px] h-[360px] w-[360px] rounded-full bg-sky-300/10 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-cyan-300/15 bg-[#061434cc] backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center shadow-[0_0_20px_rgba(56,189,248,0.45)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/70">Mission Center</p>
              <p className="text-base md:text-lg font-semibold">DDOS-GUARD</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <TabButton active={activeTab === "home"} onClick={() => setActiveTab("home")} icon={<Home className="w-4 h-4" />}>
              Главная
            </TabButton>
            <TabButton
              active={activeTab === "leaderboard"}
              onClick={() => setActiveTab("leaderboard")}
              icon={<Trophy className="w-4 h-4" />}
            >
              Рейтинг
            </TabButton>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAssistant(true)}
              variant="outline"
              size="sm"
              className="border-cyan-400/30 text-cyan-100 hover:bg-cyan-500/15"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Помощник
            </Button>
            <button
              onClick={() => setShowProfile(true)}
              className="hidden md:flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1.5"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-xs font-bold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm">{user?.username}</span>
              {!!user?.achievements.length && (
                <span className="inline-flex items-center gap-1 text-[11px] text-yellow-200/90">
                  <Award className="w-3 h-3" /> {user.achievements.length}
                </span>
              )}
            </button>
            <Button onClick={logout} variant="outline" size="sm" className="border-blue-400/30 text-blue-100 hover:bg-blue-500/15">
              <LogOut className="w-4 h-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-7 md:py-9">
        {activeTab === "home" && (
          <div className="space-y-6 md:space-y-8">
            <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
              <div className="rounded-3xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(17,64,152,0.7),rgba(7,23,67,0.85))] p-6 md:p-8 shadow-[0_20px_60px_rgba(6,30,86,0.5)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-widest text-cyan-100/90">
                  <Sparkles className="w-3 h-3" />
                  Одна главная миссия
                </div>
                <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
                  Космическая
                  <span className="block bg-gradient-to-r from-cyan-200 via-sky-200 to-white bg-clip-text text-transparent">доставка данных</span>
                </h1>
                <p className="mt-4 text-slate-200/90 max-w-2xl">
                  Маскот DDOS-GUARD везет пакет пользователю через точки защиты сети. По дороге встречаются факты и квизы,
                  которые делают игру живой и полезной.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <StatPill icon={<Route className="w-4 h-4" />} text="3 станции: Edge, Shield, Origin" />
                  <StatPill icon={<Database className="w-4 h-4" />} text="Сбор заявок после финиша" />
                  <StatPill icon={<Star className="w-4 h-4" />} text={`Топ-счет: ${topScore}`} />
                </div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/games/hill-climb">
                    <Button className="h-12 px-8 text-base bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border border-cyan-200/30 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
                      <Play className="w-5 h-5 mr-2" />
                      Запустить миссию
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-cyan-300/20 bg-[#071845c7] p-5 md:p-6 shadow-[0_20px_60px_rgba(6,30,86,0.45)]">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-cyan-300/25 bg-cyan-500/10">
                  <Image src="/images/ninja-mascot.png" alt="DDOS-GUARD mascot" fill priority className="object-cover" />
                </div>
                <p className="mt-4 text-sm text-cyan-100/85">Фирменный визуальный стиль: синий неон, космос, глубина и чистая композиция.</p>
              </div>
            </section>

            <section className="rounded-3xl border border-cyan-300/20 bg-[#061944cc] p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold">Маршрут миссии</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <StageCard title="Edge" text="Первичная фильтрация и анализ входящего трафика." />
                <StageCard title="Shield" text="Интеллектуальная защита, правила и ограничение аномалий." />
                <StageCard title="Origin" text="Безопасная передача пакета конечному пользователю." />
              </div>
            </section>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <section className="rounded-3xl border border-cyan-300/20 bg-[#061944cc] p-6 md:p-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-300" />
              Рейтинг курьеров
            </h2>
            {leaderboard.length === 0 ? (
              <p className="mt-6 text-slate-300/80">Пока нет результатов. Заверши заезд, и запись появится здесь.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={`${entry.username}-${entry.date}-${index}`} className="rounded-2xl border border-cyan-300/15 bg-cyan-500/5 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full grid place-items-center text-sm font-bold bg-gradient-to-br from-cyan-500 to-blue-500">{index + 1}</div>
                      <div>
                        <p className="font-semibold">{entry.username}</p>
                        <p className="text-xs text-slate-300/70">{entry.distance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-100">{entry.score.toLocaleString()}</p>
                      <p className="text-xs text-slate-300/70">{new Date(entry.date).toLocaleDateString("ru-RU")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {showProfile && <ProfileCabinet onClose={() => setShowProfile(false)} />}
      {showAssistant && <GameAssistant onClose={() => setShowAssistant(false)} />}
    </div>
  )
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <Button
      onClick={onClick}
      variant={active ? "default" : "ghost"}
      size="sm"
      className={active ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "text-cyan-100/80 hover:text-white hover:bg-cyan-500/10"}
    >
      {icon}
      <span className="ml-2 hidden sm:inline">{children}</span>
    </Button>
  )
}

function StatPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-3 py-1.5 text-xs md:text-sm flex items-center gap-2 text-cyan-100">
      {icon}
      {text}
    </div>
  )
}

function StageCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-500/5 p-4">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-slate-300/85">{text}</p>
    </div>
  )
}
