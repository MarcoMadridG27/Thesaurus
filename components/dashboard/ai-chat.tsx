"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { Send, Loader2, MessageSquare, Sparkles } from "lucide-react"
import { createChatSession, type ChatContext } from "@/lib/api"
import { invoiceStore } from "@/lib/store"
import { marked } from "marked"

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface WebSocketMessage {
  type: 'chunk' | 'done' | 'error' | 'system'
  content: string
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentResponseRef = useRef<string>('')

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId])

  // Conectar al WebSocket
  const connectWebSocket = async () => {
    try {
      setIsLoading(true)

      // Obtener contexto del store
      const stats = invoiceStore.getStats()
      const context: ChatContext = {
        total_spent: stats.totalSpent,
        total_invoices: stats.invoiceCount,
        total_suppliers: stats.supplierCount,
      }

      // Crear sesión
      const result = await createChatSession(context)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Error al crear sesión')
      }

      setSessionId(result.data.session_id)

      // Conectar WebSocket
      const ws = new WebSocket(result.data.websocket_url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('✅ WebSocket conectado')
        setIsConnected(true)
        setIsLoading(false)
      }

      ws.onmessage = (event) => {
        const msg: WebSocketMessage = JSON.parse(event.data)
        
        if (msg.type === 'system') {
          setMessages(prev => [...prev, {
            role: 'system',
            content: msg.content,
            timestamp: new Date(),
          }])
        } else if (msg.type === 'chunk') {
          // Acumular chunks
          currentResponseRef.current += msg.content
          
          // Actualizar mensaje en tiempo real
          setMessages(prev => {
            const lastMsg = prev.at(-1)
            if (lastMsg?.role === 'assistant') {
              return [...prev.slice(0, -1), {
                ...lastMsg,
                content: currentResponseRef.current,
              }]
            }
            return [...prev, {
              role: 'assistant',
              content: currentResponseRef.current,
              timestamp: new Date(),
            }]
          })
        } else if (msg.type === 'done') {
          // Finalizar respuesta
          currentResponseRef.current = ''
          setIsLoading(false)
        } else if (msg.type === 'error') {
          console.error('❌ Error del servidor:', msg.content)
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Error: ${msg.content}`,
            timestamp: new Date(),
          }])
          setIsLoading(false)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        setIsConnected(false)
        setIsLoading(false)
      }

      ws.onclose = () => {
        console.log('🔌 WebSocket desconectado')
        setIsConnected(false)
        setIsLoading(false)
      }

    } catch (error) {
      console.error('Error al conectar:', error)
      setIsLoading(false)
    }
  }

  // Enviar mensaje
  const sendMessage = () => {
    if (!input.trim() || !wsRef.current || !isConnected) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    currentResponseRef.current = ''

    // Enviar al WebSocket
    const stats = invoiceStore.getStats()
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: input,
      context: {
        total_spent: stats.totalSpent,
        total_invoices: stats.invoiceCount,
        total_suppliers: stats.supplierCount,
      },
    }))

    setInput('')
  }

  // Desconectar
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
    setSessionId(null)
    setMessages([])
  }

  return (
    <Card className="flex flex-col h-[600px] overflow-hidden shadow-xl border-0 bg-linear-to-br from-slate-50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* Header Moderno */}
      <div className="p-5 border-b border-border/50 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-lg shadow-teal-500/50">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Asistente IA</h3>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">En línea</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {isConnected ? (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={disconnect}
              className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all hover:scale-105"
            >
              Desconectar
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={connectWebSocket} 
              disabled={isLoading}
              className="bg-gradient-premium hover:scale-105 transition-transform shadow-lg hover:shadow-teal-500/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Iniciar
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isConnected && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="w-12 h-12 mb-4 text-primary/50" />
            <p className="text-sm">Inicia una conversación con el asistente IA</p>
            <p className="text-xs mt-2">Haz preguntas sobre tus facturas, gastos y proveedores</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          // Convertir Markdown a HTML para mensajes del asistente
          const htmlContent = msg.role === 'assistant' 
            ? marked.parse(msg.content, { async: false })
            : msg.content

          // Determinar estilo del mensaje
          let bubbleClass = ''
          if (msg.role === 'user') {
            bubbleClass = 'bg-gradient-premium text-white'
          } else if (msg.role === 'system') {
            bubbleClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm italic'
          } else {
            bubbleClass = 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
          }
          
          return (
            <div
              key={`${msg.role}-${msg.timestamp.getTime()}-${idx}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${bubbleClass}`}>
                {msg.role === 'assistant' ? (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none prose-ul:my-2 prose-li:my-0 prose-strong:text-primary prose-strong:font-semibold"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )
        })}

        {isLoading && messages.at(-1)?.role !== 'assistant' && (
          <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Escribiendo...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Escribe tu mensaje..." : "Conecta primero para chatear"}
            disabled={!isConnected || isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!isConnected || isLoading || !input.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  )
}
