import { useState } from "react";
import type { ApiError, Gericht } from "../types/recipe";

export function Zufallgericht() {
    const [rezept, setRezept] = useState<Gericht | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function ladeZufallsRezept() {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/rezepte/zufall");
            if (!response.ok) {
                let nachricht = `Fehler vom Backend (${response.status})`;
                try {
                    const errBody: ApiError = await response.json();
                    if (errBody?.message) {
                        nachricht = errBody.message;
                    }
                } catch {
                    // Falls keine JSON-Fehlermeldung vorlag
                }
                throw new Error(nachricht);
            }

            const data: Gericht = await response.json();
            setRezept(data);
        } catch (err) {
            const nachricht =
                err instanceof Error ? err.message : "Unbekannter Fehler";
            // Backticks (Template-Literal)
            setError(`Zufallgericht konnte nicht geladen werden: ${nachricht}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section aria-label="Zufallgericht">
            <h2>Zufallgericht</h2>
            <button
                type="button"
                onClick={ladeZufallsRezept}
                disabled={loading}
            >
                {loading ? "Suche Idee..." : "Zufallgericht laden"}
            </button>

            {error && <p role="alert">{error}</p>}

            {rezept && (
                <article>
                    <h3>{rezept.name || "Unbenanntes Rezept"}</h3>

                    <p>
                        {rezept.kategorie && <span>Kategorie: {rezept.kategorie}</span>}
                        {rezept.region && (
                            <span>
                                {rezept.kategorie ? " · " : ""}Region: {rezept.region}
                            </span>
                        )}
                    </p>

                    {rezept.thumbnail && (
                        <img
                            src={rezept.thumbnail}
                            alt={rezept.name || "Zufallgericht"}
                            width={280}
                            loading="lazy"
                        />
                    )}

                    {rezept.zutaten.length > 0 && (
                        <div>
                            <h4>Zutaten</h4>
                            <ul>
                                {rezept.zutaten.map((zutat, index) => (
                                    <li key={`${zutat.name}-${index}`}>
                                        {zutat.menge} {zutat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {rezept.anweisungen && (
                        <div>
                            <h4>Zubereitung</h4>
                            <p>{rezept.anweisungen}</p>
                        </div>
                    )}
                </article>
            )}
        </section>
    );
}