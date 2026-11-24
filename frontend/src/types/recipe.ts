export interface Zutat {
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

export type ApiError = {
    message: string;
    code: number;
};