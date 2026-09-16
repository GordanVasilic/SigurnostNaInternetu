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
    question: "Koja od navedenih lozinki je NAJSIGURNIJA za tvoj korisnički nalog?",
    options: [
      "Sergej2010",
      "12345678",
      "S#rg3j!Njeg0s#9"
    ],
    correctIndex: 2,
    explanation: "Dobre lozinke imaju najmanje 12 znakova, sadrže velika i mala slova, brojeve i specijalne simbole (!, #, $, %). Nikada ne koristi jednostavno ime i godinu rođenja.",
    category: "Lozinke i nalozi"
  },
  {
    id: 2,
    question: "Šta je 'Phishing' (pecanje) na internetu?",
    options: [
      "Lov na ribe u video igricama",
      "Pokušaj prevare lažnim porukama i linkovima radi krađe podataka",
      "Besplatno i bezbjedno preuzimanje programa"
    ],
    correctIndex: 1,
    explanation: "Phishing je prevara u kojoj se napadač pretvara da je poznata kompanija ili prijatelj kako bi te naveo da uneseš lozinku ili lične podatke na lažnu stranicu.",
    category: "Prevare i Phishing"
  },
  {
    id: 3,
    question: "Šta označava dvofaktorska autentifikacija (2FA)?",
    options: [
      "Dvije lozinke koje moraš zapamtiti napamet",
      "Dodatni nivo zaštite (npr. SMS kod ili aplikacija) uz redovnu lozinku",
      "Istovremeno prijavljivanje na dva različita telefona"
    ],
    correctIndex: 1,
    explanation: "2FA pruža dodatnu sigurnost: čak i ako neko sazna tvoju lozinku, ne može ući na tvoj nalog bez jednokratnog koda sa tvog telefona.",
    category: "Lozinke i nalozi"
  },
  {
    id: 4,
    question: "Nepoznati profil na Instagramu ti šalje link: 'Pogledaj ko priča o tebi!'. Šta treba uraditi?",
    options: [
      "Odmah kliknuti na link iz radoznalosti",
      "Ne otvarati sumnjivi link, blokirati i prijaviti taj profil",
      "Proslijediti link svim drugarima iz razreda"
    ],
    correctIndex: 1,
    explanation: "Senzacionalne poruke koje bude radoznalost ili strah su najčešća zamka hakera za preuzimanje Instagram naloga. Nikada ne klikći na sumnjive linkove!",
    category: "Prevare i Phishing"
  },
  {
    id: 5,
    question: "Da li je bezbjedno unositi šifre i plaćati preko otvorenog (javnog) Wi-Fi-ja u kafiću ili parku?",
    options: [
      "Da, sasvim je sigurno ako je veza brza",
      "Nije bezbjedno, jer hakeri na istoj mreži mogu presresti tvoje podatke",
      "Sigurno je samo ako otvoriš privatni (incognito) prozor"
    ],
    correctIndex: 1,
    explanation: "Javne Wi-Fi mreže često nemaju enkripciju. Svako na istoj mreži sa pravim alatima može vidjeti tvoj internet saobraćaj. Koristi mobilne podatke za osjetljive stvari.",
    category: "Mrežna zaštita"
  },
  {
    id: 6,
    question: "Šta predstavlja tvoj 'digitalni otisak' (digital footprint)?",
    options: [
      "Skeniran otisak prsta kojim otključavaš pametni telefon",
      "Sve objave, poruke, komentari, slike i pretrage koje ostavljaš na internetu",
      "Broj koraka koje telefon zabilježi tokom dana"
    ],
    correctIndex: 1,
    explanation: "Sve što jednom postaviš ili pretražiš na internetu ostaje trajno zabilježeno i može uticati na tvoju budućnost, upis u školu ili posao.",
    category: "Privatnost"
  },
  {
    id: 7,
    question: "Šta podrazumijeva pojam 'Cyberbullying' (digitalno nasilje)?",
    options: [
      "Igranje borilačkih video igrica preko računara",
      "Vrijeđanje, ucjenjivanje, ismijavanje ili prijetnje upućene nekome putem interneta",
      "Kvarenje tastature ili miša"
    ],
    correctIndex: 1,
    explanation: "Digitalno nasilje ostavlja ozbiljne psihičke posljedice. Uvrede na internetu nisu šala, već kažnjiv oblik nasilja.",
    category: "Digitalno nasilje"
  },
  {
    id: 8,
    question: "Ako primijetiš da je neko žrtva digitalnog nasilja ili tebe neko uznemirava na mreži, šta je NAJBOLJE uraditi?",
    options: [
      "Ćutati i nadati se da će prestati samo od sebe",
      "Odgovoriti još gorim uvredama i psovkama",
      "Napraviti screenshot (dokaz) i odmah obavijestiti roditelje ili nastavnika"
    ],
    correctIndex: 2,
    explanation: "Uvijek sačuvaj dokaze (poruke, slike) i odmah se obrati odrasloj osobi od povjerenja ili stručnim službama (npr. Plavi telefon). Nisi sam/a!",
    category: "Digitalno nasilje"
  },
  {
    id: 9,
    question: "Koji znak u web pregledaču označava da je veza sa sajtom šifrovana (bezbjedna)?",
    options: [
      "Ikonica zaključanog katanca i adresa koja počinje sa 'https://'",
      "Crveni uzvičnik i adresa sa 'http://'",
      "Bilo koji sajt koji u imenu ima '.com'"
    ],
    correctIndex: 0,
    explanation: "Slovo 's' u 'https://' znači 'Secure' (sigurno) i zajedno sa katančićem garantuje da su podaci između tebe i sajta šifrovani.",
    category: "Web sigurnost"
  },
  {
    id: 10,
    question: "Preuzimanje 'krekovanih' (besplatnih piratskih) igrica sa sumnjivih sajtova najčešće dovodi do:",
    options: [
      "Ubrzanja rada računara i veće grafike",
      "Zaraze računara opasnim virusima, trojancima i špijunskim softverom",
      "Nema nikakvih rizika jer antivirus sve sam obriše"
    ],
    correctIndex: 1,
    explanation: "Iza 'besplatnih' krekovanih igrica često se kriju trojanci koji kradu tvoje lozinke, snimaju ekran ili koriste tvoj računar za rudarenje kriptovaluta.",
    category: "Zaštita uređaja"
  },
  {
    id: 11,
    question: "Koji od navedenih podataka NIKADA ne smiješ javno objavljivati na društvenim mrežama?",
    options: [
      "Naziv omiljenog muzičkog benda ili pjesme",
      "Tačnu kućnu adresu, broj telefona i školu u koju ideš",
      "Fotografiju crteža koji si nacrtao/la"
    ],
    correctIndex: 1,
    explanation: "Objavljivanjem adrese, broja telefona ili lokacije uživo ugrožavaš svoju fizičku bezbjednost i omogućavaš nepoznatim osobama da te prate.",
    category: "Privatnost"
  },
  {
    id: 12,
    question: "Šta je 'Ransomware' (zlonamjerni ucjenjivački softver)?",
    options: [
      "Program koji zaključa tvoje fajlove i traži novac (otkup) za njihovo otključavanje",
      "Besplatan program za čišćenje memorije telefona",
      "Aplikacija za pravljenje animacija"
    ],
    correctIndex: 0,
    explanation: "Ransomware šifruje tvoje fotografije, dokumente i podatke, a hakeri traže otkupninu. Zato je važno redovno praviti rezervne kopije (backup).",
    category: "Zaštita uređaja"
  },
  {
    id: 13,
    question: "Šta je osnovno zlatno pravilo digitalnog bontona (Netiquette)?",
    options: [
      "Pisanje svih poruka VELIKIM SLOVIMA (CAPS LOCK)",
      "Ne piši i ne radi na internetu ono što se ne bi usudio/la reći ili uraditi u stvarnom životu",
      "Dozvoljeno je ismijavati druge jer niko ne zna ko si iza ekrana"
    ],
    correctIndex: 1,
    explanation: "Iza svakog ekrana nalazi se pravo ljudsko biće sa osjećanjima. Bonton i poštovanje važe podjednako i u virtuelnom i u stvarnom svijetu.",
    category: "Digitalni bonton"
  },
  {
    id: 14,
    question: "Osoba koju si upoznao/la u online igrici insistira da se tajno nađete uživo bez znanja tvojih roditelja. Šta treba uraditi?",
    options: [
      "Otići na susret sam/a jer zvuči kao super drugar",
      "Odmah odbiti, prekinuti kontakt i sve reći roditeljima ili starateljima",
      "Poslati joj svoju tačnu adresu da dođe po tebe"
    ],
    correctIndex: 1,
    explanation: "Na internetu se bilo ko može lažno predstaviti kao tvoj vršnjak. Odlazak na susret sa nepoznatom osobom sa mreže nosi ogroman bezbjednosni rizik.",
    category: "Lična bezbjednost"
  }
];
