# Prompts

## Prompt 1:  "I need to build an EdgeFlow AI application for Cloudflare's AI Challenge 2026"  


## Prompt 2: "I'm seeing errors in wrangler.jsonc"  
### Solution: Added missing commas after nested objects and arrays in configuration; added proper AI and Durable Objects bindings

## Prompt 3: "Internal Server Error when I load localhost"  
### Removed conflicting binding and serveStatic middleware; implemented conditional routing for HTML responses

## Prompt 4: "Why does Llama 3.3-70b return Error 5007?"  
### Solution: Switched from `@cf/meta/llama-3.3-70b-instruct` to `@cf/meta/llama-3-8b-instruct` (smaller, tier-compatible model)

## Prompt 5: "My Worker depends on Durable Objects which are not exported"  
### Solution: Added `export class MyDurableObject { ... }` at end of index.ts; updated wrangler.jsonc with migration directive

## Prompt 6: "Property 'saveMessage' does not exist on type 'DurableObjectStub'"  
### Solution: Applied `const obj = c.env.MY_DURABLE_OBJECT.get(id) as unknown as MyDurableObject;` pattern

## Prompt 7: "It just printed out HTML Code instead of the response"  
### Solution: Modified /ai-test route to return `c.text()` when prompt query param exists; otherwise returns full HTML page

## Prompt 8: "Can we set a default system prompt for the model?"  
### Solution: Structured AI invocation with system prompt about EdgeFlow AI assistant role

## Prompt 9: "Why are my buttons placed like that?"  
### Solution: Reorganized button placement using Tailwind's `flex-col` and `gap-4` utilities

## Prompt 10: "How can we beautify it?"  
### Solution: Applied backdrop blur effects, dark theme (#020617), glass effect (`backdrop-blur-xl bg-white/10`), orange accent color (#f97316)

---

## Prompt 11: "We still need user input via chat... where does it go?"  
### Solution: Implemented `askAI()` function: encodes query → fetches /ai-test → displays response → saves to memory

## Prompt 12: "The chat response shows the full HTML page instead of just the AI text"  
### Solution: Added `if (c.req.query("prompt"))` check to route to `c.text()` response; non-query requests get full HTML

## Prompt 13: "Help me implement it so prompts get saved in memory logs"  
### Solution: Modified `askAI()` function to POST formatted response to /remember endpoint; logs display on /view-history

## Prompt 14: "How can we clear the memory logs?"  
### Solution: Created /clear-history route that sends action=clear to Durable Object; object executes `this.state.storage.deleteAll()`

## Prompt 15: Created structured documentation of a variety of aspects of the assignment in READ.md

## Prompt 16: Created structured documentation of the prompts I made


