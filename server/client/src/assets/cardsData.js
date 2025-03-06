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
  {
    id: 5,
    name: "Polioboostrix",
    image: "",
    rarity: "common",
    type: "vaccine",
    protectedViruses: [105],
    protectionMap: {
      105: 0.82,
    },
  },
  // Virus Cards
  {
    id: 69,
    name: "Cholera Virus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.37,//carta: 25-50%
    deathProbabilityVaccinated: 0.02, //1-3%
  },
  {
    id: 70,
    name: "Dengue",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.03,//2-5%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id: 71,
    name: "Diphteria",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.7, //5-10%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id: 72,
    name: "Hepatitis A",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.01,
    deathProbabilityVaccinated: 0.001,
  },
  {
    id: 73,
    name: "Hepatitis B",
    image: "/VirusCards/HepatitisB.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.25, //15-25%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 74,
    name: "Yellow Fever",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.37, //20-50%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 75,
    name: "Haemophilus Influenzae Type B",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.07,//3-10%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 76,
    name: "Herpes Zoster",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.01,
    deathProbabilityVaccinated: 0.001, //<0,1%
  },
  {
    id: 77,
    name: "COVID-19 Virus",
    image: "/VirusCards/COVID.png",
    rarity: "legendary",
    type: "virus",
    deathProbability: 0.4, // Base probability if unprotected; carta 3-5%
    deathProbabilityVaccinated: 0.002, // Reduced probability if protected
  },
  {
    id: 78,
    name: "Measles Virus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.15,//10-30%
    deathProbabilityVaccinated: 0.005, 
  },
  {
    id: 79,
    name: "Neisseria Meningitidis Group B",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.15,//10-20%
    deathProbabilityVaccinated: 0.005,
  },
  {
    id:80,
    name: "Neisseria Meningitidis Group A",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.15,//10-20%
    deathProbabilityVaccinated: 0.005,
  },
  {
    id:81,
    name: "Neisseria Meningitidis Group C",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.15,//10-20%
    deathProbabilityVaccinated: 0.005,
  },
  {
    id:82,
    name: "Neisseria Meningitidis Group W-135",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.15,//10-20%
    deathProbabilityVaccinated: 0.005,
  },
  {
    id:83,
    name: "Neisseria Meningitidis Group Y",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.15,//10-20%
    deathProbabilityVaccinated: 0.005,
  },
  {
    id:84,
    name: "Oncogenic Human Papillomavirus (HPV) Type 10",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.001,//<0,1%>
    deathProbabilityVaccinated: 0.0,
  },
  {
    id:85,
    name: "Oncogenic Human Papillomavirus (HPV) Type 16",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:86,
    name: "Oncogenic Human Papillomavirus (HPV) Type 18",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:87,
    name: "Oncogenic Human Papillomavirus (HPV) Type 31",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:88,
    name: "Oncogenic Human Papillomavirus (HPV) Type 33",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:89,
    name: "Oncogenic Human Papillomavirus (HPV) Type 52",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:90,
    name: "Oncogenic Human Papillomavirus (HPV) Type 58",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:91,
    name: "Oncogenic Human Papillomavirus (HPV) Type 6",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.10,//5-15%
    deathProbabilityVaccinated: 0,
  },
  {
    id:92,
    name: "Oncogenic Human Papillomavirus (HPV) Type 7",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.10,//5-15%
    deathProbabilityVaccinated: 0,
  },
  {
    id:93,
    name: "Oncogenic Human Papillomavirus (HPV) Type 8",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.10,//5-15%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:94,
    name: "Oncogenic Human Papillomavirus (HPV) Type 9",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.03,//1-5%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:95,
    name: "Oncogenic Human Papillomavirus (HPV) Type 11",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.03,//1-5%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id:96,
    name: "Oncogenic Human Papillomavirus (HPV) Type 45",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.30,//5-50%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id:97,
    name: "Mumps",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.02,//1-3%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id:98,
    name: "Pertussis",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.02,//1-2%
    deathProbabilityVaccinated: 0.001,
  },
  {
    id: 99,
    name: "Polio Virus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.07,//5-10%
    deathProbabilityVaccinated: 0,
  },
  {
    id: 100,
    name: "Post-Herpetic Neuralgia (PHN)",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.01,
    deathProbabilityVaccinated: 0,
  },
  {
    id: 101,
    name: "Rabies",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 1.00,
    deathProbabilityVaccinated: 0,
  },
  {
    id: 102,
    name: "Rubella",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.01,
    deathProbabilityVaccinated: 0,
  },
  {
    id: 101,
    name: "Rotavirus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.01,
    deathProbabilityVaccinated: 0.001,
  },
  {
    id: 104,
    name: "Salmonella Typhi",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.20, //10-30%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 105,
    name: "Streptococcus pneumoniae",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 1.5,// 10-20%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 106,
    name: "Tetanus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 1.5,// 10-20%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 107,
    name: "Typhoid",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 1.5,// 10-20%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 108,
    name: "Chickenpox (Varicella)",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.1,
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 109,
    name: "Japanese Encephalitis Virus (JEV)",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 2.5,// 20-30%
    deathProbabilityVaccinated: 0.01,
  },
  {
    id: 110,
    name: "Tick-Borne Encephalitis Virus (TBE) ",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.25,// 2-3%
    deathProbabilityVaccinated: 0.01,
    
  },
  {
    id: 111,
    name: "Influenza Virus",
    image: "/VirusCards/Influenza.png",
    rarity: "common",
    type: "virus",
    deathProbability: 0.005,
    deathProbabilityVaccinated: 0.001,
  },
  {
    id: 112,
    name: "SARS-coV-2 Virus",
    image: "/VirusCards/Polio.png",
    rarity: "rare",
    type: "virus",
    deathProbability: 0.04,// 3-5%
    deathProbabilityVaccinated: 0.005,
  },
];