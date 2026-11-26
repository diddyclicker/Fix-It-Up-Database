
"use client";

import { useEffect, useState } from "react";

type Car = {
  id: string;
  name: string;
  category: string;
  value: number;
  previousValue: number | null;
  imageUrl: string;
  updatedAt: string | null;
};

const blank = (): Car => ({
  id: "",
  name: "",
  category: "Uncategorized",
  value: 0,
  previousValue: null,
  imageUrl: "",
  updatedAt: new Date().toISOString(),
});

export default function Admin() {
  const [cars, setCars] = useState<Car[]>([]);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<Car>(blank());
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState("Loading database…");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/cars", { cache: "no-store" });
      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Could not load cars.");
      }

      const carList = Array.isArray(d.cars)
        ? d.cars
        : d.cars?.cars;

      if (!Array.isArray(carList)) {
        throw new Error("Invalid car data format.");
      }

      setCars(carList);
      setStatus("Database loaded. Add or edit a vehicle below.");
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "Could not load database."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  function edit(car: Car) {
    setForm({ ...car });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function saveLocal() {
    if (
      !form.name.trim() ||
      !Number.isFinite(Number(form.value)) ||
      Number(form.value) < 0
    ) {
      setStatus("Enter a vehicle name and a valid value.");
      return;
    }

    const id =
      form.id ||
      form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const old = cars.find((c) => c.id === id);

    const next: Car = {
      ...form,
      id,
      value: Number(form.value),
      previousValue: old ? old.value : null,
      updatedAt: new Date().toISOString(),
    };

    setCars((current) =>
      old
        ? current.map((c) => (c.id === id ? next : c))
        : [...current, next]
    );

    setForm(blank());
    setEditing(false);
    setStatus("Change staged. Click Publish changes to save it to GitHub.");
  }

  function remove(id: string) {
    if (!window.confirm("Remove this vehicle from the database?")) return;

    setCars((current) => current.filter((c) => c.id !== id));
    setStatus("Removal staged. Click Publish changes to save it to GitHub.");
  }

  async function publish() {
    if (!password) {
      setStatus("Enter the admin password first.");
      return;
    }

    setBusy(true);
    setStatus("Saving to GitHub…");

    try {
      const r = await fetch("/api/admin/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ cars }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Could not publish changes.");
      }

      setStatus(
        d.message + (d.commit ? " Commit: " + d.commit : "")
      );

      await load();
    } catch (e) {
      setStatus(
        e instanceof Error ? e.message : "Could not publish changes."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header>
        <div className="wrap nav">
          <a className="brand" href="/">
            <span className="logo">CL</span>
            <span>
              CarLiner{" "}
              <span style={{ color: "var(--muted)", fontWeight: 500 }}>
                Admin
              </span>
            </span>
          </a>
          <nav className="navlinks">
            <a href="/">Public database</a>
          </nav>
        </div>
      </header>

      <main className="wrap admin">
        <div className="eyebrow">Private management</div>

        <h1 style={{ fontSize: 42 }}>Database Admin</h1>

        <p className="lead">
          Add vehicles, update values and publish the changes directly to
          your GitHub repository.
        </p>

        <section className="panel">
          <h2>Admin access</h2>

          <label className="field">
            Admin password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your private admin password"
              autoComplete="current-password"
            />
          </label>

          <p className="status">
            Your password is sent only to your own API route. It is not
            stored in the cars file.
          </p>
        </section>

        <section className="panel">
          <h2>{editing ? "Edit vehicle" : "Add a vehicle"}</h2>

          <div className="formgrid">
            <label className="field">
              Vehicle name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                placeholder="e.g. Example GT"
              />
            </label>

            <label className="field">
              Value ($)
              <input
                type="number"
                min="0"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: Number(e.target.value) })
                }
              />
            </label>

            <label className="field">
              Category
              <input
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                placeholder="Sport, SUV, Classic…"
              />
            </label>

            <label className="field">
              Image URL (optional)
              <input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({ ...form, imageUrl: e.target.value })
                }
                placeholder="https://…"
              />
            </label>
          </div>

          <div className="actions">
            <button className="btn" onClick={saveLocal}>
              {editing ? "Stage update" : "Add vehicle"}
            </button>

            {editing && (
              <button
                className="btn secondary"
                onClick={() => {
                  setForm(blank());
                  setEditing(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="panel">
          <h2>Vehicles ({cars.length})</h2>

          {cars.length === 0 && (
            <p className="status">No vehicles in the database yet.</p>
          )}

          {cars.map((car) => (
            <div className="carrow" key={car.id}>
              <div>
                <strong>{car.name}</strong>
                <div className="category">
                  {car.category} · $
                  {car.value.toLocaleString("en-US")}
                </div>
              </div>

              <div className="actions" style={{ margin: 0 }}>
                <button
                  className="btn secondary"
                  onClick={() => edit(car)}
                >
                  Edit
                </button>

                <button
                  className="btn danger"
                  onClick={() => remove(car.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="actions">
            <button
              className="btn"
              disabled={busy}
              onClick={publish}
            >
              {busy ? "Publishing…" : "Publish changes to GitHub"}
            </button>

            <button className="btn secondary" onClick={load}>
              Reload from GitHub
            </button>
          </div>

          <div className="status" role="status">
            {status}
          </div>
        </section>

        <div className="notice">
          Keep the admin URL private. Do not share your admin password or
          GitHub token. Only give the GitHub token Contents read/write
          access to this repository.
        </div>
      </main>

      <footer>
        <div className="wrap">CarLiner Database Admin</div>
      </footer>
    </>
  );
}
