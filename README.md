## Datenmodell

Gericht aus der API:
``` java
id: String
name: String
kategorie: Kategorie (ENUM) (ENUM der API Kategorien)
kueche: String
region: String
anweisungen: String
thumbnail: String
zutaten:Arraylist<Zutat> // aus alle strIngedient und strMeasure
istFavorit: boolean
```

- Zutat

```java
id: String
rezept_id: String (FK)
name: String
menge: String
```


- Kategorie:
```java
id: String
name: String
beschreibung: String
```

- Vorratskammer:
```java
id: String
name: String
menge: String
verfuegbar: boolean
```
- Ernährungsplaneintrag:
```java
id: String
rezept_id: String (FK)
wochentag: String
mahlzeitTyp: ENUM (Frühstück, Mittagessen, Abendessen)
portionen: int
```
    
- EinkaufslistenEintrag: 
```java
id: String
ernaehrungsplan_eintrag_id: String (FK)
name: String
menge: String
inVorratskammer: boolean
istAbgehakt: boolean
```

## Endpunkte

GET /api/mealprep/search

US1:

1. GET /api/mealprep/search

- HTTP-Status: 200 OK (auch bei leerer Trefferliste []). 
- Format: JSON-Array (List<Gericht>) mit den passenden Gerichten. 
- Struktur
     pro Element im Array: Entspricht dem Modell Gericht (id, name,
     kategorie, kueche, region, anweisungen, thumbnail, zutaten als Array aus Zutat-Objekten
     mit id, rezept_id, name, menge und istFavorit). 

Beispiel:
```JSON
[
  {
    "id": "52771",
    "name": "Spicy Arrabiata Penne",
    "kategorie": "VEGETARIAN",
    "kueche": "Italian",
    "region": "Italian",
    "anweisungen": "Bring a large pot of water to a boil...",
    "thumbnail": "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
    "zutaten": [
      {
        "id": "z-1",
        "rezept_id": "52771",
        "name": "penne rigate",
        "menge": "1 pound"
      },
      {
        "id": "z-2",
        "rezept_id": "52771",
        "name": "olive oil",
        "menge": "1/4 cup"
      }
    ],
    "istFavorit": false
  }
]

Query-Parameter (beide optional): 

- query: Suchwort (String), z. B. im Rezeptnamen (und optional passend zur Kategoriebezeichnung).

- kategorie: Filterwert aus dem Kategorie-Enum (z. B. VEGETARIAN, PASTA, OTHER) 


2. GET /api/mealprep/recipes/{id}

-	HTTP-Status: 200 OK, wenn gefunden. 404 Not Found, wenn keine passende ID existiert.
-	Format: Ein einzelnes JSON-Objekt (Gericht) inklusive aller ihm zugehörigen Zutaten. 

Beispiel:
JSON
{
  "id": "52771",
  "name": "Spicy Arrabiata Penne",
  "kategorie": "VEGETARIAN",
  "kueche": "Italian",
  "region": "Italian",
  "anweisungen": "Bring a large pot of water to a boil...",
  "thumbnail": "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
  "zutaten": [
    {
      "id": "z-1",
      "rezept_id": "52771",
      "name": "penne rigate",
      "menge": "1 pound"
    }
  ],
  "istFavorit": false
}

3. GET /api/mealprep/categories
Für das Dropdown "Kategorien".
Dynamisch aus dem Backend: Das Frontend ruft beim Laden GET /api/mealprep/categories auf und baut das Dropdown aus dem zurückgegebenen JSON-Array auf.

- HTTP-Status: 200 OK. 
- Format: JSON-Array mit Kategorie-Objekten (id, name, [Wert aus Kategorie-Enum], beschreibung).

Beispiel:

```JSON
[
    {
    "id": "1",
    "name": "VEGETARIAN",
    "beschreibung": "Gerichte ohne Fleisch und Fisch"
    },
{
    "id": "2",
    "name": "PASTA",
    "beschreibung": "Nudelgerichte"
},
{
    "id": "3",
    "name": "OTHER",
    "beschreibung": "Sonstige / nicht zugeordnete Kategorien"
}
]

US2:

1. PUT /api/mealprep/recipes/{id}/favorite

- HTTP-Status: 200 OK, wenn der Favoritenstatus erfolgreich gesetzt wurde.
- 400 Bad Request, wenn der Request-Body ungültig oder unvollständig ist.
- 404 Not Found, wenn kein Gericht mit der angegebenen {id} gefunden wurde.
- 
-	Request-Body (Beispiel):
JSON
{
  "istFavorit": true
}

Response-Format: Ein einzelnes JSON-Objekt (Gericht) mit dem aktualisierten istFavorit-Wert (true oder false) 
inklusive aller zugehörigen zutaten.

JSON
{
  "id": "52771",
  "name": "Spicy Arrabiata Penne",
  "kategorie": "VEGETARIAN",
  "kueche": "Italian",
  "region": "Italian",
  "anweisungen": "Bring a large pot of water to a boil...",
  "thumbnail": "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
  "zutaten": [
    {
      "id": "z-1",
      "rezept_id": "52771",
      "name": "penne rigate",
      "menge": "1 pound"
    }
  ],
  "istFavorit": true
}


2. GET /api/mealprep/favorites

- HTTP-Status: 200 OK (auch wenn noch keine Favoriten vorhanden sind – dann als leeres JSON-Array []).
- Format: JSON-Array mit allen Gerichten, bei denen istFavorit auf true steht (jeweils inklusive zutaten als Array).

JSON
[
  {
    "id": "52771",
    "name": "Spicy Arrabiata Penne",
    "kategorie": "VEGETARIAN",
    "kueche": "Italian",
    "region": "Italian",
    "anweisungen": "Bring a large pot of water to a boil...",
    "thumbnail": "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
    "zutaten": [
      {
        "id": "z-1",
        "rezept_id": "52771",
        "name": "penne rigate",
        "menge": "1 pound"
      }
    ],
    "istFavorit": true
  }
]


