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

    return (
        <div>
            <h2>Meine Rezepte</h2>
            <Link to="/">← Zurück zur Suche</Link>
            <br />
            <Link to="/sammlung/neu">+ Eigenes Rezept anlegen</Link>

            {isLoading && <p>Rezepte werden geladen...</p>}

            {errorMessage !== "" && <p style={{ color: "red" }}>{errorMessage}</p>}

            {!isLoading && errorMessage === "" && rezepte.length === 0 && (
                <p>Du hast noch keine Rezepte gespeichert.</p>
            )}

            {rezepte.map((rezept) => (
                <div key={rezept.id}>
                    {rezept.thumbnail && <img src={rezept.thumbnail} alt={rezept.name} width="200" />}
                    <h3>{rezept.name}</h3>
                    <p>Kategorie: {rezept.kategorie}</p>
                    {rezept.externeId === null && <p>✏️ Eigenes Rezept</p>}
                </div>
            ))}
        </div>
    );
}

export default MeineRezepte;