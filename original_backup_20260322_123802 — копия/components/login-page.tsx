"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Eye, EyeOff, Loader2, User, Lock, Mail, KeyRound, ArrowLeft, CheckCircle, Bug, Zap, Wifi, Server, Database, Cloud, AlertTriangle } from "lucide-react"

type AuthStep = "login" | "register" | "verify"

interface FloatingIcon {
  id: number
  Icon: typeof Bug
  x: number
  y: number
  size: number
  speed: number
  delay: number
  color: string
}

export function LoginPage() {
  const { login, register, verifyCode } = useAuth()
  const [step, setStep] = useState<AuthStep>("login")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([])

  // Generate floating icons on mount
  useEffect(() => {
    const icons = [Bug, Zap, Wifi, Server, Database, Cloud, AlertTriangle, Shield]
    const colors = ["text-red-400", "text-cyan-400", "text-purple-400", "text-blue-400", "text-green-400", "text-yellow-400", "text-pink-400", "text-orange-400"]
    
    const generated: FloatingIcon[] = []
    for (let i = 0; i < 15; i++) {
      generated.push({
        id: i,
        Icon: icons[Math.floor(Math.random() * icons.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 16 + Math.random() * 24,
        speed: 3 + Math.random() * 4,
        delay: Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setFloatingIcons(generated)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email.includes("@")) {
      setError("Введите корректный email")
      return
    }
    
    if (password.length < 4) {
      setError("Пароль должен содержать минимум 4 символа")
      return
    }
    
    setIsLoading(true)
    
    try {
      const success = await login(email, password)
      if (!success) {
        setError("Неверный email или пароль")
      }
    } catch {
      setError("Произошла ошибка. Попробуйте снова.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email.includes("@")) {
      setError("Введите корректный email")
      return
    }
    
    if (username.length < 3) {
      setError("Имя пользователя должно содержать минимум 3 символа")
      return
    }
    
    if (password.length < 4) {
      setError("Пароль должен содержать минимум 4 символа")
      return
    }
    
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await register(email, username, password)
      if (result.success && result.code) {
        setGeneratedCode(result.code)
        setStep("verify")
      } else {
        setError("Пользователь с таким email уже существует")
      }
    } catch {
      setError("Произошла ошибка. Попробуйте снова.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (verificationCode.length !== 6) {
      setError("Код должен содержать 6 цифр")
      return
    }
    
    setIsLoading(true)
    
    try {
      const success = await verifyCode(email, verificationCode)
      if (!success) {
        setError("Неверный код подтверждения")
      }
    } catch {
      setError("Произошла ошибка. Попробуйте снова.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setUsername("")
    setPassword("")
    setConfirmPassword("")
    setVerificationCode("")
    setGeneratedCode("")
    setError("")
  }

  return (
    <div className="min-h-screen gradient-bg-animated wave-lines flex items-center justify-center p-4">
      {/* Dynamic floating icons background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((icon) => {
          const IconComponent = icon.Icon
          return (
            <div
              key={icon.id}
              className={`absolute ${icon.color} opacity-20 animate-float`}
              style={{
                left: `${icon.x}%`,
                top: `${icon.y}%`,
                animationDelay: `${icon.delay}s`,
                animationDuration: `${icon.speed}s`,
              }}
            >
              <IconComponent style={{ width: icon.size, height: icon.size }} />
            </div>
          )
        })}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and mascot */}
        <div className="text-center mb-8">
          <div className="relative w-40 h-40 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-xl animate-pulse-glow" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-blue-500/60 neon-purple shadow-lg shadow-blue-500/30">
              <Image
                src="/images/ninja-mascot.png"
                alt="DDOS-GUARD Ninja"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              DDOS-GUARD
            </h1>
          </div>
          <p className="text-purple-300/80 text-lg">Games Arena</p>
        </div>

        {/* Auth forms */}
        <div className="glass-card rounded-2xl p-8">
          {/* Login Form */}
          {step === "login" && (
            <>
              <h2 className="text-2xl font-bold text-center mb-6 text-white">
                Вход в аккаунт
              </h2>
              
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg rounded-xl neon-purple transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Войти"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    resetForm()
                    setStep("register")
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  Нет аккаунта? Зарегистрироваться
                </button>
              </div>
            </>
          )}

          {/* Register Form */}
          {step === "register" && (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => {
                    resetForm()
                    setStep("login")
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-center flex-1 text-white">
                  Регистрация
                </h2>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Подтвердите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg rounded-xl neon-purple transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Продолжить"
                  )}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    resetForm()
                    setStep("login")
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  Уже есть аккаунт? Войти
                </button>
              </div>
            </>
          )}

          {/* Verification Form */}
          {step === "verify" && (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={() => {
                    setStep("register")
                    setVerificationCode("")
                    setError("")
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-center flex-1 text-white">
                  Подтверждение
                </h2>
              </div>

              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-purple-300/80 text-sm mb-4">
                  Код подтверждения отправлен на {email}
                </p>
                
                {/* Display the code prominently */}
                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                  <p className="text-purple-300 text-sm mb-2">Ваш код подтверждения:</p>
                  <p className="text-4xl font-mono font-bold text-cyan-400 tracking-widest">
                    {generatedCode}
                  </p>
                  <p className="text-purple-400/60 text-xs mt-2">
                    (В демо-режиме код показан на странице)
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <Input
                    type="text"
                    placeholder="Введите 6-значный код"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-11 h-12 bg-white/5 border-purple-500/30 text-white placeholder:text-purple-300/50 focus:border-purple-400 focus:ring-purple-400/20 text-center text-xl tracking-widest font-mono"
                    maxLength={6}
                  />
                </div>
                
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm text-center">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg rounded-xl neon-purple transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Подтвердить"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-purple-400/60 text-xs">
            Защищено технологиями DDOS-GUARD
          </p>
        </div>
      </div>
    </div>
  )
}
