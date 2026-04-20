---
title: API Testing
category: tech
type: skill
related: [Postman, Supabase, Backend, Node.js, n8n, Automation Workflows]
tags: [api, testing, backend, tools]
---

# API Testing

API testing is part of how [[Hendrix]] keeps builds honest. He uses [[Postman]] to verify what endpoints actually do, rather than trusting what the code assumes.

## Why it matters

Most real bugs live at the boundaries: between front-end and back-end, between app and third-party service, between automation steps. API testing is how he inspects those boundaries directly.

## How he uses it

- Verifying [[Supabase]] endpoints and auth flows
- Testing integrations used inside [[n8n]] workflows
- Debugging data flow between [[Next.js]] front-end and server routes
- Exploring third-party APIs before committing to them
- Keeping a library of reusable test requests across projects

## Why it fits his approach

Hendrix prefers evidence over assumption. Testing APIs gives him a direct view of reality. That matches his preference for [[Substance over Noise|real substance]] and [[Directness]] in how he works.

## What it unlocks

- Faster debugging cycles
- Confidence before shipping
- Cleaner integration work across [[Duodode]] projects
- Less time lost to guesswork

## Related

[[Postman]] · [[Supabase]] · [[Backend]] · [[Node.js]] · [[n8n]] · [[Automation Workflows]]
