import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import type { EinkaufslistenEintrag } from "../types/einkaufsliste.ts";
import { holeWochentage } from "../util/holeWochentage.ts";
import { formatiereDatumIso } from "../util/formatiereDatumIso.ts";

export default function Einkaufsliste() {
    const [eintraege, setEintraege] = useState<EinkaufslistenEintrag[]>([]);
    const [laedt, setLaedt] = useState<boolean>(false);
    const [fehler, setFehler] = useState<string | null>(null);

    // US-07: State für manuelle freie Artikel und Lösch-Aktion
    const [neuerName, setNeuerName] = useState<string>("");
    const [neueMenge, setNeueMenge] = useState<string>("");
    const [speichertArtikel, setSpeichertArtikel] = useState<boolean>(false);
    const [loeschtErledigte, setLoeschtErledigte] = useState<boolean>(false);

    const wochentage = holeWochentage();

    async function ladeListe() {
        setFehler(null);
        try {
            const antwort = await axios.get<EinkaufslistenEintrag[]>("/api/einkaufsliste");
            setEintraege(antwort.data);
        } catch {
            setFehler("Einkaufsliste konnte nicht geladen werden.");
        }
    }

    async function generiereNeu() {
        setFehler(null);
        setLaedt(true);
        try {
            const antwort = await axios.post<EinkaufslistenEintrag[]>(
                "/api/einkaufsliste/generieren",
                null,
                {
                    params: {
                        startDatum: formatiereDatumIso(wochentage[0]),
                        endDatum: formatiereDatumIso(wochentage[6]),
                    },
                }
            );
            setEintraege(antwort.data);
        } catch {
            setFehler("Einkaufsliste konnte nicht aus dem Wochenplan generiert werden.");
        } finally {
            setLaedt(false);
        }
    }

    // US-07: Freie Artikel (z. B. Haushaltsrolle, Kaffee) manuell hinzufügen
    async function artikelHinzufuegen(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const getrimmterName = neuerName.trim();
        if (!getrimmterName) {
            setFehler("Bitte einen Artikelnamen eingeben.");
            return;
        }

        setFehler(null);
        setSpeichertArtikel(true);
        try {
            const antwort = await axios.post<EinkaufslistenEintrag>(
                "/api/einkaufsliste/artikel",
                {
                    name: getrimmterName,
                    menge: neueMenge.trim(),
                }
            );
            setEintraege((prev) => [...prev, antwort.data]);
            setNeuerName("");
            setNeueMenge("");
        } catch {
            setFehler("Artikel konnte nicht hinzugefügt werden.");
        } finally {
            setSpeichertArtikel(false);
        }
    }

    // US-07: Status (offen / erledigt) per Klick umschalten und im Backend speichern
    async function erledigtUmschalten(id: number) {
        setFehler(null);
        try {
            const antwort = await axios.patch<EinkaufslistenEintrag>(
                `/api/einkaufsliste/${id}/erledigt`
            );
            setEintraege((prev) =>
                prev.map((item) => (item.id === id ? antwort.data : item))
            );
        } catch {
            setFehler("Status des Eintrags konnte nicht aktualisiert werden.");
        }
    }

    // US-07: Erledigte Artikel aus der Liste entfernen
    async function erledigteLoeschen() {
        setFehler(null);
        setLoeschtErledigte(true);
        try {
            await axios.delete("/api/einkaufsliste/erledigt");
            setEintraege((prev) => prev.filter((item) => !item.erledigt));
        } catch {
            setFehler("Erledigte Artikel konnten nicht gelöscht werden.");
        } finally {
            setLoeschtErledigte(false);
        }
    }

    useEffect(() => {
        ladeListe();
    }, []);

    // US-07: Trennung in offene und erledigte Einträge für klare Darstellung
    const offeneEintraege = eintraege.filter((item) => !item.erledigt);
    const erledigteEintraege = eintraege.filter((item) => item.erledigt);

    return (
        <section>
            <div className="subpage-header">
                <h2 className="subpage-title">Einkaufsliste</h2>
                <div className="subpage-actions">
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={generiereNeu}
                        disabled={laedt}
                    >
                        {laedt ? "Generiere..." : "Einkaufsliste aus Wochenplan generieren"}
                    </button>

                    {/* US-07: Button „Erledigte Artikel löschen“ */}
                    {erledigteEintraege.length > 0 && (
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={erledigteLoeschen}
                            disabled={loeschtErledigte}
                        >
                            {loeschtErledigte
                                ? "Lösche..."
                                : `Erledigte Artikel löschen (${erledigteEintraege.length})`}
                        </button>
                    )}
                </div>
            </div>

            {/* US-07: Formular zum manuellen Ergänzen freier Artikel */}
            <form onSubmit={artikelHinzufuegen} className="shopping-add-form">
                <input
                    type="text"
                    placeholder="Freier Artikel (z. B. Kaffee, Haushaltsrolle)"
                    value={neuerName}
                    onChange={(e) => setNeuerName(e.target.value)}
                    aria-label="Artikelname"
                />
                <input
                    type="text"
                    placeholder="Menge (optional)"
                    value={neueMenge}
                    onChange={(e) => setNeueMenge(e.target.value)}
                    aria-label="Menge"
                />
                <button type="submit" className="btn-secondary" disabled={speichertArtikel}>
                    {speichertArtikel ? "Füge hinzu..." : "Artikel hinzufügen"}
                </button>
            </form>

            {fehler && <p role="alert" className="alert-error">{fehler}</p>}

            {eintraege.length === 0 ? (
                <p>
                    Noch keine Einträge auf der Einkaufsliste. Plane Rezepte im Wochenplan ein und klicke auf „Einkaufsliste aus Wochenplan generieren“ oder füge oben manuell Artikel hinzu.
                </p>
            ) : (
                <>
                    <ul className="shopping-list">
                        {offeneEintraege.map((item) => (
                            <li key={item.id} className="shopping-list__item">
                                <label className="shopping-list__label">
                                    {/* US-07: Checkbox zum Umschalten des Status offen/erledigt */}
                                    <input
                                        type="checkbox"
                                        checked={item.erledigt}
                                        onChange={() => erledigtUmschalten(item.id)}
                                    />
                                    <strong>{item.name}</strong>
                                    {item.menge && <span> – {item.menge}</span>}
                                    {item.anzahlVerwendungen > 1 && (
                                        <small> ({item.anzahlVerwendungen}× im Wochenplan)</small>
                                    )}
                                </label>
                            </li>
                        ))}
                    </ul>

                    {/* US-07: Visuell hervorgehobener Bereich „Im Einkaufswagen“ (durchgestrichen) */}
                    {erledigteEintraege.length > 0 && (
                        <div className="shopping-cart-done">
                            <h3>Im Einkaufswagen ({erledigteEintraege.length})</h3>
                            <ul className="shopping-list shopping-list--done">
                                {erledigteEintraege.map((item) => (
                                    <li
                                        key={item.id}
                                        className="shopping-list__item shopping-list__item--done"
                                    >
                                        <label className="shopping-list__label">
                                            <input
                                                type="checkbox"
                                                checked={item.erledigt}
                                                onChange={() => erledigtUmschalten(item.id)}
                                            />
                                            <span style={{ textDecoration: "line-through" }}>
                                                <strong>{item.name}</strong>
                                                {item.menge && <span> – {item.menge}</span>}
                                            </span>
                                            {item.anzahlVerwendungen > 1 && (
                                                <small> ({item.anzahlVerwendungen}× im Wochenplan)</small>
                                            )}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}
        </section>
    );
}