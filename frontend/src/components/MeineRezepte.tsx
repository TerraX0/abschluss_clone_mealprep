import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import type { GespeichertesRezept } from "../types/recipe";

function MeineRezepte() {
    const [rezepte, setRezepte] = useState<GespeichertesRezept[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // US-08: Filter-States für Titel-Suche, Kategorie und Favoriten
    const [suchbegriff, setSuchbegriff] = useState("");
    const [ausgewaehlteKategorie, setAusgewaehlteKategorie] = useState("ALLE");
    const [nurFavoriten, setNurFavoriten] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        async function loadRezepte() {
            try {
                const response = await fetch("/api/rezepte");
                if (response.ok) {
                    const data = await response.json();
                    setRezepte(data);
                } else {
                    setErrorMessage("Deine Rezepte konnten nicht geladen werden.");
                }
            } catch {
                setErrorMessage("Keine Verbindung zum Server.");
            }
            setIsLoading(false);
        }

        loadRezepte();
    }, []);

    // US-08: Favoritenstatus per Klick umschalten und im Backend speichern
    async function handleToggleFavorit(id: number) {
        setErrorMessage("");
        setTogglingId(id);
        try {
            const response = await fetch(`/api/rezepte/${id}/favorit`, {
                method: "PATCH",
            });

            if (response.ok) {
                const aktualisiert: GespeichertesRezept = await response.json();
                setRezepte((prev) =>
                    prev.map((rezept) => (rezept.id === id ? aktualisiert : rezept))
                );
            } else {
                setErrorMessage(
                    `Favoritenstatus konnte nicht geändert werden (Fehler ${response.status}).`
                );
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server.");
        } finally {
            setTogglingId(null);
        }
    }

    async function handleDelete(id: number) {
        const sicher = window.confirm("Möchtest du dieses Rezept wirklich löschen?");
        if (!sicher) {
            return;
        }

        try {
            const response = await fetch("/api/rezepte/" + id, { method: "DELETE" });

            if (response.ok) {
                setRezepte((prev) => prev.filter((rezept) => rezept.id !== id));
            } else if (response.status === 409) {
                setErrorMessage("Gespeicherte Rezepte aus der Suche können nicht gelöscht werden.");
            } else {
                setErrorMessage("Löschen hat nicht geklappt (Fehler " + response.status + ").");
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server.");
        }
    }

    // US-08: Vorhandene Kategorien aus den gespeicherten Rezepten ableiten
    const kategorien = useMemo(() => {
        const set = new Set<string>();
        for (const rezept of rezepte) {
            if (rezept.kategorie && rezept.kategorie.trim() !== "") {
                set.add(rezept.kategorie.trim());
            }
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b, "de"));
    }, [rezepte]);

    // US-08: Nach Titel, Kategorie und Favoriten filtern
    const gefilterteRezepte = useMemo(() => {
        const normalisierteSuche = suchbegriff.trim().toLowerCase();

        return rezepte.filter((rezept) => {
            if (nurFavoriten && !rezept.istFavorit) {
                return false;
            }
            if (
                ausgewaehlteKategorie !== "ALLE" &&
                rezept.kategorie.toLowerCase() !== ausgewaehlteKategorie.toLowerCase()
            ) {
                return false;
            }
            if (
                normalisierteSuche !== "" &&
                !rezept.name.toLowerCase().includes(normalisierteSuche)
            ) {
                return false;
            }
            return true;
        });
    }, [rezepte, suchbegriff, ausgewaehlteKategorie, nurFavoriten]);

    // US-08: Aktive Filter zurücksetzen
    function handleResetFilter() {
        setSuchbegriff("");
        setAusgewaehlteKategorie("ALLE");
        setNurFavoriten(false);
    }

    const hatAktiveFilter =
        suchbegriff.trim() !== "" || ausgewaehlteKategorie !== "ALLE" || nurFavoriten;

    return (
        <div>
            <Link to="/" className="back-link">← Zurück zur Suche</Link>
            <div className="subpage-header">
                <h2 className="subpage-title">Meine Rezepte</h2>
                <div className="subpage-actions">
                    <Link to="/rezepte/neu" className="btn-primary">+ Eigenes Rezept anlegen</Link>
                </div>
            </div>

            {/* US-08: Suchfeld (Titel), Kategorie-Filter & Favoriten-Umschalter */}
            {!isLoading && rezepte.length > 0 && (
                <div className="recipe-filter-bar" role="region" aria-label="Rezepte filtern">
                    <input
                        type="search"
                        className="form-input"
                        placeholder="Nach Titel suchen..."
                        value={suchbegriff}
                        onChange={(e) => setSuchbegriff(e.target.value)}
                        aria-label="Nach Titel suchen"
                    />

                    <select
                        className="form-select"
                        value={ausgewaehlteKategorie}
                        onChange={(e) => setAusgewaehlteKategorie(e.target.value)}
                        aria-label="Nach Kategorie filtern"
                    >
                        <option value="ALLE">Alle Kategorien</option>
                        {kategorien.map((kat) => (
                            <option key={kat} value={kat}>
                                {kat}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className={nurFavoriten ? "btn-primary" : "btn-secondary"}
                        aria-pressed={nurFavoriten}
                        onClick={() => setNurFavoriten((prev) => !prev)}
                    >
                        {nurFavoriten ? "★ Nur Favoriten" : "☆ Favoriten"}
                    </button>
                </div>
            )}

            {isLoading && <p>Rezepte werden geladen...</p>}

            {errorMessage !== "" && <p className="alert-error">{errorMessage}</p>}

            {!isLoading && errorMessage === "" && rezepte.length === 0 && (
                <p className="empty-state">Du hast noch keine Rezepte gespeichert.</p>
            )}

            {/* US-08: Verständliche Meldung ohne Fehler, wenn Filter keine Treffer liefern */}
            {!isLoading && errorMessage === "" && rezepte.length > 0 && gefilterteRezepte.length === 0 && (
                <div className="empty-state">
                    <p>Keine passenden Rezepte gefunden.</p>
                    {hatAktiveFilter && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={handleResetFilter}
                        >
                            Filter zurücksetzen
                        </button>
                    )}
                </div>
            )}

            <div className="recipe-grid">
                {gefilterteRezepte.map((rezept) => (
                    <div key={rezept.id} className="recipe-card">
                        {rezept.thumbnail && (
                            <img
                                src={rezept.thumbnail}
                                alt={rezept.name}
                                width="200"
                                className="recipe-card__image"
                            />
                        )}
                        <div className="recipe-card__body">
                            <h3 className="recipe-card__title">{rezept.name}</h3>
                            <div className="recipe-card__meta-row">
                                <span className="recipe-card__tag">Kategorie: {rezept.kategorie}</span>
                                {rezept.externeId === null && (
                                    <span className="recipe-card__badge">✏️ Eigenes Rezept</span>
                                )}
                                {/* US-08: Sichtbarer Favoriten-Badge */}
                                {rezept.istFavorit && (
                                    <span className="recipe-card__badge">★ Favorit</span>
                                )}
                            </div>

                            {/* US-08: Button zum Markieren / Entmarkieren als Favorit */}
                            <div className="recipe-card__actions">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={togglingId === rezept.id}
                                    aria-pressed={rezept.istFavorit}
                                    onClick={() => handleToggleFavorit(rezept.id)}
                                >
                                    {rezept.istFavorit ? "★ Favorit" : "☆ Favorit"}
                                </button>

                                {rezept.externeId === null && (
                                    <>
                                        <Link
                                            to={"/rezepte/" + rezept.id + "/bearbeiten"}
                                            className="btn-secondary"
                                        >
                                            Bearbeiten
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(rezept.id)}
                                            className="btn-danger"
                                        >
                                            Löschen
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MeineRezepte;