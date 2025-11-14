"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { createChatSession, type ChatContext } from "@/lib/api"
import { invoiceStore } from "@/lib/store"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface WebSocketMessage {
  type: 'chunk' | 'done' | 'error' | 'system'
  content: string
}

export default function QueriesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentResponseRef = useRef<string>('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pendingChunksRef = useRef<string>('')

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Conectar automáticamente al cargar
  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [sessionId])

  const connectWebSocket = async () => {
    if (isConnected || isConnecting) return

    try {
      setIsConnecting(true)

      // Obtener contexto del store
      const stats = invoiceStore.getStats()
      const context: ChatContext = {
        total_spent: stats.totalSpent,
        total_invoices: stats.invoiceCount,
        total_suppliers: stats.supplierCount,
      }

      console.log('🔌 Creando sesión de chat con contexto:', context)

      // Crear sesión
      const result = await createChatSession(context)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear sesión')
      }

      console.log('✅ Sesión creada:', result.data.session_id)
      console.log('🔗 Conectando a WebSocket:', result.data.websocket_url)
      setSessionId(result.data.session_id)

      // IMPORTANTE: Esperar un momento antes de conectar WebSocket
      await new Promise(resolve => setTimeout(resolve, 100))

      // Conectar WebSocket
      const ws = new WebSocket(result.data.websocket_url)
      wsRef.current = ws

      // Timeout para detectar si no se conecta
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('❌ Timeout: WebSocket no se conectó en 10 segundos')
          ws.close()
          setIsConnecting(false)
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: '❌ No se pudo conectar con el servidor de chat. Verifica que el servicio de insights esté corriendo en http://localhost:2000 y que el endpoint WebSocket /chat/ws esté disponible.',
            timestamp: new Date(),
          }])
        }
      }, 10000)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        console.log('✅ WebSocket conectado exitosamente')
        setIsConnected(true)
        setIsConnecting(false)
      }

      ws.onmessage = (event) => {
        const msg: WebSocketMessage = JSON.parse(event.data)
        console.log('📨 Mensaje recibido:', msg)

        if (msg.type === 'system') {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: msg.content,
            timestamp: new Date(),
          }])
        } else if (msg.type === 'chunk') {
          // Agregar el chunk al buffer pendiente
          pendingChunksRef.current += msg.content

          // Si no hay intervalo de escritura activo, iniciar uno
          if (!typingIntervalRef.current) {
            // Crear o actualizar el mensaje del asistente si no existe
            setMessages(prev => {
              const lastMsg = prev.at(-1)
              if (lastMsg?.role !== 'assistant') {
                return [...prev, {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                }]
              }
              return prev
            })

            // Efecto de escritura letra por letra
            typingIntervalRef.current = setInterval(() => {
              if (pendingChunksRef.current.length > 0) {
                // Tomar la primera letra del buffer
                const nextChar = pendingChunksRef.current[0]
                pendingChunksRef.current = pendingChunksRef.current.slice(1)
                currentResponseRef.current += nextChar

                // Actualizar el mensaje
                setMessages(prev => {
                  const lastMsg = prev.at(-1)
                  if (lastMsg?.role === 'assistant') {
                    return [...prev.slice(0, -1), {
                      ...lastMsg,
                      content: currentResponseRef.current,
                    }]
                  }
                  return prev
                })
              } else if (!pendingChunksRef.current.length && typingIntervalRef.current) {
                // Si ya no hay más texto pendiente, detener el intervalo
                clearInterval(typingIntervalRef.current)
                typingIntervalRef.current = null
              }
            }, 20) // 20ms por letra = efecto de escritura rápida
          }
        } else if (msg.type === 'done') {
          console.log('✅ Respuesta completa')
          
          // Mostrar cualquier texto pendiente inmediatamente
          if (pendingChunksRef.current.length > 0) {
            currentResponseRef.current += pendingChunksRef.current
            setMessages(prev => {
              const lastMsg = prev.at(-1)
              if (lastMsg?.role === 'assistant') {
                return [...prev.slice(0, -1), {
                  ...lastMsg,
                  content: currentResponseRef.current,
                }]
              }
              return prev
            })
            pendingChunksRef.current = ''
          }

          // Limpiar el intervalo si aún está activo
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
            typingIntervalRef.current = null
          }

          setIsLoading(false)
        } else if (msg.type === 'error') {
          console.error('❌ Error del servidor:', msg.content)
          
          // Limpiar intervalo de escritura
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current)
            typingIntervalRef.current = null
          }
          pendingChunksRef.current = ''
          currentResponseRef.current = ''
          
          // Detectar error 429 de rate limit
          let errorMessage = `Error: ${msg.content}`
          if (msg.content.includes('429') || msg.content.includes('Resource exhausted')) {
            errorMessage = '⚠️ El servidor está sobrecargado. Por favor espera unos segundos antes de enviar otra pregunta.'
          }
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: errorMessage,
            timestamp: new Date(),
          }])
          setIsLoading(false)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ Error en WebSocket:', error)
        clearTimeout(connectionTimeout)
        setIsConnected(false)
        setIsConnecting(false)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '⚠️ Error de conexión con el servidor. El servicio de insights puede no estar disponible.',
          timestamp: new Date(),
        }])
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        console.log('🔌 WebSocket cerrado. Código:', event.code, 'Razón:', event.reason || 'Sin razón especificada')
        setIsConnected(false)
        setIsConnecting(false)

        // Mensajes descriptivos según código de cierre
        let closeMessage = ''
        if (event.code === 1006) {
          closeMessage = '❌ Conexión cerrada abruptamente. El servidor puede no estar disponible o el endpoint WebSocket no está implementado. Verifica que el servicio de insights esté corriendo en http://localhost:2000'
        } else if (event.code === 1001) {
          closeMessage = '👋 Conexión cerrada por el servidor'
        } else if (event.code === 1000) {
          closeMessage = '✓ Conexión cerrada normalmente'
        } else {
          closeMessage = `⚠️ Conexión cerrada con código ${event.code}: ${event.reason || 'Sin razón'}`
        }

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: closeMessage,
          timestamp: new Date(),
        }])
      }

    } catch (error) {
      console.error('❌ Error al conectar:', error)
      setIsConnecting(false)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `Error al conectar con el servidor. Verifica que el servicio de insights esté corriendo en http://localhost:2000`,
        timestamp: new Date(),
      }])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !wsRef.current || !isConnected || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Limpiar refs del efecto de escritura anterior ANTES de resetear currentResponseRef
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }
    pendingChunksRef.current = ''
    currentResponseRef.current = ''

    // Enviar al WebSocket (reutilizando la misma sesión)
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: input,
    }))

    console.log('📤 Mensaje enviado:', input)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Consultas con IA</h1>
            <p className="text-foreground/70">Hazle preguntas a tu asistente financiero</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnecting && (
              <span className="px-3 py-1 text-sm bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Conectando...
              </span>
            )}
            {isConnected && !isConnecting && (
              <span className="px-3 py-1 text-sm bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{' '}
                Conectado
              </span>
            )}
            {!isConnected && !isConnecting && (
              <Button size="sm" variant="outline" onClick={connectWebSocket}>
                Reconectar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-card rounded-lg border border-border p-6 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <p className="text-lg mb-2">¡Hola! Soy tu asistente financiero IA.</p>
                <p className="text-sm">Puedo ayudarte a analizar tus gastos, responder preguntas sobre tus finanzas y proporcionar insights.</p>
                <p className="text-sm mt-4 text-foreground/50">
                  {isConnecting && 'Conectando...'}
                  {isConnected && !isConnecting && '¿Qué necesitas saber?'}
                  {!isConnected && !isConnecting && 'Conectando con el servidor...'}
                </p>
              </div>
            </div>
          )}
          {messages.map((message) => {
            let msgClass = "bg-muted text-foreground border border-border rounded-bl-none"
            if (message.role === "user") {
              msgClass = "bg-primary text-primary-foreground rounded-br-none"
            } else if (message.role === "system") {
              msgClass = "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border border-yellow-500/20 rounded-lg"
            }
            
            return (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-lg ${msgClass}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )
          })}
          {isLoading && messages.at(-1)?.role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="bg-muted border border-border px-4 py-2 rounded-lg rounded-bl-none">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <Input
            placeholder="Hazme una pregunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            disabled={isLoading || !isConnected}
          />
          <Button onClick={handleSend} disabled={isLoading || !isConnected} size="icon">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
