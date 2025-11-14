# Chat WebSocket - Guía de Integración para Frontend

## Descripción

El sistema de chat permite a los usuarios hacer consultas en tiempo real sobre sus análisis de facturas usando WebSockets y Google Gemini AI.

## Endpoints Disponibles

### 1. Crear Sesión de Chat
```http
POST http://localhost:2000/chat/sessions
Content-Type: application/json
```

**Request Body (opcional):**
```json
{
  "context": {
    "total_spent": 12450.50,
    "total_invoices": 48,
    "total_suppliers": 12,
    "period": "monthly",
    "top_suppliers": [
      {
        "name": "Proveedor A",
        "total": 5000.50
      }
    ],
    "categories": [
      {
        "name": "Servicios",
        "total": 8000.00
      }
    ]
  }
}
```

**Response:**
```json
{
  "session_id": "e680d463-a116-48c4-91a9-92eebf128901",
  "status": "created",
  "websocket_url": "ws://localhost:2000/chat/ws/e680d463-a116-48c4-91a9-92eebf128901"
}
```

### 2. Conectar al WebSocket
```
ws://localhost:2000/chat/ws/{session_id}
```

### 3. Obtener Historial de Chat
```http
GET http://localhost:2000/chat/sessions/{session_id}/history
```

**Response:**
```json
{
  "session_id": "e680d463-a116-48c4-91a9-92eebf128901",
  "history": [
    {
      "role": "user",
      "content": "¿Cuál es mi gasto total?"
    },
    {
      "role": "assistant",
      "content": "Según el análisis, tu gasto total es de $12,450.50 en 48 facturas."
    }
  ]
}
```

### 4. Listar Sesiones Activas
```http
GET http://localhost:2000/chat/sessions
```

**Response:**
```json
{
  "active_sessions": [
    "e680d463-a116-48c4-91a9-92eebf128901",
    "a7b3c5d9-2234-11ec-9621-0242ac130002"
  ]
}
```

### 5. Actualizar Contexto
```http
POST http://localhost:2000/chat/sessions/{session_id}/context
Content-Type: application/json
```

**Request Body:**
```json
{
  "context": {
    "total_spent": 15000.00,
    "total_invoices": 52
  }
}
```

### 6. Eliminar Sesión
```http
DELETE http://localhost:2000/chat/sessions/{session_id}
```

## Implementación en Frontend

### React/Next.js con TypeScript

```typescript
import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AnalysisContext {
  total_spent: number;
  total_invoices: number;
  total_suppliers: number;
  period?: string;
  top_suppliers?: Array<{ name: string; total: number }>;
  categories?: Array<{ name: string; total: number }>;
}

export function useChat(analysisContext?: AnalysisContext) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // 1. Crear sesión y conectar al WebSocket
  const connect = async () => {
    try {
      setIsLoading(true);

      // Paso 1: Crear sesión
      const response = await fetch('http://localhost:2000/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: analysisContext || {}
        })
      });

      if (!response.ok) {
        throw new Error('Error al crear sesión');
      }

      const { session_id } = await response.json();
      sessionIdRef.current = session_id;

      // Paso 2: Conectar al WebSocket
      const ws = new WebSocket(`ws://localhost:2000/chat/ws/${session_id}`);

      ws.onopen = () => {
        console.log('✅ Conectado al chat');
        setIsConnected(true);
        setIsLoading(false);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'system') {
          // Mensaje del sistema (bienvenida)
          setMessages(prev => [...prev, {
            role: 'system',
            content: data.content
          }]);
        } else if (data.type === 'chunk') {
          // Streaming de respuesta (ir agregando texto)
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + data.content }
              ];
            } else {
              return [...prev, { role: 'assistant', content: data.content }];
            }
          });
        } else if (data.type === 'message') {
          // Mensaje completo
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.content
          }]);
        } else if (data.type === 'error') {
          // Error
          console.error('Error del chat:', data.content);
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Error: ${data.content}`
          }]);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ Error WebSocket:', error);
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.onclose = () => {
        console.log('🔌 Desconectado del chat');
        setIsConnected(false);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('Error al conectar:', error);
      setIsLoading(false);
    }
  };

  // 2. Enviar mensaje
  const sendMessage = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket no está conectado');
      return;
    }

    // Agregar mensaje del usuario a la UI
    setMessages(prev => [...prev, { role: 'user', content }]);

    // Enviar al servidor
    wsRef.current.send(JSON.stringify({
      type: 'message',
      content: content
    }));
  };

  // 3. Actualizar contexto durante la sesión
  const updateContext = async (newContext: Partial<AnalysisContext>) => {
    if (!sessionIdRef.current) return;

    try {
      const response = await fetch(
        `http://localhost:2000/chat/sessions/${sessionIdRef.current}/context`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ context: newContext })
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar contexto');
      }

      console.log('✅ Contexto actualizado');
    } catch (error) {
      console.error('Error al actualizar contexto:', error);
    }
  };

  // 4. Desconectar
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    connect,
    sendMessage,
    updateContext,
    disconnect
  };
}
```

### Componente de Chat

```tsx
'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';

interface ChatProps {
  analysisData: {
    total_spent: number;
    total_invoices: number;
    total_suppliers: number;
  };
}

export default function Chat({ analysisData }: ChatProps) {
  const [input, setInput] = useState('');
  const { messages, isConnected, isLoading, connect, sendMessage, disconnect } = useChat(analysisData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Chat - Asistente de Análisis</h2>
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Conectando...' : 'Conectar'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-green-500">● Conectado</span>
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Desconectar
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'assistant'
                  ? 'bg-gray-200 text-gray-900'
                  : 'bg-yellow-100 text-gray-700'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
```

### Uso en una Página

```tsx
'use client';

import Chat from '@/components/Chat';
import { useState, useEffect } from 'react';

export default function AnalysisPage() {
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    // Cargar datos del análisis
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    const response = await fetch('http://localhost:2000/insights/summary-quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoices: [/* tus facturas */],
        period: 'monthly'
      })
    });
    
    const data = await response.json();
    setAnalysisData({
      total_spent: data.total_spent,
      total_invoices: data.total_invoices,
      total_suppliers: data.total_suppliers
    });
  };

  if (!analysisData) {
    return <div>Cargando análisis...</div>;
  }

  return (
    <div className="h-screen">
      <Chat analysisData={analysisData} />
    </div>
  );
}
```

## Formatos de Mensajes

### Cliente → Servidor

```json
{
  "type": "message",
  "content": "¿Cuál es mi gasto total este mes?"
}
```

### Servidor → Cliente

**Mensaje del sistema:**
```json
{
  "type": "system",
  "content": "Conexión establecida. ¿En qué puedo ayudarte hoy?"
}
```

**Streaming (chunks):**
```json
{
  "type": "chunk",
  "content": "Según el "
}
```

**Mensaje completo:**
```json
{
  "type": "message",
  "content": "Tu gasto total es de $12,450.50"
}
```

**Error:**
```json
{
  "type": "error",
  "content": "Error al procesar tu solicitud"
}
```

## Preguntas Sugeridas para el Usuario

- "¿Cuál es mi gasto total este mes?"
- "¿Cuáles son mis principales proveedores?"
- "¿En qué categoría gasto más?"
- "Muéstrame un resumen de mis facturas"
- "¿Qué tendencias observas en mis gastos?"
- "¿Cómo puedo reducir mis gastos?"
- "Dame recomendaciones basadas en mi análisis"

## Solución de Problemas

### Error: "WebSocket is closed before connection"

**Causa:** La sesión no se creó antes de conectar al WebSocket.

**Solución:** Siempre crear la sesión con `POST /chat/sessions` ANTES de conectar al WebSocket.

### Error: 404 en WebSocket

**Causa:** La URL del WebSocket es incorrecta.

**Solución:** Asegúrate de usar `ws://localhost:2000/chat/ws/{session_id}` (no `wss://` en desarrollo).

### El chat no responde

**Causa:** Puede que el servidor no esté corriendo o la API key de Gemini sea inválida.

**Solución:** Verifica que el servidor esté corriendo con `uvicorn app.main:app --reload --port 2000` y que la variable `GEMINI_API_KEY` esté configurada en el `.env`.

### Mensajes duplicados

**Causa:** Múltiples conexiones WebSocket a la misma sesión.

**Solución:** Asegúrate de cerrar la conexión anterior antes de crear una nueva con `disconnect()`.

## Notas Importantes

1. **Contexto Opcional:** Puedes crear una sesión sin contexto y el chat funcionará, pero las respuestas serán más genéricas.

2. **Streaming:** El servidor envía la respuesta en chunks para mejor UX. Debes ir concatenando los chunks para mostrar el texto progresivamente.

3. **Persistencia:** Las sesiones se mantienen en memoria. Si reinicias el servidor, se perderán. Para producción, considera usar Redis.

4. **Rate Limiting:** No implementado aún. En producción, considera agregar rate limiting por usuario.

5. **Autenticación:** Este ejemplo no incluye autenticación. Para producción, agrega JWT o sesiones.

## Ejemplo Completo en Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Chat Test</title>
</head>
<body>
  <div id="chat"></div>
  <input id="input" type="text" placeholder="Escribe tu mensaje...">
  <button id="send">Enviar</button>

  <script>
    let ws;
    let sessionId;

    async function initChat() {
      // Crear sesión
      const response = await fetch('http://localhost:2000/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            total_spent: 12450.50,
            total_invoices: 48
          }
        })
      });

      const data = await response.json();
      sessionId = data.session_id;

      // Conectar WebSocket
      ws = new WebSocket(`ws://localhost:2000/chat/ws/${sessionId}`);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const chatDiv = document.getElementById('chat');
        chatDiv.innerHTML += `<p><strong>${data.type}:</strong> ${data.content}</p>`;
      };

      ws.onopen = () => {
        console.log('Conectado!');
      };
    }

    document.getElementById('send').onclick = () => {
      const input = document.getElementById('input');
      const message = input.value;

      ws.send(JSON.stringify({
        type: 'message',
        content: message
      }));

      document.getElementById('chat').innerHTML += 
        `<p><strong>Tú:</strong> ${message}</p>`;
      
      input.value = '';
    };

    // Iniciar al cargar
    initChat();
  </script>
</body>
</html>
```

## Testing con cURL

```bash
# 1. Crear sesión
curl -X POST http://localhost:2000/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"context": {"total_spent": 12450.50}}'

# 2. Listar sesiones
curl http://localhost:2000/chat/sessions

# 3. Ver historial
curl http://localhost:2000/chat/sessions/YOUR_SESSION_ID/history
```

## Testing con wscat

```bash
# Instalar wscat
npm install -g wscat

# Conectar al WebSocket
wscat -c ws://localhost:2000/chat/ws/YOUR_SESSION_ID

# Enviar mensaje
> {"type": "message", "content": "Hola"}
```
