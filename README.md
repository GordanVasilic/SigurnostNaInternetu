# 🛡️ Kviz: Sigurnost na Internetu

Interaktivna veb aplikacija u stilu Kahoota kreirana za **Sergeja** za edukativnu prezentaciju i testiranje znanja na temu **Sigurnost na internetu i sajber bezbjednost**.

Aplikacija sadrži **14 progresivnih pitanja** (od osnova do naprednih srednjoškolskih tema iz sajber bezbjednosti), tajmer od 15 sekundi po pitanju, rang listu sa bodovima i vremenom, te detaljnu analitiku.

---

## 🌟 Ključne Karakteristike

1. **QR Kod za Učesnike**:
   - Sergej na projektoru/ekranu prikazuje administratorski ekran sa velikim QR kodom.
   - Učesnici jednostavno usmjere kameru telefona, skeniraju QR kod i odmah ulaze u kviz.
   - Administrator može uvećati QR kod preko cijelog ekrana, preuzeti ga kao sliku (PNG) ili podijeliti link direktno u Viber/WhatsApp grupu.
2. **Izbor Avatara (40 unikatnih likova) i Imena**:
   - Svaki igrač bira avatar (Sajber & IT, Životinje, Heroji) i unosi svoje ime.
   - U čekaonici u svakom trenutku mogu promijeniti avatar ili popraviti ime.
3. **Sinhronizovano Igranje za Sve Učesnike**:
   - Sergej jednim klikom na dugme **"POKRENI KVIZ ZA SVE UČENIKE"** pokreće kviz.
   - Svima se u isto vrijeme prikazuje isto pitanje.
4. **Tajmer od 15 Sekundi po Pitanju**:
   - Kružni tajmer sa zvučnim efektima odbrojava 15 sekundi.
   - Ako igrač odgovori ranije, odmah dobija vizuelnu potvrdu (**Tačno! 🎉** ili **Netačno! ❌**, bez otkrivanja tačnog odgovora).
   - Čeka se istek punih 15 sekundi kako bi svi učesnici u istoj sekundi automatski prešli na sledeće pitanje.
   - Ako neko ne odgovori u roku od 15s, automatski se bilježi 0 bodova i prelazi se na sledeće pitanje.
5. **Rang Lista (Leaderboard) sa Mjerenjem Vremena**:
   - Pobjedničko postolje (Zlato 🥇, Srebro 🥈, Bronza 🥉) uz slavljeničke konfete i zvučne efekte.
   - **Pravilo izjednačenja**: Ako dva takmičara imaju isti broj tačnih bodova, bolje je rangiran onaj koji je brže odgovarao (mjeri se ukupno vrijeme u sekundama).
6. **Detaljna Statistika za Prezentaciju (`/stats`)**:
   - Prikaz procenata tačnosti za svako od 14 pitanja.
   - Analiza najlakših i najtežih tema.
   - Edukativna objašnjenja koja Sergej može pročitati naglas nakon kviza.
7. **Ugrađeni Backend (Bez potrebe za eksternim bazama)**:
   - Kviz ima ugrađeni serverless backend (`/api/quiz`), tako da radi na Vercelu bez ikakvih baza podataka ili podešavanja!

---

## 🚀 Brzo Pokretanje Lokalno (na računaru)

```bash
# 1. Instalacija paketa
npm install

# 2. Pokretanje razvojnog servera
npm run dev
```

Otvorite u pregledaču:
* **Učenički ekran (Igrač)**: `http://localhost:3000`
* **Sergej / Admin kontrola**: `http://localhost:3000/admin`
  * Podrazumijevani PIN kod je: `sergej2024` (ili `2024`)
* **Detaljna statistika**: `http://localhost:3000/stats`

---

## 📚 Spisak 14 Progresivnih Pitanja (od lakših ka težim)

Pitanja se nalaze u fajlu `src/data/questions.ts`:

### Nivo 1: Osnovni nivo (Zagrijavanje)
1. **Lozinke i Passphrase**: Zašto su duge fraze (16+ karaktera) otpornije na Brute-force napade.
2. **Spear Phishing**: Razlika između masovnog i ciljanog phishing napada skrojenog za pojedinca.
3. **Dvofaktorska autentifikacija (2FA)**: Zašto su autentifikatorske aplikacije/hardverski ključevi sigurniji od SMS kodova (SIM Swap).
4. **Javni Wi-Fi i Man-in-the-Middle**: Opasnosti otvorenih mreža i lažnih pristupnih tačaka ("Evil Twin").

### Nivo 2: Srednji nivo (Srednjoškolske teme)
5. **OSINT (Open Source Intelligence)**: Kako hakeri prikupljaju javno dostupne podatke za profilisanje mete.
6. **HTTPS i SSL/TLS katanac**: Zašto i lažni phishing sajtovi danas mogu imati katanac i HTTPS.
7. **Infostealeri**: Kako se kradljivci lozinki šire preko piratskih modova i igara na Discordu/YouTube-u.
8. **Pravilo 3-2-1 za Backup**: Zlatni standard pravljenja rezervnih kopija za zaštitu od Ransomware-a.
9. **Session Hijacking**: Kako krađa sesijskih kolačića (Cookies) omogućava ulazak na nalog bez lozinke i 2FA.

### Nivo 3: Napredni nivo (Sajber izazov)
10. **DDoS i Botnet**: Kako mreža zaraženih uređaja preplavljuje i obara servere.
11. **Deepfake AI Prevare**: Korištenje vještačke inteligencije za kloniranje glasa i lica u prevarama.
12. **Zero-Day ranjivost**: Šta znači propust za koji proizvođač još nema zakrpu.
13. **Dozvole aplikacija (App Permissions)**: Princip najmanjih privilegija i špijunski softver.
14. **Etičko hakovanje (White Hat)**: Odgovorno prijavljivanje propusta kroz Bug Bounty programe.

---

Srećno Sergeju na prezentaciji i kvizu! 🎓🎉
