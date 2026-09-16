export interface Question {
  id: number;
  question: string;
  options: [string, string, string];
  correctIndex: number;
  explanation: string;
  category: string;
  difficulty: "Osnovno" | "Srednje" | "Napredno";
}

export const QUIZ_QUESTIONS: Question[] = [
  // --- NIVO 1: OSNOVNO (Zagrijavanje) ---
  {
    id: 1,
    question: "Koji od navedenih pristupa kreiranju lozinke pruža NAJVEĆU otpornost na hakerske napade pogađanjem (Brute-force)?",
    options: [
      "Kratka lozinka od 8 slova sa jednim brojem na kraju (npr. Lozinka1)",
      "Fraza od 4 nepovezane riječi sa simbolima dužine 16+ znakova (tzv. Passphrase)",
      "Korištenje istog komplikovanog niza karaktera na svim društvenim mrežama"
    ],
    correctIndex: 1,
    explanation: "Dužina je ključna: dugačke fraze (Passphrase) od 16+ znakova eksponencijalno povećavaju vrijeme potrebno računaru da pogodi lozinku (milijarde godina umjesto nekoliko sekundi).",
    category: "Lozinke i Autentifikacija",
    difficulty: "Osnovno"
  },
  {
    id: 2,
    question: "Šta je 'Spear Phishing' i po čemu se razlikuje od običnog phishinga?",
    options: [
      "Slučajno slanje virusa preko USB memorije",
      "Ciljani napad prilagođen konkretnoj osobi koristeći njene stvarne podatke sa mreže",
      "Korištenje legalnih alata za provjeru brzine internet veze"
    ],
    correctIndex: 1,
    explanation: "Dok običan phishing šalje milione istih nasumičnih poruka, Spear Phishing je precizno usmjeren na tebe – napadač zna tvoje ime, prijatelje ili školu kako bi poruka zvučala 100% uvjerljivo.",
    category: "Socijalni Inženjering",
    difficulty: "Osnovno"
  },
  {
    id: 3,
    question: "Koji oblik dvofaktorske autentifikacije (2FA) se smatra NAJSIGURNIJIM od ponuđenih?",
    options: [
      "Verifikacioni SMS kod poslat na broj mobilnog telefona",
      "Aplikacija za autentifikaciju (npr. Google/Microsoft Authenticator) ili hardverski ključ",
      "Odgovor na sigurnosno pitanje: 'Koje je ime tvog prvog ljubimca?'"
    ],
    correctIndex: 1,
    explanation: "SMS poruke nisu šifrovane i podložne su presretanju i 'SIM Swap' prevarama kod operatera. Autentifikatorske aplikacije generišu jednokratne kodove lokalno na uređaju bez slanja preko mobilne mreže.",
    category: "Lozinke i Autentifikacija",
    difficulty: "Osnovno"
  },
  {
    id: 4,
    question: "Zašto je opasno koristiti besplatne javne Wi-Fi mreže (u kafićima, tržnim centrima) bez VPN zaštite?",
    options: [
      "Zato što troše bateriju telefona duplo brže",
      "Napadači na istoj mreži mogu izvesti 'Man-in-the-Middle' napad i presresti nešifrovani saobraćaj",
      "Javni Wi-Fi automatski briše sve instalirane aplikacije sa telefona"
    ],
    correctIndex: 1,
    explanation: "Na otvorenom Wi-Fi-ju svako može pratiti mrežni saobraćaj ili postaviti lažnu pristupnu tačku ('Evil Twin'). Za osjetljive prijave uvijek koristite mobilne podatke ili pouzdan VPN.",
    category: "Mrežna Sigurnost",
    difficulty: "Osnovno"
  },

  // --- NIVO 2: SREDNJE (Srednjoškolski nivo) ---
  {
    id: 5,
    question: "Šta podrazumijeva 'OSINT' (Open Source Intelligence) tehnika koju hakeri često koriste prije napada?",
    options: [
      "Automatsko obaranje servera slanjem velikog broja zahtjeva",
      "Prikupljanje javno dostupnih informacija o meti (objave, lokacije sa slika, komentari, stari forumi)",
      "Programiranje igrica otvorenog koda"
    ],
    correctIndex: 1,
    explanation: "Čak i sitni detalji koje ostavljamo na profilima (škola, rođendan, ljubimac, lokacija iz pozadine slike) napadačima služe da sklope profil žrtve i provale lozinke ili sigurnosna pitanja.",
    category: "Privatnost i OSINT",
    difficulty: "Srednje"
  },
  {
    id: 6,
    question: "Ako veb stranica ima ikonicu katanca i počinje sa 'https://', da li to garantuje da sajt NIJE lažan ili prevarantski?",
    options: [
      "Da, katanac znači da je kompanija zvanično provjerena od strane policije",
      "Ne! Katanac znači samo da je veza šifrovana, a i hakeri mogu besplatno postaviti HTTPS na lažni sajt",
      "Da, nemoguće je napraviti lažni sajt koji posjeduje SSL sertifikat"
    ],
    correctIndex: 1,
    explanation: "Najčešća zabluda! HTTPS i katanac znače samo da niko 'usput' ne može pročitati podatke, ali ako podatke šaljete direktno na hakerski phishing sajt – oni idu pravo napadaču.",
    category: "Web Sigurnost",
    difficulty: "Srednje"
  },
  {
    id: 7,
    question: "Šta je 'Infostealer' (kradljivac informacija) i kako najčešće dospijeva na računar mladih korisnika?",
    options: [
      "Zlonamjerni program skriven u 'besplatnim' krekovanim igricama, cheat-ovima i modovima sa Discorda/YouTube-a",
      "Kvar na matičnoj ploči računara izazvan prašinom",
      "Dodatak za pretraživač koji legalno blokira reklame"
    ],
    correctIndex: 0,
    explanation: "Infostealeri (kao što su RedLine ili Lumma) vrebaju u lažnim instalacijama igara i kradu sačuvane lozinke iz browsera, Discord tokene, sesijske kolačiće (cookies) i kripto-novčanike u djeliću sekunde.",
    category: "Zlonamjerni Softver",
    difficulty: "Srednje"
  },
  {
    id: 8,
    question: "Koje je zlatno '3-2-1' pravilo za pravljenje rezervnih kopija (Backup) radi zaštite od Ransomware ucjenjivača?",
    options: [
      "3 lozinke, 2 naloga, 1 uređaj",
      "3 kopije podataka, na 2 različita medija (npr. disk i oblak), od kojih je 1 lokacija odvojena (offline)",
      "Praviti backup svakog 3. dana, u 2 sata, u trajanju od 1 minut"
    ],
    correctIndex: 1,
    explanation: "Pravilo 3-2-1 garantuje oporavak čak i ako Ransomware zaključa tvoj računar i eksterni disk koji je bio uključen: treća kopija na offline lokaciji ostaje netaknuta!",
    category: "Zaštita Podataka",
    difficulty: "Srednje"
  },
  {
    id: 9,
    question: "Šta predstavlja napad 'otmicom sesije' (Session Hijacking) putem ukradenih kolačića (Cookies)?",
    options: [
      "Fizička krađa laptopa iz učionice",
      "Napadač kopira tvoj aktivni prijavljeni 'token' i ulazi na tvoj nalog BEZ potrebe da zna tvoju lozinku ili 2FA kod",
      "Promjena teme operativnog sistema u tamni režim"
    ],
    correctIndex: 1,
    explanation: "Kada označiš 'Zapamti me' na sajtu, browser čuva sesijski kolačić. Ako ga malver ukrade, napadač ga ubaci u svoj pregledač i sajt misli da je to tvoja prijavljena sesija, zaobilazeći i 2FA!",
    category: "Web Sigurnost",
    difficulty: "Srednje"
  },

  // --- NIVO 3: NAPREDNO (Pravi sajber izazov) ---
  {
    id: 10,
    question: "Šta je 'DDoS' (Distributed Denial of Service) napad?",
    options: [
      "Slanje virusa koji briše operativni sistem Windows",
      "Preplavljivanje servera ogromnim brojem lažnih zahtjeva sa mreže hiljada zaraženih uređaja (Botnet) radi njegovog obaranja",
      "Šifrovanje privatnih poruka vojnim algoritmom"
    ],
    correctIndex: 1,
    explanation: "DDoS koristi armiju kompromitovanih uređaja (Botnet – od računara do pametnih kamera i rutera) da istovremeno pošalje gigabajte saobraćaja prema meti dok se server ne zaguši i prestane sa radom.",
    category: "Mrežni Napadi",
    difficulty: "Napredno"
  },
  {
    id: 11,
    question: "Kako se naziva prevara u kojoj se koristi vještačka inteligencija (AI) za kloniranje nečijeg glasa ili lica radi iznude novca?",
    options: [
      "Deepfake socijalni inženjering",
      "Phreaking",
      "SQL Injekcija"
    ],
    correctIndex: 0,
    explanation: "Sa samo nekoliko sekundi audio snimka nečijeg glasa sa TikToka ili Instagrama, AI danas može generisati telefonski poziv u kojem glas zvuči identično kao tvoj prijatelj ili član porodice koji 'hitno traži pomoć'.",
    category: "AI i Prevare",
    difficulty: "Napredno"
  },
  {
    id: 12,
    question: "Šta u sajber bezbjednosti označava termin 'Zero-Day ranjivost' (Zero-Day Vulnerability)?",
    options: [
      "Sigurnosni propust koji se sam popravi u roku od 24 časa",
      "Sigurnosna mana u softveru za koju programeri još ne znaju niti postoji zvanična zakrpa (patch)",
      "Kompjuterski virus koji se aktivira samo prvog dana u mjesecu"
    ],
    correctIndex: 1,
    explanation: "Zero-Day znači da proizvođač ima 'nula dana' da reaguje jer je propust već otkriven i potencijalno se koristi za napade prije nego što je zakrpa napravljena. Zato je ključno redovno ažurirati sistem.",
    category: "Sajber Bezbjednost",
    difficulty: "Napredno"
  },
  {
    id: 13,
    question: "Zašto aplikacija poput 'Kalkulatora' ili jednostavne video igrice nikada ne bi smjela tražiti dozvolu za pristup Mikrofonu, Kontaktima i SMS porukama?",
    options: [
      "Zato što mikrofon troši previše internet saobraćaja",
      "To je jasan indikator špijunskog softvera (Spyware) koji prikuplja osjetljive podatke u pozadini",
      "Operativni sistem to sam traži za svaku aplikaciju bez obzira na njenu namjenu"
    ],
    correctIndex: 1,
    explanation: "Princip 'najmanjih privilegija': aplikacija treba imati pristup samo onome što joj je neophodno za rad. Prekomjerne dozvole su najčešći način na koji zlonamjerne aplikacije na Androidu prate korisnike.",
    category: "Zaštita Mobilnih Uređaja",
    difficulty: "Napredno"
  },
  {
    id: 14,
    question: "Šta radi 'Etički haker' (tzv. White Hat haker) kada otkrije ozbiljnu sigurnosnu manu na sajtu banke ili društvene mreže?",
    options: [
      "Odmah javno objavi lozinke korisnika na internet forumu",
      "Odgovorno prijavljuje propust kompaniji (Responsible Disclosure) kroz Bug Bounty program kako bi se zaštitili korisnici",
      "Prodaje bazu podataka na Dark Webu za kriptovalute"
    ],
    correctIndex: 1,
    explanation: "Etički hakeri koriste svoje vještine legalno kako bi preduhitrili kriminalce (Black Hat), testirali sisteme i pomogli da internet bude bezbjednije mjesto za sve nas.",
    category: "Etičko Hakovanje",
    difficulty: "Napredno"
  }
];
