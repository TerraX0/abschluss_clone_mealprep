import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router";
import type { Zutat } from "../types/recipe";

function EigenesRezeptFormular() {
    const [name, setName] = useState("");
    const [kategorie, setKategorie] = useState("");
    const [anweisungen, setAnweisungen] = useState("");
    const [zutaten, setZutaten] = useState<Zutat[]>([{ name: "", menge: "" }]);
    const [kategorien, setKategorien] = useState<string[]>([]);

    const [nameFehler, setNameFehler] = useState("");
    const [kategorieFehler, setKategorieFehler] = useState("");
    const [anweisungenFehler, setAnweisungenFehler] = useState("");
    const [zutatenFehler, setZutatenFehler] = useState("");
    const [serverFehler, setServerFehler] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadKategorien() {
            try {
                const response = await fetch("/api/mealprep/kategorien");
                if (response.ok) {
                    const data = await response.json();
                    setKategorien(data);
                }
            } catch {
                console.log("Kategorien konnten nicht geladen werden");
            }
        }
        void loadKategorien();
    }, []);

    function aendereZutatName(index: number, wert: string) {
        const neueZutaten = [...zutaten];
        neueZutaten[index] = { name: wert, menge: neueZutaten[index].menge };
        setZutaten(neueZutaten);
    }

    function aendereZutatMenge(index: number, wert: string) {
        const neueZutaten = [...zutaten];
        neueZutaten[index] = { name: neueZutaten[index].name, menge: wert };
        setZutaten(neueZutaten);
    }

    function zutatHinzufuegen() {
        setZutaten([...zutaten, { name: "", menge: "" }]);
    }

    function zutatEntfernen(index: number) {
        setZutaten(zutaten.filter((_, i) => i !== index));
    }

    function eingabenPruefen() {
        let allesOk = true;

        setNameFehler("");
        setKategorieFehler("");
        setAnweisungenFehler("");
        setZutatenFehler("");

        if (name.trim() === "") {
            setNameFehler("Bitte gib einen Titel ein.");
            allesOk = false;
        }
        if (kategorie === "") {
            setKategorieFehler("Bitte wähle eine Kategorie.");
            allesOk = false;
        }
        if (anweisungen.trim() === "") {
            setAnweisungenFehler("Bitte beschreibe die Zubereitung.");
            allesOk = false;
        }
        for (const zutat of zutaten) {
            if (zutat.name.trim() === "" || zutat.menge.trim() === "") {
                setZutatenFehler("Jede Zutat braucht einen Namen und eine Menge.");
                allesOk = false;
            }
        }

        return allesOk;
    }

    async function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        setServerFehler("");

        if (!eingabenPruefen()) {
            return;
        }

        try {
            const response = await fetch("/api/rezepte/eigene", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    kategorie: kategorie,
                    anweisungen: anweisungen,
                    zutaten: zutaten,
                }),
            });

            if (response.ok) {
                navigate("/sammlung");
            } else if (response.status === 400) {
                setServerFehler("Bitte prüfe deine Eingaben. Ein Feld ist ungültig.");
            } else {
                setServerFehler("Speichern hat nicht geklappt (Fehler " + response.status + ").");
            }
        } catch {
            setServerFehler("Keine Verbindung zum Server.");
        }
    }

    return (
        <div>
            <h2>Eigenes Rezept anlegen</h2>
            <Link to="/sammlung">← Zurück zu meinen Rezepten</Link>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Titel</label><br />
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                    {nameFehler !== "" && <p style={{ color: "red" }}>{nameFehler}</p>}
                </div>

                <div>
                    <label>Kategorie</label><br />
                    <select value={kategorie} onChange={(e) => setKategorie(e.target.value)}>
                        <option value="">Bitte wählen</option>
                        {kategorien.map((k) => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                    {kategorieFehler !== "" && <p style={{ color: "red" }}>{kategorieFehler}</p>}
                </div>

                <div>
                    <label>Zubereitung</label><br />
                    <textarea
                        rows={6}
                        cols={50}
                        value={anweisungen}
                        onChange={(e) => setAnweisungen(e.target.value)}
                    />
                    {anweisungenFehler !== "" && <p style={{ color: "red" }}>{anweisungenFehler}</p>}
                </div>

                <h3>Zutaten</h3>
                {zutaten.map((zutat, index) => (
                    <div key={index}>
                        <input
                            placeholder="Zutat, z. B. Kartoffeln"
                            value={zutat.name}
                            onChange={(e) => aendereZutatName(index, e.target.value)}
                        />
                        <input
                            placeholder="Menge, z. B. 500 g"
                            value={zutat.menge}
                            onChange={(e) => aendereZutatMenge(index, e.target.value)}
                        />
                        {zutaten.length > 1 && (
                            <button type="button" onClick={() => zutatEntfernen(index)}>✕</button>
                        )}
                    </div>
                ))}
                {zutatenFehler !== "" && <p style={{ color: "red" }}>{zutatenFehler}</p>}
                <button type="button" onClick={zutatHinzufuegen}>+ Zutat hinzufügen</button>

                <br /><br />
                <button type="submit">Rezept speichern</button>
                {serverFehler !== "" && <p style={{ color: "red" }}>{serverFehler}</p>}
            </form>
        </div>
    );
}

export default EigenesRezeptFormular;