export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
  bgColor: string;
}

export const AVATARS: AvatarOption[] = [
  // 1-10: Cyber & Tech
  { id: "robot", emoji: "🤖", label: "Sajber Robot", bgColor: "from-cyan-500 to-blue-600" },
  { id: "hacker", emoji: "💻", label: "Etički Haker", bgColor: "from-emerald-500 to-green-700" },
  { id: "shield", emoji: "🛡️", label: "Sigurni Štit", bgColor: "from-blue-600 to-indigo-700" },
  { id: "rocket", emoji: "🚀", label: "Brza Raketa", bgColor: "from-blue-500 to-indigo-600" },
  { id: "alien", emoji: "👾", label: "Pixel Alien", bgColor: "from-purple-500 to-pink-600" },
  { id: "gamer", emoji: "🎮", label: "Pro Gejmer", bgColor: "from-indigo-600 to-purple-700" },
  { id: "lightning", emoji: "⚡", label: "Munja", bgColor: "from-yellow-400 to-orange-500" },
  { id: "satellite", emoji: "🛰️", label: "Satelit", bgColor: "from-sky-500 to-slate-700" },
  { id: "brain", emoji: "🧠", label: "IT Mozgalica", bgColor: "from-fuchsia-500 to-purple-700" },
  { id: "detective", emoji: "🕵️", label: "Sajber Detektiv", bgColor: "from-teal-600 to-cyan-800" },

  // 11-20: Hrabre i Pametne Životinje
  { id: "fox", emoji: "🦊", label: "Pametna Lisica", bgColor: "from-orange-500 to-amber-600" },
  { id: "lion", emoji: "🦁", label: "Hrabri Lav", bgColor: "from-yellow-500 to-amber-600" },
  { id: "wolf", emoji: "🐺", label: "Šumski Vuk", bgColor: "from-slate-600 to-slate-800" },
  { id: "owl", emoji: "🦉", label: "Mudra Sova", bgColor: "from-amber-600 to-stone-700" },
  { id: "eagle", emoji: "🦅", label: "Oštri Orao", bgColor: "from-sky-600 to-blue-800" },
  { id: "tiger", emoji: "🐯", label: "Divlji Tigar", bgColor: "from-orange-600 to-red-600" },
  { id: "panda", emoji: "🐼", label: "Cool Panda", bgColor: "from-slate-700 to-slate-900" },
  { id: "bear", emoji: "🐻", label: "Snažni Medo", bgColor: "from-amber-800 to-stone-900" },
  { id: "cat", emoji: "🐱", label: "Ninja Mačka", bgColor: "from-pink-500 to-rose-600" },
  { id: "dog", emoji: "🐶", label: "Vjerni Pas", bgColor: "from-amber-500 to-orange-600" },

  // 21-30: Vodeni svijet i Mitska bića
  { id: "shark", emoji: "🦈", label: "Brza Ajkula", bgColor: "from-blue-600 to-cyan-800" },
  { id: "dolphin", emoji: "🐬", label: "Veseli Delfin", bgColor: "from-cyan-400 to-blue-600" },
  { id: "dragon", emoji: "🐲", label: "Vatreni Zmaj", bgColor: "from-red-600 to-amber-700" },
  { id: "dino", emoji: "🦖", label: "T-Rex", bgColor: "from-emerald-600 to-green-800" },
  { id: "unicorn", emoji: "🦄", label: "Jednorog", bgColor: "from-purple-400 to-pink-500" },
  { id: "penguin", emoji: "🐧", label: "Linux Pingvin", bgColor: "from-slate-800 to-cyan-900" },
  { id: "turtle", emoji: "🐢", label: "Oklopna Kornjača", bgColor: "from-emerald-500 to-teal-700" },
  { id: "frog", emoji: "🐸", label: "Brzi Žabac", bgColor: "from-lime-500 to-emerald-600" },
  { id: "monkey", emoji: "🐵", label: "Spretni Majmun", bgColor: "from-amber-600 to-yellow-700" },
  { id: "bee", emoji: "🐝", label: "Vrijedna Pčela", bgColor: "from-yellow-400 to-amber-600" },

  // 31-40: Heroji, Zvijezde i Šampioni
  { id: "fire", emoji: "🔥", label: "Vatreni As", bgColor: "from-red-500 to-orange-600" },
  { id: "star", emoji: "🌟", label: "Sjajna Zvijezda", bgColor: "from-amber-400 to-yellow-500" },
  { id: "crown", emoji: "👑", label: "Kralj Znanja", bgColor: "from-amber-500 to-yellow-600" },
  { id: "trophy", emoji: "🏆", label: "Šampion", bgColor: "from-yellow-500 to-amber-600" },
  { id: "target", emoji: "🎯", label: "Precizni Strijelac", bgColor: "from-rose-500 to-red-600" },
  { id: "superhero", emoji: "🦸", label: "Sajber Heroj", bgColor: "from-blue-600 to-red-600" },
  { id: "wizard", emoji: "🧙", label: "Web Čarobnjak", bgColor: "from-violet-600 to-indigo-800" },
  { id: "ninja", emoji: "🥷", label: "Tihi Ninja", bgColor: "from-stone-700 to-slate-900" },
  { id: "diamond", emoji: "💎", label: "Dijamant", bgColor: "from-cyan-300 to-blue-500" },
  { id: "sunglasses", emoji: "😎", label: "Glavni Basa", bgColor: "from-yellow-500 to-orange-600" },
];
