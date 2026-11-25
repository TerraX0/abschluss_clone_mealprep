import {createBrowserRouter} from "react-router";
import App from "./App.tsx";
import RezeptDetailansicht from "./components/RezeptDetailansicht.tsx";
import MeineRezepte from "./components/MeineRezepte.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
    },
    {
        path: "/rezepte/:id",
        Component: RezeptDetailansicht
    },
    {
        path: "/sammlung",
        Component: MeineRezepte
    }
]);