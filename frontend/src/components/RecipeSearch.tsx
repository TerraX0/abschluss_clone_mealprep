import { useEffect, useState } from "react";
import type { Gericht } from "../types/recipe";

function RecipeSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [recipes, setRecipes] = useState<Gericht[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [kategorien, setKategorien] = useState<string[]>([]);
    const [selectedKategorie, setSelectedKategorie] = useState("");

    useEffect(() => {
        async function loadKategorien() {
            try {
                const response = await fetch("/api/mealprep/kategorien");
                if (response.ok) {
                    const data = await response.json();
                    setKategorien(data);
                }
            } catch {
                console.log("Kategorien konnten nicht geladen werden");
            }
        }

        loadKategorien();
    }, []);

    async function handleSearch() {
        setErrorMessage("");

        try {
            const response = await fetch("/api/mealprep/search?suche=" + searchTerm);

            if (!response.ok) {
                setErrorMessage("Die Rezeptsuche ist gerade nicht erreichbar. Bitte versuche es später erneut.");
                setRecipes([]);
            } else {
                const data = await response.json();
                setRecipes(data);
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server. Bitte versuche es später erneut.");
            setRecipes([]);
        }

        setHasSearched(true);
    }

    return (
        <div>
            <h2>Rezepte suchen</h2>

            <input
                type="text"
                placeholder="z. B. Pasta oder Curry"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                value={selectedKategorie}
                onChange={(e) => setSelectedKategorie(e.target.value)}
            >
                <option value="">Alle Kategorien</option>
                {kategorien.map((kategorie) => (
                    <option key={kategorie} value={kategorie}>
                        {kategorie}
                    </option>
                ))}
            </select>

            <button onClick={handleSearch}>Suchen</button>

            {errorMessage !== "" && <p style={{ color: "red" }}>{errorMessage}</p>}

            {hasSearched && errorMessage === "" && recipes.length === 0 && (
                <p>Keine Rezepte gefunden. Versuche einen anderen Suchbegriff.</p>
            )}

            <div>
                {recipes.map((recipe) => (
                    <div key={recipe.id}>
                        <img src={recipe.thumbnail} alt={recipe.name} width="200" />
                        <h3>{recipe.name}</h3>
                        <p>Kategorie: {recipe.kategorie}</p>
                        <p>Region: {recipe.region}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RecipeSearch;