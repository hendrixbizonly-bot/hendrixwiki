---
title: Deployment Workflows
category: tech
type: skill
related: [Vercel, GitHub, Next.js, Node.js, Supabase]
tags: [deployment, devops, tools, workflow]
---

# Deployment Workflows

Deployment workflows are how [[Hendrix]] moves work from local code to live product. He keeps this part of the stack lean so he can focus on building.

## What they look like for him

- Code lives in [[GitHub]]
- Built and deployed through [[Vercel]]
- Backend and data served through [[Supabase]]
- Local work in [[VS Code]] pushes straight to preview and production
- Rollbacks are one click when needed

## Why it fits his workflow

Deployment should be a non-event. Hendrix wants shipping to be the cheapest, fastest step of the cycle. That matches his preference for [[Build and Ship|build and ship]] and removes the gap between decision and live product.

## What it unlocks

- Fast client feedback loops through preview URLs
- Confidence to ship often because reverting is trivial
- A reliable base for [[Duodode]] to scale on
- Less cognitive load spent on infrastructure

## Where it connects

- To the front-end through [[Next.js]] and [[Frontend Frameworks]]
- To the back-end through [[Node.js]] and [[Supabase]]
- To client work through [[Duodode]] project structure in [[Notion]]

## Related

[[Vercel]] · [[GitHub]] · [[Next.js]] · [[Node.js]] · [[Supabase]] · [[VS Code]]
