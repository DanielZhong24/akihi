# Akihi

[Akihi](https://akihi.vercel.app/) is a lightweight Japanese–English dictionary web app inspired by [Jisho.org](https://jisho.org).  
It uses [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), an open-source lexical database, and supports fast lookups for both Japanese and English words.
<img width="1919" height="941" alt="Screenshot 2025-10-12 234912" src="https://github.com/user-attachments/assets/b75063e9-4c40-4332-a5b8-b36c1dec2ea9"  width="400"/>



## Features

<p align="center">
  <img src="https://github.com/user-attachments/assets/0a8eb75f-4080-4d18-9fef-b8bd1633f339" width="600" style="border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.3);" />
  <img src="https://github.com/user-attachments/assets/1a522d0a-f9b0-46a2-9ceb-0da4d743c171" width="600" style="border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.3);" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/74abdbc1-9c9a-488e-9bfe-52fc44bda3db" width="400" style="border-radius:10px; box-shadow:0 4px 8px rgba(0,0,0,0.3);" />
</p>

- Instant search for Japanese or English words  
- Cached search results for faster performance  
- API-powered backend built with [Polka](https://github.com/lukeed/polka)  
- Frontend built with Svelte + Vite  
- Uses JMdict-simplified for accurate dictionary data  


## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | Svelte + Vite |
| Backend | Node.js + Polka |
| Data | JMdict-simplified |

## Performance & Significance

To ensure fast and responsive search queries, Akihi leverages an **LRU (Least Recently Used) cache** on the backend for English word searches.  

- **Why LRU cache?**  
  English searches require filtering the full JMdict dataset, which can be large. Without caching, repeated queries would be slow and resource-intensive.  

- **How it works:**  
  - The first search for a query scans the dictionary and stores the results in the LRU cache.  
  - Subsequent searches for the same query retrieve results directly from the cache, avoiding repeated expensive operations.  
  - The cache automatically removes the least recently used entries when it reaches a set size limit, keeping memory usage efficient.  
  
```mermaid
flowchart LR
    %% Main layers
    FE[Svelte + Vite Frontend] --> BE[Node.js + Polka Backend]
    
    %% Backend to Database and Cache
    BE --> CACHE[LRU Cache]
    BE --> DB[JMdict Database]
    
    %% Cache logic
    CACHE -->|Cache hit| BE
    CACHE -->|Cache miss| DB
    DB -->|Return results| CACHE
    
    %% Styling


```
This strategy significantly improves **performance**, reduces server load, and provides near-instant search results for frequently queried terms.

## License

This project is licensed under the MIT License.
