import {dummyEntry} from "./util/dummyData.ts";

export default function RezeptDetailansicht() {
    return (
        <>
            <h2>{dummyEntry.name}</h2>
            <p>Kategorie: {dummyEntry.kategorie} | Küche: {dummyEntry.kueche}</p>
            <img src={dummyEntry.thumbnail} alt={`Bild von ${dummyEntry.name}`} width={300} height={300}/>
            <h3>Anweisungen:</h3>
            <p>{dummyEntry.anweisungen}</p>
            <h3>Zutaten:</h3>
            <ul>
                {dummyEntry.zutaten.map((zutat) => {
                    return <li key={zutat.name}>{zutat.name} x {zutat.menge}</li>
                })}
            </ul>
        </>
    )
}