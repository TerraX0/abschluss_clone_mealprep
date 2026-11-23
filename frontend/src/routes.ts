import {createBrowserRouter} from "react-router";
import App from "./App.tsx";
import RezeptDetailansicht from "./RezeptDetailansicht.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: App,
    },
    {
        path: "/rezepte/:id",
        Component: RezeptDetailansicht
    }
]);