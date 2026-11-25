import type {GespeichertesRezept} from "./recipe.ts";
import type {ChangeEvent} from "react";

export type Mahlzeit = "FRUEHSTUECK" | "MITTAGESSEN" | "ABENDESSEN";

export interface WochenplanEintrag {
    id: number;
    datum: string;
    mahlzeit: Mahlzeit;
    rezeptId: string | number;
    portionen: number
}

export interface WochenplanZelleProps {
    wochentag: Date;
    eintraege: WochenplanEintrag[];
    rezepte: GespeichertesRezept[];
    behandleRezeptAuswahl: (
        ereignis: ChangeEvent<HTMLSelectElement>,
        datum: string,
        mahlzeit: Mahlzeit
    ) => void;
    entferneEintrag: (eintragId: number) => void | Promise<void>;
    mahlzeitOption: MahlzeitOption; // Optionstyp
}

export type NeuerWochenplanEintrag = Omit<WochenplanEintrag, "id">;

interface MahlzeitOption {
    art: Mahlzeit;
    bezeichnung: string;
}

export const MAHLZEIT_OPTIONEN: MahlzeitOption[] = [
    {art: "FRUEHSTUECK", bezeichnung: "Frühstück"},
    {art: "MITTAGESSEN", bezeichnung: "Mittagessen"},
    {art: "ABENDESSEN", bezeichnung: "Abendessen"},
];

export interface WochenplanZelleProps {
    wochentag: Date,
    eintraege: WochenplanEintrag[],
    rezepte: GespeichertesRezept[],
    behandleRezeptAuswahl: (ereignis: ChangeEvent<HTMLSelectElement>,
                            datum: string,
                            mahlzeit: Mahlzeit) => void,
    mahlzeitOption: MahlzeitOption
}