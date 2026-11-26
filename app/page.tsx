"use client";

import { useEffect, useMemo, useState } from "react";

type Car = { id: string; name: string; category: string; value: number; previousValue: number | null; imageUrl: string; updatedAt: string };

function money(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cars", { cache: "no-store" })
      .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error || "Could not load cars."); return data.cars as Car[]; })
      .then(setCars).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(cars.map(c => c.category || "Uncategorized"))).sort()], [cars]);
  const filtered = cars.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) && (category === "All" || c.category === category));
  const lastUpdated = cars.length ? new Date(Math.max(...cars.map(c => new Date(c.updatedAt).getTime() || 0))).toLocaleDateString() : "—";

  return (
    <>
      <header><div className="wrap nav">
        <a className="brand" href="/"><span className="logo">CL</span><span>CarLiner <span style={{color:"var(--muted)",fontWeight:500}}>Database</span></span></a>
        <nav className="navlinks"><a href="/">Database</a><a href="/admin">Admin</a></nav>
      </div></header>
      <main className="wrap">
        <section className="hero">
          <div className="eyebrow">Community vehicle values</div>
          <h1>Fix It Up<br/><span style={{color:"var(--accent)"}}>Database.</span></h1>
          <p className="lead">Browse vehicle values for Fix It Up. Values are maintained by the CarLiner team and updated when new information is available.</p>
          <div className="stats">
            <div className="stat"><small>Vehicles listed</small><strong>{cars.length}</strong></div>
            <div className="stat"><small>Categories</small><strong>{Math.max(0, categories.length - 1)}</strong></div>
            <div className="stat"><small>Latest value update</small><strong>{lastUpdated}</strong></div>
          </div>
          <div className="toolbar">
            <input className="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search vehicles..." aria-label="Search vehicles"/>
            <select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter by category">{categories.map(c=><option key={c}>{c}</option>)}</select>
          </div>
        </section>
        {loading && <div className="notice">Loading vehicle database…</div>}
        {error && <div className="notice">Could not load database: {error}<br/>Check that the Vercel environment variables are set and the GitHub repository contains data/cars.json.</div>}
        {!loading && !error && filtered.length === 0 && <div className="empty">No vehicles found. Add vehicles in the Admin dashboard.</div>}
        <section className="grid">
          {filtered.map(car=><article className="car" key={car.id}>
            <div className="carimg">{car.imageUrl ? <img src={car.imageUrl} alt={car.name}/> : "🚘"}</div>
            <div className="carbody">
              <h3>{car.name}</h3><div className="category">{car.category}</div>
              <div className="value">${money(car.value)}</div>
              <div className="change">{car.previousValue !== null && car.previousValue !== car.value ? <span className={car.value > car.previousValue ? "positive" : "negative"}>{car.value > car.previousValue ? "▲" : "▼"} ${money(Math.abs(car.value-car.previousValue))} since previous value</span> : "No previous value recorded"}</div>
            </div>
          </article>)}
        </section>
      </main>
      <footer><div className="wrap">Fix It Up Database · Powered by CarLiner · Community-maintained values. Not affiliated with the game creators.</div></footer>
    </>
  );
}
