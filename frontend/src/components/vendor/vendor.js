const BASE = "http://127.0.0.1:8000";

export async function listMedicines(token) {
  const r = await fetch(`${BASE}/api/vendor/medicines/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error("Failed to load medicines");
  return r.json();
}

export async function addMedicine(token, payload) {
  const r = await fetch(`${BASE}/api/vendor/medicines/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload) // camelCase allowed
  });
  if (!r.ok) throw new Error("Failed to add medicine");
  return r.json();
}

export async function updateMedicine(token, id, partial) {
  const r = await fetch(`${BASE}/api/vendor/medicines/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(partial)
  });
  if (!r.ok) throw new Error("Failed to update medicine");
  return r.json();
}
