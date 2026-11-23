import { useState } from "react";
import type { Gericht } from "../types/recipe";

const testRecipes: Gericht[] = [
    {
        id: "52771",
        name: "Spicy Arrabiata Penne",
        kategorie: "VEGETARIAN",
        kueche: "Italian",
        region: "Italian",
        anweisungen: "",
        thumbnail: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
        zutaten: [],
        istFavorit: false,
    },
    {
        id: "52772",
        name: "Teriyaki Chicken Casserole",
        kategorie: "CHICKEN",
        kueche: "Japanese",
        region: "Japanese",
        anweisungen: "",
        thumbnail: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
        zutaten: [],
        istFavorit: false,
    },
];

function RecipeSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [recipes, setRecipes] = useState<Gericht[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function handleSearch() {
        setErrorMessage("");

        const result = testRecipes.filter((recipe) =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setRecipes(result);
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