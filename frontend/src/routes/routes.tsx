// frontend/src/routes/routes.tsx
import { createBrowserRouter, Navigate } from "react-router";
import { App } from "../App.tsx";
import { SearchPage } from "../layout/SearchPage.tsx";
import RezeptDetailansicht from "../components/RezeptDetailansicht.tsx";

export const router = createBrowserRouter([
        {
            path: "/",
            element: <App />,
            children: [
                { index: true, element: <SearchPage /> },
                {
                    path: "rezepte",
                    element: (
                        <section className="placeholder-panel">
                            <h2>Gespeicherte Rezepte</h2>
                <p>Platzhalter für Rezeptsammlung (US-03 &amp; US-08).</p>
    </section>
),
},
{
    path: "rezepte/neu",
        element: (
    <section className="placeholder-panel">
        <h2>Eigenes Rezept anlegen</h2>
<p>Formular für eigene Rezepte (US-03).</p>
</section>
),
},
{
    path: "rezepte/:id",
        element: <RezeptDetailansicht />,
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
        element: (
    <section className="placeholder-panel">
        <h2>Wochenplan</h2>
        <p>Wochenansicht Montag bis Sonntag (US-04 &amp; US-05).</p>
</section>
),
},
{
    path: "einkaufsliste",
        element: (
    <section className="placeholder-panel">
        <h2>Einkaufsliste</h2>
        <p>Generierte Einkaufsliste aus dem Wochenplan (US-06 &amp; US-07).</p>
</section>
),
},
{ path: "*", element: <Navigate to="/" replace /> },
],
},
]);