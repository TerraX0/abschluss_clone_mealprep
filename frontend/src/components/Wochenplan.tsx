import {useEffect, useState} from "react";
import type {ChangeEvent} from "react";
import axios from "axios";
import type {GespeichertesRezept} from "../types/recipe.ts";
import {
    type Mahlzeit,
    MAHLZEIT_OPTIONEN,
    type NeuerWochenplanEintrag,
    type WochenplanEintrag
} from "../types/wochenplan.ts";
import {formatiereDatumIso} from "../util/formatiereDatumIso.ts";
import WochenplanZelle from "./WochenplanZelle.tsx";
import {formatiereWochentag} from "../util/formatiereWochentag.ts";
import {holeWochentage} from "../util/holeWochentage.ts";
import {useNavigate} from "react-router";

export default function Wochenplan() {
    // NEU: Komponentenrumpf:
    const navigate = useNavigate();
    const [rezepte, setRezepte] = useState<GespeichertesRezept[]>([]);
    const [eintraege, setEintraege] = useState<WochenplanEintrag[]>([]);
    const [fehler, setFehler] = useState<string | null>(null);

    const wochentage = holeWochentage();


    useEffect(() => {
        async function loadRezepte() {
            try {
                const response = await axios.get<GespeichertesRezept[]>("/api/rezepte");
                setRezepte(response.data);
            } catch {
                setFehler("Keine Verbindung zum Server.");
            }
        }

        loadRezepte();
    }, []);

    async function ladeWochenplanEintraege() {
        setFehler(null);
        try {
            const antwort = await axios.get<WochenplanEintrag[]>("/api/ernaehrungsplan", {
                params: {
                    startDatum: formatiereDatumIso(wochentage[0]),
                    endDatum: formatiereDatumIso(wochentage[6]),
                },
            });
            setEintraege(antwort.data);
        } catch {
            setFehler("Wochenplan konnte nicht geladen werden.");
        }
    }

    useEffect(() => {
        ladeWochenplanEintraege();
    }, []);


    async function weiseRezeptZu(neuerEintrag: NeuerWochenplanEintrag) {
        setFehler(null);
        try {
            const antwort = await axios.post<WochenplanEintrag>("/api/ernaehrungsplan", neuerEintrag);
            setEintraege([...eintraege, antwort.data]);
        } catch {
            setFehler("Rezept konnte nicht eingeplant werden.");
        }
    }

    // ------ Angepasst mit "ersetzeEintrag"-------/
    function behandleRezeptAuswahl(
        ereignis: ChangeEvent<HTMLSelectElement>,
        datum: string,
        mahlzeit: Mahlzeit
    ) {
        const ausgewaehlteId = Number(ereignis.target.value);
        if (!ausgewaehlteId) return;

        const vorhandenerEintrag = eintraege.find(
            (item) => item.datum === datum && item.mahlzeit === mahlzeit
        );

        if (vorhandenerEintrag) {
            ersetzeEintrag(vorhandenerEintrag, datum, mahlzeit, ausgewaehlteId);
        } else {
            weiseRezeptZu({
                datum,
                mahlzeit,
                rezeptId: ausgewaehlteId as unknown as NeuerWochenplanEintrag["rezeptId"],
                portionen: 1,
            });
        }
    }



    // ---------------- NEU -----------------------//

    async function entferneEintrag(eintragId: number) {
        setFehler(null);
        try {
            await axios.delete(`/api/ernaehrungsplan/${eintragId}`);
            setEintraege((prev) => prev.filter((item) => item.id !== eintragId));
        } catch {
            setFehler("Eintrag konnte nicht entfernt werden.");
        }
    }

    async function ersetzeEintrag(
        vorhandenerEintrag: WochenplanEintrag,
        datum: string,
        mahlzeit: Mahlzeit,
        rezeptId: number
    ) {
        setFehler(null);
        try {
            const antwort = await axios.put<WochenplanEintrag>(
                `/api/ernaehrungsplan/${vorhandenerEintrag.id}`,
                {
                    datum,
                    mahlzeit,
                    rezeptId,
                    portionen: vorhandenerEintrag.portionen ?? 1,
                }
            );
            setEintraege((prev) =>
                prev.map((item) => (item.id === vorhandenerEintrag.id ? antwort.data : item))
            );
        } catch {
            setFehler("Slot konnte nicht aktualisiert werden.");
        }
    }


    async function leereAktuelleWoche() {
        const bestaetigt = window.confirm("Möchtest du wirklich alle Einträge der aktuellen Woche löschen?");
        if (!bestaetigt) return;

        setFehler(null);
        try {
            await axios.delete("/api/ernaehrungsplan/woche", {
                params: {
                    startDatum: formatiereDatumIso(wochentage[0]),
                    endDatum: formatiereDatumIso(wochentage[6]),
                },
            });
            setEintraege([]);
        } catch {
            setFehler("Wochenplan konnte nicht geleert werden.");
        }
    }

// ------------------NEU NEU US6-----------------------//
    async function generiereUndOeffneEinkaufsliste() {
        setFehler(null);
        try {
            await axios.post("/api/einkaufsliste/generieren", null, {
                params: {
                    startDatum: formatiereDatumIso(wochentage[0]),
                    endDatum: formatiereDatumIso(wochentage[6]),
                },
            });
            navigate("/einkaufsliste");
        } catch {
            setFehler("Einkaufsliste konnte nicht generiert werden.");
        }
    }

    return (
        <section>
            <div className="subpage-header">
                <h2 className="subpage-title">Wochenplan</h2>
            </div>

            {fehler && <p role="alert" className="alert-error">{fehler}</p>}

            <div className="week-plan__scroll">
                <table className="week-plan__table">
                    <thead>
                    <tr>
                        <th scope="col" className="week-plan__corner">Tag</th>
                        {MAHLZEIT_OPTIONEN.map((mahlzeitOption) => {
                            return (
                                <th scope="col" key={mahlzeitOption.art}>
                                    {mahlzeitOption.bezeichnung}
                                </th>
                            );
                        })}
                    </tr>
                    </thead>
                    <tbody>
                    {wochentage.map((wochentag) => {
                        return (
                            <tr key={formatiereDatumIso(wochentag)}>
                                <th scope="row" className="week-plan__row-head">
                                    {formatiereWochentag(wochentag)}
                                </th>
                                {MAHLZEIT_OPTIONEN.map((mahlzeitOption) => {
                                    return (
                                        <WochenplanZelle
                                            key={mahlzeitOption.art}
                                            wochentag={wochentag}
                                            eintraege={eintraege}
                                            rezepte={rezepte}
                                            behandleRezeptAuswahl={behandleRezeptAuswahl}
                                            entferneEintrag={entferneEintrag}
                                            mahlzeitOption={mahlzeitOption}

                                        />
                                    );
                                })}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            {/* ------------------- NEU --------------------------*/}
            <div className="subpage-actions">
                <button
                    type="button"
                    className="btn-primary"
                    onClick={generiereUndOeffneEinkaufsliste}
                >
                    Einkaufsliste aus Wochenplan generieren
                </button>

                <button
                    type="button"
                    className="btn-danger"
                    onClick={leereAktuelleWoche}
                >
                    Wochenplan leeren
                </button>
            </div>

        </section>
    );
}