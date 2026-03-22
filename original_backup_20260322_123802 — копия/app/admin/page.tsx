"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, KeyRound, Loader2, Shield, Trophy, UserRound, LogOut, Search, Copy, Check } from "lucide-react"

interface Submission {
  id: string
  username: string
  email: string
  phone?: string
  telegram?: string
  company?: string
  note?: string
  score: number
  distance: number
  createdAt: string
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("")
  const [activeKey, setActiveKey] = useState("")
  const [search, setSearch] = useState("")
  const [isBooting, setIsBooting] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")
  const [submissions, setSubmissions] = useState<Submission[]>([])

  const loadSession = async () => {
    try {
      const response = await fetch("/api/admin/session", { credentials: "include" })
      const data = await response.json()
      setAuthorized(Boolean(data.authorized))
      if (data.authorized) {
        await Promise.all([loadSubmissions(), loadAdminKey()])
      }
    } finally {
      setIsBooting(false)
    }
  }

  const loadSubmissions = async () => {
    const response = await fetch("/api/admin/submissions", { credentials: "include" })
    const data = await response.json()

    if (!response.ok) {
      setAuthorized(false)
      setError(data.error || "Не удалось загрузить данные.")
      return
    }

    setSubmissions(data.submissions || [])
  }

  const loadAdminKey = async () => {
    const response = await fetch("/api/admin/key", { credentials: "include" })
    const data = await response.json()
    if (response.ok) {
      setActiveKey(String(data.key || ""))
    }
  }

  useEffect(() => {
    void loadSession()
  }, [])

  const handleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ key: adminKey }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Не удалось войти.")
        return
      }

      setAuthorized(true)
      setAdminKey("")
      await Promise.all([loadSubmissions(), loadAdminKey()])
    } catch {
      setError("Ошибка входа в админку.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      setAuthorized(false)
      setActiveKey("")
      setSubmissions([])
      setIsLoading(false)
    }
  }

  const handleCopyKey = async () => {
    if (!activeKey) return
    await navigator.clipboard.writeText(activeKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return submissions

    return submissions.filter((item) =>
      [item.username, item.email, item.phone, item.telegram, item.company, item.note]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [search, submissions])

  const totalPlayers = submissions.length
  const totalScore = submissions.reduce((sum, item) => sum + item.score, 0)
  const bestRun = submissions.length ? Math.max(...submissions.map((item) => item.score)) : 0

  return (
    <div className="min-h-screen px-4 py-8 text-slate-100 bg-[radial-gradient(circle_at_15%_10%,#1f63cc_0%,#0e3279_35%,#091f55_60%,#050c29_100%)]">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-cyan-300/20 bg-[#071742cc] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.4)]">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Админ-панель DDOS-GUARD</h1>
                <p className="text-cyan-100/70">Управление заявками и доступом</p>
              </div>
            </div>

            {authorized && (
              <Button onClick={handleLogout} variant="outline" className="border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            )}
          </div>
        </div>

        {!authorized && (
          <div className="rounded-3xl border border-cyan-300/20 bg-[#071742cc] p-6 md:p-8">
            <div className="grid gap-3 md:grid-cols-[1fr,180px]">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300" />
                <Input
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Введите ключ админки"
                  type="password"
                  className="pl-11 h-12 bg-white/5 border-cyan-500/30 text-white placeholder:text-cyan-100/50"
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={isBooting || isLoading || !adminKey}
                className="h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
              >
                {isLoading || isBooting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Войти"}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>
        )}

        {authorized && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard icon={<UserRound className="w-5 h-5 text-cyan-200" />} label="Игроков" value={String(totalPlayers)} />
              <StatCard icon={<Trophy className="w-5 h-5 text-cyan-200" />} label="Суммарный счет" value={totalScore.toLocaleString()} />
              <StatCard icon={<Shield className="w-5 h-5 text-cyan-200" />} label="Лучший заезд" value={bestRun.toLocaleString()} />
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-5">
                <p className="text-cyan-100/70 text-sm mb-2">Ключ админки</p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm text-white break-all">{activeKey || "—"}</code>
                  <Button onClick={handleCopyKey} size="sm" variant="outline" className="border-cyan-300/35 bg-cyan-500/10">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-300/20 bg-[#071742cc] p-4 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Заявки игроков</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-200/70" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Поиск по имени, почте, компании"
                    className="pl-10 h-10 bg-white/5 border-cyan-500/30 text-white placeholder:text-cyan-100/50"
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-cyan-100/70">Подходящих записей пока нет.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-sm">
                    <thead>
                      <tr className="text-left text-cyan-200 border-b border-cyan-500/20">
                        <th className="py-3 pr-4">Игрок</th>
                        <th className="py-3 pr-4">Контакты</th>
                        <th className="py-3 pr-4">Компания</th>
                        <th className="py-3 pr-4">Результат</th>
                        <th className="py-3 pr-4">Комментарий</th>
                        <th className="py-3">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id} className="border-b border-white/8 align-top">
                          <td className="py-4 pr-4 text-white">
                            <div className="font-semibold">{item.username}</div>
                            <div className="text-cyan-100/70">{item.email}</div>
                          </td>
                          <td className="py-4 pr-4 text-cyan-100/85">
                            <div>{item.phone || "—"}</div>
                            <div>{item.telegram || "—"}</div>
                          </td>
                          <td className="py-4 pr-4 text-cyan-100/85">{item.company || "—"}</td>
                          <td className="py-4 pr-4 text-cyan-100/85">
                            <div>{item.score.toLocaleString()} очков</div>
                            <div>{item.distance.toLocaleString()} м</div>
                          </td>
                          <td className="py-4 pr-4 text-cyan-100/85">{item.note || "—"}</td>
                          <td className="py-4 text-cyan-100/70">{new Date(item.createdAt).toLocaleString("ru-RU")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-cyan-100/75 text-sm">{label}</p>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}
