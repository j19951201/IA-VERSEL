# Produccion Segura IA Juris (VM 24/7)

## Objetivo
Mantener el cerebro GGUF fuera de Vercel, en una VM dedicada, con acceso controlado por token e IP, limite de peticiones y monitoreo de salud.

## Arquitectura recomendada
- Frontend publico: Vercel (sitio y `api/chat`).
- Cerebro privado: Ollama en VM (`127.0.0.1:11434`).
- Capa de seguridad: `scripts/secure_ollama_proxy.js` en VM (`0.0.0.0:11435`).
- Exposicion publica del proxy: Cloudflare Tunnel (o IP publica con firewall estricto).

## Puertos exactos
- `11434/tcp`: Ollama local (NO exponer en internet).
- `11435/tcp`: Secure proxy (solo permitido para el origen del tunnel/reverse proxy).
- `443/tcp`: Entrada publica por Cloudflare (recomendado).

## Variables de entorno (VM)
Crear un archivo `.env.proxy` con:

```env
SECURE_PROXY_HOST=0.0.0.0
SECURE_PROXY_PORT=11435
OLLAMA_UPSTREAM=http://127.0.0.1:11434

# Token activo
SECURE_PROXY_TOKEN=CAMBIA_ESTE_TOKEN_LARGO_ALEATORIO

# Token anterior para rotacion sin downtime (opcional)
SECURE_PROXY_PREVIOUS_TOKEN=

# Solo /api/generate + /health (mas seguro)
SECURE_PROXY_EXPOSE_TAGS=false

# Lista de IPs permitidas
SECURE_PROXY_ALLOWED_IPS=127.0.0.1,::1

# Rate limit
SECURE_PROXY_RATE_LIMIT_ENABLED=true
SECURE_PROXY_RATE_LIMIT_WINDOW_MS=60000
SECURE_PROXY_RATE_LIMIT_MAX_REQUESTS=60

# Healthcheck real a Ollama
SECURE_PROXY_HEALTHCHECK_UPSTREAM=true
```

## Variables de entorno (Vercel)
Configurar en proyecto Vercel:

- `INTERNAL_AI_API_URL=https://TU_ENDPOINT_PRIVADO/api/generate`
- `INTERNAL_AI_AUTH_HEADER=Authorization`
- `INTERNAL_AI_AUTH_SCHEME=Bearer`
- `INTERNAL_AI_API_KEY=CAMBIA_ESTE_TOKEN_LARGO_ALEATORIO`
- `INTERNAL_AI_TIMEOUT_MS=60000`
- `PUBLIC_FORCE_FIXED_LENGTH=0`

## Autenticacion y rotacion de token (sin caida)
1. Generar token nuevo.
2. En VM:
   - `SECURE_PROXY_PREVIOUS_TOKEN=<token_actual>`
   - `SECURE_PROXY_TOKEN=<token_nuevo>`
3. Reiniciar proxy.
4. Actualizar `INTERNAL_AI_API_KEY` en Vercel con `<token_nuevo>`.
5. Verificar trafico OK.
6. Vaciar `SECURE_PROXY_PREVIOUS_TOKEN` y reiniciar proxy.

## Firewall minimo (Windows VM)
Permitir solo lo necesario:

```powershell
New-NetFirewallRule -DisplayName "IAJuris Secure Proxy 11435" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 11435 -Profile Any
```

Si usas Cloudflare Tunnel local, restringe por loopback y no abras 11435 a internet.

## Arranque de servicios 24/7
En VM, iniciar:
1. Ollama.
2. Proxy seguro.
3. Tunnel (Cloudflare named tunnel recomendado).

Comandos base:

```powershell
# Ollama
ollama serve

# Proxy seguro
node scripts/secure_ollama_proxy.js

# Tunnel (ejemplo)
cloudflared tunnel run ia-juris-proxy
```

## Healthcheck y verificacion
Checks directos:

```powershell
# Health del proxy (incluye estado de Ollama)
Invoke-RestMethod -Uri "http://127.0.0.1:11435/health" -Method Get

# Prueba autenticada al generate
$body = @{ model = "corvinus-legal:latest"; prompt = "Responde SOLO OK"; stream = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:11435/api/generate" -Method Post -Headers @{ Authorization = "Bearer CAMBIA_ESTE_TOKEN_LARGO_ALEATORIO" } -ContentType "application/json" -Body $body
```

Checks desde Vercel:

```powershell
$body = @{ prompt = "Prueba de conectividad" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://ia-juris-app.vercel.app/api/chat" -Method Post -ContentType "application/json" -Body $body
```

## Rate limit recomendado
- Inicio: `60 req/min` por IP.
- Si hay abuso: bajar a `30 req/min`.
- Si hay trafico legitimo alto: subir a `120 req/min` y monitorear.

## Checklist final (go-live)
- [ ] GGUF solo en VM (nunca en repo Vercel).
- [ ] `SECURE_PROXY_TOKEN` fuerte y secreto.
- [ ] `SECURE_PROXY_ALLOWED_IPS` restringido.
- [ ] `SECURE_PROXY_RATE_LIMIT_ENABLED=true`.
- [ ] Healthcheck retorna `ok: true`.
- [ ] Vercel responde via proxy privado.
- [ ] Rotacion de token probada.
- [ ] Backups de modelo y scripts de arranque.
