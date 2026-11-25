import { Link } from "react-router";
import RecipeSearch from "./components/RecipeSearch";

function App() {
    return (
        <>
            <h1>Meal Prep</h1>
            <Link to="/sammlung">Meine Rezepte</Link>
            <RecipeSearch />
        </>
    );
}

export default App;