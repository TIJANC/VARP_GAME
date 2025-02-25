// utils/cardsData.js

export const cardsData = [
  // Vaccine Cards
  {
    id: 1,
    name: "Hexacima",
    image: "/Cards/Immagine (1).jpg",
    rarity: "rare",
    type: "vaccine",
    // A vaccine can protect against multiple viruses
    protectedViruses: [101, 102],
    // Optional: a map specifying different protection factors per virus
    protectionMap: {
      101: 0.9,  // 90% effective against virus with id 101
      102: 0.85, // 85% effective against virus with id 102
    },
  },
  {
    id: 2,
    name: "Hexyon",
    image: "/Cards/Immagine (2).jpg",
    rarity: "epic",
    type: "vaccine",
    protectedViruses: [103],
    protectionMap: {
      103: 0.88,
    },
  },
  {
    id: 3,
    name: "Infanrix Hexa",
    image: "/Cards/Immagine (3).jpg",
    rarity: "common",
    type: "vaccine",
    protectedViruses: [104],
    protectionMap: {
      104: 0.8,
    },
  },
  {
    id: 4,
    name: "Vaxelis",
    image: "/Cards/Immagine (4).jpg",
    rarity: "uncommon",
    type: "vaccine",
    protectedViruses: [105],
    protectionMap: {
      105: 0.82,
    },
  },
  // Virus Cards
  {
    id: 101,
    name: "COVID-19 Virus",
    image: "/VirusCards/COVID.png",
    rarity: "legendary",
    type: "virus",
    deathProbability: 0.4, // Base probability if unprotected
    deathProbabilityVaccinated: 0.1, // Reduced probability if protected
  },
  {
    id: 102,
    name: "Influenza Virus",
    image: "/VirusCards/Influenza.png",
    rarity: "common",
    type: "virus",
    deathProbability: 0.3,
    deathProbabilityVaccinated: 0.05,
  },
  {
    id: 103,
    name: "Hepatitis B Virus",
    image: "/VirusCards/HepatitisB.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.25,
    deathProbabilityVaccinated: 0.07,
  },
  {
    id: 104,
    name: "MMR Virus",
    image: "/VirusCards/MMR.png",
    rarity: "uncommon",
    type: "virus",
    deathProbability: 0.2,
    deathProbabilityVaccinated: 0.05,
  },
  {
    id: 105,
    name: "Polio Virus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.35,
    deathProbabilityVaccinated: 0.08,
  },
];
