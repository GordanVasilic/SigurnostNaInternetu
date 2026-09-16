export interface Question {
  id: number;
  question: string;
  options: [string, string, string];
  correctIndex: number;
  explanation: string;
  category: string;
}

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Koja je najvažnija osobina jake lozinke za tvoj korisnički nalog?",
    options: [
      "Da se sastoji samo od tvog imena i godine rođenja",
      "Da ima tačno 6 malih slova koja se lako pamte",
      "Da je dugačka (12+ znakova) i kombinuje velika i mala slova, brojeve i simbole"
    ],
    correctIndex: 2, // C
    explanation: "Dugačke lozinke koje kombinuju slova, brojeve i specijalne znakove (!, ?, #, $) računari ne mogu lako pogoditi. Nikada ne koristi jednostavno ime ili '123456'.",
    category: "Lozinke"
  },
  {
    id: 2,
    question: "Šta je 'Phishing' (pecanje) na internetu?",
    options: [
      "Lažna poruka ili link koji pokušava da te prevari da otkriješ svoju lozinku ili podatke",
      "Način da besplatno i legalno ubrzaš kućni internet",
      "Igranje igrica o pecanju riba na telefonu"
    ],
    correctIndex: 0, // A
    explanation: "Phishing je prevara u kojoj se hakeri pretvaraju da su Instagram, banka ili podrška, šaljući lažan link kako bi ukrali tvoju šifru.",
    category: "Prevare i Phishing"
  },
  {
    id: 3,
    question: "Šta označava dvofaktorska zaštita (2FA)?",
    options: [
      "Korištenje istog naloga na dva različita računara u isto vrijeme",
      "Dodatni sigurnosni korak (npr. SMS kod ili autentifikator) pored lozinke pri prijavi",
      "Lozinka koju moraš unijeti dva puta zaredom"
    ],
    correctIndex: 1, // B
    explanation: "2FA pruža dvostruku zaštitu: čak i ako neko sazna tvoju lozinku, ne može ući na tvoj profil bez koda koji stiže na tvoj telefon.",
    category: "Sigurnost naloga"
  },
  {
    id: 4,
    question: "Zašto treba biti oprezan sa besplatnim javnim Wi-Fi mrežama (u kafićima, parkovima)?",
    options: [
      "Zato što hakeri na istoj mreži mogu lakše presresti tvoje nezaštićene podatke i šifre",
      "Zato što javni Wi-Fi odmah isprazni bateriju telefona",
      "Zato što je zakonom zabranjeno koristiti internet van kuće"
    ],
    correctIndex: 0, // A
    explanation: "Javne Wi-Fi mreže su često nezaštićene. Za prijavu na važne profile i plaćanje uvijek je sigurnije koristiti mobilni internet.",
    category: "Mrežna zaštita"
  },
  {
    id: 5,
    question: "Drugar ti preko poruke šalje link za 'besplatne skinove / Robux / krekovanu igricu'. Šta je najvjerovatnije u pitanju?",
    options: [
      "Pravi zvanični poklon od proizvođača igrice",
      "Zvanična nagradna igra u kojoj svako dobija",
      "Zlonamjerni virus ili lažna stranica koja služi za krađu tvog naloga"
    ],
    correctIndex: 2, // C
    explanation: "Iza ponuda za 'besplatne skinove, Robux ili čitove' najčešće se kriju kradljivci naloga. Nikada ne unosi svoje podatke na takve linkove!",
    category: "Prevare u igricama"
  },
  {
    id: 6,
    question: "Koji od navedenih podataka NIKADA ne bi trebalo javno objavljivati na profilu društvenih mreža?",
    options: [
      "Naziv omiljene pjesme ili omiljenog filma",
      "Svoju tačnu kućnu adresu, broj telefona i lokaciju uživo",
      "Ime omiljenog sportiste ili kluba za koji navijaš"
    ],
    correctIndex: 1, // B
    explanation: "Javnim dijeljenjem adrese, broja telefona ili lokacije uživo ugrožavaš svoju bezbjednost. Ti podaci treba da ostanu privatni.",
    category: "Privatnost"
  },
  {
    id: 7,
    question: "Šta predstavlja tvoj 'digitalni otisak' (digital footprint)?",
    options: [
      "Sve slike, poruke, komentari i objave koje ostaviš na internetu i koje ostaju trajno zabilježene",
      "Skeniran otisak prsta kojim otključavaš pametni telefon",
      "Broj koraka i kilometara koje pređeš dok nosiš telefon"
    ],
    correctIndex: 0, // A
    explanation: "Sve što objaviš na internetu ostaje negdje sačuvano čak i ako obrišeš. Zato uvijek razmisli prije nego što nešto postaviš!",
    category: "Privatnost"
  },
  {
    id: 8,
    question: "Dobijaš poruku od profila svog druga: 'Hitno mi pošalji 20 KM ili kod koji ti stigne na SMS!'. Šta prvo treba posumnjati?",
    options: [
      "Drug je u stvarnoj opasnosti i treba odmah poslati novac",
      "Sistem telefona sam greškom šalje poruke",
      "Neko je hakovao profil tvog druga i sada pokušava prevariti njegove prijatelje"
    ],
    correctIndex: 2, // C
    explanation: "Kada profil prijatelja traži novac ili SMS kodove, prvo ga nazovi običnim telefonskim pozivom i provjeri da li je njegov nalog hakovan.",
    category: "Prevare"
  },
  {
    id: 9,
    question: "Šta označava ikonica zaključanog katanca pored veb adrese (https)?",
    options: [
      "Sajt je potpuno zabranjen za maloljetnike",
      "Veza sa sajtom je šifrovana i bezbjednija za prenos podataka",
      "Sajt nema nikakve reklame i potpuno je besplatan"
    ],
    correctIndex: 1, // B
    explanation: "Katanac i 'https' označavaju da je prenos podataka između tvog telefona i sajta šifrovan, što štiti podatke od prisluškivanja.",
    category: "Web Sigurnost"
  },
  {
    id: 10,
    question: "Šta je 'Deepfake' prevara na internetu?",
    options: [
      "Korištenje vještačke inteligencije (AI) za lažiranje nečijeg glasa ili lica u videu ili pozivu",
      "Igranje podvodnih video igrica preko računara",
      "Brisanje starih i mutnih fotografija iz memorije telefona"
    ],
    correctIndex: 0, // A
    explanation: "Danas vještačka inteligencija može vjerno klonirati nečiji glas ili lice. Zato uvijek provjeri sumnjive pozive i video poruke koje traže novac!",
    category: "AI i Tehnologija"
  },
  {
    id: 11,
    question: "Šta podrazumijeva pojam 'Cyberbullying' (digitalno nasilje)?",
    options: [
      "Kvarenje miša ili tastature na školskom računaru",
      "Igranje akcionih video igrica protiv drugih igrača",
      "Vrijeđanje, ismijavanje, prijetnje ili isključivanje nekoga putem poruka i društvenih mreža"
    ],
    correctIndex: 2, // C
    explanation: "Digitalno nasilje ostavlja stvarne i bolne posljedice. Na internetu važe ista pravila lijepog ponašanja kao i u stvarnom životu.",
    category: "Digitalni bonton"
  },
  {
    id: 12,
    question: "Šta je 'Ransomware' (ucjenjivački virus)?",
    options: [
      "Program koji besplatno čisti i ubrzava rad računara",
      "Zlonamjerni program koji zaključa tvoje fajlove i traži otkup (novac) za otključavanje",
      "Aplikacija za slušanje muzike bez reklama"
    ],
    correctIndex: 1, // B
    explanation: "Ransomware šifruje fajlove i traži otkup. Najbolja odbrana je redovno čuvanje rezervne kopije (backup) na USB disku ili oblaku.",
    category: "Zaštita uređaja"
  },
  {
    id: 13,
    question: "Osoba koju znaš samo preko video igrice traži da se nađete tajno uživo bez znanja roditelja. Šta treba uraditi?",
    options: [
      "Odbiti susret i odmah sve ispričati roditeljima, jer se iza profila može kriti bilo ko",
      "Otići na susret sam/a i ponijeti novac za druženje",
      "Poslati joj ključeve i adresu od svog stana"
    ],
    correctIndex: 0, // A
    explanation: "Na internetu se svako može lažno predstaviti kao tvoj vršnjak. Nikada se ne sastaj sa nepoznatim ljudima sa interneta bez znanja i prisustva roditelja!",
    category: "Lična bezbjednost"
  },
  {
    id: 14,
    question: "Ako primijetiš da je neko žrtva nasilja na internetu ili se tebi desi neprijatnost, koji je NAJBOLJI korak?",
    options: [
      "Ćutati i sakriti telefon nadajući se da će samo proći",
      "Svađati se i uzvraćati još težim uvredama",
      "Napraviti screenshot (dokaz) i odmah potražiti pomoć roditelja, nastavnika ili stručnih službi"
    ],
    correctIndex: 2, // C
    explanation: "Uvijek sačuvaj dokaz (screenshot poruke) i odmah se obrati odrasloj osobi od povjerenja. Nisi sam/a i postoji pomoć!",
    category: "Pomoć i podrška"
  }
];
