import { useEffect, useState, type SyntheticEvent } from "react";
import { Link, useNavigate, useParams } from "react-router"; // NEU: useParams
import type { GespeichertesRezept, Zutat } from "../types/recipe"; // NEU: GespeichertesRezept

function EigenesRezeptFormular() {
    const { id } = useParams(); // NEU
    const istBearbeiten = id !== undefined; // NEU

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

    // NEU: Beim Bearbeiten das bestehende Rezept laden und die Felder füllen
    useEffect(() => {
        async function loadRezept() {
            try {
                const response = await fetch("/api/rezepte");
                if (response.ok) {
                    const data: GespeichertesRezept[] = await response.json();
                    const rezept = data.find((r) => r.id === Number(id));

                    if (rezept === undefined) {
                        setServerFehler("Dieses Rezept wurde nicht gefunden.");
                    } else {
                        setName(rezept.name);
                        setKategorie(rezept.kategorie);
                        setAnweisungen(rezept.anweisungen);
                        setZutaten(rezept.zutaten);
                    }
                }
            } catch {
                setServerFehler("Keine Verbindung zum Server.");
            }
        }

        if (istBearbeiten) {
            void loadRezept();
        }
    }, [id, istBearbeiten]);

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

        // NEU: Adresse und Methode hängen davon ab, ob wir anlegen oder bearbeiten
        let url = "/api/rezepte/eigene";
        let methode = "POST";
        if (istBearbeiten) {
            url = "/api/rezepte/" + id;
            methode = "PUT";
        }

        try {
            const response = await fetch(url, {
                method: methode,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name,
                    kategorie: kategorie,
                    anweisungen: anweisungen,
                    zutaten: zutaten,
                }),
            });

            if (response.ok) {
                navigate("/rezepte");
            } else if (response.status === 400) {
                setServerFehler("Bitte prüfe deine Eingaben. Ein Feld ist ungültig.");
            } else if (response.status === 404) {
                setServerFehler("Dieses Rezept gibt es nicht mehr.");
            } else if (response.status === 409) {
                setServerFehler("Gespeicherte Rezepte aus der Suche können nicht bearbeitet werden.");
            } else {
                setServerFehler("Speichern hat nicht geklappt (Fehler " + response.status + ").");
            }
        } catch {
            setServerFehler("Keine Verbindung zum Server.");
        }
    }

    return (
        <div>
            <Link to="/rezepte" className="back-link">← Zurück zu meinen Rezepten</Link>
            <div className="subpage-header">
                {/* NEU: Überschrift passend zum Modus */}
                <h2 className="subpage-title">{istBearbeiten ? "Rezept bearbeiten" : "Eigenes Rezept anlegen"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="recipe-form-card">
                <div className="form-group">
                    <label className="form-label">Titel</label><br />
                    <input
                        className="form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    {nameFehler !== "" && <p className="form-error">{nameFehler}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">Kategorie</label><br />
                    <select
                        className="form-select"
                        value={kategorie}
                        onChange={(e) => setKategorie(e.target.value)}
                    >
                        <option value="">Bitte wählen</option>
                        {kategorien.map((k) => (
                            <option key={k} value={k}>{k}</option>
                        ))}
                    </select>
                    {kategorieFehler !== "" && <p className="form-error">{kategorieFehler}</p>}
                </div>

                <div className="form-group">
                    <label className="form-label">Zubereitung</label><br />
                    <textarea
                        className="form-textarea"
                        rows={6}
                        cols={50}
                        value={anweisungen}
                        onChange={(e) => setAnweisungen(e.target.value)}
                    />
                    {anweisungenFehler !== "" && <p className="form-error">{anweisungenFehler}</p>}
                </div>

                <div className="ingredients-section">
                    <h3 className="ingredients-heading">Zutaten</h3>
                    {zutaten.map((zutat, index) => (
                        <div key={index} className="ingredient-row">
                            <input
                                className="form-input"
                                placeholder="Zutat, z. B. Kartoffeln"
                                value={zutat.name}
                                onChange={(e) => aendereZutatName(index, e.target.value)}
                            />
                            <input
                                className="form-input"
                                placeholder="Menge, z. B. 500 g"
                                value={zutat.menge}
                                onChange={(e) => aendereZutatMenge(index, e.target.value)}
                            />
                            {zutaten.length > 1 && (
                                <button
                                    type="button"
                                    className="ingredient-remove-btn"
                                    onClick={() => zutatEntfernen(index)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {zutatenFehler !== "" && <p className="form-error">{zutatenFehler}</p>}
                    <button type="button" className="btn-secondary" onClick={zutatHinzufuegen}>
                        + Zutat hinzufügen
                    </button>
                </div>

                <br /><br />
                <div className="form-submit-row">
                    {/* NEU: Button-Text passend zum Modus */}
                    <button type="submit" className="btn-primary">
                        {istBearbeiten ? "Änderungen speichern" : "Rezept speichern"}
                    </button>
                    {serverFehler !== "" && <p className="alert-error">{serverFehler}</p>}
                </div>
            </form>
        </div>
    );
}

export default EigenesRezeptFormular;