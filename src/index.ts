import { Hono } from "hono";

type Bindings = {
  AI: any;
  MY_DURABLE_OBJECT: DurableObjectNamespace;
  MY_WORKFLOW: Workflow;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Cloudflare Assingment - AI");
});

app.get("/ai-test", async (c) => {

  const result = await c.env.AI.run("@cf/meta/llama-3-8b-instruct" as any, {
    prompt: "Explain why Cloudflare is a good company to work for in 2 sentences."
  });
  return c.json(result);
});


app.get("/remember/:msg", async (c) => {
  const msg = c.req.param("msg");
  

  const id = c.env.MY_DURABLE_OBJECT.idFromName("global-history");
  const obj = c.env.MY_DURABLE_OBJECT.get(id);


  const resp = await obj.fetch(`http://do/save?msg=${encodeURIComponent(msg)}`);
  const data = await resp.json();
  
  return c.json(data);
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


