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