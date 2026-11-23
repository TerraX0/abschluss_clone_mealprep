import { useState } from "react";
import type { RecipeSummary } from "../types/recipe";

const testRecipes: RecipeSummary[] = [
    {
        externalId: "52771",
        title: "Spicy Arrabiata Penne",
        category: "Vegetarian",
        area: "Italian",
        imageUrl: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
    },
    {
        externalId: "52772",
        title: "Teriyaki Chicken Casserole",
        category: "Chicken",
        area: "Japanese",
        imageUrl: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    },
];

function RecipeSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    function handleSearch() {
        setErrorMessage("");

        const result = testRecipes.filter((recipe) =>
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <div key={recipe.externalId}>
                        <img src={recipe.imageUrl} alt={recipe.title} width="200" />
                        <h3>{recipe.title}</h3>
                        <p>Kategorie: {recipe.category}</p>
                        <p>Region: {recipe.area}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default RecipeSearch;