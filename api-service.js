/**
 * DeepThink / ThinkAi - Core API Service & Reasoning Engine
 * Handles reasoning simulator, OpenAI/DeepSeek API, and Google Gemini API with streaming.
 */

class ApiService {
  constructor() {
    this.currentAbortController = null;
  }

  /**
   * Main entry point to send chat message and receive streaming response
   */
  async streamChat({
    prompt,
    mode = 'deepthink-r1',
    branding = 'DeepThink',
    isThinkingActive = true,
    reasoningStepsCount = 4,
    backendMode = 'demo',
    apiKey = '',
    apiEndpoint = '',
    onThoughtStep,
    onThoughtDone,
    onChunk,
    signal
  }) {
    if (backendMode === 'openai' && apiKey) {
      return this._streamOpenAi({ prompt, mode, apiKey, apiEndpoint, onThoughtStep, onThoughtDone, onChunk, signal });
    } else if (backendMode === 'gemini' && apiKey) {
      return this._streamGemini({ prompt, apiKey, onThoughtStep, onThoughtDone, onChunk, signal });
    } else {
      // Default: Deep Reasoning Interactive Simulator
      return this._simulateReasoning({ prompt, mode, branding, isThinkingActive, reasoningStepsCount, onThoughtStep, onThoughtDone, onChunk, signal });
    }
  }

  /**
   * Intelligent Reasoning Simulator for instant out-of-the-box experience
   */
  async _simulateReasoning({ prompt, mode, branding, isThinkingActive, reasoningStepsCount, onThoughtStep, onThoughtDone, onChunk, signal }) {
    const startTime = Date.now();
    const query = prompt.toLowerCase();

    // Generate context-aware thinking steps
    if (isThinkingActive) {
      const thinkingSteps = this._generateThinkingSteps(query, reasoningStepsCount, branding);
      for (let i = 0; i < thinkingSteps.length; i++) {
        if (signal?.aborted) return;
        await this._delay(300 + Math.random() * 250);
        if (signal?.aborted) return;
        onThoughtStep?.(thinkingSteps[i], i + 1, thinkingSteps.length);
      }
      const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
      onThoughtDone?.(elapsedSeconds);
    }

    // Generate context-aware response text
    const fullResponse = this._generateIntelligentResponse(prompt, branding, mode);

    // Stream response chunk by chunk (simulate typewriter effect)
    const chunkSize = 3;
    for (let i = 0; i < fullResponse.length; i += chunkSize) {
      if (signal?.aborted) return;
      const chunk = fullResponse.slice(i, i + chunkSize);
      onChunk?.(chunk);
      // Small realistic pause
      await this._delay(12);
    }
  }

  /**
   * Generate chain-of-thought reasoning steps based on prompt content
   */
  _generateThinkingSteps(query, count, branding) {
    let specificSteps = [];

    if (query.includes('quantum') || query.includes('physics')) {
      specificSteps = [
        `Analyzing quantum state representations and Hilbert space fundamentals...`,
        `Translating superposition and entanglement into accessible mental models...`,
        `Formulating simplified Python vector simulation using NumPy principles...`,
        `Verifying decoherence explanations and mathematical analogies for clarity.`
      ];
    } else if (query.includes('fastapi') || query.includes('api') || query.includes('auth') || query.includes('backend') || query.includes('python')) {
      specificSteps = [
        `Parsing backend architectural requirements for secure auth service...`,
        `Selecting modern cryptographic primitives (PassLib/Bcrypt + PyJWT with HS256)...`,
        `Structuring OAuth2PasswordBearer flow with dependency injection and error handling...`,
        `Refining endpoint handlers for registration, token generation, and protected routes.`
      ];
    } else if (query.includes('riddle') || query.includes('puzzle') || query.includes('logic') || query.includes('gods')) {
      specificSteps = [
        `Deconstructing truth-table permutations and boolean logic constraints...`,
        `Analyzing embedded counterfactual questions ("If I asked you X, would you say 'da'")...`,
        `Mapping question 1 to isolate Random, question 2 to identify True/False, question 3 for remaining...`,
        `Validating solution against edge-case dialect ambiguities.`
      ];
    } else if (query.includes('react') || query.includes('render') || query.includes('optimize') || query.includes('performance')) {
      specificSteps = [
        `Profiling React fiber reconciliation overhead and unneeded re-render passes...`,
        `Isolating expensive computations for useMemo and callback stabilization via useCallback...`,
        `Evaluating windowing/virtualization techniques (react-window/virtualizer)...`,
        `Validating memory overhead against component lifecycle benchmarks.`
      ];
    } else if (query.includes('code') || query.includes('function') || query.includes('bug') || query.includes('algorithm')) {
      specificSteps = [
        `Dissecting algorithm time complexity O(N) and auxiliary space bounds...`,
        `Identifying boundary conditions, null inputs, and integer overflow checks...`,
        `Constructing idiomatic, clean-architecture code with robust typing...`,
        `Executing static analysis check and verifying sample execution.`
      ];
    } else {
      specificSteps = [
        `Decomposing user prompt into core semantic components and constraints...`,
        `Retrieving multi-disciplinary contextual knowledge base for "${branding}"...`,
        `Synthesizing coherent, structured technical rationale...`,
        `Reviewing accuracy, tone, and actionable guidance.`
      ];
    }

    return specificSteps.slice(0, count);
  }

  /**
   * Generate intelligent structured responses with Markdown and Code Blocks
   */
  _generateIntelligentResponse(prompt, branding, mode) {
    const q = prompt.toLowerCase();

    if (q.includes('quantum') || q.includes('physics')) {
      return `### Understanding Quantum Computing: Intuition & Simulation

Quantum computing shifts from classical binary states ($0$ or $1$) to **qubits**, which can exist in a linear combination of both states simultaneously known as **superposition**:

$$\\vert \\psi \\rangle = \\alpha \\vert 0 \\rangle + \\beta \\vert 1 \\rangle$$

Where $\\alpha$ and $\\beta$ are probability amplitudes such that $|\\alpha|^2 + |\\beta|^2 = 1$.

---

#### 1. The Coin Toss Analogy
* **Classical bit**: A coin flat on a table (either Heads or Tails).
* **Qubit**: A coin spinning rapidly on the table. While spinning, it embodies a probabilistic blend of both states until measured (collapsing into Heads or Tails).

---

#### 2. Interactive Python Qubit Simulator
Here is a pure Python simulation demonstrating a Hadamard gate (putting a qubit into equal 50/50 superposition):

\`\`\`python
import random
import math

class Qubit:
    def __init__(self):
        # State vector [alpha, beta] representing |0>
        self.state = [1.0, 0.0]

    def hadamard(self):
        """Applies Hadamard matrix: creates equal superposition"""
        inv_sqrt2 = 1.0 / math.sqrt(2)
        a, b = self.state
        self.state = [
            inv_sqrt2 * (a + b),
            inv_sqrt2 * (a - b)
        ]
        return self

    def measure(self):
        """Collapses superposition based on probabilities |alpha|^2 and |beta|^2"""
        prob_0 = self.state[0] ** 2
        collapsed = 0 if random.random() < prob_0 else 1
        self.state = [1.0, 0.0] if collapsed == 0 else [0.0, 1.0]
        return collapsed

# Run 10,000 trials to observe probability distribution
sim = Qubit()
trials = 10000
results = {0: 0, 1: 0}

for _ in range(trials):
    qubit = Qubit().hadamard()
    outcome = qubit.measure()
    results[outcome] += 1

print(f"Measurements over {trials} shots:")
print(f"|0>: {results[0]} ({(results[0]/trials)*100:.1f}%)")
print(f"|1>: {results[1]} ({(results[1]/trials)*100:.1f}%)")
\`\`\`

#### Key Takeaway
Quantum supremacy stems from **interference** (canceling wrong outcomes while amplifying correct ones) and **entanglement** ($N$ entangled qubits store $2^N$ simultaneous states).`;
    }

    if (q.includes('fastapi') || q.includes('jwt') || q.includes('auth')) {
      return `### Production-Ready FastAPI JWT Authentication Service

Here is a modern, modular implementation using **FastAPI**, **PyJWT**, **Passlib (Bcrypt)**, and **OAuth2PasswordBearer**.

\`\`\`python
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
import jwt
from pydantic import BaseModel

# Configuration
SECRET_KEY = "your-high-entropy-jwt-secret-key-change-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI(title="DeepThink Auth Service", version="1.0.0")

# In-Memory DB mock
fake_users_db = {
    "developer@deepthink.ai": {
        "username": "developer@deepthink.ai",
        "hashed_password": pwd_context.hash("SecurePass123!"),
        "role": "admin"
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = fake_users_db.get(username)
    if user is None:
        raise credentials_exception
    return user

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = fake_users_db.get(form_data.username)
    if not user or not pwd_context.verify(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/v1/protected-data")
async def read_protected_data(current_user: dict = Depends(get_current_user)):
    return {
        "status": "authenticated",
        "user": current_user["username"],
        "message": f"Welcome, authorized access granted by {SECRET_KEY[:4]}..."
    }
\`\`\`

#### Verification & Running
\`\`\`bash
pip install fastapi uvicorn "pyjwt[crypto]" "passlib[bcrypt]"
uvicorn main:app --reload
\`\`\``;
    }

    if (q.includes('riddle') || q.includes('three gods') || q.includes('hardest logic')) {
      return `### Solution: The "Hardest Logic Puzzle" (Boolos' Three Gods)

#### The Problem Summary
* Three gods **A, B, C** are **True** (speaks truth), **False** (always lies), and **Random** (randomly answers True or False).
* They understand English but reply with \`da\` and \`ja\` (one means Yes, one means No, but you do not know which is which).
* You get **3 Yes/No questions**, each addressed to one god.

---

#### The Core Key: Counterfactual Embedding
We can eliminate the uncertainty of \`da\` and \`ja\` by phrasing questions as:
> *"If I were to ask you $Q$, would you say \`ja\`?"*

* If $Q$ is **True**:
  * Both True and False will answer \`ja\`.
* If $Q$ is **False**:
  * Both True and False will answer \`da\`.

This neutralizes whether \`ja\` means Yes or No!

---

#### Step-by-Step Questions

1. **Question 1 (To God B):**
   > *"If I asked you 'Is A Random?', would you say \`ja\`?"*
   * If B answers \`ja\`: Either B is Random (so C is definitely not Random), or B is not Random and A is Random (so C is not Random). In either case, **C is NOT Random**.
   * If B answers \`da\`: By symmetry, **A is NOT Random**.
   * *Outcome:* We now have identified at least one god who is strictly deterministic (True or False). Let's assume without loss of generality that **C** is deterministic.

2. **Question 2 (To the deterministic god, say C):**
   > *"If I asked you 'Are you True?', would you say \`ja\`?"*
   * Since C is not Random, an answer of \`ja\` guarantees **C is True**; an answer of \`da\` guarantees **C is False**.

3. **Question 3 (To C again):**
   > *"If I asked you 'Is A Random?', would you say \`ja\`?"*
   * If \`ja\`: **A is Random**. (By deduction, B is the remaining identity).
   * If \`da\`: **B is Random** and **A is the remaining identity**.

**Q.E.D.** All 3 gods are identified with absolute certainty in 3 questions.`;
    }

    if (q.includes('react') || q.includes('render') || q.includes('usememo')) {
      return `### React Performance Optimization Strategy

When optimizing heavy rendering trees, prioritize minimizing unneeded re-evaluations and isolating heavy subtrees.

#### 1. Optimization Checklist
1. **Stabilize Reference Identities**: Wrap functions in \`useCallback\` and calculated values in \`useMemo\`.
2. **Component Memoization**: Wrap pure child components in \`React.memo\`.
3. **DOM Virtualization**: Render only visible items for large lists via \`@tanstack/react-virtual\`.
4. **State Localization**: Move rapidly changing state (e.g., text inputs, cursor position) down to leaf nodes.

\`\`\`tsx
import React, { useState, useMemo, useCallback } from 'react';

interface Item {
  id: string;
  score: number;
  label: string;
}

// 1. Memoized Leaf Component with custom shallow equality
const ListItem = React.memo(({ item, onSelect }: { item: Item; onSelect: (id: string) => void }) => {
  return (
    <div className="list-item" onClick={() => onSelect(item.id)}>
      <span>{item.label}</span>
      <span className="badge">{item.score}</span>
    </div>
  );
});

export const FilteredAnalyticsList = ({ items }: { items: Item[] }) => {
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 2. Heavy filtering memoized
  const filteredItems = useMemo(() => {
    return items
      .filter((i) => i.label.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => b.score - a.score);
  }, [items, filter]);

  // 3. Callback identity preserved across re-renders
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="performance-container">
      <input 
        type="text" 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter high-volume dataset..." 
      />
      <div className="virtual-scroll">
        {filteredItems.map((item) => (
          <ListItem key={item.id} item={item} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
};
\`\`\``;
    }

    // Default intelligent response
    return `### Solution from ${branding}

Thank you for your prompt: **"${prompt}"**

Here is a structured analysis:

#### 1. Core Synthesis & Analysis
* **Context**: Analyzed through the **${mode}** inference pipeline.
* **Architecture**: The problem is deconstructed into foundational principles, applying optimal modular patterns and minimizing cognitive and computational complexity.

#### 2. Recommended Implementation
\`\`\`javascript
// Demonstration implementation generated by ${branding}
function solveTask(inputParams = {}) {
  const { debug = false, priority = 'high' } = inputParams;
  
  const pipeline = [
    { stage: 'ingestion', status: 'verified' },
    { stage: 'transformation', status: 'optimized' },
    { stage: 'output', status: 'ready' }
  ];

  if (debug) {
    console.log('[${branding}] Active pipeline trace:', pipeline);
  }

  return {
    success: true,
    engine: '${mode}',
    timestamp: new Date().toISOString(),
    result: 'Processed successfully with zero errors.'
  };
}

console.log(solveTask({ debug: true }));
\`\`\`

#### 3. Key Observations
* **Scalability**: Can be extended easily for production workloads or real-time event streaming.
* **Safety**: Input validation ensures robust handling of edge cases.

Feel free to ask for deeper derivations, edge-case hardening, or alternative architectures!`;
  }

  /**
   * Real OpenAI / DeepSeek SSE streaming client
   */
  async _streamOpenAi({ prompt, mode, apiKey, apiEndpoint, onThoughtStep, onThoughtDone, onChunk, signal }) {
    const endpoint = apiEndpoint?.trim() || 'https://api.openai.com/v1';
    const url = `${endpoint.replace(/\/$/, '')}/chat/completions`;

    const modelName = mode.includes('r1') ? 'deepseek-reasoner' : (mode.includes('pro') ? 'gpt-4o' : 'gpt-4o-mini');

    onThoughtStep?.(`Connecting to endpoint: ${url}...`, 1, 2);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error (${response.status}): ${errText}`);
    }

    onThoughtDone?.('1.2');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta;
            // Handle DeepSeek reasoning_content if present
            if (delta?.reasoning_content) {
              onThoughtStep?.(delta.reasoning_content, 1, 1);
            }
            if (delta?.content) {
              onChunk?.(delta.content);
            }
          } catch (e) {
            // Ignore parse errors on stream boundaries
          }
        }
      }
    }
  }

  /**
   * Real Google Gemini streaming client
   */
  async _streamGemini({ prompt, apiKey, onThoughtStep, onThoughtDone, onChunk, signal }) {
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

    onThoughtStep?.(`Querying Gemini API gateway (${model})...`, 1, 2);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini error (${response.status}): ${errText}`);
    }

    onThoughtDone?.('0.9');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk) {
              onChunk?.(textChunk);
            }
          } catch (e) {
            // Ignore parse chunk boundary
          }
        }
      }
    }
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global instance
window.apiService = new ApiService();
