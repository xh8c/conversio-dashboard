(function () {
  const BASE_CONFIG = {
    userId: window.chatbotConfig?.userId || "default",
    apiUrl: window.chatbotConfig?.apiUrl || "http://127.0.0.1:8000",
  };

  async function init() {
    // Fetch live settings from backend
    let remoteSettings = {};
    try {
      const res = await fetch(`${BASE_CONFIG.apiUrl}/settings/${BASE_CONFIG.userId}`);
      remoteSettings = await res.json();
    } catch(e) {
      console.log("Using local config fallback");
    }

    const CONFIG = {
      userId: BASE_CONFIG.userId,
      apiUrl: BASE_CONFIG.apiUrl,
      botName: remoteSettings.botName || window.chatbotConfig?.botName || "Assistant",
      primaryColor: remoteSettings.primaryColor || window.chatbotConfig?.primaryColor || "#6C63FF",
      welcomeMessage: remoteSettings.welcomeMessage || window.chatbotConfig?.welcomeMessage || "Hi! How can I help you today?",
      fallbackMessage: remoteSettings.fallbackMessage || window.chatbotConfig?.fallbackMessage || "I don't have that information, please contact us directly.",
      position: remoteSettings.position || window.chatbotConfig?.position || "bottom-right",
      collectName: remoteSettings.collectName ?? window.chatbotConfig?.collectName ?? true,
      collectEmail: remoteSettings.collectEmail ?? window.chatbotConfig?.collectEmail ?? true,
      logoUrl: remoteSettings.logoUrl || window.chatbotConfig?.logoUrl || "",
    };

    let isOpen = false;
    let leadCaptured = !(CONFIG.collectName || CONFIG.collectEmail);
    let conversationHistory = [];
    let extractedData = { intent: null, budget: null, timeline: null, urgency: "low" };
    let leadData = { name: "", email: "" };

  // Sound system
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new AudioCtx();
    return audioCtx;
  }

function playSound(type) {
    try {
      const ctx = getAudioCtx();

      function softTone(freq, startTime, duration, volume = 0.12, type = "sine") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(startTime); osc.stop(startTime + duration);
      }

      if (type === "send") {
        // Soft upward chime — light and airy
        softTone(700, ctx.currentTime, 0.15, 0.08);
        softTone(1050, ctx.currentTime + 0.06, 0.18, 0.06);

      } else if (type === "receive") {
        // Gentle two-note bell — warm and pleasant
        softTone(660, ctx.currentTime, 0.3, 0.1);
        softTone(880, ctx.currentTime + 0.08, 0.3, 0.08);
        softTone(1100, ctx.currentTime + 0.16, 0.25, 0.05);

      } else if (type === "open") {
        // Soft rising pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.22);

      } else if (type === "click") {
        // Soft tap — barely there but satisfying
        softTone(800, ctx.currentTime, 0.08, 0.07);
        softTone(1200, ctx.currentTime + 0.02, 0.06, 0.04);
      }
    } catch(e) {}
  }
  const pos = CONFIG.position === "bottom-left" ? "left: 28px;" : "right: 28px;";

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  };
  const rgb = hexToRgb(CONFIG.primaryColor);

  const ICONS = {
    chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bot: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="8" width="18" height="13" rx="3" stroke="white" stroke-width="2"/><path d="M8 8V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V8" stroke="white" stroke-width="2"/><circle cx="9" cy="14" r="1.5" fill="white"/><circle cx="15" cy="14" r="1.5" fill="white"/><path d="M9 18H15" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M12 4V2M12 2H10M12 2H14" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  };

  const style = document.createElement("style");
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    #cb-bubble {
      position: fixed; ${pos} bottom: 28px;
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.primaryColor}cc);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(${rgb},0.5), 0 2px 8px rgba(${rgb},0.3);
      z-index: 99999; border: none; outline: none;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
    }
    #cb-bubble:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(${rgb},0.6), 0 4px 12px rgba(${rgb},0.4);
    }
    #cb-bubble-icon, #cb-bubble-close {
      position: absolute; display: flex;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    #cb-bubble-icon { opacity: 1; transform: scale(1) rotate(0deg); }
    #cb-bubble-close { opacity: 0; transform: scale(0.5) rotate(-90deg); }
    #cb-bubble.open #cb-bubble-icon { opacity: 0; transform: scale(0.5) rotate(90deg); }
    #cb-bubble.open #cb-bubble-close { opacity: 1; transform: scale(1) rotate(0deg); }

    #cb-window {
      position: fixed; ${pos} bottom: 100px;
      width: 375px; height: min(600px, calc(100vh - 120px));
      border-radius: 24px;
      display: flex; flex-direction: column;
      z-index: 99998; overflow: hidden;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transform: scale(0.92) translateY(16px);
      opacity: 0; pointer-events: none;
      transform-origin: ${CONFIG.position === "bottom-left" ? "bottom left" : "bottom right"};
      transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    #cb-window.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

    /* ── LIGHT THEME ── */
    #cb-window.theme-light {
      background: #f5f6fa;
      box-shadow: 0 32px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.06);
    }
#cb-window.theme-light #cb-messages {
      background: #e3e6f0;
      background-image: 
        linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    #cb-window.theme-light .cb-msg.bot {
      background: #ffffff;
      color: #1a1a2e;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
    }
    #cb-window.theme-light #cb-input-area { background: #ffffff; border-top: 1px solid rgba(0,0,0,0.07); }
    #cb-window.theme-light #cb-input {
      background: #f0f2f8;
      border: 1.5px solid rgba(0,0,0,0.08);
      color: #1a1a2e;
    }
    #cb-window.theme-light #cb-input:focus { background: #fff; border-color: ${CONFIG.primaryColor}; }
    #cb-window.theme-light #cb-input::placeholder { color: #aab0c4; }
    #cb-window.theme-light .cb-time { color: #aab0c4; }
    #cb-window.theme-light #cb-lead-form { background: #eef0f7; }
    #cb-window.theme-light #cb-lead-title { color: #1a1a2e; }
    #cb-window.theme-light #cb-lead-sub { color: #6b7280; }
    #cb-window.theme-light #cb-lead-form input {
      background: #fff; border: 1.5px solid rgba(0,0,0,0.1); color: #1a1a2e;
    }
    #cb-window.theme-light #cb-footer { background: #ffffff; color: #c0c5d8; border-top: 1px solid rgba(0,0,0,0.06); }
    #cb-window.theme-light #cb-theme-toggle { color: #8892aa; }

    /* ── DARK THEME ── */
    #cb-window.theme-dark {
      background: #13131f;
      box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05);
    }
#cb-window.theme-dark #cb-messages {
      background: #0e0e1a;
      background-image:
        linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
      background-size: 32px 32px;
    }
    #cb-window.theme-dark .cb-msg.bot {
      background: linear-gradient(145deg, #1e1e30, #181828);
      color: #e8eaf6;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    #cb-window.theme-dark #cb-input-area { background: #13131f; border-top: 1px solid rgba(255,255,255,0.06); }
    #cb-window.theme-dark #cb-input {
      background: #1e1e30;
      border: 1.5px solid rgba(255,255,255,0.08);
      color: #e8eaf6;
    }
    #cb-window.theme-dark #cb-input:focus { background: #222236; border-color: ${CONFIG.primaryColor}; }
    #cb-window.theme-dark #cb-input::placeholder { color: #4a4a6a; }
    #cb-window.theme-dark .cb-time { color: #4a4a6a; }
    #cb-window.theme-dark #cb-lead-form { background: #0e0e1a; }
    #cb-window.theme-dark #cb-lead-title { color: #e8eaf6; }
    #cb-window.theme-dark #cb-lead-sub { color: #6b7280; }
    #cb-window.theme-dark #cb-lead-form input {
      background: #1e1e30; border: 1.5px solid rgba(255,255,255,0.08); color: #e8eaf6;
    }
    #cb-window.theme-dark #cb-footer { background: #13131f; color: #2e2e4a; border-top: 1px solid rgba(255,255,255,0.05); }
    #cb-window.theme-dark #cb-theme-toggle { color: #4a4a6a; }

#cb-header {
      padding: 18px 20px;
      background: linear-gradient(135deg, 
        ${CONFIG.primaryColor}ff 0%, 
        ${CONFIG.primaryColor}dd 40%,
        ${CONFIG.primaryColor}aa 100%);
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0; position: relative; overflow: hidden;
      box-shadow: 0 4px 32px rgba(${rgb},0.5), inset 0 1px 0 rgba(255,255,255,0.15);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    #cb-header::before {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
      pointer-events: none;
    }
    #cb-header::before {
      content: ''; position: absolute;
      width: 200px; height: 200px; border-radius: 50%;
      background: rgba(255,255,255,0.06);
      top: -80px; right: -60px; pointer-events: none;
    }
    #cb-header::after {
      content: ''; position: absolute;
      width: 100px; height: 100px; border-radius: 50%;
      background: rgba(255,255,255,0.04);
      bottom: -40px; left: 20px; pointer-events: none;
    }
    #cb-header-avatar {
      width: 40px; height: 40px; border-radius: 12px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #cb-header-info { flex: 1; }
    #cb-header-name { color: white; font-weight: 700; font-size: 15px; letter-spacing: -0.3px; }
    #cb-header-status {
      color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 500;
      display: flex; align-items: center; gap: 5px; margin-top: 2px;
    }
    #cb-status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.4);
      animation: cb-pulse 2s infinite;
    }
    @keyframes cb-pulse {
      0%, 100% { box-shadow: 0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.3); }
      50% { box-shadow: 0 0 12px #4ade80, 0 0 24px rgba(74,222,128,0.5); }
    }
    #cb-theme-toggle {
      background: none; border: none; cursor: pointer;
      padding: 6px; border-radius: 8px;
      transition: all 0.2s; font-size: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    #cb-theme-toggle:hover { background: rgba(255,255,255,0.15); }

    #cb-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 10px;
      scrollbar-width: thin; scrollbar-color: rgba(${rgb},0.2) transparent;
    }
    #cb-messages::-webkit-scrollbar { width: 3px; }
    #cb-messages::-webkit-scrollbar-track { background: transparent; }
    #cb-messages::-webkit-scrollbar-thumb { background: rgba(${rgb},0.3); border-radius: 4px; }

.cb-row { display: flex; align-items: flex-end; gap: 8px; width: 100%; }
    .cb-row.user { justify-content: flex-end; }
    .cb-row.bot { justify-content: flex-start; }

    .cb-bot-icon {
      width: 28px; height: 28px; border-radius: 9px;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.primaryColor}99);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-bottom: 18px;
      box-shadow: 0 4px 12px rgba(${rgb},0.4);
    }
    .cb-bot-icon svg { width: 14px; height: 14px; }

.cb-msg {
      max-width: 78%; padding: 11px 15px;
      font-size: 13px; line-height: 1.6; font-weight: 400;
      word-wrap: break-word; word-break: break-word; overflow-wrap: break-word;
    }
    .cb-msg.bot { border-radius: 18px 18px 18px 4px; }
    .cb-msg.user {
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.primaryColor}dd);
      color: white;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 6px 24px rgba(${rgb},0.45), 0 2px 8px rgba(${rgb},0.3);
    }
    .cb-time {
      font-size: 10px; margin-top: 4px;
      padding: 0 4px; font-weight: 500; letter-spacing: 0.2px;
    }
    .cb-row.user .cb-time { text-align: right; }

    #cb-typing-row { display: flex; align-items: flex-end; gap: 8px; }
    #cb-typing {
      padding: 14px 18px;
      border-radius: 18px 18px 18px 4px;
      display: flex; gap: 5px; align-items: center;
    }
    #cb-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${CONFIG.primaryColor}; opacity: 0.6;
      animation: cb-dot 1.3s infinite ease-in-out;
    }
    #cb-typing span:nth-child(2) { animation-delay: 0.18s; }
    #cb-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes cb-dot {
      0%, 80%, 100% { transform: scale(1) translateY(0); opacity: 0.5; }
      40% { transform: scale(1.3) translateY(-3px); opacity: 1; }
    }

    #cb-lead-form {
      flex: 1; padding: 24px 20px;
      display: flex; flex-direction: column; gap: 12px; justify-content: center;
    }
    #cb-lead-title { font-size: 16px; font-weight: 700; letter-spacing: -0.3px; }
    #cb-lead-sub { font-size: 13px; line-height: 1.5; margin-top: -4px; }
    #cb-lead-form input {
      padding: 12px 14px; border-radius: 12px;
      font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
      outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    }
    #cb-lead-form input::placeholder { color: #6b7280; }
    #cb-lead-form input:focus { box-shadow: 0 0 0 3px rgba(${rgb},0.15); border-color: ${CONFIG.primaryColor} !important; }
    #cb-lead-submit {
      padding: 13px; margin-top: 4px;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.primaryColor}cc);
      color: white; border: none; border-radius: 12px;
      font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 700; cursor: pointer; letter-spacing: -0.2px;
      box-shadow: 0 6px 20px rgba(${rgb},0.4);
      transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    #cb-lead-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(${rgb},0.5); }

    #cb-input-area {
      padding: 12px 14px;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    #cb-input {
      flex: 1; padding: 11px 15px; border-radius: 14px;
      font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif;
      outline: none; transition: all 0.2s; resize: none;
    }
    #cb-send {
      width: 40px; height: 40px; flex-shrink: 0;
      background: linear-gradient(135deg, ${CONFIG.primaryColor}, ${CONFIG.primaryColor}cc);
      border: none; border-radius: 12px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 16px rgba(${rgb},0.45);
    }
    #cb-send:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(${rgb},0.55); }
    #cb-send:active { transform: translateY(0); }

    #cb-footer {
      padding: 8px; text-align: center;
      font-size: 10.5px; letter-spacing: 0.3px; font-weight: 500;
    }
  `;
  document.head.appendChild(style);

  const bubble = document.createElement("div");
  bubble.id = "cb-bubble";
bubble.innerHTML = `<span id="cb-bubble-icon">${ICONS.chat}</span><span id="cb-bubble-close">${ICONS.close}</span>`;

  const hasLead = CONFIG.collectName || CONFIG.collectEmail;
  const win = document.createElement("div");
  win.id = "cb-window";
  win.innerHTML = `
    <div id="cb-header">
      <div id="cb-header-avatar">${CONFIG.logoUrl 
        ? `<img src="${CONFIG.logoUrl}" style="width:26px;height:26px;object-fit:contain;border-radius:6px;" />` 
        : ICONS.bot}</div>
<div id="cb-header-info">
        <div id="cb-header-name">${CONFIG.botName}</div>
        <div id="cb-header-status"><div id="cb-status-dot"></div> Online now</div>
      </div>
      <button id="cb-theme-toggle" title="Toggle theme">🌙</button>
    </div>
    <div id="cb-messages"></div>
    <div id="cb-faq-chips" style="display:none;padding:0 12px 12px;flex-wrap:wrap;gap:6px;"></div>
<div id="cb-input-area" style="display:flex">
      <input id="cb-input" type="text" placeholder="Ask me anything..." />
      <button id="cb-send">${ICONS.send}</button>
    </div>
    <div id="cb-footer">Powered by YourBrand</div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\* (.*$)/gm, '<div style="display:flex;gap:8px;margin:4px 0;align-items:flex-start"><span style="margin-top:5px;width:5px;height:5px;border-radius:50%;background:#818cf8;flex-shrink:0;"></span><span>$1</span></div>')
    .replace(/^- (.*$)/gm, '<div style="display:flex;gap:8px;margin:4px 0;align-items:flex-start"><span style="margin-top:5px;width:5px;height:5px;border-radius:50%;background:#818cf8;flex-shrink:0;"></span><span>$1</span></div>')
    .replace(/^\d+\. (.*$)/gm, (match, p1, offset, str) => {
      const num = match.match(/^(\d+)/)[1];
      return `<div style="display:flex;gap:8px;margin:4px 0;align-items:flex-start"><span style="flex-shrink:0;font-weight:600;font-size:12px;color:#818cf8;min-width:14px">${num}.</span><span>${p1}</span></div>`;
    })
    .replace(/\n\n/g, '<div style="height:10px"></div>')
    .replace(/\n/g, '<br/>');
}

function addMessage(text, sender) {
    const msgs = document.getElementById("cb-messages");
    const lastRow = msgs.lastElementChild;
    const isConsecutiveBot = sender === "bot" && lastRow?.classList.contains("bot");
    const row = document.createElement("div");
    row.className = `cb-row ${sender}`;
    if (sender === "bot") {
      row.innerHTML = `
        <div class="cb-bot-icon" style="${isConsecutiveBot ? 'visibility:hidden' : ''}">${ICONS.bot}</div>
        <div>
          <div class="cb-msg bot">${formatMessage(text)}</div>
          <div class="cb-time">${getTime()}</div>
        </div>`;
    } else {
      row.innerHTML = `
        <div>
          <div class="cb-msg user">${text}</div>
          <div class="cb-time">${getTime()}</div>
        </div>`;
    }
    msgs.appendChild(row);
    msgs.scrollTop = msgs.scrollHeight;
}

function addTyping() {
  const msgs = document.getElementById("cb-messages");
  if (document.getElementById("cb-typing-row")) return;
  const row = document.createElement("div");
  row.id = "cb-typing-row";
  row.style.cssText = "display:flex;align-items:flex-end;gap:8px;padding:4px 0;";
  const bg = theme === "dark" ? "linear-gradient(145deg, #1e1e30, #181828)" : "#ffffff";
  const shadow = theme === "dark" ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.08)";
  row.innerHTML = `
    <div class="cb-bot-icon">${ICONS.bot}</div>
    <div id="cb-typing" style="background:${bg};box-shadow:${shadow};padding:14px 18px;border-radius:18px 18px 18px 4px;display:flex;gap:5px;align-items:center;">
      <span style="width:6px;height:6px;border-radius:50%;background:${CONFIG.primaryColor};opacity:0.6;animation:cb-dot 1.3s infinite ease-in-out;"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:${CONFIG.primaryColor};opacity:0.6;animation:cb-dot 1.3s infinite ease-in-out;animation-delay:0.18s;"></span>
      <span style="width:6px;height:6px;border-radius:50%;background:${CONFIG.primaryColor};opacity:0.6;animation:cb-dot 1.3s infinite ease-in-out;animation-delay:0.36s;"></span>
    </div>`;
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

function removeTyping() {
  document.getElementById("cb-typing-row")?.remove();
}

// Conversational lead capture state
  let leadStep = 0; // 0=not started, 1=asking name, 2=asking email, 3=done

  // Determine what steps we need
  const steps = [];
  if (CONFIG.collectName) steps.push("name");
  if (CONFIG.collectEmail) steps.push("email");

  const stepQuestions = {
    name: "Before we dive in — what's your name? 👋",
    email: (name) => `Nice to meet you${name ? ", " + name : ""}! What's your email so we can follow up if needed?`,
  };

  async function submitLead() {
    try {
      let extracted = { intent: null, budget: null, timeline: null, urgency: "low" };
      if (conversationHistory.length > 0) {
        try {
          const extractRes = await fetch(`${CONFIG.apiUrl}/extract`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: CONFIG.userId,
              question: "",
              conversation_history: conversationHistory,
            }),
          });
          extracted = await extractRes.json();
        } catch(e) {}
      }
      await fetch(`${CONFIG.apiUrl}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: CONFIG.userId,
          name: leadData.name,
          email: leadData.email,
          intent: extracted.intent,
          budget: extracted.budget,
          timeline: extracted.timeline,
          urgency: extracted.urgency || "low",
          conversation: JSON.stringify(conversationHistory),
        }),
      });
    } catch(e) {
      console.log("Lead submit error:", e);
    }
    leadCaptured = true;
    setTimeout(() => renderFAQChips(), 500);
  }

  async function handleLeadStep(input) {
    const currentStep = steps[leadStep];

if (currentStep === "name") {
      // Extract just the name — remove common phrases
      let name = input
        .replace(/hi|hello|hey|my name is|i am|i'm|name is|it's|its/gi, "")
        .replace(/[^a-zA-Z\s]/g, "")
        .trim();
      // Capitalize first letter of each word
      name = name.replace(/\b\w/g, c => c.toUpperCase()).trim();
      if (!name) name = input.trim(); // fallback to raw input
      leadData.name = name;
      leadStep++;
      if (steps[leadStep] === "email") {
        setTimeout(() => addMessage(stepQuestions.email(leadData.name), "bot"), 500);
      } else {
        await submitLead();
        setTimeout(() => addMessage(CONFIG.welcomeMessage, "bot"), 500);
      }
} else if (currentStep === "email") {
      // Extract email using regex
      const emailMatch = input.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) input = emailMatch[0];
      // Basic email validation
      if (!input.includes("@") || !input.includes(".")) {
        setTimeout(() => addMessage("Hmm, that doesn't look like a valid email. Can you double-check it?", "bot"), 400);
        return;
      }
      leadData.email = input;
      leadStep++;
      await submitLead();
      setTimeout(() => addMessage(CONFIG.welcomeMessage, "bot"), 500);
    }
  }

  async function sendMessage() {
    const input = document.getElementById("cb-input");
    const question = input.value.trim();
    if (!question) return;
    input.value = "";
    addMessage(question, "user");
    playSound("send");

    // Hide FAQ chips after first message
    const chips = document.getElementById("cb-faq-chips");
    if (chips) chips.style.display = "none";

    // Handle lead capture flow
    if (!leadCaptured && leadStep < steps.length) {
      await handleLeadStep(question);
      playSound("receive");
      return;
    }

    // Normal chat
    conversationHistory.push({ role: "user", content: question });
    addTyping();
    const typingStart = Date.now();

    try {
      const res = await fetch(`${CONFIG.apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: CONFIG.userId,
          question,
          bot_name: CONFIG.botName,
          fallback_message: CONFIG.fallbackMessage,
          conversation_history: conversationHistory,
        }),
      });
      const data = await res.json();

      const elapsed = Date.now() - typingStart;
      const minTypingTime = 800;
      if (elapsed < minTypingTime) {
        await new Promise(r => setTimeout(r, minTypingTime - elapsed));
      }

      removeTyping();
      addMessage(data.answer, "bot");
      playSound("receive");
      conversationHistory.push({ role: "assistant", content: data.answer });

      // Update lead with latest conversation and extracted data
      if (leadCaptured && leadData.email) {
        fetch(`${CONFIG.apiUrl}/update-lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: CONFIG.userId,
            email: leadData.email,
            conversation_history: conversationHistory,
          }),
        }).catch(() => {});
      }

    } catch {
      removeTyping();
      addMessage("Something went wrong. Please try again.", "bot");
    }
  }

// Theme system
  let theme = localStorage.getItem("cb-theme") || "light";
  function applyTheme(t) {
    win.classList.remove("theme-light", "theme-dark");
    win.classList.add(`theme-${t}`);
    document.getElementById("cb-theme-toggle").textContent = t === "light" ? "🌙" : "☀️";
    // typing bubble theming
    const typing = document.getElementById("cb-typing");
    if (typing) {
      typing.style.background = t === "dark" ? "linear-gradient(145deg, #1e1e30, #181828)" : "#ffffff";
    }
  }
  applyTheme(theme);

  document.getElementById("cb-theme-toggle")?.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    localStorage.setItem("cb-theme", theme);
    applyTheme(theme);
  });

// Render FAQ chips
function renderFAQChips() {
  const container = document.getElementById("cb-faq-chips");
  if (!container || !CONFIG.faqButtons || CONFIG.faqButtons.length === 0) return;
  container.innerHTML = "";
  container.style.display = "flex";
  CONFIG.faqButtons.forEach(label => {
    const btn = document.createElement("button");
    btn.innerText = label;
    btn.style.cssText = `
      padding: 7px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 500;
      cursor: pointer;
      border: 1.5px solid ${CONFIG.primaryColor}44;
      background: ${CONFIG.primaryColor}12;
      color: ${CONFIG.primaryColor};
      transition: all 0.2s;
      white-space: nowrap;
    `;
    btn.onmouseover = () => {
      btn.style.background = CONFIG.primaryColor;
      btn.style.color = "white";
    };
    btn.onmouseleave = () => {
      btn.style.background = `${CONFIG.primaryColor}12`;
      btn.style.color = CONFIG.primaryColor;
    };
    btn.addEventListener("click", () => {
      // Hide chips after click
      container.style.display = "none";
      // Send as message
      const input = document.getElementById("cb-input");
      input.value = label;
      sendMessage();
      playSound("click");
    });
    container.appendChild(btn);
  });
}

bubble.addEventListener("click", () => {
    isOpen = !isOpen;
    win.classList.toggle("open", isOpen);
    bubble.classList.toggle("open", isOpen);
    playSound("open");
    if (isOpen && document.getElementById("cb-messages").children.length === 0) {
      if (steps.length > 0 && !leadCaptured) {
        setTimeout(() => addMessage(stepQuestions[steps[0]], "bot"), 300);
      } else {
        setTimeout(() => {
          addMessage(CONFIG.welcomeMessage, "bot");
          setTimeout(() => renderFAQChips(), 400);
        }, 300);
      }
    }
  });

  document.getElementById("cb-send")?.addEventListener("click", sendMessage);
  document.getElementById("cb-input")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

 } // end init()
  init();
})();