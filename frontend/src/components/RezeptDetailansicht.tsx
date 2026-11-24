import {Link, useParams} from "react-router";
import {useEffect, useState} from "react";
import axios from "axios";
import type {ApiError, Gericht} from "../types/recipe.ts";

export default function RezeptDetailansicht() {
    const {id} = useParams<{ id: string }>();
    const [entry, setEntry] = useState<Gericht | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<undefined | null | string>(null);
    const [saveMessage, setSaveMessage] = useState("");

    async function fetchEntry() {
        try {
            setIsLoading(true)
            const response = await axios.get<Gericht>(`/api/mealprep/${id}`);
            setEntry(response.data)
            setError(null);
        } catch (error) {
            if (axios.isAxiosError<ApiError>(error)) {
                console.error(error.response?.data.message);
                setError(error.response?.data.message)
            }
        } finally {
            setIsLoading(false)
        }
    }
    async function handleSave() {
        setSaveMessage("");

        try {
            const response = await fetch("/api/rezepte", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });

            if (response.ok) {
                setSaveMessage("✓ Rezept wurde in deiner Sammlung gespeichert.");
            } else if (response.status === 409) {
                setSaveMessage("Dieses Rezept ist bereits in deiner Sammlung.");
            } else {
                setSaveMessage("Speichern hat nicht geklappt. Bitte versuche es erneut.");
            }
        } catch {
            setSaveMessage("Keine Verbindung zum Server.");
        }
    }

    useEffect(() => {
        fetchEntry();
    }, [id]);

    if (isLoading) {
        return <p>Rezept wird geladen</p>;
    }

    if (error) {
        return (
            <>
                <p>Fehler beim Laden des Eintrags: {error}</p>
                <Link to="/">← Zurück zur Übersicht</Link>
            </>
        )
    }

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
            <button onClick={handleSave}>In meiner Sammlung speichern</button>
            {saveMessage !== "" && <p>{saveMessage}</p>}
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