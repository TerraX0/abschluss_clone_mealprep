import { useState } from "react";

function RecipeSearch() {
    const [searchTerm, setSearchTerm] = useState("");

    function handleSearch() {
        console.log("Suche nach:", searchTerm);
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
        </div>
    );
}

export default RecipeSearch;