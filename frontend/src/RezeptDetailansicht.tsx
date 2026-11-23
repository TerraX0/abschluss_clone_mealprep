import {type Rezept} from "./util/dummyData.ts";
import {Link, useParams} from "react-router";
import {useEffect, useState} from "react";
import axios from "axios";

export default function RezeptDetailansicht() {
    const {id} = useParams<{ id: string }>();
    const [entry, setEntry] = useState<Rezept | null>(null);

    async function fetchEntry() {
        const response = await axios.get<Rezept>(`http://localhost:8080/api/mealprep/${id}`);
        setEntry(response.data)
    }

    useEffect(() => {
        fetchEntry();
    }, [id]);

    if (!entry) {
        return (
            <>
                <p>Der gesuchte Eintrag konnte nicht gefunden werden.</p>
                <Link to="/">← Zurück zur Übersicht</Link>
            </>
        )
    }

    const {name, kategorie, kueche, thumbnail, anweisungen, zutaten} = entry;

    return (
        <>
            <h2>{name}</h2>
            <p>Kategorie: {kategorie} | Küche: {kueche}</p>
            <img src={thumbnail} alt={`Bild von ${name}`} width={300} height={300}/>
            <h3>Anweisungen:</h3>
            <p>{anweisungen}</p>
            <h3>Zutaten:</h3>
            <ul>
                {zutaten.map((zutat) => {
                    return <li key={zutat.name}>{zutat.name} x {zutat.menge}</li>
                })}
            </ul>
            <Link to="/">← Zurück zur Übersicht</Link>
        </>
    )
}