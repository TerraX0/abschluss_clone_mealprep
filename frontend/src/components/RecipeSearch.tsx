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

    function handleSearch() {
        console.log("Suche nach:", searchTerm);
        setRecipes(testRecipes);
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