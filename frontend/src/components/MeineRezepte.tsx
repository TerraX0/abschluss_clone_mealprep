import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { GespeichertesRezept } from "../types/recipe";

function MeineRezepte() {
    const [rezepte, setRezepte] = useState<GespeichertesRezept[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

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
    async function handleDelete(id: number) {
        const sicher = window.confirm("Möchtest du dieses Rezept wirklich löschen?");
        if (!sicher) {
            return;
        }

        try {
            const response = await fetch("/api/rezepte/" + id, { method: "DELETE" });

            if (response.ok) {
                setRezepte(rezepte.filter((rezept) => rezept.id !== id));
            } else if (response.status === 409) {
                setErrorMessage("Gespeicherte Rezepte aus der Suche können nicht gelöscht werden.");
            } else {
                setErrorMessage("Löschen hat nicht geklappt (Fehler " + response.status + ").");
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server.");
        }
    }

    return (
        <div>
            <Link to="/" className="back-link">← Zurück zur Suche</Link>
            <div className="subpage-header">
                <h2 className="subpage-title">Meine Rezepte</h2>
                <div className="subpage-actions">
                    <Link to="/rezepte/neu" className="btn-primary">+ Eigenes Rezept anlegen</Link>
                </div>
            </div>

            {isLoading && <p>Rezepte werden geladen...</p>}

            {errorMessage !== "" && <p className="alert-error">{errorMessage}</p>}

            {!isLoading && errorMessage === "" && rezepte.length === 0 && (
                <p className="empty-state">Du hast noch keine Rezepte gespeichert.</p>
            )}

            <div className="recipe-grid">
                {rezepte.map((rezept) => (
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
                            </div>
                            {rezept.externeId === null && (
                                <div className="recipe-card__actions">
                                    <Link
                                        to={"/rezepte/" + rezept.id + "/bearbeiten"}
                                        className="btn-secondary"
                                    >
                                        Bearbeiten
                                    </Link>
                                    {" "}
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(rezept.id)}
                                        className="btn-danger"
                                    >
                                        Löschen
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MeineRezepte;