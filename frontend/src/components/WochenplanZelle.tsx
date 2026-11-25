import type {WochenplanZelleProps} from "../types/wochenplan.ts";
import type {ChangeEvent} from "react";
import type {GespeichertesRezept} from "../types/recipe.ts";
import {formatiereDatumIso} from "../util/formatiereDatumIso.ts";
import {formatiereWochentag} from "../util/formatiereWochentag.ts";

export default function WochenplanZelle({
                                            wochentag,
                                            eintraege,
                                            rezepte,
                                            behandleRezeptAuswahl,
                                            entferneEintrag,
                                            mahlzeitOption
                                        }: WochenplanZelleProps) {
    const datum = formatiereDatumIso(wochentag);

    const eintrag = eintraege.find((aktuellerEintrag) => {
        return aktuellerEintrag.datum === datum && aktuellerEintrag.mahlzeit === mahlzeitOption.art;
    });

    const rezept = rezepte.find((aktuellesRezept: GespeichertesRezept) => {
        return aktuellesRezept.id === eintrag?.rezeptId;
    });

    return (
        <td className="week-plan__cell">
            <select
                className={`form-select week-plan__select${rezept ? " week-plan__select--filled" : ""}`}
                aria-label={`${mahlzeitOption.bezeichnung} am ${formatiereWochentag(wochentag)}`}
                value=""
                onChange={(ereignis: ChangeEvent<HTMLSelectElement>) => {
                    behandleRezeptAuswahl(ereignis, datum, mahlzeitOption.art);
                }}
            >
                <option value="">{rezept?.name || "+Rezept wählen"}</option>
                {rezepte.map((aktuellesRezept) => (
                    <option key={aktuellesRezept.id} value={aktuellesRezept.id}>
                        {aktuellesRezept.name}
                    </option>
                ))}
            </select>
            {/* ---------------------------NEU ---------------------*/}
            {eintrag && (
                <button
                    type="button"
                    className="btn-danger"
                    onClick={() => entferneEintrag(eintrag.id)}
                    aria-label={`${rezept?.name ?? "Eintrag"} am ${formatiereWochentag(wochentag)} entfernen`}
                >
                    Entfernen
                </button>
            )}
        </td>
    );
}