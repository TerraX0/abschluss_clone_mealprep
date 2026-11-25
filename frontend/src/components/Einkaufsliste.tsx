import { useEffect, useState } from "react";
import axios from "axios";
import type { EinkaufslistenEintrag } from "../types/einkaufsliste.ts";
import { holeWochentage } from "../util/holeWochentage.ts";
import { formatiereDatumIso } from "../util/formatiereDatumIso.ts";

export default function Einkaufsliste() {
    const [eintraege, setEintraege] = useState<EinkaufslistenEintrag[]>([]);
    const [laedt, setLaedt] = useState<boolean>(false);
    const [fehler, setFehler] = useState<string | null>(null);

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

    useEffect(() => {
        ladeListe();
    }, []);

    return (
        <section>
            <div className="subpage-header">
                <h2 className="subpage-title">Einkaufsliste</h2>
                <button
                    type="button"
                    className="btn-primary"
                    onClick={generiereNeu}
                    disabled={laedt}
                >
                    {laedt ? "Generiere..." : "Einkaufsliste aus Wochenplan generieren"}
                </button>
            </div>

            {fehler && <p role="alert" className="alert-error">{fehler}</p>}

            {eintraege.length === 0 ? (
                <p>Noch keine Einträge auf der Einkaufsliste. Plane Rezepte im Wochenplan ein und klicke auf „Einkaufsliste aus Wochenplan generieren“.</p>
            ) : (
                <ul className="shopping-list">
                    {eintraege.map((item) => (
                        <li key={item.id} className="shopping-list__item">
                            <strong>{item.name}</strong>
                            {item.menge && <span> – {item.menge}</span>}
                            {item.anzahlVerwendungen > 1 && (
                                <small> ({item.anzahlVerwendungen}× im Wochenplan)</small>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}