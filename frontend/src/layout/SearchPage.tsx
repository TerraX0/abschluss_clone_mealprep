// src/layout/SearchPage.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import RecipeSearch from "../components/RecipeSearch";
import { CARD_ITEMS } from "./AppLayout.tsx";

/* Kachel-Karussell */
// Startseite ("/") aus den Kacheln ausklammern, weil da bereits die Suche ist.
const CARD_NAV_ITEMS = CARD_ITEMS.filter((item) => item.path !== "/");
const VISIBLE_TILE_COUNT = 3;
const ROTATE_INTERVAL_MS = 6000;

export function SearchPage() {
    // Position, Animation & Pause-Steuerung des Kachel-Karussells
    const [tileOffset, setTileOffset] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [activeSwapSlot, setActiveSwapSlot] = useState<number | null>(null);
    const [swapSeq, setSwapSeq] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Helferfunktion: Manuelles Blättern (vorwärts +1 / rückwärts -1).
    function stepTiles(direction: 1 | -1) {
        setIsInitialLoad(false);
        setTileOffset((prev) => (prev + direction + CARD_NAV_ITEMS.length) % CARD_NAV_ITEMS.length);
        setActiveSwapSlot(direction === 1 ? VISIBLE_TILE_COUNT - 1 : 0);
        setSwapSeq((prev) => prev + 1);
    }

    /* Use-Effects: Timer für Animation, Swap-Reset & Auto-Rotation */
    useEffect(() => {
        const settleTimer = window.setTimeout(() => setIsInitialLoad(false), 1200);
        return () => window.clearTimeout(settleTimer);
    }, []);

    useEffect(() => {
        if (activeSwapSlot === null) return;
        const clearTimer = window.setTimeout(() => setActiveSwapSlot(null), 900);
        return () => window.clearTimeout(clearTimer);
    }, [activeSwapSlot, swapSeq]);

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isPaused || prefersReducedMotion) return;

        const timer = window.setInterval(() => {
            setIsInitialLoad(false);
            setTileOffset((prev) => (prev + 1) % CARD_NAV_ITEMS.length);
            setActiveSwapSlot(VISIBLE_TILE_COUNT - 1);
            setSwapSeq((prev) => prev + 1);
        }, ROTATE_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [isPaused]);

    // Abgeleitete Daten: Aktuell sichtbare Kacheln berechnen.
    const visibleTiles = Array.from({ length: VISIBLE_TILE_COUNT }, (_, idx) => ({
        ...CARD_NAV_ITEMS[(tileOffset + idx) % CARD_NAV_ITEMS.length],
        slotIndex: idx,
    }));

    // Rendering Rezeptsuche und Kachel-Karussell
    return (
        <>
            <RecipeSearch />

            <section
                className="card-carousel inspiration-carousel"
                aria-label="Schnellzugriff auf Bereiche"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setIsPaused(false);
                    }
                }}
            >
                <button
                    type="button"
                    className="card-carousel__arrow"
                    onClick={() => stepTiles(-1)}
                    aria-label="Vorherige Bereiche anzeigen"
                >
                    &#8249;
                </button>

                <div className="card-strip inspiration-strip">
                    {visibleTiles.map((item) => {
                        const isSwappingSlot = !isInitialLoad && activeSwapSlot === item.slotIndex;
                        return (
                            <article
                                key={`slot-${item.slotIndex}`}
                                className={`nav-card inspiration-card ${
                                    isInitialLoad ? "inspiration-card--initial" : ""
                                }`}
                                style={
                                    isInitialLoad
                                        ? { animationDelay: `${item.slotIndex * 120}ms` }
                                        : undefined
                                }
                            >
                                {/* Innerer Wrapper: wechselt den key nur bei aktivem Slot-Swap für CSS-Animation */}
                                <div
                                    key={isSwappingSlot ? `${item.path}-${swapSeq}` : item.path}
                                    className={`inspiration-card__inner ${
                                        isSwappingSlot ? "inspiration-card__inner--swap" : ""
                                    }`}
                                >
                                    {/* Kachel-Link: navigiert zur Zielroute des Bereichs */}
                                    <Link
                                        to={item.path}
                                        className="nav-card__btn inspiration-card__btn"
                                        style={{
                                            backgroundImage: `linear-gradient(180deg, rgba(30, 50, 70, 0.25) 0%, rgba(30, 50, 70, 0.76) 100%), url("${item.imageUrl}")`,
                                        }}
                                    >
                                        <span className="inspiration-card__title">{item.label}</span>
                                        <span className="inspiration-card__hint">{item.hint}</span>
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="card-carousel__arrow"
                    onClick={() => stepTiles(1)}
                    aria-label="Nächste Bereiche anzeigen"
                >
                    &#8250;
                </button>
            </section>
        </>
    );
}