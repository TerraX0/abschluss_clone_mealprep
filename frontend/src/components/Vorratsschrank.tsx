// Für US-9

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import type { VorratArtikel } from "../types/vorrat";

export default function Vorratsschrank() {
    const [artikelListe, setArtikelListe] = useState<VorratArtikel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Formular-State für Anlegen & Bearbeiten
    const [name, setName] = useState("");
    const [menge, setMenge] = useState("");
    const [bearbeiteId, setBearbeiteId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function ladeVorrat() {
        setErrorMessage("");
        setIsLoading(true);
        try {
            const response = await fetch("/api/vorrat");
            if (response.ok) {
                const data: VorratArtikel[] = await response.json();
                setArtikelListe(data);
            } else {
                setErrorMessage("Vorrat konnte nicht geladen werden.");
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        ladeVorrat();
    }, []);

    function starteBearbeiten(artikel: VorratArtikel) {
        setBearbeiteId(artikel.id);
        setName(artikel.name);
        setMenge(artikel.menge ?? "");
        setErrorMessage("");
    }

    function brecheBearbeitenAb() {
        setBearbeiteId(null);
        setName("");
        setMenge("");
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const bereinigterName = name.trim();
        if (!bereinigterName) {
            setErrorMessage("Bitte einen Namen für den Vorratsartikel eingeben.");
            return;
        }

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            const istBearbeiten = bearbeiteId !== null;
            const url = istBearbeiten ? `/api/vorrat/${bearbeiteId}` : "/api/vorrat";
            const method = istBearbeiten ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: bereinigterName,
                    menge: menge.trim(),
                }),
            });

            if (response.ok) {
                const gespeichert: VorratArtikel = await response.json();
                if (istBearbeiten) {
                    setArtikelListe((prev) =>
                        prev.map((item) => (item.id === bearbeiteId ? gespeichert : item))
                    );
                } else {
                    setArtikelListe((prev) => [...prev, gespeichert]);
                }
                brecheBearbeitenAb();
            } else {
                setErrorMessage(
                    `Speichern hat nicht geklappt (Fehler ${response.status}).`
                );
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: number) {
        const sicher = window.confirm("Möchtest du diesen Vorratsartikel wirklich löschen?");
        if (!sicher) return;

        setErrorMessage("");
        try {
            const response = await fetch(`/api/vorrat/${id}`, { method: "DELETE" });
            if (response.ok) {
                setArtikelListe((prev) => prev.filter((item) => item.id !== id));
                if (bearbeiteId === id) {
                    brecheBearbeitenAb();
                }
            } else {
                setErrorMessage(`Löschen hat nicht geklappt (Fehler ${response.status}).`);
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server.");
        }
    }

    return (
        <section>
            <Link to="/" className="back-link">← Zurück zur Suche</Link>

            <div className="subpage-header">
                <h2 className="subpage-title">Vorratsschrank</h2>
            </div>

            <form onSubmit={handleSubmit} className="shopping-add-form">
                <input
                    type="text"
                    placeholder="Zutat / Artikel (z. B. Reis, Olivenöl)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Vorratsartikel Name"
                />
                <input
                    type="text"
                    placeholder="Menge (optional, z. B. 1 kg)"
                    value={menge}
                    onChange={(e) => setMenge(e.target.value)}
                    aria-label="Vorratsartikel Menge"
                />
                <div className="subpage-actions">
                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        {bearbeiteId !== null ? "Speichern" : "+ Hinzufügen"}
                    </button>
                    {bearbeiteId !== null && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={brecheBearbeitenAb}
                        >
                            Abbrechen
                        </button>
                    )}
                </div>
            </form>

            {errorMessage && <p className="alert-error">{errorMessage}</p>}

            {isLoading ? (
                <p>Vorrat wird geladen...</p>
            ) : artikelListe.length === 0 ? (
                <p className="empty-state">Dein Vorratsschrank ist noch leer.</p>
            ) : (
                <ul className="shopping-list">
                    {artikelListe.map((artikel) => (
                        <li
                            key={artikel.id}
                            className="shopping-list__item"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "0.75rem",
                                padding: "0.75rem 1rem",
                            }}
                        >
                            <div>
                                <strong>{artikel.name}</strong>
                                {artikel.menge && (
                                    <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                                        ({artikel.menge})
                                    </span>
                                )}
                            </div>
                            <div className="subpage-actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => starteBearbeiten(artikel)}
                                >
                                    Bearbeiten
                                </button>
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() => handleDelete(artikel.id)}
                                >
                                    Löschen
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}