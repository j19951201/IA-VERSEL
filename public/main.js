document.addEventListener("DOMContentLoaded", function () {

  // ── Detección de dispositivo ─────────────────────────────────
  const DEVICE = (function () {
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid || /Mobile|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = !isMobile && (/iPad/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)));
    const isPhone = isMobile && !isTablet;
    const type = isIOS ? "ios" : isAndroid ? "android" : isMobile ? "mobile" : isTablet ? "tablet" : "desktop";
    return { isIOS, isAndroid, isMobile, isTablet, isPhone, type };
  })();
  const MOBILE_CHROME_EDGE = DEVICE.isPhone && /(CriOS|Chrome|EdgiOS|EdgA|Edg\/)/i.test(navigator.userAgent || "");

  // Clases en <html> para poder usar CSS condicional
  document.documentElement.classList.add("device-" + DEVICE.type);
  if (DEVICE.isMobile) document.documentElement.classList.add("device-mobile");
  if (DEVICE.isIOS)    document.documentElement.classList.add("device-ios");
  if (DEVICE.isAndroid) document.documentElement.classList.add("device-android");
  if (MOBILE_CHROME_EDGE) document.documentElement.classList.add("mobile-chrome-edge");

  const splashSection = document.querySelector(".hero-card");
  const appShell = document.querySelector(".app-shell");
  const openLoginBtn = document.getElementById("openLoginBtn");
  const openRegisterBtn = document.getElementById("openRegisterBtn");
  const openAssistantChatBtn = document.getElementById("openAssistantChatBtn");
  const openTrialBtn = document.getElementById("openTrialBtn");
  const viewPlatformBtn = document.querySelector(".public-link-btn");
  const heroSection = document.getElementById("heroSection");
  const publicLanding = document.querySelector(".public-landing");
  const trialLoader = document.getElementById("trialLoader");
  const chatModal = document.getElementById("chatModal");
  const chatModalContent = document.querySelector(".chat-modal-content");
  const closeModalBtn = document.getElementById("closeModal");
  const headerLoginBtn = document.getElementById("headerLoginBtn");
  const headerRegisterBtn = document.getElementById("headerRegisterBtn");
  const headerTemporaryChatBtn = document.getElementById("headerTemporaryChatBtn");
  const headerLogoutBtn = document.getElementById("headerLogoutBtn");
  const returnLandingBtn = document.getElementById("returnLandingBtn");
  const chatHeaderRight = document.querySelector(".chat-header-right");
  const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
  const chatMessages = document.getElementById("chatMessages");
  const chatMain = document.querySelector(".chat-main");
  const chatInputStack = document.querySelector(".chat-input-stack");
  const mobileSidebarBackdrop = document.getElementById("mobileSidebarBackdrop");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const voiceBtn = document.getElementById("voiceBtn");
  const sessionDot = document.getElementById("sessionDot");
  const runtimeModelLabel = document.getElementById("runtimeModelLabel");
  const sidebarUserPhoto = document.getElementById("sidebarUserPhoto");
  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserPlan = document.getElementById("sidebarUserPlan");
  const openPlansBtn = document.getElementById("openPlansBtn");
  const sidebarActionsMenu = document.getElementById("sidebarActionsMenu");
  const sidebarProfileMenuItem = document.getElementById("sidebarProfileMenuItem");
  const sidebarLogoutMenuItem = document.getElementById("sidebarLogoutMenuItem");
  const sidebarPlansMenuItem = document.getElementById("sidebarPlansMenuItem");
  const sidebarSearchesMenuItem = document.getElementById("sidebarSearchesMenuItem");
  const profileModal = document.getElementById("profileModal");
  const closeProfileModalBtn = document.getElementById("closeProfileModal");
  const profileModalPhoto = document.getElementById("profileModalPhoto");
  const profileChangePhotoBtn = document.getElementById("profileChangePhotoBtn");
  const profileModalEmail = document.getElementById("profileModalEmail");
  const profileModalProfession = document.getElementById("profileModalProfession");
  const profileModalPlan = document.getElementById("profileModalPlan");
  const plansModal = document.getElementById("plansModal");
  const closePlansModalBtn = document.getElementById("closePlansModal");
  const subscriptionAccessModal = document.getElementById("subscriptionAccessModal");
  const closeSubscriptionAccessModalBtn = document.getElementById("closeSubscriptionAccessModal");
  const subscriptionAccessLoginBtn = document.getElementById("subscriptionAccessLoginBtn");
  const subscriptionAccessRegisterBtn = document.getElementById("subscriptionAccessRegisterBtn");
  const planWelcomeModal = document.getElementById("planWelcomeModal");
  const closePlanWelcomeModalBtn = document.getElementById("closePlanWelcomeModal");
  const planWelcomeTitle = document.getElementById("planWelcomeTitle");
  const planWelcomeText = document.getElementById("planWelcomeText");
  const planWelcomeLimits = document.getElementById("planWelcomeLimits");
  const planWelcomeConfirmBtn = document.getElementById("planWelcomeConfirmBtn");
  const searchesModal = document.getElementById("searchesModal");
  const closeSearchesModalBtn = document.getElementById("closeSearchesModal");
  const searchesInput = document.getElementById("searchesInput");
  const searchesList = document.getElementById("searchesList");
  const searchesCount = document.getElementById("searchesCount");
  const mobileTabAccountBtn = document.getElementById("mobileTabAccountBtn");
  const mobileTabButtons = document.querySelectorAll(".chat-mobile-tab-btn[data-mobile-consultation]");
  const plansPaymentStatus = document.getElementById("plansPaymentStatus");
  const squarePaymentPanel = document.getElementById("squarePaymentPanel");
  const squarePaymentPanelTitle = document.getElementById("squarePaymentPanelTitle");
  const squarePaymentPanelSubtitle = document.getElementById("squarePaymentPanelSubtitle");
  const backToPlansBtn = document.getElementById("backToPlansBtn");
  const squareCardContainer = document.getElementById("squareCardContainer");
  const squarePayBtn = document.getElementById("squarePayBtn");
  const squareSummaryPlan = document.getElementById("squareSummaryPlan");
  const squareSummaryPrice = document.getElementById("squareSummaryPrice");
  const squareSummaryBilling = document.getElementById("squareSummaryBilling");
  const squareSummaryTotal = document.getElementById("squareSummaryTotal");
  const squarePaymentHint = document.getElementById("squarePaymentHint");
  const downloadAppModal = document.getElementById("downloadAppModal");
  const openDownloadAppBtn = document.getElementById("openDownloadAppBtn");
  const closeDownloadAppModal = document.getElementById("closeDownloadAppModal");
  const androidApkLink = document.getElementById("androidApkLink");
  const androidVersionLabel = document.getElementById("androidVersionLabel");
  const summarySelectedPlan = document.getElementById("summarySelectedPlan");
  const summaryPriceMonth = document.getElementById("summaryPriceMonth");
  const summaryMonths = document.getElementById("summaryMonths");
  const summaryTotal = document.getElementById("summaryTotal");
  const conversationTabs = document.getElementById("conversationTabs");
  const newConversationBtn = document.getElementById("newConversationBtn");
  const authModal = document.getElementById("authModal");
  const closeAuthModalBtn = document.getElementById("closeAuthModal");
  const authForm = document.getElementById("authForm");
  const authModalTitle = document.getElementById("authModalTitle");
  const authModalSubtitle = document.getElementById("authModalSubtitle");
  const authNameGroup = document.getElementById("authNameGroup");
  const authConfirmGroup = document.getElementById("authConfirmGroup");
  const authNameInput = document.getElementById("authName");
  const authEmailInput = document.getElementById("authEmail");
  const authPasswordInput = document.getElementById("authPassword");
  const authConfirmPasswordInput = document.getElementById("authConfirmPassword");
  const toggleAuthPasswordBtn = document.getElementById("toggleAuthPasswordBtn");
  const toggleAuthConfirmPasswordBtn = document.getElementById("toggleAuthConfirmPasswordBtn");
  const authStatus = document.getElementById("authStatus");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authSwitchBtn = document.getElementById("authSwitchBtn");
  const authWelcomePanel = document.getElementById("authWelcomePanel");
  const authWelcomeLoginBtn = document.getElementById("authWelcomeLoginBtn");
  const authWelcomeRegisterBtn = document.getElementById("authWelcomeRegisterBtn");
  const authWelcomeGuestBtn = document.getElementById("authWelcomeGuestBtn");
  const authPhotoGroup = document.getElementById("authPhotoGroup");
  const authPhotoPreview = document.getElementById("authPhotoPreview");
  const openPhotoSourceModalBtn = document.getElementById("openPhotoSourceModalBtn");
  const authPhotoDataInput = document.getElementById("authPhotoData");
  const authPhotoDeviceInput = document.getElementById("authPhotoDeviceInput");
  const authPhotoCameraInput = document.getElementById("authPhotoCameraInput");
  const photoSourceModal = document.getElementById("photoSourceModal");
  const closePhotoSourceModalBtn = document.getElementById("closePhotoSourceModalBtn");
  const choosePhotoCameraBtn = document.getElementById("choosePhotoCameraBtn");
  const choosePhotoDeviceBtn = document.getElementById("choosePhotoDeviceBtn");
  const cameraCaptureModal = document.getElementById("cameraCaptureModal");
  const closeCameraCaptureModalBtn = document.getElementById("closeCameraCaptureModalBtn");
  const cameraCaptureVideo = document.getElementById("cameraCaptureVideo");
  const cameraCaptureCanvas = document.getElementById("cameraCaptureCanvas");
  const cameraCaptureStatus = document.getElementById("cameraCaptureStatus");
  const takeCameraPhotoBtn = document.getElementById("takeCameraPhotoBtn");
  const retakeCameraPhotoBtn = document.getElementById("retakeCameraPhotoBtn");
  const useCameraPhotoBtn = document.getElementById("useCameraPhotoBtn");

  const OLLAMA_API_URL = "http://127.0.0.1:11436/api/generate";
  const LAUNCHER_API_KEY = "emb2-1d78e7646fd2f8f450a823448de7f22f51787bed251a3c5d";
  const API_CHAT_URL = "/api/chat";
  const REMOTE_APP_BASE_URL = "https://ia-juris-app.vercel.app";
  const ANDROID_UPDATE_MANIFEST_URL = REMOTE_APP_BASE_URL + "/android-release.json";
  const MODEL_FALLBACK_ORDER = [
    "gemma2:2b"
  ];
  const OLLAMA_TIMEOUT_MS = 6000;
  const API_TIMEOUT_MS = 45000;
  const INTERNET_FETCH_TIMEOUT_MS = 2200;
  const CLIENT_ENRICH_TIMEOUT_MS = 700;
  const API_RETRY_COOLDOWN_MS = 45000;
  const MAX_RESPONSE_CHARS = 4800;
  const DISABLE_FORCED_FALLBACKS = true;
  const LEGAL_ONLY_MODE = true;
  const PREFER_API_CHAT_FOR_SOURCES = true;
  const CURRENT_AFFAIRS_INPUT_PATTERN = /\bactual\b|\bhoy\b|\b2024\b|\b2025\b|\b2026\b|\bvigente\b|\bultim[oa]\b|\breciente\b/i;
  const SMALL_TALK_INPUT_PATTERN = /^(hola|holi|hello|buenas|buenos dias|buenos días|buenas tardes|buenas noches|que tal|qué tal|como estas|cómo estás|saludos|ok|gracias|thanks|hey|hi)\b/i;
  const IDENTITY_INPUT_PATTERN = /como te llamas|cómo te llamas|quien eres|quién eres|tu nombre|tú nombre|como te dicen|cómo te dicen/i;
  const LEGAL_SCOPE_INPUT_PATTERN = /\bley\b|\bart\b|\barticulo\b|\bconstitucion\b|\bcodigo\b|\bdecreto\b|\breglamento\b|\bjurisprudencia\b|\bsentencia\b|\btribunal\b|\bjuzgado\b|\bdemanda\b|\bquerella\b|\bcontrato\b|\bclausula\b|\bresponsabilidad\b|\bindemnizacion\b|\bdelito\b|\bpena\b|\bmulta\b|\bimpuesto\b|\bhabeas\b|\bderechos?\b|\bdeber(es)?\b|\bpropiedad\b|\bherencia\b|\bdivorcio\b|\bcustodia\b|\barrendamiento\b|\balquiler\b|\bdesalojo\b|\blaboral\b|\btrabajo\b|\bdespido\b|\bnomina\b|\bpension\b|\bseguridad social\b|\bsalud publica\b|\bcompras publicas\b|\badministracion publica\b|\bembargo\b|\bdeuda\b/i;
  const NON_LEGAL_FACT_INPUT_PATTERN = /\bclima\b|\btemperatura\b|\bpronostico\b|\bfutbol\b|\bpartido\b|\bgol\b|\breceta\b|\bcocina\b|\bpelicula\b|\bserie\b|\bcancion\b|\bmusica\b|\bhoroscopo\b|\btelefono\b|\bwhatsapp\b|\bemail\b/i;
  const GENERAL_INFO_INPUT_PATTERN = /\bfecha de nacimiento\b|\bnaci[oó]\b|\bmuri[oó]\b|\bcuando naci\b|\bcuando muri\b|\bquien fue\b|\bqui[eé]n es\b|\bque es \b|\bqu[eé] fue\b|\bcapital de\b|\bpresidente de\b|\bpoblacion de\b|\bhist[oó]ria de\b|\bbiograf[ií]a\b|\bdonde naci\b|\bd[oó]nde naci\b|\bcuantos a[nñ]os\b|\bedad de\b|\bfundacion de\b|\bfundad[ao]\b/i;
  const CHAT_STORAGE_KEY = "ia-juris-conversations-v1";
  const CHAT_STORAGE_BACKUP_KEY = "ia-juris-conversations-v1-backup";
  const ACTIVE_CONV_KEY = "iaJurisActiveConvId";
  const WELCOME_TEXT_GUEST = "Bienvenido a IA Juris en modo invitado. ¿En qué puedo ayudarte hoy?";
  const WELCOME_TEXT_USER = "Bienvenido de nuevo a IA Juris. ¿Qué consulta deseas resolver hoy?";
  const WELCOME_COPYRIGHT_META = "COPYRIGHT (c) JOAN CARLOS CASADO NOVA - B-LABS 2026";
  const DEFAULT_CHAT_PLACEHOLDER = "Escribe tu mensaje...";
  const CONTRACT_COUNTRY_PROMPT = "Para generar tu contrato, primero dime de qué país va. Ejemplo: República Dominicana, México, Colombia o España.";
  const CONTRACT_TYPE_PROMPT = "Perfecto. Ahora dime qué tipo de contrato necesitas. Ejemplo: trabajo, arrendamiento, compraventa, servicios, confidencialidad o préstamo.";
  const DEMANDA_COUNTRY_PROMPT = "Para redactar tu demanda, primero dime de qué país es el caso. Ejemplo: República Dominicana, México, Colombia o Perú.";
  const DEMANDA_CASE_PROMPT = "Perfecto. Ahora escribe los hechos clave y lo que quieres pedir en la demanda (pretensión principal).";
  const NORMA_COUNTRY_PROMPT = "¿De qué país quieres saber la norma?";
  const NORMA_QUESTION_PROMPT = "Perfecto. Ahora escribe tu consulta legal o la norma/artículo que quieres revisar.";
  const CHECKOUT_API_URL = "/api/checkout";
  const CHECKOUT_FALLBACK_API_URL = REMOTE_APP_BASE_URL + "/api/checkout";
  const isLocalSquareHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const AUTH_REGISTER_API_URL = "/api/auth/register";
  const AUTH_LOGIN_API_URL = "/api/auth/login";
  const AUTH_LOGOUT_API_URL = "/api/auth/logout";
  const AUTH_USERS_STORAGE_KEY = "ia-juris-auth-users-v1";
  const AUTH_SESSION_ACTIVE_KEY = "iaJurisSessionActive";
  const USER_PHOTO_MEMORY_KEY = "iaJurisUserPhotoMemory-v1";
  const APP_UI_STATE_KEY = "iaJurisAppUIState";
  const TRIAL_LOADING_MS = 5000;
  const TRIAL_FADEOUT_MS = 450;

  let currentModel = MODEL_FALLBACK_ORDER[0];
  let apiBackoffUntil = 0;
  let cancelVoiceCycle = false;
  let usePublicAPI = true; // En Vercel usar /api/chat, localmente intentar Ollama directo
  let hasRegisteredSession = false;
  let temporaryGuestMode = false;
  let currentConsultationType = "general";
  let contractDraftFlow = {
    stage: "idle",
    country: "",
    contractType: ""
  };
  let demandaDraftFlow = {
    stage: "idle",
    country: ""
  };
  let normaQueryFlow = {
    stage: "idle",
    country: ""
  };
    function isRegisteredSessionActive() {
      return !!hasRegisteredSession && !temporaryGuestMode;
    }

    function hasAuthenticatedIdentity() {
      return !!hasRegisteredSession;
    }

    function refreshSessionIndicator() {
      if (!sessionDot) return;
      if (isRegisteredSessionActive()) {
        sessionDot.classList.remove("active-guest");
        sessionDot.classList.add("active-registered");
        sessionDot.title = "Sesión registrada";
        return;
      }

      sessionDot.classList.remove("active-registered");
      sessionDot.classList.add("active-guest");
      sessionDot.title = "Sesión de invitado";
    }

  let conversations = [];
  let activeConversationId = null;
  let isHydratingConversation = false;
  let checkoutUserCache = null;
  let authMode = "login";
  let authModalStep = "form";
  let authPhotoData = "";
  let runtimeUserPhoto = "";
  let photoPickerContext = "auth";
  let cameraStream = null;
  let cameraCapturedPhotoData = "";
  let recentSearches = [];
  let trialLoadingInProgress = false;
  let squareSdkPromise = null;
  let squarePaymentsInstance = null;
  let squareCardInstance = null;
  let squareCardEnvironment = "";
  let squarePaymentSubmitting = false;

  function parseVersionParts(versionText) {
    const clean = String(versionText || "").trim();
    if (!clean) return [0, 0, 0];
    return clean
      .split(".")
      .map(function (part) {
        const n = parseInt(part, 10);
        return Number.isFinite(n) ? n : 0;
      })
      .slice(0, 3)
      .concat([0, 0, 0])
      .slice(0, 3);
  }

  function compareVersionText(a, b) {
    const av = parseVersionParts(a);
    const bv = parseVersionParts(b);
    for (let i = 0; i < 3; i++) {
      if (av[i] > bv[i]) return 1;
      if (av[i] < bv[i]) return -1;
    }
    return 0;
  }

  async function getInstalledAndroidVersion(capacitorRef) {
    try {
      const appPlugin = capacitorRef && capacitorRef.Plugins ? capacitorRef.Plugins.App : null;
      if (!appPlugin || typeof appPlugin.getInfo !== "function") return "";
      const info = await appPlugin.getInfo();
      return String(info && info.version || "").trim();
    } catch (_) {
      return "";
    }
  }

  async function checkAndroidBinaryUpdate() {
    if (!DEVICE.isAndroid) return;

    const cap = window.Capacitor || null;
    const isNativeAndroid = !!(
      cap
      && ((typeof cap.isNativePlatform === "function" && cap.isNativePlatform())
        || (typeof cap.getPlatform === "function" && cap.getPlatform() === "android"))
    );
    if (!isNativeAndroid) return;

    try {
      const response = await fetch(ANDROID_UPDATE_MANIFEST_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) return;
      const manifest = await response.json();

      const latestVersion = String(manifest && manifest.latestVersion || "").trim();
      const apkUrl = String(manifest && manifest.apkUrl || "").trim();
      const landingUrl = String(manifest && manifest.landingUrl || "").trim();
      const useLandingPageDuringTrial = !!(manifest && manifest.useLandingPageDuringTrial);
      if (!latestVersion || (!apkUrl && !landingUrl)) return;

      const installedVersion = await getInstalledAndroidVersion(cap);
      if (!installedVersion) return;
      if (compareVersionText(latestVersion, installedVersion) <= 0) return;

      const seenKey = "iaJurisAndroidUpdateSeenVersion";
      if (localStorage.getItem(seenKey) === latestVersion) return;
      localStorage.setItem(seenKey, latestVersion);

      const updateTargetUrl = (useLandingPageDuringTrial && landingUrl)
        ? landingUrl
        : (apkUrl || landingUrl);

      addMessage(
        "📲 Hay una nueva version disponible de IA Juris para Android. Si deseas, puedes descargar e instalar la actualizacion ahora.",
        false,
        { relatedQuery: "actualizacion android" }
      );

      setTimeout(function () {
        const wantUpdate = window.confirm(
          "Hay una actualizacion de IA Juris (v" + latestVersion + ") disponible. ¿Quieres descargarla ahora?"
        );
        if (wantUpdate) {
          window.open(updateTargetUrl, "_blank", "noopener,noreferrer");
        }
      }, 350);
    } catch (_) {
      // Silencioso: si falla la red o el manifiesto no existe, la app continua normal.
    }
  }

  function revealHeroSection(options) {
    const config = Object.assign({ loadingMs: TRIAL_LOADING_MS, showLoader: true }, options || {});
    if (trialLoadingInProgress) return;
    trialLoadingInProgress = true;

    if (config.showLoader && openTrialBtn) {
      openTrialBtn.disabled = true;
      openTrialBtn.textContent = "Cargando prueba...";
      openTrialBtn.classList.add("is-loading");
    }

    if (config.showLoader && trialLoader) {
      trialLoader.classList.add("active");
      trialLoader.setAttribute("aria-hidden", "false");
    }

    window.setTimeout(function () {
      if (config.showLoader && trialLoader) {
        trialLoader.classList.remove("active");
        trialLoader.setAttribute("aria-hidden", "true");
      }

      if (publicLanding) {
        publicLanding.classList.add("trial-fade-out");
      }

      window.setTimeout(function () {
        if (publicLanding) {
          publicLanding.classList.add("trial-hidden");
        }

        if (appShell) {
          appShell.classList.add("trial-focus");
        }

        if (heroSection) {
          heroSection.classList.remove("trial-locked");
          heroSection.classList.add("trial-visible");
          heroSection.setAttribute("aria-hidden", "false");
          if (typeof heroSection.scrollIntoView === "function") {
            heroSection.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }

        if (window.location.hash !== "#heroSection") {
          history.replaceState(null, "", "#heroSection");
        }

        trialLoadingInProgress = false;
      }, TRIAL_FADEOUT_MS);

      if (config.showLoader && openTrialBtn) {
        openTrialBtn.disabled = false;
        openTrialBtn.textContent = "Iniciar prueba";
        openTrialBtn.classList.remove("is-loading");
      }
    }, config.loadingMs);
  }

  function updateRuntimeModelBadge() {
    if (!runtimeModelLabel) return;
    const cleanName = String(currentModel || "").trim();
    runtimeModelLabel.textContent = cleanName || "detectando...";
  }

  updateRuntimeModelBadge();

  const CREATIVE_PREFIXES = ["Consulta", "Caso", "Expediente", "Borrador", "Análisis", "Asesoría"];
  const CREATIVE_SUFFIXES = ["Legal", "Civil", "Laboral", "Penal", "Familia", "Contractual"];

  function generateCreativeName(seedText) {
    const cleanSeed = String(seedText || "").trim();
    if (cleanSeed) {
      const firstWord = cleanSeed.split(/\s+/)[0];
      const normalized = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
      return "" + CREATIVE_PREFIXES[Math.floor(Math.random() * CREATIVE_PREFIXES.length)] + " " + normalized;
    }
    return "" + CREATIVE_PREFIXES[Math.floor(Math.random() * CREATIVE_PREFIXES.length)] + " " + CREATIVE_SUFFIXES[Math.floor(Math.random() * CREATIVE_SUFFIXES.length)];
  }

  function enforceUserAssistantOrder(messages) {
    if (!Array.isArray(messages)) return [];

    const ordered = [];
    let waitingAssistant = false;

    messages.forEach(function (msg) {
      if (!msg || !String(msg.text || "").trim()) return;

      if (!waitingAssistant) {
        if (msg.isUser) {
          ordered.push(msg);
          waitingAssistant = true;
        }
        return;
      }

      if (!msg.isUser) {
        ordered.push(msg);
        waitingAssistant = false;
        return;
      }

      // Si llega otro mensaje de usuario antes del asistente, se conserva el más reciente.
      ordered[ordered.length - 1] = msg;
    });

    return ordered;
  }

  function serializeMessages() {
    if (!chatMessages) return [];
    const rows = chatMessages.querySelectorAll(".message-row");
    const data = [];
    rows.forEach(function (row) {
      if (row.getAttribute("data-static-welcome") === "true") return;
      const isUser = row.classList.contains("user");
      const bubble = row.querySelector(".message-bubble");
      const textNode = row.querySelector(".message-bubble p");
      const textFromDataset = bubble && bubble.dataset ? String(bubble.dataset.messageText || "").trim() : "";
      const textFromParagraph = textNode ? String(textNode.textContent || "").trim() : "";
      const text = textFromDataset || textFromParagraph;
      if (!text) return;

      let sources = [];
      if (bubble && bubble.dataset && bubble.dataset.sourcesJson) {
        try {
          const parsed = JSON.parse(bubble.dataset.sourcesJson);
          if (Array.isArray(parsed)) sources = parsed;
        } catch (_err) {
          sources = [];
        }
      }

      let image = null;
      if (bubble && bubble.dataset && bubble.dataset.imageJson) {
        try {
          const parsedImage = JSON.parse(bubble.dataset.imageJson);
          if (Array.isArray(parsedImage)) {
            image = parsedImage
              .filter(function (entry) { return entry && typeof entry === "object"; })
              .slice(0, 2);
          } else if (parsedImage && typeof parsedImage === "object") {
            image = parsedImage;
          }
        } catch (_err) {
          image = null;
        }
      }

      data.push({ text: text, isUser: isUser, sources: sources, image: image });
    });
    return enforceUserAssistantOrder(data);
  }

  function buildApiMessagesPayload() {
    const serialized = serializeMessages();
    if (!Array.isArray(serialized) || !serialized.length) return [];

    return serialized
      .map(function (msg) {
        const content = String(msg && msg.text || "").trim();
        if (!content) return null;
        return {
          role: msg && msg.isUser ? "user" : "assistant",
          content: content
        };
      })
      .filter(Boolean)
      .slice(-24);
  }

  function saveConversations() {
    try {
      const payload = JSON.stringify(conversations);
      localStorage.setItem(CHAT_STORAGE_KEY, payload);
      localStorage.setItem(CHAT_STORAGE_BACKUP_KEY, payload);
    } catch (e) {}
  }

  function normalizeConversationArray(rawList) {
    if (!Array.isArray(rawList)) return [];
    return rawList
      .map(function (item) {
        const id = String(item && item.id || "").trim();
        const name = String(item && item.name || "Conversación").trim() || "Conversación";
        const updatedAt = Number(item && item.updatedAt || Date.now());
        const rawMessages = Array.isArray(item && item.messages) ? item.messages : [];
        const messages = enforceUserAssistantOrder(rawMessages
          .map(function (msg) {
            return {
              text: String(msg && msg.text || "").trim(),
              isUser: !!(msg && msg.isUser),
              sources: Array.isArray(msg && msg.sources) ? msg.sources : [],
              image: (
                Array.isArray(msg && msg.image)
                  ? msg.image.filter(function (entry) { return entry && typeof entry === "object"; }).slice(0, 2)
                  : (msg && msg.image && typeof msg.image === "object" ? msg.image : null)
              )
            };
          })
          .filter(function (msg) { return !!msg.text; }));

        if (!id || !messages.length) return null;
        return { id: id, name: name, updatedAt: updatedAt, messages: messages };
      })
      .filter(Boolean)
      .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); })
      .slice(0, 20);
  }

  function loadConversations() {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      conversations = normalizeConversationArray(raw ? JSON.parse(raw) : []);
      if (conversations.length) return;

      const backupRaw = localStorage.getItem(CHAT_STORAGE_BACKUP_KEY);
      const restored = normalizeConversationArray(backupRaw ? JSON.parse(backupRaw) : []);
      if (restored.length) {
        conversations = restored;
        saveConversations();
      }
    } catch (e) {
      try {
        const backupRaw = localStorage.getItem(CHAT_STORAGE_BACKUP_KEY);
        conversations = normalizeConversationArray(backupRaw ? JSON.parse(backupRaw) : []);
      } catch (_err) {
        conversations = [];
      }
    }
  }

  function renderConversationTabs() {
    if (!conversationTabs) return;
    if (!conversations.length) {
      conversationTabs.innerHTML = '<p class="chat-tab-empty">Sin conversaciones guardadas</p>';
      return;
    }

    conversationTabs.innerHTML = conversations
      .map(function (item) {
        const activeClass = item.id === activeConversationId ? " active" : "";
        const safeName = escapeHtml(String(item.name || "Conversación"));
        return '' +
          '<div class="chat-tab-row" data-conversation-id="' + item.id + '">' +
            '<button type="button" class="chat-tab-item' + activeClass + '" data-conversation-id="' + item.id + '" title="' + safeName + '">' + safeName + '</button>' +
            '<button type="button" class="chat-tab-menu-trigger" data-conversation-id="' + item.id + '" aria-label="Abrir menú de conversación" aria-expanded="false" title="Opciones"><span class="chat-tab-menu-dots">&#8942;</span></button>' +
            '<div class="chat-tab-menu" role="menu" aria-label="Opciones de conversación">' +
              '<button type="button" class="chat-tab-menu-action chat-tab-menu-delete" data-conversation-id="' + item.id + '" role="menuitem">Borrar conversación</button>' +
            '</div>' +
            '<div class="chat-tab-delete-modal" aria-label="Confirmar borrado" role="dialog">' +
              '<p>¿Borrar esta conversación?</p>' +
              '<div class="chat-tab-delete-actions">' +
                '<button type="button" class="chat-tab-delete-cancel" data-conversation-id="' + item.id + '">Cancelar</button>' +
                '<button type="button" class="chat-tab-delete-confirm" data-conversation-id="' + item.id + '">Borrar</button>' +
              '</div>' +
            '</div>' +
          '</div>';
      })
      .join("");
  }

  function closeConversationMenus() {
    if (!conversationTabs) return;
    conversationTabs.querySelectorAll(".chat-tab-row.menu-open").forEach(function (row) {
      row.classList.remove("menu-open");
      const trigger = row.querySelector(".chat-tab-menu-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function closeDeleteModals() {
    if (!conversationTabs) return;
    conversationTabs.querySelectorAll(".chat-tab-row.delete-modal-open").forEach(function (row) {
      row.classList.remove("delete-modal-open");
    });
  }

  function openDeleteModal(conversationId) {
    if (!conversationTabs || !conversationId) return;
    const row = conversationTabs.querySelector('.chat-tab-row[data-conversation-id="' + conversationId + '"]');
    if (!row) return;
    closeDeleteModals();
    row.classList.add("delete-modal-open");
  }

  function deleteConversation(conversationId) {
    const idx = conversations.findIndex(function (c) { return c.id === conversationId; });
    if (idx < 0) return;

    conversations.splice(idx, 1);
    saveConversations();

    if (activeConversationId === conversationId) {
      if (conversations.length) {
        hydrateConversation(conversations[0].id);
      } else {
        startNewConversation();
      }
      return;
    }

    renderConversationTabs();
  }

  function upsertActiveConversation() {
    if (isHydratingConversation) return;
    const messages = serializeMessages();
    const hasUserContent = messages.some(function (m) { return m.isUser; });
    if (!hasUserContent) return;

    if (!activeConversationId) {
      const firstUser = messages.find(function (m) { return m.isUser; });
      activeConversationId = "conv-" + Date.now();
      conversations.unshift({
        id: activeConversationId,
        name: generateCreativeName(firstUser ? firstUser.text : ""),
        updatedAt: Date.now(),
        messages: messages
      });
    } else {
      const idx = conversations.findIndex(function (c) { return c.id === activeConversationId; });
      if (idx >= 0) {
        conversations[idx].messages = messages;
        conversations[idx].updatedAt = Date.now();
      }
    }

    conversations.sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    conversations = conversations.slice(0, 20);
    saveConversations();
    try { localStorage.setItem(ACTIVE_CONV_KEY, activeConversationId); } catch (_) {}
    renderConversationTabs();
  }

  function hydrateConversation(conversationId) {
    const found = conversations.find(function (c) { return c.id === conversationId; });
    if (!found || !chatMessages) return;

    isHydratingConversation = true;
    activeConversationId = found.id;
    try { localStorage.setItem(ACTIVE_CONV_KEY, activeConversationId); } catch (_) {}
    chatMessages.innerHTML = "";
    ensureStaticWelcomeMessage();
    enforceUserAssistantOrder(found.messages).forEach(function (msg) {
      addMessage(msg.text, !!msg.isUser, {
        sources: Array.isArray(msg.sources) ? msg.sources : [],
        image: msg && msg.image && typeof msg.image === "object" ? msg.image : null
      });
    });
    isHydratingConversation = false;
    updateConversationStartLayout();
    renderConversationTabs();
  }

  function startNewConversation() {
    activeConversationId = null;
    try { localStorage.removeItem(ACTIVE_CONV_KEY); } catch (_) {}
    if (!chatMessages) return;
    isHydratingConversation = true;
    chatMessages.innerHTML = "";
    contractDraftFlow = { stage: "idle", country: "", contractType: "" };
    normaQueryFlow = { stage: "idle", country: "" };
    ensureStaticWelcomeMessage();
    isHydratingConversation = false;
    updateConversationStartLayout();
    triggerInitialConversationMotion();
    chatInput.value = "";
    chatInput.focus();
    renderConversationTabs();
  }

  function ensureStaticWelcomeMessage() {
    if (!chatMessages) return;

    const userName = String(localStorage.getItem("iaJurisUserName") || "").trim();
    const isRegistered = hasAuthenticatedIdentity() && !temporaryGuestMode;
    const welcomeText = isRegistered
      ? (userName ? ("Bienvenido de nuevo, " + userName + ". ¿Qué consulta deseas resolver hoy?") : WELCOME_TEXT_USER)
      : WELCOME_TEXT_GUEST;

    const alreadyExists = chatMessages.querySelector('.message-row.bot[data-static-welcome="true"]');
    if (alreadyExists) {
      alreadyExists.remove();
    }

    addMessage(welcomeText, false, { isStaticWelcome: true });
  }

  function refreshStaticWelcomeMessageIfEmptyConversation() {
    if (!chatMessages) return;
    const hasUserMessages = !!chatMessages.querySelector(".message-row.user");
    if (hasUserMessages) return;
    ensureStaticWelcomeMessage();
  }

  function updateConversationStartLayout() {
    if (!chatMain || !chatMessages || !chatInputStack) return;
    const hasUserMessages = !!chatMessages.querySelector(".message-row.user");
    chatMain.classList.toggle("chat-main-initial", !hasUserMessages);
    chatInputStack.classList.toggle("chat-input-stack-initial", !hasUserMessages);
  }

  function triggerInitialConversationMotion() {
    if (!chatMain) return;
    chatMain.classList.remove("chat-main-initial-enter");
    // Reinicia la animación para cada nueva conversación.
    void chatMain.offsetWidth;
    chatMain.classList.add("chat-main-initial-enter");
    window.setTimeout(function () {
      if (!chatMain) return;
      chatMain.classList.remove("chat-main-initial-enter");
    }, 460);
  }

  function persistChatStateNow() {
    try {
      upsertActiveConversation();
      saveConversations();
    } catch (_err) {
    }
  }

  // Prompts del sistema para cada tipo de consulta
  const SYSTEM_PROMPTS = {
    general: `Eres IA Juris: asistente general en espanol con especialidad legal y enfoque factual estricto.
Reglas:
- Si la consulta es juridica, responde con enfoque legal claro, practico y breve.
- Si la consulta NO es juridica, responde como asistente general con datos verificados, directos y sin adornos.
- Prioriza exactitud sobre estilo: si un dato no es seguro, dilo claramente en vez de inventarlo.
- Para fechas, nombres, biografias, cargos y periodos, usa solo datos confirmados y no mezcles anos o eventos distintos.
- Para consultas de actualidad (2024-2026, hoy, actual), prioriza precision temporal y no mezcles periodos.
- No uses relleno, explicaciones vagas ni descripciones innecesarias.
- Respuestas cortas por defecto; amplias solo si el usuario las pide.`,

    demanda: `Eres experto en redacción de demandas legales dominicanas. Redacta en formato legal dominicano con:
- Encabezado del tribunal
- Hechos fundamentados
- Fundamentos legales (cita leyes dominicanas)
- Petitorio claro
Usa términos legales dominicanos exactos y referencias al Código Procesal Civil.
FORMATO OBLIGATORIO:
- Escribe los nombres de leyes, códigos y decretos en **negritas**.
- Escribe los artículos subrayados con tildes dobles (ej: ~~Art. 1382~~).
- Escribe los nombres de personas y partes en **negritas**.`,

    contrato: `Eres experto en redacción de contratos dominicanos. Para contratos de compraventa, trabajo, arrendamiento o servicios:
- Redacta según ley dominicana
- Cita artículos del Código Civil dominicano
- Incluye cláusulas de protección legal
- Usa formato y terminología legal dominicana
- Menciona resolución de conflictos bajo ley RD
FORMATO OBLIGATORIO:
- Escribe los nombres de leyes y códigos en **negritas** (ej: **Código Civil**).
- Escribe los artículos subrayados con tildes dobles (ej: ~~Art. 1134~~).
- Escribe los nombres de las partes contratantes en **negritas**.`,

    norma: `Eres experto en legislación dominicana. Al consultar leyes:
Desarrolla la respuesta, luego al final escribe:
**LEY GENERAL: [Nombre de la ley]**
**ARTÍCULOS APLICABLES:**
- ~~Artículo XX~~: [breve descripción]
Cita jurisprudencia de la Suprema Corte dominicana cuando sea posible.
FORMATO OBLIGATORIO:
- Escribe todos los nombres de leyes, códigos y decretos en **negritas**.
- Escribe todos los artículos subrayados con tildes dobles (ej: ~~Art. 45~~).`
  };

  function normalizeEmailForPhotoMemory(email) {
    return String(email || "").trim().toLowerCase();
  }

  function readUserPhotoMemory() {
    try {
      const raw = localStorage.getItem(USER_PHOTO_MEMORY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_err) {
      return {};
    }
  }

  function writeUserPhotoMemory(memoryMap) {
    try {
      localStorage.setItem(USER_PHOTO_MEMORY_KEY, JSON.stringify(memoryMap || {}));
    } catch (_err) {
    }
  }

  function rememberUserPhoto(email, photoDataUrl) {
    const key = normalizeEmailForPhotoMemory(email);
    const photo = String(photoDataUrl || "").trim();
    if (!key || !photo) return;
    const memoryMap = readUserPhotoMemory();
    memoryMap[key] = photo;
    writeUserPhotoMemory(memoryMap);
  }

  function getRememberedUserPhoto(email) {
    const key = normalizeEmailForPhotoMemory(email);
    if (!key) return "";
    const memoryMap = readUserPhotoMemory();
    return String(memoryMap[key] || "").trim();
  }

  function getUserAvatarSrc() {
    const runtimePhoto = String(runtimeUserPhoto || "").trim();
    if (runtimePhoto) return runtimePhoto;
    const direct = String(localStorage.getItem("iaJurisUserPhoto") || "").trim();
    if (direct) return direct;
    const activeEmail = String(localStorage.getItem("iaJurisUserEmail") || "").trim();
    const remembered = getRememberedUserPhoto(activeEmail);
    return remembered || "assets/no-foto.png";
  }

  function tryPersistUserPhoto(photoDataUrl) {
    const value = String(photoDataUrl || "").trim();
    if (!value) return false;
    try {
      localStorage.setItem("iaJurisUserPhoto", value);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function downscaleImageDataUrl(dataUrl, maxSide, quality) {
    return new Promise(function (resolve) {
      const src = String(dataUrl || "").trim();
      if (!src) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = function () {
        try {
          const w = Number(img.naturalWidth || img.width || 0);
          const h = Number(img.naturalHeight || img.height || 0);
          if (!w || !h) {
            resolve(src);
            return;
          }

          const limit = Math.max(160, Number(maxSide || 480));
          const scale = Math.min(1, limit / Math.max(w, h));
          const outW = Math.max(1, Math.round(w * scale));
          const outH = Math.max(1, Math.round(h * scale));

          const canvas = document.createElement("canvas");
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) {
            resolve(src);
            return;
          }

          ctx.drawImage(img, 0, 0, outW, outH);
          const jpgQuality = Math.min(0.92, Math.max(0.55, Number(quality || 0.78)));
          const out = canvas.toDataURL("image/jpeg", jpgQuality);
          resolve(String(out || src));
        } catch (_err) {
          resolve(src);
        }
      };
      img.onerror = function () {
        resolve(src);
      };
      img.src = src;
    });
  }

  async function persistUserPhotoWithFallback(photoDataUrl) {
    const value = String(photoDataUrl || "").trim();
    if (!value) return "";
    if (tryPersistUserPhoto(value)) return value;

    const compact = await downscaleImageDataUrl(value, DEVICE.isAndroid ? 320 : 480, DEVICE.isAndroid ? 0.72 : 0.78);
    if (compact && tryPersistUserPhoto(compact)) return compact;

    const tiny = await downscaleImageDataUrl(compact || value, 240, 0.64);
    if (tiny && tryPersistUserPhoto(tiny)) return tiny;

    return "";
  }

  function refreshUserAvatars() {
    const currentSrc = getUserAvatarSrc();
    const userAvatarImages = chatMessages ? chatMessages.querySelectorAll(".message-row.user .message-avatar img") : [];
    userAvatarImages.forEach(function (img) {
      img.src = currentSrc;
    });
  }

  function refreshSidebarUserFooter() {
    const registeredMode = isRegisteredSessionActive();
    const storedPlan = (localStorage.getItem("iaJurisUserPlan") || "").trim();

    if (sidebarUserPhoto) {
      const photoFromStorage = localStorage.getItem("iaJurisUserPhoto") || "";
      sidebarUserPhoto.src = registeredMode
        ? (photoFromStorage || getUserAvatarSrc())
        : "assets/no-foto.png";
    }
    if (sidebarUserName) {
      let storedName = (localStorage.getItem("iaJurisUserName") || "").trim();
      if (registeredMode && !storedName) {
        storedName = "Usuario registrado";
        localStorage.setItem("iaJurisUserName", storedName);
      }
      sidebarUserName.textContent = registeredMode ? storedName : "Perfil invitado";
    }
    if (sidebarUserPlan) {
      if (registeredMode && storedPlan) {
        sidebarUserPlan.textContent = storedPlan;
      } else {
        sidebarUserPlan.textContent = registeredMode ? "Plan Esencial" : "Plan Invitado";
      }
    }
  }

  function refreshGuestHeaderActions() {
    if (!chatHeaderRight) return;
    chatHeaderRight.classList.toggle("registered", !!hasRegisteredSession);
    if (document.body) {
      const loggedInState = !!hasRegisteredSession && !temporaryGuestMode;
      document.body.classList.toggle("auth-logged-in", loggedInState);
      document.body.classList.toggle("auth-guest", !loggedInState);
    }
    if (sidebarProfileMenuItem) {
      const canSeeProfile = hasRegisteredSession && !temporaryGuestMode;
      sidebarProfileMenuItem.style.display = canSeeProfile ? "block" : "none";
      if (!canSeeProfile) closeProfileModal();
    }
    if (sidebarLogoutMenuItem) {
      // Solo mostrar si hay sesión registrada y NO modo invitado
      sidebarLogoutMenuItem.style.display = (hasRegisteredSession && !temporaryGuestMode) ? "block" : "none";
    }
    const sidebarGuestExitMenuItem = document.getElementById("sidebarGuestExitMenuItem");
    if (sidebarGuestExitMenuItem) {
      // Mostrar un solo botón para cualquier modo invitado
      sidebarGuestExitMenuItem.style.display = (!hasRegisteredSession || temporaryGuestMode) ? "block" : "none";
    }
    refreshStaticWelcomeMessageIfEmptyConversation();
    refreshSessionIndicator();
  }

  function returnGuestToWelcome() {
    closeSidebarActionsMenu();
    temporaryGuestMode = false;
    clearAppUIState();

    if (chatModal) {
      chatModal.classList.remove("chat-static", "active");
      chatModal.setAttribute("aria-hidden", "true");
    }

    if (splashSection) {
      splashSection.style.display = "";
      splashSection.classList.remove("splash-exit");
    }

    refreshSidebarUserFooter();
    refreshGuestHeaderActions();
  }

  function closeSidebarActionsMenu() {
    if (!sidebarActionsMenu || !openPlansBtn) return;
    sidebarActionsMenu.classList.remove("open");
    openPlansBtn.setAttribute("aria-expanded", "false");
  }

  function toggleSidebarActionsMenu() {
    if (!sidebarActionsMenu || !openPlansBtn) return;
    const willOpen = !sidebarActionsMenu.classList.contains("open");
    sidebarActionsMenu.classList.toggle("open", willOpen);
    openPlansBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  }

  function setSessionActiveFlag(active) {
    if (active) {
      localStorage.setItem(AUTH_SESSION_ACTIVE_KEY, "1");
    } else {
      localStorage.removeItem(AUTH_SESSION_ACTIVE_KEY);
    }
  }

  function saveAppUIState(state) {
    try { localStorage.setItem(APP_UI_STATE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function clearAppUIState() {
    localStorage.removeItem(APP_UI_STATE_KEY);
  }

  function clearPersistedSession() {
    closeSidebarActionsMenu();
    clearAppUIState();
    localStorage.removeItem("iaJurisUserId");
    localStorage.removeItem("iaJurisUserName");
    localStorage.removeItem("iaJurisUserEmail");
    localStorage.removeItem("iaJurisUserPhoto");
    runtimeUserPhoto = "";
    localStorage.removeItem("iaJurisUserToken");
    localStorage.removeItem("iaJurisUserPlan");
    setSessionActiveFlag(false);
    checkoutUserCache = null;
    hasRegisteredSession = false;
    temporaryGuestMode = false;
    refreshSidebarUserFooter();
    refreshGuestHeaderActions();
    refreshUserAvatars();
  }

  async function performLogout() {
    try {
      await fetch(AUTH_LOGOUT_API_URL, { method: "POST" });
    } catch (_err) {
    }
    clearPersistedSession();
    chatInput.focus();
  }

  async function activateTemporaryGuestChat() {
    closeSidebarActionsMenu();

    // Si hay sesión registrada, cerrarla en backend para evitar que se reactive.
    if (hasRegisteredSession) {
      try {
        await fetch(AUTH_LOGOUT_API_URL, { method: "POST" });
      } catch (_err) {
      }
    }

    clearPersistedSession();
    temporaryGuestMode = true;

    if (splashSection) {
      if (DEVICE.isPhone) {
        splashSection.style.display = "none";
      } else {
        splashSection.classList.add("splash-exit");
        setTimeout(function () {
          splashSection.style.display = "none";
        }, 300);
      }
    }

    if (appShell && chatModal && chatModal.parentElement !== appShell) {
      appShell.appendChild(chatModal);
    }

    chatModal.classList.add("chat-static", "active");
    chatModal.setAttribute("aria-hidden", "false");
    saveAppUIState({ staticChat: true, guestMode: true });

    refreshUserAvatars();
    refreshSidebarUserFooter();
    refreshGuestHeaderActions();
    chatInput.focus();
  }

  function resolvePlanLabelFromId(planId) {
    const key = String(planId || "").trim().toLowerCase();
    if (key === "monthly") return "Mensual";
    if (key === "semiannual") return "6 Meses";
    if (key === "annual") return "Anual";
    return "";
  }

  function normalizePlanKey(planRef) {
    const key = String(planRef || "").trim().toLowerCase();
    if (key === "monthly" || key === "mensual") return "monthly";
    if (key === "semiannual" || key === "6 meses" || key === "6meses" || key === "semestral") return "semiannual";
    if (key === "annual" || key === "anual") return "annual";
    return "";
  }

  function getPlanWelcomeDetails(planRef) {
    const planKey = normalizePlanKey(planRef);
    if (planKey === "monthly") {
      return {
        label: "Mensual",
        limits: [
          "Análisis ilimitado de casos",
          "Generación de documentos legales",
          "Búsqueda de jurisprudencia",
          "Consultas 24/7 con IA",
          "Almacenamiento de 500 MB"
        ]
      };
    }
    if (planKey === "semiannual") {
      return {
        label: "6 Meses",
        limits: [
          "Todo lo incluido en Mensual",
          "Exportación premium a PDF",
          "Almacenamiento de 2 GB",
          "Acceso prioritario",
          "2 plantillas personalizadas"
        ]
      };
    }
    if (planKey === "annual") {
      return {
        label: "Anual",
        limits: [
          "Todo lo incluido en 6 Meses",
          "API para integración",
          "Almacenamiento de 5 GB",
          "Soporte prioritario por email",
          "10 plantillas personalizadas"
        ]
      };
    }
    const fallbackLabel = String(planRef || "tu suscripción").trim() || "tu suscripción";
    return {
      label: fallbackLabel,
      limits: [
        "Acceso activo a tu plan",
        "Consulta tus beneficios en el panel de planes"
      ]
    };
  }

  function openPlanWelcomeModal(planRef) {
    if (!planWelcomeModal) return;
    const details = getPlanWelcomeDetails(planRef);

    if (planWelcomeTitle) {
      planWelcomeTitle.textContent = `Bienvenido al plan ${details.label}`;
    }
    if (planWelcomeText) {
      planWelcomeText.textContent = `Tu suscripción ${details.label} ya está activa. Estos son los límites y beneficios de tu plan.`;
    }
    if (planWelcomeLimits) {
      planWelcomeLimits.innerHTML = "";
      details.limits.forEach(function (item) {
        const li = document.createElement("li");
        li.textContent = item;
        planWelcomeLimits.appendChild(li);
      });
    }

    planWelcomeModal.classList.add("active");
    planWelcomeModal.setAttribute("aria-hidden", "false");
  }

  function closePlanWelcomeModal() {
    if (!planWelcomeModal) return;
    planWelcomeModal.classList.remove("active");
    planWelcomeModal.setAttribute("aria-hidden", "true");
  }

  function syncCheckoutResultFromURL() {
    const params = new URLSearchParams(window.location.search || "");
    const checkoutStatus = String(params.get("checkout") || "").trim().toLowerCase();
    const planId = String(params.get("plan") || "").trim().toLowerCase();
    if (!checkoutStatus) return;

    if (checkoutStatus === "success") {
      const planLabel = resolvePlanLabelFromId(planId);
      if (planLabel) {
        localStorage.setItem("iaJurisUserPlan", planLabel);
        refreshSidebarUserFooter();
        openPlanWelcomeModal(planId || planLabel);
      }
    }

    try {
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", clean);
    } catch (_err) {
    }
  }

  function openPlansModal() {
    closeSidebarActionsMenu();
    if (!plansModal) return;
    plansModal.classList.add("active");
    plansModal.setAttribute("aria-hidden", "false");
  }

  function closePlansModal() {
    if (!plansModal) return;
    plansModal.classList.remove("active");
    plansModal.setAttribute("aria-hidden", "true");
    closeSquarePaymentPanel();
    closeSubscriptionAccessModal();
    if (plansPaymentStatus) {
      plansPaymentStatus.textContent = "";
      plansPaymentStatus.classList.remove("error", "ok");
    }
  }

  function openSubscriptionAccessModal() {
    if (!subscriptionAccessModal) return;
    subscriptionAccessModal.classList.add("active");
    subscriptionAccessModal.setAttribute("aria-hidden", "false");
  }

  function closeSubscriptionAccessModal() {
    if (!subscriptionAccessModal) return;
    subscriptionAccessModal.classList.remove("active");
    subscriptionAccessModal.setAttribute("aria-hidden", "true");
  }

  function setPlansPaymentStatus(text, type) {
    if (!plansPaymentStatus) return;
    plansPaymentStatus.textContent = String(text || "");
    plansPaymentStatus.classList.remove("error", "ok");
    if (type === "error" || type === "ok") {
      plansPaymentStatus.classList.add(type);
    }
  }

  function collectRecentSearches() {
    const bucket = [];
    const seen = new Set();

    function pushSearch(value, timestamp) {
      const text = String(value || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const normalized = text.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);
      bucket.push({
        text: text,
        timestamp: Number(timestamp || Date.now())
      });
    }

    const currentMessages = serializeMessages();
    let localTs = Date.now();
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (!currentMessages[i] || !currentMessages[i].isUser) continue;
      pushSearch(currentMessages[i].text, localTs);
      localTs -= 1;
    }

    const orderedConversations = conversations
      .slice()
      .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });

    orderedConversations.forEach(function (conv) {
      const messages = Array.isArray(conv && conv.messages) ? conv.messages : [];
      let convTs = Number(conv && conv.updatedAt || Date.now());
      for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i] || !messages[i].isUser) continue;
        pushSearch(messages[i].text, convTs);
        convTs -= 1;
      }
    });

    return bucket.slice(0, 50);
  }

  function formatSearchItemDateTime(ts) {
    const date = new Date(Number(ts || Date.now()));
    if (Number.isNaN(date.getTime())) return "";
    try {
      return new Intl.DateTimeFormat("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    } catch (_err) {
      return date.toLocaleString();
    }
  }

  function renderSearchesList(filterValue) {
    if (!searchesList) return;

    const term = String(filterValue || "").trim().toLowerCase();
    const filtered = term
      ? recentSearches.filter(function (item) { return String(item && item.text || "").toLowerCase().includes(term); })
      : recentSearches.slice();

    if (searchesCount) {
      const count = filtered.length;
      searchesCount.textContent = count + " " + (count === 1 ? "resultado" : "resultados");
    }

    if (!filtered.length) {
      searchesList.innerHTML = '<li><p class="searches-empty">No hay búsquedas para mostrar.</p></li>';
      return;
    }

    searchesList.innerHTML = filtered
      .map(function (item) {
        const searchText = String(item && item.text || "");
        const searchDateTime = formatSearchItemDateTime(item && item.timestamp);
        return '<li><button type="button" class="searches-item-btn" data-search-text="' + escapeHtml(searchText) + '"><span class="searches-item-text">' + escapeHtml(searchText) + '</span><span class="searches-item-meta">' + escapeHtml(searchDateTime) + '</span></button></li>';
      })
      .join("");
  }

  function openSearchesModal() {
    closeSidebarActionsMenu();
    if (!searchesModal) return;
    recentSearches = collectRecentSearches();
    searchesModal.classList.add("active");
    searchesModal.setAttribute("aria-hidden", "false");
    if (searchesInput) searchesInput.value = "";
    renderSearchesList("");
    if (searchesInput) searchesInput.focus();
  }

  function closeSearchesModal() {
    if (!searchesModal) return;
    searchesModal.classList.remove("active");
    searchesModal.setAttribute("aria-hidden", "true");
  }

  function openProfileModal() {
    closeSidebarActionsMenu();
    if (!profileModal) return;

    const email = String(localStorage.getItem("iaJurisUserEmail") || "").trim();
    const profession = String(localStorage.getItem("iaJurisUserProfession") || "").trim();
    const plan = String(localStorage.getItem("iaJurisUserPlan") || "").trim();
    const photo = String(localStorage.getItem("iaJurisUserPhoto") || "").trim() || getUserAvatarSrc();
    const fallbackPlan = hasAuthenticatedIdentity() ? "Plan Esencial" : "Plan Invitado";

    if (profileModalPhoto) profileModalPhoto.src = photo || "assets/no-foto.png";
    if (profileModalEmail) profileModalEmail.textContent = email || "No disponible";
    if (profileModalProfession) profileModalProfession.textContent = profession || "General";
    if (profileModalPlan) profileModalPlan.textContent = plan || fallbackPlan;

    profileModal.classList.add("active");
    profileModal.setAttribute("aria-hidden", "false");
  }

  function closeProfileModal() {
    if (!profileModal) return;
    profileModal.classList.remove("active");
    profileModal.setAttribute("aria-hidden", "true");
  }

  function getSelectedPlanForCheckout() {
    if (!plansModal) return null;
    const selectedCard = plansModal.querySelector(".plan-card.selected");
    if (!selectedCard) return null;
    return {
      planId: String(selectedCard.getAttribute("data-plan-id") || "").trim().toLowerCase(),
      planLabel: String(selectedCard.getAttribute("data-plan") || "Plan Invitado").trim(),
      fullName: String(localStorage.getItem("iaJurisUserName") || "").trim(),
      email: String(localStorage.getItem("iaJurisUserEmail") || "").trim(),
      userId: String(localStorage.getItem("iaJurisUserId") || "").trim()
    };
  }

  function setPlanSubscribeButtonsDisabled(disabled) {
    if (!plansModal) return;
    plansModal.querySelectorAll(".plan-subscribe-btn").forEach(function (btn) {
      if (disabled) {
        btn.setAttribute("aria-disabled", "true");
        btn.classList.add("is-loading");
      } else {
        btn.setAttribute("aria-disabled", "false");
        btn.classList.remove("is-loading");
      }
    });
  }

  function getSquareRuntimeConfig() {
    const config = window.SQUARE_CONFIG || {};
    return isLocalSquareHost ? (config.sandbox || {}) : (config.production || config.sandbox || {});
  }

  function getSquareSdkUrl() {
    return isLocalSquareHost
      ? "https://sandbox.web.squarecdn.com/v1/square.js"
      : "https://web.squarecdn.com/v1/square.js";
  }

  function loadSquareSdk() {
    if (window.Square) {
      return Promise.resolve(window.Square);
    }

    if (squareSdkPromise) {
      return squareSdkPromise;
    }

    squareSdkPromise = new Promise(function (resolve, reject) {
      const existingScript = document.querySelector('script[data-square-sdk="true"]');
      if (existingScript) {
        existingScript.addEventListener("load", function () {
          resolve(window.Square);
        }, { once: true });
        existingScript.addEventListener("error", function () {
          reject(new Error("No se pudo cargar Square Payments SDK"));
        }, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = getSquareSdkUrl();
      script.dataset.squareSdk = "true";
      script.onload = function () {
        resolve(window.Square);
      };
      script.onerror = function () {
        reject(new Error("No se pudo cargar Square Payments SDK"));
      };
      document.head.appendChild(script);
    });

    return squareSdkPromise;
  }

  function setSquarePaymentPanelVisible(isVisible) {
    if (!squarePaymentPanel) return;
    squarePaymentPanel.hidden = !isVisible;
    squarePaymentPanel.setAttribute("aria-hidden", isVisible ? "false" : "true");
  }

  function updateSquarePaymentSummary(selectedPlan) {
    if (!selectedPlan) return;
    const planLabel = String(selectedPlan.planLabel || selectedPlan.planId || "Plan activo").trim();
    const planPrice = selectedPlan.planId === "monthly"
      ? "$7.00"
      : selectedPlan.planId === "semiannual"
        ? "$10.00"
        : "$15.00";
    const billingLabel = selectedPlan.planId === "semiannual" ? "Pago único" : "Pago único";

    if (squarePaymentPanelTitle) {
      squarePaymentPanelTitle.textContent = `Paga ${planLabel} con tarjeta`;
    }
    if (squarePaymentPanelSubtitle) {
      squarePaymentPanelSubtitle.textContent = "Visa o Mastercard procesadas de forma segura por Square.";
    }
    if (squareSummaryPlan) squareSummaryPlan.textContent = planLabel;
    if (squareSummaryPrice) squareSummaryPrice.textContent = planPrice;
    if (squareSummaryBilling) squareSummaryBilling.textContent = billingLabel;
    if (squareSummaryTotal) squareSummaryTotal.textContent = `${planPrice} USD`;
    if (squarePaymentHint) {
      squarePaymentHint.textContent = "Al confirmar, Square procesa el cargo de forma inmediata.";
    }
  }

  async function ensureSquareCardInstance() {
    const runtime = getSquareRuntimeConfig();
    if (!runtime.applicationId || !runtime.locationId) {
      throw new Error("Square no está configurado para esta vista.");
    }

    const envKey = isLocalSquareHost ? "sandbox" : "production";
    if (squareCardInstance && squareCardEnvironment === envKey) {
      return squareCardInstance;
    }

    if (!squareCardContainer) {
      throw new Error("No se encontró el contenedor de pago de Square.");
    }

    squareCardContainer.innerHTML = "";
    await loadSquareSdk();
    if (!window.Square || typeof window.Square.payments !== "function") {
      throw new Error("Square Payments SDK no está disponible.");
    }

    squarePaymentsInstance = window.Square.payments(runtime.applicationId, runtime.locationId);

    const SQUARE_INIT_TIMEOUT_MS = 15000;
    const timeoutErr = new Error("El formulario de pago tardó demasiado en cargar. Es posible que el dominio no esté autorizado en Square o haya un problema de red.");
    const timeoutPromise = new Promise(function (_, reject) {
      setTimeout(function () { reject(timeoutErr); }, SQUARE_INIT_TIMEOUT_MS);
    });

    squareCardInstance = await Promise.race([squarePaymentsInstance.card(), timeoutPromise]);
    await Promise.race([squareCardInstance.attach("#squareCardContainer"), timeoutPromise]);
    squareCardEnvironment = envKey;
    return squareCardInstance;
  }

  async function openSquarePaymentPanel(selectedPlan) {
    if (!selectedPlan || !selectedPlan.planId) return;

    updateSquarePaymentSummary(selectedPlan);
    setSquarePaymentPanelVisible(true);
    if (plansPaymentStatus) {
      plansPaymentStatus.textContent = "Cargando formulario seguro de Square...";
      plansPaymentStatus.classList.remove("error", "ok");
    }

    try {
      await ensureSquareCardInstance();
      if (plansPaymentStatus) {
        plansPaymentStatus.textContent = "Formulario listo. Ingresa tu tarjeta y confirma el pago.";
      }
    } catch (error) {
      if (plansPaymentStatus) {
        plansPaymentStatus.textContent = normalizeCheckoutErrorMessage(error && error.message ? error.message : "No se pudo cargar Square.");
        plansPaymentStatus.classList.add("error");
      }
    }
  }

  function closeSquarePaymentPanel() {
    setSquarePaymentPanelVisible(false);
    if (plansPaymentStatus) {
      plansPaymentStatus.textContent = "";
      plansPaymentStatus.classList.remove("error", "ok");
    }
    if (squarePayBtn) {
      squarePayBtn.disabled = false;
      squarePayBtn.classList.remove("is-loading");
    }
    squarePaymentSubmitting = false;
  }

  async function resolveSquarePaymentCustomer(selectedPlan) {
    const authedUser = await getCheckoutUser();
    let fallbackEmail = String(selectedPlan.email || "").trim();

    if (!fallbackEmail) {
      const enteredEmail = window.prompt("Para continuar con el pago, escribe tu correo electrónico:", "");
      fallbackEmail = String(enteredEmail || "").trim();
      if (fallbackEmail) {
        localStorage.setItem("iaJurisUserEmail", fallbackEmail);
      }
    }

    if (!authedUser && !selectedPlan.userId && !fallbackEmail) {
      throw new Error("Necesitamos tu correo para iniciar el pago en Square");
    }

    return {
      id: authedUser && authedUser.id ? authedUser.id : selectedPlan.userId,
      email: authedUser && authedUser.email ? authedUser.email : fallbackEmail,
      fullName: authedUser && authedUser.fullName ? authedUser.fullName : selectedPlan.fullName
    };
  }

  async function submitSquareCardPayment() {
    if (squarePaymentSubmitting) return;

    const selectedPlan = getSelectedPlanForCheckout();
    if (!selectedPlan || !selectedPlan.planId) {
      setPlansPaymentStatus("Selecciona un plan válido para continuar.", "error");
      return;
    }

    if (!squareCardInstance) {
      setPlansPaymentStatus("Cargando formulario seguro de Square...", "");
      await openSquarePaymentPanel(selectedPlan);
      return;
    }

    squarePaymentSubmitting = true;
    if (squarePayBtn) {
      squarePayBtn.disabled = true;
      squarePayBtn.classList.add("is-loading");
    }
    setPlansPaymentStatus("Procesando pago con Square...", "");

    try {
      const customer = await resolveSquarePaymentCustomer(selectedPlan);

      const tokenResult = await squareCardInstance.tokenize();
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        const squareErr = tokenResult && tokenResult.errors && tokenResult.errors[0];
        const squareMsg = squareErr
          ? String(squareErr.detail || squareErr.message || squareErr.type || "")
          : "";
        throw new Error(squareMsg || "No se pudo validar la tarjeta. Revisa el número, fecha y CVV.");
      }

      const response = await fetch(CHECKOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.planId,
          customer: customer,
          sourceId: tokenResult.token,
          idempotencyKey: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : String(Date.now())
        })
      });

      const payload = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        const detail = payload && payload.detail ? String(payload.detail) : "";
        const code = payload && payload.code ? String(payload.code) : "";
        const category = payload && payload.category ? String(payload.category) : "";
        const fallback = payload && payload.error ? String(payload.error) : "No se pudo completar el pago";
        const joined = [detail, code].filter(Boolean).join(" — ");
        throw new Error(joined || fallback);
      }

      localStorage.setItem("iaJurisUserPlan", selectedPlan.planLabel);
      refreshSidebarUserFooter();
      setPlansPaymentStatus("Pago confirmado. Tu plan quedó activo.", "ok");
      closeSquarePaymentPanel();
      closePlansModal();
      openPlanWelcomeModal(selectedPlan.planId || selectedPlan.planLabel);
    } catch (error) {
      const rawMsg = error && error.message ? String(error.message) : "";
      setPlansPaymentStatus(normalizeCheckoutErrorMessage(rawMsg), "error");
      // Reiniciar el widget de tarjeta para que el usuario pueda reintentar
      try {
        if (squareCardInstance && typeof squareCardInstance.destroy === "function") {
          squareCardInstance.destroy();
        }
      } catch (_e) {}
      squareCardInstance = null;
      squareCardEnvironment = "";
      // Recargar el widget en segundo plano para el próximo intento
      openSquarePaymentPanel(selectedPlan).catch(function () {});
    } finally {
      squarePaymentSubmitting = false;
      if (squarePayBtn) {
        squarePayBtn.disabled = false;
        squarePayBtn.classList.remove("is-loading");
      }
    }
  }

  async function getCheckoutUser() {
    if (checkoutUserCache) return checkoutUserCache;

    try {
      const response = await fetch("/api/auth/me", { method: "GET" });
      if (!response.ok) return null;
      const data = await response.json().catch(function () { return {}; });
      if (!data || !data.user) return null;

      checkoutUserCache = {
        id: String(data.user.id || "").trim(),
        email: String(data.user.email || "").trim(),
        fullName: String(data.user.fullName || data.user.name || "").trim()
      };

      if (checkoutUserCache.id) localStorage.setItem("iaJurisUserId", checkoutUserCache.id);
      if (checkoutUserCache.email) localStorage.setItem("iaJurisUserEmail", checkoutUserCache.email);
      if (checkoutUserCache.fullName) localStorage.setItem("iaJurisUserName", checkoutUserCache.fullName);
      return checkoutUserCache;
    } catch (_err) {
      return null;
    }
  }

  async function createSquareCheckoutSession(selectedPlan) {
    const authedUser = await getCheckoutUser();
    let fallbackEmail = String(selectedPlan.email || "").trim();

    if (!fallbackEmail) {
      const enteredEmail = window.prompt("Para continuar con el pago, escribe tu correo electrónico:", "");
      fallbackEmail = String(enteredEmail || "").trim();
      if (fallbackEmail) {
        localStorage.setItem("iaJurisUserEmail", fallbackEmail);
      }
    }

    if (!authedUser && !selectedPlan.userId && !fallbackEmail) {
      throw new Error("Necesitamos tu correo para iniciar el pago en Square");
    }

    const customer = {
      id: authedUser && authedUser.id ? authedUser.id : selectedPlan.userId,
      email: authedUser && authedUser.email ? authedUser.email : fallbackEmail,
      fullName: authedUser && authedUser.fullName ? authedUser.fullName : selectedPlan.fullName
    };

    const body = {
      planId: selectedPlan.planId,
      customer: customer
    };

    const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    let lastErrorMessage = "No se pudo iniciar el pago";

    try {
      const response = await fetch(CHECKOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const payload = await response.json().catch(function () { return {}; });
      if (!response.ok) {
        lastErrorMessage = payload && (payload.error || payload.detail)
          ? String(payload.error || payload.detail)
          : "No se pudo iniciar el pago";

        if (!(isLocalHost && (response.status === 404 || response.status === 405 || response.status >= 500))) {
          throw new Error(lastErrorMessage);
        }
      } else if (payload.url) {
        return payload;
      } else {
        lastErrorMessage = "Square no devolvio una URL de checkout";
      }
    } catch (err) {
      lastErrorMessage = err && err.message ? err.message : lastErrorMessage;
    }

    if (isLocalHost) {
      const qs = new URLSearchParams();
      qs.set("redirect", "1");
      qs.set("planId", selectedPlan.planId);
      if (customer.email) qs.set("email", customer.email);
      if (customer.fullName) qs.set("fullName", customer.fullName);
      if (customer.id) qs.set("userId", customer.id);

      return {
        url: CHECKOUT_FALLBACK_API_URL + "?" + qs.toString(),
        bridged: true
      };
    }

    throw new Error(lastErrorMessage);
  }

  function normalizeCheckoutErrorMessage(rawMessage) {
    const detail = String(rawMessage || "").trim();
    if (!detail) {
      return "No se pudo iniciar el pago. Intenta de nuevo en unos minutos.";
    }

    const normalized = detail.toLowerCase();

    if (/fuera de vercel|outside vercel|solo disponible.*vercel/.test(normalized)) {
      return "El pago no esta disponible temporalmente en este entorno. Intenta de nuevo en unos minutos.";
    }

    if (/tardó demasiado|domain.*not.*authorized|not allowed|unauthorized domain|dominio no.*autorizado/.test(normalized)) {
      return "No se pudo iniciar el formulario de pago. Si el problema persiste, contacta a soporte@iajuris.com.";
    }

    if (/square_access_token|square_location_id|no configurada|no configurado/.test(normalized)) {
      return "El modulo de pago esta en mantenimiento temporal. Intenta de nuevo en unos minutos.";
    }

    if (/sandbox|production|wrong environment|invalid application|invalid source/.test(normalized)) {
      return "La tarjeta fue generada en un entorno distinto de Square. Recarga la pagina e intenta de nuevo.";
    }

    if (/insufficient|fondos|declined|card_declined|do_not_honor|payment_limit_exceeded/.test(normalized)) {
      return "La tarjeta fue rechazada por el banco o no tiene fondos suficientes. Intenta con otra tarjeta.";
    }

    if (/cvv|verification|verify_cvv|postal|zip|avs/.test(normalized)) {
      return "Los datos de verificacion de la tarjeta no coinciden (CVV o direccion). Revísalos e intenta de nuevo.";
    }

    if (/expired|expirada|expiration/.test(normalized)) {
      return "La tarjeta parece expirada. Usa una tarjeta vigente.";
    }

    if (/tokenize|source_id|sourceid|card|tarjeta|payment/.test(normalized)) {
      return "No se pudo validar o procesar la tarjeta. Revisa los datos e intenta de nuevo.";
    }

    if (/no devolvio.*url|checkout/.test(normalized)) {
      return "No se pudo abrir Square en este momento. Vuelve a intentar.";
    }

    if (/correo/.test(normalized)) {
      return "Necesitamos tu correo para iniciar el pago en Square.";
    }

    return "No se pudo iniciar el pago. Intenta de nuevo en unos minutos.";
  }

  async function startSquareCheckoutForCard(card) {
    if (!card) return;

    plansModal.querySelectorAll(".plan-card").forEach(function (item) {
      item.classList.remove("selected");
    });
    card.classList.add("selected");
    updatePlansSummary(card);

    const selectedPlan = getSelectedPlanForCheckout();
    if (!selectedPlan || !selectedPlan.planId) {
      setPlansPaymentStatus("Selecciona un plan válido para continuar.", "error");
      return;
    }

    setPlansPaymentStatus("Abriendo formulario seguro de Square...", "");
    setPlanSubscribeButtonsDisabled(false);
    await openSquarePaymentPanel(selectedPlan);
  }

  function updatePlansSummary(card) {
    if (!card) return;
    const plan = card.getAttribute("data-plan") || "Plan Invitado";
    const monthPrice = card.getAttribute("data-month-price") || "0.00";
    const months = card.getAttribute("data-months") || "1";
    const total = card.getAttribute("data-total") || "0.00";
    const currency = card.getAttribute("data-currency") || "COP";

    if (summarySelectedPlan) summarySelectedPlan.textContent = plan;
    if (summaryPriceMonth) summaryPriceMonth.textContent = "$" + monthPrice;
    if (summaryMonths) summaryMonths.textContent = months;
    if (summaryTotal) summaryTotal.textContent = "$" + total + " " + currency;
  }

  function readAuthUsers() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }

  function saveAuthUsers(users) {
    try {
      localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (_err) {
    }
  }

  function setAuthStatus(text, type) {
    if (!authStatus) return;
    authStatus.textContent = String(text || "");
    authStatus.classList.remove("error", "ok");
    if (type === "error" || type === "ok") authStatus.classList.add(type);
  }

  function setPasswordVisibility(input, button, isVisible) {
    if (!input || !button) return;
    input.type = isVisible ? "text" : "password";
    button.setAttribute("aria-pressed", isVisible ? "true" : "false");
    button.setAttribute("aria-label", isVisible ? "Ocultar contraseña" : "Mostrar contraseña");
    button.title = isVisible ? "Ocultar contraseña" : "Mostrar contraseña";
    button.textContent = isVisible ? "🙈" : "👁";
  }

  function resetPasswordVisibility() {
    setPasswordVisibility(authPasswordInput, toggleAuthPasswordBtn, false);
    setPasswordVisibility(authConfirmPasswordInput, toggleAuthConfirmPasswordBtn, false);
  }

  function updateAuthPhotoPreview(photoDataUrl) {
    authPhotoData = String(photoDataUrl || "").trim();
    if (authPhotoDataInput) authPhotoDataInput.value = authPhotoData;
    if (authPhotoPreview) {
      authPhotoPreview.src = authPhotoData || "assets/no-foto.png";
    }
  }

  function applyProfilePhotoData(photoDataUrl) {
    const value = String(photoDataUrl || "").trim();
    if (!value) return;
    runtimeUserPhoto = value;
    const activeEmail = localStorage.getItem("iaJurisUserEmail");
    rememberUserPhoto(activeEmail, value);
    tryPersistUserPhoto(value);
    refreshSidebarUserFooter();
    refreshUserAvatars();
    if (profileModalPhoto) profileModalPhoto.src = value;

    persistUserPhotoWithFallback(value).then(function (storedPhoto) {
      const finalPhoto = String(storedPhoto || value).trim();
      if (!finalPhoto) return;
      runtimeUserPhoto = finalPhoto;
      rememberUserPhoto(activeEmail, finalPhoto);
      refreshSidebarUserFooter();
      refreshUserAvatars();
      if (profileModalPhoto) profileModalPhoto.src = finalPhoto;
    }).catch(function () {});
    
    // Sincronizar foto con backend
    try {
      fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ photoUrl: value })
      }).then(function (res) {
        if (res && res.ok) return res;
        // Fallback al mismo origen activo (evita CORS entre localhost y 127.0.0.1)
        return fetch(window.location.origin + "/api/auth/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ photoUrl: value })
        });
      }).catch(function () {
      });
    } catch (_) {}
  }

  function openPhotoSourceModal(context) {
    if (!photoSourceModal) return;
    photoPickerContext = context === "profile" ? "profile" : "auth";
    photoSourceModal.classList.add("active");
    photoSourceModal.setAttribute("aria-hidden", "false");
  }

  function closePhotoSourceModal() {
    if (!photoSourceModal) return;
    photoSourceModal.classList.remove("active");
    photoSourceModal.setAttribute("aria-hidden", "true");
  }

  function stopCameraStream() {
    if (!cameraStream) return;
    const tracks = cameraStream.getTracks ? cameraStream.getTracks() : [];
    tracks.forEach(function (track) {
      try { track.stop(); } catch (_err) {}
    });
    cameraStream = null;
  }

  function resetCameraCaptureUi() {
    cameraCapturedPhotoData = "";
    if (cameraCaptureCanvas) {
      cameraCaptureCanvas.style.display = "none";
      const ctx = cameraCaptureCanvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, cameraCaptureCanvas.width || 1, cameraCaptureCanvas.height || 1);
      }
    }
    if (cameraCaptureVideo) {
      cameraCaptureVideo.style.display = "block";
    }
    if (retakeCameraPhotoBtn) retakeCameraPhotoBtn.disabled = true;
    if (useCameraPhotoBtn) useCameraPhotoBtn.disabled = true;
    if (takeCameraPhotoBtn) takeCameraPhotoBtn.disabled = false;
  }

  async function openCameraCaptureModal() {
    if (!cameraCaptureModal) return;
    cameraCaptureModal.classList.add("active");
    cameraCaptureModal.setAttribute("aria-hidden", "false");
    resetCameraCaptureUi();
    if (cameraCaptureStatus) cameraCaptureStatus.textContent = "Iniciando cámara...";

    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      if (cameraCaptureStatus) cameraCaptureStatus.textContent = "Tu navegador no soporta cámara en vivo. Se abrirá el selector de archivos.";
      if (authPhotoCameraInput) authPhotoCameraInput.click();
      return;
    }

    try {
      stopCameraStream();
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });

      if (cameraCaptureVideo) {
        cameraCaptureVideo.srcObject = cameraStream;
        await cameraCaptureVideo.play().catch(function () {});
      }

      if (cameraCaptureStatus) cameraCaptureStatus.textContent = "Cámara lista. Toma tu foto.";
    } catch (_err) {
      if (cameraCaptureStatus) cameraCaptureStatus.textContent = "No se pudo acceder a la cámara en vivo. Se abrirá la cámara del dispositivo.";
      closeCameraCaptureModal();
      if (authPhotoCameraInput) authPhotoCameraInput.click();
    }
  }

  function closeCameraCaptureModal() {
    if (!cameraCaptureModal) return;
    cameraCaptureModal.classList.remove("active");
    cameraCaptureModal.setAttribute("aria-hidden", "true");
    stopCameraStream();
    if (cameraCaptureVideo) {
      cameraCaptureVideo.srcObject = null;
    }
    resetCameraCaptureUi();
  }

  function processProfilePhotoFile(file) {
    if (!file) return;
    if (!String(file.type || "").toLowerCase().startsWith("image/")) {
      if (photoPickerContext !== "profile") {
        setAuthStatus("Selecciona una imagen válida para tu foto de perfil.", "error");
      }
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      if (photoPickerContext !== "profile") {
        setAuthStatus("La foto no debe superar 3 MB.", "error");
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      const photoDataUrl = String(reader.result || "");
      if (photoPickerContext === "profile") {
        applyProfilePhotoData(photoDataUrl);
      } else {
        updateAuthPhotoPreview(photoDataUrl);
        setAuthStatus("Foto de perfil cargada.", "ok");
      }
    };
    reader.onerror = function () {
      if (photoPickerContext !== "profile") {
        setAuthStatus("No se pudo leer la imagen seleccionada.", "error");
      }
    };
    reader.readAsDataURL(file);
  }

  function setAuthMode(mode) {
    authMode = mode === "register" ? "register" : "login";
    if (!authModal) return;

    const isRegister = authMode === "register";
    if (authModalTitle) authModalTitle.textContent = isRegister ? "Crear cuenta" : "Iniciar sesión";
    if (authModalSubtitle) authModalSubtitle.textContent = isRegister
      ? "Registra tu cuenta para guardar tu perfil y continuar en IA Juris."
      : "Ingresa con tu cuenta para continuar en la plataforma.";
    if (authSubmitBtn) authSubmitBtn.textContent = isRegister ? "Crear cuenta" : "Iniciar sesión";
    if (authSwitchBtn) authSwitchBtn.textContent = isRegister
      ? "¿Ya tienes cuenta? Inicia sesión"
      : "¿No tienes cuenta? Regístrate";

    if (authNameGroup) authNameGroup.classList.toggle("auth-hidden", !isRegister);
    if (authConfirmGroup) authConfirmGroup.classList.toggle("auth-hidden", !isRegister);
    if (authPhotoGroup) authPhotoGroup.classList.toggle("auth-hidden", !isRegister);
    if (authConfirmPasswordInput) {
      authConfirmPasswordInput.value = "";
      authConfirmPasswordInput.disabled = !isRegister;
    }

    resetPasswordVisibility();
    setAuthStatus("", "");
  }

  function setAuthModalStep(step) {
    authModalStep = step === "welcome" ? "welcome" : "form";
    if (!authModal) return;
    authModal.classList.toggle("auth-show-welcome", authModalStep === "welcome");
    authModal.classList.toggle("auth-show-form", authModalStep === "form");
  }

  function openAuthModal(mode, options) {
    const cfg = options && typeof options === "object" ? options : {};
    if (!authModal) return;
    setAuthMode(mode);
    const shouldUseWelcomeOnMobile = DEVICE.isPhone && !!authWelcomePanel && !cfg.forceForm;
    setAuthModalStep(shouldUseWelcomeOnMobile ? "welcome" : "form");
    authModal.classList.add("active");
    authModal.setAttribute("aria-hidden", "false");

    if (authForm) authForm.reset();
    resetPasswordVisibility();
    updateAuthPhotoPreview("");
    if (authModalStep === "form" && authEmailInput) authEmailInput.focus();
    if (authModalStep === "form" && authMode === "register" && authNameInput) {
      authNameInput.focus();
    }
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.remove("active");
    authModal.setAttribute("aria-hidden", "true");
    setAuthModalStep("form");
    setAuthStatus("", "");
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function createLocalUser(fullName, email, password, photoData) {
    const users = readAuthUsers();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const exists = users.find(function (u) {
      return String(u.email || "").trim().toLowerCase() === normalizedEmail;
    });

    if (exists) {
      throw new Error("Este correo ya está registrado. Inicia sesión.");
    }

    const user = {
      id: "user-" + Date.now(),
      fullName: String(fullName || "").trim(),
      email: normalizedEmail,
      password: String(password || ""),
      photo: String(photoData || "")
    };

    users.push(user);
    saveAuthUsers(users);
    return user;
  }

  function loginLocalUser(email, password) {
    const users = readAuthUsers();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    return users.find(function (u) {
      return String(u.email || "").trim().toLowerCase() === normalizedEmail && String(u.password || "") === String(password || "");
    }) || null;
  }

  async function apiRegisterUser(payload) {
    const response = await fetch(AUTH_REGISTER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload || {})
    });

    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(String((data && (data.error || data.detail)) || "No se pudo registrar la cuenta."));
    }

    return data;
  }

  async function apiLoginUser(payload) {
    const response = await fetch(AUTH_LOGIN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload || {})
    });

    const data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(String((data && (data.error || data.detail)) || "No se pudo iniciar sesión."));
    }

    return data;
  }

  function persistSessionUser(user) {
    if (!user) return;
    if (user.id) localStorage.setItem("iaJurisUserId", String(user.id));
    if (user.fullName || user.name) localStorage.setItem("iaJurisUserName", String(user.fullName || user.name));
    const userEmail = String(user.email || "").trim();
    if (userEmail) localStorage.setItem("iaJurisUserEmail", userEmail);
    const photo = String(user.photo || user.photoUrl || user.avatarUrl || "").trim();
    if (photo) {
      rememberUserPhoto(userEmail, photo);
      localStorage.setItem("iaJurisUserPhoto", photo);
    } else {
      const rememberedPhoto = getRememberedUserPhoto(userEmail);
      if (rememberedPhoto) {
        localStorage.setItem("iaJurisUserPhoto", rememberedPhoto);
      }
    }
    hasRegisteredSession = true;
    temporaryGuestMode = false;
    setSessionActiveFlag(true);
    refreshSidebarUserFooter();
    refreshUserAvatars();
    refreshGuestHeaderActions();

    syncProfileFromBackend();
  }

  function syncProfileFromBackend() {
    const activeEmail = String(localStorage.getItem("iaJurisUserEmail") || "").trim();

    function applyProfileData(payload) {
      const user = payload && payload.user ? payload.user : null;
      if (!user) return;

      hasRegisteredSession = true;
      temporaryGuestMode = false;
      setSessionActiveFlag(true);

      const nextEmail = String(user.email || activeEmail || "").trim();
      const nextName = String(user.fullName || user.name || "").trim();
      const nextPlan = String(user.paidPlanName || user.planName || user.plan || "").trim();
      const nextPhoto = String(user.photoUrl || user.avatarUrl || user.photo || payload.photoUrl || "").trim();

      if (user.id) localStorage.setItem("iaJurisUserId", String(user.id));
      if (nextEmail) localStorage.setItem("iaJurisUserEmail", nextEmail);
      if (nextName) localStorage.setItem("iaJurisUserName", nextName);
      if (nextPlan) localStorage.setItem("iaJurisUserPlan", nextPlan);

      if (nextPhoto) {
        rememberUserPhoto(nextEmail || activeEmail, nextPhoto);
        localStorage.setItem("iaJurisUserPhoto", nextPhoto);
      }

      refreshSidebarUserFooter();
      refreshUserAvatars();
      refreshGuestHeaderActions();
    }

    try {
      fetch("/api/auth/profile", { method: "GET", credentials: "include" })
        .then(function (res) {
          if (!res.ok) throw new Error("profile-not-ok");
          return res.json();
        })
        .then(function (data) {
          applyProfileData(data);
        })
        .catch(function () {
          return fetch(window.location.origin + "/api/auth/profile", {
            method: "GET",
            credentials: "include"
          })
            .then(function (res) {
              if (!res.ok) throw new Error("profile-fallback-not-ok");
              return res.json();
            })
            .then(function (data) {
              applyProfileData(data);
            })
            .catch(function () {});
        });
    } catch (_) {}
  }

  function openModal() {
    chatModal.classList.add("active");
    chatModal.setAttribute("aria-hidden", "false");
    chatInput.focus();
  }

  function enterStaticChat(trigger) {
    if (splashSection) {
      if (DEVICE.isPhone) {
        splashSection.style.display = "none";
      } else {
        splashSection.classList.add("splash-exit");
        setTimeout(function () {
          splashSection.style.display = "none";
        }, 300);
      }
    }

    if (appShell && chatModal && chatModal.parentElement !== appShell) {
      appShell.appendChild(chatModal);
    }

    chatModal.classList.add("chat-static", "active");
    chatModal.setAttribute("aria-hidden", "false");

    if (trigger === "login" || trigger === "register") {
      hasRegisteredSession = true;
      temporaryGuestMode = false;
    }

    saveAppUIState({ staticChat: true, guestMode: temporaryGuestMode });

    refreshUserAvatars();
    refreshSidebarUserFooter();
    refreshGuestHeaderActions();

    chatInput.focus();
  }

  function closeModal() {
    chatModal.classList.remove("active");
    chatModal.setAttribute("aria-hidden", "true");
  }

  function returnToLandingPage() {
    if (window.location.pathname !== "/") {
      window.location.href = "/";
      return;
    }

    if (chatModal) {
      chatModal.classList.remove("chat-static", "active");
      chatModal.setAttribute("aria-hidden", "true");
    }

    if (publicLanding) {
      publicLanding.classList.remove("trial-hidden", "trial-fade-out");
    }

    if (heroSection) {
      heroSection.classList.remove("trial-visible");
      heroSection.classList.add("trial-locked");
      heroSection.setAttribute("aria-hidden", "true");
    }

    if (appShell) {
      appShell.classList.remove("trial-focus");
    }

    if (splashSection) {
      splashSection.classList.remove("splash-exit");
      splashSection.style.display = "";
    }

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    saveAppUIState({ staticChat: false, guestMode: temporaryGuestMode });

    if (publicLanding && typeof publicLanding.scrollIntoView === "function") {
      publicLanding.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (openLoginBtn) {
    openLoginBtn.addEventListener("click", function () {
      openAuthModal("login", { forceForm: true });
    });
  }

  if (openRegisterBtn) {
    openRegisterBtn.addEventListener("click", function () {
      openAuthModal("register", { forceForm: true });
    });
  }

  if (openAssistantChatBtn) {
    openAssistantChatBtn.addEventListener("click", function () {
      enterStaticChat("chat");
    });
  }

  if (returnLandingBtn) {
    returnLandingBtn.addEventListener("click", function () {
      returnToLandingPage();
    });
  }

  function openDownloadModal() {
    if (!downloadAppModal) return;
    downloadAppModal.classList.add("active");
    downloadAppModal.setAttribute("aria-hidden", "false");
    refreshDownloadModalManifest();
  }

  function closeDownloadModal() {
    if (!downloadAppModal) return;
    downloadAppModal.classList.remove("active");
    downloadAppModal.setAttribute("aria-hidden", "true");
  }

  function buildNoCacheUrl(baseUrl, versionTag) {
    const raw = String(baseUrl || "").trim();
    if (!raw) return "";
    const separator = raw.includes("?") ? "&" : "?";
    const parts = ["t=" + Date.now()];
    if (versionTag) parts.unshift("v=" + encodeURIComponent(versionTag));
    return raw + separator + parts.join("&");
  }

  function getFileNameFromUrl(url) {
    const value = String(url || "").trim();
    if (!value) return "";
    const clean = value.split("?")[0].split("#")[0];
    const chunks = clean.split("/").filter(Boolean);
    return chunks.length ? chunks[chunks.length - 1] : "";
  }

  async function refreshDownloadModalManifest() {
    if (!androidApkLink) return;

    const fallbackHref = String(androidApkLink.getAttribute("href") || "").trim();

    try {
      const response = await fetch(ANDROID_UPDATE_MANIFEST_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) throw new Error("manifest_not_ok");
      const manifest = await response.json();

      const latestVersion = String(manifest && manifest.latestVersion || "").trim();
      const apkUrl = String(manifest && manifest.apkUrl || "").trim();
      const landingUrl = String(manifest && manifest.landingUrl || "").trim();
      const nextUrl = apkUrl || landingUrl || fallbackHref;

      if (!nextUrl) {
        androidApkLink.removeAttribute("href");
        androidApkLink.removeAttribute("download");
        androidApkLink.setAttribute("aria-disabled", "true");
        androidApkLink.textContent = "No disponible";
        if (androidVersionLabel) {
          androidVersionLabel.textContent = "Version no disponible";
        }
        return;
      }

      const isApkDirect = /\.apk($|\?)/i.test(nextUrl);
      const resolvedUrl = isApkDirect ? nextUrl : buildNoCacheUrl(nextUrl, latestVersion);
      androidApkLink.setAttribute("href", resolvedUrl);
      androidApkLink.setAttribute("aria-disabled", "false");
      androidApkLink.innerHTML = "<svg width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v13M7 11l5 5 5-5\"/><path d=\"M4 20h16\"/></svg>Descargar APK";

      if (apkUrl) {
        const downloadName = getFileNameFromUrl(apkUrl) || "IA-Juris-Android-Release.apk";
        androidApkLink.setAttribute("download", downloadName);
      } else {
        androidApkLink.removeAttribute("download");
      }

      if (androidVersionLabel) {
        androidVersionLabel.textContent = latestVersion
          ? ("v" + latestVersion + " — Disponible")
          : "Disponible";
      }
    } catch (_) {
      const fallbackIsApk = /\.apk($|\?)/i.test(fallbackHref);
      const fallbackUrl = fallbackIsApk ? fallbackHref : buildNoCacheUrl(fallbackHref, "");
      androidApkLink.setAttribute("href", fallbackUrl);
      const fallbackName = getFileNameFromUrl(fallbackHref) || "IA-Juris-Android-Release.apk";
      androidApkLink.setAttribute("download", fallbackName);
      androidApkLink.setAttribute("aria-disabled", "false");
      if (androidVersionLabel && !String(androidVersionLabel.textContent || "").trim()) {
        androidVersionLabel.textContent = "Disponible";
      }
    }
  }

  if (openDownloadAppBtn) {
    openDownloadAppBtn.addEventListener("click", function () {
      openDownloadModal();
    });
  }

  if (closeDownloadAppModal) {
    closeDownloadAppModal.addEventListener("click", function () {
      closeDownloadModal();
    });
  }

  if (downloadAppModal) {
    downloadAppModal.addEventListener("click", function (event) {
      if (event.target === downloadAppModal || event.target.classList.contains("dl-modal-backdrop")) {
        closeDownloadModal();
      }
    });
  }

  if (openTrialBtn) {
    openTrialBtn.addEventListener("click", function () {
      if (window.location.pathname !== "/") {
        window.location.href = "/";
        return;
      }

      openAuthModal("register");
    });
  }

  if (viewPlatformBtn) {
    viewPlatformBtn.addEventListener("click", function (event) {
      event.preventDefault();

      if (window.location.pathname !== "/") {
        window.location.href = "/#heroSection";
        return;
      }

      const alreadyVisible = !!heroSection && !heroSection.classList.contains("trial-locked");
      if (alreadyVisible) {
        if (typeof heroSection.scrollIntoView === "function") {
          heroSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (window.location.hash !== "#heroSection") {
          history.replaceState(null, "", "#heroSection");
        }
        return;
      }

      revealHeroSection({ loadingMs: 0, showLoader: false });
    });
  }

  if (headerLoginBtn) {
    headerLoginBtn.addEventListener("click", function () {
      openAuthModal("login");
    });
  }

  if (headerRegisterBtn) {
    headerRegisterBtn.addEventListener("click", function () {
      openAuthModal("register");
    });
  }

  if (headerTemporaryChatBtn) {
    headerTemporaryChatBtn.addEventListener("click", function () {
      activateTemporaryGuestChat();
    });
  }

  if (headerLogoutBtn) {
    headerLogoutBtn.addEventListener("click", async function () {
      await performLogout();
    });
  }

  function setSidebarCollapsed(collapsed) {
    if (!chatModalContent || !toggleSidebarBtn) return;

    if (DEVICE.isPhone) {
      chatModalContent.classList.toggle("mobile-sidebar-open", !collapsed);
      toggleSidebarBtn.setAttribute("aria-expanded", String(!collapsed));
      toggleSidebarBtn.title = collapsed ? "Abrir menú" : "Cerrar menú";
      return;
    }

    chatModalContent.classList.toggle("sidebar-collapsed", !!collapsed);
    toggleSidebarBtn.setAttribute("aria-expanded", String(!collapsed));
    toggleSidebarBtn.title = collapsed ? "Mostrar panel lateral" : "Ocultar panel lateral";
  }

  function toggleSidebar() {
    if (!chatModalContent) return;
    const willCollapse = DEVICE.isPhone
      ? chatModalContent.classList.contains("mobile-sidebar-open")
      : !chatModalContent.classList.contains("sidebar-collapsed");
    setSidebarCollapsed(willCollapse);
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (toggleSidebarBtn && chatModalContent) {
    if (DEVICE.isPhone) {
      setSidebarCollapsed(true);
      toggleSidebarBtn.textContent = "☰";
      toggleSidebarBtn.setAttribute("aria-label", "Abrir menú lateral");
    } else {
      setSidebarCollapsed(chatModalContent.classList.contains("sidebar-collapsed"));
    }

    toggleSidebarBtn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      toggleSidebar();
    });

    toggleSidebarBtn.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleSidebar();
    });
  }

  if (mobileSidebarBackdrop) {
    mobileSidebarBackdrop.addEventListener("click", function () {
      setSidebarCollapsed(true);
    });
  }

  // Event listeners para tipo de consulta
  const consultationTypeBtns = document.querySelectorAll(".consultation-type-btn");
  const suggestionItems = document.querySelectorAll(".suggestion-item");

  function setConsultationType(newType) {
    const allowedTypes = ["general", "demanda", "contrato", "norma"];
    const selectedType = allowedTypes.indexOf(newType) >= 0 ? newType : "general";
    currentConsultationType = selectedType;
    if (selectedType !== "contrato") {
      contractDraftFlow = { stage: "idle", country: "", contractType: "" };
    }
    if (selectedType !== "demanda") {
      demandaDraftFlow = { stage: "idle", country: "" };
    }
    if (selectedType !== "norma") {
      normaQueryFlow = { stage: "idle", country: "" };
    }

    consultationTypeBtns.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-type") === selectedType);
    });

    const listGeneral = document.getElementById("suggestionsListGeneral");
    const listDemanda = document.getElementById("suggestionsListDemanda");
    const listContrato = document.getElementById("suggestionsListContrato");
    const listNorma = document.getElementById("suggestionsListNorma");
    if (listGeneral) listGeneral.style.display = selectedType === "general" ? "grid" : "none";
    if (listDemanda) listDemanda.style.display = selectedType === "demanda" ? "grid" : "none";
    if (listContrato) listContrato.style.display = selectedType === "contrato" ? "grid" : "none";
    if (listNorma) listNorma.style.display = selectedType === "norma" ? "grid" : "none";

    mobileTabButtons.forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-mobile-consultation") === selectedType);
    });

    if (chatInput) {
      const placeholderByType = {
        general: DEFAULT_CHAT_PLACEHOLDER,
        demanda: "Escribe el país para tu demanda...",
        contrato: "Escribe el país de tu contrato...",
        norma: "Escribe la ley, código o artículo que deseas consultar..."
      };
      chatInput.placeholder = placeholderByType[selectedType] || DEFAULT_CHAT_PLACEHOLDER;
    }
  }

  function triggerDemandaCountryPrompt() {
    if (!chatMessages) return;
    demandaDraftFlow = {
      stage: "awaiting-country",
      country: ""
    };

    const botRows = Array.from(chatMessages.querySelectorAll(".message-row.bot:not(.message-row-typing)"));
    const lastBotRow = botRows.length ? botRows[botRows.length - 1] : null;
    const lastBubble = lastBotRow ? lastBotRow.querySelector(".message-bubble.bot") : null;
    const lastText = String(lastBubble && lastBubble.dataset ? lastBubble.dataset.messageText || "" : "").trim();

    if (lastText !== DEMANDA_COUNTRY_PROMPT) {
      addMessage(DEMANDA_COUNTRY_PROMPT, false, { relatedQuery: "demanda" });
    }

    if (chatInput) {
      chatInput.value = "";
      chatInput.placeholder = "Escribe el país para tu demanda...";
      chatInput.focus();
    }
  }

  function triggerContractCountryPrompt() {
    if (!chatMessages) return;
    contractDraftFlow = {
      stage: "awaiting-country",
      country: "",
      contractType: ""
    };

    const botRows = Array.from(chatMessages.querySelectorAll(".message-row.bot:not(.message-row-typing)"));
    const lastBotRow = botRows.length ? botRows[botRows.length - 1] : null;
    const lastBubble = lastBotRow ? lastBotRow.querySelector(".message-bubble.bot") : null;
    const lastText = String(lastBubble && lastBubble.dataset ? lastBubble.dataset.messageText || "" : "").trim();

    if (lastText !== CONTRACT_COUNTRY_PROMPT) {
      addMessage(CONTRACT_COUNTRY_PROMPT, false, { relatedQuery: "contrato" });
    }

    if (chatInput) {
      chatInput.value = "";
      chatInput.placeholder = "Escribe el país de tu contrato...";
      chatInput.focus();
    }
  }

  function buildContractDraftRequest(country, contractType) {
    const cleanCountry = String(country || "").trim();
    const cleanType = String(contractType || "").trim();
    return [
      `Redacta un borrador de contrato de ${cleanType}.`,
      `País aplicable: ${cleanCountry}.`,
      "Incluye encabezado, identificación de las partes, objeto, cláusulas principales, obligaciones, duración si aplica, terminación, resolución de conflictos y firmas.",
      "Usa lenguaje jurídico claro, formato profesional y adapta el borrador a la legislación del país indicado.",
      "Si faltan datos específicos de las partes o montos, deja campos listos para completar sin detener la redacción."
    ].join(" ");
  }

  function triggerNormaCountryPrompt() {
    if (!chatMessages) return;
    normaQueryFlow = {
      stage: "awaiting-country",
      country: ""
    };

    const botRows = Array.from(chatMessages.querySelectorAll(".message-row.bot:not(.message-row-typing)"));
    const lastBotRow = botRows.length ? botRows[botRows.length - 1] : null;
    const lastBubble = lastBotRow ? lastBotRow.querySelector(".message-bubble.bot") : null;
    const lastText = String(lastBubble && lastBubble.dataset ? lastBubble.dataset.messageText || "" : "").trim();

    if (lastText !== NORMA_COUNTRY_PROMPT) {
      addMessage(NORMA_COUNTRY_PROMPT, false, { relatedQuery: "norma" });
    }

    if (chatInput) {
      chatInput.value = "";
      chatInput.placeholder = "Escribe el país para tu consulta legal...";
      chatInput.focus();
    }
  }

  function buildNormaGeneralRequest(country, question) {
    const cleanCountry = String(country || "").trim();
    const cleanQuestion = String(question || "").trim();
    return [
      `Consulta legal para ${cleanCountry}: ${cleanQuestion}.`,
      "Responde directo y preciso con la norma aplicable.",
      "Formato obligatorio: 1) Norma principal (numero y nombre), 2) Articulo(s) clave, 3) Aplicacion practica breve.",
      "Sin plantillas ni relleno."
    ].join(" ");
  }

  function buildDemandaDraftRequest(country, casePrompt) {
    const cleanCountry = String(country || "").trim();
    const cleanCasePrompt = String(casePrompt || "").trim();
    return [
      `Redacta una plantilla de demanda para ${cleanCountry}.`,
      `Hechos y objetivo del usuario: ${cleanCasePrompt}.`,
      "Estructura obligatoria: encabezado competente, partes, hechos cronologicos, fundamentos juridicos, pretensiones, pruebas, anexos y firma.",
      "Adapta la redaccion al pais indicado y usa lenguaje juridico claro, formal y accionable.",
      "Si falta informacion especifica (identificacion, montos o fechas), deja campos listos para completar sin detener la redaccion."
    ].join(" ");
  }

  function consumeContractDraftFlow(text) {
    const value = String(text || "").trim();
    if (!value || currentConsultationType !== "contrato") return null;

    if (contractDraftFlow.stage === "awaiting-country") {
      contractDraftFlow.country = value;
      contractDraftFlow.stage = "awaiting-type";
      if (chatInput) {
        chatInput.value = "";
        chatInput.placeholder = "Escribe el tipo de contrato que necesitas...";
      }
      return {
        handled: true,
        replyText: CONTRACT_TYPE_PROMPT,
        requestText: null
      };
    }

    if (contractDraftFlow.stage === "awaiting-type") {
      contractDraftFlow.contractType = value;
      contractDraftFlow.stage = "draft-ready";
      if (chatInput) {
        chatInput.value = "";
        chatInput.placeholder = "Describe detalles adicionales de tu contrato...";
      }
      return {
        handled: false,
        replyText: null,
        requestText: buildContractDraftRequest(contractDraftFlow.country, contractDraftFlow.contractType)
      };
    }

    return null;
  }

  function consumeNormaQueryFlow(text) {
    const value = String(text || "").trim();
    if (!value || currentConsultationType !== "norma") return null;

    if (normaQueryFlow.stage === "awaiting-country") {
      normaQueryFlow.country = value;
      normaQueryFlow.stage = "awaiting-question";
      if (chatInput) {
        chatInput.value = "";
        chatInput.placeholder = "Escribe tu consulta legal o norma...";
      }
      return {
        handled: true,
        replyText: NORMA_QUESTION_PROMPT,
        requestText: null,
        relatedQuery: "norma"
      };
    }

    if (normaQueryFlow.stage === "awaiting-question") {
      const generalCue = isGeneralInfoQuery(value) || /\b(hablame de|háblame de|quien es|quién es|quien fue|quién fue|biografia|biografía|historia de|capital de|poblacion de|población de|fecha de nacimiento|nacio|nació|murio|murió)\b/i.test(value);
      if (generalCue) {
        normaQueryFlow.stage = "idle";
        normaQueryFlow.country = "";
        setConsultationType("general");
        if (chatInput) {
          chatInput.value = "";
          chatInput.placeholder = "Escribe tu consulta general o legal...";
        }
        return {
          handled: false,
          replyText: null,
          requestText: value,
          relatedQuery: value
        };
      }

      const request = buildNormaGeneralRequest(normaQueryFlow.country, value);
      normaQueryFlow.stage = "idle";
      if (chatInput) {
        chatInput.value = "";
        chatInput.placeholder = "Escribe la ley, código o artículo que deseas consultar...";
      }
      return {
        handled: false,
        replyText: null,
        requestText: request,
        relatedQuery: request
      };
    }

    return null;
  }

  function consumeDemandaDraftFlow(text) {
    const value = String(text || "").trim();
    if (!value || currentConsultationType !== "demanda") return null;

    if (demandaDraftFlow.stage === "awaiting-country") {
      demandaDraftFlow.country = value;
      demandaDraftFlow.stage = "awaiting-case";
      if (chatInput) {
        chatInput.value = "";
        chatInput.placeholder = "Describe los hechos y lo que quieres pedir en la demanda...";
      }
      return {
        handled: true,
        replyText: DEMANDA_CASE_PROMPT,
        requestText: null,
        relatedQuery: "demanda"
      };
    }

    if (demandaDraftFlow.stage === "awaiting-case") {
      const request = buildDemandaDraftRequest(demandaDraftFlow.country, value);
      demandaDraftFlow.stage = "idle";
      if (chatInput) {
        chatInput.value = "";
        chatInput.placeholder = "Describe detalles adicionales de tu demanda...";
      }
      return {
        handled: false,
        replyText: null,
        requestText: request,
        relatedQuery: request
      };
    }

    return null;
  }
  
  consultationTypeBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const newType = this.getAttribute("data-type");
      setConsultationType(newType);
      if (newType === "contrato") {
        triggerContractCountryPrompt();
      }
      if (newType === "norma") {
        triggerNormaCountryPrompt();
      }
      if (newType === "demanda") {
        triggerDemandaCountryPrompt();
      }
      if (DEVICE.isPhone) setSidebarCollapsed(true);
    });
  });

  mobileTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const tabType = btn.getAttribute("data-mobile-consultation") || "general";
      if (chatModal && !chatModal.classList.contains("active")) {
        enterStaticChat("chat");
      }
      setConsultationType(tabType);
      if (tabType === "contrato") {
        triggerContractCountryPrompt();
        return;
      }
      if (tabType === "demanda") {
        triggerDemandaCountryPrompt();
        return;
      }
      if (tabType === "norma") {
        triggerNormaCountryPrompt();
        return;
      }
      if (chatInput) chatInput.focus();
    });
  });

  if (mobileTabAccountBtn) {
    mobileTabAccountBtn.addEventListener("click", function () {
      if (chatModal && !chatModal.classList.contains("active")) {
        enterStaticChat("chat");
      }
      if (!chatModalContent || !DEVICE.isPhone) return;
      setSidebarCollapsed(false);
    });
  }
  
  function triggerGeneralGuidedPrompt(seedText) {
    if (!chatMessages) return;
    const seed = String(seedText || "").trim().toLowerCase();
    let guidedText = "Para orientarte con precision legal, escribe: 1) pais, 2) materia (laboral/civil/penal/consumo), 3) hecho principal y 4) resultado que buscas.";

    if (seed.includes("derecho")) {
      guidedText = "Para decirte exactamente que derecho te aplica, dime: pais, relacion juridica (laboral/civil/penal/consumo), hecho clave y que necesitas reclamar o defender.";
    } else if (seed.includes("asesoria")) {
      guidedText = "Para darte asesoria legal util y sin relleno, comparte: pais, problema concreto, documentos que tienes y objetivo (negociar, reclamar, demandar o defenderte).";
    } else if (seed.includes("consultar")) {
      guidedText = "Indica el tema legal con este formato: pais + norma/area + hecho breve + pregunta puntual. Con eso te respondo directo con base legal aplicable.";
    }

    addMessage(guidedText, false, { relatedQuery: "consulta general guiada" });
    if (chatInput) {
      chatInput.value = "";
      chatInput.placeholder = "Ejemplo: Peru, laboral, despido verbal sin pago, quiero reclamar beneficios";
      chatInput.focus();
    }
  }

  suggestionItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const type = this.getAttribute("data-type") || "general";
      const suggestionText = String(this.textContent || "").trim();
      setConsultationType(type);

      if (type === "demanda") {
        triggerDemandaCountryPrompt();
        return;
      }

      if (type === "contrato") {
        triggerContractCountryPrompt();
        return;
      }

      if (type === "norma") {
        triggerNormaCountryPrompt();
        return;
      }

      triggerGeneralGuidedPrompt(suggestionText);
    });
  });

  if (chatModal) {
    chatModal.addEventListener("click", function (event) {
      if (!chatModal.classList.contains("chat-static") && event.target === chatModal) closeModal();
    });
  }

  function hasEmojiGlyph(text) {
    return /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(String(text || ""));
  }

  function pickContextEmoji(text) {
    const value = String(text || "");
    const folded = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (/(demanda|querella|tribunal|juzgado|pretension|pretensiones)/.test(folded)) return "⚖️";
    if (/(contrato|clausula|compraventa|arrendamiento|firma|partes)/.test(folded)) return "📝";
    if (/(ley|articulo|art\.|codigo|norma|decreto|resolucion)/.test(folded)) return "📚";
    if (/(plazo|riesgo|incumplimiento|sancion|multa|advertencia|cuidado)/.test(folded)) return "⚠️";
    if (/(paso|pasos|procedimiento|ruta|guia|formato|plantilla)/.test(folded)) return "✅";
    if (value.length > 40) return "💡";
    return "";
  }

  function addContextEmoji(text) {
    const raw = String(text || "").trim();
    if (!raw) return raw;
    if (hasEmojiGlyph(raw)) return raw;

    const emoji = pickContextEmoji(raw);
    if (!emoji) return raw;
    return emoji + " " + raw;
  }

  function formatBotResponse(text) {
    const decoratedText = addContextEmoji(text);
    const lines = String(decoratedText || "").split("\n").filter(line => line.trim());
    let html = "";

    function renderInline(raw) {
      // Escapar HTML primero
      let safe = escapeHtml(raw);

      // ── Markdown manual ────────────────────────────────────────
      // **negrita** o __negrita__
      safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      safe = safe.replace(/__([^_]+)__/g, "<strong>$1</strong>");
      // *cursiva* o _cursiva_
      safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      safe = safe.replace(/_([^_]+)_/g, "<em>$1</em>");
      // ~~subrayado~~ (marcador manual del modelo)
      safe = safe.replace(/~~([^~]+)~~/g, "<u>$1</u>");

      // ── Auto-formato jurídico ───────────────────────────────────
      // Artículos: Art. 123, Artículo 45, art. 1
      safe = safe.replace(
        /\b(Art(?:í|i)culo\.?|Art\.)(\s+\d[\w\-]*)/gi,
        function (_, prefix, num) {
          return "<u>" + prefix + num + "</u>";
        }
      );

      // Párrafos: Párrafo I, Párrafo Único
      safe = safe.replace(
        /\b(P[aá]rrafo\s+(?:I{1,3}|IV|V{1,3}|[Ú|U]nico))\b/gi,
        "<u>$1</u>"
      );

      // Nombres de leyes: Ley No. 123-21, Ley Núm. 456
      safe = safe.replace(
        /\b(Ley\s+(?:No|N[uú]m)\.?\s*[\d][\d\-]*)/gi,
        "<strong>$1</strong>"
      );

      // Ley Orgánica, Ley General, Ley Especial ...
      safe = safe.replace(
        /\b(Ley\s+(?:Org[aá]nica|General|Especial|Marco|de\s+(?:[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s?){1,4}))/g,
        "<strong>$1</strong>"
      );

      // Códigos: Código Civil, Código Penal, Código de Trabajo, etc.
      safe = safe.replace(
        /\b(C[oó]digo\s+(?:Civil|Penal|de\s+Trabajo|Tributario|Procesal\s+(?:Civil|Penal)|Comercial|de\s+Comercio))/gi,
        "<strong>$1</strong>"
      );

      // Constitución
      safe = safe.replace(
        /\b(Constituci[oó]n(?:\s+de\s+la\s+Rep[uú]blica)?)/gi,
        "<strong>$1</strong>"
      );

      // Reglamentos y Decretos: Reglamento No. 123, Decreto No. 456
      safe = safe.replace(
        /\b((?:Reglamento|Decreto)\s+No\.?\s*[\d][\d\-]*)/gi,
        "<strong>$1</strong>"
      );

      // Resoluciones: Resolución No. 123-2024
      safe = safe.replace(
        /\b(Resoluci[oó]n\s+No\.?\s*[\d][\d\-]*)/gi,
        "<strong>$1</strong>"
      );

      return safe;
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.endsWith(":")) {
        html += "<p style='font-weight: 700; margin: 8px 0 4px;'>" + renderInline(line) + "</p>";
      } else {
        html += "<p style='margin: 4px 0;'>" + renderInline(line) + "</p>";
      }
    }
    return html || "<p>" + renderInline(decoratedText) + "</p>";
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function formatMessageTime12h(dateValue) {
    const dt = dateValue instanceof Date ? dateValue : new Date();
    return dt.toLocaleTimeString("es-DO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  async function copyTextToClipboard(text) {
    const value = String(text || "").trim();
    if (!value) return false;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_err) {
    }

    try {
      const tempArea = document.createElement("textarea");
      tempArea.value = value;
      tempArea.setAttribute("readonly", "true");
      tempArea.style.position = "fixed";
      tempArea.style.opacity = "0";
      document.body.appendChild(tempArea);
      tempArea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(tempArea);
      return !!copied;
    } catch (_err) {
      return false;
    }
  }

  function buildAssistantFallbackSources(contextText) {
    const normalizedQuery = String(contextText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
    const query = normalizedQuery || "consulta juridica";
    const encoded = encodeURIComponent(query);
    return [
      "https://es.wikipedia.org/w/index.php?search=" + encoded,
      "https://www.google.com/search?q=" + encoded
    ];
  }

  function renderSourceChips(sources, contextText) {
    const cleanSources = Array.isArray(sources)
      ? sources.filter(function (url) {
          const value = String(url || "").trim();
          return /^https?:\/\//i.test(value);
        })
      : [];
    const finalSources = cleanSources;
    if (!finalSources.length) {
      return null;
    }

    function getSourceLabel(url, index) {
      try {
        const parsed = new URL(String(url || "").trim());
        const host = String(parsed.hostname || "").replace(/^www\./i, "");
        return host || ("Fuente " + (index + 1));
      } catch (_err) {
        return "Fuente " + (index + 1);
      }
    }

    const row = document.createElement("div");
    row.className = "message-sources-row";

    finalSources.forEach(function (url, index) {
      const chip = document.createElement("a");
      chip.className = "message-source-chip";
      chip.href = String(url || "").trim();
      chip.target = "_blank";
      chip.rel = "noopener noreferrer";
      chip.textContent = getSourceLabel(url, index);
      chip.title = String(url || "").trim();
      chip.style.animationDelay = (index * 0.08) + "s";
      row.appendChild(chip);
    });

    return row;
  }

  function extractImageSubjectTerms(prompt) {
    const base = String(prompt || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!base) return [];

    const stop = {
      de: true, del: true, la: true, el: true, los: true, las: true,
      un: true, una: true, unos: true, unas: true, y: true, o: true,
      por: true, para: true, con: true, sin: true, sobre: true, en: true,
      dime: true, dame: true, explica: true, explicame: true, biografia: true,
      perfil: true, quien: true, es: true, que: true, cual: true, cuales: true,
      receta: true, recetas: true, completa: true, completo: true,
      paso: true, pasos: true, hacer: true, como: true, preparar: true,
      coccion: true, cocción: true, cocina: true, comida: true
    };

    return Array.from(new Set(base.split(" ").filter(function (term) {
      return term.length >= 3 && !stop[term];
    })));
  }

  const COUNTRY_IMAGE_META = {
    mexico: {
      code: "mx",
      name: "mexico",
      aliases: ["mexico", "mexicana", "mexicano", "mexicanas", "mexicanos"]
    },
    colombia: {
      code: "co",
      name: "colombia",
      aliases: ["colombia", "colombiana", "colombiano", "colombianas", "colombianos"]
    },
    peru: {
      code: "pe",
      name: "peru",
      aliases: ["peru", "peruana", "peruano", "peruanas", "peruanos"]
    },
    argentina: {
      code: "ar",
      name: "argentina",
      aliases: ["argentina", "argentina", "argentino", "argentinas", "argentinos"]
    },
    espana: {
      code: "es",
      name: "espana",
      aliases: ["espana", "españa", "espanola", "española", "espanol", "español"]
    },
    republica_dominicana: {
      code: "do",
      name: "republica dominicana",
      aliases: ["republica dominicana", "rep dominicana", "dominicana", "dominicano", "dominicanas", "dominicanos"]
    }
  };

  function normalizeTopicText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function detectCountryImageMeta(text) {
    const normalized = normalizeTopicText(text);
    if (!normalized) return null;

    const all = Object.keys(COUNTRY_IMAGE_META).map(function (key) {
      return COUNTRY_IMAGE_META[key];
    });

    for (const meta of all) {
      const found = meta.aliases.some(function (alias) {
        const term = normalizeTopicText(alias);
        return term && normalized.includes(term);
      });
      if (found) return meta;
    }

    return null;
  }

  function isGastronomyFocused(text) {
    return /gastronomi|comida|cocina|plato|platos|receta|recetas|postre|alimento/i.test(String(text || ""));
  }

  function isCustomDocumentQuery(text) {
    const q = String(text || "").toLowerCase();
    if (!q) return false;
    return /documento|documentos|plantilla|formato|contrato|demanda|escrito|acta/.test(q)
      && /custom|customizado|customisado|personalizado|personalizados|a medida|adaptado/.test(q);
  }

  function isBiographyImagePrompt(text) {
    const q = String(text || "").toLowerCase().trim();
    if (!q) return false;
    return /biografia|biografía|vida de|perfil de|quien es|quién es|quien fue|quién fue/.test(q);
  }

  function extractBiographySubject(text) {
    const raw = String(text || "").trim();
    if (!raw) return "";

    const patterns = [
      /(?:biografia|biografía|historia|vida|perfil)\s+(?:de|del|sobre)\s+(.+)/i,
      /(?:quien es|quién es|quien fue|quién fue)\s+(.+)/i
    ];

    for (const pattern of patterns) {
      const match = raw.match(pattern);
      if (!match || !match[1]) continue;
      const subject = String(match[1] || "")
        .replace(/[?!.]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (subject) return subject;
    }

    return "";
  }

  function buildBiographySchemaResponse(subject) {
    const cleanSubject = String(subject || "").trim() || "la persona consultada";
    return "Puedo darte una biografia directa de " + cleanSubject + " en orden cronologico, enfocada en hechos verificables y sin formato de plantilla. Si quieres, te la presento por etapas: origen, carrera, hechos clave y legado.";
  }

  function buildBiographyStructuredPrompt(userText, subject) {
    const cleanSubject = String(subject || "").trim() || "la persona consultada";
    const cleanUserText = String(userText || "").trim();
    return [
      "Redacta una biografia en espanol de " + cleanSubject + " con este esquema EXACTO:",
      "",
      "1) Parrafo de apertura con identificacion de la persona y contexto temporal.",
      "2) Titulo: Origenes y Formacion Academica.",
      "   - Familia: datos verificables.",
      "   - Estudios: formacion y especializaciones verificables.",
      "3) Titulo: Carrera Profesional.",
      "4) Titulo: Trayectoria Publica.",
      "   - Inicios.",
      "   - Ascenso.",
      "   - Hitos principales.",
      "5) Titulo: Legado e Impacto.",
      "",
      "Reglas:",
      "- Narrar la vida de forma cronologica.",
      "- Oraciones claras y continuas, centradas en hechos del sujeto.",
      "- No inventar datos; si falta certeza, indicarlo con cautela.",
      "- Evitar explicaciones meta sobre como responder.",
      "",
      "Consulta original del usuario: " + cleanUserText
    ].join("\n");
  }

  function filterImagesBySubjectRelevance(images, contextText) {
    const terms = extractImageSubjectTerms(contextText);
    if (!terms.length) return [];

    const genericTerms = {
      historia: true,
      pais: true,
      paises: true,
      cultura: true,
      tradicion: true,
      gastronomia: true,
      gastronomico: true,
      comida: true,
      cocina: true,
      receta: true,
      recetas: true
    };

    const countryMeta = detectCountryImageMeta(contextText);
    const essentialTerms = terms.filter(function (term) {
      return !genericTerms[term];
    });
    const termsToUse = (essentialTerms.length ? essentialTerms : terms).slice(0, 5);
    const minMatches = termsToUse.length >= 2 ? 2 : 1;

    return images
      .map(function (entry) {
        const title = String(entry && entry.title || "");
        let sourcePath = "";
        try {
          const parsed = new URL(String(entry && entry.source || ""));
          sourcePath = decodeURIComponent(String(parsed.pathname || "")).replace(/[_-]+/g, " ");
        } catch (_err) {
          sourcePath = String(entry && entry.source || "");
        }

        const haystack = (title + " " + sourcePath)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (countryMeta) {
          const countryHit = countryMeta.aliases.some(function (alias) {
            return haystack.includes(normalizeTopicText(alias));
          });
          if (!countryHit) {
            return { entry: entry, score: 0 };
          }
        }

        const score = termsToUse.reduce(function (acc, term) {
          return acc + (haystack.includes(term) ? 1 : 0);
        }, 0);

        return { entry: entry, score: score };
      })
      .filter(function (item) { return item.score >= minMatches; })
      .sort(function (a, b) { return b.score - a.score; })
      .map(function (item) { return item.entry; });
  }

  function normalizeAssistantImages(imageInput, contextText) {
    const candidates = Array.isArray(imageInput)
      ? imageInput
      : (imageInput && typeof imageInput === "object" ? [imageInput] : []);

    const normalized = candidates
      .map(function (entry) {
        if (!entry || typeof entry !== "object") return null;
        const url = String(entry.url || entry.thumbnail || "").trim();
        if (!/^https?:\/\//i.test(url)) return null;
        const source = String(entry.source || url).trim();
        const title = String(entry.title || "Imagen relacionada").trim();
        const thumbnail = String(entry.thumbnail || "").trim();
        const fallbacks = [];

        if (/^https?:\/\//i.test(thumbnail) && thumbnail !== url) {
          fallbacks.push(thumbnail);
        }

        if (/source\.unsplash\.com/i.test(url) || /source\.unsplash\.com/i.test(thumbnail)) {
          const seed = encodeURIComponent((title || source || "imagen").slice(0, 80));
          fallbacks.push("https://picsum.photos/seed/" + seed + "/1280/720");
        }

        // Fallback final para que nunca quede la imagen rota en pantalla.
        fallbacks.push("assets/logo-ia-juris.png?v=20260614c");

        return { url: url, source: source, title: title, fallbacks: fallbacks };
      })
      .filter(Boolean);

    const filtered = contextText
      ? filterImagesBySubjectRelevance(normalized, contextText)
      : normalized;

    return filtered.slice(0, 2);
  }

  function renderAssistantImageCard(image) {
    if (!image || typeof image !== "object") return null;

    const primaryUrl = String(image.url || image.thumbnail || "").trim();
    if (!/^https?:\/\//i.test(primaryUrl)) return null;

    const linkUrl = String(image.source || primaryUrl).trim();
    const title = String(image.title || "Imagen relacionada").trim();

    const card = document.createElement("a");
    card.className = "message-image-card";
    card.href = linkUrl;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.className = "message-image-thumb";
    img.loading = "lazy";
    img.src = primaryUrl;
    img.alt = title;
    img.referrerPolicy = "no-referrer";

    const fallbackQueue = Array.isArray(image.fallbacks)
      ? image.fallbacks
          .map(function (value) { return String(value || "").trim(); })
          .filter(function (value) { return /^https?:\/\//i.test(value) || /^assets\//i.test(value); })
          .filter(function (value) { return value !== primaryUrl; })
      : [];

    img.onerror = function () {
      if (!fallbackQueue.length) {
        img.onerror = null;
        img.src = "assets/logo-ia-juris.png?v=20260614c";
        return;
      }

      const next = fallbackQueue.shift();
      img.src = next;
    };

    card.appendChild(img);

    const caption = document.createElement("div");
    caption.className = "message-image-caption";
    caption.textContent = title;
    card.appendChild(caption);

    return card;
  }

  function renderAssistantImageBlock(imageInput) {
    const images = normalizeAssistantImages(imageInput);
    if (!images.length) return null;

    const wrapper = document.createElement("div");
    wrapper.className = "message-image-block" + (images.length > 1 ? " has-two" : "");

    images.forEach(function (entry) {
      const card = renderAssistantImageCard(entry);
      if (card) {
        wrapper.appendChild(card);
      }
    });

    return wrapper.childElementCount ? wrapper : null;
  }

  function canTryApiNow() {
    const host = String(window.location.hostname || "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") {
      return true;
    }
    return Date.now() >= apiBackoffUntil;
  }

  function markApiFailure() {
    apiBackoffUntil = Date.now() + API_RETRY_COOLDOWN_MS;
  }

  function markApiSuccess() {
    apiBackoffUntil = 0;
  }

  function addMessage(text, isUser, options) {
    const meta = options && typeof options === "object" ? options : {};
    const isStaticWelcome = !!meta.isStaticWelcome;
    const sourceList = Array.isArray(meta.sources) ? meta.sources : [];
    const relatedPrompt = String(meta.relatedQuery || text || "");
    const blockImage = !isUser && isCustomDocumentQuery(relatedPrompt);
    const allowBiographyImages = !isUser && isBiographyImagePrompt(relatedPrompt);
    let imageList = !isUser ? normalizeAssistantImages(meta.image, relatedPrompt) : [];
    if (!isUser && !isStaticWelcome && !blockImage && allowBiographyImages && !imageList.length) {
      imageList = normalizeAssistantImages(buildSubjectFallbackImages(String(meta.relatedQuery || text || "")), String(meta.relatedQuery || text || ""));
    }
    if (!isUser && !isStaticWelcome && !blockImage && allowBiographyImages && !imageList.length) {
      imageList = normalizeAssistantImages(buildSubjectFallbackImages(String(meta.relatedQuery || text || "")), "");
    }
    if (blockImage || isStaticWelcome || !allowBiographyImages) {
      imageList = [];
    }
    const row = document.createElement("div");
    row.className = "message-row " + (isUser ? "user" : "bot");
    if (isStaticWelcome) {
      row.setAttribute("data-static-welcome", "true");
    }

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");

    const avatarImg = document.createElement("img");
    avatarImg.src = isUser
      ? getUserAvatarSrc()
      : "assets/logo-ia-juris.png?v=20260614c";
    avatarImg.alt = "";
    avatar.appendChild(avatarImg);

    const bubble = document.createElement("div");
    bubble.className = "message-bubble " + (isUser ? "user" : "bot");
    bubble.dataset.messageText = String(text || "");
    if (!isUser && sourceList.length) {
      bubble.dataset.sourcesJson = JSON.stringify(sourceList);
    }
    if (!isUser && imageList.length) {
      bubble.dataset.imageJson = JSON.stringify(imageList);
    }

    const paragraph = document.createElement("div");
    if (isUser) {
      const p = document.createElement("p");
      p.textContent = String(text || "");
      paragraph.appendChild(p);
    } else {
      paragraph.innerHTML = formatBotResponse(text);
    }
    if (!isUser) {
      const imageBlock = renderAssistantImageBlock(imageList);
      if (imageBlock) {
        bubble.appendChild(imageBlock);
      }
    }

    bubble.appendChild(paragraph);

    if (!isUser && !isStaticWelcome) {
      const chips = renderSourceChips(sourceList, String(meta.relatedQuery || text || ""));
      if (chips) {
        bubble.appendChild(chips);
      }
    }

    let metaLine = null;
    if (isStaticWelcome) {
      metaLine = document.createElement("div");
      metaLine.className = "message-meta-line bot static-welcome";
      const metaTag = document.createElement("span");
      metaTag.className = "message-static-meta";
      metaTag.textContent = WELCOME_COPYRIGHT_META;
      metaLine.appendChild(metaTag);
    } else {
      const timeTag = document.createElement("span");
      timeTag.className = "message-time";
      timeTag.textContent = formatMessageTime12h(new Date());

      metaLine = document.createElement("div");
      metaLine.className = "message-meta-line " + (isUser ? "user" : "bot");
      metaLine.appendChild(timeTag);

      if (isUser) {
        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "message-edit-btn";
        editBtn.innerHTML = '<svg class="message-edit-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 20l4.8-1 9.7-9.7a1.7 1.7 0 0 0 0-2.4l-1.4-1.4a1.7 1.7 0 0 0-2.4 0L5 15.2 4 20zM13 7l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        editBtn.setAttribute("aria-label", "Editar mensaje");
        metaLine.appendChild(editBtn);
      }

      if (!isUser) {
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "message-copy-btn";
        copyBtn.innerHTML = '<svg class="message-copy-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 9h10v11H9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 5h10v2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 5v11h2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
        copyBtn.setAttribute("aria-label", "Copiar respuesta del asistente");
        copyBtn.setAttribute("title", "Copiar respuesta");
        copyBtn.setAttribute("data-copy-text", String(text || ""));
        metaLine.appendChild(copyBtn);

        const moreWrap = document.createElement("div");
        moreWrap.className = "message-more-wrap";

        const moreBtn = document.createElement("button");
        moreBtn.type = "button";
        moreBtn.className = "message-more-btn";
        moreBtn.setAttribute("aria-label", "Mas opciones");
        moreBtn.setAttribute("aria-expanded", "false");
        moreBtn.setAttribute("title", "Mas opciones");
        moreBtn.innerHTML = '<svg class="message-more-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/></svg>';

        const moreMenu = document.createElement("div");
        moreMenu.className = "message-more-menu";
        moreMenu.setAttribute("role", "menu");
        moreMenu.setAttribute("aria-label", "Acciones de mensaje");

        const menuVoiceBtn = document.createElement("button");
        menuVoiceBtn.type = "button";
        menuVoiceBtn.className = "message-more-action message-more-action-voice";
        menuVoiceBtn.setAttribute("role", "menuitem");
        menuVoiceBtn.setAttribute("data-voice-text", String(text || ""));
        menuVoiceBtn.setAttribute("aria-label", "Escuchar respuesta");
        menuVoiceBtn.setAttribute("title", "Escuchar respuesta");
        menuVoiceBtn.innerHTML = '<svg class="message-more-action-icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 10v4h4l5 4V6L8 10H4z" fill="currentColor"/><path d="M16 9.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.5 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

        moreMenu.appendChild(menuVoiceBtn);
        moreWrap.appendChild(moreBtn);
        moreWrap.appendChild(moreMenu);
        metaLine.appendChild(moreWrap);
      }
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    if (metaLine) {
      row.appendChild(metaLine);
    }
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    updateConversationStartLayout();
    upsertActiveConversation();
  }

  function showAssistantTypingIndicator() {
    if (!chatMessages) return null;

    const row = document.createElement("div");
    row.className = "message-row bot message-row-typing";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.setAttribute("aria-hidden", "true");

    const avatarImg = document.createElement("img");
    avatarImg.src = "assets/logo-ia-juris.png?v=20260614c";
    avatarImg.alt = "";
    avatar.appendChild(avatarImg);

    const bubble = document.createElement("div");
    bubble.className = "message-bubble bot message-bubble-typing";
    bubble.setAttribute("aria-label", "El asistente esta escribiendo");

    const dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.innerHTML = '<span></span><span></span><span></span>';
    dots.setAttribute("aria-hidden", "true");

    bubble.appendChild(dots);

    row.appendChild(avatar);
    row.appendChild(bubble);
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return row;
  }

  function hideAssistantTypingIndicator(row) {
    if (!row || !chatMessages) return;
    if (row.typingProgressTimer) {
      window.clearInterval(row.typingProgressTimer);
      row.typingProgressTimer = null;
    }
    if (row.parentNode === chatMessages) {
      chatMessages.removeChild(row);
    }
  }

  function enterBubbleEditMode(userBubble) {
    if (userBubble.classList.contains("editing")) return;
    userBubble.classList.add("editing");
    const originalText = userBubble.dataset.messageText || userBubble.querySelector("p") && userBubble.querySelector("p").textContent || "";
    userBubble.dataset.messageText = originalText;
    userBubble.innerHTML = "";
    const ta = document.createElement("textarea");
    ta.className = "message-edit-textarea";
    ta.value = originalText;
    ta.rows = Math.max(2, originalText.split("\n").length);
    const sendRow = document.createElement("div");
    sendRow.className = "message-edit-actions";
    const sendBtn2 = document.createElement("button");
    sendBtn2.type = "button";
    sendBtn2.className = "message-edit-send-btn";
    sendBtn2.textContent = "Enviar";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "message-edit-cancel-btn";
    cancelBtn.textContent = "Cancelar";
    sendRow.appendChild(cancelBtn);
    sendRow.appendChild(sendBtn2);
    userBubble.appendChild(ta);
    userBubble.appendChild(sendRow);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
  }

  function exitBubbleEditMode(userBubble, newText) {
    userBubble.classList.remove("editing");
    userBubble.dataset.messageText = newText;
    userBubble.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = newText;
    userBubble.appendChild(p);
  }

  function findFirstAssistantRowAfterUser(userRow) {
    if (!userRow || !chatMessages) return null;
    let next = userRow.nextElementSibling;
    while (next && !(next.classList.contains("message-row") && next.classList.contains("user"))) {
      if (next.classList.contains("message-row") && next.classList.contains("bot") && !next.classList.contains("message-row-typing")) {
        return next;
      }
      next = next.nextElementSibling;
    }
    return null;
  }

  function removeAssistantRepliesAfterUserRow(userRow, options) {
    const keepRow = options && options.keepRow ? options.keepRow : null;
    if (!userRow || !chatMessages) return;
    let next = userRow.nextElementSibling;
    while (next && !(next.classList.contains("message-row") && next.classList.contains("user"))) {
      const candidate = next;
      next = next.nextElementSibling;
      if ((candidate.classList.contains("message-row") && candidate.classList.contains("bot")) || candidate.classList.contains("message-row-typing")) {
        if (keepRow && candidate === keepRow) {
          continue;
        }
        if (candidate.parentNode === chatMessages) {
          chatMessages.removeChild(candidate);
        }
      }
    }
  }

  function setAssistantRowTypingState(botRow) {
    if (!botRow) return;
    const bubble = botRow.querySelector(".message-bubble.bot");
    if (!bubble) return;

    botRow.classList.remove("message-row-typing");
    bubble.className = "message-bubble bot message-bubble-typing";
    bubble.setAttribute("aria-label", "El asistente esta escribiendo");
    bubble.dataset.messageText = "";
    delete bubble.dataset.sourcesJson;
    delete bubble.dataset.imageJson;
    bubble.innerHTML = "";

    const dots = document.createElement("div");
    dots.className = "typing-dots";
    dots.setAttribute("aria-hidden", "true");
    dots.innerHTML = "<span></span><span></span><span></span>";
    bubble.appendChild(dots);

    const copyBtn = botRow.querySelector(".message-copy-btn");
    if (copyBtn) {
      copyBtn.setAttribute("data-copy-text", "");
    }

    const voiceBtn = botRow.querySelector(".message-more-action-voice");
    if (voiceBtn) {
      voiceBtn.setAttribute("data-voice-text", "");
    }
  }

  function updateAssistantRowContent(botRow, text, sources, image, relatedQuery) {
    if (!botRow) return;
    const bubble = botRow.querySelector(".message-bubble.bot");
    if (!bubble) return;

    botRow.classList.remove("message-row-typing");
    bubble.className = "message-bubble bot";
    bubble.removeAttribute("aria-label");

    const cleanText = String(text || "");
    const cleanSources = Array.isArray(sources) ? sources : [];
    const promptContext = String(relatedQuery || text || "");
    const blockImage = isCustomDocumentQuery(promptContext);
    const allowBiographyImages = isBiographyImagePrompt(promptContext);
    let cleanImages = normalizeAssistantImages(image, promptContext);
    if (!cleanImages.length && !blockImage && allowBiographyImages) {
      cleanImages = normalizeAssistantImages(buildSubjectFallbackImages(String(relatedQuery || text || "")), String(relatedQuery || text || ""));
    }
    if (!cleanImages.length && !blockImage && allowBiographyImages) {
      cleanImages = normalizeAssistantImages(buildSubjectFallbackImages(String(relatedQuery || text || "")), "");
    }
    if (blockImage || !allowBiographyImages) {
      cleanImages = [];
    }

    bubble.dataset.messageText = cleanText;
    if (cleanSources.length) {
      bubble.dataset.sourcesJson = JSON.stringify(cleanSources);
    } else {
      delete bubble.dataset.sourcesJson;
    }

    if (cleanImages.length) {
      bubble.dataset.imageJson = JSON.stringify(cleanImages);
    } else {
      delete bubble.dataset.imageJson;
    }

    bubble.innerHTML = "";
    const imageBlock = renderAssistantImageBlock(cleanImages);
    if (imageBlock) {
      bubble.appendChild(imageBlock);
    }

    const paragraph = document.createElement("div");
    paragraph.innerHTML = formatBotResponse(cleanText);
    bubble.appendChild(paragraph);

    const chips = renderSourceChips(cleanSources, cleanText);
    if (chips) {
      bubble.appendChild(chips);
    }

    const copyBtn = botRow.querySelector(".message-copy-btn");
    if (copyBtn) {
      copyBtn.setAttribute("data-copy-text", cleanText);
    }

    const voiceBtn = botRow.querySelector(".message-more-action-voice");
    if (voiceBtn) {
      voiceBtn.setAttribute("data-voice-text", cleanText);
    }

    const timeTag = botRow.querySelector(".message-meta-line.bot .message-time");
    if (timeTag) {
      timeTag.textContent = formatMessageTime12h(new Date());
    }
  }

  function placeRowAfter(rowToMove, anchorRow) {
    if (!rowToMove || !anchorRow || !chatMessages) return;
    const after = anchorRow.nextElementSibling;
    if (after) {
      chatMessages.insertBefore(rowToMove, after);
    } else {
      chatMessages.appendChild(rowToMove);
    }
  }

  function ensureEditableAssistantRow(userRow) {
    if (!userRow || !chatMessages) return null;

    let target = findFirstAssistantRowAfterUser(userRow);
    if (target) {
      removeAssistantRepliesAfterUserRow(userRow, { keepRow: target });
      placeRowAfter(target, userRow);
      return target;
    }

    // Si no existe respuesta previa para esta pregunta, crea una unica fila bot reutilizable.
    addMessage("Preparando respuesta...", false);
    target = chatMessages.lastElementChild;
    if (target && target.classList && target.classList.contains("message-row") && target.classList.contains("bot")) {
      placeRowAfter(target, userRow);
      removeAssistantRepliesAfterUserRow(userRow, { keepRow: target });
      return target;
    }
    return null;
  }

  async function resendEditedUserBubble(userBubble, newText) {
    const userRow = userBubble ? userBubble.closest(".message-row.user") : null;
    if (!userRow || !chatMessages) return;
    if (userRow.dataset.editSubmitting === "1") return;
    userRow.dataset.editSubmitting = "1";

    const reusableAssistantRow = ensureEditableAssistantRow(userRow);
    chatInput.disabled = true;
    sendBtn.disabled = true;
    voiceBtn.disabled = true;

    if (reusableAssistantRow) {
      setAssistantRowTypingState(reusableAssistantRow);
      placeRowAfter(reusableAssistantRow, userRow);
    }

    try {
      const answer = await requestAssistant(newText);
      const hasInitialSources = Array.isArray(answer && answer.sources) && answer.sources.length > 0;
      const hasInitialImage = !!(answer && answer.image && ((Array.isArray(answer.image) && answer.image.length) || (!Array.isArray(answer.image) && typeof answer.image === "object")));
      const answerQualityMode = String(answer && answer.qualityMode || "");
      const answerDetailRaw = String(answer && answer.detail || "");
      const answerNoEnrich = !!(answer && answer.noEnrich);
      const hasNoFallbackMode = /no-fallback/i.test(answerQualityMode);
      const allowEnrichOnEmptyNoFallback =
        hasNoFallbackMode
        && !hasInitialSources
        && !String(answer && answer.text || "").trim();
      const shouldSkipClientEnrich =
        (answerNoEnrich && !allowEnrichOnEmptyNoFallback) ||
        (hasNoFallbackMode && !allowEnrichOnEmptyNoFallback) ||
        (isApiTimeoutLikeAnswer(answer && answer.text, answerDetailRaw, answerQualityMode) && !allowEnrichOnEmptyNoFallback) ||
        (hasInitialSources && hasInitialImage);

      const normalized = shouldSkipClientEnrich
        ? answer
        : await ensureInternetSources(answer, newText);
      const answerText = normalized && typeof normalized === "object" ? normalized.text : normalized;
      const answerSources = normalized && typeof normalized === "object" ? normalized.sources : [];
      const answerImage = normalized && typeof normalized === "object" ? normalized.image : null;
      const answerDetail = (normalized && typeof normalized === "object" && normalized.detail)
        ? String(normalized.detail)
        : answerDetailRaw;
      const safeAnswerText = getSafeAssistantText(answerText, answerDetail, newText);

      const targetAssistantRow = reusableAssistantRow || ensureEditableAssistantRow(userRow);
      if (targetAssistantRow) {
        updateAssistantRowContent(targetAssistantRow, safeAnswerText, answerSources, answerImage, newText);
        removeAssistantRepliesAfterUserRow(userRow, { keepRow: targetAssistantRow });
        placeRowAfter(targetAssistantRow, userRow);
      }
      speakAsMaria(safeAnswerText);
    } catch (error) {
      const detail = error && error.message ? error.message : "sin detalle";
      const targetAssistantRow = reusableAssistantRow || ensureEditableAssistantRow(userRow);
      if (targetAssistantRow) {
        const safeAnswerText = getSafeAssistantText("", detail, newText);
        updateAssistantRowContent(targetAssistantRow, safeAnswerText, [], null, newText);
        removeAssistantRepliesAfterUserRow(userRow, { keepRow: targetAssistantRow });
        placeRowAfter(targetAssistantRow, userRow);
      }
    } finally {
      userRow.dataset.editSubmitting = "0";
      chatInput.disabled = false;
      sendBtn.disabled = false;
      voiceBtn.disabled = false;
      upsertActiveConversation();
      chatInput.focus();
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  if (chatMessages) {
    chatMessages.addEventListener("click", function (event) {
      const openMenus = chatMessages.querySelectorAll(".message-more-wrap.is-open");
      const clickedInsideMenu = event.target.closest(".message-more-wrap");
      if (!clickedInsideMenu && openMenus.length) {
        openMenus.forEach(function (wrap) {
          wrap.classList.remove("is-open");
          const trigger = wrap.querySelector(".message-more-btn");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
        });
      }

      const moreTrigger = event.target.closest(".message-more-btn");
      if (moreTrigger) {
        const wrap = moreTrigger.closest(".message-more-wrap");
        if (!wrap) return;
        const shouldOpen = !wrap.classList.contains("is-open");
        chatMessages.querySelectorAll(".message-more-wrap.is-open").forEach(function (item) {
          item.classList.remove("is-open");
          const trigger = item.querySelector(".message-more-btn");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
        });
        if (shouldOpen) {
          wrap.classList.add("is-open");
          moreTrigger.setAttribute("aria-expanded", "true");
        } else {
          wrap.classList.remove("is-open");
          moreTrigger.setAttribute("aria-expanded", "false");
        }
        return;
      }

      const moreVoiceBtn = event.target.closest(".message-more-action-voice");
      if (moreVoiceBtn) {
        const wrap = moreVoiceBtn.closest(".message-more-wrap");
        if (wrap) {
          wrap.classList.remove("is-open");
          const trigger = wrap.querySelector(".message-more-btn");
          if (trigger) trigger.setAttribute("aria-expanded", "false");
        }

        const voiceText = String(moreVoiceBtn.getAttribute("data-voice-text") || "").trim();
        if (voiceText) {
          const previousVoiceState = isVoiceModalOpen;
          isVoiceModalOpen = true;
          speakAsMaria(voiceText);
          isVoiceModalOpen = previousVoiceState;
        }
        return;
      }

      // Copiar respuesta del bot
      const copyBtn = event.target.closest(".message-copy-btn");
      if (copyBtn) {
        const source = copyBtn.getAttribute("data-copy-text") || "";
        copyTextToClipboard(source).then(function (ok) {
          if (!ok) return;
          copyBtn.classList.add("is-copied");
          copyBtn.setAttribute("aria-label", "Respuesta copiada");
          copyBtn.setAttribute("title", "Copiado");
          setTimeout(function () {
            copyBtn.classList.remove("is-copied");
            copyBtn.setAttribute("aria-label", "Copiar respuesta del asistente");
            copyBtn.setAttribute("title", "Copiar respuesta");
          }, 1100);
        });
        return;
      }

      // Activar modo edición en burbuja
      const editBtn = event.target.closest(".message-edit-btn");
      if (editBtn) {
        const row = editBtn.closest(".message-row.user");
        const userBubble = row && row.querySelector(".message-bubble.user");
        if (userBubble) enterBubbleEditMode(userBubble);
        return;
      }

      // Cancelar edición
      const cancelBtn = event.target.closest(".message-edit-cancel-btn");
      if (cancelBtn) {
        const userBubble = cancelBtn.closest(".message-bubble.user");
        if (userBubble) {
          const original = userBubble.dataset.messageText || "";
          exitBubbleEditMode(userBubble, original);
        }
        return;
      }

      // Confirmar edición y reenviar
      const sendEditBtn = event.target.closest(".message-edit-send-btn");
      if (sendEditBtn) {
        const userBubble = sendEditBtn.closest(".message-bubble.user");
        if (!userBubble) return;
        const userRow = userBubble.closest(".message-row.user");
        if (userRow && userRow.dataset.editSubmitting === "1") return;
        const ta = userBubble.querySelector(".message-edit-textarea");
        const newText = ta ? ta.value.trim() : "";
        if (!newText) return;
        sendEditBtn.disabled = true;
        exitBubbleEditMode(userBubble, newText);
        resendEditedUserBubble(userBubble, newText);
        return;
      }
    });
  }

  if (conversationTabs) {
    conversationTabs.addEventListener("click", function (event) {
      const cancelDeleteBtn = event.target.closest(".chat-tab-delete-cancel");
      if (cancelDeleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        closeDeleteModals();
        return;
      }

      const confirmDeleteBtn = event.target.closest(".chat-tab-delete-confirm");
      if (confirmDeleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        const confirmId = confirmDeleteBtn.getAttribute("data-conversation-id");
        closeDeleteModals();
        if (confirmId) deleteConversation(confirmId);
        return;
      }

      const deleteBtn = event.target.closest(".chat-tab-menu-delete");
      if (deleteBtn) {
        event.preventDefault();
        event.stopPropagation();
        const deleteId = deleteBtn.getAttribute("data-conversation-id");
        closeConversationMenus();
        if (deleteId) openDeleteModal(deleteId);
        return;
      }

      const menuTrigger = event.target.closest(".chat-tab-menu-trigger");
      if (menuTrigger) {
        event.preventDefault();
        event.stopPropagation();
        const row = menuTrigger.closest(".chat-tab-row");
        const willOpen = row && !row.classList.contains("menu-open");
        closeDeleteModals();
        closeConversationMenus();
        if (row && willOpen) {
          row.classList.add("menu-open");
          menuTrigger.setAttribute("aria-expanded", "true");
        }
        return;
      }

      const tabBtn = event.target.closest(".chat-tab-item");
      if (!tabBtn) return;
      const convId = tabBtn.getAttribute("data-conversation-id");
      if (!convId) return;
      closeDeleteModals();
      closeConversationMenus();
      hydrateConversation(convId);
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".chat-tab-row")) {
        closeDeleteModals();
        closeConversationMenus();
      }
    });
  }

  if (newConversationBtn) {
    newConversationBtn.addEventListener("click", function () {
      startNewConversation();
    });
  }

  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener("click", function () {
      closeAuthModal();
    });
  }

  if (authSwitchBtn) {
    authSwitchBtn.addEventListener("click", function () {
      setAuthMode(authMode === "register" ? "login" : "register");
      if (authMode === "register" && authNameInput) {
        authNameInput.focus();
      } else if (authEmailInput) {
        authEmailInput.focus();
      }
    });
  }

  if (authWelcomeLoginBtn) {
    authWelcomeLoginBtn.addEventListener("click", function () {
      setAuthMode("login");
      setAuthModalStep("form");
      if (authEmailInput) authEmailInput.focus();
    });
  }

  if (authWelcomeRegisterBtn) {
    authWelcomeRegisterBtn.addEventListener("click", function () {
      setAuthMode("register");
      setAuthModalStep("form");
      if (authNameInput) authNameInput.focus();
    });
  }

  if (authWelcomeGuestBtn) {
    authWelcomeGuestBtn.addEventListener("click", function () {
      closeAuthModal();
      activateTemporaryGuestChat();
    });
  }

  if (toggleAuthPasswordBtn && authPasswordInput) {
    toggleAuthPasswordBtn.addEventListener("click", function () {
      const shouldShow = authPasswordInput.type === "password";
      setPasswordVisibility(authPasswordInput, toggleAuthPasswordBtn, shouldShow);
    });
  }

  if (toggleAuthConfirmPasswordBtn && authConfirmPasswordInput) {
    toggleAuthConfirmPasswordBtn.addEventListener("click", function () {
      const shouldShow = authConfirmPasswordInput.type === "password";
      setPasswordVisibility(authConfirmPasswordInput, toggleAuthConfirmPasswordBtn, shouldShow);
    });
  }

  if (authModal) {
    authModal.addEventListener("click", function (event) {
      if (event.target === authModal) closeAuthModal();
    });
  }

  if (openPhotoSourceModalBtn) {
    openPhotoSourceModalBtn.addEventListener("click", function () {
      openPhotoSourceModal("auth");
    });
  }

  if (closePhotoSourceModalBtn) {
    closePhotoSourceModalBtn.addEventListener("click", function () {
      closePhotoSourceModal();
    });
  }

  if (choosePhotoCameraBtn) {
    choosePhotoCameraBtn.addEventListener("click", function () {
      closePhotoSourceModal();
      if (DEVICE.isAndroid && authPhotoCameraInput) {
        authPhotoCameraInput.click();
        return;
      }
      openCameraCaptureModal();
    });
  }

  if (choosePhotoDeviceBtn) {
    choosePhotoDeviceBtn.addEventListener("click", function () {
      closePhotoSourceModal();
      if (authPhotoDeviceInput) authPhotoDeviceInput.click();
    });
  }

  if (photoSourceModal) {
    photoSourceModal.addEventListener("click", function (event) {
      if (event.target === photoSourceModal) closePhotoSourceModal();
    });
  }

  if (closeCameraCaptureModalBtn) {
    closeCameraCaptureModalBtn.addEventListener("click", function () {
      closeCameraCaptureModal();
    });
  }

  if (cameraCaptureModal) {
    cameraCaptureModal.addEventListener("click", function (event) {
      if (event.target === cameraCaptureModal) closeCameraCaptureModal();
    });
  }

  if (takeCameraPhotoBtn) {
    takeCameraPhotoBtn.addEventListener("click", function () {
      if (!cameraCaptureVideo || !cameraCaptureCanvas) return;
      const width = cameraCaptureVideo.videoWidth || 640;
      const height = cameraCaptureVideo.videoHeight || 480;
      cameraCaptureCanvas.width = width;
      cameraCaptureCanvas.height = height;
      const ctx = cameraCaptureCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(cameraCaptureVideo, 0, 0, width, height);
      cameraCapturedPhotoData = cameraCaptureCanvas.toDataURL("image/jpeg", 0.92);

      cameraCaptureVideo.style.display = "none";
      cameraCaptureCanvas.style.display = "block";
      if (takeCameraPhotoBtn) takeCameraPhotoBtn.disabled = true;
      if (retakeCameraPhotoBtn) retakeCameraPhotoBtn.disabled = false;
      if (useCameraPhotoBtn) useCameraPhotoBtn.disabled = false;
      if (cameraCaptureStatus) cameraCaptureStatus.textContent = "Foto capturada. Puedes usarla o repetirla.";
    });
  }

  if (retakeCameraPhotoBtn) {
    retakeCameraPhotoBtn.addEventListener("click", function () {
      cameraCapturedPhotoData = "";
      if (cameraCaptureCanvas) cameraCaptureCanvas.style.display = "none";
      if (cameraCaptureVideo) cameraCaptureVideo.style.display = "block";
      if (takeCameraPhotoBtn) takeCameraPhotoBtn.disabled = false;
      if (retakeCameraPhotoBtn) retakeCameraPhotoBtn.disabled = true;
      if (useCameraPhotoBtn) useCameraPhotoBtn.disabled = true;
      if (cameraCaptureStatus) cameraCaptureStatus.textContent = "Cámara lista. Toma tu foto.";
    });
  }

  if (useCameraPhotoBtn) {
    useCameraPhotoBtn.addEventListener("click", function () {
      if (!cameraCapturedPhotoData) return;
      if (photoPickerContext === "profile") {
        applyProfilePhotoData(cameraCapturedPhotoData);
      } else {
        updateAuthPhotoPreview(cameraCapturedPhotoData);
        setAuthStatus("Foto de perfil capturada con cámara.", "ok");
      }
      closeCameraCaptureModal();
    });
  }

  if (authPhotoDeviceInput) {
    authPhotoDeviceInput.addEventListener("change", function (event) {
      const file = event.target && event.target.files && event.target.files[0];
      processProfilePhotoFile(file);
      event.target.value = "";
    });
  }

  if (authPhotoCameraInput) {
    authPhotoCameraInput.addEventListener("change", function (event) {
      const file = event.target && event.target.files && event.target.files[0];
      processProfilePhotoFile(file);
      event.target.value = "";
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const fullName = String(authNameInput && authNameInput.value || "").trim();
      const email = String(authEmailInput && authEmailInput.value || "").trim();
      const password = String(authPasswordInput && authPasswordInput.value || "");
      const confirmPassword = String(authConfirmPasswordInput && authConfirmPasswordInput.value || "");

      if (!validateEmail(email)) {
        setAuthStatus("Escribe un correo electrónico válido.", "error");
        return;
      }

      if (password.length < 8) {
        setAuthStatus("La contraseña debe tener al menos 8 caracteres.", "error");
        return;
      }

      try {
        if (authMode === "register") {
          if (!fullName) {
            setAuthStatus("Escribe tu nombre completo.", "error");
            return;
          }

          if (password !== confirmPassword) {
            setAuthStatus("Las contraseñas no coinciden.", "error");
            return;
          }

          const registerResult = await apiRegisterUser({
            fullName: fullName,
            email: email,
            password: password,
            photoDataUrl: authPhotoData || ""
          });

          if (registerResult && registerResult.userToken) {
            localStorage.setItem("iaJurisUserToken", String(registerResult.userToken));
          }

          persistSessionUser(registerResult && registerResult.user ? registerResult.user : {
            fullName: fullName,
            email: email,
            photoUrl: authPhotoData || ""
          });

          setAuthStatus(String((registerResult && registerResult.message) || "Cuenta creada correctamente."), "ok");
          closeAuthModal();
          enterStaticChat("register");
          return;
        }

        const loginResult = await apiLoginUser({
          email: email,
          password: password,
          userToken: String(localStorage.getItem("iaJurisUserToken") || "")
        });

        if (!loginResult || !loginResult.user) {
          throw new Error("No se pudo obtener el perfil de usuario.");
        }

        persistSessionUser(loginResult.user);
        setAuthStatus(String((loginResult && loginResult.message) || "Inicio de sesión correcto."), "ok");
        closeAuthModal();
        enterStaticChat("login");
      } catch (err) {
        const detail = err && err.message ? err.message : "No se pudo completar la operación.";
        setAuthStatus(detail, "error");
      }
    });
  }

  if (openPlansBtn) {
    openPlansBtn.addEventListener("click", function () {
      toggleSidebarActionsMenu();
    });
  }

  if (sidebarPlansMenuItem) {
    sidebarPlansMenuItem.addEventListener("click", function () {
      openPlansModal();
    });
  }

  if (sidebarProfileMenuItem) {
    sidebarProfileMenuItem.addEventListener("click", function () {
      openProfileModal();
    });
  }

  if (sidebarSearchesMenuItem) {
    sidebarSearchesMenuItem.addEventListener("click", function () {
      openSearchesModal();
    });
  }

  if (profileChangePhotoBtn) {
    profileChangePhotoBtn.addEventListener("click", function () {
      closeProfileModal();
      openPhotoSourceModal("profile");
    });
  }

  if (sidebarLogoutMenuItem) {
    sidebarLogoutMenuItem.addEventListener("click", async function () {
      if (!hasRegisteredSession) {
        closeSidebarActionsMenu();
        return;
      }
      await performLogout();
    });
  }

  var sidebarGuestExitMenuItemBtn = document.getElementById("sidebarGuestExitMenuItem");
  if (sidebarGuestExitMenuItemBtn) {
    sidebarGuestExitMenuItemBtn.addEventListener("click", function () {
      returnGuestToWelcome();
    });
  }

  if (closePlansModalBtn) {
    closePlansModalBtn.addEventListener("click", function () {
      closePlansModal();
    });
  }

  if (closeSubscriptionAccessModalBtn) {
    closeSubscriptionAccessModalBtn.addEventListener("click", function () {
      closeSubscriptionAccessModal();
    });
  }

  if (closePlanWelcomeModalBtn) {
    closePlanWelcomeModalBtn.addEventListener("click", function () {
      closePlanWelcomeModal();
    });
  }

  if (planWelcomeConfirmBtn) {
    planWelcomeConfirmBtn.addEventListener("click", function () {
      closePlanWelcomeModal();
    });
  }

  if (backToPlansBtn) {
    backToPlansBtn.addEventListener("click", function () {
      closeSquarePaymentPanel();
      if (plansPaymentStatus) {
        plansPaymentStatus.textContent = "";
        plansPaymentStatus.classList.remove("error", "ok");
      }
    });
  }

  if (squarePayBtn) {
    squarePayBtn.addEventListener("click", function () {
      submitSquareCardPayment();
    });
  }

  if (subscriptionAccessModal) {
    subscriptionAccessModal.addEventListener("click", function (event) {
      if (event.target === subscriptionAccessModal) {
        closeSubscriptionAccessModal();
      }
    });
  }

  if (planWelcomeModal) {
    planWelcomeModal.addEventListener("click", function (event) {
      if (event.target === planWelcomeModal) {
        closePlanWelcomeModal();
      }
    });
  }

  if (subscriptionAccessLoginBtn) {
    subscriptionAccessLoginBtn.addEventListener("click", function () {
      closeSubscriptionAccessModal();
      closePlansModal();
      openAuthModal("login");
    });
  }

  if (subscriptionAccessRegisterBtn) {
    subscriptionAccessRegisterBtn.addEventListener("click", function () {
      closeSubscriptionAccessModal();
      closePlansModal();
      openAuthModal("register");
    });
  }

  if (plansModal) {
    plansModal.addEventListener("click", function (event) {
      if (event.target === plansModal) {
        closePlansModal();
        return;
      }

      const subscribeBtn = event.target.closest(".plan-subscribe-btn");
      if (subscribeBtn) {
        event.preventDefault();
        event.stopPropagation();
        if (subscribeBtn.getAttribute("aria-disabled") === "true") return;
        if (!isRegisteredSessionActive()) {
          openSubscriptionAccessModal();
          return;
        }
        const cardFromBtn = subscribeBtn.closest(".plan-card");
        startSquareCheckoutForCard(cardFromBtn);
        return;
      }

      const card = event.target.closest(".plan-card");
      if (!card) return;

      plansModal.querySelectorAll(".plan-card").forEach(function (item) {
        item.classList.remove("selected");
      });
      card.classList.add("selected");
      updatePlansSummary(card);
      if (squarePaymentPanel && !squarePaymentPanel.hidden) {
        updateSquarePaymentSummary(getSelectedPlanForCheckout());
      }
    });

    plansModal.addEventListener("keydown", function (event) {
      const subscribeBtn = event.target.closest(".plan-subscribe-btn");
      if (!subscribeBtn) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      if (subscribeBtn.getAttribute("aria-disabled") === "true") return;
      if (!isRegisteredSessionActive()) {
        openSubscriptionAccessModal();
        return;
      }
      const cardFromBtn = subscribeBtn.closest(".plan-card");
      startSquareCheckoutForCard(cardFromBtn);
    });

    const initialSelected = plansModal.querySelector(".plan-card.selected") || plansModal.querySelector(".plan-card");
    if (initialSelected) updatePlansSummary(initialSelected);
  }

  if (closeSearchesModalBtn) {
    closeSearchesModalBtn.addEventListener("click", function () {
      closeSearchesModal();
    });
  }

  if (closeProfileModalBtn) {
    closeProfileModalBtn.addEventListener("click", function () {
      closeProfileModal();
    });
  }

  if (searchesInput) {
    searchesInput.addEventListener("input", function () {
      renderSearchesList(searchesInput.value);
    });
  }

  if (searchesModal) {
    searchesModal.addEventListener("click", function (event) {
      if (event.target === searchesModal) {
        closeSearchesModal();
        return;
      }

      const searchBtn = event.target.closest(".searches-item-btn");
      if (!searchBtn) return;
      const text = String(searchBtn.getAttribute("data-search-text") || "").trim();
      if (chatInput && text) {
        chatInput.value = text;
        chatInput.focus();
      }
      closeSearchesModal();
    });
  }

  if (profileModal) {
    profileModal.addEventListener("click", function (event) {
      if (event.target === profileModal) {
        closeProfileModal();
      }
    });
  }

  document.addEventListener("click", function (event) {
    if (!sidebarActionsMenu || !openPlansBtn) return;
    const clickedInsideMenu = sidebarActionsMenu.contains(event.target);
    const clickedTrigger = openPlansBtn.contains(event.target);
    if (!clickedInsideMenu && !clickedTrigger) {
      closeSidebarActionsMenu();
    }

    if (DEVICE.isPhone && chatModalContent && chatModalContent.classList.contains("mobile-sidebar-open")) {
      const insideSidebar = event.target.closest(".chat-sidebar");
      const touchedToggle = toggleSidebarBtn && toggleSidebarBtn.contains(event.target);
      const touchedAccountTab = mobileTabAccountBtn && mobileTabAccountBtn.contains(event.target);
      if (!insideSidebar && !touchedToggle && !touchedAccountTab) {
        setSidebarCollapsed(true);
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSubscriptionAccessModal();
      closeSidebarActionsMenu();
      closeSearchesModal();
      closeProfileModal();
      if (DEVICE.isPhone) setSidebarCollapsed(true);
    }
  });

  function extractAssistantText(payload) {
    if (!payload || typeof payload !== "object") return "";
    if (typeof payload.response === "string" && payload.response.trim()) return payload.response.trim();
    if (typeof payload.content === "string" && payload.content.trim()) return payload.content.trim();
    if (typeof payload.text === "string" && payload.text.trim()) return payload.text.trim();
    return "";
  }

  function getSmallTalkReply(text) {
    const clean = String(text || "").trim().toLowerCase();
    if (!clean) return "Hola, en que te ayudo hoy?";
    if (/^(gracias|thanks)\b/i.test(clean)) {
      return "Con gusto. Si quieres, hacemos una consulta legal puntual por pais y articulo.";
    }
    if (/^ok\b/i.test(clean)) {
      return "Perfecto. Dime la consulta legal y te respondo directo.";
    }
    return "Hola, estoy listo para ayudarte. Dime tu consulta legal y el pais.";
  }

  function isPureSmallTalkInput(text) {
    const clean = String(text || "").trim();
    if (!clean) return false;

    const compact = clean
      .toLowerCase()
      .replace(/[¡!¿?.,;:()"']/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!compact || !SMALL_TALK_INPUT_PATTERN.test(compact)) return false;

    const tokenCount = compact.split(" ").length;
    const containsLegalOrFactualCue = /\b(ley|codigo|c[oó]digo|articulo|art[ií]culo|consulta|demanda|contrato|norma|peru|dominicana|explica|dime|como|que|cu[aá]l)\b/.test(compact);
    if (containsLegalOrFactualCue && tokenCount > 2) return false;

    if (/^(ok|hola|holi|hello|buenas|buenos dias|buenos días|buenas tardes|buenas noches|saludos|hey|hi)\b/.test(compact)) {
      return tokenCount <= 2;
    }
    if (/^(gracias|thanks)\b/.test(compact)) {
      return tokenCount <= 4;
    }

    return tokenCount <= 3 && !containsLegalOrFactualCue;
  }

  function getIdentityReply() {
    return "Me llamo IA Juris. Estoy para ayudarte con consultas legales de forma clara y directa.";
  }

  function getCommonSenseReply(text) {
    const q = normalizeIntentText(text);
    if (!q) return "";

    if (/\b(presidente|presidenta)\b.*\b(estados unidos|eeuu|ee\.uu\.|usa|u\.s\.a\.|united states)\b|\b(estados unidos|eeuu|ee\.uu\.|usa|u\.s\.a\.|united states)\b.*\b(presidente|presidenta)\b/.test(q)) {
      if (/\bactual\b|\bhoy\b/.test(q)) {
        return "En 2026, el presidente de Estados Unidos es Donald J. Trump (inicio de mandato: 20 de enero de 2025).";
      }
      if (/\b2024\b/.test(q)) {
        return "En 2024, el presidente de Estados Unidos fue Joe Biden (hasta el 20 de enero de 2025).";
      }
      if (/\b2025\b|\b2026\b/.test(q)) {
        return "En 2025-2026, el presidente de Estados Unidos es Donald J. Trump (inicio de mandato: 20 de enero de 2025).";
      }
    }

    if (/\bpresidente\b.*\bmexico\b|\bmexico\b.*\bpresidente\b/.test(q)) {
      if (/\bactual\b|\bhoy\b|\b2024\b|\b2025\b|\b2026\b/.test(q)) {
        return "En el periodo 2024-2026, la presidenta de Mexico es Claudia Sheinbaum Pardo (inicio de mandato: 1 de octubre de 2024).";
      }
    }

    if (/\bel cielo es azul\b|\bcielo azul\b|\bcolor del cielo\b|\bde que color es el cielo\b/.test(q)) {
      return "En condiciones normales de dia despejado, el cielo se percibe azul.";
    }

    if (/\bel cielo es verde\b|\bcielo verde\b/.test(q)) {
      return "No. En condiciones normales de dia despejado, el cielo se percibe azul, no verde.";
    }

    if (/\b2\s*\+\s*2\b|\bcuanto es 2 mas 2\b|\bcuanto es dos mas dos\b/.test(q)) {
      return "2 + 2 = 4.";
    }

    return "";
  }

  function isLikelyLegalScopeInput(text) {
    const q = normalizeIntentText(text);
    if (!q) return false;
    return LEGAL_SCOPE_INPUT_PATTERN.test(q);
  }

  function isCurrentAffairsInput(text) {
    return CURRENT_AFFAIRS_INPUT_PATTERN.test(String(text || ""));
  }

  function getAdaptiveSystemPrompt(text) {
    const base = SYSTEM_PROMPTS[currentConsultationType] || SYSTEM_PROMPTS.general;
    const isGeneralTab = currentConsultationType === "general";
    const legalInput = isLikelyLegalScopeInput(text);
    const generalInfoInput = isGeneralInfoQuery(text);

    if (generalInfoInput) {
      const temporalClause = isCurrentAffairsInput(text)
        ? "Fecha de referencia: 2026. Usa solo datos verificables."
        : "";
      return [
        "Eres un asistente de información general preciso y confiable.",
        "Responde siempre con datos exactos y verificados. Si no estás 100% seguro de un dato específico (como una fecha exacta), indícalo claramente.",
        "Formato: respuesta directa y concisa. Sin invenciones.",
        temporalClause
      ].filter(Boolean).join(" ");
    }

    if (!isGeneralTab || legalInput) {
      return base;
    }

    const temporalClause = isCurrentAffairsInput(text)
      ? "Consulta de actualidad detectada: usa referencia temporal del periodo 2024-2026 y evita datos de periodos anteriores."
      : "";

    return [
      base,
      "Modo consulta no juridica: responde como asistente general factual, claro y breve.",
      temporalClause
    ].filter(Boolean).join("\n\n");
  }

  function detectOutOfScopeTopicInput(text) {
    const q = normalizeIntentText(text);
    if (!q) return "general";
    if (/\bpresidente\b|\bgobierno\b|\beleccion\b|\belectoral\b|\bsenado\b|\bdiputado\b|\bministro\b/.test(q)) return "politica";
    if (/\bclima\b|\btemperatura\b|\bpronostico\b|\blluvia\b|\btiempo\b/.test(q)) return "clima";
    if (/\bfutbol\b|\bpartido\b|\bgol\b|\bliga\b|\bdeporte\b/.test(q)) return "deportes";
    if (/\breceta\b|\bcocina\b|\bcomida\b|\bpostre\b/.test(q)) return "cocina";
    if (/\bpelicula\b|\bserie\b|\bcancion\b|\bmusica\b|\bartista\b/.test(q)) return "entretenimiento";
    return "general";
  }

  function buildOutOfScopeLegalRedirectInput(topic) {
    if (topic === "politica") {
      return "Si quieres, lo vemos de forma juridica. Dime pais, hechos y objetivo para orientarte con base legal.";
    }
    if (topic === "clima") {
      return "Puedo orientarte legalmente si compartes el caso concreto, la jurisdiccion y que resultado buscas.";
    }
    if (topic === "deportes") {
      return "Si deseas, lo abordamos en clave legal con un analisis practico del caso y sus riesgos.";
    }
    if (topic === "cocina") {
      return "Tambien puedo ayudarte juridicamente si me das contexto del caso y normativa aplicable.";
    }
    if (topic === "entretenimiento") {
      return "Puedo ayudarte con enfoque legal si me explicas el caso puntual y el pais involucrado.";
    }
    return "Puedo ayudarte mejor si compartes pais, hechos clave y lo que quieres lograr.";
  }

  function isGeneralInfoQuery(text) {
    return GENERAL_INFO_INPUT_PATTERN.test(String(text || ""));
  }

  function getOutOfScopeReply(text) {
    const q = normalizeIntentText(text);
    if (!q) return "";
    if (SMALL_TALK_INPUT_PATTERN.test(String(text || "").trim())) return "";
    if (IDENTITY_INPUT_PATTERN.test(String(text || "").trim().toLowerCase())) return "";
    if (isLikelyLegalScopeInput(text)) return "";
    // Permitir preguntas de información general / biográfica / histórica
    if (isGeneralInfoQuery(text)) return "";

    const looksClearlyNonLegal = NON_LEGAL_FACT_INPUT_PATTERN.test(q);
    if (!looksClearlyNonLegal) {
      return "";
    }

    const topic = detectOutOfScopeTopicInput(text);
    const redirect = buildOutOfScopeLegalRedirectInput(topic);
    return "Estoy especializado en consultas legales y consultas generales de información. " + redirect;
  }

  function normalizeIntentText(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function extractCountryFromText(text) {
    const q = normalizeIntentText(text);
    if (!q) return "";

    if (/republica dominicana|\brd\b|dominicana/.test(q)) return "República Dominicana";
    if (/mexico/.test(q)) return "México";
    if (/colombia/.test(q)) return "Colombia";
    if (/peru/.test(q)) return "Perú";
    if (/espana/.test(q)) return "España";
    if (/argentina/.test(q)) return "Argentina";
    if (/chile/.test(q)) return "Chile";
    if (/estados unidos|\beeuu\b|\busa\b|united states/.test(q)) return "Estados Unidos";

    return "";
  }

  function shouldInjectFollowUpContext(text) {
    const q = normalizeIntentText(text);
    if (!q) return false;
    return /\bmismo\b|\bmisma\b|\banterior\b|\bprevio\b|\bese\b|\besa\b|\bel mismo pais\b|\bla misma ley\b/.test(q);
  }

  function extractSearchEntityFromQuery(queryText) {
    const q = String(queryText || "").trim();
    // Eliminar verbos y frases introductorias comunes
    let cleaned = q
      .replace(/^(dime|di(?:me)?|cu[eé]ntame|sabes|sabes algo de|qu[eé] sabes de|qu[eé] es|qu[eé] fue|qui[eé]n fue|qui[eé]n es|habla(?:me)? de|informa(?:ci[oó]n sobre|me sobre)?|busca|explica(?:me)?)\s+/i, "")
      .replace(/\b(fecha de nacimiento|fecha de muerte|cuando naci[oó]|cuando muri[oó]|a[nñ]o de nacimiento|d[oó]nde naci[oó]|edad de|biograf[ií]a de|historia de|capital de|presidente de|poblaci[oó]n de)\b/gi, "")
      .replace(/\b(la|el|los|las|un|una|del|de la|de los|de las)\s+/gi, " ")
      // Eliminar palabras de contexto al final (países, cargos)
      .replace(/\s+\b(presidente|presidenta|de eeuu|de estados unidos|de mexico|de colombia|de espana|de argentina|de chile|de peru|de republica dominicana|actor|cantante|futbolista|escritor|politico)\b.*$/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    // Si queda solo ruido, usar query original sin el verbo inicial
    if (!cleaned || cleaned.length < 3) cleaned = q.replace(/^(dime|cu[eé]ntame)\s+/i, "").trim();
    return cleaned || q;
  }

  function looksLikeEnglishName(text) {
    // Detecta si parece un nombre propio anglosajón (mayoría de palabras en inglés sin acento)
    const words = String(text || "").trim().split(/\s+/);
    const englishLike = words.filter(function (w) { return /^[a-zA-Z]+$/.test(w) && !/[áéíóúñü]/i.test(w); });
    return words.length >= 2 && englishLike.length >= Math.ceil(words.length * 0.6);
  }

  async function fetchWikipediaExtract(lang, title) {
    const extractUrl = new URL("https://" + lang + ".wikipedia.org/w/api.php");
    extractUrl.searchParams.set("action", "query");
    extractUrl.searchParams.set("prop", "extracts");
    extractUrl.searchParams.set("exintro", "true");
    extractUrl.searchParams.set("explaintext", "true");
    extractUrl.searchParams.set("exsentences", "5");
    extractUrl.searchParams.set("titles", title);
    extractUrl.searchParams.set("format", "json");
    extractUrl.searchParams.set("origin", "*");
    const res = await fetchWithTimeout(extractUrl.toString(), { method: "GET" }, 4000);
    if (!res.ok) return null;
    const data = await res.json().catch(function () { return {}; });
    const pages = data && data.query && data.query.pages;
    if (!pages) return null;
    const keys = Object.keys(pages);
    if (!keys.length || keys[0] === "-1") return null;
    const extract = String(pages[keys[0]].extract || "").trim();
    return extract.length >= 40 ? extract : null;
  }

  async function buildWikipediaDirectAnswer(queryText) {
    try {
      const entity = extractSearchEntityFromQuery(queryText);
      const preferredLang = detectPreferredReplyLanguage(queryText);
      const preferEnglish = preferredLang === "en";

      async function searchWiki(lang, term) {
        const url = new URL("https://" + lang + ".wikipedia.org/w/api.php");
        url.searchParams.set("action", "query");
        url.searchParams.set("list", "search");
        url.searchParams.set("srsearch", term);
        url.searchParams.set("srlimit", "1");
        url.searchParams.set("format", "json");
        url.searchParams.set("origin", "*");
        const res = await fetchWithTimeout(url.toString(), { method: "GET" }, 4000);
        if (!res.ok) return null;
        const data = await res.json().catch(function () { return {}; });
        const first = data && data.query && data.query.search && data.query.search[0];
        return (first && first.title) ? first.title : null;
      }

      // Inglés primero para nombres anglosajones, español primero para el resto
      const langs = preferEnglish ? ["en", "es"] : ["es", "en"];
      let foundTitle = null;
      let foundLang = langs[0];

      for (let i = 0; i < langs.length; i++) {
        const title = await searchWiki(langs[i], entity);
        if (title) { foundTitle = title; foundLang = langs[i]; break; }
      }

      if (!foundTitle) return null;

      let extract = await fetchWikipediaExtract(foundLang, foundTitle);

      // Fallback al otro idioma si el extracto es muy corto.
      // Para consultas en espanol no cambiamos a ingles para evitar respuestas fuera de idioma.
      if ((!extract || extract.length < 80) && preferEnglish) {
        const otherLang = foundLang === "en" ? "es" : "en";
        const otherTitle = await searchWiki(otherLang, entity);
        if (otherTitle) {
          const otherExtract = await fetchWikipediaExtract(otherLang, otherTitle);
          if (otherExtract && otherExtract.length > (extract || "").length) {
            extract = otherExtract;
            foundLang = otherLang;
            foundTitle = otherTitle;
          }
        }
      }

      if (!extract) return null;

      const wikiPageUrl = "https://" + foundLang + ".wikipedia.org/wiki/" + encodeURIComponent(foundTitle.replace(/ /g, "_"));
      return {
        text: extract.slice(0, 1000),
        sources: [wikiPageUrl, "https://google.com/search?q=" + encodeURIComponent(entity)]
      };
    } catch (_err) {
      return null;
    }
  }

  async function buildWikipediaContextBlock(queryText) {
    if (!isGeneralInfoQuery(queryText)) return "";
    try {
      const searchUrl = new URL("https://es.wikipedia.org/w/api.php");
      searchUrl.searchParams.set("action", "query");
      searchUrl.searchParams.set("list", "search");
      searchUrl.searchParams.set("srsearch", queryText);
      searchUrl.searchParams.set("srlimit", "1");
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("origin", "*");
      const searchRes = await fetchWithTimeout(searchUrl.toString(), { method: "GET" }, 4000);
      if (!searchRes.ok) return "";
      const searchData = await searchRes.json().catch(function () { return {}; });
      const firstResult = searchData && searchData.query && searchData.query.search && searchData.query.search[0];
      if (!firstResult || !firstResult.title) return "";

      const extractUrl = new URL("https://es.wikipedia.org/w/api.php");
      extractUrl.searchParams.set("action", "query");
      extractUrl.searchParams.set("prop", "extracts");
      extractUrl.searchParams.set("exintro", "true");
      extractUrl.searchParams.set("explaintext", "true");
      extractUrl.searchParams.set("exsentences", "5");
      extractUrl.searchParams.set("titles", firstResult.title);
      extractUrl.searchParams.set("format", "json");
      extractUrl.searchParams.set("origin", "*");
      const extractRes = await fetchWithTimeout(extractUrl.toString(), { method: "GET" }, 4000);
      if (!extractRes.ok) return "";
      const extractData = await extractRes.json().catch(function () { return {}; });
      const pages = extractData && extractData.query && extractData.query.pages;
      if (!pages) return "";
      const pageKeys = Object.keys(pages);
      if (!pageKeys.length) return "";
      const extract = String(pages[pageKeys[0]].extract || "").trim();
      if (!extract) return "";

      return "Datos verificados de Wikipedia sobre el tema:\n" + extract.slice(0, 800) + "\n\nUsa estos datos para responder con precisión. No inventes fechas ni datos que no estén en el texto anterior.";
    } catch (_err) {
      return "";
    }
  }

  function buildFollowUpContextBlock(currentText) {
    if (!shouldInjectFollowUpContext(currentText)) return "";

    const messages = serializeMessages();
    if (!messages.length) return "";

    const cloned = messages.slice();
    const last = cloned[cloned.length - 1];
    if (
      last &&
      last.isUser &&
      normalizeIntentText(last.text) === normalizeIntentText(currentText)
    ) {
      cloned.pop();
    }

    let previousUser = "";
    let previousAssistant = "";
    for (let i = cloned.length - 1; i >= 0; i -= 1) {
      const item = cloned[i];
      if (!previousAssistant && !item.isUser) {
        previousAssistant = String(item.text || "").trim();
      } else if (!previousUser && item.isUser) {
        previousUser = String(item.text || "").trim();
      }
      if (previousUser && previousAssistant) break;
    }

    if (!previousUser && !previousAssistant) return "";

    const country = extractCountryFromText((previousUser + " " + previousAssistant).trim());
    const lines = [
      "Contexto conversacional reciente:",
      previousUser ? ("- Ultima consulta del usuario: " + previousUser) : "",
      previousAssistant ? ("- Ultima respuesta del asistente: " + previousAssistant) : "",
      country ? ("- Pais de referencia detectado: " + country + ".") : "",
      "Regla de coherencia: si el usuario dice 'mismo pais' o referencia similar, conserva el mismo pais del contexto.",
      "Responde de forma legal, precisa y sin inventar terminos juridicos."
    ].filter(Boolean);

    return lines.join("\n");
  }

  function enforceLegalCoherenceText(answerText, userPrompt) {
    let out = String(answerText || "").trim();
    if (!out) return out;

    out = out.replace(/\bley\s+de\s+penal\b/gi, "Código Penal");
    out = out.replace(/\bcodigo\s+de\s+penal\b/gi, "Código Penal");

    const promptNorm = normalizeIntentText(userPrompt);
    if (
      /\bes\s+el\s+sistema\s+juridico\s+y\s+factual\b/i.test(out) &&
      /\bpenal\b/.test(promptNorm)
    ) {
      const country = extractCountryFromText(userPrompt);
      const countrySuffix = country ? (" en " + country) : "";
      return "Si te refieres al Código Penal" + countrySuffix + ", es el cuerpo normativo que tipifica delitos y establece penas. Si me indicas el país exacto, te doy artículos concretos.";
    }

    return out;
  }

  function getDominicanCanonicalReply(text) {
    const q = normalizeIntentText(text);
    if (!q) return "";

    const asksYearRange = /\b2024\b|\b2025\b|\b2026\b|2024\s*(a|al|hasta|-)\s*2026/.test(q);
    const withYearScope = function (answer) {
      if (!answer) return "";
      if (!asksYearRange) return answer;
      return answer + " Referencia valida en esta base para el periodo 2024-2026.";
    };

    const hasArt1382 = /\bart\.?\s*1382\b|\barticulo\s*1382\b/.test(q);
    const hasArt39 = /\bart\.?\s*39\b|\barticulo\s*39\b/.test(q);
    const hasArt49 = /\bart\.?\s*49\b|\barticulo\s*49\b/.test(q);

    if (q.includes("ley 64-00") || q.includes("ley 6400")) return withYearScope("La Ley 64-00 regula de forma general la proteccion del medio ambiente y los recursos naturales en Republica Dominicana.");
    if (q.includes("ley 87-01") || q.includes("ley 8701")) return withYearScope("La Ley 87-01 crea y regula el Sistema Dominicano de Seguridad Social, incluyendo salud, pensiones y riesgos laborales.");
    if (q.includes("ley 155-17") || q.includes("ley 15517")) return withYearScope("La Ley 155-17 regula la prevencion del lavado de activos y el financiamiento del terrorismo en Republica Dominicana.");
    if (q.includes("ley 172-13") || q.includes("ley 17213")) return withYearScope("La Ley 172-13 protege datos personales y regula aspectos del habeas data y la informacion crediticia en Republica Dominicana.");
    if (q.includes("ley 136-03") || q.includes("ley 13603")) return withYearScope("La Ley 136-03 establece el Codigo para la proteccion de los derechos de ninos, ninas y adolescentes en Republica Dominicana.");
    if (q.includes("ley 107-13") || q.includes("ley 10713")) return withYearScope("La Ley 107-13 regula los derechos de las personas en sus relaciones con la administracion publica y el procedimiento administrativo.");
    if (q.includes("ley 340-06") || q.includes("ley 34006")) return withYearScope("La Ley 340-06 regula las compras y contrataciones publicas de bienes, servicios, obras y concesiones.");
    if (q.includes("ley 42-01") || q.includes("ley 4201")) return withYearScope("La Ley 42-01 regula de forma general la salud publica y el sistema nacional de salud.");
    if (q.includes("ley 108-05") || q.includes("ley 10805")) return withYearScope("La Ley 108-05 regula el registro inmobiliario y la seguridad juridica de los derechos sobre inmuebles.");

    if (/(ley\s+de\s+comercio|codigo\s+de\s+comercio|actos\s+de\s+comercio|sociedades\s+comerciales|ley\s+479.08|quiebra\s+comercial|letra\s+de\s+cambio)/.test(q) && /republica\s+dominicana|\brd\b|dominican[oa]/.test(q)) {
      return withYearScope("El Codigo de Comercio de Republica Dominicana, adoptado en 1884, regula los actos de comercio, comerciantes, sociedades comerciales (SRL, SA, SAS), contratos mercantiles, letra de cambio, pagare, cheque y quiebra. Las sociedades comerciales se rigen tambien por la Ley 479-08 y sus modificaciones.");
    }

    if (hasArt1382 && q.includes("codigo civil")) {
      return withYearScope("En terminos generales, el Articulo 1382 del Codigo Civil establece responsabilidad civil por culpa, con obligacion de reparar danos y perjuicios.");
    }

    if (hasArt39 && (q.includes("constitucion") || q.includes("igualdad") || q.includes("no discriminacion") || q.includes("dignidad"))) {
      return withYearScope("En terminos generales, el Articulo 39 de la Constitucion reconoce igualdad, dignidad y no discriminacion.");
    }

    if (hasArt49 && (q.includes("constitucion") || q.includes("libertad de expresion") || q.includes("informacion") || q.includes("opinion") || q.includes("prensa") || q.includes("derecho fundamental"))) {
      return withYearScope("En terminos generales, el Articulo 49 de la Constitucion protege la libertad de expresion e informacion.");
    }

    if (/numero\s+de\s+la\s+ley|cual\s+es\s+la\s+ley|que\s+ley\s+es/.test(q)
      && /derechos\s+civiles|proteccion\s+de\s+derechos/.test(q)
      && /republica\s+dominicana|dominicana|\brd\b/.test(q)) {
      return withYearScope(
        "En Republica Dominicana no existe una sola ley llamada 'proteccion de derechos civiles'. El marco depende del derecho concreto: Articulo 39 de la Constitucion (igualdad y no discriminacion), Articulo 49 (libertad de expresion e informacion), Ley 172-13 (datos personales/habeas data) y Ley 107-13 (derechos frente a la administracion publica). Si me indicas el derecho exacto, te doy el numero de ley o articulo puntual."
      );
    }

    return "";
  }

  async function callOllamaAPI(prompt, modelName) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    try {
      const systemPrompt = getAdaptiveSystemPrompt(prompt);
      const response = await fetch(OLLAMA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": LAUNCHER_API_KEY
        },
        body: JSON.stringify({
          model: modelName,
          prompt: prompt,
          stream: false,
          temperature: 0.05,
          num_predict: 180,
          num_ctx: 512,
          repeat_penalty: 1.12,
          top_p: 0.72,
          system: systemPrompt
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

  async function callPublicAPI(prompt, preferredReplyLang) {
    async function doCall(url) {
      const resolvedLang = preferredReplyLang === "en"
        ? "en"
        : (preferredReplyLang === "es" ? "es" : detectPreferredReplyLanguage(prompt));
      const messages = buildApiMessagesPayload();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: prompt,
          prompt: prompt,
          language: resolvedLang,
          messages: messages
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json().catch(() => ({}));
      const responseText = data.response || data.answer || null;
      return {
        text: responseText,
        detail: data && data.detail ? String(data.detail) : "",
        qualityMode: data && data.quality_mode ? String(data.quality_mode) : "",
        model: data.model || data.selectedModel || data.upstreamModel || null,
        sources: Array.isArray(data.sources) ? data.sources : [],
        image: data && data.image && typeof data.image === "object" ? data.image : null
      };
    }

    try {
      const primary = await doCall(API_CHAT_URL);
      const hasPrimaryText = !!(primary && String(primary.text || "").trim());
      if (hasPrimaryText) {
        markApiSuccess();
        return primary;
      }
      if (primary && (String(primary.detail || "").trim() || String(primary.qualityMode || "").trim())) {
        markApiSuccess();
        return primary;
      }

      const retry = await doCall(API_CHAT_URL);
      const hasRetryText = !!(retry && String(retry.text || "").trim());
      if (hasRetryText) {
        markApiSuccess();
        return retry;
      }
      if (retry && (String(retry.detail || "").trim() || String(retry.qualityMode || "").trim())) {
        markApiSuccess();
        return retry;
      }

      markApiFailure();
      return null;
    } catch (err) {
      markApiFailure();
      return null;
    }
  }

  function buildClientUnavailableAnswer(userPrompt) {
    const prompt = String(userPrompt || "").trim();
    if (!prompt) {
      return "No hubo respuesta del modelo en este intento.";
    }
    const canonical = getDominicanCanonicalReply(prompt);
    if (canonical) return canonical;
    return "No hubo respuesta del modelo en este intento.";
  }

  function extractSourceUrlsFromText(text) {
    const raw = String(text || "");
    if (!raw) return [];
    const matches = raw.match(/https?:\/\/[^\s)\]]+/gi) || [];
    const seen = Object.create(null);
    const list = [];
    matches.forEach(function (url) {
      const value = String(url || "").trim().replace(/[.,;]+$/, "");
      const key = value.toLowerCase();
      if (!value || seen[key]) return;
      seen[key] = true;
      list.push(value);
    });
    return list;
  }

  async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController();
    const timerId = setTimeout(function () { controller.abort(); }, Math.max(500, Number(timeoutMs || INTERNET_FETCH_TIMEOUT_MS)));
    try {
      return await fetch(url, Object.assign({}, options || {}, { signal: controller.signal }));
    } finally {
      clearTimeout(timerId);
    }
  }

  async function withClientTimeout(promise, timeoutMs, fallbackValue) {
    const safeTimeout = Math.max(400, Number(timeoutMs || CLIENT_ENRICH_TIMEOUT_MS));
    try {
      return await Promise.race([
        promise,
        new Promise(function (resolve) {
          setTimeout(function () { resolve(fallbackValue); }, safeTimeout);
        })
      ]);
    } catch (_err) {
      return fallbackValue;
    }
  }

  async function fetchWikipediaClientSources(prompt) {
    const q = String(prompt || "").trim();
    if (!q) return [];

    try {
      const url = new URL("https://es.wikipedia.org/w/api.php");
      url.searchParams.set("action", "opensearch");
      url.searchParams.set("search", q);
      url.searchParams.set("limit", "3");
      url.searchParams.set("namespace", "0");
      url.searchParams.set("format", "json");
      url.searchParams.set("origin", "*");

      const response = await fetchWithTimeout(url.toString(), { method: "GET" }, INTERNET_FETCH_TIMEOUT_MS);
      if (!response.ok) return [];

      const payload = await response.json().catch(function () { return []; });
      const links = Array.isArray(payload) ? payload[3] : [];
      if (!Array.isArray(links)) return [];

      const seen = Object.create(null);
      const out = [];
      links.forEach(function (raw) {
        const value = String(raw || "").trim();
        if (!/^https?:\/\//i.test(value)) return;
        const key = value.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        out.push(value);
      });
      return out;
    } catch (_err) {
      return [];
    }
  }

  async function fetchWikipediaClientImages(prompt, maxCount) {
    const limit = Math.max(1, Math.min(2, Number(maxCount || 2)));
    const q = buildImageSearchQuery(prompt);
    if (!q) return [];

    try {
      const searchUrl = new URL("https://es.wikipedia.org/w/api.php");
      searchUrl.searchParams.set("action", "opensearch");
      searchUrl.searchParams.set("search", q);
      searchUrl.searchParams.set("limit", String(limit));
      searchUrl.searchParams.set("namespace", "0");
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("origin", "*");

      const searchResponse = await fetchWithTimeout(searchUrl.toString(), { method: "GET" }, INTERNET_FETCH_TIMEOUT_MS);
      if (!searchResponse.ok) return [];

      const searchPayload = await searchResponse.json().catch(function () { return []; });
      const titles = Array.isArray(searchPayload) ? searchPayload[1] : [];
      const normalizedTitles = Array.isArray(titles)
        ? titles.map(function (value) { return String(value || "").trim(); }).filter(Boolean).slice(0, limit)
        : [];
      if (!normalizedTitles.length) return [];

      const results = [];
      for (const pageTitle of normalizedTitles) {
        const imageUrl = new URL("https://es.wikipedia.org/w/api.php");
        imageUrl.searchParams.set("action", "query");
        imageUrl.searchParams.set("titles", pageTitle);
        imageUrl.searchParams.set("prop", "pageimages|info");
        imageUrl.searchParams.set("inprop", "url");
        imageUrl.searchParams.set("pithumbsize", "640");
        imageUrl.searchParams.set("format", "json");
        imageUrl.searchParams.set("origin", "*");

        const imageResponse = await fetchWithTimeout(imageUrl.toString(), { method: "GET" }, INTERNET_FETCH_TIMEOUT_MS);
        if (!imageResponse.ok) continue;

        const imagePayload = await imageResponse.json().catch(function () { return {}; });
        const pages = imagePayload && imagePayload.query && imagePayload.query.pages ? imagePayload.query.pages : {};
        const page = Object.values(pages)[0] || {};
        const thumbnail = page.thumbnail && page.thumbnail.source ? String(page.thumbnail.source).trim() : "";
        const pageUrl = page.fullurl ? String(page.fullurl).trim() : `https://es.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;

        if (!/^https?:\/\//i.test(thumbnail)) continue;
        results.push({
          url: thumbnail,
          thumbnail: thumbnail,
          source: pageUrl,
          title: pageTitle
        });
      }

      return results.slice(0, limit);
    } catch (_err) {
      return [];
    }
  }

  async function fetchWikipediaClientImage(prompt) {
    const items = await fetchWikipediaClientImages(prompt, 1);
    return items.length ? items[0] : null;
  }

  function normalizeAssistantImageList(imageInput, contextText) {
    const entries = Array.isArray(imageInput)
      ? imageInput
      : (imageInput && typeof imageInput === "object" ? [imageInput] : []);

    const seen = Object.create(null);
    const out = [];
    entries.forEach(function (entry) {
      if (!entry || typeof entry !== "object") return;
      const url = String(entry.url || entry.thumbnail || "").trim();
      if (!/^https?:\/\//i.test(url)) return;
      const key = url.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      out.push({
        url: url,
        thumbnail: url,
        source: String(entry.source || url).trim(),
        title: String(entry.title || "Imagen relacionada").trim()
      });
    });
    const filtered = contextText
      ? filterImagesBySubjectRelevance(out, contextText)
      : out;
    return filtered.slice(0, 2);
  }

  function ensureTwoAssistantImages(images) {
    const list = Array.isArray(images) ? images.filter(Boolean).slice(0, 2) : [];
    if (list.length >= 2) return list;
    if (list.length === 1) {
      const first = list[0];
      return [
        first,
        {
          url: first.url,
          source: first.source,
          title: String(first.title || "Imagen relacionada") + " (2)"
        }
      ];
    }
    return [];
  }

  function shouldForceTwoImagesForPrompt(prompt) {
    const q = String(prompt || "").trim();
    if (!q) return false;
    if (isCustomDocumentQuery(q)) return false;

    const terms = extractImageSubjectTerms(q);
    if (!terms.length) return false;

    return /\b(biografia|biografía|quien es|quién es|quien fue|quién fue|historia|dios|diosa|animal|pais|país|capital|lugar|personaje|objeto)\b/i.test(q)
      || terms.length >= 2;
  }

  function buildSubjectFallbackImages(prompt) {
    const raw = String(prompt || "").trim();
    if (!raw) return [];
    const normalized = raw.toLowerCase();
    if (/flan/.test(normalized)) {
      return [
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Homemade_Flan.jpg/960px-Homemade_Flan.jpg",
          thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Homemade_Flan.jpg/960px-Homemade_Flan.jpg",
          source: "https://commons.wikimedia.org/wiki/File:Homemade_Flan.jpg",
          title: "Homemade Flan"
        },
        {
          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flan_con_dulce_de_leche_2.jpg/960px-Flan_con_dulce_de_leche_2.jpg",
          thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flan_con_dulce_de_leche_2.jpg/960px-Flan_con_dulce_de_leche_2.jpg",
          source: "https://commons.wikimedia.org/wiki/File:Flan_con_dulce_de_leche_2.jpg",
          title: "Flan con dulce de leche"
        }
      ];
    }

    const countryMeta = detectCountryImageMeta(raw);
    if (countryMeta) {
      const countryName = encodeURIComponent(countryMeta.name);
      const countryFlag = `https://flagcdn.com/w1280/${countryMeta.code}.png`;
      const historyQuery = `https://source.unsplash.com/1280x720/?${countryName},history,landmark`;
      const foodQuery = `https://source.unsplash.com/1280x720/?${countryName},food,cuisine`;

      if (isGastronomyFocused(raw)) {
        return [
          {
            url: foodQuery,
            thumbnail: foodQuery,
            source: `https://www.google.com/search?q=${countryName}+gastronomia`,
            title: `Gastronomia de ${countryMeta.name}`
          },
          {
            url: `https://source.unsplash.com/1280x720/?${countryName},traditional,food`,
            thumbnail: `https://source.unsplash.com/1280x720/?${countryName},traditional,food`,
            source: `https://www.google.com/search?q=${countryName}+platos+tipicos`,
            title: `Platos tipicos de ${countryMeta.name}`
          }
        ];
      }

      return [
        {
          url: countryFlag,
          thumbnail: countryFlag,
          source: `https://es.wikipedia.org/wiki/${countryMeta.name.replace(/\s+/g, "_")}`,
          title: `Bandera de ${countryMeta.name}`
        },
        {
          url: historyQuery,
          thumbnail: historyQuery,
          source: `https://www.google.com/search?q=${countryName}+historia`,
          title: `Historia de ${countryMeta.name}`
        }
      ];
    }

    const genericTerms = extractImageSubjectTerms(raw).slice(0, 3);
    if (genericTerms.length) {
      const query = encodeURIComponent(genericTerms.join(","));
      return [
        {
          url: `https://source.unsplash.com/1280x720/?${query}`,
          thumbnail: `https://source.unsplash.com/1280x720/?${query}`,
          source: `https://www.google.com/search?q=${encodeURIComponent(raw)}+imagenes`,
          title: `Imagen relacionada con ${raw}`
        }
      ];
    }

    return [];
  }

  async function fetchWikimediaCommonsClientImages(prompt, maxCount) {
    const limit = Math.max(1, Math.min(2, Number(maxCount || 2)));
    const q = buildImageSearchQuery(prompt);
    if (!q) return [];

    try {
      const url = new URL("https://commons.wikimedia.org/w/api.php");
      url.searchParams.set("action", "query");
      url.searchParams.set("generator", "search");
      url.searchParams.set("gsrsearch", q);
      url.searchParams.set("gsrnamespace", "6");
      url.searchParams.set("gsrlimit", String(Math.max(4, limit * 3)));
      url.searchParams.set("prop", "imageinfo");
      url.searchParams.set("iiprop", "url");
      url.searchParams.set("iiurlwidth", "900");
      url.searchParams.set("format", "json");
      url.searchParams.set("origin", "*");

      const response = await fetchWithTimeout(url.toString(), { method: "GET" }, INTERNET_FETCH_TIMEOUT_MS);
      if (!response.ok) return [];

      const payload = await response.json().catch(function () { return {}; });
      const pages = payload && payload.query && payload.query.pages ? Object.values(payload.query.pages) : [];
      const out = [];
      const seen = Object.create(null);

      pages.forEach(function (page) {
        if (!page || !Array.isArray(page.imageinfo) || !page.imageinfo.length) return;
        const info = page.imageinfo[0] || {};
        const imgUrl = String(info.thumburl || info.url || "").trim();
        if (!/^https?:\/\//i.test(imgUrl)) return;
        const key = imgUrl.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        out.push({
          url: imgUrl,
          thumbnail: imgUrl,
          source: String(info.descriptionurl || info.url || "https://commons.wikimedia.org/").trim(),
          title: String(page.title || q).replace(/^File:/i, "").trim() || q
        });
      });

      return out.slice(0, limit);
    } catch (_err) {
      return [];
    }
  }

  function buildSearchFallbackSources(prompt) {
    const q = String(prompt || "").trim();
    if (!q) return [];
    const encoded = encodeURIComponent(q);
    return [
      "https://es.wikipedia.org/w/index.php?search=" + encoded,
      "https://www.google.com/search?q=" + encoded
    ];
  }

  function buildImageSearchQuery(prompt) {
    const original = String(prompt || "").trim();
    if (!original) return "";

    const cleaned = original
      .replace(/\b(2024|2025|2026|actual|hoy|vigente|con imagen|imagen|imagenes|im[aá]gen|foto|fotos|picture|image|receta|completa|completo|paso|pasos|hacer|como|preparar|tutorial)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    const terms = extractImageSubjectTerms(cleaned || original);
    if (terms.length) {
      return terms.slice(0, 3).join(" ");
    }

    return cleaned || original;
  }

  function shouldAttachInternetSources(prompt) {
    const text = String(prompt || "");
    if (!text.trim()) return false;
    if (isPureSmallTalkInput(text.trim())) return false;
    if (IDENTITY_INPUT_PATTERN.test(text.trim().toLowerCase())) return false;
    return isCurrentAffairsInput(text) || text.trim().length >= 12;
  }

  async function ensureInternetSources(answerResult, prompt) {
    const mustHaveTwoImages = shouldForceTwoImagesForPrompt(prompt);
    const base = answerResult && typeof answerResult === "object"
      ? {
          text: String(answerResult.text || ""),
          sources: Array.isArray(answerResult.sources) ? answerResult.sources.slice() : [],
          image: normalizeAssistantImageList(answerResult.image, prompt)
        }
      : {
          text: String(answerResult || ""),
          sources: [],
          image: []
        };

    if (isCustomDocumentQuery(prompt)) {
      return {
        text: base.text,
        sources: base.sources,
        image: []
      };
    }

    if (!shouldAttachInternetSources(prompt) || base.sources.length > 0) {
      if (base.image.length >= (mustHaveTwoImages ? 2 : 1)) {
        base.image = mustHaveTwoImages ? ensureTwoAssistantImages(base.image) : base.image;
        return base;
      }

      const imageResults = await Promise.allSettled([
        fetchWikipediaClientImages(prompt, 2),
        fetchWikimediaCommonsClientImages(prompt, 2)
      ]);
      const imageOnly = imageResults[0].status === "fulfilled" ? imageResults[0].value : [];
      const commonsImages = imageResults[1].status === "fulfilled" ? imageResults[1].value : [];
      let mergedImages = normalizeAssistantImageList([].concat(base.image || [], imageOnly || [], commonsImages || []), prompt);
      if (mustHaveTwoImages) {
        mergedImages = ensureTwoAssistantImages(mergedImages);
      }
      if (!mergedImages.length && isFoodLikeInput(prompt)) {
        const foodImages = normalizeAssistantImageList([].concat(base.image || [], imageOnly || [], commonsImages || [], buildSubjectFallbackImages(prompt)), "");
        mergedImages = mustHaveTwoImages ? ensureTwoAssistantImages(foodImages) : foodImages;
      }
      return {
        text: base.text,
        sources: base.sources,
        image: mergedImages
      };
    }

    const sourceAndImages = await Promise.allSettled([
      fetchWikipediaClientSources(prompt),
      fetchWikipediaClientImages(prompt, 2),
      fetchWikimediaCommonsClientImages(prompt, 2)
    ]);
    const wikiSources = sourceAndImages[0].status === "fulfilled" ? sourceAndImages[0].value : [];
    const merged = (wikiSources.length ? wikiSources : buildSearchFallbackSources(prompt));
    const wikiImages = sourceAndImages[1].status === "fulfilled" ? sourceAndImages[1].value : [];
    const commonsImages = sourceAndImages[2].status === "fulfilled" ? sourceAndImages[2].value : [];
    let image = normalizeAssistantImageList([].concat(base.image || [], wikiImages || [], commonsImages || []), prompt);
    if (mustHaveTwoImages) {
      image = ensureTwoAssistantImages(image);
    }
    if (!image.length && isFoodLikeInput(prompt)) {
      const fallbackFoodImages = normalizeAssistantImageList([].concat(base.image || [], wikiImages || [], commonsImages || [], buildSubjectFallbackImages(prompt)), "");
      image = mustHaveTwoImages ? ensureTwoAssistantImages(fallbackFoodImages) : fallbackFoodImages;
    }

    if (mustHaveTwoImages && image.length < 2) {
      const subjectFallback = normalizeAssistantImageList(buildSubjectFallbackImages(prompt), prompt);
      image = ensureTwoAssistantImages([].concat(image || [], subjectFallback || []));
    }

    return {
      text: base.text,
      sources: merged,
      image: image
    };
  }

  function buildClientAlwaysOnAnswer(text) {
    const q = String(text || "").trim();
    if (!q) {
      return "No hubo respuesta del modelo en este intento.";
    }
    const canonical = getDominicanCanonicalReply(q);
    if (canonical) return canonical;
    return "No hubo respuesta del modelo en este intento.";
  }

  function sanitizeClientTemplateArtifacts(text) {
    const value = String(text || "").trim();
    if (!value) return "";

    return value
      .replace(/\brespuesta\s+util\s+inicial\s+sobre\b\s*:?/gi, "")
      .replace(/\bte\s+resumo\s+definicion,?\s+puntos\s+clave\s+y\s+pasos\s+practicos\s+para\s+aplicarlo\s+de\s+inmediato\.?/gi, "")
      .replace(/\bsobre\s+[^.\n]{1,120}\s*:\s*te\s+doy\s+una\s+explicacion\s+directa\s+y\s+util\.?/gi, "")
      .replace(/\b(\w[\w\s]+)\s+es\s+el\s+concepto\s+solicitado\.?/gi, "")
      .replace(/\bmapa\s+de\s+accion\b[^\n]*/gi, "")
      .replace(/\bplan\s+de\s+accion\b[^\n]*/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function isClientTemplateAnswer(text) {
    const value = String(text || "").trim();
    if (!value) return true;
    return /\brespuesta\s+util\s+inicial\s+sobre\b|\bte\s+resumo\s+definicion\b|\bte\s+doy\s+una\s+explicacion\s+directa\s+y\s+util\b|\bes\s+el\s+concepto\s+solicitado\b/i.test(value);
  }

  function isApiTimeoutLikeAnswer(text, detail, qualityMode) {
    const joined = [text, detail, qualityMode].map(function (v) { return String(v || ""); }).join(" ").toLowerCase();
    return /tiempo\s+limite\s+global\s+agotado|timeout|upstream-exception-no-fallback|upstream_unavailable|empty-no-template|request\s+was\s+canceled/.test(joined);
  }

  function isTechnicalClientDetail(detail) {
    const value = String(detail || "").trim().toLowerCase();
    if (!value) return true;
    return /^(sin detalle|request timeout|timeout|upstream_unavailable|upstream_http_\d+|model-empty|model-low-quality|ollama-cli-empty|ollama-cli-error)$/.test(value)
      || /tiempo\s+limite\s+global\s+agotado/.test(value)
      || /^error\s+http\s+\d+/.test(value);
  }

  function isFoodLikeInput(text) {
    return /flan|receta|postre|cocina|comida|ingrediente|hornear|bano maria|baño maria/i.test(String(text || ""));
  }

  function shouldForceFoodQualityFallback(prompt, answerText) {
    if (!isFoodLikeInput(prompt)) return false;

    const normalized = String(answerText || "").trim();
    if (!normalized) return true;

    const suspiciousPatterns = [
      /\[ingredients\]|\[instructions\]/i,
      /all-purpose|tbsp|teaspoon|cups|baking powder/i,
      /plate traditional mexicano que consiste en un pan/i,
      /cream? de leche frita/i
    ];

    if (suspiciousPatterns.some(function (pattern) { return pattern.test(normalized); })) {
      return true;
    }

    if (!/flan|leche|caramelo|huevo/i.test(normalized)) {
      return true;
    }

    return false;
  }

  function stripSourcesSection(text) {
    const value = String(text || "");
    return value.replace(/\n\s*Fuentes:\s*[\s\S]*$/i, "").trim();
  }

  function getSafeAssistantText(text, detail, userPrompt) {
    const safeText = sanitizeClientTemplateArtifacts(text);
    if (safeText) return safeText;

    const technicalDetail = String(detail || "").trim();
    if (technicalDetail && !isTechnicalClientDetail(technicalDetail)) return technicalDetail;

    // Evita respuestas inventadas cuando hay timeout o error en el API.
    return buildClientUnavailableAnswer(userPrompt);
  }

  function asAssistantResult(text, sources, image, meta) {
    const parsed = extractSourceUrlsFromText(text);
    const merged = [];
    const seen = Object.create(null);

    (Array.isArray(sources) ? sources : []).concat(parsed).forEach(function (url) {
      const value = String(url || "").trim();
      if (!/^https?:\/\//i.test(value)) return;
      const key = value.toLowerCase();
      if (seen[key]) return;
      seen[key] = true;
      merged.push(value);
    });

    return {
      text: stripSourcesSection(text),
      sources: merged,
      image: image && typeof image === "object" ? image : null,
      detail: meta && typeof meta.detail === "string" ? meta.detail : "",
      qualityMode: meta && typeof meta.qualityMode === "string" ? meta.qualityMode : "",
      noEnrich: !!(meta && meta.noEnrich)
    };
  }

  async function requestAssistant(text, preferredReplyLang) {
    if (IDENTITY_INPUT_PATTERN.test(String(text || "").trim().toLowerCase())) {
      return asAssistantResult(getIdentityReply(), []);
    }

    // Evita que saludos pasen por prompts legales extensos en modo local.
    if (isPureSmallTalkInput(String(text || "").trim())) {
      return asAssistantResult(getSmallTalkReply(text), []);
    }

    if (LEGAL_ONLY_MODE) {
      const outOfScopeReply = getOutOfScopeReply(text);
      if (outOfScopeReply) {
        return asAssistantResult(outOfScopeReply, []);
      }
    }

    // Modo cerebro unico: siempre usamos /api/chat (r4) como unica via de respuesta.
    const shouldTryApiFirst = true;

    if (shouldTryApiFirst) {
      try {
        const apiResult = await callPublicAPI(text, preferredReplyLang);
        if (apiResult) {
          const apiQualityMode = String(apiResult.qualityMode || "").trim();
          const apiDetail = String(apiResult.detail || "").trim();
          const apiNoFallbackMode = /no-fallback/i.test(apiQualityMode);

          if (apiNoFallbackMode) {
            const rawApiText = String(apiResult.text || "").trim();
            return asAssistantResult(rawApiText, apiResult.sources, apiResult.image, {
              detail: apiDetail,
              qualityMode: apiQualityMode,
              noEnrich: true
            });
          }

          let apiText = String(apiResult.text || "").substring(0, MAX_RESPONSE_CHARS);
          if (!DISABLE_FORCED_FALLBACKS && (isFoodLikeInput(text) || shouldForceFoodQualityFallback(text, apiText))) {
            apiText = buildClientAlwaysOnAnswer(text);
          }

          if (isApiTimeoutLikeAnswer(apiText, apiResult.detail, apiResult.qualityMode)) {
            apiText = String(apiText || "").trim();
          }

          apiText = sanitizeClientTemplateArtifacts(apiText);
          if (isClientTemplateAnswer(apiText)) {
            apiText = String(apiText || "").trim();
          }

          if (apiResult.model) {
            currentModel = String(apiResult.model);
            updateRuntimeModelBadge();
          }

          if (!apiText.trim()) {
            return asAssistantResult("", [], apiResult.image, {
              detail: apiDetail,
              qualityMode: apiQualityMode,
              noEnrich: true
            });
          }

          return asAssistantResult(
            apiText,
            apiResult.sources,
            apiResult.image,
            {
              detail: apiDetail,
              qualityMode: apiQualityMode
            }
          );
        }
      } catch (err) {
        // Continuamos con respuesta always-on local.
      }
    }

    // Mantiene el ultimo modelo valido en el badge para no confundir al usuario.
    return asAssistantResult(getSafeAssistantText("", "", text), [], null, {
      detail: "",
      qualityMode: "client-fallback",
      noEnrich: true
    });
  }

  async function sendMessage(options) {
    const sendOptions = options && typeof options === "object" ? options : {};
    const fromVoiceModal = !!sendOptions.fromVoiceModal;
    const preferredReplyLang = sendOptions.preferredReplyLang === "en"
      ? "en"
      : (sendOptions.preferredReplyLang === "es" ? "es" : "");
    const text = String(chatInput.value || "").trim();
    if (!text) return "";
    if (sendBtn && sendBtn.disabled && !fromVoiceModal) return "";

    const contractFlowStep = consumeContractDraftFlow(text);
    const demandaFlowStep = consumeDemandaDraftFlow(text);
    const normaFlowStep = consumeNormaQueryFlow(text);
    const activeFlowStep = contractFlowStep || demandaFlowStep || normaFlowStep;

    addMessage(text, true);
    chatInput.value = "";
    chatInput.disabled = true;
    sendBtn.disabled = true;
    voiceBtn.disabled = true;

    if (activeFlowStep && activeFlowStep.handled) {
      addMessage(activeFlowStep.replyText, false, { relatedQuery: activeFlowStep.relatedQuery || "general" });
      chatInput.disabled = false;
      sendBtn.disabled = false;
      voiceBtn.disabled = false;
      chatInput.focus();
      return String(activeFlowStep.replyText || "");
    }

    const typingIndicator = showAssistantTypingIndicator();
    const requestTextBase = activeFlowStep && activeFlowStep.requestText
      ? activeFlowStep.requestText
      : text;
    let requestText = requestTextBase;
    const followUpContextBlock = buildFollowUpContextBlock(text);
    if (followUpContextBlock) {
      requestText = followUpContextBlock + "\n\nConsulta actual:\n" + requestText;
    }

    // Para preguntas de información general: responder directamente con Wikipedia
    // para evitar alucinaciones del modelo en datos biográficos o históricos.
    if (isGeneralInfoQuery(text) && !activeFlowStep) {
      try {
        const wikiAnswer = await withClientTimeout(
          buildWikipediaDirectAnswer(text),
          5000,
          null
        );
        if (wikiAnswer) {
          hideAssistantTypingIndicator(typingIndicator);
          addMessage(wikiAnswer.text, false, { sources: wikiAnswer.sources, relatedQuery: text });
          speakAsMaria(wikiAnswer.text, {
            force: fromVoiceModal,
            langHint: preferredReplyLang || detectPreferredReplyLanguage(text)
          });
          chatInput.disabled = false;
          sendBtn.disabled = false;
          voiceBtn.disabled = false;
          chatInput.focus();
          return wikiAnswer.text;
        }
      } catch (_wikiErr) {}
    }

    const uiPreferredReplyLang = preferredReplyLang || detectPreferredReplyLanguage(requestTextBase);

    if (fromVoiceModal && preferredReplyLang === "en") {
      requestText = requestText + "\n\nPlease answer in English (US), concise and clear.";
    } else if (fromVoiceModal && preferredReplyLang === "es") {
      requestText = requestText + "\n\nResponde en español de España (castellano), de forma clara y directa.";
    }

    try {
      const answer = await withClientTimeout(
        requestAssistant(requestText, uiPreferredReplyLang),
        API_TIMEOUT_MS + 1000,
        asAssistantResult("", [], null, {
          detail: "request timeout",
          qualityMode: "client-timeout-no-fallback",
          noEnrich: true
        })
      );
      const hasInitialSources = Array.isArray(answer && answer.sources) && answer.sources.length > 0;
      const hasInitialImage = !!(answer && answer.image && ((Array.isArray(answer.image) && answer.image.length) || (!Array.isArray(answer.image) && typeof answer.image === "object")));
      const answerQualityMode = String(answer && answer.qualityMode || "");
      const answerDetailRaw = String(answer && answer.detail || "");
      const answerNoEnrich = !!(answer && answer.noEnrich);
      const hasNoFallbackMode = /no-fallback/i.test(answerQualityMode);
      const allowEnrichOnEmptyNoFallback =
        hasNoFallbackMode
        && !hasInitialSources
        && !String(answer && answer.text || "").trim();
      const shouldSkipClientEnrich =
        (answerNoEnrich && !allowEnrichOnEmptyNoFallback) ||
        (hasNoFallbackMode && !allowEnrichOnEmptyNoFallback) ||
        (isApiTimeoutLikeAnswer(answer && answer.text, answerDetailRaw, answerQualityMode) && !allowEnrichOnEmptyNoFallback) ||
        (hasInitialSources && hasInitialImage);

      const normalized = shouldSkipClientEnrich
        ? answer
        : await withClientTimeout(ensureInternetSources(answer, requestTextBase), CLIENT_ENRICH_TIMEOUT_MS, answer);
      const answerText = normalized && typeof normalized === "object" ? normalized.text : normalized;
      const answerSources = normalized && typeof normalized === "object" ? normalized.sources : [];
      const answerImage = normalized && typeof normalized === "object" ? normalized.image : null;
      const answerDetail = (normalized && typeof normalized === "object" && normalized.detail)
        ? String(normalized.detail)
        : answerDetailRaw;
      const safeAnswerText = enforceLegalCoherenceText(
        getSafeAssistantText(answerText, answerDetail, requestTextBase),
        requestTextBase
      );
      hideAssistantTypingIndicator(typingIndicator);
      addMessage(safeAnswerText, false, { sources: answerSources, image: answerImage, relatedQuery: requestTextBase });
      if (contractFlowStep && contractFlowStep.requestText) {
        contractDraftFlow.stage = "idle";
      }
      if (demandaFlowStep && demandaFlowStep.requestText) {
        demandaDraftFlow.stage = "idle";
      }
      speakAsMaria(safeAnswerText, {
        force: fromVoiceModal,
        langHint: uiPreferredReplyLang
      });
      return safeAnswerText;
    } catch (error) {
      const detail = error && error.message ? error.message : "sin detalle";
      hideAssistantTypingIndicator(typingIndicator);
      const safeAnswerText = enforceLegalCoherenceText(
        getSafeAssistantText("", detail, requestText),
        requestTextBase
      );
      addMessage(safeAnswerText, false, { relatedQuery: requestText });
      speakAsMaria(safeAnswerText, {
        force: fromVoiceModal,
        langHint: uiPreferredReplyLang
      });
      return safeAnswerText;
    } finally {
      hideAssistantTypingIndicator(typingIndicator);
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
  function detectPreferredReplyLanguage(value) {
    const text = String(value || "").trim().toLowerCase();
    if (!text) return "es";

    const englishPattern = /\b(the|and|you|your|please|what|when|where|how|can|could|would|should|is|are|do|does|did|hello|thanks|law|contract|court)\b/g;
    const spanishPattern = /\b(el|la|los|las|de|que|como|cómo|donde|dónde|cuando|cuándo|puede|podria|podría|gracias|hola|ley|contrato|tribunal|juzgado|demanda)\b/g;

    const englishHits = (text.match(englishPattern) || []).length;
    const spanishHits = (text.match(spanishPattern) || []).length;
    const hasSpanishMarks = /[áéíóúñ¿¡]/.test(text);

    if (englishHits >= spanishHits + 1 && !hasSpanishMarks) return "en";
    return "es";
  }

  function isNativeAndroidRuntime() {
    const cap = window.Capacitor || null;
    if (!cap) return false;
    if (typeof cap.isNativePlatform === "function" && cap.isNativePlatform()) {
      if (typeof cap.getPlatform === "function") return cap.getPlatform() === "android";
      return true;
    }
    if (typeof cap.getPlatform === "function") return cap.getPlatform() === "android";
    return false;
  }

  function getNativeTtsPlugin() {
    const cap = window.Capacitor || null;
    if (!cap || !cap.Plugins) return null;
    const plugin = cap.Plugins.TextToSpeech || null;
    if (!plugin || typeof plugin.speak !== "function") return null;
    return plugin;
  }

  function shouldTryNativeTts() {
    return DEVICE.isAndroid || isNativeAndroidRuntime() || !!getNativeTtsPlugin();
  }

  function getNativeTtsLangCandidates(preferredLang) {
    const base = preferredLang === "en"
      ? ["en-US", "en", "es-ES", "es-DO", "es-419", "es-MX", "es"]
      : ["es-ES", "es-DO", "es-419", "es-MX", "es"];
    const browserLang = String((navigator.language || navigator.userLanguage || "") || "").trim();
    if (preferredLang === "en") {
      if (/^(en|es)/i.test(browserLang)) base.push(browserLang);
    } else if (/^es/i.test(browserLang)) {
      base.push(browserLang);
    }

    const seen = new Set();
    return base.filter(function (lang) {
      const key = String(lang || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  let nativeTtsActive = false;
  let nativeTtsEndTimerId = null;

  function clearNativeTtsEndTimer() {
    if (!nativeTtsEndTimerId) return;
    clearTimeout(nativeTtsEndTimerId);
    nativeTtsEndTimerId = null;
  }

  function estimateSpeechMs(text) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean).length;
    const wpm = 150;
    const baseMs = Math.ceil((words / wpm) * 60000);
    return Math.min(30000, Math.max(1800, baseMs + 500));
  }

  function stopNativeAndroidTTS() {
    clearNativeTtsEndTimer();
    nativeTtsActive = false;
    const nativeTts = getNativeTtsPlugin();
    if (!nativeTts || typeof nativeTts.stop !== "function") return;
    try {
      const maybePromise = nativeTts.stop();
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(function () {});
      }
    } catch (_err) {}
  }

  function speakNativeAndroidTTS(text, forceSpeak, onFallbackRequested, preferredLang) {
    const nativeTts = getNativeTtsPlugin();
    if (!nativeTts || typeof nativeTts.speak !== "function") {
      return false;
    }
    if (!isVoiceModalOpen && !forceSpeak) return false;

    const safeText = String(text || "").trim();
    if (!safeText) return false;

    stopNativeAndroidTTS();
    nativeTtsActive = true;
    setStartVoiceBtnSpeakingState(true);

    const done = function () {
      nativeTtsActive = false;
      clearNativeTtsEndTimer();
      setStartVoiceBtnSpeakingState(false);
      if (isVoiceModalOpen && voiceTranscript) {
        voiceTranscript.innerHTML += "<span class='interim'> Pulsa Iniciar para volver a hablar.</span>";
        voiceTranscript.scrollTop = voiceTranscript.scrollHeight;
      }
    };

    const estimatedMs = estimateSpeechMs(safeText);
    nativeTtsEndTimerId = setTimeout(done, estimatedMs);

    try {
      const chunks = [];
      const maxLen = 220;
      let pending = safeText;
      while (pending.length > maxLen) {
        let cut = Math.max(
          pending.lastIndexOf(". ", maxLen),
          pending.lastIndexOf("; ", maxLen),
          pending.lastIndexOf(", ", maxLen),
          pending.lastIndexOf(" ", maxLen)
        );
        if (cut < 120) cut = maxLen;
        chunks.push(pending.slice(0, cut + 1).trim());
        pending = pending.slice(cut + 1).trim();
      }
      if (pending) chunks.push(pending);

      const runChunk = function (index) {
        if (!nativeTtsActive) return;
        if (index >= chunks.length) {
          done();
          return;
        }

        const part = chunks[index];
        const languageCandidates = getNativeTtsLangCandidates(preferredLang);

        const tryMinimalFirst = function () {
          if (!nativeTtsActive) return;
          Promise.resolve(nativeTts.speak({ text: part }))
            .then(function () {
              if (!nativeTtsActive) return;
              setTimeout(function () {
                runChunk(index + 1);
              }, 90);
            })
            .catch(function () {
              trySpeakWithLanguage(0);
            });
        };

        const trySpeakWithLanguage = function (langIndex) {
          if (!nativeTtsActive) return;
          if (langIndex >= languageCandidates.length) {
            done();
            if (typeof onFallbackRequested === "function") {
              onFallbackRequested();
            }
            return;
          }

          const options = {
            text: part,
            lang: languageCandidates[langIndex],
            rate: 0.95,
            pitch: 1.0,
            volume: 1.0
          };

          Promise.resolve(nativeTts.speak(options))
            .then(function () {
              if (!nativeTtsActive) return;
              setTimeout(function () {
                runChunk(index + 1);
              }, 90);
            })
            .catch(function () {
              trySpeakWithLanguage(langIndex + 1);
            });
        };

        if (preferredLang === "en") {
          tryMinimalFirst();
        } else {
          // En espanol forzamos locale explicito para evitar acento ingles.
          trySpeakWithLanguage(0);
        }
      };

      runChunk(0);
      return true;
    } catch (_err) {
      done();
      return false;
    }
  }

  function findPreferredMariaVoice(preferredLang) {
    const voices = window.speechSynthesis.getVoices();
    if (!Array.isArray(voices) || !voices.length) return null;
    const targetPrefix = preferredLang === "en" ? "en" : "es";
    const scopedVoices = voices.filter(function (voice) {
      return String(voice.lang || "").toLowerCase().startsWith(targetPrefix);
    });
    const localScopedVoices = scopedVoices.filter(function (voice) {
      return voice && voice.localService === true;
    });
    const preferred = preferredLang === "en"
      ? ["jenny", "aria", "sara", "zira", "guy", "davis", "mark"]
      : ["sabina", "dalia", "renata", "helena", "sofia", "laura", "lucia", "paulina", "monica"];
    const orderedPools = [localScopedVoices, scopedVoices];

    for (const pool of orderedPools) {
      if (!pool || !pool.length) continue;
      for (const name of preferred) {
        const match = pool.find(function (voice) {
          return String(voice.name || "").toLowerCase().includes(name);
        });
        if (match) return match;
      }
    }

    if (localScopedVoices.length) return localScopedVoices[0];
    if (scopedVoices.length) return scopedVoices[0];

    const defaultVoice = voices.find(function (voice) { return !!voice.default; });
    if (defaultVoice) return defaultVoice;

    return voices[0] || null;
  }

  let isVoiceModalOpen = false;
  let mariaVoicesPrimed = false;
  let pendingAutoSpeechText = "";
  let autoSpeechUnlockBound = false;

  function primeMariaVoices() {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.getVoices();
      if (!mariaVoicesPrimed) {
        window.speechSynthesis.addEventListener("voiceschanged", function () {
          try { window.speechSynthesis.getVoices(); } catch (_err) {}
        }, { once: true });
        mariaVoicesPrimed = true;
      }
    } catch (_err) {}
  }

  function bindAutoSpeechUnlockHandler() {
    if (autoSpeechUnlockBound) return;
    autoSpeechUnlockBound = true;

    const unlockAndReplay = function () {
      autoSpeechUnlockBound = false;
      const replayText = String(pendingAutoSpeechText || "").trim();
      pendingAutoSpeechText = "";
      if (!replayText) return;
      speakAsMaria(replayText, { force: true, skipUnlockFallback: true });
    };

    const opts = { once: true, passive: true };
    document.addEventListener("pointerdown", unlockAndReplay, opts);
    document.addEventListener("touchstart", unlockAndReplay, opts);
    document.addEventListener("keydown", unlockAndReplay, opts);
  }

  function speakAsMaria(text, options) {
    const cfg = options && typeof options === "object" ? options : {};
    const forceSpeak = !!cfg.force;
    const skipUnlockFallback = !!cfg.skipUnlockFallback;
    const preferWeb = !!cfg.preferWeb;
    const nativeFallbackUsed = !!cfg.nativeFallbackUsed;
    const langHint = cfg.langHint === "en" ? "en" : (cfg.langHint === "es" ? "es" : "");
    if (!text) return;
    if (!isVoiceModalOpen && !forceSpeak) return;

    let cleanText = text.replace(/[\p{Emoji}]/gu, "");
    cleanText = cleanText.replace(/\*\*([^*]+)\*\*/g, "$1");
    cleanText = cleanText.replace(/\*([^*]+)\*/g, "$1");
    cleanText = cleanText.replace(/_([^_]+)_/g, "$1");
    cleanText = cleanText.replace(/^- /gm, "");
    cleanText = cleanText.replace(/\n- /g, " ");
    cleanText = cleanText.replace(/[\-—–]/g, " ");
    cleanText = cleanText.replace(/\(([^)]+)\)/g, " $1 ");
    cleanText = cleanText.replace(/\s+/g, " ").trim();
    if (!cleanText) return;
    const preferredLang = langHint || detectPreferredReplyLanguage(cleanText);

    if (!preferWeb && shouldTryNativeTts()) {
      const usedNative = speakNativeAndroidTTS(cleanText, forceSpeak, function () {
        if (nativeFallbackUsed) return;
        speakAsMaria(cleanText, {
          force: forceSpeak,
          skipUnlockFallback: skipUnlockFallback,
          preferWeb: true,
          nativeFallbackUsed: true,
          langHint: preferredLang
        });
      }, preferredLang);
      if (usedNative) {
        return;
      }
    }

    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") {
      if (voiceTranscript) {
        if (shouldTryNativeTts()) {
          voiceTranscript.innerHTML += "<span class='interim'> No pude iniciar la voz nativa en este momento.</span>";
        } else {
          voiceTranscript.innerHTML += "<span class='interim'> Este dispositivo no soporta voz sintetizada.</span>";
        }
        voiceTranscript.scrollTop = voiceTranscript.scrollHeight;
      }
      return;
    }

    primeMariaVoices();
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      try { window.speechSynthesis.cancel(); } catch (_err) {}
    }

    function splitTextForSpeech(value) {
      const normalized = String(value || "").replace(/\s+/g, " ").trim();
      if (!normalized) return [];
      const chunks = [];
      const maxLen = shouldTryNativeTts() ? 95 : 140;
      let remaining = normalized;

      while (remaining.length > maxLen) {
        let cut = Math.max(
          remaining.lastIndexOf(". ", maxLen),
          remaining.lastIndexOf("; ", maxLen),
          remaining.lastIndexOf(", ", maxLen),
          remaining.lastIndexOf(" ", maxLen)
        );
        if (cut < 80) cut = maxLen;
        const piece = remaining.slice(0, cut + 1).trim();
        if (piece) chunks.push(piece);
        remaining = remaining.slice(cut + 1).trim();
      }

      if (remaining) chunks.push(remaining);
      return chunks;
    }

    const speechChunks = splitTextForSpeech(cleanText);
    if (!speechChunks.length) return;

    function runSpeechAttempt(attemptIndex) {
      if (!isVoiceModalOpen && !forceSpeak) return;
      let didStart = false;
      let queueIndex = 0;
      const utterance = new SpeechSynthesisUtterance(speechChunks[queueIndex]);
      const mariaVoice = findPreferredMariaVoice(preferredLang);
      const usePreferredVoice = attemptIndex <= 1;
      if (usePreferredVoice && mariaVoice) {
        utterance.voice = mariaVoice;
      }
      utterance.lang = mariaVoice && mariaVoice.lang
        ? mariaVoice.lang
        : (preferredLang === "en" ? "en-US" : "es-ES");
      utterance.rate = usePreferredVoice ? (shouldTryNativeTts() ? 0.9 : MARIA_VOICE_TUNING.rate) : 1;
      utterance.pitch = usePreferredVoice ? (shouldTryNativeTts() ? 1 : MARIA_VOICE_TUNING.pitch) : 1;
      utterance.volume = MARIA_VOICE_TUNING.volume;
      utterance.onstart = function () {
        didStart = true;
        if (!isVoiceModalOpen && !forceSpeak) return;
        setStartVoiceBtnSpeakingState(true);
      };
      utterance.onerror = function () {
        setStartVoiceBtnSpeakingState(false);
      };
      utterance.onend = function () {
        if ((!isVoiceModalOpen && !forceSpeak) || !didStart) {
          setStartVoiceBtnSpeakingState(false);
          return;
        }

        queueIndex += 1;
        if (queueIndex < speechChunks.length) {
          const nextUtterance = new SpeechSynthesisUtterance(speechChunks[queueIndex]);
          if (usePreferredVoice && mariaVoice) {
            nextUtterance.voice = mariaVoice;
          }
          nextUtterance.lang = utterance.lang;
          nextUtterance.rate = utterance.rate;
          nextUtterance.pitch = utterance.pitch;
          nextUtterance.volume = utterance.volume;
          nextUtterance.onstart = function () {
            didStart = true;
            if (!isVoiceModalOpen && !forceSpeak) return;
            setStartVoiceBtnSpeakingState(true);
          };
          nextUtterance.onend = utterance.onend;
          nextUtterance.onerror = utterance.onerror;
          try {
            if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
              window.speechSynthesis.cancel();
            }
            setTimeout(function () {
              try { window.speechSynthesis.speak(nextUtterance); } catch (_err) { setStartVoiceBtnSpeakingState(false); }
            }, shouldTryNativeTts() ? 130 : 20);
          } catch (_err) {
            setStartVoiceBtnSpeakingState(false);
          }
          return;
        }

        setStartVoiceBtnSpeakingState(false);
        if (isVoiceModalOpen && voiceTranscript) {
          voiceTranscript.innerHTML += "<span class='interim'> Pulsa Iniciar para volver a hablar.</span>";
          voiceTranscript.scrollTop = voiceTranscript.scrollHeight;
        }
      };

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        setTimeout(function () {
          try { window.speechSynthesis.speak(utterance); } catch (_err) { setStartVoiceBtnSpeakingState(false); }
        }, shouldTryNativeTts() ? 130 : 20);
      } catch (_err) {
        setStartVoiceBtnSpeakingState(false);
      }

      setTimeout(function () {
        if (didStart || (!isVoiceModalOpen && !forceSpeak)) return;
        if (attemptIndex < 4) {
          runSpeechAttempt(attemptIndex + 1);
          return;
        }
        if (voiceTranscript) {
          voiceTranscript.innerHTML += "<span class='interim'> No se pudo iniciar el audio automaticamente. Toca la pantalla y la voz se reproducira.</span>";
          voiceTranscript.scrollTop = voiceTranscript.scrollHeight;
        }
        if (!skipUnlockFallback) {
          pendingAutoSpeechText = cleanText;
          bindAutoSpeechUnlockHandler();
        }
        setStartVoiceBtnSpeakingState(false);
      }, shouldTryNativeTts() ? 1800 : 1200);
    }

    setTimeout(function () {
      runSpeechAttempt(0);
    }, 80);
  }

  // ── Modal de voz ────────────────────────────────────────────
  const voiceModal = document.getElementById("voiceModal");
  const closeVoiceModalBtn = document.getElementById("closeVoiceModal");
  const startVoiceBtn = document.getElementById("startVoiceBtn");
  const stopVoiceBtn = document.getElementById("stopVoiceBtn");
  const voiceTranscript = document.getElementById("voiceTranscript");
  const voiceActiveDot = document.getElementById("voiceActiveDot");
  const START_VOICE_BTN_LABEL = startVoiceBtn
    ? String(startVoiceBtn.textContent || "▶ Iniciar").trim()
    : "▶ Iniciar";
  const RECORDING_VOICE_BTN_LABEL = "■ Detener";
  const PROCESSING_VOICE_BTN_LABEL = "⏳ Procesando";
  const SPEAKING_VOICE_BTN_LABEL = "🔊 Reproduciendo";

  let activeRecognition = null;
  let voiceSilenceTimerId = null;
  let voiceRecordingTimerId = null;
  let voiceRecordingStartedAt = 0;
  let voiceSessionActive = false;
  let voiceStopRequested = false;
  let voiceFinalTranscript = "";
  let voiceInterimTranscript = "";
  let voiceRestartTimerId = null;
  let voiceIsListening = false;
  let holdToTalkActive = false;
  let voiceToggleStartAt = 0;
  let voicePlaybackPrimed = false;

  function primeSpeechPlaybackOnGesture() {
    if (voicePlaybackPrimed) return;
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;
    try {
      const primer = new SpeechSynthesisUtterance(".");
      primer.lang = "es-ES";
      primer.rate = 1;
      primer.pitch = 1;
      primer.volume = 0;
      window.speechSynthesis.speak(primer);
      voicePlaybackPrimed = true;
      setTimeout(function () {
        try { window.speechSynthesis.cancel(); } catch (_err) {}
      }, 120);
    } catch (_err) {}
  }

  function formatVoiceDuration(totalSeconds) {
    const safe = Math.max(0, Number(totalSeconds) || 0);
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function clearVoiceRecordingTimer() {
    if (voiceRecordingTimerId) {
      clearInterval(voiceRecordingTimerId);
      voiceRecordingTimerId = null;
    }
    voiceRecordingStartedAt = 0;
  }

  function clearVoiceRestartTimer() {
    if (voiceRestartTimerId) {
      clearTimeout(voiceRestartTimerId);
      voiceRestartTimerId = null;
    }
  }

  function startVoiceRecordingTimer() {
    if (!startVoiceBtn) return;
    clearVoiceRecordingTimer();
    voiceRecordingStartedAt = Date.now();
    startVoiceBtn.textContent = RECORDING_VOICE_BTN_LABEL + " " + formatVoiceDuration(0);
    voiceRecordingTimerId = setInterval(function () {
      if (!startVoiceBtn.classList.contains("is-recording") || !voiceRecordingStartedAt) return;
      const elapsedSeconds = Math.floor((Date.now() - voiceRecordingStartedAt) / 1000);
      startVoiceBtn.textContent = RECORDING_VOICE_BTN_LABEL + " " + formatVoiceDuration(elapsedSeconds);
    }, 250);
  }

  function setStartVoiceBtnRecordingState(isRecording) {
    if (!startVoiceBtn) return;
    if (isRecording) {
      startVoiceBtn.classList.remove("is-processing", "is-speaking");
      startVoiceBtn.classList.add("is-recording");
      startVoiceBtn.setAttribute("aria-label", "Detener grabacion y enviar");
      startVoiceRecordingTimer();
      return;
    }

    clearVoiceRecordingTimer();
    startVoiceBtn.classList.remove("is-recording", "is-processing", "is-speaking");
    startVoiceBtn.textContent = START_VOICE_BTN_LABEL;
    startVoiceBtn.setAttribute("aria-label", "Iniciar grabacion");
  }

  function setStartVoiceBtnProcessingState(isProcessing) {
    if (!startVoiceBtn) return;
    if (isProcessing) {
      startVoiceBtn.classList.remove("is-recording", "is-speaking");
      startVoiceBtn.classList.add("is-processing");
      startVoiceBtn.textContent = PROCESSING_VOICE_BTN_LABEL;
      startVoiceBtn.setAttribute("aria-label", "Procesando respuesta");
      startVoiceBtn.disabled = true;
      return;
    }

    startVoiceBtn.classList.remove("is-processing");
    if (!startVoiceBtn.classList.contains("is-recording") && !startVoiceBtn.classList.contains("is-speaking")) {
      startVoiceBtn.textContent = START_VOICE_BTN_LABEL;
      startVoiceBtn.setAttribute("aria-label", "Iniciar grabacion");
      startVoiceBtn.disabled = false;
    }
  }

  function setStartVoiceBtnSpeakingState(isSpeaking) {
    if (!startVoiceBtn) return;
    if (isSpeaking) {
      startVoiceBtn.classList.remove("is-recording", "is-processing");
      startVoiceBtn.classList.add("is-speaking");
      startVoiceBtn.textContent = SPEAKING_VOICE_BTN_LABEL;
      startVoiceBtn.setAttribute("aria-label", "Reproduciendo respuesta");
      startVoiceBtn.disabled = true;
      return;
    }

    startVoiceBtn.classList.remove("is-speaking");
    if (!startVoiceBtn.classList.contains("is-recording") && !startVoiceBtn.classList.contains("is-processing")) {
      startVoiceBtn.textContent = START_VOICE_BTN_LABEL;
      startVoiceBtn.setAttribute("aria-label", "Iniciar grabacion");
      startVoiceBtn.disabled = false;
    }
  }

  function openVoiceModal() {
    isVoiceModalOpen = true;
    voiceSessionActive = false;
    voiceStopRequested = false;
    voiceFinalTranscript = "";
    voiceInterimTranscript = "";
    voiceIsListening = false;
    clearVoiceRestartTimer();
    if (voiceModal) {
      voiceModal.classList.add("active");
      voiceModal.setAttribute("aria-hidden", "false");
      voiceTranscript.innerHTML = "Pulsa <strong>Iniciar</strong> para comenzar a grabar. Pulsa de nuevo para <strong>detener y enviar</strong>.";
      startVoiceBtn.disabled = false;
      if (stopVoiceBtn) stopVoiceBtn.disabled = false;
      setStartVoiceBtnRecordingState(false);
      setStartVoiceBtnProcessingState(false);
      setStartVoiceBtnSpeakingState(false);
      voiceActiveDot.classList.remove("listening");
    }
  }

  function closeVoiceModal() {
    isVoiceModalOpen = false;
    voiceSessionActive = false;
    voiceStopRequested = false;
    voiceFinalTranscript = "";
    voiceInterimTranscript = "";
    voiceIsListening = false;
    holdToTalkActive = false;
    if (voiceSilenceTimerId) {
      clearTimeout(voiceSilenceTimerId);
      voiceSilenceTimerId = null;
    }
    clearVoiceRestartTimer();
    clearVoiceRecordingTimer();
    if (activeRecognition) {
      try { activeRecognition.stop(); } catch (e) {}
      activeRecognition = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopNativeAndroidTTS();
    if (voiceModal) {
      voiceModal.classList.remove("active");
      voiceModal.setAttribute("aria-hidden", "true");
      setStartVoiceBtnRecordingState(false);
      setStartVoiceBtnProcessingState(false);
      setStartVoiceBtnSpeakingState(false);
      voiceActiveDot.classList.remove("listening");
    }
  }

  function finalizeVoiceCaptureAndSend() {
    const textToSend = (voiceFinalTranscript + " " + voiceInterimTranscript).trim();
    const preferredReplyLang = detectPreferredReplyLanguage(textToSend);
    voiceFinalTranscript = "";
    voiceInterimTranscript = "";

    if (textToSend) {
      voiceTranscript.innerHTML = "<span class='voice-transcript-user'>Tú: " + escapeHtml(textToSend) + "</span><span class='interim'> Maria está procesando tu consulta…</span>";
      setStartVoiceBtnProcessingState(true);
      chatInput.value = textToSend;
      sendMessage({ fromVoiceModal: true, preferredReplyLang: preferredReplyLang }).then(function (assistantText) {
        const cleanAssistantText = String(assistantText || "").trim();
        if (cleanAssistantText && voiceTranscript) {
          voiceTranscript.innerHTML = "<span class='voice-transcript-user'>Tú: " + escapeHtml(textToSend) + "</span><span class='voice-transcript-bot'>Maria: " + escapeHtml(cleanAssistantText) + "</span>";
          voiceTranscript.scrollTop = voiceTranscript.scrollHeight;
        }
      }).finally(function () {
        setStartVoiceBtnProcessingState(false);
      });
    } else if (voiceTranscript) {
      voiceTranscript.innerHTML = "<span class='interim'>No se detectó texto suficiente. Pulsa Iniciar e inténtalo de nuevo.</span>";
    }
  }

  function startVoiceRecognition(options) {
    const cfg = Object.assign({ resume: false }, options || {});
    if (activeRecognition) return;

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      voiceSessionActive = false;
      voiceStopRequested = false;
      voiceIsListening = false;
      setStartVoiceBtnRecordingState(false);
      voiceTranscript.textContent = "Tu navegador no soporta reconocimiento de voz.";
      return;
    }

    clearVoiceRestartTimer();
    primeSpeechPlaybackOnGesture();

    const recognition = new Recognition();
    recognition.lang = "es-ES";
    recognition.continuous = true;
    recognition.interimResults = true;
    voiceSessionActive = true;
    voiceStopRequested = false;
    voiceIsListening = true;
    voiceToggleStartAt = Date.now();
    activeRecognition = recognition;

    setStartVoiceBtnRecordingState(true);
    startVoiceBtn.disabled = false;
    if (stopVoiceBtn) stopVoiceBtn.disabled = false;
    voiceActiveDot.classList.add("listening");
    if (!cfg.resume) {
      voiceFinalTranscript = "";
      voiceInterimTranscript = "";
      voiceTranscript.innerHTML = "<span class='interim'>Grabando… Pulsa de nuevo este botón para detener y enviar.</span>";
    }

    recognition.onresult = function (event) {
      let finalChunk = "";
      let interim = "";
      const startIndex = Number.isInteger(event.resultIndex) ? event.resultIndex : 0;
      // Important: process only new slices; iterating full results on each event duplicates text.
      for (let i = startIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result || !result[0] || typeof result[0].transcript !== "string") continue;
        if (result.isFinal) {
          finalChunk += " " + result[0].transcript;
        } else {
          interim += " " + result[0].transcript;
        }
      }
      if (finalChunk) {
        voiceFinalTranscript = (voiceFinalTranscript + " " + finalChunk).replace(/\s+/g, " ").trim();
      }
      voiceInterimTranscript = interim.replace(/\s+/g, " ").trim();
      voiceTranscript.innerHTML =
        (voiceFinalTranscript ? "<span>" + escapeHtml(voiceFinalTranscript) + "</span>" : "") +
        (voiceInterimTranscript ? "<span class='interim'> " + escapeHtml(voiceInterimTranscript) + "</span>" : "");
      voiceTranscript.scrollTop = voiceTranscript.scrollHeight;
    };

    recognition.onerror = function (event) {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        voiceSessionActive = false;
        voiceStopRequested = false;
        voiceIsListening = false;
        voiceFinalTranscript = "";
        voiceInterimTranscript = "";
        voiceActiveDot.classList.remove("listening");
        setStartVoiceBtnRecordingState(false);
        setStartVoiceBtnProcessingState(false);
        startVoiceBtn.disabled = false;
        if (stopVoiceBtn) stopVoiceBtn.disabled = false;
        voiceTranscript.textContent = "Permiso de micrófono denegado. Habilítalo en tu navegador.";
        return;
      }

      if (voiceSessionActive && !voiceStopRequested) {
        voiceTranscript.innerHTML = "<span class='interim'>Reconectando micrófono... sigue hablando.</span>";
        return;
      }

      if (voiceSilenceTimerId) {
        clearTimeout(voiceSilenceTimerId);
        voiceSilenceTimerId = null;
      }
      voiceActiveDot.classList.remove("listening");
      voiceIsListening = false;
      setStartVoiceBtnRecordingState(false);
      setStartVoiceBtnProcessingState(false);
      startVoiceBtn.disabled = false;
      if (stopVoiceBtn) stopVoiceBtn.disabled = false;
      if (event.error === "no-speech") {
        voiceTranscript.innerHTML = "No se detectó voz. Intenta nuevamente.";
      } else {
        voiceTranscript.textContent = "Error: " + event.error;
      }
    };

    recognition.onend = function () {
      if (voiceSilenceTimerId) {
        clearTimeout(voiceSilenceTimerId);
        voiceSilenceTimerId = null;
      }
      voiceActiveDot.classList.remove("listening");
      voiceIsListening = false;
      setStartVoiceBtnRecordingState(false);
      setStartVoiceBtnProcessingState(false);
      startVoiceBtn.disabled = false;
      if (stopVoiceBtn) stopVoiceBtn.disabled = false;
      activeRecognition = null;

      if (voiceSessionActive && !voiceStopRequested) {
        voiceRestartTimerId = setTimeout(function () {
          if (!voiceSessionActive || voiceStopRequested || activeRecognition || !isVoiceModalOpen) return;
          startVoiceRecognition({ resume: true });
        }, 140);
        return;
      }

      voiceSessionActive = false;
      voiceStopRequested = false;
      finalizeVoiceCaptureAndSend();
    };

    recognition.start();
  }

  function stopVoiceRecognition() {
    if (voiceSilenceTimerId) {
      clearTimeout(voiceSilenceTimerId);
      voiceSilenceTimerId = null;
    }
    clearVoiceRestartTimer();
    clearVoiceRecordingTimer();
    if (activeRecognition) {
      voiceStopRequested = true;
      voiceSessionActive = false;
      voiceIsListening = false;
      try { activeRecognition.stop(); } catch (e) {}
      activeRecognition = null;
    } else {
      if (voiceSessionActive || voiceFinalTranscript || voiceInterimTranscript) {
        voiceStopRequested = true;
        voiceSessionActive = false;
        voiceIsListening = false;
        finalizeVoiceCaptureAndSend();
      } else {
        voiceStopRequested = false;
      }
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    stopNativeAndroidTTS();
    voiceActiveDot.classList.remove("listening");
    setStartVoiceBtnRecordingState(false);
    setStartVoiceBtnProcessingState(false);
    setStartVoiceBtnSpeakingState(false);
    startVoiceBtn.disabled = false;
    if (voiceTranscript && !voiceTranscript.textContent.trim()) {
      voiceTranscript.innerHTML = "<span class='interim'>Grabacion detenida.</span>";
    }
  }

  function startHoldToTalk(options) {
    const cfg = Object.assign({ openModal: false }, options || {});
    if (holdToTalkActive) return;
    holdToTalkActive = true;
    setStartVoiceBtnRecordingState(true);
    if (cfg.openModal && !isVoiceModalOpen) {
      openVoiceModal();
    }
    startVoiceRecognition();
  }

  function stopHoldToTalk() {
    if (!holdToTalkActive) return;
    holdToTalkActive = false;
    stopVoiceRecognition();
  }

  function bindHoldToTalk(button, options) {
    if (!button) return;
    const cfg = Object.assign({ openModal: false }, options || {});

    button.addEventListener("pointerdown", function (event) {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      startHoldToTalk(cfg);
    });

    button.addEventListener("pointerup", function () {
      stopHoldToTalk();
    });

    button.addEventListener("pointercancel", function () {
      stopHoldToTalk();
    });

    button.addEventListener("pointerleave", function () {
      stopHoldToTalk();
    });

    // Soporte teclado: mantener Espacio/Enter para hablar.
    button.addEventListener("keydown", function (event) {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      startHoldToTalk(cfg);
    });

    button.addEventListener("keyup", function (event) {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      stopHoldToTalk();
    });
  }

  if (voiceBtn) voiceBtn.addEventListener("click", openVoiceModal);
  if (closeVoiceModalBtn) closeVoiceModalBtn.addEventListener("click", closeVoiceModal);
  if (stopVoiceBtn) stopVoiceBtn.addEventListener("click", stopVoiceRecognition);
  if (startVoiceBtn) {
    startVoiceBtn.addEventListener("click", function () {
      if (voiceIsListening || activeRecognition) {
        // Android WebView can emit a duplicated tap/click right after start.
        // Ignore ultra-early toggles so stop happens only on a real second click.
        if (voiceToggleStartAt && (Date.now() - voiceToggleStartAt) < 700) {
          return;
        }
        stopVoiceRecognition();
        return;
      }
      startVoiceRecognition();
    });
  }

  if (voiceModal) {
    voiceModal.addEventListener("click", function (e) {
      if (e.target === voiceModal) closeVoiceModal();
    });
  }

  window.addEventListener("beforeunload", persistChatStateNow);
  window.addEventListener("pagehide", persistChatStateNow);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      persistChatStateNow();
    }
  });

  loadConversations();
  updateConversationStartLayout();
  hasRegisteredSession = localStorage.getItem(AUTH_SESSION_ACTIVE_KEY) === "1"
    || !!String(localStorage.getItem("iaJurisUserEmail") || "").trim()
    || !!String(localStorage.getItem("iaJurisUserToken") || "").trim()
    || !!String(localStorage.getItem("iaJurisUserId") || "").trim();
  renderConversationTabs();
  refreshSidebarUserFooter();
  refreshGuestHeaderActions();
  syncProfileFromBackend();

  // Restaurar estado de UI tras F5 / recarga
  try {
    const savedUI = JSON.parse(localStorage.getItem(APP_UI_STATE_KEY) || "null");
    const savedConvId = localStorage.getItem(ACTIVE_CONV_KEY);

    // Si hay sesión registrada activa → siempre restaurar chat directamente
    // Si hay estado guardado de modo invitado → restaurar también
    const shouldRestoreChat = DEVICE.isPhone
      ? false
      : (hasRegisteredSession || (savedUI && savedUI.staticChat));

    if (shouldRestoreChat) {
      if (savedUI && savedUI.guestMode && !hasRegisteredSession) {
        temporaryGuestMode = true;
      }
      if (splashSection) splashSection.style.display = "none";
      if (appShell && chatModal && chatModal.parentElement !== appShell) {
        appShell.appendChild(chatModal);
      }
      chatModal.classList.add("chat-static", "active");
      chatModal.setAttribute("aria-hidden", "false");

      // Guardar estado para próximas recargas
      saveAppUIState({ staticChat: true, guestMode: temporaryGuestMode });

      refreshUserAvatars();
      refreshSidebarUserFooter();
      refreshGuestHeaderActions();

      // Restaurar conversación activa
      const convToLoad = savedConvId
        ? conversations.find(function (c) { return c.id === savedConvId; })
        : conversations[0];
      if (convToLoad) {
        hydrateConversation(convToLoad.id);
      } else {
        startNewConversation();
      }
      chatInput.focus();
    }
  } catch (_) {}

  setConsultationType(currentConsultationType);

  syncCheckoutResultFromURL();
  setTimeout(function () {
    checkAndroidBinaryUpdate();
  }, 1200);
});
