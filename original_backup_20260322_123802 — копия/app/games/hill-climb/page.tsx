"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Play, RotateCcw, Package, Gauge, Sparkles, ShieldCheck, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

type GameMode = "menu" | "playing" | "quiz" | "win"

interface TerrainPoint {
  x: number
  y: number
}

interface StoryStation {
  id: string
  title: string
  shortFact: string
  question: string
  options: string[]
  correct: number
  explain: string
  milestone: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
}

const TARGET_DISTANCE = 5400

const STATIONS: StoryStation[] = [
  {
    id: "edge",
    title: "Edge Station",
    shortFact: "РќР° edge-СѓР·Р»Рµ С‚СЂР°С„РёРє Р»СѓС‡С€Рµ С„РёР»СЊС‚СЂРѕРІР°С‚СЊ СЂР°РЅСЊС€Рµ, РїРѕРєР° С€СѓРј РЅРµ РґРѕС€С‘Р» РґРѕ core.",
    question: "Р—Р°С‡РµРј РїРµСЂРІРѕР№ СЃС‚Р°РЅС†РёРµР№ СЃС‚Р°РІСЏС‚ edge-С„РёР»СЊС‚СЂ?",
    options: ["Р§С‚РѕР±С‹ РїРµСЂРµРЅР°РїСЂР°РІРёС‚СЊ Р°С‚Р°РєСѓ Р±Р»РёР¶Рµ Рє РІС…РѕРґСѓ", "Р§С‚РѕР±С‹ СѓРІРµР»РёС‡РёС‚СЊ Р·Р°РґРµСЂР¶РєСѓ РІСЃРµРј", "Р§С‚РѕР±С‹ СЃРєСЂС‹С‚СЊ Р»РѕРіРѕС‚РёРї СЃР°Р№С‚Р°"],
    correct: 0,
    explain: "Р’РµСЂРЅРѕ. Р§РµРј СЂР°РЅСЊС€Рµ РѕС‚СЃРµРєР°РµС‚СЃСЏ РјСѓСЃРѕСЂРЅС‹Р№ С‚СЂР°С„РёРє, С‚РµРј РјРµРЅСЊС€Рµ РЅР°РіСЂСѓР·РєР° РЅР° РѕСЃС‚Р°Р»СЊРЅСѓСЋ СЃРёСЃС‚РµРјСѓ.",
    milestone: 0.22,
  },
  {
    id: "shield",
    title: "Shield Station",
    shortFact: "Rate limiting Рё СЃРёРіРЅР°С‚СѓСЂС‹ РїРѕРјРѕРіР°СЋС‚ РЅРµ РїСѓСЃРєР°С‚СЊ РѕРґРЅРѕС‚РёРїРЅС‹Р№ СЃРїР°Рј РіР»СѓР±Р¶Рµ РїРѕ РјР°СЂС€СЂСѓС‚Сѓ.",
    question: "Р§С‚Рѕ Р»СѓС‡С€Рµ РІСЃРµРіРѕ РїРѕРјРѕРіР°РµС‚ РїСЂРѕС‚РёРІ РѕРґРЅРѕС‚РёРїРЅРѕРіРѕ С€РєРІР°Р»Р° Р·Р°РїСЂРѕСЃРѕРІ?",
    options: ["РћС‚РєР»СЋС‡РёС‚СЊ РјРѕРЅРёС‚РѕСЂРёРЅРі", "Rate limiting Рё С„РёР»СЊС‚СЂР°С†РёСЏ РїРѕ С€Р°Р±Р»РѕРЅР°Рј", "РЈР±СЂР°С‚СЊ РєСЌС€РёСЂРѕРІР°РЅРёРµ"],
    correct: 1,
    explain: "Р”Р°. РћРіСЂР°РЅРёС‡РµРЅРёРµ С‡Р°СЃС‚РѕС‚С‹ Рё С„РёР»СЊС‚СЂР°С†РёСЏ С€Р°Р±Р»РѕРЅРѕРІ Р±С‹СЃС‚СЂРѕ СЃРЅРёР¶Р°СЋС‚ РґР°РІР»РµРЅРёРµ РЅР° СЃРµСЂРІРёСЃ.",
    milestone: 0.5,
  },
  {
    id: "origin",
    title: "Origin Station",
    shortFact: "Origin РґРѕР»Р¶РµРЅ РїРѕР»СѓС‡Р°С‚СЊ СѓР¶Рµ РѕС‡РёС‰РµРЅРЅС‹Р№ С‚СЂР°С„РёРє, Р° РЅРµ РІРµСЃСЊ РїРѕС‚РѕРє СЃРЅР°СЂСѓР¶Рё.",
    question: "РљР°РєР°СЏ С†РµР»СЊ РїРѕСЃР»РµРґРЅРµР№ СЃС‚Р°РЅС†РёРё РїРµСЂРµРґ РґРѕСЃС‚Р°РІРєРѕР№?",
    options: ["РћСЃС‚Р°РІРёС‚СЊ С‚РѕР»СЊРєРѕ Р»РµРіРёС‚РёРјРЅС‹Р№ С‚СЂР°С„РёРє Рє origin", "РћС‚РєР»СЋС‡РёС‚СЊ HTTPS", "РЎРґРµР»Р°С‚СЊ СЃРµСЂРІРµСЂ РїСѓР±Р»РёС‡РЅРµРµ"],
    correct: 0,
    explain: "РўРѕС‡РЅРѕ. РџРѕСЃР»РµРґРЅСЏСЏ СЃС‚Р°РЅС†РёСЏ РїСЂРѕРїСѓСЃРєР°РµС‚ С‚РѕР»СЊРєРѕ РЅРѕСЂРјР°Р»СЊРЅС‹Р№ Р·Р°РїСЂРѕСЃ Рє РєРѕРЅРµС‡РЅРѕРјСѓ РїРѕР»СѓС‡Р°С‚РµР»СЋ.",
    milestone: 0.78,
  },
]

export default function HillClimbGame() {
  const { user, updateGameStats } = useAuth()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mascotRef = useRef<HTMLImageElement | null>(null)
  const inputRef = useRef({ gas: false, brake: false })

  const [mode, setMode] = useState<GameMode>("menu")
  const [distance, setDistance] = useState(0)
  const [progress, setProgress] = useState(0)
  const [speedKmh, setSpeedKmh] = useState(0)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [activeStation, setActiveStation] = useState<StoryStation | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [quizFeedback, setQuizFeedback] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactTelegram, setContactTelegram] = useState("")
  const [contactCompany, setContactCompany] = useState("")
  const [contactNote, setContactNote] = useState("")
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [submitError, setSubmitError] = useState("")

  const modeRef = useRef<GameMode>("menu")
  const scoreRef = useRef(0)
  const bestScoreRef = useRef(0)
  const activeStationRef = useRef<StoryStation | null>(null)
  const winSavedRef = useRef(false)

  const gameRef = useRef({
    x: 140,
    y: 0,
    speed: 0,
    tilt: 0,
    camX: 0,
    terrain: [] as TerrainPoint[],
    particles: [] as Particle[],
    lastTs: 0,
    won: false,
    lastScoreStep: 0,
    stationIndex: 0,
  })

  const getTerrainYAtX = useCallback((x: number, terrain: TerrainPoint[]) => {
    for (let i = 0; i < terrain.length - 1; i += 1) {
      const a = terrain[i]
      const b = terrain[i + 1]
      if (x >= a.x && x <= b.x) {
        const t = (x - a.x) / (b.x - a.x)
        return a.y + (b.y - a.y) * t
      }
    }
    return 370
  }, [])

  const terrainData = useMemo(() => {
    const terrain: TerrainPoint[] = []
    const total = TARGET_DISTANCE + 1800
    for (let x = -200; x <= total; x += 18) {
      const base = 370
      const y =
        base +
        Math.sin(x * 0.004) * 26 +
        Math.cos(x * 0.0018) * 40 +
        Math.sin(x * 0.018) * 10 +
        Math.cos(x * 0.012 + 1.2) * 9
      terrain.push({ x, y: Math.max(255, Math.min(470, y)) })
    }
    return terrain
  }, [])

  const saveLeaderboardEntry = useCallback((finalScore: number, finalDistance: number) => {
    const key = "hillClimbBlueLeaderboard"
    const existing = JSON.parse(localStorage.getItem(key) || "[]") as Array<{
      username: string
      score: number
      distance: string
      date: string
      game: string
    }>

    existing.push({
      username: user?.username || contactName || "РРіСЂРѕРє",
      score: finalScore,
      distance: `${finalDistance.toLocaleString()} Рј`,
      date: new Date().toISOString(),
      game: "hill-climb",
    })

    existing.sort((a, b) => b.score - a.score)
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)))
  }, [contactName, user?.username])

  const resetGame = useCallback(() => {
    const startY = getTerrainYAtX(140, terrainData)
    gameRef.current = {
      x: 140,
      y: startY - 26,
      speed: 0,
      tilt: 0,
      camX: 0,
      terrain: terrainData,
      particles: [],
      lastTs: performance.now(),
      won: false,
      lastScoreStep: 0,
      stationIndex: 0,
    }

    setDistance(0)
    setProgress(0)
    setSpeedKmh(0)
    setScore(0)
    setActiveStation(null)
    setSelectedOption(null)
    setQuizFeedback("")
    setSubmitState("idle")
    setSubmitError("")
    setContactName(user?.username || "")
    setContactEmail(user?.email || "")
    setContactPhone("")
    setContactTelegram("")
    setContactCompany("")
    setContactNote("")
    winSavedRef.current = false
    setMode("playing")
  }, [getTerrainYAtX, terrainData, user?.email, user?.username])

  useEffect(() => {
    const img = new window.Image()
    img.src = "/images/ninja-mascot.png"
    mascotRef.current = img
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") inputRef.current.gas = true
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") inputRef.current.brake = true
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") inputRef.current.gas = false
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") inputRef.current.brake = false
    }

    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
    }
  }, [])

  useEffect(() => {
    const value = localStorage.getItem("hillClimbBlueBest")
    if (value) setBestScore(Number(value))
    setContactName(user?.username || "")
    setContactEmail(user?.email || "")
  }, [user?.email, user?.username])

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    bestScoreRef.current = bestScore
  }, [bestScore])

  useEffect(() => {
    activeStationRef.current = activeStation
  }, [activeStation])

  const handleQuizAnswer = useCallback(
    (option: number) => {
      if (!activeStation) return
      setSelectedOption(option)

      if (option === activeStation.correct) {
        const nextScore = scoreRef.current + 220
        setScore(nextScore)
        setQuizFeedback(activeStation.explain)
        window.setTimeout(() => {
          setActiveStation(null)
          setSelectedOption(null)
          setQuizFeedback("")
          setMode("playing")
        }, 800)
      } else {
        setScore((prev) => Math.max(0, prev - 45))
        setQuizFeedback("РќРµРІРµСЂРЅРѕ. РњР°СЃРєРѕС‚ РїСЂРѕСЃРёС‚ РѕС‚РІРµС‚РёС‚СЊ РµС‰С‘ СЂР°Р·, РїСЂРµР¶РґРµ С‡РµРј РјР°СЂС€СЂСѓС‚ РїСЂРѕРґРѕР»Р¶РёС‚СЃСЏ.")
      }
    },
    [activeStation],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rafId = 0

    const drawBackground = (camX: number, t: number) => {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, "#06102f")
      grad.addColorStop(0.45, "#0b2d6a")
      grad.addColorStop(1, "#071b44")
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const nebula = ctx.createRadialGradient(canvas.width * 0.75, 90, 20, canvas.width * 0.7, 120, 320)
      nebula.addColorStop(0, "rgba(75,197,255,0.22)")
      nebula.addColorStop(1, "rgba(75,197,255,0)")
      ctx.fillStyle = nebula
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < 115; i += 1) {
        const sx = ((i * 157 + t * (0.03 + (i % 5) * 0.01)) % (canvas.width + 220)) - 110
        const sy = (i * 73) % 240
        const r = 0.9 + (i % 3) * 0.6
        ctx.fillStyle = `rgba(165,220,255,${0.25 + ((i + t * 0.002) % 5) * 0.08})`
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.strokeStyle = "rgba(71,184,255,0.18)"
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath()
        for (let x = -20; x <= canvas.width + 20; x += 16) {
          const y = 118 + i * 26 + Math.sin((x + camX * 0.18 + i * 70) * 0.016) * 6
          if (x === -20) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      ctx.fillStyle = "rgba(7,30,70,0.55)"
      for (let i = 0; i < 15; i += 1) {
        const w = 60 + (i % 3) * 40
        const h = 80 + (i % 4) * 25
        const x = ((i * 120 - camX * 0.35) % (canvas.width + 300)) - 150
        const y = canvas.height - 200 - h
        ctx.fillRect(x, y, w, h)
      }
    }

    const drawRoadAndStations = (terrain: TerrainPoint[], camX: number) => {
      ctx.save()
      ctx.translate(-camX, 0)

      for (let i = 0; i < terrain.length - 1; i += 1) {
        const p = terrain[i]
        const next = terrain[i + 1]
        if (next.x < camX - 180 || p.x > camX + canvas.width + 180) continue

        const roadGlow = ctx.createLinearGradient(0, p.y - 16, 0, p.y + 30)
        roadGlow.addColorStop(0, "rgba(61,165,255,0.55)")
        roadGlow.addColorStop(1, "rgba(5,40,95,0.95)")

        ctx.strokeStyle = roadGlow
        ctx.lineWidth = 34
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(next.x, next.y)
        ctx.stroke()

        ctx.strokeStyle = "rgba(169,236,255,0.55)"
        ctx.lineWidth = 1.6
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - 9)
        ctx.lineTo(next.x, next.y - 9)
        ctx.stroke()
      }

      for (const station of STATIONS) {
        const worldX = station.milestone * TARGET_DISTANCE + 140
        const worldY = getTerrainYAtX(worldX, terrain) - 48

        if (worldX < camX - 200 || worldX > camX + canvas.width + 200) continue

        ctx.fillStyle = "rgba(20,174,255,0.18)"
        ctx.fillRect(worldX - 34, worldY - 42, 68, 44)
        ctx.strokeStyle = "rgba(124,226,255,0.9)"
        ctx.lineWidth = 2
        ctx.strokeRect(worldX - 34, worldY - 42, 68, 44)
        ctx.fillStyle = "rgba(55, 210, 255, 0.25)"
        ctx.beginPath()
        ctx.arc(worldX, worldY - 46, 16 + Math.sin(performance.now() * 0.003) * 3, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = "rgba(124,226,255,0.8)"
        ctx.beginPath()
        ctx.moveTo(worldX, worldY - 42)
        ctx.lineTo(worldX, worldY + 10)
        ctx.stroke()
        ctx.fillStyle = "#d7f7ff"
        ctx.font = "bold 12px Arial"
        ctx.fillText(station.title, worldX - 28, worldY - 16)
      }

      ctx.restore()
    }

    const drawCar = (x: number, y: number, tilt: number, camX: number) => {
      const cx = x - camX
      ctx.save()
      ctx.translate(cx, y)
      ctx.rotate(tilt)

      const bodyGradient = ctx.createLinearGradient(-45, -18, 45, 20)
      bodyGradient.addColorStop(0, "#0f3e9e")
      bodyGradient.addColorStop(1, "#36c7ff")

      ctx.fillStyle = bodyGradient
      ctx.beginPath()
      ctx.moveTo(-58, 8)
      ctx.lineTo(-38, -16)
      ctx.lineTo(24, -18)
      ctx.lineTo(52, -2)
      ctx.lineTo(56, 12)
      ctx.lineTo(-52, 12)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "rgba(170, 238, 255, 0.15)"
      ctx.fillRect(-50, -2, 88, 6)

      ctx.fillStyle = "#07245c"
      ctx.fillRect(-14, -16, 26, 12)

      ctx.strokeStyle = "rgba(170,238,255,0.9)"
      ctx.lineWidth = 2
      ctx.strokeRect(-14, -16, 26, 12)

      if (mascotRef.current && mascotRef.current.complete) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(-26, 1, 10, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(mascotRef.current, -36, -9, 20, 20)
        ctx.restore()
      }
      ctx.fillStyle = "rgba(34, 211, 238, 0.2)"
      ctx.beginPath()
      ctx.roundRect(-4, -30, 26, 10, 5)
      ctx.fill()
      ctx.strokeStyle = "rgba(125, 245, 255, 0.9)"
      ctx.stroke()
      ctx.fillStyle = "rgba(180, 245, 255, 0.9)"
      ctx.fillRect(52, 0, 8, 4)
      ctx.fillStyle = "rgba(130, 220, 255, 0.24)"
      ctx.beginPath()
      ctx.moveTo(60, -3)
      ctx.lineTo(90, -11)
      ctx.lineTo(90, 11)
      ctx.lineTo(60, 3)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#0a2f72"
      ctx.fillRect(-60, -8, 8, 3)

      ctx.fillStyle = "#11223b"
      ctx.beginPath()
      ctx.arc(-30, 14, 11, 0, Math.PI * 2)
      ctx.arc(32, 14, 11, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#7bd8ff"
      ctx.beginPath()
      ctx.arc(-30, 14, 4, 0, Math.PI * 2)
      ctx.arc(32, 14, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawParticles = (particles: Particle[]) => {
      for (const p of particles) {
        ctx.fillStyle = `rgba(142,228,255,${Math.max(0, p.life)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (ts: number) => {
      const g = gameRef.current
      const dt = Math.min(0.033, (ts - g.lastTs) / 1000 || 0.016)
      g.lastTs = ts

      if (modeRef.current === "playing") {
        const groundNow = getTerrainYAtX(g.x, g.terrain)
        const groundAhead = getTerrainYAtX(g.x + 24, g.terrain)
        const slope = (groundAhead - groundNow) / 24

        const accel = inputRef.current.gas ? 86 : 0
        const brake = inputRef.current.brake ? 110 : 0
        const gravityPull = slope * 110

        g.speed += (accel - brake - gravityPull) * dt
        g.speed *= inputRef.current.gas ? 0.992 : 0.982
        g.speed = Math.max(0, Math.min(190, g.speed))

        g.x += g.speed * dt
        g.camX = Math.max(0, g.x - 260)

        const terrainY = getTerrainYAtX(g.x, g.terrain)
        g.y += (terrainY - 26 - g.y) * 0.2
        g.tilt = Math.atan2(groundAhead - groundNow, 24) * 0.85

        if (inputRef.current.gas && g.speed > 12) {
          g.particles.push({
            x: g.x - g.camX - 56 + Math.random() * 6,
            y: g.y + 2 + Math.random() * 3,
            vx: -16 - Math.random() * 24,
            vy: -8 + Math.random() * 16,
            life: 0.7,
            size: 1.5 + Math.random() * 2,
          })
        }

        for (const p of g.particles) {
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.life -= dt * 1.6
        }
        g.particles = g.particles.filter((p) => p.life > 0)

        const dist = Math.max(0, g.x - 140)
        const nextProgress = Math.min(100, (dist / TARGET_DISTANCE) * 100)

        setDistance(Math.floor(dist))
        setProgress(nextProgress)
        setSpeedKmh(Math.round(g.speed * 0.8))

        const scoreStep = Math.floor(dist / 40)
        if (scoreStep > g.lastScoreStep) {
          g.lastScoreStep = scoreStep
          setScore((prev) => prev + 1)
        }

        const nextStation = STATIONS[g.stationIndex]
        if (nextStation && dist >= nextStation.milestone * TARGET_DISTANCE && !activeStationRef.current) {
          g.speed = 0
          setActiveStation(nextStation)
          setSelectedOption(null)
          setQuizFeedback("")
          setMode("quiz")
          g.stationIndex += 1
        }

        if (dist >= TARGET_DISTANCE && !g.won) {
          g.won = true
          const finalScore = scoreRef.current + 500
          const finalDistance = Math.floor(dist)
          setScore(finalScore)
          setMode("win")

          if (finalScore > bestScoreRef.current) {
            setBestScore(finalScore)
            localStorage.setItem("hillClimbBlueBest", String(finalScore))
          }

          if (!winSavedRef.current) {
            updateGameStats("hill-climb", "РџРµСЂРµРґР°С‡Р° РїР°РєРµС‚Р° РґР°РЅРЅС‹С…", finalScore)
            saveLeaderboardEntry(finalScore, finalDistance)
            winSavedRef.current = true
          }
        }
      }

      drawBackground(g.camX, ts)
      drawRoadAndStations(g.terrain, g.camX)
      drawParticles(g.particles)
      drawCar(g.x, g.y, g.tilt, g.camX)

      if (modeRef.current !== "menu") {
        const packetX = 30
        const packetY = 24
        const packetProgress = Math.min(100, (Math.max(0, g.x - 140) / TARGET_DISTANCE) * 100)

        ctx.fillStyle = "rgba(5,20,52,0.72)"
        ctx.fillRect(packetX, packetY, 240, 16)
        ctx.fillStyle = "#41caff"
        ctx.fillRect(packetX, packetY, 2.4 * packetProgress, 16)
        ctx.strokeStyle = "rgba(164,238,255,0.92)"
        ctx.strokeRect(packetX, packetY, 240, 16)

        ctx.fillStyle = "#c9f3ff"
        ctx.font = "bold 13px Arial"
        ctx.fillText(`РџР°РєРµС‚ РґР°РЅРЅС‹С…: ${packetProgress.toFixed(0)}%`, 30, 18)
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [getTerrainYAtX, saveLeaderboardEntry, updateGameStats])

  const handleSubmitLead = async () => {
    if (!contactName.trim()) {
      setSubmitState("error")
      setSubmitError("РЈРєР°Р¶РёС‚Рµ РёРјСЏ.")
      return
    }

    if (!contactEmail.includes("@")) {
      setSubmitState("error")
      setSubmitError("РЈРєР°Р¶РёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ email.")
      return
    }

    setSubmitState("loading")
    setSubmitError("")

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: contactName,
          email: contactEmail,
          phone: contactPhone,
          telegram: contactTelegram,
          company: contactCompany,
          note: contactNote,
          score,
          distance,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitState("error")
        setSubmitError(data.error || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РєРѕРЅС‚Р°РєС‚С‹.")
        return
      }

      setSubmitState("success")
    } catch {
      setSubmitState("error")
      setSubmitError("РћС€РёР±РєР° СЃРѕС…СЂР°РЅРµРЅРёСЏ. РџСЂРѕРІРµСЂСЊС‚Рµ API.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_20%_10%,#123a8f_0%,#08153e_50%,#050b25_100%)] text-blue-100">
      <header className="border-b border-cyan-500/30 bg-[#071238cc] backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" className="text-cyan-200 hover:text-white hover:bg-cyan-500/20">
                <ArrowLeft className="w-4 h-4 mr-2" /> РќР°Р·Р°Рґ
              </Button>
            </Link>
            <span className="text-lg md:text-xl font-semibold tracking-wide text-cyan-200">DDOS-GUARD Mission Route</span>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm">
            <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 flex items-center gap-1">
              <Gauge className="w-4 h-4 text-cyan-300" /> {speedKmh} РєРј/С‡
            </div>
            <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 flex items-center gap-1">
              <Package className="w-4 h-4 text-cyan-300" /> {distance.toLocaleString()} Рј
            </div>
            <div className="px-2 py-1 rounded-md bg-cyan-500/10 border border-cyan-400/30 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-cyan-300" /> {score.toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto w-full px-3 py-4 md:py-6">
        <div className="relative rounded-2xl border border-cyan-400/30 shadow-[0_0_60px_rgba(35,156,255,0.2)] overflow-hidden">
          <canvas ref={canvasRef} width={1000} height={560} className="w-full h-auto bg-[#050d2a]" />

          {mode === "menu" && (
            <div className="absolute inset-0 bg-[#050c28ea] backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-3xl w-full rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-[#0a1d58] to-[#071237] p-6 md:p-8 text-center shadow-2xl">
                <div className="flex justify-center mb-5">
                  <div className="w-28 h-28 rounded-full border-2 border-cyan-300/60 bg-cyan-900/30 overflow-hidden">
                    <Image src="/images/ninja-mascot.png" alt="Mascot" width={112} height={112} className="w-full h-full object-cover" />
                  </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-cyan-100">РџРµСЂРµРґР°С‡Р° РїР°РєРµС‚Р° РґР°РЅРЅС‹С…</h1>
                <p className="mt-4 text-cyan-100/90 text-sm md:text-base leading-relaxed">
                  РњР°СЃРєРѕС‚ DDOS-GUARD РІС‹РµР·Р¶Р°РµС‚ Рє РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ. РџРѕ РїСѓС‚Рё РІР°СЃ Р¶РґСѓС‚ С‚СЂРё СЃС‚Р°РЅС†РёРё, РєРѕСЂРѕС‚РєРёРµ С„Р°РєС‚С‹ Рё РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рµ РІРѕРїСЂРѕСЃС‹.
                  РњРѕРЅРµС‚РЅС‹Р№ РјСѓСЃРѕСЂ СѓР±СЂР°РЅ. Р’ С†РµРЅС‚СЂРµ С‚РѕР»СЊРєРѕ РјР°СЂС€СЂСѓС‚, РёСЃС‚РѕСЂРёСЏ Рё С„РёРЅР°Р»СЊРЅР°СЏ РїРµСЂРµРґР°С‡Р° РїР°РєРµС‚Р°.
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">Р¦РµР»СЊ: РґРѕСЃС‚Р°РІРёС‚СЊ РїР°РєРµС‚ РЅР° 100%</div>
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">РЈРїСЂР°РІР»РµРЅРёРµ: A/в†ђ С‚РѕСЂРјРѕР·, D/в†’ РіР°Р·</div>
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">РџРѕСЃР»Рµ С„РёРЅРёС€Р°: СЃР±РѕСЂ РєРѕРЅС‚Р°РєС‚РѕРІ РёРіСЂРѕРєР°</div>
                </div>
                <Button
                  onClick={resetGame}
                  className="mt-7 px-12 py-6 text-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-300/40"
                >
                  <Play className="w-5 h-5 mr-2" /> РЎС‚Р°СЂС‚ РјРёСЃСЃРёРё
                </Button>
                {bestScore > 0 && <p className="mt-3 text-cyan-200/80 text-sm">Р›СѓС‡С€РёР№ СЂРµР·СѓР»СЊС‚Р°С‚: {bestScore.toLocaleString()}</p>}
              </div>
            </div>
          )}

          {mode === "quiz" && activeStation && (
            <div className="absolute inset-0 bg-[#050d2ef2] backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-2xl rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-[#0b2262] to-[#0a1a44] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-cyan-300/40 bg-cyan-950/30">
                    <Image src="/images/ninja-mascot.png" alt="Mascot" width={56} height={56} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-cyan-200">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-semibold uppercase tracking-wide text-sm">{activeStation.title}</span>
                    </div>
                    <p className="text-cyan-100/85 text-sm mt-1">{activeStation.shortFact}</p>
                  </div>
                </div>
                <p className="text-cyan-100 text-lg md:text-xl font-semibold leading-snug">{activeStation.question}</p>
                <div className="mt-5 grid gap-3">
                  {activeStation.options.map((option, idx) => {
                    const isCorrect = idx === activeStation.correct
                    const isSelected = idx === selectedOption
                    const baseClass = "w-full text-left rounded-xl border px-4 py-3 text-sm md:text-base transition"
                    const stateClass =
                      selectedOption === null
                        ? "border-cyan-300/40 bg-cyan-500/10 hover:bg-cyan-500/20"
                        : isCorrect
                          ? "border-emerald-400/70 bg-emerald-500/25"
                          : isSelected
                            ? "border-rose-400/70 bg-rose-500/25"
                            : "border-cyan-300/25 bg-cyan-700/10 opacity-70"

                    return (
                      <button key={option} onClick={() => handleQuizAnswer(idx)} className={`${baseClass} ${stateClass}`}>
                        {option}
                      </button>
                    )
                  })}
                </div>
                {quizFeedback && <p className="mt-4 text-cyan-100/90 text-sm md:text-base">{quizFeedback}</p>}
              </div>
            </div>
          )}

          {mode === "win" && (
            <div className="absolute inset-0 overflow-y-auto bg-[#051033e8] backdrop-blur-sm flex items-start justify-center p-4 md:p-8">
              <div className="max-w-3xl w-full rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-[#0b276f] to-[#07183f] p-6 md:p-8">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-cyan-100">РџР°РєРµС‚ РґРѕСЃС‚Р°РІР»РµРЅ</h2>
                  <p className="mt-2 text-cyan-200/90">РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РїРѕР»СѓС‡РёР» РґР°РЅРЅС‹Рµ. РўРµРїРµСЂСЊ РјРѕР¶РЅРѕ СЃРѕР±СЂР°С‚СЊ РєРѕРЅС‚Р°РєС‚С‹ РёРіСЂРѕРєР° РІ Р°РґРјРёРЅ-РїР°РЅРµР»СЊ.</p>
                </div>

                <div className="mt-5 rounded-xl border border-cyan-300/35 bg-cyan-500/10 p-4 text-center">
                  <p className="text-sm text-cyan-200/85">РЎС‡С‘С‚</p>
                  <p className="text-4xl font-bold mt-1">{score.toLocaleString()}</p>
                  <p className="text-cyan-100/80 mt-1">РџСЂРѕР№РґРµРЅРѕ: {distance.toLocaleString()} Рј</p>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="РРјСЏ РёРіСЂРѕРєР°" className="h-11 bg-white/5 border-cyan-500/30 text-white placeholder:text-purple-300/50" />
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" className="h-11 bg-white/5 border-cyan-500/30 text-white placeholder:text-purple-300/50" />
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="РўРµР»РµС„РѕРЅ" className="h-11 bg-white/5 border-cyan-500/30 text-white placeholder:text-purple-300/50" />
                  <Input value={contactTelegram} onChange={(e) => setContactTelegram(e.target.value)} placeholder="Telegram" className="h-11 bg-white/5 border-cyan-500/30 text-white placeholder:text-purple-300/50" />
                  <Input value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} placeholder="РљРѕРјРїР°РЅРёСЏ" className="h-11 bg-white/5 border-cyan-500/30 text-white placeholder:text-purple-300/50 md:col-span-2" />
                  <Input value={contactNote} onChange={(e) => setContactNote(e.target.value)} placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№ РёР»Рё Р·Р°РґР°С‡Р°" className="h-11 bg-white/5 border-cyan-500/30 text-white placeholder:text-purple-300/50 md:col-span-2" />
                </div>

                {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}
                {submitState === "success" && <p className="mt-3 text-sm text-emerald-300">Р”Р°РЅРЅС‹Рµ СЃРѕС…СЂР°РЅРµРЅС‹. РћРЅРё СѓР¶Рµ РґРѕСЃС‚СѓРїРЅС‹ РІ Р°РґРјРёРЅ-РїР°РЅРµР»Рё.</p>}

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSubmitLead}
                    disabled={submitState === "loading" || submitState === "success"}
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-300/40"
                  >
                    {submitState === "loading" ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                    РЎРѕС…СЂР°РЅРёС‚СЊ РёРіСЂРѕРєР°
                  </Button>
                  <Button onClick={resetGame} variant="outline" className="flex-1 border-cyan-500/30 text-cyan-100 hover:bg-cyan-500/20">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    РќРѕРІР°СЏ РїРѕРµР·РґРєР°
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mode === "playing" && (
            <>
              <div className="absolute left-4 top-4 md:left-6 md:top-6 max-w-sm rounded-xl border border-cyan-300/35 bg-[#07215fbf] p-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-widest text-cyan-200/80 mb-1">РЎСЋР¶РµС‚ РјР°СЂС€СЂСѓС‚Р°</p>
                <p className="text-sm text-cyan-100 leading-snug">
                  РњР°СЃРєРѕС‚ РІРµРґС‘С‚ РїР°РєРµС‚ Рє РїРѕР»СЊР·РѕРІР°С‚РµР»СЋ. РЎР»РµРґСѓСЋС‰Р°СЏ РѕСЃС‚Р°РЅРѕРІРєР°: {STATIONS[Math.min(gameRef.current.stationIndex, STATIONS.length - 1)]?.title || "Р¤РёРЅРёС€РЅР°СЏ РїРµСЂРµРґР°С‡Р°"}.
                </p>
              </div>

              <div
                className="absolute left-0 bottom-0 h-1/3 w-1/4 opacity-0"
                onTouchStart={() => {
                  inputRef.current.brake = true
                }}
                onTouchEnd={() => {
                  inputRef.current.brake = false
                }}
              />
              <div
                className="absolute right-0 bottom-0 h-1/3 w-1/4 opacity-0"
                onTouchStart={() => {
                  inputRef.current.gas = true
                }}
                onTouchEnd={() => {
                  inputRef.current.gas = false
                }}
              />
            </>
          )}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <InfoCard label="РџСЂРѕРіСЂРµСЃСЃ РїР°РєРµС‚Р°" value={`${progress.toFixed(0)}%`} />
          <InfoCard label="РЎС‚Р°РЅС†РёР№ РІРїРµСЂРµРґРё" value={String(Math.max(0, STATIONS.length - gameRef.current.stationIndex))} />
          <InfoCard label="Р¤РѕСЂРјР°С‚ РјРёСЃСЃРёРё" value="СЃСЋР¶РµС‚ + РІРѕРїСЂРѕСЃС‹" />
          <InfoCard label="Р›РёС€РЅРёРµ РјРѕРЅРµС‚С‹" value="РјРёРЅРёРјСѓРј" />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {STATIONS.map((station, index) => (
            <StationCard
              key={station.id}
              title={station.title}
              fact={station.shortFact}
              state={gameRef.current.stationIndex > index ? "done" : gameRef.current.stationIndex === index ? "active" : "pending"}
            />
          ))}
        </div>
      </main>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
      <p className="text-sm text-cyan-200/70">{label}</p>
      <p className="text-lg font-semibold text-white mt-1">{value}</p>
    </div>
  )
}


function StationCard({
  title,
  fact,
  state,
}: {
  title: string
  fact: string
  state: "pending" | "active" | "done"
}) {
  const stateStyles =
    state === "done"
      ? "border-emerald-300/40 bg-emerald-500/10"
      : state === "active"
        ? "border-cyan-300/50 bg-cyan-500/15"
        : "border-cyan-500/20 bg-cyan-500/5"

  const stateText = state === "done" ? "Пройдена" : state === "active" ? "Текущая" : "Впереди"

  return (
    <div className={`rounded-2xl border p-4 ${stateStyles}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-white">{title}</p>
        <span className="text-xs text-cyan-200/90">{stateText}</span>
      </div>
      <p className="mt-2 text-sm text-cyan-100/80 line-clamp-2">{fact}</p>
    </div>
  )
}

