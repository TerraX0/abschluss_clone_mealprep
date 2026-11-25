//src/components/RecipeSearch.tsx

import {useEffect, useState} from "react";
import type {Gericht} from "../types/recipe";
import {Link} from "react-router";

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

        let url = "";
        if (selectedKategorie !== "") {
            url = "/api/mealprep/kategorie?kategorie=" + selectedKategorie;
        } else {
            url = "/api/mealprep/search?suche=" + searchTerm;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                setErrorMessage("Die Rezeptsuche ist gerade nicht erreichbar. Bitte versuche es später erneut.");
                setRecipes([]);
            } else {
                const data: Gericht[] = await response.json();

                if (selectedKategorie !== "" && searchTerm !== "") {
                    const gefiltert = data.filter((recipe) =>
                        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    setRecipes(gefiltert);
                } else {
                    setRecipes(data);
                }
            }
        } catch {
            setErrorMessage("Keine Verbindung zum Server. Bitte versuche es später erneut.");
            setRecipes([]);
        }

        setHasSearched(true);
    }

    return (
        <div className="recipe-search">
            <h2 className="recipe-search__title">Rezepte suchen</h2>

            <div className="recipe-search__controls">
            <input
                className="recipe-search__input"
                type="text"
                placeholder="z. B. Pasta oder Curry"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
                className="recipe-search__select"
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

            <button
                type="button"
                className="recipe-search__button"
                onClick={handleSearch}>Suchen</button>
            </div>

            {errorMessage !== "" && <p style={{color: "red"}}>{errorMessage}</p>}

            {hasSearched && errorMessage === "" && recipes.length === 0 && (
                <p>Keine Rezepte gefunden. Versuche einen anderen Suchbegriff.</p>
            )}

            <div className="recipe-grid">
                {recipes.map((recipe) => (
                    <Link to={`/rezepte/${recipe.id}`} key={recipe.id}
                          className="recipe-card recipe-card--clickable">
                        <img className="recipe-card__image"
                            src={recipe.thumbnail} alt={recipe.name} width="200"/>
                        <div className="recipe-card__body">
                        <h3 className="recipe-card__title">{recipe.name}</h3>
                            <div className="recipe-card__meta-row">
                                <span className="recipe-card__tag">Kategorie: {recipe.kategorie}</span>
                        {recipe.region &&
                            (<span className="recipe-card__tag recipe-card__tag--muted">
                                    Region: {recipe.region}
                            </span>
                            )}
                        </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default RecipeSearch;