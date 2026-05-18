document.addEventListener("DOMContentLoaded", function () {
  const openAssistantChatBtn = document.getElementById("openAssistantChatBtn");
  const openAssistantChatBtnFloating = document.getElementById("openAssistantChatBtnFloating");
  const chatModal = document.getElementById("chatModal");
  const closeModalBtn = document.getElementById("closeModal");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const voiceBtn = document.getElementById("voiceBtn");

  const OLLAMA_API_URL = "http://127.0.0.1:11434/api/generate";
  const API_CHAT_URL = "/api/chat";
  const MODEL_FALLBACK_ORDER = [
    "gemma2:2b",
    "gemma:2b",
    "corvinus-legal:latest",
    "corvinus-llm:latest",
    "corvinus-x-ip:latest",
    "corvinus-2025:latest"
  ];
  const MODEL_TIMEOUT_MS = 25000;
  const MAX_RESPONSE_CHARS = 4800;

  let currentModel = MODEL_FALLBACK_ORDER[0];
  let cancelVoiceCycle = false;
  let usePublicAPI = true; // En Vercel usar /api/chat, localmente intentar Ollama directo

  function openModal() {
    chatModal.classList.add("active");
    chatModal.setAttribute("aria-hidden", "false");
    chatInput.focus();
  }

  function closeModal() {
    chatModal.classList.remove("active");
    chatModal.setAttribute("aria-hidden", "true");
  }

  if (openAssistantChatBtn) openAssistantChatBtn.addEventListener("click", openModal);
  if (openAssistantChatBtnFloating) openAssistantChatBtnFloating.addEventListener("click", openModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (chatModal) {
    chatModal.addEventListener("click", function (event) {
      if (event.target === chatModal) closeModal();
    });
  }

  function addMessage(text, isUser) {
    const bubble = document.createElement("div");
    bubble.className = "message-bubble " + (isUser ? "user" : "bot");
    bubble.innerHTML = "<p>" + text + "</p>";
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function extractAssistantText(payload) {
    if (!payload || typeof payload !== "object") return "";
    if (typeof payload.response === "string" && payload.response.trim()) return payload.response.trim();
    if (typeof payload.content === "string" && payload.content.trim()) return payload.content.trim();
    if (typeof payload.text === "string" && payload.text.trim()) return payload.text.trim();
    return "";
  }

  async function callOllamaAPI(prompt, modelName) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          stream: false,
          temperature: 0.15,
          num_predict: 96,
          num_ctx: 384,
          repeat_penalty: 1.05,
          top_p: 0.9
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json().catch(() => ({}));
      return data.response || null;
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  async function callPublicAPI(prompt) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

    try {
      const response = await fetch(API_CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          prompt: prompt
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json().catch(() => ({}));
      return data.response || data.answer || null;
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  async function requestAssistant(text) {
    // Detectar si estamos en producción o desarrollo
    const isProduction = window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1";

    // En producción (Vercel), intentar primero /api/chat
    if (isProduction || usePublicAPI) {
      try {
        const response = await callPublicAPI(text);
        if (response) {
          return response.substring(0, MAX_RESPONSE_CHARS);
        }
      } catch (err) {
        // Continuar con fallback
      }
    }

    // En desarrollo local, intentar Ollama con fallback de modelos
    for (const model of MODEL_FALLBACK_ORDER) {
      try {
        const response = await callOllamaAPI(text, model);
        if (response) {
          currentModel = model;
          return response.substring(0, MAX_RESPONSE_CHARS);
        }
      } catch (err) {
        continue;
      }
    }

    throw new Error("Lo siento, no puedo procesar tu solicitud en este momento. Intenta más tarde.");
  }

  async function sendMessage() {
    const text = String(chatInput.value || "").trim();
    if (!text) return;

    addMessage(text, true);
    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;
    voiceBtn.disabled = true;

    try {
      const answer = await requestAssistant(text);
      addMessage(answer || "Sin respuesta del modelo.", false);
      speakAsMaria(answer || "");
    } catch (error) {
      const detail = error && error.message ? error.message : "sin detalle";
      addMessage("Error: " + detail, false);
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      voiceBtn.disabled = false;
      chatInput.focus();
    }
  }

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  if (chatInput) {
    chatInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") sendMessage();
    });
  }

  const MARIA_VOICE_TUNING = { rate: 0.93, pitch: 0.78, volume: 1 };

  function findPreferredMariaVoice() {
    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter(function (voice) {
      return String(voice.lang || "").toLowerCase().startsWith("es");
    });
    const preferred = ["sabina", "dalia", "renata", "helena", "sofia", "laura", "lucia", "paulina", "monica"];
    for (const name of preferred) {
      const match = spanishVoices.find(function (voice) {
        return String(voice.name || "").toLowerCase().includes(name);
      });
      if (match) return match;
    }
    return spanishVoices[0] || voices[0] || null;
  }

  function speakAsMaria(text) {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    setTimeout(function () {
      const utterance = new SpeechSynthesisUtterance(text);
      const mariaVoice = findPreferredMariaVoice();
      if (mariaVoice) utterance.voice = mariaVoice;
      utterance.lang = mariaVoice && mariaVoice.lang ? mariaVoice.lang : "es-ES";
      utterance.rate = MARIA_VOICE_TUNING.rate;
      utterance.pitch = MARIA_VOICE_TUNING.pitch;
      utterance.volume = MARIA_VOICE_TUNING.volume;
      window.speechSynthesis.speak(utterance);
    }, 120);
  }

  if (voiceBtn) {
    voiceBtn.addEventListener("click", async function () {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        addMessage("Tu navegador no soporta reconocimiento de voz.", false);
        return;
      }

      try {
        const result = await navigator.permissions.query({ name: "microphone" });
        if (result.state === "denied") {
          addMessage("Permiso de micrófono denegado. Habilítalo en tu navegador.", false);
          return;
        }
      } catch (err) {
        // Permission query not supported, proceed with recognition
      }

      const recognition = new Recognition();
      recognition.lang = "es-ES";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = function () {
        voiceBtn.classList.add("listening");
        voiceBtn.textContent = "🎤 Escuchando...";
      };

      recognition.onend = function () {
        voiceBtn.classList.remove("listening");
        voiceBtn.textContent = "🎤 Maria";
      };

      recognition.onerror = function (event) {
        voiceBtn.classList.remove("listening");
        voiceBtn.textContent = "🎤 Maria";

        if (event.error === "no-speech") {
          addMessage("No se detectó voz. Intenta nuevamente.", false);
        } else if (event.error === "network") {
          addMessage("Error de conexión. Verifica tu micrófono.", false);
        } else if (event.error === "not-allowed") {
          addMessage("Permiso de micrófono denegado. Habilítalo en tu navegador.", false);
        } else {
          console.error("Error de reconocimiento de voz:", event.error);
        }

        cancelVoiceCycle = true;
      };

      recognition.onresult = function (event) {
        const transcript = Array.from(event.results)
          .map(function (result) {
            return result[0].transcript;
          })
          .join("");

        if (!cancelVoiceCycle && transcript) {
          chatInput.value = transcript;
          sendMessage();
        }

        cancelVoiceCycle = false;
      };

      cancelVoiceCycle = false;
      recognition.start();
    });
  }
});
