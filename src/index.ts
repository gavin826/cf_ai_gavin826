import { Hono } from "hono";

type Bindings = {
  AI: any;
  MY_DURABLE_OBJECT: DurableObjectNamespace;
  MY_WORKFLOW: Workflow;
};

const app = new Hono<{ Bindings: Bindings }>();
const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EdgeFlow AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: #020617; color: #e2e8f0; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
    </style>
</head>
<body class="min-h-screen flex items-center justify-center p-6">
    <div class="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
        <nav class="flex gap-8 mb-8">
            <a href="/" class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-orange-500 transition-colors">Dashboard</a>
            <a href="/ai-test" class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-orange-500 transition-colors">AI Insight</a>
            <a href="/view-history" class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-orange-500 transition-colors">Memory Logs</a>
        </nav>
        <div class="glass w-full p-10 rounded-3xl shadow-2xl text-center">
            <h1 class="text-5xl font-extrabold text-white mb-2">Edge<span class="text-orange-500">Flow</span></h1>
            <p class="text-slate-500 text-sm font-medium tracking-wide mb-8">Cloudflare AI Assignment</p>
            <div class="space-y-4">
                <div id="chatResponse" class="min-h-[60px] p-4 bg-black/20 rounded-xl text-sm italic text-slate-400 text-left border border-slate-700/50 hidden">
                </div>
                <div class="flex gap-2">
                    <input type="text" id="userQuery" placeholder="Ask EdgeFlow something..." 
                        class="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500 transition-all">
                    <button onclick="askAI()" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20">
                        Ask
                    </button>
                </div>
            </div>
        </div>
    </div>
    <script>
        async function askAI() {
            const input = document.getElementById('userQuery');
            const box = document.getElementById('chatResponse');
            const query = input.value;
            if(!query) return;
            box.classList.remove('hidden');
            box.innerText = "Thinking...";
            try {
                const res = await fetch('/ai-test?prompt=' + encodeURIComponent(query));
                const text = await res.text();
                // This puts the actual AI response into the box
                box.innerText = text;
            } catch (e) {
                box.innerText = "Error: Could not connect to the AI.";
            }
            input.value = '';
        }
    </script>
</body>
</html>`;

app.get("/", (c) => {
  return c.html(UI_HTML); 
});

app.get("/ai-test", async (c) => {
  const userPrompt = c.req.query("prompt") || "Explain why Cloudflare is a good company to work for in 2 sentences.";

  const result: any = await c.env.AI.run("@cf/meta/llama-3-8b-instruct" as any, {
    prompt: userPrompt
  });
  
  if (c.req.query("prompt")) {
    return c.text(result.response);
  }
  return c.html(renderPage("AI Insight", result.response));
});


app.get("/remember/:msg", async (c) => {
  const msg = c.req.param("msg");
  

  const id = c.env.MY_DURABLE_OBJECT.idFromName("global-history");
  const obj = c.env.MY_DURABLE_OBJECT.get(id);


  const resp = await obj.fetch(`http://do/save?msg=${encodeURIComponent(msg)}`);
  const data: any = await resp.json();
  
  const historyList = data.history.map((h: string) => `<p style="margin-bottom: 0.5rem; font-size: 0.875rem;">• ${h}</p>`).join('');
  return c.html(renderPage("Memory Logs", historyList));
});

app.get("/view-history", async (c) => {
  const id = c.env.MY_DURABLE_OBJECT.idFromName("global-history");
  const obj = c.env.MY_DURABLE_OBJECT.get(id);

  const resp = await obj.fetch(`http://do/save`);
  const data: any = await resp.json();

  const historyList = data.history.length > 0 
    ? data.history.map((h: string) => `<p style="margin-bottom: 0.5rem; font-size: 0.875rem;">• ${h}</p>`).join('')
    : `<p style="color: #64748b; font-size: 0.875rem;">No history found yet.</p>`;

  return c.html(renderPage("Memory Logs", historyList));
});

export default app;



export class MyDurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }


  async fetch(request: Request) {
    const url = new URL(request.url);
    const msg = url.searchParams.get("msg") || "";


    let history: string[] = await this.state.storage.get("history") || [];
    

    if (msg) {
      history.push(msg);

      await this.state.storage.put("history", history);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      history: history 
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

export class MyWorkflow {

  async run() {
    console.log("Workflow Triggered");
  }
}

const renderPage = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #020617; color: #e2e8f0; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 1.5rem; width: 100%; max-width: 28rem; }
    </style>
</head>
<body>
    <div class="glass">
        <h2 style="color: #f97316; font-weight: bold; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1rem;">${title}</h2>
        <div style="color: white; font-size: 1.125rem;">${content}</div>
        <div style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); pt-4;">
            <a href="/" style="color: #f97316; text-decoration: none; font-size: 0.875rem;">← Back to Dashboard</a>
        </div>
    </div>
</body>
</html>
`;


