export interface Zutat {
    id: string;
    rezept_id: string;
    name: string;
    menge: string;
}

export interface Gericht {
    id: string;
    name: string;
    kategorie: string;
    kueche: string;
    region: string;
    anweisungen: string;
    thumbnail: string;
    zutaten: Zutat[];
    istFavorit: boolean;
}