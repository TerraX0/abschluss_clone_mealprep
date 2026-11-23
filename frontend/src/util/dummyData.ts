type Kategorie = "Beef" | "Chicken" | "Dessert" | "Lamb"
    | "Miscellaneous" | "Pasta" | "Pork" | "Seafood" | "Side" | "Starter"
    | "Vegan" | "Vegetarian" | "Breakfast" | "Goat"

interface Zutat {
    name: string,
    menge: string
}

interface Rezept {
    id: string,
    name: string,
    kategorie: Kategorie,
    kueche: string,
    region: string,
    anweisungen: string,
    thumbnail: string,
    zutaten: Zutat[], // aus alle strIngedient und strMeasure
    istFavorit: boolean
}

export const dummyEntry: Rezept = {
    id: "52771",
    name: "Spicy Arrabiata Penne",
    kategorie: "Vegetarian",
    kueche: "Italian",
    region: "Italy",
    anweisungen: "Bring a large pot of water to a boil. Add kosher salt to the boiling water, then add the pasta. " +
        "Cook according to the package instructions, about 9 minutes." +
        "\r\nIn a large skillet over medium-high heat, add the olive oil and heat until the oil starts to shimmer. " +
        "Add the garlic and cook, stirring, until fragrant, 1 to 2 minutes. Add the chopped tomatoes, red chile flakes, " +
        "Italian seasoning and salt and pepper to taste. Bring to a boil and cook for 5 minutes. Remove from the heat " +
        "and add the chopped basil.\r\nDrain the pasta and add it to the sauce. Garnish with Parmigiano-Reggiano " +
        "flakes and more basil and serve warm.",
    thumbnail: "https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg",
    zutaten: [
        {
            name: "penne rigate",
            menge: "1 pound"
        },
        {
            name: "olive oil",
            menge: "1/4 cup"
        },
        {
            name: "garlic",
            menge: "3 gloves"
        },
        {
            name: "chopped tomatoes",
            menge: "1 tin"
        },
        {
            name: "red chilli flakes",
            menge: "1/2 teaspoon"
        },
        {
            name: "italian seasoning",
            menge: "1/2 teaspoon"
        },
        {
            name: "basil",
            menge: "6 leaves"
        },
        {
            name: "Parmiggiano-Reggiano",
            menge: "sprinkling"
        }
    ],
    istFavorit: false
}