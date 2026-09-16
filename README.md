# 🛡️ Kviz: Sigurnost na Internetu (OŠ "Petar Petrović Njegoš" Banja Luka)

Interaktivna veb aplikacija u stilu Kahoota kreirana za **Sergeja** (učenika 9. razreda) za školsku prezentaciju i testiranje drugara iz razreda na temu **Sigurnost na internetu**.

---

## 🌟 Ključne Karakteristike

1. **QR Kod za Drugare**:
   - Sergej na projektoru/tabli prikazuje administratorski ekran sa velikim QR kodom.
   - Drugari jednostavno usmjere kameru telefona, skeniraju QR kod i odmah ulaze u kviz.
2. **Izbor Avatara i Imena**:
   - Svaki učenik bira zabavan avatar (🦊 Lisica, 🚀 Raketa, 🦁 Lav, 🤖 Robot, 🎮 Gejmer, 🛡️ Štit itd.) i unosi svoje ime.
   - Nakon prijave čekaju u čekaonici ("Lobby") dok Sergej ne označi početak.
3. **Sinhronizovano Igranje za Cijeli Razred**:
   - Sergej jednim klikom na dugme **"POKRENI KVIZ ZA SVE UČENIKE"** pokreće kviz.
   - Svim učenicima se u isto vrijeme prikazuje isto pitanje.
4. **Tajmer od 15 Sekundi po Pitanju**:
   - Kružni tajmer sa zvučnim efektima odbrojava 15 sekundi.
   - Ako učenik odgovori ranije, odmah dobija vizuelnu potvrdu (**Tačno! 🎉** ili **Netačno! ❌**, bez otkrivanja tačnog odgovora ako je pogriješio).
   - Čeka se istek punih 15 sekundi kako bi svi učenici u istoj sekundi prešli na sledeće pitanje.
5. **Rang Lista (Leaderboard) sa Mjerenjem Vremena**:
   - 14 pripremljenih edukativnih pitanja.
   - Pobjedničko postolje (Zlato 🥇, Srebro 🥈, Bronza 🥉) uz slavljeničke konfete i zvučne efekte.
   - **Pravilo izjednačenja**: Ako dva učenika imaju isti broj tačnih bodova, bolje je rangiran onaj koji je brže odgovarao (mjeri se ukupno vrijeme u sekundama).
6. **Detaljna Statistika za Prezentaciju (`/stats`)**:
   - Prikaz procenata tačnosti za svako od 14 pitanja.
   - Analiza najlakših i najtežih pitanja u razredu.
   - Edukativna objašnjenja koja Sergej može pročitati naglas razredu i nastavniku.

---

## 🚀 Brzo Pokretanje Lokalno (na računaru)

Ako želite odmah isprobati kviz na svom računaru:

```bash
# 1. Instalacija paketa (već je odrađena u projektu)
npm install

# 2. Pokretanje razvojnog servera
npm run dev
```

Otvorite u pregledaču:
* **Učenički ekran (Igrač)**: `http://localhost:3000`
* **Sergej / Admin kontrola**: `http://localhost:3000/admin`
  * Podrazumijevani PIN kod je: `sergej2024` (ili `2024` / `sergej`)

> **Savjet za testiranje na računaru**: Otvorite dva prozora pregledača jedan pored drugog. U jednom uđite na `http://localhost:3000` kao učenik (npr. izaberite lisicu i unesite "Marko"), a u drugom otvorite `http://localhost:3000/admin` i kliknite "Pokreni kviz". Vidjećete kako se u istoj sekundi sve sinhronizuje!

---

## 🌐 Postavljanje na GitHub i Vercel (Besplatno za 3 minuta)

### Korak 1: Postavljanje na GitHub
1. Otvorite [github.com](https://github.com) i napravite novi repozitorijum (npr. `sergej-sigurnost-kviz`).
2. U terminalu u ovom folderu pokrenite:
   ```bash
   git add .
   git commit -m "Inicijalna verzija kviza Sigurnost na internetu"
   git branch -M main
   git remote add origin https://github.com/VASE_KORISNICKO_IME/sergej-sigurnost-kviz.git
   git push -u origin main
   ```

### Korak 2: Postavljanje na Vercel
1. Otvorite [vercel.com](https://vercel.com) i prijavite se sa svojim GitHub nalogom.
2. Kliknite **"Add New..."** → **"Project"**.
3. Izaberite vaš repozitorijum `sergej-sigurnost-kviz` i kliknite **"Deploy"**.
4. Za 60 sekundi dobićete gotov link (npr. `https://sergej-sigurnost-kviz.vercel.app`)!

---

## ⚡ Povezivanje Google Firebase baze (za rad sa više telefona u razredu)

Aplikacija ima ugrađenu podršku za **Google Firebase Realtime Database**, koja je 100% besplatna i omogućava da 30+ telefona u učionici reaguje trenutno bez ikakvog kašnjenja.

### Kako podesiti Firebase za 2 minuta (bez kartice):
1. Otvorite [console.firebase.google.com](https://console.firebase.google.com) i kliknite **"Add project"** (nazovite npr. *sigurnost-kviz*).
2. U lijevom meniju kliknite na **Build** → **Realtime Database** → **Create Database** (izaberite lokaciju npr. *europe-west1*).
3. Na sledećem koraku izaberite **"Start in test mode"** i kliknite **Enable**.
4. Kliknite na ikonu zupčanika (gore lijevo pored *Project Overview*) → **Project settings**.
5. Pod karticom *General* skrolujte dole do *Your apps*, kliknite na ikonicu veba **`</>`**, registrujte aplikaciju i vidjećete `firebaseConfig` objekat.
6. Kopirajte te vrijednosti u vašu datoteku `.env.local` (ili u podešavanjima na Vercelu pod *Environment Variables*):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sigurnost-kviz.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://sigurnost-kviz-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sigurnost-kviz
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sigurnost-kviz.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
NEXT_PUBLIC_ADMIN_PIN=sergej2024
```

Čim ove varijable unesete, svi mobilni telefoni u učionici će u realnom vremenu biti povezani preko brzih web-socketa!

---

## 📚 Spisak 14 Pitanja o Sigurnosti na Internetu

Pitanja se nalaze u fajlu `src/data/questions.ts` i možete ih po želji lako izmijeniti ili dodati nova:

1. **Lozinke**: Koja lozinka je najsigurnija (primjer sa simbolima, velikim/malim slovima i brojevima).
2. **Phishing (pecanje)**: Šta je phishing i kako prepoznati lažne linkove i poruke.
3. **Dvofaktorska autentifikacija (2FA)**: Šta znači dodatni nivo zaštite kod prijave.
4. **Sumnjive poruke na Instagramu**: Kako reagovati na poruke "Vidi ko priča o tebi".
5. **Javni Wi-Fi**: Zašto nije sigurno unositi lozinke i plaćati preko otvorenog Wi-Fi-ja u kafiću.
6. **Digitalni otisak (Digital Footprint)**: Sve što objavimo ostaje trajno zabilježeno.
7. **Cyberbullying (Digitalno nasilje)**: Definicija i prepoznavanje nasilja na mreži.
8. **Reakcija na nasilje**: Sačuvati dokaze (screenshot) i obratiti se odraslima / stručnim službama.
9. **HTTPS i katanac**: Kako prepoznati šifrovanu i bezbjednu veb stranicu.
10. **Krekovane igrice i piraterija**: Opasnost od trojanaca, virusa i kradljivaca lozinki.
11. **Privatnost ličnih podataka**: Zabrana dijeljenja kućne adrese, broja telefona i škole.
12. **Ransomware**: Zlonamjerni softver koji zaključa fajlove i traži otkup.
13. **Digitalni bonton (Netiquette)**: Poštovanje drugih i ponašanje kao u stvarnom životu.
14. **Nepoznate osobe sa mreže**: Odbijanje tajnih susreta sa ljudima upoznatim u video igricama.

---

Srećno Sergeju na prezentaciji u školi P.P. Njegoš Banja Luka! 🎓🎉
