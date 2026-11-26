// frontend/src/routes/routes.tsx
import {createBrowserRouter, Navigate} from "react-router";
import {App} from "../App.tsx";
import {SearchPage} from "../components/SearchPage.tsx";
import RezeptDetailansicht from "../components/RezeptDetailansicht.tsx";
import MeineRezepte from "../components/MeineRezepte.tsx";
import EigenesRezeptFormular from "../components/EigenesRezeptFormular.tsx";
import Wochenplan from "../components/Wochenplan.tsx";
import Einkaufsliste from "../components/Einkaufsliste.tsx";
// Für US9
import Vorratsschrank from "../components/Vorratsschrank.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {index: true, element: <SearchPage/>},
            {
                path: "rezepte",
                element: <MeineRezepte/>,
            },
            {
                path: "rezepte/neu",
                element: <EigenesRezeptFormular/>,
            },
            {
                path: "rezepte/:id/bearbeiten",
                element: <EigenesRezeptFormular/>,
            },
            {
                path: "rezepte/:id",
                element: <RezeptDetailansicht/>,
            },
            {
                //Für US-9
                path: "/vorrat",
                element: <Vorratsschrank/>,
            },
            {
                path: "wochenplan",
                element: <Wochenplan/>,
            },
            {
                // ----------------- NEU -------------------//
                path: "einkaufsliste",
                element: <Einkaufsliste />,
            },
            {path: "*", element: <Navigate to="/" replace/>},
        ],
    },
]);