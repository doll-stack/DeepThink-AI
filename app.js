/**
 * DeepThink / ThinkAi - Main Application Controller
 * Handles conversation state, Markdown & code block parsing, UI events,
 * reasoning display, and storage persistence.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // App State
  // ==========================================
  const state = {
    threads: [],
    currentThreadId: null,
    isGenerating: false,
    activeAbortController: null,
    attachedFile: null,
    settings: {
      brand: 'DeepThink', // 'DeepThink' or 'ThinkAi'
      theme: 'dark',
      backendMode: 'demo',
      apiKey: '',
      apiEndpoint: '',
      reasoningSteps: 4,
      deepThinkEnabled: true,
      webSearchEnabled: false,
      codeModeEnabled: false,
      activeModel: 'deepthink-r1'
    }
  };

  // ==========================================
  // DOM Elements
  // ==========================================
  const elements = {
    // Layout
    appLayout: document.getElementById('appLayout'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),

    // Branding & Header
    brandTitle: document.getElementById('brandTitle'),
    welcomeBrand: document.getElementById('welcomeBrand'),
    disclaimerBotName: document.getElementById('disclaimerBotName'),
    activeModelLabel: document.getElementById('activeModelLabel'),
    activeModeLabel: document.getElementById('activeModeLabel'),
    modelSelect: document.getElementById('modelSelect'),
    currentThreadTitle: document.getElementById('currentThreadTitle'),
    exportChatBtn: document.getElementById('exportChatBtn'),

    // History & Search
    newChatBtn: document.getElementById('newChatBtn'),
    chatSearchInput: document.getElementById('chatSearchInput'),
    historyList: document.getElementById('historyList'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    settingsBtn: document.getElementById('settingsBtn'),

    // Main Stream
    chatScrollContainer: document.getElementById('chatScrollContainer'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messagesList: document.getElementById('messagesList'),
    starterCards: document.querySelectorAll('.starter-card'),

    // Pills
    deepThinkToggle: document.getElementById('deepThinkToggle'),
    webSearchToggle: document.getElementById('webSearchToggle'),
    codeModeToggle: document.getElementById('codeModeToggle'),

    // Composer
    composerForm: document.getElementById('composerForm'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    stopGenerationBtn: document.getElementById('stopGenerationBtn'),
    fileUpload: document.getElementById('fileUpload'),
    attachmentPreviewBar: document.getElementById('attachmentPreviewBar'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    botBrandSelector: document.getElementById('botBrandSelector'),
    backendModeSelector: document.getElementById('backendModeSelector'),
    apiConfigSection: document.getElementById('apiConfigSection'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiEndpointInput: document.getElementById('apiEndpointInput'),
    reasoningEffortSlider: document.getElementById('reasoningEffortSlider'),
    reasoningEffortVal: document.getElementById('reasoningEffortVal'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  // ==========================================
  // Initialization
  // ==========================================
  function init() {
    loadSettings();
    applySettings();
    loadThreads();

    if (state.threads.length > 0) {
      switchThread(state.threads[0].id);
    } else {
      createNewThread();
    }

    bindEvents();
    renderHistory();
  }

  // ==========================================
  // Settings & Storage
  // ==========================================
  function loadSettings() {
    try {
      const saved = localStorage.getItem('deepthink_settings');
      if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read settings from localStorage', e);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('deepthink_settings', JSON.stringify(state.settings));
    } catch (e) {
      console.warn('Could not persist settings', e);
    }
  }

  function applySettings() {
    // Theme
    document.documentElement.setAttribute('data-theme', state.settings.theme);

    // Branding
    const brand = state.settings.brand || 'DeepThink';
    elements.brandTitle.textContent = brand;
    if (elements.welcomeBrand) elements.welcomeBrand.textContent = brand;
    if (elements.disclaimerBotName) elements.disclaimerBotName.textContent = brand;
    elements.botBrandSelector.value = brand;

    // Backend
    elements.backendModeSelector.value = state.settings.backendMode;
    elements.apiConfigSection.style.display = state.settings.backendMode !== 'demo' ? 'flex' : 'none';
    elements.apiKeyInput.value = state.settings.apiKey || '';
    elements.apiEndpointInput.value = state.settings.apiEndpoint || '';

    // Reasoning slider
    elements.reasoningEffortSlider.value = state.settings.reasoningSteps;
    elements.reasoningEffortVal.textContent = `${state.settings.reasoningSteps} Steps`;

    // Active Model
    elements.modelSelect.value = state.settings.activeModel;
    updateModelBadge();

    // Toggle buttons
    elements.deepThinkToggle.classList.toggle('active', state.settings.deepThinkEnabled);
    elements.webSearchToggle.classList.toggle('active', state.settings.webSearchEnabled);
    elements.codeModeToggle.classList.toggle('active', state.settings.codeModeEnabled);
  }

  function updateModelBadge() {
    const model = elements.modelSelect.value;
    const modelNames = {
      'deepthink-r1': `${state.settings.brand}-R1`,
      'thinkai-pro': `${state.settings.brand}-Pro`,
      'thinkai-fast': `${state.settings.brand}-Fast`
    };
    elements.activeModelLabel.textContent = modelNames[model] || model;
    elements.activeModeLabel.textContent = state.settings.deepThinkEnabled ? 'Reasoning: Active' : 'Standard Mode';
  }

  // ==========================================
  // Thread & History Management
  // ==========================================
  function loadThreads() {
    try {
      const saved = localStorage.getItem('deepthink_threads');
      if (saved) {
        state.threads = JSON.parse(saved);
      }
    } catch (e) {
      state.threads = [];
    }
  }

  function saveThreads() {
    try {
      localStorage.setItem('deepthink_threads', JSON.stringify(state.threads));
    } catch (e) {
      console.warn('Failed to save threads', e);
    }
  }

  function createNewThread() {
    const newThread = {
      id: 'thread_' + Date.now(),
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: []
    };
    state.threads.unshift(newThread);
    state.currentThreadId = newThread.id;
    saveThreads();
    renderHistory();
    renderCurrentThread();
    closeMobileSidebar();
    elements.messageInput.focus();
  }

  function switchThread(threadId) {
    if (state.isGenerating) {
      showToast('Please wait for current answer to finish or stop generation', 'warning');
      return;
    }
    state.currentThreadId = threadId;
    renderHistory();
    renderCurrentThread();
    closeMobileSidebar();
  }

  function deleteThread(threadId, e) {
    e.stopPropagation();
    state.threads = state.threads.filter(t => t.id !== threadId);
    saveThreads();

    if (state.currentThreadId === threadId) {
      if (state.threads.length > 0) {
        switchThread(state.threads[0].id);
      } else {
        createNewThread();
      }
    } else {
      renderHistory();
    }
    showToast('Conversation deleted', 'info');
  }

  function getCurrentThread() {
    return state.threads.find(t => t.id === state.currentThreadId);
  }

  function renderHistory() {
    const filter = elements.chatSearchInput.value.toLowerCase().trim();
    elements.historyList.innerHTML = '';

    const filtered = state.threads.filter(t => t.title.toLowerCase().includes(filter));

    if (filtered.length === 0) {
      elements.historyList.innerHTML = `<div style="padding: 16px 8px; color: var(--text-muted); font-size: 0.8rem; text-align: center;">No threads found</div>`;
      return;
    }

    filtered.forEach(thread => {
      const item = document.createElement('div');
      item.className = `history-item ${thread.id === state.currentThreadId ? 'active' : ''}`;
      item.innerHTML = `
        <span class="history-item-title">${escapeHtml(thread.title)}</span>
        <div class="history-item-actions">
          <button class="history-action-btn delete-btn" title="Delete conversation" aria-label="Delete">
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;

      item.addEventListener('click', () => switchThread(thread.id));
      const delBtn = item.querySelector('.delete-btn');
      delBtn.addEventListener('click', (e) => deleteThread(thread.id, e));

      elements.historyList.appendChild(item);
    });
  }

  function renderCurrentThread() {
    const thread = getCurrentThread();
    if (!thread) return;

    elements.currentThreadTitle.textContent = thread.title;

    if (!thread.messages || thread.messages.length === 0) {
      elements.welcomeScreen.style.display = 'flex';
      elements.messagesList.innerHTML = '';
    } else {
      elements.welcomeScreen.style.display = 'none';
      elements.messagesList.innerHTML = '';
      thread.messages.forEach(msg => {
        elements.messagesList.appendChild(createMessageElement(msg));
      });
      scrollToBottom();
    }
  }

  // ==========================================
  // Message UI Generation & Markdown Parser
  // ==========================================
  function createMessageElement(msg) {
    const row = document.createElement('div');
    row.className = `message-row ${msg.role}`;
    row.dataset.msgId = msg.id;

    if (msg.role === 'user') {
      row.innerHTML = `
        <div class="message-avatar">U</div>
        <div class="message-content-wrapper">
          <div class="user-bubble">${escapeHtml(msg.content)}</div>
        </div>
      `;
    } else {
      // Assistant message with Reasoning & Content
      let thoughtHtml = '';
      if (msg.thinking && msg.thinking.steps && msg.thinking.steps.length > 0) {
        const timeBadge = msg.thinking.time ? `Thought for ${msg.thinking.time}s` : 'Thinking...';
        const stepsHtml = msg.thinking.steps.map(s => `
          <div class="thought-step">
            <span class="thought-step-icon">⚡</span>
            <span>${escapeHtml(s)}</span>
          </div>
        `).join('');

        thoughtHtml = `
          <div class="thought-container expanded">
            <div class="thought-header">
              <div class="thought-title-wrapper">
                <span>🧠</span>
                <span class="thought-status-label">${timeBadge}</span>
              </div>
              <svg class="thought-chevron" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div class="thought-body">${stepsHtml}</div>
          </div>
        `;
      }

      const formattedContent = parseMarkdown(msg.content);

      row.innerHTML = `
        <div class="message-avatar">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2a9 9 0 0 1 9 9c0 3.1-1.5 5.7-4 7.2V20a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1.8C4.5 16.7 3 14.1 3 11a9 9 0 0 1 9-9z"></path></svg>
        </div>
        <div class="message-content-wrapper">
          ${thoughtHtml}
          <div class="assistant-bubble">${formattedContent}</div>
          <div class="message-actions-bar">
            <button class="msg-tool-btn copy-msg-btn" title="Copy response">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
            <button class="msg-tool-btn speak-msg-btn" title="Read aloud">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
              <span>Speak</span>
            </button>
            <button class="msg-tool-btn regen-msg-btn" title="Regenerate response">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              <span>Retry</span>
            </button>
          </div>
        </div>
      `;

      // Setup Accordion Toggle
      const thoughtContainer = row.querySelector('.thought-container');
      if (thoughtContainer) {
        const header = thoughtContainer.querySelector('.thought-header');
        header.addEventListener('click', () => {
          thoughtContainer.classList.toggle('expanded');
        });
      }

      // Wire action buttons
      wireMessageActionButtons(row, msg);
    }

    return row;
  }

  function wireMessageActionButtons(row, msg) {
    // Copy entire response
    const copyBtn = row.querySelector('.copy-msg-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(msg.content);
        showToast('Response copied to clipboard!', 'success');
      });
    }

    // Speak response
    const speakBtn = row.querySelector('.speak-msg-btn');
    if (speakBtn) {
      speakBtn.addEventListener('click', () => {
        if ('speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            showToast('Speech stopped', 'info');
          } else {
            // Strip markdown formatting for voice
            const cleanText = msg.content.replace(/[#*`_~]/g, '');
            const utterance = new SpeechSynthesisUtterance(cleanText);
            window.speechSynthesis.speak(utterance);
            showToast('Reading response aloud...', 'info');
          }
        } else {
          showToast('Speech synthesis not supported in this browser', 'warning');
        }
      });
    }

    // Regenerate response
    const regenBtn = row.querySelector('.regen-msg-btn');
    if (regenBtn) {
      regenBtn.addEventListener('click', () => {
        const thread = getCurrentThread();
        if (!thread || state.isGenerating) return;

        // Find last user prompt
        const userMessages = thread.messages.filter(m => m.role === 'user');
        if (userMessages.length > 0) {
          const lastUserMsg = userMessages[userMessages.length - 1];
          // Remove last assistant message
          thread.messages = thread.messages.filter(m => m.id !== msg.id);
          saveThreads();
          renderCurrentThread();
          executePrompt(lastUserMsg.content, true);
        }
      });
    }

    // Code blocks copy buttons
    row.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeWrapper = btn.closest('.code-block-wrapper');
        const code = codeWrapper.querySelector('pre code').innerText;
        navigator.clipboard.writeText(code);
        btn.classList.add('copied');
        btn.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2.5" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>Copied!</span>
        `;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy</span>
          `;
        }, 2000);
      });
    });
  }

  /**
   * Lightweight robust Markdown parser for headings, lists, bold, inline code, and code blocks
   */
  function parseMarkdown(text) {
    if (!text) return '';

    // First handle fenced code blocks: ```lang ... ```
    const codeBlocks = [];
    let processed = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      const cleanLang = lang.trim() || 'code';
      const blockHtml = `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span>${escapeHtml(cleanLang)}</span>
            <button class="copy-code-btn" title="Copy snippet">
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre><code>${escapeHtml(code.trim())}</code></pre>
        </div>
      `;
      codeBlocks.push(blockHtml);
      return id;
    });

    // Escape HTML outside code blocks
    processed = escapeHtml(processed);

    // Headings
    processed = processed.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    processed = processed.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    processed = processed.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Horizontal rule
    processed = processed.replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid var(--border-subtle); margin: 16px 0;">');

    // Bold & Italic
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Unordered lists
    processed = processed.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Blockquote
    processed = processed.replace(/^\>\s+(.*)$/gim, '<blockquote style="border-left: 3px solid var(--primary); padding-left: 12px; margin: 8px 0; color: var(--text-secondary);">$1</blockquote>');

    // Paragraphs
    processed = processed.split('\n\n').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<li') || trimmed.startsWith('<block') || trimmed.startsWith('__CODE_BLOCK_') || trimmed.startsWith('<hr')) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    // Restore Code Blocks
    codeBlocks.forEach((block, index) => {
      processed = processed.replace(`__CODE_BLOCK_${index}__`, block);
    });

    return processed;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function scrollToBottom() {
    elements.chatScrollContainer.scrollTop = elements.chatScrollContainer.scrollHeight;
  }

  // ==========================================
  // Execution & Streaming Controller
  // ==========================================
  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (state.isGenerating) return;

    let content = elements.messageInput.value.trim();
    if (!content && !state.attachedFile) return;

    if (state.attachedFile) {
      content = `[Attached File: ${state.attachedFile.name}]\n${state.attachedFile.content}\n\n${content}`;
      clearAttachment();
    }

    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';

    await executePrompt(content);
  }

  async function executePrompt(promptText, isRetry = false) {
    let thread = getCurrentThread();
    if (!thread) {
      createNewThread();
      thread = getCurrentThread();
    }

    // Hide welcome screen
    elements.welcomeScreen.style.display = 'none';

    // Add User Message if not retry
    if (!isRetry) {
      const userMsg = {
        id: 'msg_' + Date.now(),
        role: 'user',
        content: promptText,
        timestamp: new Date().toISOString()
      };
      thread.messages.push(userMsg);

      // Auto-name thread from first user prompt
      if (thread.messages.filter(m => m.role === 'user').length === 1) {
        const title = promptText.slice(0, 38).trim() + (promptText.length > 38 ? '...' : '');
        thread.title = title;
        elements.currentThreadTitle.textContent = title;
      }
      saveThreads();
      renderHistory();
      elements.messagesList.appendChild(createMessageElement(userMsg));
      scrollToBottom();
    }

    // Create Assistant Message Placeholder
    const assistantMsg = {
      id: 'msg_' + (Date.now() + 1),
      role: 'assistant',
      content: '',
      thinking: {
        time: null,
        steps: []
      },
      timestamp: new Date().toISOString()
    };
    thread.messages.push(assistantMsg);

    // Render placeholder row
    const assistantRow = createMessageElement(assistantMsg);
    elements.messagesList.appendChild(assistantRow);
    scrollToBottom();

    // Prepare Streaming State
    state.isGenerating = true;
    state.activeAbortController = new AbortController();
    elements.sendBtn.style.display = 'none';
    elements.stopGenerationBtn.style.display = 'flex';

    const thoughtContainer = assistantRow.querySelector('.thought-container');
    const thoughtBody = thoughtContainer?.querySelector('.thought-body');
    const thoughtTimer = thoughtContainer?.querySelector('.thought-status-label');
    const bubbleEl = assistantRow.querySelector('.assistant-bubble');

    let accumulatedContent = '';

    try {
      await window.apiService.streamChat({
        prompt: promptText,
        mode: elements.modelSelect.value,
        branding: state.settings.brand,
        isThinkingActive: state.settings.deepThinkEnabled,
        reasoningStepsCount: state.settings.reasoningSteps,
        backendMode: state.settings.backendMode,
        apiKey: state.settings.apiKey,
        apiEndpoint: state.settings.apiEndpoint,
        signal: state.activeAbortController.signal,

        onThoughtStep: (stepText, stepIdx, total) => {
          if (!thoughtContainer) return;
          assistantMsg.thinking.steps.push(stepText);
          if (thoughtBody) {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'thought-step';
            stepDiv.innerHTML = `<span class="thought-step-icon">⚡</span><span>${escapeHtml(stepText)}</span>`;
            thoughtBody.appendChild(stepDiv);
          }
          if (thoughtTimer) {
            thoughtTimer.textContent = `Thinking (Step ${stepIdx}/${total})...`;
          }
          scrollToBottom();
        },

        onThoughtDone: (totalSeconds) => {
          assistantMsg.thinking.time = totalSeconds;
          if (thoughtTimer) {
            thoughtTimer.textContent = `Thought for ${totalSeconds}s`;
          }
        },

        onChunk: (chunk) => {
          accumulatedContent += chunk;
          assistantMsg.content = accumulatedContent;
          bubbleEl.innerHTML = parseMarkdown(accumulatedContent) + `<span class="streaming-cursor"></span>`;
          scrollToBottom();
        }
      });

      // Done streaming
      bubbleEl.innerHTML = parseMarkdown(accumulatedContent);
      saveThreads();
      wireMessageActionButtons(assistantRow, assistantMsg);
    } catch (err) {
      if (err.name === 'AbortError') {
        accumulatedContent += '\n\n*(Generation stopped by user)*';
        assistantMsg.content = accumulatedContent;
        bubbleEl.innerHTML = parseMarkdown(accumulatedContent);
        showToast('Generation cancelled', 'info');
      } else {
        accumulatedContent += `\n\n**Error:** ${err.message}`;
        assistantMsg.content = accumulatedContent;
        bubbleEl.innerHTML = parseMarkdown(accumulatedContent);
        showToast('Error generating response: ' + err.message, 'error');
      }
      saveThreads();
    } finally {
      state.isGenerating = false;
      state.activeAbortController = null;
      elements.sendBtn.style.display = 'flex';
      elements.stopGenerationBtn.style.display = 'none';
      scrollToBottom();
    }
  }

  function stopGeneration() {
    if (state.activeAbortController) {
      state.activeAbortController.abort();
    }
  }

  // ==========================================
  // Attachments Handling
  // ==========================================
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      state.attachedFile = {
        name: file.name,
        content: event.target.result
      };
      renderAttachmentPreview();
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function renderAttachmentPreview() {
    if (!state.attachedFile) {
      elements.attachmentPreviewBar.style.display = 'none';
      elements.attachmentPreviewBar.innerHTML = '';
      return;
    }

    elements.attachmentPreviewBar.style.display = 'flex';
    elements.attachmentPreviewBar.innerHTML = `
      <div class="attachment-chip">
        <span>📎</span>
        <span>${escapeHtml(state.attachedFile.name)}</span>
        <button type="button" id="removeAttachmentBtn" title="Remove attachment">✕</button>
      </div>
    `;

    document.getElementById('removeAttachmentBtn').addEventListener('click', clearAttachment);
  }

  function clearAttachment() {
    state.attachedFile = null;
    renderAttachmentPreview();
  }

  // ==========================================
  // Export Chat
  // ==========================================
  function exportChat() {
    const thread = getCurrentThread();
    if (!thread || !thread.messages || thread.messages.length === 0) {
      showToast('No messages to export', 'warning');
      return;
    }

    let markdown = `# ${thread.title}\n`;
    markdown += `*Exported from ${state.settings.brand} on ${new Date().toLocaleString()}*\n\n---\n\n`;

    thread.messages.forEach(msg => {
      const sender = msg.role === 'user' ? 'User' : state.settings.brand;
      markdown += `### ${sender}\n\n`;
      if (msg.thinking && msg.thinking.steps && msg.thinking.steps.length > 0) {
        markdown += `> **Thought Process (${msg.thinking.time || 'N/A'}s):**\n`;
        msg.thinking.steps.forEach(s => {
          markdown += `> - ${s}\n`;
        });
        markdown += '\n';
      }
      markdown += `${msg.content}\n\n---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${thread.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('Conversation exported to Markdown!', 'success');
  }

  // ==========================================
  // Toast System
  // ==========================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : (type === 'error' ? '⚠' : 'ℹ');
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;

    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // ==========================================
  // UI Event Bindings
  // ==========================================
  function bindEvents() {
    // Mobile Sidebar
    elements.openSidebarBtn.addEventListener('click', () => {
      elements.sidebar.classList.add('open');
      elements.sidebarOverlay.classList.add('active');
    });

    elements.closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    function closeMobileSidebar() {
      elements.sidebar.classList.remove('open');
      elements.sidebarOverlay.classList.remove('active');
    }

    // New Chat
    elements.newChatBtn.addEventListener('click', createNewThread);

    // Search input
    elements.chatSearchInput.addEventListener('input', renderHistory);

    // Clear All History
    elements.clearAllBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all conversations?')) {
        state.threads = [];
        saveThreads();
        createNewThread();
        showToast('All chat history cleared', 'info');
      }
    });

    // Theme toggle
    elements.themeToggleBtn.addEventListener('click', () => {
      state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.settings.theme);
      saveSettings();
      showToast(`Switched to ${state.settings.theme} theme`, 'info');
    });

    // Model Selector
    elements.modelSelect.addEventListener('change', (e) => {
      state.settings.activeModel = e.target.value;
      updateModelBadge();
      saveSettings();
      showToast(`Active model: ${elements.modelSelect.options[elements.modelSelect.selectedIndex].text}`, 'info');
    });

    // Export Chat
    elements.exportChatBtn.addEventListener('click', exportChat);

    // Starter cards
    elements.starterCards.forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.dataset.prompt;
        elements.messageInput.value = prompt;
        handleSubmit();
      });
    });

    // Toggle Pills
    elements.deepThinkToggle.addEventListener('click', () => {
      state.settings.deepThinkEnabled = !state.settings.deepThinkEnabled;
      elements.deepThinkToggle.classList.toggle('active', state.settings.deepThinkEnabled);
      updateModelBadge();
      saveSettings();
      showToast(`Deep Reasoning: ${state.settings.deepThinkEnabled ? 'Enabled' : 'Disabled'}`, 'info');
    });

    elements.webSearchToggle.addEventListener('click', () => {
      state.settings.webSearchEnabled = !state.settings.webSearchEnabled;
      elements.webSearchToggle.classList.toggle('active', state.settings.webSearchEnabled);
      saveSettings();
      showToast(`Web Search: ${state.settings.webSearchEnabled ? 'Active' : 'Off'}`, 'info');
    });

    elements.codeModeToggle.addEventListener('click', () => {
      state.settings.codeModeEnabled = !state.settings.codeModeEnabled;
      elements.codeModeToggle.classList.toggle('active', state.settings.codeModeEnabled);
      saveSettings();
      showToast(`Code Precision: ${state.settings.codeModeEnabled ? 'Active' : 'Off'}`, 'info');
    });

    // Composer Form & Auto-growing textarea
    elements.composerForm.addEventListener('submit', handleSubmit);

    elements.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    });

    elements.messageInput.addEventListener('input', () => {
      elements.messageInput.style.height = 'auto';
      elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 180) + 'px';
    });

    // Stop Generation
    elements.stopGenerationBtn.addEventListener('click', stopGeneration);

    // File upload
    elements.fileUpload.addEventListener('change', handleFileUpload);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        createNewThread();
      }
      if (e.key === 'Escape') {
        closeMobileSidebar();
        if (elements.settingsModal.open) elements.settingsModal.close();
      }
    });

    // Settings Modal
    elements.settingsBtn.addEventListener('click', () => {
      elements.settingsModal.showModal();
    });

    elements.closeSettingsBtn.addEventListener('click', () => elements.settingsModal.close());
    elements.cancelSettingsBtn.addEventListener('click', () => elements.settingsModal.close());

    elements.backendModeSelector.addEventListener('change', (e) => {
      elements.apiConfigSection.style.display = e.target.value !== 'demo' ? 'flex' : 'none';
    });

    elements.reasoningEffortSlider.addEventListener('input', (e) => {
      elements.reasoningEffortVal.textContent = `${e.target.value} Steps`;
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
      state.settings.brand = elements.botBrandSelector.value;
      state.settings.backendMode = elements.backendModeSelector.value;
      state.settings.apiKey = elements.apiKeyInput.value.trim();
      state.settings.apiEndpoint = elements.apiEndpointInput.value.trim();
      state.settings.reasoningSteps = parseInt(elements.reasoningEffortSlider.value, 10);

      applySettings();
      saveSettings();
      elements.settingsModal.close();
      showToast('Settings saved successfully', 'success');
    });
  }

  // Start app
  init();
});
