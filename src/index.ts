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
    <div class="max-w-xl w-full glass p-8 rounded-3xl shadow-2xl text-center">
        <h1 class="text-4xl font-bold text-white mb-2">Edge<span class="text-orange-500">Flow</span></h1>
        <p class="text-slate-400 text-sm mb-8">Cloudflare AI Assignment</p>
        </div>
</body>
</html>`;

app.get("/", (c) => {
  return c.html(UI_HTML); 
});

app.get("/ai-test", async (c) => {

  const result = await c.env.AI.run("@cf/meta/llama-3-8b-instruct" as any, {
    prompt: "Explain why Cloudflare is a good company to work for in 2 sentences."
  });
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


