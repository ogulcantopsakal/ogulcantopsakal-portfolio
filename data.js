// Copied from the Adobe Portfolio editor. Images are not included.
// For a project, add files in images/<slug>/:
//   cover.jpg (or .png / .webp) for the card
//   01.jpg, 02.jpg, ... for the project page
// Optional project fields: summary, role, year, link.
const SITE = {
  "name": "Ogulcan Topsakal",
  "tagline": "Welcome to my portfolio!",
  "links": {
    "linkedin": "https://www.linkedin.com/in/ogulcan-topsakal-b943b1153",
    "github": "https://github.com/ogulcantopsakal",
    "email": "ogulcantopsakal@gmail.com"
  },
  "welcome": {
    "title": "WELCOME",
    "blocks": [
      {
        "label": "Who Am I?",
        "paragraphs": [
          "I'm Ogulcan Topsakal, a Unity game developer focused on building scalable gameplay systems and polished player experiences. I've been developing games professionally since 2021, contributing as a primary developer on shipped mobile titles.",
          "My work centers around core gameplay architecture, system design, and performance, with a strong focus on creating responsive, satisfying game loops."
        ]
      },
      {
        "label": "Practices & Systems",
        "paragraphs": [
          "Unity, C#, Zenject & VContainer (DI), Reactive Programming (R3), Tweeners, Animancer, Performance Optimization, Unity Profiler, Editor Tooling, Git"
        ]
      },
      {
        "label": "Focus Areas",
        "paragraphs": [
          "Gameplay Systems • Game Architecture • Performance Optimization • Tooling"
        ]
      }
    ]
  },
  "sections": [
    {
      "id": "mobile-releases",
      "title": "Mobile Releases",
      "projects": [
        "merge-bubbles",
        "drop-jelly",
        "gun-assembly",
        "color-guys"
      ]
    },
    {
      "id": "mobile-prototypes",
      "title": "Mobile Prototypes",
      "projects": [
        "wonder-ball",
        "yarn-maze",
        "ducky-dash",
        "travel-sort",
        "filled-numbers",
        "token-sort",
        "jelly-block-blast",
        "bloom-match",
        "fortune-merge",
        "drop-beads",
        "sticker-match",
        "merge-2d",
        "drop-shapes",
        "spot-my-location",
        "do-it-3d",
        "snakes-and-holes",
        "coffee-merge-3d",
        "wardrobe-sort",
        "army-sort",
        "mart-sort",
        "stack-match-3d",
        "sort-phones",
        "stack-on-top",
        "flight-jam",
        "sorted-words",
        "item-sort",
        "packaging-store",
        "tap-to-shop",
        "tangled-pair",
        "sort-cars",
        "place-to-blast",
        "wordless-2",
        "emoji-cross",
        "wordless",
        "blast-match-3d",
        "gravity-merge",
        "bottle-water",
        "dx-hole",
        "plate-sort",
        "match-up-blocks",
        "holes-vs-snakes",
        "pinned-sticks",
        "hole-gun",
        "repair-gun",
        "repair-guys",
        "pair-up-cars",
        "basketball-asmr",
        "giant-gang",
        "press-runner",
        "merge-and-design",
        "picker-hero",
        "mine-bomber",
        "match-and-design",
        "snaky-squad",
        "link-squad",
        "word-bridge-3d",
        "invention-rush"
      ]
    },
    {
      "id": "tools",
      "title": "Tools",
      "projects": []
    },
    {
      "id": "game-jams",
      "title": "Game Jams",
      "projects": []
    }
  ],
  "projects": {
    "merge-bubbles": {
      "title": "Merge Bubbles",
      "summary": "Merge Bubbles is a word puzzle I developed at Cheer Games. Every bubble carries a word, and the move is to merge words from the same category. Four related words complete the set, clear space on the board, and let the next bubbles drop in.\n\nThe rules are small on purpose. You learn them in a level, then the board fills up and the move limit starts to matter. Later levels ask you to plan several merges ahead so a finished category opens room for the next one, instead of trapping words you still need.",
      "role": "Cheer Games · Mobile / Puzzle",
      "year": "2026",
      "link": "https://apps.apple.com/us/app/merge-bubbles-word-game/id6766297786"
    },
    "drop-jelly": {
      "title": "Drop Jelly",
      "summary": "Drop Jelly is a colorful, physics-driven puzzle game I developed while working with SuperMesh Games. The core gameplay revolves around dropping and merging jelly blocks to create higher-value pieces, combining spatial strategy with satisfying chain reactions.\n\nI contributed to the full gameplay experience, including core mechanics, level design systems, and progression balancing. The game emphasizes simple-to-learn mechanics with increasing complexity, supported by power-ups and varied level objectives to maintain long-term engagement.\n\nWith its vibrant visuals and responsive feel, Drop Jelly focuses on delivering a polished and addictive puzzle loop built around timing, placement, and strategic planning.",
      "role": "SuperMesh Games · Mobile / Puzzle",
      "year": "2024",
      "link": "https://apps.apple.com/us/app/drop-jelly/id6476603587"
    },
    "gun-assembly": {
      "title": "Gun Assembly",
      "summary": "It is an idle mobile game where you modify your weapon by combining and repairing weapon parts, and earn money by smashing sweet objects that come your way.\n\nApp Store Link",
      "role": "SuperMesh Games · Mobile / Idle",
      "year": "2022",
      "link": "https://apps.apple.com/us/app/gun-assembly/id6444002089"
    },
    "color-guys": {
      "title": "Color Guys",
      "summary": "While painting the floors, you should also carry paint capsules to the houses to pass levels. You can upgrade your own character with the money you earn. You can exchange paint capsules to earn more money.",
      "role": "SuperMesh Games · Mobile / Arcade Idle",
      "year": "2022",
      "link": "https://apps.apple.com/us/app/color-guys/id1612669134"
    },
    "wonder-ball": {
      "title": "Wonder Ball",
      "summary": "Wonder Ball is a mobile physics-puzzle game I developed as the sole developer at Cheer Games. The core experience is built around aim-and-shoot mechanics, challenging players to launch balls at stacked towers of obstacles and blockers, knocking them down to clear each level.\n\nI was responsible for the full development cycle, including gameplay systems, physics-based level logic, performance optimization, and implementation of progression and obstacle/blocker mechanics. I also built a custom in-house level editor using JavaScript in Cursor, used to design and iterate on stage layouts efficiently. The game focuses on satisfying knockdown physics, responsive aim-and-shoot controls, and scalable difficulty to keep players engaged over hundreds of levels.",
      "role": "Cheer Games · Mobile / Puzzle",
      "year": "2026",
      "link": "https://play.google.com/store/apps/details?id=com.cheergames.cantoss&hl=en"
    },
    "yarn-maze": {
      "title": "Yarn Maze",
      "summary": "Yarn Maze is a mobile puzzle game published by Cheer Games. I worked on the project as the founding developer, building the core technical foundation before handing it off to another developer for final content and polish.\n\nMy contributions included the base level generation and level-building framework, snake movement logic, and dynamic snake size increment/decrement handling. I also developed the dynamic snake model generation system, wrote the base shaders, and handled core performance optimization to keep gameplay smooth. In addition, I built a custom level editor using JavaScript in Cursor to speed up level design and iteration.",
      "role": "Cheer Games · Mobile / Puzzle",
      "year": "2026",
      "link": "https://apps.apple.com/us/app/yarn-maze/id6769465662"
    },
    "ducky-dash": {
      "title": "Ducky Dash",
      "summary": "Ducky Dash (Loop Puzzle) is a mobile puzzle game I developed as the sole developer at Cheer Games. It takes the \"pixel flow\" loop-puzzle genre as a starting point, reworking the gameplay loop, where players tap ducks to send them looping around a pipe, matching colors to clear blocks before running out of available slots.\n\nI was responsible for the full development cycle, including gameplay systems, level logic, performance optimization, and implementation of progression and difficulty scaling. I also built a standalone level editor in Unity with WebGL export, allowing levels to be designed and published directly through the browser without needing a full engine build. The game focuses on satisfying color-matching feedback, increasingly complex duck-and-block arrangements, and smooth, scalable difficulty across hundreds of levels.",
      "role": "Cheer Games · Mobile / Puzzle",
      "year": "2026",
      "link": "https://apps.apple.com/es/app/ducky-dash-loop-puzzle/id6758933664?l=en-GB&platform=watch"
    },
    "travel-sort": {
      "title": "Travel Sort",
      "summary": "Travel Sort is a mobile puzzle game I developed as the sole developer at Cheer Games. The core experience blends traffic management with color-matching mechanics, challenging players to strategically organize cars and passengers to clear increasingly complex jams.\n\nI was responsible for the full development cycle, including gameplay systems, level logic, performance optimization, and implementation of progression and booster mechanics. The game focuses on delivering satisfying feedback, smooth animations, and scalable difficulty to keep players engaged over hundreds of levels.",
      "role": "Cheer Games · Mobile / Puzzle",
      "year": "2025",
      "link": "https://apps.apple.com/us/app/travel-sort/id6754877852"
    },
    "filled-numbers": {
      "title": "Filled Numbers",
      "summary": "Filled Numbers is a logic-based spatial puzzle game where players place numbered blocks on a grid to match exact counts. Each number on a block indicates how many tiles it must occupy. The challenge lies in fitting all blocks perfectly within the board's constraints without overlaps or gaps.",
      "role": "SuperMesh Games · Mobile / Puzzle",
      "year": "2025"
    },
    "token-sort": {
      "title": "Token Sort",
      "summary": "Token Sort is a casual color-sorting puzzle game where players organize stacks of multicolored numbered tokens into uniform color groups. Each level presents a set of pegs or slots filled with tokens in a randomized order. The player's goal is to sort them by color using limited moves and slots, following a simple drag-and-drop mechanic.",
      "role": "SuperMesh Games",
      "year": "2025"
    },
    "jelly-block-blast": {
      "title": "Jelly Block Blast",
      "summary": "Jelly Block Blast is a vibrant and engaging color-matching puzzle game designed for mobile devices. The core mechanic revolves around strategically placing and stacking colored character blocks on a grid to clear them by forming specific patterns or groups.",
      "role": "SuperMesh Games",
      "year": "2025"
    },
    "bloom-match": {
      "title": "Bloom Match",
      "summary": "It is a mobile game in which you pass levels by merging 3 flowers of the same type on the board.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "fortune-merge": {
      "title": "Fortune Merge",
      "summary": "It is a mobile game where you make bets and earn money by merging items.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "drop-beads": {
      "title": "Drop Beads",
      "summary": "It is a mobile game in which you explode beads of the same color by matching them with each other and try to get the maximum score without crossing the fail line.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "sticker-match": {
      "title": "Sticker Match",
      "summary": "It is a mobile puzzle game where you match objects of the same type in the given time.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "merge-2d": {
      "title": "Merge 2D",
      "summary": "It is a mobile game in which you try to merge the same 2D items by dragging them on top of each other and finish the items on the screen.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "drop-shapes": {
      "title": "Drop Shapes",
      "summary": "It is a mobile puzzle game where you match the shapes with their colors and make them explode.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "spot-my-location": {
      "title": "Spot My Location",
      "summary": "It is a mobile puzzle game in which you pass the levels by placing the characters on the map in the correct locations.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "do-it-3d": {
      "title": "Do It 3D",
      "summary": "It is a mobile puzzle game in which you try to pass the level by interacting with the surrounding objects.\n\nKeywords: splines, pathfinding",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "snakes-and-holes": {
      "title": "Snakes and Holes",
      "summary": "It is a mobile puzzle game in which you pass the levels by moving the snakes on the grid according to their length and putting them all back into the holes.\n\nKeywords: splines, mesh generation, rectangular grid",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "coffee-merge-3d": {
      "title": "Coffee Merge 3D",
      "summary": "It is a mobile puzzle game in which you match coffees in pairs of 3 by placing them together.\n\nKeywords: hexagonal grid",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "wardrobe-sort": {
      "title": "Wardrobe Sort",
      "summary": "It is a mobile puzzle game in which you match clothes in pairs of 3 on the slots below.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "army-sort": {
      "title": "Army Sort",
      "summary": "It is a mobile game where you unite soldiers and destroy enemy structures.",
      "role": "SuperMesh Games",
      "year": "2023"
    },
    "mart-sort": {
      "title": "Mart Sort",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile casual game in which we earn money by sorting and selling the same type of items in the market."
    },
    "stack-match-3d": {
      "title": "Stack Match 3D",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you level up by collecting phones in a slot and merging them. Your goal is to reach the highest level phone."
    },
    "sort-phones": {
      "title": "Sort Phones",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you level up by collecting phones in a slot and merging them. Your goal is to reach the highest level phone."
    },
    "stack-on-top": {
      "title": "Stack On Top",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you try to complete the objectives by stacking coins on top of each other."
    },
    "flight-jam": {
      "title": "Flight Jam",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you try to remove the stuck planes from the field with a swipe."
    },
    "sorted-words": {
      "title": "Sorted Words",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you line up the letters correctly on the shelves."
    },
    "item-sort": {
      "title": "Item Sort",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you have to put items of the same type on the same shelf."
    },
    "packaging-store": {
      "title": "Packaging Store",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you place your items in the right packages. When your buffer board is full you fail."
    },
    "tap-to-shop": {
      "title": "Tap To Shop",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you try to find items in your shopping list."
    },
    "tangled-pair": {
      "title": "Tangled Hair",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile game where you try to untangle tangled hairs."
    },
    "sort-cars": {
      "title": "Soft Cars",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a physics-based mobile puzzle game in which you try to park soft cars in the right places."
    },
    "place-to-blast": {
      "title": "Place To Blast",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile game where we progress by placing the blocks in the board and making blasts."
    },
    "wordless-2": {
      "title": "Wordless 2",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile game where we progress by placing the letters in the board and making the correct words."
    },
    "emoji-cross": {
      "title": "Emoji Cross",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a puzzle mobile game where you solve the emojis by placing them in the right places in the crossword puzzle according to their meanings."
    },
    "wordless": {
      "title": "Wordless",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile game where we progress by placing the letters in the cross puzzle and making the correct words."
    },
    "blast-match-3d": {
      "title": "Blast Match 3D",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a puzzle mobile game where you play by exploding the same colored cubes."
    },
    "gravity-merge": {
      "title": "Gravity Merge",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "Shoot and merge fruits to get even bigger more juicy fruits. Merge identical fruits to start a chain reaction and see how far your combo goes! Chain reactions reward you with awesome power-ups. Use them to blast those pesky obstacles and solve fun puzzles! Watch out for too many fruits though! If you touch the red the game is over!"
    },
    "bottle-water": {
      "title": "Bottle Water",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "Unlock the above pins, establish a proper strategy and provide liquid production. Then, fill the bottles with the liquids we produce, with the pumps below. Upgrades can be made with the money earned by selling bottles."
    },
    "dx-hole": {
      "title": "DX-Hole",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a dx ball-like mobile game where you eat cubes with holes."
    },
    "plate-sort": {
      "title": "Plate Sort",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a mobile puzzle game where you sort the plates on the table according to their size and color."
    },
    "match-up-blocks": {
      "title": "Match Up Blocks",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a puzzle game where you place the blocks below on the boards above."
    },
    "holes-vs-snakes": {
      "title": "Holes vs. Snakes",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a action mobile game where you pass the levels by dropping the surrounding fruits and snakes into the hole."
    },
    "pinned-sticks": {
      "title": "Pinned Sticks",
      "role": "SuperMesh Games",
      "year": "2023",
      "summary": "It is a puzzle mobile game where you release the woods by pulling the pins attached to the woods."
    },
    "hole-gun": {
      "title": "Hole Gun",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "It is a mobile game where you collect valuable items on the platform by throwing black holes around."
    },
    "repair-gun": {
      "title": "Repair Gun",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "A game where you repair repairable objects on the platform by shooting them."
    },
    "repair-guys": {
      "title": "Repair Guys",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "It is a mobile game where you repair repairable objects on the platform by expanding your team."
    },
    "pair-up-cars": {
      "title": "Pair Up Cars",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "It is a puzzle game where you take the cars to the next level by matching cars of the same color and level."
    },
    "basketball-asmr": {
      "title": "Basketball ASMR",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "It is an asmr game where you earn money by scoring in basketball, and you play by opening new balls and new levels with the money you earn."
    },
    "giant-gang": {
      "title": "Giant Gang",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "A runner platform where you crush the giants you come across by advancing on the platform without getting stuck."
    },
    "press-runner": {
      "title": "Press Runner",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "A runner platform where you crush the people you come across by advancing on the platform without getting stuck."
    },
    "merge-and-design": {
      "title": "Merge and Design",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "You upgrade old household items by merging them. You complete the levels by designing your room with the household items you have upgraded."
    },
    "picker-hero": {
      "title": "Picker Hero",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "It is a game where you make money and improve yourself by pouring the cubes into the hole with your collector."
    },
    "mine-bomber": {
      "title": "Mine Bomber",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "Mine Bomber is an arcade game where you detonate bombs in the quarry at the foot of the mountain. You collect resources and process them in your factory to gather more advanced resources."
    },
    "match-and-design": {
      "title": "Match & Design",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "Match and Design is a puzzle game. When you combine three tiles with the same icon, you start designing a room in your home. You progress by opening the houses in your neighborhood with the rooms you have completed."
    },
    "snaky-squad": {
      "title": "Snaky Squad",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "Snaky Squad is a rogue-like action game. You try to pass the levels by forming a balanced team."
    },
    "link-squad": {
      "title": "Link Squad",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "Link Squad is a puzzle action game where you fight your enemies by linking characters of the same color."
    },
    "word-bridge-3d": {
      "title": "Word Bridge 3D",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "Your goal is to answer the questions correctly and bring the people across the island by creating bridges."
    },
    "invention-rush": {
      "title": "Invention Rush",
      "role": "SuperMesh Games",
      "year": "2022",
      "summary": "My first prototype hypercasual game that I released with SuperMesh Games. Your goal is to approach the present through history by the positive choices you make, and to include the inventions from that journey in your exhibition at the end of the level."
    }
  }
};
