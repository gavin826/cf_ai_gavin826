import { Hono } from "hono";

type Bindings = {
  AI: any;
  MY_DURABLE_OBJECT: DurableObjectNamespace;
  MY_WORKFLOW: Workflow;
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Home Route
app.get("/", (c) => {
  return c.text("Cloudflare Assingment - AI");
});

// 2. AI Test Route
app.get("/ai-test", async (c) => {
  // Swapped to the standard 8b-instruct model to fix Error 5007
  const result = await c.env.AI.run("@cf/meta/llama-3-8b-instruct" as any, {
    prompt: "Explain why Cloudflare is a good company to work for in 2 sentences."
  });
  return c.json(result);
});

// 3. Memory / State Route (Durable Object)
app.get("/remember/:msg", async (c) => {
  const msg = c.req.param("msg");
  
  // This creates a unique ID for your storage "room"
  const id = c.env.MY_DURABLE_OBJECT.idFromName("global-history");
  const obj = c.env.MY_DURABLE_OBJECT.get(id);

  // We send a request to the Durable Object with the message in the URL
  const resp = await obj.fetch(`http://do/save?msg=${encodeURIComponent(msg)}`);
  const data = await resp.json();
  
  return c.json(data);
});

export default app;

// --- CLASSES (Required for your assignment) ---

export class MyDurableObject {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  // This 'fetch' function runs whenever the Worker calls the Durable Object
  async fetch(request: Request) {
    const url = new URL(request.url);
    const msg = url.searchParams.get("msg") || "";

    // 1. Get the current history list (or an empty list if it's the first time)
    let history: string[] = await this.state.storage.get("history") || [];
    
    // 2. Add the new message if it exists
    if (msg) {
      history.push(msg);
      // 3. Save it back to the "Filing Cabinet"
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
  // Simple workflow placeholder to satisfy the binding
  async run() {
    console.log("Workflow Triggered");
  }
}


