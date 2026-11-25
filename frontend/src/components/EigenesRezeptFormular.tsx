import { useEffect, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";
import type { Zutat } from "../types/recipe";


function EigenesRezeptFormular() {
    const [name, setName] = useState("");
    const [kategorie, setKategorie] = useState("");
    const [anweisungen, setAnweisungen] = useState("");
    const [zutaten, setZutaten] = useState<Zutat[]>([{ name: "", menge: "" }]);
    const [kategorien, setKategorien] = useState<string[]>([]);

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
        loadKategorien();
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

    function handleSubmit(e: SyntheticEvent) {
        e.preventDefault();
        console.log({ name, kategorie, anweisungen, zutaten });
    }

    return (
        <div>
            <h2>Eigenes Rezept anlegen</h2>
            <Link to="/sammlung">← Zurück zu meinen Rezepten</Link>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Titel</label><br />
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                    <label>Kategorie</label><br />
                    <select value={kategorie} onChange={(e) => setKategorie(e.target.value)}>
                        <option value="">Bitte wählen</option>
                        {kategorien.map((k) => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Zubereitung</label><br />
                    <textarea
                        rows={6}
                        cols={50}
                        value={anweisungen}
                        onChange={(e) => setAnweisungen(e.target.value)}
                    />
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
                <button type="button" onClick={zutatHinzufuegen}>+ Zutat hinzufügen</button>

                <br /><br />
                <button type="submit">Rezept speichern</button>
            </form>
        </div>
    );
}

export default EigenesRezeptFormular;