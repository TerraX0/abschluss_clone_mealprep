// frontend/src/routes/routes.tsx
import {createBrowserRouter, Navigate} from "react-router";
import {App} from "../App.tsx";
import {SearchPage} from "../components/SearchPage.tsx";
import RezeptDetailansicht from "../components/RezeptDetailansicht.tsx";
import MeineRezepte from "../components/MeineRezepte.tsx";
import EigenesRezeptFormular from "../components/EigenesRezeptFormular.tsx";
import Wochenplan from "../components/Wochenplan.tsx";
import Einkaufsliste from "../components/Einkaufsliste.tsx";

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
                path: "vorrat",
                element: (
                    <section className="placeholder-panel">
                        <h2>Vorratsschrank</h2>
                        <p>Verwaltung vorhandener Vorräte (US-09).</p>
                    </section>
                ),
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