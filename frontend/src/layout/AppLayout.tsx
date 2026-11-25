// src/layout/AppLayout.tsx

import { useState } from "react";
import { NavLink, Outlet } from "react-router";

// Typ
interface NavItem {
    path: string;
    label: string;
    hint: string;
    imageUrl: string;
    end?: boolean;
}

// Burger-Menü im Header
export const NAV_ITEMS: NavItem[] = [
    {
        path: "/",
        label: "Rezeptsuche",
        hint: "Externe Rezepte finden",
        imageUrl: "/images/11.jpg",
        end: true,
    },
    {
        path: "/rezepte",
        label: "Meine Rezepte",
        hint: "Gespeicherte & eigene Rezepte",
        imageUrl: "/images/15.jpg",
    },
    {
        path: "/rezepte/neu",
        label: "Eigenes Rezept",
        hint: "Neu anlegen",
        imageUrl: "/images/17.jpg",
    },
    {
        path: "/wochenplan",
        label: "Wochenplan",
        hint: "Montag bis Sonntag",
        imageUrl: "/images/21.jpg",
    },
];

// Kacheln
export const CARD_ITEMS: NavItem[] = [
    {
        path: "/rezepte",
        label: "Gespeicherte Rezepte",
        hint: "Eigene Sammlung",
        imageUrl: "/images/15.jpg",
    },
    {
        path: "/rezepte/neu",
        label: "Eigenes Rezept",
        hint: "Neu anlegen",
        imageUrl: "/images/17.jpg",
    },
    {
        path: "/vorrat",
        label: "Vorratsschrank",
        hint: "Vorräte pflegen",
        imageUrl: "/images/22.jpg",
    },
    {
        path: "/wochenplan",
        label: "Wochenplan",
        hint: "Montag bis Sonntag",
        imageUrl: "/images/21.jpg",
    },
    {
        path: "/einkaufsliste",
        label: "Einkaufsliste",
        hint: "Zutaten für die Woche",
        imageUrl: "/images/25.jpg",
    },
];

// Hilfsfunktion Animierte Überschrift - buchstabenweise Einblendung.
function AnimatedHeadline({ text }: { text: string }) {
    return (
        // aria-label für Screenreader - Barrierefreiheit.
        <h1 className="app-header__title" aria-label={text}>
            {Array.from(text).map((char, index) => (
                // Einzelne Zeichen mit einem Delay, aria-hidden verhindert Doppelansagen.
                <span
                    key={`${char}-${index}`}
                    className="app-header__char"
                    aria-hidden="true"
                    style={{ animationDelay: `${index * 35}ms` }}
                >
                    {char === " " ? "\u00A0" : char}
                </span>
            ))}
        </h1>
    );
}

// Layout - Seitenrahmen, Header, Menü & Outlet.
export function AppLayout() {
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);

    return (
        <div className="app-shell">
            {/* Barrierefreiheit für Tastatur & Screenreader: unsichtbarer Link für den Sprung zum Hauptinhalt per Tastatur */}
            <a href="#main-content" className="skip-link">
                Zum Hauptinhalt springen
            </a>

            {/* Header - Titel, Untertitel, Burger-Button und Navigationsleiste */}
            <header className="app-header">
                <div className="app-header__top">
                    <div>
                        <AnimatedHeadline text="MealPrep Planner" />
                        <p className="app-header__subtitle">
                            Rezepte finden, Vorrat prüfen, Wochenplan gestalten &amp; einkaufen
                        </p>
                    </div>

                    {/* Burger-Button zum Ein- und Ausblenden von Burger-Menü */}
                    <div className="app-header__meta">
                        <button
                            type="button"
                            className="header-nav__toggle"
                            aria-expanded={isHeaderMenuOpen}
                            aria-controls="header-primary-nav"
                            aria-label={isHeaderMenuOpen ? "Menü ausblenden" : "Menü einblenden"}
                            onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                        >
                            <span className="burger-lines" aria-hidden="true">
                                <span className="burger-lines__bar" />
                                <span className="burger-lines__bar" />
                                <span className="burger-lines__bar" />
                            </span>
                        </button>
                    </div>
                </div>

                {/* Klappbares Burger-Menü, wird nur gerendert, wenn isHeaderMenuOpen true ist */}
                {isHeaderMenuOpen && (
                    <nav
                        id="header-primary-nav"
                        className="header-nav"
                        aria-label="Hauptnavigation"
                    >
                        {NAV_ITEMS.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    isActive ? "header-nav__link active" : "header-nav__link"
                                }
                                onClick={() => setIsHeaderMenuOpen(false)}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                )}
            </header>

            {/* React Router rendert die jeweils aktive Kind-Route aus routes.tsx */}
            <main id="main-content" className="app-main" tabIndex={-1}>
                <Outlet />
            </main>
        </div>
    );
}