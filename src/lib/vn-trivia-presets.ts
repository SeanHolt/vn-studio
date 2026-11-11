import { QuizQuestion } from './vn-schema';

export interface TriviaPresetItem {
  category: 'SCIFI_MOVIES' | 'FANTASY_MOVIES' | 'SCIFI_FANTASY_TV' | 'RIDDLES';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TRIVIA_QUESTION_BANK: TriviaPresetItem[] = [
  {
    category: 'SCIFI_MOVIES',
    question: 'In The Matrix (1999), which color pill does Morpheus offer Neo to reveal the truth?',
    options: ['Red pill', 'Blue pill', 'Green pill', 'Silver pill'],
    correctIndex: 0,
    explanation: 'Taking the red pill wakes Neo from the Matrix simulation.',
  },
  {
    category: 'SCIFI_MOVIES',
    question: 'In Back to the Future (1985), what speed must the DeLorean reach to travel through time?',
    options: ['75 mph', '88 mph', '99 mph', '100 mph'],
    correctIndex: 1,
    explanation: 'Once the DeLorean hits 88 mph, the flux capacitor activates time travel.',
  },
  {
    category: 'SCIFI_MOVIES',
    question: 'What is the desert homeworld of Luke Skywalker in Star Wars: Episode IV?',
    options: ['Hoth', 'Endor', 'Tatooine', 'Naboo'],
    correctIndex: 2,
    explanation: 'Luke grew up on a moisture farm on the twin-sun planet Tatooine.',
  },
  {
    category: 'SCIFI_MOVIES',
    question: 'In Alien (1979), what is the name of the commercial towing spaceship?',
    options: ['Sulaco', 'Serenity', 'Nostromo', 'Discovery One'],
    correctIndex: 2,
    explanation: 'The USCSS Nostromo responds to a distress signal on LV-426.',
  },
  {
    category: 'SCIFI_MOVIES',
    question: 'In Jurassic Park (1993), what amber-trapped insect provides the dinosaur DNA?',
    options: ['Mosquito', 'Dragonfly', 'Beetle', 'Wasp'],
    correctIndex: 0,
    explanation: 'Scientists extract dinosaur blood from prehistoric mosquitoes preserved in amber.',
  },
  {
    category: 'FANTASY_MOVIES',
    question: 'In The Lord of the Rings, where must the One Ring be cast to be destroyed?',
    options: ['The Lonely Mountain', 'Mount Doom', 'Fangorn Forest', 'Helm’s Deep'],
    correctIndex: 1,
    explanation: 'Only the fires of Mount Doom in Mordor can unmake the One Ring.',
  },
  {
    category: 'FANTASY_MOVIES',
    question: 'Which hidden platform at King’s Cross Station leads to the Hogwarts Express?',
    options: ['Platform 7½', 'Platform 9¾', 'Platform 10¼', 'Platform 13'],
    correctIndex: 1,
    explanation: 'Students run straight through the barrier between platforms 9 and 10.',
  },
  {
    category: 'FANTASY_MOVIES',
    question: 'In The Princess Bride (1987), what giant creatures live inside the Fire Swamp?',
    options: ['Dire Wolves', 'Swamp Dragons', 'Rodents of Unusual Size', 'Shadow Trolls'],
    correctIndex: 2,
    explanation: 'Westley warns Buttercup about the Rodents of Unusual Size (R.O.U.S.).',
  },
  {
    category: 'FANTASY_MOVIES',
    question: 'In The Chronicles of Narnia, what enchanted treat does the White Witch give Edmund?',
    options: ['Turkish Delight', 'Honeycakes', 'Chocolate Frogs', 'Sugar Plums'],
    correctIndex: 0,
    explanation: 'The White Witch enchants Turkish Delight to tempt Edmund into betraying his siblings.',
  },
  {
    category: 'FANTASY_MOVIES',
    question: 'In Spirited Away (2001), what animals are Chihiro’s parents turned into?',
    options: ['Frogs', 'Crows', 'Pigs', 'Foxes'],
    correctIndex: 2,
    explanation: 'After eating food meant for the spirits, her parents are transformed into pigs.',
  },
  {
    category: 'SCIFI_FANTASY_TV',
    question: 'In Stranger Things, what is the dark parallel dimension connected to Hawkins called?',
    options: ['The Nether', 'The Upside Down', 'The Void', 'The Shadow Realm'],
    correctIndex: 1,
    explanation: 'Hawkins Lab accidentally opens a gate to the eerie Upside Down.',
  },
  {
    category: 'SCIFI_FANTASY_TV',
    question: 'In Doctor Who, what does the outside of the TARDIS look like?',
    options: ['A silver phone booth', 'A blue British police box', 'A red London bus', 'A brass clock'],
    correctIndex: 1,
    explanation: 'A broken chameleon circuit stuck the TARDIS in the shape of a 1960s police box.',
  },
  {
    category: 'SCIFI_FANTASY_TV',
    question: 'In The Mandalorian, what is the real name of the Force-sensitive child?',
    options: ['Grogu', 'Din', 'Yaddle', 'Gizmo'],
    correctIndex: 0,
    explanation: 'Ahsoka Tano reveals the child’s true name is Grogu.',
  },
  {
    category: 'SCIFI_FANTASY_TV',
    question: 'In Avatar: The Last Airbender, which element does Aang know how to bend first?',
    options: ['Water', 'Earth', 'Fire', 'Air'],
    correctIndex: 3,
    explanation: 'Aang was raised at the Southern Air Temple as an Air Nomad.',
  },
  {
    category: 'SCIFI_FANTASY_TV',
    question: 'In Star Trek: The Next Generation, who is the captain of the USS Enterprise-D?',
    options: ['James T. Kirk', 'Jean-Luc Picard', 'Benjamin Sisko', 'Kathryn Janeway'],
    correctIndex: 1,
    explanation: 'Captain Jean-Luc Picard commands the Enterprise-D.',
  },
  {
    category: 'RIDDLES',
    question: 'Riddle: I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?',
    options: ['An echo', 'A shadow', 'A cloud', 'A whisper'],
    correctIndex: 0,
    explanation: 'An echo repeats sounds without having a mouth or body.',
  },
  {
    category: 'RIDDLES',
    question: 'Riddle: The more of this there is, the less you see. What is it?',
    options: ['Fog', 'Darkness', 'Smoke', 'Glass'],
    correctIndex: 1,
    explanation: 'The thicker the darkness, the less you can see.',
  },
  {
    category: 'RIDDLES',
    question: 'Riddle: I have cities, but no houses; mountains, but no trees; and water, but no fish. What am I?',
    options: ['A dream', 'A painting', 'A map', 'A mirror'],
    correctIndex: 2,
    explanation: 'A map shows cities, mountains, and oceans on paper.',
  },
  {
    category: 'RIDDLES',
    question: 'Riddle: What has keys that open no locks, space, but no room, and lets you enter without going inside?',
    options: ['A piano', 'A keyboard', 'A diary', 'A treasure chest'],
    correctIndex: 1,
    explanation: 'A computer keyboard has keys, a space bar, and an Enter key.',
  },
  {
    category: 'RIDDLES',
    question: 'Riddle: What gets wetter the more it dries?',
    options: ['A sponge', 'A towel', 'The rain', 'Ice'],
    correctIndex: 1,
    explanation: 'A towel absorbs water as it dries things off.',
  },
];

export function buildPresetQuestions(
  category: TriviaPresetItem['category'] | 'MIXED'
): QuizQuestion[] {
  const pool =
    category === 'MIXED'
      ? TRIVIA_QUESTION_BANK.slice(0, 5)
      : TRIVIA_QUESTION_BANK.filter((item) => item.category === category);

  return pool.map((item) => ({
    id: `qq_${crypto.randomUUID()}`,
    question: item.question,
    options: [...item.options],
    correctIndex: item.correctIndex,
    explanation: item.explanation,
  }));
}
