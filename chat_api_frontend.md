# 📘 Chat API – Documentación para el Frontend

Este módulo permite crear sesiones de chat, conectarse vía WebSocket y recibir respuestas en streaming desde la IA. También permite obtener historial, actualizar contexto y eliminar sesiones.

---

## 🔑 1. Crear una sesión de chat  
**POST** `/chat/sessions`

### Body (opcional)
```json
{
  "context": {
    "total_spent": 12450.50,
    "total_invoices": 48,
    "total_suppliers": 12
  }
}
```

### Respuesta
```json
{
  "session_id": "uuid",
  "status": "created",
  "websocket_url": "ws://localhost:2000/chat/ws/uuid"
}
```

> El frontend debe usar `session_id` y abrir WebSocket con `websocket_url`.

---

## 🔌 2. Conectar al WebSocket  

URL:

```
ws://localhost:2000/chat/ws/{session_id}
```

Al conectarse, el servidor envía:

```json
{
  "type": "system",
  "content": "Conexión establecida. ¿En qué puedo ayudarte hoy?"
}
```

---

## 💬 3. Enviar un mensaje al WebSocket  

Formato solicitado por el servidor:

```json
{
  "type": "message",
  "content": "Tu mensaje aquí",
  "context": {
    "total_spent": 10000
  }
}
```

- `content` → mensaje del usuario  
- `context` → opcional, actualiza datos de análisis o negocio  

---

## 📡 4. Tipos de mensajes enviados por el servidor (streaming)

### A. Chunk (respuesta parcial)
```json
{
  "type": "chunk",
  "content": "Texto parcial..."
}
```

### B. Finalización de respuesta
```json
{
  "type": "done",
  "content": "Texto completo generado"
}
```

### C. Error
```json
{
  "type": "error",
  "content": "Descripción del error"
}
```

---

## 📜 5. Obtener historial de la sesión  

**GET** `/chat/sessions/{session_id}/history`

### Respuesta
```json
{
  "session_id": "uuid",
  "history": [
    {"role": "user", "content": "Hola"},
    {"role": "assistant", "content": "Hola, ¿cómo puedo ayudarte?"}
  ]
}
```

---

## 🔄 6. Actualizar el contexto de la sesión  

**POST** `/chat/sessions/{session_id}/context`

### Body
```json
{
  "total_spent": 2000,
  "total_invoices": 20
}
```

### Respuesta
```json
{
  "status": "updated",
  "session_id": "uuid"
}
```

---

## 🗑️ 7. Cerrar o eliminar una sesión  

**DELETE** `/chat/sessions/{session_id}`

### Respuesta
```json
{
  "status": "deleted",
  "session_id": "uuid"
}
```

---

## 📍 8. Listar sesiones activas  

**GET** `/chat/sessions`

### Respuesta
```json
{
  "sessions": ["uuid1", "uuid2"],
  "count": 2
}
```

---

## 🧩 9. Ejemplo práctico en frontend (Next.js / React)

### Crear sesión y conectar
```ts
const res = await fetch("http://localhost:2000/chat/sessions", {
  method: "POST"
});

const data = await res.json();
const ws = new WebSocket(data.websocket_url);
```

### Enviar mensaje
```ts
ws.send(JSON.stringify({
  type: "message",
  content: "Explícame mis gastos",
  context: { total_spent: 10000 }
}));
```

### Recibir respuestas en streaming
```ts
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "chunk") {
    setResponse(prev => prev + msg.content);
  }

  if (msg.type === "done") {
    console.log("Respuesta final:", msg.content);
  }

  if (msg.type === "error") {
    console.error("Error:", msg.content);
  }
};
```

---

# ✔ Archivo generado automáticamente como Markdown
