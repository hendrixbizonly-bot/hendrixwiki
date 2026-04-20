---
title: Databases
category: tech
type: skill
related: [Supabase, Backend, Node.js, Next.js, API Testing, Postman]
tags: [database, backend, data, tools]
---

# Databases

Databases are the persistence layer under [[Hendrix]]'s product work. [[Duodode]] builds real apps, not static sites, which means data has to live somewhere reliable.

## How he works with them

Primarily through [[Supabase]], which gives him Postgres with auth, storage, and APIs around it. That keeps his stack consistent from front-end to data layer without running his own infrastructure.

## Where they show up

- Client products and internal tools under [[Duodode]]
- [[Next.js]] apps that need real auth and data
- Automations in [[n8n]] that read and write shared state
- Integrations tested through [[Postman]] and [[API Testing]]

## Why this fits his approach

Hendrix wants tools that reduce setup and increase leverage. Managed databases like [[Supabase]] let him ship serious apps without building backend from scratch. That matches his preference for [[Build and Ship|fast shipping]] and [[Leverage|leverage]].

## How it connects to his system

Data is where most real products earn their weight. Strong database habits are part of building work with [[Substance over Noise|substance over noise]] and products that keep working past the launch.

## Related

[[Supabase]] · [[Backend]] · [[Node.js]] · [[Next.js]] · [[API Testing]] · [[Postman]]
