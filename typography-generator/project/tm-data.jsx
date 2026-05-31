// tm-data.jsx v3 — Large curated open-source font library with rich scoring metadata
// Each font carries dense metadata that the recommender uses to compute
// dimension scores and to compose the "why this fits" explanation.
//
// Schema:
//   id, name, foundry, classification, subtype
//   fontFamily          — CSS family (must already be loaded)
//   loaded              — whether it's loaded in the prototype (controls preview)
//   mood[]              — adjective vocabulary
//   personality[]       — brand voice descriptors
//   useCases[]          — concrete contexts
//   readability         — 0-100 (body copy comfort)
//   screenSuitability   — 0-100 (rasterization, hinting, x-height)
//   printSuitability    — 0-100 (high res / press)
//   brandFit[]          — industry/segment vocabulary
//   contrast            — Low|Medium|High|Variable
//   xHeight             — Low|Medium|High (apparent x-height)
//   weight              — supported weight range string
//   variable            — has variable axes
//   axes                — variable axes (wght, opsz, ital, slnt, MONO, CASL, etc.)
//   license             — OFL (Free) | Apache 2.0 (Free) | Commercial — Foundry
//   languages           — Latin | Latin Extended | Cyrillic + Greek | Pan-European | etc.
//   pairingWith[]       — known good pairings inside this catalog
//   goodFor[]           — short bullet list — feeds explainability text
//   avoidFor[]          — what NOT to use this for — anti-recommendation
//   notes               — long-form rationale
//   completeness        — 0-100 metadata health
//   addedDate           — ISO date
//   previewText         — display string for cards
//   tags[]              — free-form tags for clustering
//   contextScore        — affinity matrix per known project context (0-100)
//                         keys: saas, editorial, fintech, portfolio, devtool,
//                               consumer, luxury, ecommerce, agency, academic
//   yearReleased        — for vintage/contemporary cues
//   trend               — emerging|established|classic
// ───────────────────────────────────────────────────────────────────

const SAMPLE_COLLECTION = [
  // ── Serifs ────────────────────────────────────────────────────
  {
    id: 1, name: 'Playfair Display', foundry: 'Claus Eggers Sørensen',
    classification: 'Serif', subtype: 'Transitional Display',
    fontFamily: "'Playfair Display', serif", loaded: true,
    mood: ['elegant','editorial','sophisticated','literary','dramatic'],
    personality: ['authoritative','refined','classic'],
    useCases: ['Editorial headlines','Luxury brand identity','Book covers','Magazine titles','Hero text'],
    readability: 82, screenSuitability: 75, printSuitability: 94,
    brandFit: ['luxury','editorial','heritage','fashion','cultural'],
    contrast: 'High', xHeight: 'Medium', weight: '400-900',
    variable: false, axes: [], license: 'OFL (Free)', languages: 'Latin Extended + Cyrillic',
    pairingWith: ['DM Sans','Space Grotesk','Inter'],
    goodFor: ['Headlines at 36px+','Editorial covers','Quote pulls'],
    avoidFor: ['Body copy under 16px','Dense UI tables','Long-form reading'],
    notes: 'Strong contrast and sharp serifs. Excellent for large headlines but contrast hurts at small sizes.',
    completeness: 95, addedDate: '2024-01-15',
    previewText: 'The Art of Type', tags:['high-contrast','editorial','luxury'],
    contextScore:{saas:55,editorial:96,fintech:38,portfolio:82,devtool:30,consumer:60,luxury:94,ecommerce:70,agency:80,academic:78},
    yearReleased: 2011, trend:'established',
  },
  {
    id: 2, name: 'Fraunces', foundry: 'Undercase Type',
    classification: 'Serif', subtype: 'Optical Variable',
    fontFamily: "'Fraunces', serif", loaded: true,
    mood: ['expressive','warm','quirky','contemporary','crafted'],
    personality: ['distinctive','confident','modern'],
    useCases: ['Brand identity','Display headlines','Premium packaging','Editorial','Product hero'],
    readability: 84, screenSuitability: 86, printSuitability: 92,
    brandFit: ['premium','craft','food-and-beverage','lifestyle','cultural'],
    contrast: 'Medium', xHeight: 'Medium', weight: '100-900',
    variable: true, axes: ['wght','opsz','SOFT','WONK','ital'],
    license: 'OFL (Free)', languages: 'Latin Extended',
    pairingWith: ['DM Sans','Space Grotesk','Inter'],
    goodFor: ['Variable display work','Editorial covers','Tactile brands','Modern luxury'],
    avoidFor: ['Sterile fintech voices','Pure data UI'],
    notes: 'Optical size axis. Italic is particularly expressive. WONK axis adds delightful character.',
    completeness: 100, addedDate: '2024-02-01',
    previewText: 'Something worth saying', tags:['variable','optical','crafted'],
    contextScore:{saas:72,editorial:90,fintech:55,portfolio:90,devtool:48,consumer:78,luxury:88,ecommerce:80,agency:88,academic:70},
    yearReleased: 2020, trend:'emerging',
  },
  {
    id: 3, name: 'Cormorant Garamond', foundry: 'Christian Thalmann',
    classification: 'Serif', subtype: 'Old Style',
    fontFamily: "'Cormorant Garamond', serif", loaded: true,
    mood: ['refined','luxury','classic','timeless','delicate'],
    personality: ['graceful','intellectual','restrained'],
    useCases: ['Luxury fashion','High-end editorial','Book typography','Portfolio','Wedding invites'],
    readability: 76, screenSuitability: 68, printSuitability: 97,
    brandFit: ['luxury','fashion','art','culture','academic'],
    contrast: 'High', xHeight: 'Low', weight: '300-700',
    variable: false, axes: [], license: 'OFL (Free)', languages: 'Latin Extended + Greek',
    pairingWith: ['DM Sans','Syne','Inter'],
    goodFor: ['Display sizes 48px+','Luxury print','Italic flourishes','Display headlines'],
    avoidFor: ['Small UI text','Mobile body copy','Low-resolution screens'],
    notes: 'Extremely refined and delicate. Best at larger sizes. The italic is stunning. Six optical sub-families.',
    completeness: 88, addedDate: '2024-02-15',
    previewText: 'Grace under pressure', tags:['classical','luxury','low-x-height'],
    contextScore:{saas:30,editorial:92,fintech:25,portfolio:84,devtool:18,consumer:55,luxury:97,ecommerce:62,agency:74,academic:90},
    yearReleased: 2015, trend:'established',
  },
  {
    id: 4, name: 'Libre Baskerville', foundry: 'Pablo Impallari',
    classification: 'Serif', subtype: 'Transitional',
    fontFamily: "'Libre Baskerville', serif", loaded: true,
    mood: ['classic','academic','reliable','authoritative','warm'],
    personality: ['steady','trustworthy','traditional'],
    useCases: ['Long-form reading','Editorial body','Academic publishing','Blog typography'],
    readability: 92, screenSuitability: 88, printSuitability: 90,
    brandFit: ['editorial','academic','heritage','non-profit'],
    contrast: 'Medium', xHeight: 'Medium', weight: '400-700',
    variable: false, axes: [], license: 'OFL (Free)', languages: 'Latin Extended',
    pairingWith: ['Inter','DM Sans','Space Grotesk'],
    goodFor: ['Body copy 16-20px','Long reading','Editorial bodies','Trust-driven content'],
    avoidFor: ['Bold display','Tech startups','Avant-garde brands'],
    notes: 'Optimised for body. Larger x-height than original Baskerville for screen comfort.',
    completeness: 90, addedDate: '2024-02-20',
    previewText: 'Words that endure', tags:['body-text','reading','academic'],
    contextScore:{saas:58,editorial:94,fintech:62,portfolio:70,devtool:38,consumer:60,luxury:74,ecommerce:65,agency:65,academic:96},
    yearReleased: 2012, trend:'classic',
  },
  {
    id: 5, name: 'DM Serif Display', foundry: 'Colophon Foundry',
    classification: 'Serif', subtype: 'Display',
    fontFamily: "'DM Serif Display', serif", loaded: true,
    mood: ['expressive','elegant','editorial','dramatic'],
    personality: ['confident','poetic','editorial'],
    useCases: ['Hero headlines','Editorial titles','Quote pulls','Magazine covers'],
    readability: 78, screenSuitability: 80, printSuitability: 88,
    brandFit: ['editorial','lifestyle','luxury','agency'],
    contrast: 'High', xHeight: 'Medium', weight: '400',
    variable: false, axes: [], license: 'OFL (Free)', languages: 'Latin Extended',
    pairingWith: ['DM Sans','Inter'],
    goodFor: ['Display 48px+','Italic accents','Editorial covers'],
    avoidFor: ['Body copy','Compact UI','Tables'],
    notes: 'Display-only. Italic carries swash energy. Pairs naturally with DM Sans.',
    completeness: 82, addedDate: '2024-03-04',
    previewText: 'A new chapter', tags:['display','editorial','italic'],
    contextScore:{saas:60,editorial:92,fintech:42,portfolio:80,devtool:30,consumer:68,luxury:86,ecommerce:72,agency:84,academic:62},
    yearReleased: 2019, trend:'established',
  },
  {
    id: 6, name: 'Source Serif 4', foundry: 'Adobe (Frank Grießhammer)',
    classification: 'Serif', subtype: 'Transitional',
    fontFamily: "'Source Serif 4', 'Source Serif Pro', serif", loaded: false,
    mood: ['neutral','clean','reliable','contemporary'],
    personality: ['professional','versatile','calm'],
    useCases: ['Documentation','Publishing','Long-form','Editorial body'],
    readability: 94, screenSuitability: 92, printSuitability: 92,
    brandFit: ['saas','editorial','academic','enterprise'],
    contrast: 'Medium', xHeight: 'Medium', weight: '200-900',
    variable: true, axes: ['wght','opsz','ital'], license: 'OFL (Free)', languages: 'Pan-European + Greek + Cyrillic',
    pairingWith: ['Source Sans 3','Inter'],
    goodFor: ['Documentation sites','Long-form reading','Books at any size'],
    avoidFor: ['Loud display work','Bold expressive brands'],
    notes: 'Conservative and professional. The "Inter" of serifs — rarely wrong, rarely thrilling.',
    completeness: 88, addedDate: '2024-03-12',
    previewText: 'Built to be read', tags:['variable','reading','professional'],
    contextScore:{saas:82,editorial:88,fintech:78,portfolio:62,devtool:72,consumer:60,luxury:65,ecommerce:60,agency:60,academic:94},
    yearReleased: 2014, trend:'established',
  },
  // ── Sans-serifs ───────────────────────────────────────────────
  {
    id: 7, name: 'Inter', foundry: 'Rasmus Andersson',
    classification: 'Sans-serif', subtype: 'Neo-grotesque',
    fontFamily: "'Inter', system-ui, sans-serif", loaded: true,
    mood: ['neutral','functional','modern','clear'],
    personality: ['versatile','industrial','UI-first'],
    useCases: ['UI text','Product interfaces','Dashboards','Documentation','Tables'],
    readability: 96, screenSuitability: 99, printSuitability: 84,
    brandFit: ['saas','tech','fintech','enterprise','startup'],
    contrast: 'Low', xHeight: 'High', weight: '100-900',
    variable: true, axes: ['wght','opsz','slnt'],
    license: 'OFL (Free)', languages: 'Pan-European + Cyrillic + Greek + Vietnamese',
    pairingWith: ['Fraunces','Source Serif 4','Playfair Display','Libre Baskerville'],
    goodFor: ['UI down to 11px','Data tables','Number-heavy UI','Settings','Mobile UI'],
    avoidFor: ['Pure editorial','Display work where character matters'],
    notes: 'The de-facto SaaS UI standard. Tabular figures, optical sizes, very high x-height. Comprehensive scripts.',
    completeness: 100, addedDate: '2024-01-08',
    previewText: 'Designed for screens', tags:['variable','ui','tabular','industry-default'],
    contextScore:{saas:99,editorial:62,fintech:96,portfolio:78,devtool:95,consumer:84,luxury:55,ecommerce:88,agency:75,academic:78},
    yearReleased: 2016, trend:'established',
  },
  {
    id: 8, name: 'DM Sans', foundry: 'Colophon Foundry',
    classification: 'Sans-serif', subtype: 'Geometric',
    fontFamily: "'DM Sans', sans-serif", loaded: true,
    mood: ['clean','modern','friendly','approachable'],
    personality: ['versatile','neutral','professional'],
    useCases: ['UI text','Product interfaces','Digital content','Body copy','Mobile'],
    readability: 95, screenSuitability: 97, printSuitability: 88,
    brandFit: ['tech','saas','startup','fintech','consumer'],
    contrast: 'Low', xHeight: 'High', weight: '100-1000',
    variable: true, axes: ['wght','opsz','ital'],
    license: 'OFL (Free)', languages: 'Latin Extended + Cyrillic',
    pairingWith: ['Playfair Display','Fraunces','DM Serif Display'],
    goodFor: ['UI 12-16px','Mobile body','Friendly product voice','Optical small sizes'],
    avoidFor: ['Heavy editorial','Maximum-trust enterprise'],
    notes: 'Variable font with optical sizes. Slightly warmer than Inter — friendlier voice.',
    completeness: 100, addedDate: '2024-01-20',
    previewText: 'Clarity at every scale', tags:['variable','ui','warm-sans'],
    contextScore:{saas:92,editorial:60,fintech:84,portfolio:78,devtool:78,consumer:90,luxury:62,ecommerce:88,agency:78,academic:65},
    yearReleased: 2014, trend:'established',
  },
  {
    id: 9, name: 'Space Grotesk', foundry: 'Florian Karsten',
    classification: 'Sans-serif', subtype: 'Grotesque',
    fontFamily: "'Space Grotesk', sans-serif", loaded: true,
    mood: ['technical','modern','forward','confident','futuristic'],
    personality: ['distinctive','precise','technological'],
    useCases: ['Developer tools','Tech products','SaaS','Startups','Web3'],
    readability: 88, screenSuitability: 93, printSuitability: 82,
    brandFit: ['tech','developer','web3','saas','crypto'],
    contrast: 'Medium', xHeight: 'High', weight: '300-700',
    variable: true, axes: ['wght'], license: 'OFL (Free)', languages: 'Latin Extended + Vietnamese',
    pairingWith: ['DM Sans','Libre Baskerville','Inter','Fraunces'],
    goodFor: ['Tech-forward UI','Data viz','Distinctive product tone'],
    avoidFor: ['Heritage/luxury','Long-form reading'],
    notes: 'Distinctive letterforms with quirky character. Strong for tech-forward brands. Based on Space Mono.',
    completeness: 92, addedDate: '2024-02-10',
    previewText: 'Build the future', tags:['variable','tech','distinctive'],
    contextScore:{saas:88,editorial:55,fintech:75,portfolio:84,devtool:96,consumer:72,luxury:40,ecommerce:68,agency:84,academic:55},
    yearReleased: 2018, trend:'established',
  },
  {
    id: 10, name: 'Syne', foundry: 'Bonjour Monde',
    classification: 'Sans-serif', subtype: 'Display Geometric',
    fontFamily: "'Syne', sans-serif", loaded: true,
    mood: ['avant-garde','creative','bold','experimental','cultural'],
    personality: ['unconventional','expressive','artistic'],
    useCases: ['Art direction','Creative studios','Cultural institutions','Brand display','Posters'],
    readability: 72, screenSuitability: 80, printSuitability: 88,
    brandFit: ['creative','art','culture','agency','exhibition'],
    contrast: 'Variable', xHeight: 'Medium', weight: '400-800',
    variable: false, axes: [], license: 'OFL (Free)', languages: 'Latin',
    pairingWith: ['DM Sans','Cormorant Garamond','Inter'],
    goodFor: ['Display 32px+','Cultural identity','Posters','Exhibition graphics'],
    avoidFor: ['Body copy','Conservative brands','Dense UI'],
    notes: 'Striking display type. Mono and Tactile companion families. Use sparingly for maximum impact.',
    completeness: 80, addedDate: '2024-03-01',
    previewText: 'Make it unforgettable', tags:['display','creative','distinctive'],
    contextScore:{saas:48,editorial:80,fintech:25,portfolio:92,devtool:40,consumer:78,luxury:65,ecommerce:60,agency:96,academic:50},
    yearReleased: 2017, trend:'emerging',
  },
  // ── Loaded for hero/specimens but not in default collection (web suggestions) ──
];

// Companion library — a curated open-source font library the recommender
// can surface as "Library Suggestions" beyond the user's collection.
// All OFL/Apache/SIL — explicitly free for commercial use.
const OPEN_FONT_LIBRARY = [
  {
    id:'lib-1', name:'IBM Plex Sans', foundry:'IBM',
    classification:'Sans-serif', subtype:'Neo-grotesque',
    license:'OFL (Free)', languages:'Pan-European',
    mood:['neutral','engineered','trustworthy','contemporary'],
    brandFit:['enterprise','tech','saas','fintech'],
    readability:94, screenSuitability:96, printSuitability:88,
    pairingWith:['IBM Plex Serif','IBM Plex Mono'],
    goodFor:['Enterprise UI','Documentation','Multi-script products'],
    avoidFor:['Loud creative','Editorial luxury'],
    notes:'IBM\'s engineered voice. Mono + Serif companions create a complete system.',
    contextScore:{saas:94,editorial:65,fintech:90,portfolio:60,devtool:88,consumer:70,luxury:48,ecommerce:78,agency:68,academic:80},
    fontFamily:"'Inter', system-ui, sans-serif", previewText:'Engineered for clarity',
    confidence:91, source:'web', usedBy:['IBM','Cisco'], reason:'Engineered neutral grotesque with mono + serif companions — complete system without licensing friction.',
    matchStrength:'Excellent', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Slightly cooler/colder voice than DM Sans. Best when you want engineered trust.',
    pairingNote:'Best paired with IBM Plex Serif for editorial moments.',
  },
  {
    id:'lib-2', name:'Manrope', foundry:'Mikhail Sharanda',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['warm','modern','friendly','crafted'],
    brandFit:['saas','consumer','startup','wellness'],
    readability:93, screenSuitability:95, printSuitability:84,
    pairingWith:['Fraunces','Playfair Display'],
    goodFor:['Consumer SaaS','Mobile-first','Wellness/health products','UI text'],
    avoidFor:['Heavy enterprise','Editorial print'],
    notes:'Variable. Slightly rounded terminals create approachable warmth.',
    contextScore:{saas:90,editorial:60,fintech:78,portfolio:75,devtool:62,consumer:94,luxury:58,ecommerce:88,agency:72,academic:55},
    fontFamily:"'Inter', system-ui, sans-serif", previewText:'Friendly by design',
    confidence:89, source:'web', usedBy:['Mailchimp clones','wellness apps'], reason:'Variable geometric with warmer terminals than Inter — friendlier consumer SaaS voice.',
    matchStrength:'Strong', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Less neutral than Inter — adds personality, less ideal for pure data UI.',
    pairingNote:'Pairs beautifully with Fraunces for warm editorial moments.',
  },
  {
    id:'lib-3', name:'Geist', foundry:'Vercel',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['precise','engineered','contemporary','minimal'],
    brandFit:['developer','saas','startup','tech'],
    readability:93, screenSuitability:96, printSuitability:80,
    pairingWith:['Geist Mono','Inter'],
    goodFor:['Developer tools','Modern SaaS','Mono companion needs','UI text'],
    avoidFor:['Editorial luxury','Heritage brands'],
    notes:'Vercel\'s in-house family. Excellent mono companion. Inspired by Inter, with sharper geometry.',
    contextScore:{saas:92,editorial:48,fintech:78,portfolio:80,devtool:96,consumer:75,luxury:42,ecommerce:72,agency:74,academic:55},
    fontFamily:"'Space Grotesk', sans-serif", previewText:'Engineered minimalism',
    confidence:90, source:'web', usedBy:['Vercel','v0'], reason:'Modern geometric SaaS face with strong mono companion. Free to use, Inter-adjacent feel.',
    matchStrength:'Excellent', priceRange:'Free', availability:'OFL — Vercel/GitHub',
    tradeoffs:'Newer (less battle-tested than Inter). Sharper personality — slightly less neutral.',
    pairingNote:'Geist Mono is one of the most readable code faces available.',
  },
  {
    id:'lib-4', name:'JetBrains Mono', foundry:'JetBrains',
    classification:'Monospace', subtype:'Code',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['technical','readable','engineered'],
    brandFit:['developer','tech','saas'],
    readability:95, screenSuitability:97, printSuitability:78,
    pairingWith:['Inter','Space Grotesk','DM Sans'],
    goodFor:['Code blocks','Terminal UI','Data displays','Diff views'],
    avoidFor:['Body copy','Display headlines'],
    notes:'Designed for the IDE. Ligatures, programming-aware shapes. The standard.',
    contextScore:{saas:78,editorial:30,fintech:55,portfolio:60,devtool:99,consumer:38,luxury:25,ecommerce:30,agency:55,academic:62},
    fontFamily:"'Space Grotesk', sans-serif", previewText:'console.log("hello")',
    confidence:93, source:'web', usedBy:['JetBrains IDEs','code blocks everywhere'], reason:'Open-source code face with programming ligatures. Industry default for developer tooling.',
    matchStrength:'Excellent', priceRange:'Free', availability:'OFL — JetBrains',
    tradeoffs:'Mono only — needs a sans companion.',
    pairingNote:'Pairs naturally with Inter or Space Grotesk for the surrounding UI.',
  },
  {
    id:'lib-5', name:'Spectral', foundry:'Production Type',
    classification:'Serif', subtype:'Contemporary Transitional',
    license:'OFL (Free)', languages:'Pan-European',
    mood:['refined','editorial','contemporary','warm'],
    brandFit:['editorial','academic','saas','luxury'],
    readability:93, screenSuitability:90, printSuitability:92,
    pairingWith:['Inter','DM Sans'],
    goodFor:['Long-form reading','Editorial product','Knowledge-base UIs'],
    avoidFor:['Loud display','Cold tech voices'],
    notes:'Designed for Google Docs. Built specifically for screen reading.',
    contextScore:{saas:78,editorial:92,fintech:62,portfolio:78,devtool:48,consumer:68,luxury:78,ecommerce:65,agency:72,academic:90},
    fontFamily:"'Libre Baskerville', serif", previewText:'Designed to be read',
    confidence:88, source:'web', usedBy:['Google Docs','Notion alternatives'], reason:'Modern transitional serif with screen-first metrics — excellent for reading-heavy products.',
    matchStrength:'Strong', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Slightly less character than Fraunces — favours utility.',
    pairingNote:'Inter or DM Sans complete a screen-first system.',
  },
  {
    id:'lib-6', name:'Inria Serif', foundry:'Black[Foundry]',
    classification:'Serif', subtype:'Old Style',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['institutional','warm','academic','gentle'],
    brandFit:['academic','non-profit','editorial','heritage'],
    readability:90, screenSuitability:84, printSuitability:94,
    pairingWith:['Inria Sans','Inter'],
    goodFor:['Academic publishing','Long-form reading','Institutional brands'],
    avoidFor:['Tech startups','Loud consumer'],
    notes:'Designed for INRIA — the French research institution. Warm, gently humanist.',
    contextScore:{saas:55,editorial:88,fintech:50,portfolio:62,devtool:38,consumer:52,luxury:62,ecommerce:48,agency:60,academic:96},
    fontFamily:"'Libre Baskerville', serif", previewText:'In service of knowledge',
    confidence:84, source:'web', usedBy:['INRIA','academic publications'], reason:'Institutional serif with warmth — bridges academic credibility and approachability.',
    matchStrength:'Strong', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Less commercial polish than Spectral — feels more institutional.',
    pairingNote:'Inria Sans is its native companion.',
  },
  {
    id:'lib-7', name:'Public Sans', foundry:'U.S. Web Design System',
    classification:'Sans-serif', subtype:'Neo-grotesque',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['neutral','accessible','civic','clear'],
    brandFit:['government','non-profit','enterprise','accessibility-first'],
    readability:96, screenSuitability:96, printSuitability:86,
    pairingWith:['Source Serif 4','Inter'],
    goodFor:['Accessibility-first products','Civic tech','Forms-heavy UI'],
    avoidFor:['Branded display work','Luxury/lifestyle'],
    notes:'Built for U.S. government sites. Maximally accessible, intentionally generic.',
    contextScore:{saas:80,editorial:55,fintech:78,portfolio:48,devtool:62,consumer:65,luxury:38,ecommerce:62,agency:50,academic:78},
    fontFamily:"'Inter', system-ui, sans-serif", previewText:'Accessible to everyone',
    confidence:86, source:'web', usedBy:['USWDS','government products'], reason:'Government-grade accessibility. The safest possible default for civic and enterprise tooling.',
    matchStrength:'Strong', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Intentionally bland — no brand voice. Use when accessibility > personality.',
    pairingNote:'Source Serif 4 for editorial moments inside accessibility-first systems.',
  },
  {
    id:'lib-8', name:'Fira Sans', foundry:'Mozilla / Erik Spiekermann',
    classification:'Sans-serif', subtype:'Humanist',
    license:'OFL (Free)', languages:'Pan-European + Hebrew + Arabic + Thai',
    mood:['humanist','approachable','distinctive','reliable'],
    brandFit:['saas','non-profit','consumer','open-source'],
    readability:94, screenSuitability:94, printSuitability:88,
    pairingWith:['Fira Code','Source Serif 4'],
    goodFor:['Multilingual products','Open-source brands','Humanist voice'],
    avoidFor:['Cold engineered tone','Pure luxury'],
    notes:'Mozilla\'s humanist family. Exceptional script coverage. Companion code face.',
    contextScore:{saas:84,editorial:70,fintech:66,portfolio:65,devtool:80,consumer:80,luxury:48,ecommerce:70,agency:65,academic:82},
    fontFamily:"'Inter', system-ui, sans-serif", previewText:'Human, by design',
    confidence:85, source:'web', usedBy:['Mozilla','Firefox','open-source projects'], reason:'Humanist warmth with industrial-grade script coverage. Strong choice for global products.',
    matchStrength:'Strong', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Less neutral than Inter. More personality, less infinite use.',
    pairingNote:'Fira Code in code blocks.',
  },
  {
    id:'lib-9', name:'Bricolage Grotesque', foundry:'Mathieu Triay',
    classification:'Sans-serif', subtype:'Display Grotesque',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['warm','crafted','contemporary','characterful'],
    brandFit:['saas','consumer','startup','agency'],
    readability:88, screenSuitability:92, printSuitability:84,
    pairingWith:['Fraunces','Playfair Display','Inter'],
    goodFor:['Modern brand display','Variable system needs','Distinctive product voice','Display headlines'],
    avoidFor:['Pure UI body','Cold engineered tone'],
    notes:'Variable font with width + grade axes. Newer, fashionable, distinctive without being weird.',
    contextScore:{saas:84,editorial:78,fintech:62,portfolio:88,devtool:62,consumer:88,luxury:70,ecommerce:80,agency:90,academic:60},
    fontFamily:"'Space Grotesk', sans-serif", previewText:'Crafted display energy',
    confidence:90, source:'web', usedBy:['emerging design-led products'], reason:'Trending grotesque with width axis — gives instant brand distinctiveness while staying functional.',
    matchStrength:'Excellent', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Newer = less battle-tested. Slight personality cost for body use.',
    pairingNote:'Fraunces or Playfair for editorial counterpoint.',
  },
  {
    id:'lib-10', name:'Newsreader', foundry:'Production Type',
    classification:'Serif', subtype:'Editorial',
    license:'OFL (Free)', languages:'Pan-European',
    mood:['editorial','warm','contemporary','readable'],
    brandFit:['editorial','publishing','blog','knowledge'],
    readability:95, screenSuitability:92, printSuitability:90,
    pairingWith:['Inter','DM Sans'],
    goodFor:['Long-form reading','Modern publishing','Newsletter brands','Editorial content'],
    avoidFor:['Loud display','Pure tech voices'],
    notes:'Variable, with optical size axis. Designed for screen-first publishing.',
    contextScore:{saas:72,editorial:96,fintech:55,portfolio:75,devtool:42,consumer:74,luxury:72,ecommerce:62,agency:75,academic:88},
    fontFamily:"'Libre Baskerville', serif", previewText:'Stories that hold attention',
    confidence:91, source:'web', usedBy:['contemporary publishing','newsletter platforms'], reason:'Variable optical-size editorial serif tuned for screen reading. Modern publishing\'s favourite.',
    matchStrength:'Excellent', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Editorial-leaning — less utilitarian than Source Serif.',
    pairingNote:'Inter or DM Sans for the surrounding UI.',
  },
  {
    id:'lib-11', name:'Outfit', foundry:'Smile Pixels',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['friendly','contemporary','approachable','clean'],
    brandFit:['consumer','startup','wellness','lifestyle'],
    readability:91, screenSuitability:94, printSuitability:80,
    pairingWith:['Fraunces','Newsreader'],
    goodFor:['Consumer apps','Marketing pages','Wellness/lifestyle brands','UI text','Mobile app UI'],
    avoidFor:['Cold enterprise','Editorial print'],
    notes:'Variable geometric — friendlier than Inter, less character than Manrope.',
    contextScore:{saas:80,editorial:55,fintech:62,portfolio:75,devtool:50,consumer:92,luxury:55,ecommerce:84,agency:75,academic:48},
    fontFamily:"'DM Sans', sans-serif", previewText:'Easygoing UI',
    confidence:84, source:'web', usedBy:['marketing pages','consumer apps'], reason:'Variable geometric — fast load, friendly tone, broad-spectrum consumer fit.',
    matchStrength:'Good', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Less distinctive than Bricolage. Bigger crowd.',
    pairingNote:'Newsreader for editorial moments.',
  },
  {
    id:'lib-12', name:'EB Garamond', foundry:'Georg Duffner',
    classification:'Serif', subtype:'Old Style',
    license:'OFL (Free)', languages:'Latin Extended + Greek + Cyrillic',
    mood:['classic','heritage','gentle','literary'],
    brandFit:['academic','literary','heritage','luxury'],
    readability:91, screenSuitability:80, printSuitability:97,
    pairingWith:['Inter','Source Sans 3'],
    goodFor:['Print typography','Academic publishing','Literary brands'],
    avoidFor:['Modern tech','Loud display'],
    notes:'Open digitisation of Garamond. The standard for classical print.',
    contextScore:{saas:42,editorial:88,fintech:38,portfolio:70,devtool:25,consumer:48,luxury:84,ecommerce:55,agency:60,academic:96},
    fontFamily:"'Cormorant Garamond', serif", previewText:'A familiar voice',
    confidence:82, source:'web', usedBy:['academic press','literary brands'], reason:'OFL Garamond — classical authority without licensing fees. Print-first.',
    matchStrength:'Strong', priceRange:'Free', availability:'OFL — Google Fonts',
    tradeoffs:'Smaller x-height — body sizes need to bump up. Less screen-optimised than Spectral.',
    pairingNote:'Source Sans 3 or Inter for screen UI counterpoint.',
  },

  // ── Expanded curated library (Phase 2 data pass) ─────────────────────
  // 52 additional entries covering the full spectrum of commonly-recommended
  // fonts. Each has complete metadata so the scorer produces differentiated,
  // high-quality results beyond the original 22 entries.
  // ──────────────────────────────────────────────────────────────────────

  // ── Popular Neo-grotesque / Humanist sans ─────────────────────────────
  {
    id:'lib-13', name:'Roboto', foundry:'Christian Robertson / Google',
    classification:'Sans-serif', subtype:'Neo-grotesque',
    license:'Apache 2.0 (Free)', languages:'Pan-European + Cyrillic + Greek + Vietnamese',
    mood:['neutral','systematic','clean','reliable','versatile'],
    personality:['industrial','comprehensive','UI-native'],
    useCases:['UI text','Android apps','Material Design','Product interfaces','Documentation','Tables'],
    brandFit:['tech','enterprise','mobile','saas','consumer'],
    readability:95, screenSuitability:97, printSuitability:83,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:false, axes:[],
    pairingWith:['Merriweather','Lora','Roboto Serif','Roboto Slab'],
    goodFor:['UI at 12px+','Android/Material products','Body copy','Technical docs','Tables and numbers'],
    avoidFor:['Luxury/premium brands','Highly distinctive voice','Pure editorial print'],
    notes:'Google\'s signature grotesque — the de-facto Material Design standard. Enormous weight and width range. Tabular figures.',
    contextScore:{saas:88,editorial:60,fintech:88,portfolio:62,devtool:88,consumer:84,luxury:44,ecommerce:84,agency:62,academic:75},
    fontFamily:"'Roboto', Arial, sans-serif", previewText:'Precision in motion',
    confidence:95, source:'open-library', completeness:92,
    tradeoffs:'Ubiquitous — safe but forgettable as a brand voice.',
    pairingNote:'Merriweather or Roboto Serif for editorial contrast.',
  },
  {
    id:'lib-14', name:'Open Sans', foundry:'Steve Matteson / Ascender Corp',
    classification:'Sans-serif', subtype:'Humanist',
    license:'Apache 2.0 (Free)', languages:'Pan-European + Cyrillic + Greek + Vietnamese',
    mood:['open','friendly','clear','neutral','accessible'],
    personality:['inclusive','readable','universally-approachable'],
    useCases:['Body text','Forms','Long-form reading','UI labels','Documentation'],
    brandFit:['consumer','healthcare','education','non-profit','enterprise'],
    readability:97, screenSuitability:95, printSuitability:88,
    contrast:'Low', xHeight:'High', weight:'300-800', variable:false, axes:[],
    pairingWith:['Merriweather','Lora','Playfair Display'],
    goodFor:['Body text 14-18px','Accessibility-first products','Forms','Long-form web','Multilingual UI'],
    avoidFor:['Display at 60px+','Strong brand identity','Distinctly characterful voice'],
    notes:'Designed for legibility across print, web, and mobile. Very high x-height. One of the most-deployed web fonts ever.',
    contextScore:{saas:84,editorial:62,fintech:80,portfolio:60,devtool:75,consumer:90,luxury:46,ecommerce:86,agency:60,academic:84},
    fontFamily:"'Open Sans', Arial, sans-serif", previewText:'Open to everyone',
    confidence:94, source:'open-library', completeness:90,
    tradeoffs:'Very popular — lacks distinctive brand voice.',
    pairingNote:'Merriweather or Lora create strong heading-body contrast.',
  },
  {
    id:'lib-15', name:'Lato', foundry:'Łukasz Dziedzic',
    classification:'Sans-serif', subtype:'Humanist',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['warm','professional','balanced','clean','versatile'],
    personality:['approachable','reliable','corporate-friendly'],
    useCases:['Corporate UI','Body copy','Email','Presentation','Dashboard labels'],
    brandFit:['corporate','healthcare','consulting','SaaS','non-profit'],
    readability:95, screenSuitability:93, printSuitability:88,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:false, axes:[],
    pairingWith:['Merriweather','Playfair Display','Lora'],
    goodFor:['Corporate body copy','Presentations','Email newsletters','Dashboard text'],
    avoidFor:['Strong display work','Avant-garde brands','Maximum distinctiveness'],
    notes:'Polish designer. More warmth than Roboto, more neutral than Poppins — the mid-ground professional choice.',
    contextScore:{saas:82,editorial:65,fintech:84,portfolio:66,devtool:70,consumer:84,luxury:52,ecommerce:82,agency:68,academic:78},
    fontFamily:"'Lato', Arial, sans-serif", previewText:'Balanced by design',
    confidence:93, source:'open-library', completeness:88,
    tradeoffs:'Popular and safe — limited brand distinctiveness.',
    pairingNote:'Merriweather for editorial depth; Playfair Display for premium lift.',
  },
  {
    id:'lib-16', name:'Poppins', foundry:'Indian Type Foundry',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Devanagari',
    mood:['friendly','modern','warm','rounded','energetic'],
    personality:['approachable','youthful','confident'],
    useCases:['Marketing pages','Consumer apps','Landing pages','Display headings','Mobile UI'],
    brandFit:['consumer','startup','wellness','lifestyle','edtech'],
    readability:91, screenSuitability:91, printSuitability:82,
    contrast:'Low', xHeight:'Medium', weight:'100-900', variable:false, axes:[],
    pairingWith:['Merriweather','Fraunces','Lora','Playfair Display'],
    goodFor:['Marketing headlines','Consumer apps','Landing pages','Product UI','Mobile first'],
    avoidFor:['Dense data tables','Strict enterprise','Body copy at small sizes'],
    notes:'Geometric circular letterforms with even stroke weight. Devanagari support included. Hugely popular for marketing.',
    contextScore:{saas:80,editorial:54,fintech:60,portfolio:84,devtool:54,consumer:95,luxury:54,ecommerce:90,agency:84,academic:52},
    fontFamily:"'Poppins', sans-serif", previewText:'Warm and purposeful',
    confidence:93, source:'open-library', completeness:90,
    tradeoffs:'Geometric uniformity limits character contrast with body text.',
    pairingNote:'Merriweather or Fraunces provide editorial contrast.',
  },
  {
    id:'lib-17', name:'Montserrat', foundry:'Julieta Ulanovsky',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['bold','contemporary','geometric','elegant','modern'],
    personality:['strong','confident','versatile'],
    useCases:['Display headings','Navigation','Marketing','Poster design','Brand headers'],
    brandFit:['agency','fashion','consumer','startup','editorial'],
    readability:87, screenSuitability:88, printSuitability:86,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:false, axes:[],
    pairingWith:['Merriweather','Lora','Lato'],
    goodFor:['Display headings','Navigation labels','Marketing','Brand identity headers'],
    avoidFor:['Long-form body copy','Small UI text under 13px'],
    notes:'Inspired by the urban typography of Buenos Aires. All-caps and mixed-case both excel. Very legible uppercase.',
    contextScore:{saas:78,editorial:72,fintech:72,portfolio:88,devtool:60,consumer:82,luxury:72,ecommerce:86,agency:90,academic:60},
    fontFamily:"'Montserrat', sans-serif", previewText:'Bold and geometric',
    confidence:92, source:'open-library', completeness:88,
    tradeoffs:'Body copy at small sizes can feel mechanical.',
    pairingNote:'Merriweather or Lora for body copy contrast.',
  },
  {
    id:'lib-18', name:'Nunito', foundry:'Vernon Adams',
    classification:'Sans-serif', subtype:'Rounded',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['friendly','rounded','warm','playful','soft'],
    personality:['approachable','gentle','inviting'],
    useCases:['Children\'s products','Wellness apps','Consumer UI','Mobile apps','Body copy'],
    brandFit:['wellness','consumer','edtech','mobile','lifestyle'],
    readability:92, screenSuitability:91, printSuitability:80,
    contrast:'Low', xHeight:'Medium', weight:'200-1000', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Lora','Playfair Display'],
    goodFor:['Consumer apps','Wellness products','Body copy','Mobile UI','Approachable products'],
    avoidFor:['Enterprise/finance','Cold technical products','Formal legal'],
    notes:'Rounded terminals create a soft, welcoming impression. Variable weight range. Extremely popular for consumer-facing products.',
    contextScore:{saas:72,editorial:50,fintech:52,portfolio:70,devtool:50,consumer:96,luxury:46,ecommerce:88,agency:68,academic:50},
    fontFamily:"'Nunito', sans-serif", previewText:'Warm by nature',
    confidence:91, source:'open-library', completeness:88,
    tradeoffs:'Rounded forms can undermine authority in formal contexts.',
    pairingNote:'Fraunces adds editorial weight for content platforms.',
  },
  {
    id:'lib-19', name:'Raleway', foundry:'Matt McInerney / Multiple',
    classification:'Sans-serif', subtype:'Display Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['elegant','refined','modern','thin','distinctive'],
    personality:['premium','stylish','confident'],
    useCases:['Display headers','Fashion brands','Premium product names','Hero headings','Thin titles'],
    brandFit:['luxury','fashion','premium','portfolio','agency'],
    readability:82, screenSuitability:80, printSuitability:84,
    contrast:'Variable', xHeight:'Medium', weight:'100-900', variable:false, axes:[],
    pairingWith:['Merriweather','Lora','Cormorant Garamond'],
    goodFor:['Display headers 32px+','Fashion/beauty brands','All-caps titles','Premium brand names'],
    avoidFor:['Body copy','Dense UI','Small screen text'],
    notes:'Geometric with Art Deco influences. The W letterform is the signature. Particularly strong in thin weights.',
    contextScore:{saas:62,editorial:78,fintech:55,portfolio:90,devtool:44,consumer:72,luxury:84,ecommerce:78,agency:88,academic:58},
    fontFamily:"'Raleway', sans-serif", previewText:'Elegance in structure',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Thin weights can be inaccessible on low-contrast displays.',
    pairingNote:'Merriweather or Lora for body copy depth.',
  },
  {
    id:'lib-20', name:'Cabin', foundry:'Impallari Type',
    classification:'Sans-serif', subtype:'Humanist',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['friendly','solid','approachable','warm','humanist'],
    personality:['grounded','reliable','unpretentious'],
    useCases:['UI text','Body copy','Forms','Accessible products','Mobile labels'],
    brandFit:['consumer','non-profit','education','small-business','local-brand'],
    readability:91, screenSuitability:90, printSuitability:82,
    contrast:'Medium', xHeight:'Medium', weight:'400-700', variable:true, axes:['wdth','wght'],
    pairingWith:['Merriweather','Lora','Source Serif 4'],
    goodFor:['UI text','Body copy 14-18px','Forms','Accessible products'],
    avoidFor:['Luxury brands','Avant-garde display work'],
    notes:'Humanist sans with good stroke contrast. Condensed and italic variants available. Solid, unpretentious choice.',
    contextScore:{saas:78,editorial:60,fintech:70,portfolio:65,devtool:65,consumer:84,luxury:44,ecommerce:78,agency:62,academic:72},
    fontFamily:"'Cabin', sans-serif", previewText:'Grounded and clear',
    confidence:86, source:'open-library', completeness:84,
    tradeoffs:'Less distinctive than Poppins or Manrope.',
    pairingNote:'Merriweather adds reading authority for long-form use.',
  },
  {
    id:'lib-21', name:'Barlow', foundry:'Jeremy Tribby',
    classification:'Sans-serif', subtype:'Grotesque',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['technical','confident','strong','modern','direct'],
    personality:['systematic','versatile','California-industrial'],
    useCases:['Headers at multiple weights','Technical UI','Data-heavy products','Marketing','Government'],
    brandFit:['tech','government','sports','saas','marketing'],
    readability:88, screenSuitability:90, printSuitability:84,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:false, axes:[],
    pairingWith:['Merriweather','Spectral','Lora'],
    goodFor:['Strong heading hierarchy','Technical UI','Wide weight range needs','Data-heavy layouts'],
    avoidFor:['Luxury/delicate brands','Script-heavy text'],
    notes:'Inspired by California highway signage. Very wide weight range including condensed variants. Strong for tech-adjacent products.',
    contextScore:{saas:82,editorial:65,fintech:78,portfolio:72,devtool:78,consumer:75,luxury:52,ecommerce:78,agency:80,academic:62},
    fontFamily:"'Barlow', sans-serif", previewText:'Strong at any weight',
    confidence:88, source:'open-library', completeness:86,
    tradeoffs:'Less personality than Space Grotesk at similar weights.',
    pairingNote:'Merriweather for reading depth in long-form contexts.',
  },
  {
    id:'lib-22', name:'Work Sans', foundry:'Wei Huang',
    classification:'Sans-serif', subtype:'Grotesque',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['clean','professional','geometric','modern','approachable'],
    personality:['confident','versatile','workmanlike'],
    useCases:['Display headers','Marketing text','Product UI','SaaS pages','Heading hierarchy'],
    brandFit:['saas','startup','corporate','marketing','agency'],
    readability:86, screenSuitability:88, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Merriweather','Lora','Spectral'],
    goodFor:['Display headers 24px+','Marketing copy','Product UI headings','SaaS hero text'],
    avoidFor:['Long-form body reading','Very small UI text'],
    notes:'Optimised for screen use. Slightly geometric with good optical compensation. Popular for SaaS marketing pages.',
    contextScore:{saas:82,editorial:60,fintech:72,portfolio:80,devtool:68,consumer:78,luxury:58,ecommerce:80,agency:80,academic:58},
    fontFamily:"'Work Sans', sans-serif", previewText:'Work in progress',
    confidence:88, source:'open-library', completeness:85,
    tradeoffs:'Less distinct than Space Grotesk. Better for professional than bold creative use.',
    pairingNote:'Merriweather or Spectral for long-form reading contrast.',
  },
  {
    id:'lib-23', name:'Mulish', foundry:'Vernon Adams',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['clean','minimal','modern','light','fresh'],
    personality:['refined','understated','simple'],
    useCases:['Body copy','Clean UI','Minimal brand identity','Documentation','Dashboard'],
    brandFit:['saas','fintech','minimal','startup','clean-brand'],
    readability:92, screenSuitability:91, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'200-1000', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Playfair Display','Merriweather'],
    goodFor:['Body copy','Clean UI text','Minimal brand identity','Documentation'],
    avoidFor:['Bold display work','Expressive brands'],
    notes:'Variable weight grotesque with high legibility. Clean and understated — pairs well with expressive display serifs.',
    contextScore:{saas:82,editorial:60,fintech:74,portfolio:78,devtool:65,consumer:80,luxury:58,ecommerce:78,agency:74,academic:65},
    fontFamily:"'Mulish', sans-serif", previewText:'Minimal clarity',
    confidence:87, source:'open-library', completeness:84,
    tradeoffs:'Light weight can be too quiet in busy layouts.',
    pairingNote:'Fraunces or Playfair Display add expressive contrast.',
  },
  {
    id:'lib-24', name:'Josefin Sans', foundry:'Santiago Orozco',
    classification:'Sans-serif', subtype:'Geometric Display',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['geometric','elegant','refined','vintage-modern','architectural'],
    personality:['stylish','fashion-forward','distinctive'],
    useCases:['Display headings','Fashion brands','All-caps titles','Brand identity','Posters'],
    brandFit:['luxury','fashion','art','portfolio','wedding'],
    readability:78, screenSuitability:80, printSuitability:82,
    contrast:'Low', xHeight:'Low', weight:'100-700', variable:true, axes:['wght'],
    pairingWith:['Lora','Cormorant Garamond','Merriweather'],
    goodFor:['All-caps brand names','Fashion headlines','Posters at 36px+','Elegant display'],
    avoidFor:['Body copy','Dense UI','Small labels under 14px'],
    notes:'Very geometric with classic proportions. Light weights especially elegant for luxury brands. Strongly architectural aesthetic.',
    contextScore:{saas:54,editorial:75,fintech:44,portfolio:90,devtool:36,consumer:72,luxury:90,ecommerce:80,agency:88,academic:52},
    fontFamily:"'Josefin Sans', sans-serif", previewText:'Architectural form',
    confidence:88, source:'open-library', completeness:85,
    tradeoffs:'Low x-height requires larger sizes for legibility.',
    pairingNote:'Lora or Cormorant for refined editorial contrast.',
  },
  {
    id:'lib-25', name:'Rubik', foundry:'Hubert and Fischer',
    classification:'Sans-serif', subtype:'Rounded',
    license:'OFL (Free)', languages:'Latin Extended + Hebrew + Cyrillic',
    mood:['friendly','modern','rounded','approachable','confident'],
    personality:['accessible','contemporary','warm'],
    useCases:['Consumer UI','Mobile apps','Marketing','Dashboard','Approachable products'],
    brandFit:['consumer','startup','wellness','mobile','product'],
    readability:91, screenSuitability:92, printSuitability:80,
    contrast:'Low', xHeight:'High', weight:'300-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Spectral'],
    goodFor:['Consumer mobile UI','Marketing pages','Approachable product voice','Dashboard text'],
    avoidFor:['Formal corporate','Luxury premium','Cold fintech'],
    notes:'Variable font with slightly rounded corners. Excellent Hebrew support makes it valuable for bi-directional products.',
    contextScore:{saas:80,editorial:52,fintech:62,portfolio:76,devtool:62,consumer:92,luxury:50,ecommerce:88,agency:76,academic:52},
    fontFamily:"'Rubik', sans-serif", previewText:'Round and ready',
    confidence:88, source:'open-library', completeness:85,
    tradeoffs:'Rounded forms can feel too casual in formal financial contexts.',
    pairingNote:'Fraunces brings expressive editorial contrast for content platforms.',
  },
  {
    id:'lib-26', name:'Figtree', foundry:'Erik Kennedy',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['clean','modern','friendly','crisp','minimal'],
    personality:['well-crafted','contemporary','approachable'],
    useCases:['Product UI','Modern SaaS','Marketing pages','Dashboard','Clean body copy'],
    brandFit:['saas','startup','product','fintech','consumer'],
    readability:92, screenSuitability:93, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'300-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Spectral'],
    goodFor:['Product UI','Modern SaaS interfaces','Marketing pages','Clean dashboard text'],
    avoidFor:['Traditional brands','Historical editorial'],
    notes:'Modern grotesque designed specifically for digital products. Clean and crisp metrics. Variable weight.',
    contextScore:{saas:92,editorial:55,fintech:80,portfolio:80,devtool:74,consumer:88,luxury:56,ecommerce:86,agency:80,academic:58},
    fontFamily:"'Figtree', sans-serif", previewText:'Built for product',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Relatively new — less battle-tested than Inter or DM Sans.',
    pairingNote:'Fraunces or Spectral create editorial depth for content-first products.',
  },
  {
    id:'lib-27', name:'Plus Jakarta Sans', foundry:'Tokotype',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['polished','modern','clean','professional','friendly'],
    personality:['refined','versatile','design-conscious'],
    useCases:['Product UI','SaaS interfaces','Dashboard','Marketing pages','Body copy'],
    brandFit:['saas','fintech','startup','product','design-tool'],
    readability:94, screenSuitability:95, printSuitability:84,
    contrast:'Low', xHeight:'High', weight:'200-800', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Playfair Display'],
    goodFor:['Product UI at any size','SaaS interfaces','Dashboard','Clean brand system'],
    avoidFor:['Pure editorial print','Traditional luxury'],
    notes:'Highly polished modern grotesque with excellent spacing and metrics. Designed for digital product use.',
    contextScore:{saas:95,editorial:60,fintech:88,portfolio:84,devtool:80,consumer:88,luxury:60,ecommerce:88,agency:84,academic:65},
    fontFamily:"'Plus Jakarta Sans', sans-serif", previewText:'Designed for screens',
    confidence:92, source:'open-library', completeness:88,
    tradeoffs:'Limited to Latin — check language needs for global products.',
    pairingNote:'Fraunces provides the highest contrast editorial pairing.',
  },
  {
    id:'lib-28', name:'Urbanist', foundry:'Corey Hu',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['contemporary','clean','geometric','forward','minimal'],
    personality:['modern','systematic','design-forward'],
    useCases:['Contemporary SaaS','Product UI','Modern brand','Tech startups','Landing pages'],
    brandFit:['saas','startup','tech','product','contemporary'],
    readability:90, screenSuitability:92, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Lora'],
    goodFor:['Contemporary product UI','Tech startup branding','Clean landing pages','Display hierarchy'],
    avoidFor:['Heritage brands','Traditional editorial'],
    notes:'Geometric grotesque designed for contemporary digital products. Strong for modern tech brand systems.',
    contextScore:{saas:88,editorial:55,fintech:78,portfolio:82,devtool:72,consumer:80,luxury:58,ecommerce:80,agency:82,academic:58},
    fontFamily:"'Urbanist', sans-serif", previewText:'City of the future',
    confidence:87, source:'open-library', completeness:83,
    tradeoffs:'Newer — less adoption data than Inter or Poppins.',
    pairingNote:'Fraunces or Lora for reading-depth in content-heavy products.',
  },

  // ── Display sans ──────────────────────────────────────────────────────
  {
    id:'lib-29', name:'Oswald', foundry:'Vernon Adams',
    classification:'Sans-serif', subtype:'Condensed',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['bold','strong','dramatic','editorial','powerful'],
    personality:['direct','authoritative','impactful'],
    useCases:['Display headings','Sports editorial','Condensed headers','Marketing','Menu type'],
    brandFit:['sports','editorial','news','fitness','impact-brand'],
    readability:82, screenSuitability:84, printSuitability:80,
    contrast:'Low', xHeight:'High', weight:'200-700', variable:true, axes:['wght'],
    pairingWith:['Lora','Merriweather','Libre Baskerville'],
    goodFor:['Strong condensed headings','Sports/editorial brands','Marketing banners','Menu typography'],
    avoidFor:['Body copy','Small UI text','Elegant luxury brands'],
    notes:'Condensed grotesque inspired by early 20th century type. Excellent for strong headers and attention-grabbing titles.',
    contextScore:{saas:58,editorial:78,fintech:55,portfolio:72,devtool:50,consumer:72,luxury:55,ecommerce:75,agency:80,academic:55},
    fontFamily:"'Oswald', sans-serif", previewText:'Make your mark',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Condensed proportions limit use in paragraphs.',
    pairingNote:'Merriweather or Lora for body copy contrast.',
  },
  {
    id:'lib-30', name:'Bebas Neue', foundry:'Ryoichi Tsunekawa',
    classification:'Display', subtype:'Condensed',
    license:'OFL (Free)', languages:'Latin',
    mood:['bold','aggressive','powerful','dramatic','impactful'],
    personality:['loud','direct','sporty'],
    useCases:['Impact headers','Sports brands','Posters','Marketing banners','Bold CTAs'],
    brandFit:['sports','streetwear','entertainment','fitness','gaming'],
    readability:60, screenSuitability:70, printSuitability:75,
    contrast:'Low', xHeight:'High', weight:'400', variable:false, axes:[],
    pairingWith:['Lato','Open Sans','Roboto'],
    goodFor:['Large impact headers 48px+','Sports brands','Poster headlines','Bold marketing'],
    avoidFor:['Body copy','Any text under 24px','Subtle brands','Mixed-case paragraphs'],
    notes:'All-caps only condensed display. No lowercase. Maximum impact at large sizes only.',
    contextScore:{saas:38,editorial:65,fintech:30,portfolio:68,devtool:28,consumer:72,luxury:42,ecommerce:66,agency:80,academic:28},
    fontFamily:"'Bebas Neue', sans-serif", previewText:'MAKE AN IMPACT',
    confidence:88, source:'open-library', completeness:82,
    tradeoffs:'All-caps only. No lowercase — limits versatility severely.',
    pairingNote:'Lato or Open Sans for readable body text contrast.',
  },

  // ── Reading serifs ─────────────────────────────────────────────────────
  {
    id:'lib-31', name:'Merriweather', foundry:'Eben Sorkin',
    classification:'Serif', subtype:'Contemporary Slab-inspired',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['warm','readable','reliable','approachable','editorial'],
    personality:['friendly','trustworthy','journalistic'],
    useCases:['Body copy','Blogs','Long-form reading','Editorial','News sites','E-readers'],
    brandFit:['editorial','publishing','news','healthcare','non-profit'],
    readability:95, screenSuitability:93, printSuitability:88,
    contrast:'Medium', xHeight:'High', weight:'300-900', variable:false, axes:[],
    pairingWith:['Roboto','Open Sans','Lato','Poppins','Montserrat','DM Sans'],
    goodFor:['Body copy 14-20px','Blogs and news','Long-form reading','Editorial bodies','Email newsletters'],
    avoidFor:['Display at 64px+','Minimal brand identity','Cold technical products'],
    notes:'Designed specifically for screen reading. Bold stems and high x-height for clarity at small sizes. One of the most popular serif choices for blogs.',
    contextScore:{saas:62,editorial:96,fintech:58,portfolio:72,devtool:44,consumer:70,luxury:70,ecommerce:68,agency:68,academic:90},
    fontFamily:"'Merriweather', Georgia, serif", previewText:'Words worth reading',
    confidence:96, source:'open-library', completeness:92,
    tradeoffs:'Designed for body — can feel heavy at display sizes.',
    pairingNote:'Roboto or Montserrat create strong, popular heading-body pairings.',
  },
  {
    id:'lib-32', name:'Lora', foundry:'Cyreal',
    classification:'Serif', subtype:'Contemporary Calligraphic',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['elegant','warm','literary','refined','contemporary'],
    personality:['poetic','tasteful','well-read'],
    useCases:['Body copy','Blogs','Literary platforms','Elegant editorial','Medium-format reading'],
    brandFit:['publishing','editorial','lifestyle','literary','premium-content'],
    readability:92, screenSuitability:88, printSuitability:90,
    contrast:'Medium', xHeight:'Medium', weight:'400-700', variable:true, axes:['wght'],
    pairingWith:['Montserrat','Raleway','Josefin Sans','Oswald','Work Sans'],
    goodFor:['Elegant body copy','Literary platforms','Blog typography','Premium content sites'],
    avoidFor:['Dense data tables','Cold technical products','Mobile UI text'],
    notes:'Contemporary calligraphic-influenced serif. Brush-styled serifs create warmth. Excellent body reading with character.',
    contextScore:{saas:58,editorial:95,fintech:52,portfolio:84,devtool:40,consumer:68,luxury:84,ecommerce:65,agency:74,academic:88},
    fontFamily:"'Lora', Georgia, serif", previewText:'Carefully composed',
    confidence:94, source:'open-library', completeness:90,
    tradeoffs:'Calligraphic detail can feel too soft for purely utilitarian contexts.',
    pairingNote:'Montserrat or Raleway create elegant heading-body systems.',
  },
  {
    id:'lib-33', name:'Bitter', foundry:'Huerta Tipográfica',
    classification:'Serif', subtype:'Slab',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['robust','reliable','editorial','solid','readable'],
    personality:['journalistic','dependable','grounded'],
    useCases:['Long-form reading','News editorial','Blog body','E-reader UI','Publishing'],
    brandFit:['news','editorial','publishing','blog','journalism'],
    readability:93, screenSuitability:91, printSuitability:86,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght','ital'],
    pairingWith:['Raleway','Montserrat','Work Sans','Open Sans'],
    goodFor:['Body text for long-form reading','News sites','Editorial body','E-readers'],
    avoidFor:['Display-only use','Luxury brands','Decorative roles'],
    notes:'Designed for comfortable body reading on screen. Slab-leaning with generous x-height and sturdy stems.',
    contextScore:{saas:60,editorial:92,fintech:58,portfolio:68,devtool:42,consumer:65,luxury:60,ecommerce:65,agency:65,academic:86},
    fontFamily:"'Bitter', Georgia, serif", previewText:'Sturdy and true',
    confidence:90, source:'open-library', completeness:87,
    tradeoffs:'Slab character limits luxury/premium brand fit.',
    pairingNote:'Raleway or Montserrat for header contrast.',
  },
  {
    id:'lib-34', name:'PT Serif', foundry:'ParaType',
    classification:'Serif', subtype:'Transitional',
    license:'OFL (Free)', languages:'Pan-European + Cyrillic',
    mood:['classic','reliable','authoritative','pan-lingual','neutral'],
    personality:['traditional','comprehensive','professional'],
    useCases:['Long-form reading','Multi-language publishing','Editorial body','Academic','Government'],
    brandFit:['academic','government','editorial','publishing','non-profit'],
    readability:91, screenSuitability:86, printSuitability:90,
    contrast:'Medium', xHeight:'Medium', weight:'400-700', variable:false, axes:[],
    pairingWith:['PT Sans','Inter','Open Sans','Roboto'],
    goodFor:['Multilingual editorial','Academic publishing','Government content','Long-form body'],
    avoidFor:['Modern tech brands','Display-only contexts','Creative agencies'],
    notes:'Designed for Cyrillic and Latin parity. Part of a complete PT family. Conservative and reliable for multilingual needs.',
    contextScore:{saas:55,editorial:88,fintech:55,portfolio:65,devtool:38,consumer:60,luxury:68,ecommerce:60,agency:62,academic:93},
    fontFamily:"'PT Serif', Georgia, serif", previewText:'Authority across scripts',
    confidence:88, source:'open-library', completeness:85,
    tradeoffs:'Conservative voice — limited for brand differentiation.',
    pairingNote:'PT Sans is the natural system companion.',
  },
  {
    id:'lib-35', name:'Crimson Pro', foundry:'Jacques Le Bailly',
    classification:'Serif', subtype:'Old Style Humanist',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['scholarly','elegant','literary','refined','classical'],
    personality:['intellectual','graceful','bookish'],
    useCases:['Academic publishing','Long-form books','Literary brands','Editorial body','Classic publishing'],
    brandFit:['academic','literary','publishing','heritage','luxury-print'],
    readability:90, screenSuitability:84, printSuitability:95,
    contrast:'High', xHeight:'Medium', weight:'200-900', variable:true, axes:['wght','ital'],
    pairingWith:['Inter','DM Sans','Mulish','Work Sans'],
    goodFor:['Academic publishing','Literary platforms','Classical editorial','Long-form book typography'],
    avoidFor:['Tech products','Mobile-first UI','Cold fintech','Data-dense layouts'],
    notes:'Updated Crimson Text with improved screen rendering. Classical old-style proportions with modern variable-font metrics.',
    contextScore:{saas:42,editorial:92,fintech:38,portfolio:74,devtool:28,consumer:52,luxury:82,ecommerce:55,agency:65,academic:97},
    fontFamily:"'Crimson Pro', Georgia, serif", previewText:'Classical precision',
    confidence:90, source:'open-library', completeness:88,
    tradeoffs:'High contrast can be difficult at small screen sizes.',
    pairingNote:'Inter or DM Sans bring clean UI contrast to classical editorial systems.',
  },
  {
    id:'lib-36', name:'Arvo', foundry:'Anton Koovit',
    classification:'Serif', subtype:'Geometric Slab',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['sturdy','editorial','reliable','geometric','strong'],
    personality:['solid','structured','approachable'],
    useCases:['Editorial headers','Blog headers','Tech-adjacent editorial','UI text with serif character'],
    brandFit:['editorial','tech','agency','startup','publishing'],
    readability:88, screenSuitability:87, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'400-700', variable:false, axes:[],
    pairingWith:['Lato','Open Sans','Roboto'],
    goodFor:['Editorial headings','Robust UI text','Tech brand with serif voice','Headers needing personality'],
    avoidFor:['Delicate luxury brands','Long-form body at small sizes'],
    notes:'Geometric slab-inspired. Strong stems and low contrast. Excellent for editorial headers that need personality without fragility.',
    contextScore:{saas:65,editorial:82,fintech:60,portfolio:72,devtool:60,consumer:65,luxury:55,ecommerce:68,agency:72,academic:72},
    fontFamily:"'Arvo', Georgia, serif", previewText:'Solid editorial voice',
    confidence:86, source:'open-library', completeness:83,
    tradeoffs:'Limited weight range reduces versatility for full type systems.',
    pairingNote:'Lato or Open Sans provide clean body contrast.',
  },

  // ── Display / expressive serifs ───────────────────────────────────────
  {
    id:'lib-37', name:'Abril Fatface', foundry:'TypeTogether',
    classification:'Display', subtype:'Heavy Serif Display',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['bold','dramatic','editorial','heavy','Victorian'],
    personality:['impactful','theatrical','expressive'],
    useCases:['Large display headings','Magazine covers','Poster headlines','Impact editorial'],
    brandFit:['editorial','magazine','poster','luxury-bold','entertainment'],
    readability:52, screenSuitability:62, printSuitability:82,
    contrast:'High', xHeight:'Medium', weight:'400', variable:false, axes:[],
    pairingWith:['Lato','Open Sans','Raleway'],
    goodFor:['Display headings 48px+','Magazine/poster headlines','Bold editorial impact'],
    avoidFor:['Body copy','Small sizes under 32px','Conservative brands','UI text'],
    notes:'Ultra-heavy display with condensed proportions. Inspired by Didone/Didot. Use only for large display contexts.',
    contextScore:{saas:30,editorial:84,fintech:24,portfolio:74,devtool:18,consumer:55,luxury:62,ecommerce:58,agency:82,academic:30},
    fontFamily:"'Abril Fatface', serif", previewText:'HEADLINE POWER',
    confidence:88, source:'open-library', completeness:82,
    tradeoffs:'Single weight. No lowercase flexibility for mixed-case brands.',
    pairingNote:'Lato or Raleway for readable body contrast.',
  },
  {
    id:'lib-38', name:'Cinzel', foundry:'Natanael Gama',
    classification:'Display', subtype:'Classical Inscriptional',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['classical','regal','majestic','formal','ancient'],
    personality:['authoritative','ceremonial','noble'],
    useCases:['Brand headers','Gaming UI titles','Luxury brand names','Ceremonial design','Heritage products'],
    brandFit:['luxury','gaming','heritage','ceremonial','prestige'],
    readability:68, screenSuitability:72, printSuitability:85,
    contrast:'High', xHeight:'Low', weight:'400-900', variable:true, axes:['wght'],
    pairingWith:['Lato','Raleway','Cormorant Garamond'],
    goodFor:['Luxury brand headers','Gaming/fantasy UI titles','Ceremonial display','Heritage brand identity'],
    avoidFor:['Body copy','Modern tech products','Casual consumer brands'],
    notes:'Based on Roman inscriptional lettering. All-caps proportions look stunning. Ideal for luxury, heritage, or fantasy gaming.',
    contextScore:{saas:26,editorial:70,fintech:28,portfolio:72,devtool:18,consumer:44,luxury:94,ecommerce:48,agency:72,academic:72},
    fontFamily:"'Cinzel', serif", previewText:'ETERNAL FORM',
    confidence:88, source:'open-library', completeness:82,
    tradeoffs:'Exclusively display — no body-text capability.',
    pairingNote:'Raleway or Cormorant Garamond for refined editorial pairing.',
  },
  {
    id:'lib-39', name:'Zilla Slab', foundry:'Typotheque / Mozilla',
    classification:'Serif', subtype:'Humanist Slab',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['editorial','modern','trustworthy','warm','bold'],
    personality:['journalistic','structured','open-source'],
    useCases:['Editorial headings','News UI','Technical editorial','Publishing platform text'],
    brandFit:['editorial','news','open-source','publishing','civic-tech'],
    readability:90, screenSuitability:88, printSuitability:84,
    contrast:'Low', xHeight:'High', weight:'300-700', variable:false, axes:[],
    pairingWith:['Fira Sans','Open Sans','Roboto'],
    goodFor:['News/editorial headings','Open-source brand identity','Publishing platform headers','Strong editorial voice'],
    avoidFor:['Luxury brands','Minimal design systems'],
    notes:'Mozilla\'s editorial slab. Humanist proportions with slab serifs. Designed for Firefox branding and editorial use.',
    contextScore:{saas:62,editorial:90,fintech:58,portfolio:68,devtool:56,consumer:65,luxury:52,ecommerce:65,agency:72,academic:80},
    fontFamily:"'Zilla Slab', Georgia, serif", previewText:'News you can trust',
    confidence:86, source:'open-library', completeness:83,
    tradeoffs:'Branded identity (Mozilla) — consider for open-source-adjacent brands.',
    pairingNote:'Fira Sans is the native Mozilla companion.',
  },
  {
    id:'lib-40', name:'Roboto Serif', foundry:'Commercial Type / Google',
    classification:'Serif', subtype:'Contemporary Transitional',
    license:'Apache 2.0 (Free)', languages:'Latin Extended + Cyrillic + Greek',
    mood:['neutral','modern','reliable','screen-native','systematic'],
    personality:['contemporary','versatile','Google-quality'],
    useCases:['Reading-heavy products','Editorial body','Documentation with serif','Knowledge bases'],
    brandFit:['saas','editorial','academic','tech','publishing'],
    readability:90, screenSuitability:89, printSuitability:86,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght','opsz','wdth'],
    pairingWith:['Roboto','Inter','DM Sans'],
    goodFor:['Editorial body in tech products','Knowledge base typography','Screen-first publishing'],
    avoidFor:['Strong display personality','Luxury editorial','Expressive brand systems'],
    notes:'Google\'s screen-optimised serif companion to Roboto. Variable axes including optical size and width. Strong for reading in tech contexts.',
    contextScore:{saas:65,editorial:88,fintech:60,portfolio:65,devtool:48,consumer:62,luxury:62,ecommerce:60,agency:60,academic:85},
    fontFamily:"'Roboto Serif', Georgia, serif", previewText:'Reading in focus',
    confidence:88, source:'open-library', completeness:85,
    tradeoffs:'Less personality than Fraunces or Lora for expressive editorial.',
    pairingNote:'Roboto creates a complete cohesive system.',
  },

  // ── Monospace / code fonts ────────────────────────────────────────────
  {
    id:'lib-41', name:'Fira Code', foundry:'Nikita Prokopov',
    classification:'Monospace', subtype:'Code',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['technical','precise','developer-native','sharp'],
    personality:['programmer-friendly','ligature-rich','focused'],
    useCases:['Code editors','Syntax highlighting','Terminal UI','Programming documentation','Dev tool UI'],
    brandFit:['developer','tech','saas','open-source'],
    readability:93, screenSuitability:97, printSuitability:72,
    contrast:'Low', xHeight:'Medium', weight:'300-700', variable:true, axes:['wght'],
    pairingWith:['Inter','Space Grotesk','Fira Sans'],
    goodFor:['Code display','Developer product UI','Terminal interfaces','Syntax highlighting'],
    avoidFor:['Body copy','Display headings','Non-technical contexts'],
    notes:'Monospaced with beautiful programming ligatures (→, !=, ===). Purpose-built for code display.',
    contextScore:{saas:65,editorial:22,fintech:45,portfolio:50,devtool:99,consumer:28,luxury:18,ecommerce:28,agency:42,academic:65},
    fontFamily:"'Fira Code', monospace", previewText:'const result = value => true',
    confidence:95, source:'open-library', completeness:90,
    tradeoffs:'Monospace only — needs a proportional companion for UI.',
    pairingNote:'Inter or Space Grotesk for the surrounding product UI.',
  },
  {
    id:'lib-42', name:'Source Code Pro', foundry:'Paul D. Hunt / Adobe',
    classification:'Monospace', subtype:'Code',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['technical','clean','precise','professional'],
    personality:['Adobe-quality','systematic','reliable'],
    useCases:['Code blocks','Developer tools','Technical documentation','Terminal interfaces'],
    brandFit:['developer','saas','enterprise','tech'],
    readability:92, screenSuitability:94, printSuitability:76,
    contrast:'Low', xHeight:'Medium', weight:'200-900', variable:false, axes:[],
    pairingWith:['Source Sans 3','Inter','DM Sans'],
    goodFor:['Code display','Dev tool UI','Technical docs','Terminal'],
    avoidFor:['Body copy','Display headings'],
    notes:'Adobe\'s open-source code face. Part of the Source family. Excellent spacing and metric consistency.',
    contextScore:{saas:62,editorial:25,fintech:42,portfolio:48,devtool:97,consumer:25,luxury:18,ecommerce:25,agency:40,academic:68},
    fontFamily:"'Source Code Pro', monospace", previewText:'function init() { return true; }',
    confidence:92, source:'open-library', completeness:87,
    tradeoffs:'No ligatures — slightly less visually refined than Fira Code for some developers.',
    pairingNote:'Source Sans 3 is the natural companion from the same family.',
  },
  {
    id:'lib-43', name:'Roboto Mono', foundry:'Christian Robertson / Google',
    classification:'Monospace', subtype:'Code',
    license:'Apache 2.0 (Free)', languages:'Pan-European + Cyrillic + Greek',
    mood:['clean','technical','systematic','neutral'],
    personality:['functional','consistent','Google-standard'],
    useCases:['Code display','Terminal UI','Technical UI labels','Data tables','API docs'],
    brandFit:['developer','saas','data','tech'],
    readability:90, screenSuitability:92, printSuitability:72,
    contrast:'Low', xHeight:'High', weight:'100-700', variable:true, axes:['wght'],
    pairingWith:['Roboto','Inter','DM Sans'],
    goodFor:['Code blocks','API documentation','Data tables with mixed content','Terminal UI'],
    avoidFor:['Headlines','Marketing copy','Expressive contexts'],
    notes:'Google\'s clean mono companion to Roboto. Excellent for tables and numeric data in technical products.',
    contextScore:{saas:68,editorial:22,fintech:56,portfolio:45,devtool:96,consumer:30,luxury:20,ecommerce:32,agency:40,academic:62},
    fontFamily:"'Roboto Mono', monospace", previewText:'> run build && deploy',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Less personality than Fira Code. Stronger when consistency with Roboto matters.',
    pairingNote:'Roboto creates a consistent family system for Google-adjacent products.',
  },
  {
    id:'lib-44', name:'Inconsolata', foundry:'Raph Levien',
    classification:'Monospace', subtype:'Code',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['compact','clean','technical','efficient'],
    personality:['developer-native','economical','precise'],
    useCases:['Dense code display','Compact terminal UI','Inline code snippets','Dev documentation'],
    brandFit:['developer','open-source','saas','cli'],
    readability:88, screenSuitability:91, printSuitability:70,
    contrast:'Low', xHeight:'Medium', weight:'200-900', variable:true, axes:['wdth','wght'],
    pairingWith:['Inter','Space Grotesk','Mulish'],
    goodFor:['Dense code display','Compact technical UI','Inline code in documents'],
    avoidFor:['Body text','Display headings'],
    notes:'Humanist monospace optimised for terminal/editor use. Very compact — efficient at small sizes. Variable width axis.',
    contextScore:{saas:60,editorial:20,fintech:45,portfolio:42,devtool:96,consumer:22,luxury:15,ecommerce:22,agency:38,academic:62},
    fontFamily:"'Inconsolata', monospace", previewText:'$ git commit -m "done"',
    confidence:88, source:'open-library', completeness:84,
    tradeoffs:'Less refined than Fira Code for display-size code showcases.',
    pairingNote:'Inter or Space Grotesk for surrounding product UI.',
  },

  // ── Script / handwriting ──────────────────────────────────────────────
  {
    id:'lib-45', name:'Pacifico', foundry:'Vernon Adams',
    classification:'Handwriting', subtype:'Script Display',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['casual','fun','retro','playful','sunny'],
    personality:['informal','upbeat','vintage-casual'],
    useCases:['Brand logos at large sizes','Casual consumer brands','Retro packaging','Fun CTAs','Welcome messages'],
    brandFit:['food-beverage','retail','lifestyle','entertainment','hospitality'],
    readability:55, screenSuitability:60, printSuitability:70,
    contrast:'Variable', xHeight:'Low', weight:'400', variable:false, axes:[],
    pairingWith:['Open Sans','Lato','Roboto'],
    goodFor:['Brand logo at 32px+','Retro/casual brand headers','Fun marketing accents'],
    avoidFor:['Body copy','Small sizes under 24px','Corporate or formal brands'],
    notes:'Script font with retro California vibes. Use only for large display contexts. Illegible below 24px.',
    contextScore:{saas:20,editorial:40,fintech:14,portfolio:52,devtool:10,consumer:80,luxury:28,ecommerce:62,agency:60,academic:20},
    fontFamily:"'Pacifico', cursive", previewText:'Made with love',
    confidence:84, source:'open-library', completeness:78,
    tradeoffs:'Single weight. Deeply informal — narrows brand fit significantly.',
    pairingNote:'Open Sans or Lato provide legible body contrast.',
  },
  {
    id:'lib-46', name:'Caveat', foundry:'Pablo Impallari',
    classification:'Handwriting', subtype:'Handwriting',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['handwritten','personal','informal','authentic','creative'],
    personality:['casual','expressive','human'],
    useCases:['Accent headings','Pull quotes','Handwritten notes in UI','Creative accents','Journaling apps'],
    brandFit:['creative','wellness','journaling','education','personal-brand'],
    readability:62, screenSuitability:68, printSuitability:72,
    contrast:'Variable', xHeight:'Low', weight:'400-700', variable:true, axes:['wght'],
    pairingWith:['Merriweather','Lato','Open Sans'],
    goodFor:['Accent display at 24px+','Adding human warmth to UI','Pull quotes','Creative headers'],
    avoidFor:['Body copy','Formal contexts','Small text under 18px'],
    notes:'Handwriting font with authentic feel. Variable weight. Good for adding human warmth to digital interfaces without full script formality.',
    contextScore:{saas:34,editorial:60,fintech:20,portfolio:68,devtool:24,consumer:72,luxury:44,ecommerce:62,agency:74,academic:38},
    fontFamily:"'Caveat', cursive", previewText:'From the heart',
    confidence:84, source:'open-library', completeness:78,
    tradeoffs:'Informal character limits use to accent/display roles only.',
    pairingNote:'Merriweather or Lato for legible body contrast.',
  },
  {
    id:'lib-47', name:'Dancing Script', foundry:'Impallari Type',
    classification:'Handwriting', subtype:'Calligraphic Script',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['elegant','flowing','romantic','graceful','festive'],
    personality:['celebratory','warm','formal-casual'],
    useCases:['Wedding/event branding','Festive brand headers','Celebratory contexts','Elegant accent type'],
    brandFit:['wedding','events','hospitality','personal-brand','lifestyle'],
    readability:60, screenSuitability:65, printSuitability:78,
    contrast:'Variable', xHeight:'Low', weight:'400-700', variable:true, axes:['wght'],
    pairingWith:['Lato','Raleway','Josefin Sans'],
    goodFor:['Wedding/event headers','Festive brand accents','Celebratory display at 28px+'],
    avoidFor:['Body text','Small sizes','Corporate contexts','Data UI'],
    notes:'Variable calligraphic script. Elegant but informal. Hugely popular for event and wedding web design.',
    contextScore:{saas:18,editorial:52,fintech:14,portfolio:62,devtool:10,consumer:74,luxury:72,ecommerce:60,agency:62,academic:24},
    fontFamily:"'Dancing Script', cursive", previewText:'A beautiful occasion',
    confidence:84, source:'open-library', completeness:78,
    tradeoffs:'Legibility drops sharply below 24px.',
    pairingNote:'Raleway or Josefin Sans create an elegant pairing for luxury events.',
  },

  // ── Variable / modern ─────────────────────────────────────────────────
  {
    id:'lib-48', name:'Recursive', foundry:'Arrow Type',
    classification:'Sans-serif', subtype:'Variable Multi-axis',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['technical','quirky','versatile','developer','multi-faceted'],
    personality:['playful','systematic','experimental'],
    useCases:['Developer tools','Code-adjacent UI','Variable font showcases','Creative tech','Dev documentation'],
    brandFit:['developer','creative-tech','type-focused','open-source','experimental'],
    readability:88, screenSuitability:91, printSuitability:75,
    contrast:'Variable', xHeight:'High', weight:'300-1000', variable:true, axes:['MONO','CASL','wght','slnt','ital'],
    pairingWith:['Inter','Space Grotesk'],
    goodFor:['Developer product UI','Code display','Variable font demos','Creative technical products'],
    avoidFor:['Conservative brands','Long print typography','Formal enterprise'],
    notes:'5-axis variable font spanning monospaced to proportional, casual to formal, sans to script. Extraordinary range.',
    contextScore:{saas:72,editorial:50,fintech:55,portfolio:78,devtool:97,consumer:54,luxury:34,ecommerce:55,agency:74,academic:55},
    fontFamily:"'Recursive', sans-serif", previewText:'Every axis explored',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Complexity of axes can be hard to use correctly. Best when you need the range.',
    pairingNote:'Inter for the static parts of a mostly-Recursive product.',
  },
  {
    id:'lib-49', name:'Epilogue', foundry:'Tyler Finck / ETC',
    classification:'Sans-serif', subtype:'Grotesque',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['contemporary','editorial','geometric','modern','varied'],
    personality:['versatile','editorial','design-forward'],
    useCases:['Brand identity','Editorial headings','Full type systems','Display and body'],
    brandFit:['agency','editorial','startup','portfolio','brand-system'],
    readability:89, screenSuitability:90, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Lora'],
    goodFor:['Brand identity with range','Editorial headings','Full type system covering display to body'],
    avoidFor:['Pure code/technical','Extremely traditional contexts'],
    notes:'Variable grotesque that works from light to ultra-bold. Great for editorial systems that need a single-family solution.',
    contextScore:{saas:80,editorial:74,fintech:65,portfolio:90,devtool:60,consumer:78,luxury:68,ecommerce:78,agency:90,academic:62},
    fontFamily:"'Epilogue', sans-serif", previewText:'Versatile by design',
    confidence:88, source:'open-library', completeness:84,
    tradeoffs:'Less neutral than Inter — more personality, slightly less universal.',
    pairingNote:'Fraunces provides editorial depth in heading-body systems.',
  },
  {
    id:'lib-50', name:'Hanken Grotesk', foundry:'Hanken Design Co',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['refined','clean','modern','neutral','precise'],
    personality:['polished','contemporary','systematic'],
    useCases:['Premium product UI','Modern SaaS','Clean brand systems','Dashboard','Body copy'],
    brandFit:['saas','fintech','startup','premium-product','design-tool'],
    readability:92, screenSuitability:93, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Spectral'],
    goodFor:['Premium product UI','Modern SaaS interfaces','Clean brand identity','Dashboard text'],
    avoidFor:['Expressive brands','Traditional editorial'],
    notes:'Contemporary grotesk with excellent screen metrics and refined character spacing. Premium-feeling neutral grotesque.',
    contextScore:{saas:92,editorial:58,fintech:86,portfolio:80,devtool:76,consumer:82,luxury:62,ecommerce:82,agency:78,academic:62},
    fontFamily:"'Hanken Grotesk', sans-serif", previewText:'Refined precision',
    confidence:88, source:'open-library', completeness:85,
    tradeoffs:'Relatively new typeface — smaller community of examples.',
    pairingNote:'Fraunces or Spectral for editorial depth in content-heavy products.',
  },
  {
    id:'lib-51', name:'Onest', foundry:'Mikhail Sharanda',
    classification:'Sans-serif', subtype:'Humanist Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['contemporary','humanist','warm','modern','refined'],
    personality:['approachable','polished','user-focused'],
    useCases:['Product UI','Modern SaaS','Dashboard','Consumer apps','Mobile-first'],
    brandFit:['saas','consumer','startup','fintech','product'],
    readability:92, screenSuitability:93, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Playfair Display'],
    goodFor:['Product UI','Modern digital products','Dashboard','Consumer apps','Clean body copy'],
    avoidFor:['Historical brands','Traditional editorial print'],
    notes:'Contemporary humanist grotesque. Designed for modern digital products. From the creator of Manrope — similar warmth, slightly more refined.',
    contextScore:{saas:88,editorial:58,fintech:80,portfolio:78,devtool:72,consumer:88,luxury:58,ecommerce:84,agency:78,academic:60},
    fontFamily:"'Onest', sans-serif", previewText:'Human at scale',
    confidence:88, source:'open-library', completeness:84,
    tradeoffs:'Less established than Inter or DM Sans in production codebases.',
    pairingNote:'Fraunces or Merriweather for editorial contrast.',
  },
  {
    id:'lib-52', name:'Lexend', foundry:'Bonnie Shaver-Troup / Thomas Jockin',
    classification:'Sans-serif', subtype:'Humanist',
    license:'OFL (Free)', languages:'Latin Extended + Vietnamese',
    mood:['accessible','clear','modern','inclusive','readable'],
    personality:['user-first','open','functional'],
    useCases:['Accessibility-first products','Education','Body copy','Government','Health products'],
    brandFit:['healthcare','education','government','accessibility-critical','non-profit'],
    readability:97, screenSuitability:95, printSuitability:84,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wdth'],
    pairingWith:['Merriweather','Lora','Source Serif 4'],
    goodFor:['Reading-accessibility-critical products','Education platforms','Healthcare content','Government forms'],
    avoidFor:['Strong brand personality','Luxury contexts','Display work'],
    notes:'Designed with reading-proficiency research. The width axis reduces visual stress. Significant impact for users with dyslexia.',
    contextScore:{saas:78,editorial:60,fintech:70,portfolio:60,devtool:62,consumer:86,luxury:42,ecommerce:80,agency:58,academic:88},
    fontFamily:"'Lexend', sans-serif", previewText:'Readable by everyone',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Optimised for accessibility — slightly less personality for brand differentiation.',
    pairingNote:'Merriweather or Lora add editorial weight to reading-focused content.',
  },
  {
    id:'lib-53', name:'Noto Sans', foundry:'Google',
    classification:'Sans-serif', subtype:'Humanist',
    license:'Apache 2.0 (Free)', languages:'Universal (1000+ scripts)',
    mood:['neutral','universal','systematic','accessible','inclusive'],
    personality:['universal','reliable','comprehensive'],
    useCases:['Pan-language products','International apps','Multilingual UI','Global publishing'],
    brandFit:['global-product','government','international','accessibility-first','universal'],
    readability:92, screenSuitability:90, printSuitability:85,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wdth','wght'],
    pairingWith:['Noto Serif','Source Serif 4','Merriweather'],
    goodFor:['Multilingual UI','International products','Pan-language accessibility','Global publishing platforms'],
    avoidFor:['Strong brand voice','Distinctive personality','Single-language luxury brands'],
    notes:'Google\'s comprehensive type project. Covers 1000+ writing systems. Apache licensed. Designed for universal language support.',
    contextScore:{saas:78,editorial:55,fintech:72,portfolio:50,devtool:72,consumer:75,luxury:38,ecommerce:72,agency:50,academic:82},
    fontFamily:"'Noto Sans', sans-serif", previewText:'Every language, one voice',
    confidence:92, source:'open-library', completeness:87,
    tradeoffs:'Intentionally neutral — minimal brand personality.',
    pairingNote:'Noto Serif creates a consistent bilingual system.',
  },
  {
    id:'lib-54', name:'Noto Serif', foundry:'Google',
    classification:'Serif', subtype:'Humanist',
    license:'Apache 2.0 (Free)', languages:'Universal (multiple scripts)',
    mood:['universal','authoritative','classic','neutral','scholarly'],
    personality:['comprehensive','reliable','scholarly'],
    useCases:['Pan-language editorial','Academic publishing','Multi-script content','Global news'],
    brandFit:['global-editorial','academic','government','international'],
    readability:88, screenSuitability:84, printSuitability:88,
    contrast:'Medium', xHeight:'Medium', weight:'100-900', variable:true, axes:['wdth','wght'],
    pairingWith:['Noto Sans','Inter','DM Sans'],
    goodFor:['International editorial','Multi-script publishing','Academic content','Global news platforms'],
    avoidFor:['Strong brand identity','Distinctive voice','Luxury display work'],
    notes:'Google\'s serif companion to Noto Sans. Covers many writing systems. Apache licensed. Excellent for scholarly and multi-language content.',
    contextScore:{saas:50,editorial:84,fintech:52,portfolio:58,devtool:38,consumer:55,luxury:62,ecommerce:55,agency:52,academic:90},
    fontFamily:"'Noto Serif', Georgia, serif", previewText:'Universal scholarship',
    confidence:88, source:'open-library', completeness:84,
    tradeoffs:'Intentionally neutral — lacks editorial character of Lora or Merriweather.',
    pairingNote:'Noto Sans creates a consistent system for multilingual products.',
  },
  {
    id:'lib-55', name:'IBM Plex Mono', foundry:'Mike Abbink / IBM',
    classification:'Monospace', subtype:'Code',
    license:'OFL (Free)', languages:'Pan-European',
    mood:['engineered','precise','corporate','systematic','institutional'],
    personality:['IBM-quality','reliable','institutional'],
    useCases:['Code in IBM design systems','Technical documentation','Data display','Terminal','API reference'],
    brandFit:['enterprise','developer','saas','technical'],
    readability:92, screenSuitability:94, printSuitability:72,
    contrast:'Low', xHeight:'Medium', weight:'100-700', variable:false, axes:[],
    pairingWith:['IBM Plex Sans','Inter'],
    goodFor:['Code blocks in enterprise products','Technical documentation','Data display','Terminal interfaces'],
    avoidFor:['Creative/casual contexts','Non-technical marketing'],
    notes:'IBM\'s mono companion to IBM Plex Sans. Complete IBM Plex system coherence. Excellent for enterprise documentation.',
    contextScore:{saas:70,editorial:25,fintech:55,portfolio:48,devtool:96,consumer:28,luxury:22,ecommerce:28,agency:40,academic:66},
    fontFamily:"'IBM Plex Mono', monospace", previewText:'print("enterprise code")',
    confidence:90, source:'open-library', completeness:86,
    tradeoffs:'Best within IBM Plex system context — standalone use less distinctive.',
    pairingNote:'IBM Plex Sans is the native companion.',
  },
  {
    id:'lib-56', name:'Ubuntu', foundry:'Dalton Maag',
    classification:'Sans-serif', subtype:'Humanist',
    license:'OFL (Free)', languages:'Pan-European + Arabic',
    mood:['open','humanist','friendly','reliable','community-driven'],
    personality:['accessible','open-source','community-driven'],
    useCases:['Open-source products','Developer tools','Community platforms','Accessible UI'],
    brandFit:['open-source','developer','community','non-profit','civic-tech'],
    readability:93, screenSuitability:94, printSuitability:84,
    contrast:'Low', xHeight:'High', weight:'300-700', variable:false, axes:[],
    pairingWith:['Ubuntu Mono','Source Serif 4','Merriweather'],
    goodFor:['Open-source branding','Developer community products','Accessible multilingual UI'],
    avoidFor:['Luxury brands','Premium fashion','Corporate enterprise'],
    notes:'Designed for Ubuntu OS. Excellent multilingual support including Arabic. Strong open-source brand identity.',
    contextScore:{saas:82,editorial:62,fintech:65,portfolio:62,devtool:90,consumer:80,luxury:40,ecommerce:72,agency:60,academic:76},
    fontFamily:"'Ubuntu', sans-serif", previewText:'Open and human',
    confidence:86, source:'open-library', completeness:83,
    tradeoffs:'Strong Ubuntu OS association — consider context for non-Linux brands.',
    pairingNote:'Ubuntu Mono is the companion for code blocks.',
  },
  {
    id:'lib-57', name:'Quicksand', foundry:'Andrew Paglinawan',
    classification:'Sans-serif', subtype:'Rounded',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['friendly','rounded','approachable','youthful','soft'],
    personality:['welcoming','gentle','lightweight'],
    useCases:['Children\'s apps','Consumer products','Wellness UI','Friendly mobile apps','Light marketing'],
    brandFit:['wellness','consumer','children','lifestyle','health'],
    readability:88, screenSuitability:88, printSuitability:76,
    contrast:'Low', xHeight:'Medium', weight:'300-700', variable:true, axes:['wght'],
    pairingWith:['Lora','Merriweather'],
    goodFor:['Friendly consumer UI','Wellness product copy','Children\'s apps','Light-touch marketing'],
    avoidFor:['Enterprise','Finance','Conservative brands','Dense data'],
    notes:'Rounded geometric with very light feel. Very friendly and approachable. Best for consumer products with a soft voice.',
    contextScore:{saas:65,editorial:42,fintech:45,portfolio:68,devtool:44,consumer:93,luxury:42,ecommerce:86,agency:66,academic:44},
    fontFamily:"'Quicksand', sans-serif", previewText:'Light and welcoming',
    confidence:84, source:'open-library', completeness:80,
    tradeoffs:'Very light weight limits contrast for strong hierarchy.',
    pairingNote:'Lora or Merriweather for reading-depth contrast.',
  },
  {
    id:'lib-58', name:'Nunito Sans', foundry:'Jacques Le Bailly',
    classification:'Sans-serif', subtype:'Rounded Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['clean','approachable','friendly','modern','accessible'],
    personality:['versatile','contemporary','clear'],
    useCases:['UI text','Body copy','Dashboard','Clean consumer products','Mobile'],
    brandFit:['consumer','saas','startup','mobile','product'],
    readability:93, screenSuitability:91, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'200-1000', variable:true, axes:['wght'],
    pairingWith:['Playfair Display','Fraunces','Merriweather'],
    goodFor:['UI at 12px+','Body copy','Dashboard text','Clean consumer products'],
    avoidFor:['Bold display work','Strong brand personality'],
    notes:'Cleaner version of Nunito — less pronounced rounding for better UI legibility. Excellent small-size performance.',
    contextScore:{saas:84,editorial:58,fintech:74,portfolio:68,devtool:68,consumer:88,luxury:50,ecommerce:85,agency:68,academic:62},
    fontFamily:"'Nunito Sans', sans-serif", previewText:'Clear and clean',
    confidence:88, source:'open-library', completeness:84,
    tradeoffs:'Close to Nunito — evaluate both for your specific brand warmth preference.',
    pairingNote:'Playfair Display or Fraunces add editorial contrast.',
  },
  {
    id:'lib-59', name:'Exo 2', foundry:'Natanael Gama',
    classification:'Display', subtype:'Futuristic Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['futuristic','technical','energetic','modern','sci-fi'],
    personality:['tech-forward','dynamic','cutting-edge'],
    useCases:['Gaming UI','Tech brands','Sci-fi products','Software interfaces','Display headings'],
    brandFit:['gaming','tech','sci-fi','esports','developer'],
    readability:84, screenSuitability:84, printSuitability:76,
    contrast:'Variable', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Roboto','Inter'],
    goodFor:['Gaming/esports UI','Tech brand headings','Sci-fi display','Software product headers'],
    avoidFor:['Traditional brands','Long body copy','Conservative finance'],
    notes:'Futuristic geometric with an energetic personality. The Devanagari expansion makes it valuable for tech-forward Indian products.',
    contextScore:{saas:62,editorial:38,fintech:50,portfolio:66,devtool:74,consumer:65,luxury:36,ecommerce:55,agency:62,academic:38},
    fontFamily:"'Exo 2', sans-serif", previewText:'Beyond the horizon',
    confidence:85, source:'open-library', completeness:80,
    tradeoffs:'Very distinct personality — narrows brand use cases.',
    pairingNote:'Roboto or Inter for readable body contrast.',
  },
  {
    id:'lib-60', name:'Be Vietnam Pro', foundry:'Be Fonts',
    classification:'Sans-serif', subtype:'Humanist Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Vietnamese',
    mood:['clean','modern','fresh','versatile','balanced'],
    personality:['contemporary','professional','adaptable'],
    useCases:['Modern SaaS','Product interfaces','Marketing','Multi-script needs','Vietnamese products'],
    brandFit:['saas','consumer','startup','southeast-asian','product'],
    readability:92, screenSuitability:92, printSuitability:82,
    contrast:'Low', xHeight:'High', weight:'100-800', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Merriweather','Lora'],
    goodFor:['Modern SaaS UI','Vietnamese + Latin products','Marketing pages','Clean product interfaces'],
    avoidFor:['Traditional brands','Pure editorial print'],
    notes:'Comprehensive modern grotesque with excellent Vietnamese character support. Variable font with wide weight range.',
    contextScore:{saas:84,editorial:55,fintech:76,portfolio:75,devtool:70,consumer:84,luxury:52,ecommerce:80,agency:76,academic:60},
    fontFamily:"'Be Vietnam Pro', sans-serif", previewText:'Modern across scripts',
    confidence:86, source:'open-library', completeness:82,
    tradeoffs:'Less known internationally — strong choice specifically for SE Asian market products.',
    pairingNote:'Fraunces or Merriweather for editorial contrast.',
  },
  {
    id:'lib-61', name:'Kumbh Sans', foundry:'Sumptutype',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended + Devanagari',
    mood:['clean','modern','geometric','versatile','balanced'],
    personality:['neutral','contemporary','systematic'],
    useCases:['UI text','Product interfaces','Clean layouts','Marketing','Devanagari products'],
    brandFit:['saas','consumer','indian-market','startup','product'],
    readability:91, screenSuitability:90, printSuitability:80,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Merriweather','Fraunces','Lora'],
    goodFor:['UI text','Clean product UI','Devanagari-Latin bilingual products','Marketing pages'],
    avoidFor:['Luxury brands','Expressive editorial'],
    notes:'Modern geometric grotesque with strong Devanagari support. Excellent for Indian market tech products. Variable weight.',
    contextScore:{saas:80,editorial:50,fintech:70,portfolio:68,devtool:65,consumer:80,luxury:44,ecommerce:74,agency:68,academic:56},
    fontFamily:"'Kumbh Sans', sans-serif", previewText:'Clean and universal',
    confidence:85, source:'open-library', completeness:80,
    tradeoffs:'Less distinctive than Poppins for same Indian market without Devanagari need.',
    pairingNote:'Fraunces or Merriweather for editorial depth.',
  },
  {
    id:'lib-62', name:'Albert Sans', foundry:'Andreas Rasmussen',
    classification:'Sans-serif', subtype:'Geometric',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['minimal','clean','modern','precise','quiet'],
    personality:['understated','refined','systematic'],
    useCases:['Minimal brand identity','Clean UI','Technical products','Documentation','Design systems'],
    brandFit:['tech','saas','minimal','Scandinavian','premium-tech'],
    readability:91, screenSuitability:91, printSuitability:80,
    contrast:'Low', xHeight:'High', weight:'100-900', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Spectral','Merriweather'],
    goodFor:['Minimal brand identity','Clean product UI','Systematic design','Technical documentation'],
    avoidFor:['Expressive brands','Loud display','Warm consumer products'],
    notes:'Very clean modern grotesque. Scandinavian-influenced. Designed for minimal, systematic design. Excellent letter spacing.',
    contextScore:{saas:86,editorial:55,fintech:80,portfolio:76,devtool:73,consumer:74,luxury:62,ecommerce:72,agency:72,academic:63},
    fontFamily:"'Albert Sans', sans-serif", previewText:'Minimal. Intentional.',
    confidence:87, source:'open-library', completeness:83,
    tradeoffs:'Very quiet personality — may be too neutral for brand differentiation.',
    pairingNote:'Fraunces or Spectral add editorial character to minimal systems.',
  },
  {
    id:'lib-63', name:'Nunito', foundry:'Vernon Adams / Google',
    classification:'Sans-serif', subtype:'Rounded',
    license:'OFL (Free)', languages:'Latin Extended + Cyrillic',
    mood:['friendly','rounded','warm','playful','inviting'],
    personality:['welcoming','gentle','consumer-first'],
    useCases:['Consumer apps','Wellness','Education','Mobile UI','Approachable products'],
    brandFit:['wellness','consumer','children','lifestyle','edtech'],
    readability:92, screenSuitability:91, printSuitability:80,
    contrast:'Low', xHeight:'Medium', weight:'200-1000', variable:true, axes:['wght'],
    pairingWith:['Fraunces','Lora','Playfair Display'],
    goodFor:['Consumer app UI','Wellness products','Education platforms','Mobile-first soft products'],
    avoidFor:['Formal enterprise','Finance','Cold technical products'],
    notes:'Rounded terminals create softness and warmth. Variable weight. Very popular for consumer-facing products globally.',
    contextScore:{saas:72,editorial:50,fintech:50,portfolio:70,devtool:48,consumer:97,luxury:44,ecommerce:88,agency:68,academic:50},
    fontFamily:"'Nunito', sans-serif", previewText:'Warm at every size',
    confidence:91, source:'open-library', completeness:88,
    tradeoffs:'High popularity means limited distinctiveness for brand differentiation.',
    pairingNote:'Fraunces adds expressive editorial contrast for content platforms.',
  },
  {
    id:'lib-64', name:'Crimson Text', foundry:'Sebastian Kosch',
    classification:'Serif', subtype:'Old Style',
    license:'OFL (Free)', languages:'Latin Extended',
    mood:['scholarly','classical','literary','warm','academic'],
    personality:['bookish','intellectual','refined'],
    useCases:['Academic publishing','Book typography','Classical editorial','Long-form reading'],
    brandFit:['academic','literary','heritage','publishing','scholarly'],
    readability:88, screenSuitability:81, printSuitability:94,
    contrast:'Medium', xHeight:'Medium', weight:'400-700', variable:false, axes:[],
    pairingWith:['Inter','Open Sans','DM Sans'],
    goodFor:['Academic and book typography','Classical editorial','Long-form reading','Literary brands'],
    avoidFor:['Tech products','Mobile UI','Data-heavy layouts'],
    notes:'Classical Old Style serif with humanist proportions. Strong x-height for an old-style. Predecessor to Crimson Pro.',
    contextScore:{saas:40,editorial:90,fintech:36,portfolio:72,devtool:26,consumer:50,luxury:78,ecommerce:54,agency:62,academic:97},
    fontFamily:"'Crimson Text', Georgia, serif", previewText:'Scholarly and refined',
    confidence:86, source:'open-library', completeness:82,
    tradeoffs:'Screen rendering less optimised than Crimson Pro.',
    pairingNote:'Inter or DM Sans bring clean UI contrast to classical editorial.',
  },
];

// ── Dev mode flag — shared by both IIFEs below ───────────────────────────────
// Quiet on production (vercel.app, custom domains).
// Active on localhost / file:// / ?debug=1
const isDev = (typeof location !== 'undefined') && (
  location.protocol === 'file:' ||
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(location.hostname) ||
  /[?&]debug=1\b/.test(location.search)
);

// ───────────────────────────────────────────────────────────────────
// Phase 1 schema migration — normalize legacy entries to the canonical
// shape defined in tm-schema.jsx. Preserves legacy aliases on the same
// object so scoreFont and existing UI continue to work unchanged.
// See roadmap.md for the canonical schema.
// ───────────────────────────────────────────────────────────────────
(function migrateToCanonicalSchema() {
  if (!window.TMSchema || typeof window.TMSchema.normalizeFont !== 'function') {
    console.error('[TMSchema] tm-schema.jsx not loaded before tm-data.jsx — skipping migration');
    return;
  }
  const { normalizeFont, validateFont } = window.TMSchema;

  const normalizeWithSource = (arr, source) => {
    const out = arr.map(f => normalizeFont({ ...f, source: f.source || source }));
    arr.length = 0;
    arr.push(...out);
  };

  normalizeWithSource(SAMPLE_COLLECTION, 'curated');
  normalizeWithSource(OPEN_FONT_LIBRARY, 'open-library');

  if (!isDev) return;

  const all = [...SAMPLE_COLLECTION, ...OPEN_FONT_LIBRARY];
  const reports = all
    .map(f => ({ family: f.family, source: f.source, issues: validateFont(f) }))
    .filter(r => r.issues.length);

  if (reports.length) {
    console.groupCollapsed(`[TMSchema] ${reports.length} validation issue(s) across ${all.length} fonts`);
    reports.forEach(r => console.warn(`${r.family} (${r.source}):`, r.issues));
    console.groupEnd();
  } else {
    console.info(`[TMSchema] all ${all.length} fonts valid against canonical schema`);
  }
})();

// ───────────────────────────────────────────────────────────────────
// Step 3-A: Heuristic enrichment for bare Google Fonts catalog entries.
//
// Populates vibe and scoring fields from what the GF API v1 DOES expose:
//   category, weightMin, weightMax, and position in the popularity-sorted
//   snapshot (popularityRank). Per-font data the API does not provide
//   (subcategory, foundry, individual mood/personality, contrastStyle detail)
//   is left to a future per-font enrichment pass.
//
// Design rules:
//   • Numeric scores (readability, screen, editorial) always overwrite the
//     flat 70/70/70 backfills that normalizeFont sets for bare GF entries —
//     those defaults hold no real information for GF-sourced fonts.
//   • contrastStyle and xHeight always overwrite the 'medium' defaults for
//     the same reason.
//   • Array vibe fields (mood, personality, tags, goodFor) and contextScore
//     are only written if currently empty — preserves any future override.
//   • trend only set if not already present; only top 200 get 'established'.
//   • licenseCode corrected for the small known set of Apache 2.0 families.
//   • completeness fixed at 45: structural + heuristic coverage, no per-font
//     depth. Curated entries carry 82–100; the contrast is intentional.
//   • Never called on curated or open-library entries.
// ───────────────────────────────────────────────────────────────────

// Families verifiably under Apache 2.0 in the Google Fonts GitHub source.
// All other GF families are assumed OFL; the API does not expose this per-font.
// Noto and Roboto sub-families are caught by the regex tests in enrichGFEntry.
const APACHE_GF_FAMILIES = new Set([
  'Roboto', 'Roboto Condensed', 'Roboto Flex', 'Roboto Mono',
  'Roboto Serif', 'Roboto Slab',
  'Noto Sans', 'Noto Serif', 'Noto Sans Mono',
  'Noto Color Emoji', 'Noto Emoji',
]);

// Returns a heuristic profile object for category × weight bucket.
// Weight bucket:
//   'wide'     — weightMin ≤ 300 AND weightMax ≥ 700 (versatile / variable-ready)
//   'narrow'   — weightMax ≤ 400 (display-weight or single-weight fonts)
//   'standard' — everything else
//
// goodFor strings are written so the first word matches the trigger tokens
// that useCaseFit() extracts from USE_CASES (first word before '&', lowercased):
//   "UI & Product"→"ui", "Body copy"→"body", "Code & data"→"code",
//   "Long-form reading"→"long-form", "Brand identity"→"brand", etc.
function getCategoryHeuristics(category, weightMin, weightMax) {
  const isWide   = weightMin <= 300 && weightMax >= 700;
  const isNarrow = weightMax <= 400;
  const bucket   = isWide ? 'wide' : isNarrow ? 'narrow' : 'standard';

  // Single-profile categories — weight range does not meaningfully change vibe
  const SINGLE = {
    display: {
      readability: 52, screenSuitability: 62, editorialSuitability: 72,
      contrastStyle: 'variable', xHeight: 'medium',
      mood:        ['expressive', 'bold', 'dramatic'],
      personality: ['distinctive', 'attention-grabbing'],
      tags:        ['display', 'headline', 'decorative'],
      goodFor:     ['Headlines at display sizes', 'Brand identity', 'Packaging design', 'Marketing', 'Editorial display'],
      contextScore:{ saas:44, editorial:72, fintech:38, portfolio:80, devtool:28, consumer:68, luxury:72, ecommerce:66, agency:82, academic:44 },
    },
    monospace: {
      readability: 72, screenSuitability: 88, editorialSuitability: 48,
      contrastStyle: 'low', xHeight: 'medium',
      mood:        ['technical', 'precise', 'functional'],
      personality: ['systematic', 'code-native'],
      tags:        ['monospace', 'code', 'technical'],
      goodFor:     ['Code & data display', 'Web app UI', 'Technical documentation', 'Developer tools'],
      contextScore:{ saas:58, editorial:28, fintech:50, portfolio:52, devtool:92, consumer:32, luxury:22, ecommerce:35, agency:42, academic:62 },
    },
    handwriting: {
      readability: 56, screenSuitability: 52, editorialSuitability: 60,
      contrastStyle: 'variable', xHeight: 'low',
      mood:        ['playful', 'warm', 'personal', 'expressive'],
      personality: ['crafted', 'informal'],
      tags:        ['script', 'handwriting', 'decorative'],
      goodFor:     ['Brand identity accents', 'Packaging design', 'Marketing materials', 'Headlines at large sizes'],
      contextScore:{ saas:24, editorial:58, fintech:20, portfolio:65, devtool:14, consumer:74, luxury:62, ecommerce:60, agency:68, academic:32 },
    },
  };
  if (SINGLE[category]) return SINGLE[category];

  // Multi-bucket categories — weight range signals rendering versatility
  const MULTI = {
    'sans-serif': {
      wide: {
        readability: 82, screenSuitability: 86, editorialSuitability: 62,
        contrastStyle: 'low', xHeight: 'medium',
        mood:        ['modern', 'clean', 'versatile'],
        personality: ['functional', 'reliable'],
        tags:        ['ui', 'screen', 'versatile'],
        goodFor:     ['UI text', 'Product interfaces', 'Web app UI', 'Marketing pages', 'Body copy'],
        contextScore:{ saas:74, editorial:52, fintech:66, portfolio:65, devtool:62, consumer:70, luxury:48, ecommerce:72, agency:64, academic:55 },
      },
      standard: {
        readability: 78, screenSuitability: 80, editorialSuitability: 60,
        contrastStyle: 'low', xHeight: 'medium',
        mood:        ['modern', 'clean', 'neutral'],
        personality: ['reliable', 'professional'],
        tags:        ['ui', 'screen'],
        goodFor:     ['UI text', 'Marketing pages', 'Web app UI', 'Body copy'],
        contextScore:{ saas:70, editorial:48, fintech:62, portfolio:60, devtool:56, consumer:66, luxury:44, ecommerce:68, agency:62, academic:52 },
      },
      narrow: {
        readability: 72, screenSuitability: 74, editorialSuitability: 58,
        contrastStyle: 'low', xHeight: 'medium',
        mood:        ['clean', 'simple', 'minimal'],
        personality: ['straightforward'],
        tags:        ['ui', 'simple'],
        goodFor:     ['UI text', 'Simple layouts', 'Marketing'],
        contextScore:{ saas:64, editorial:44, fintech:56, portfolio:56, devtool:50, consumer:62, luxury:40, ecommerce:62, agency:58, academic:48 },
      },
    },
    serif: {
      wide: {
        readability: 80, screenSuitability: 72, editorialSuitability: 86,
        contrastStyle: 'medium', xHeight: 'medium',
        mood:        ['classic', 'authoritative', 'refined'],
        personality: ['trustworthy', 'editorial'],
        tags:        ['editorial', 'reading', 'classic'],
        goodFor:     ['Editorial headings', 'Long-form reading', 'Print typography', 'Body copy', 'Headlines'],
        contextScore:{ saas:52, editorial:88, fintech:58, portfolio:72, devtool:32, consumer:56, luxury:80, ecommerce:62, agency:68, academic:84 },
      },
      standard: {
        readability: 76, screenSuitability: 68, editorialSuitability: 84,
        contrastStyle: 'medium', xHeight: 'medium',
        mood:        ['classic', 'refined', 'traditional'],
        personality: ['authoritative', 'steady'],
        tags:        ['editorial', 'classic'],
        goodFor:     ['Editorial headings', 'Print typography', 'Body copy', 'Headlines'],
        contextScore:{ saas:48, editorial:84, fintech:55, portfolio:68, devtool:28, consumer:52, luxury:78, ecommerce:58, agency:65, academic:82 },
      },
      narrow: {
        readability: 70, screenSuitability: 62, editorialSuitability: 80,
        contrastStyle: 'high', xHeight: 'low',
        mood:        ['delicate', 'refined', 'elegant'],
        personality: ['graceful', 'restrained'],
        tags:        ['display-serif', 'luxury', 'delicate'],
        goodFor:     ['Headlines at display sizes', 'Editorial display', 'Print typography'],
        contextScore:{ saas:36, editorial:80, fintech:42, portfolio:72, devtool:20, consumer:48, luxury:88, ecommerce:55, agency:70, academic:70 },
      },
    },
  };

  const profile = MULTI[category] && MULTI[category][bucket];
  if (profile) return profile;

  // Unknown / future category — minimal neutral fallback
  return {
    readability: 70, screenSuitability: 70, editorialSuitability: 65,
    contrastStyle: 'medium', xHeight: 'medium',
    mood:        ['neutral'],
    personality: [],
    tags:        [],
    goodFor:     [],
    contextScore:{ saas:55, editorial:55, fintech:50, portfolio:55, devtool:50, consumer:55, luxury:45, ecommerce:55, agency:55, academic:55 },
  };
}

function enrichGFEntry(font, popularityRank) {
  const h = getCategoryHeuristics(
    font.category || 'sans-serif',
    font.weightMin,
    font.weightMax,
  );

  // Numeric scores — always overwrite normalizeFont's 70/70/70 backfills.
  font.readability          = h.readability;
  font.screenSuitability    = h.screenSuitability;
  font.editorialSuitability = h.editorialSuitability;
  font.printSuitability     = h.editorialSuitability; // legacy alias kept in sync

  // Type properties — always overwrite the 'medium' defaults normalizeFont
  // sets for bare GF entries; heuristics carry more signal than a flat default.
  font.contrastStyle = h.contrastStyle;
  font.contrast      = h.contrastStyle;  // legacy alias — keep in sync with contrastStyle
  font.xHeight       = h.xHeight;

  // Vibe arrays — only set if currently empty
  if (!Array.isArray(font.mood)        || !font.mood.length)        font.mood        = h.mood.slice();
  if (!Array.isArray(font.personality) || !font.personality.length) font.personality = h.personality.slice();
  if (!Array.isArray(font.tags)        || !font.tags.length)        font.tags        = h.tags.slice();
  if (!Array.isArray(font.goodFor)     || !font.goodFor.length)     font.goodFor     = h.goodFor.slice();
  if (!font.contextScore)                                            font.contextScore = Object.assign({}, h.contextScore);

  // Trend — top 200 in the GF popularity sort earn 'established' with confidence.
  // Below that we cannot distinguish established from emerging from API rank alone.
  if (!font.trend) {
    font.trend = popularityRank < 200 ? 'established' : null;
  }

  // License correction — the snapshot hardcodes OFL for all entries (API v1 limit).
  // Roboto and Noto families are verifiably Apache 2.0 in the GF GitHub source.
  const fam = font.family || '';
  if (APACHE_GF_FAMILIES.has(fam) || /^Noto\b/i.test(fam) || /^Roboto\b/i.test(fam)) {
    font.licenseCode       = 'Apache';
    font.licenseConfidence = 'high';
    font.license           = 'Apache 2.0';
  }

  // Completeness — 45: structural + heuristic coverage, no per-font depth.
  // Curated entries carry 82–100. The gap signals metadata quality to the UI.
  font.completeness = 45;

  return font;
}

// ───────────────────────────────────────────────────────────────────
// Phase 1 Google Fonts catalog merge — non-blocking.
// Starts the moment tm-google-fonts.json resolves (fetch began before
// Babel fired). Combined catalog available long before user reaches Results.
// Curated entries (SAMPLE_COLLECTION + OPEN_FONT_LIBRARY) always win.
// ───────────────────────────────────────────────────────────────────
(function initGFMerge() {
  // Set synchronous defaults so ALL_FONTS is always defined,
  // even if the fetch never completes.
  window.__GF_CATALOG_READY = false;
  window.GF_FONT_LIBRARY    = [];
  window.ALL_FONTS          = [...SAMPLE_COLLECTION, ...OPEN_FONT_LIBRARY];

  const promise = window.__GF_FONTS_PROMISE;
  if (!promise || typeof promise.then !== 'function') {
    if (isDev) console.warn('[TypeMatch] __GF_FONTS_PROMISE not found — GF catalog disabled. Check script load order in TypeMatch.html.');
    return;
  }

  promise
    .then(function (snapshot) {
      const raw = (snapshot && Array.isArray(snapshot.fonts)) ? snapshot.fonts : [];

      if (!raw.length) {
        // Stub or empty snapshot — treat as a no-op; curated catalog stands.
        window.__GF_CATALOG_READY = true;
        if (isDev) console.info('[TypeMatch] GF snapshot loaded but empty (stub not yet populated).');
        return;
      }

      // A — resolve Step 2 taxonomy debt: remap source:'web' → 'open-library'
      OPEN_FONT_LIBRARY.forEach(function (f) {
        if (f.source === 'web') f.source = 'open-library';
      });

      // B — build case-insensitive dedup index of all already-known families
      const known = new Set();
      SAMPLE_COLLECTION.forEach(function (f) { known.add(f.family.toLowerCase()); });
      OPEN_FONT_LIBRARY.forEach(function (f) { known.add(f.family.toLowerCase()); });

      // C — filter snapshot: only new families not already in the curated catalog.
      // popularityRank = index in the popularity-sorted snapshot (0 = most popular).
      const { normalizeFont } = window.TMSchema;
      const newFromGF = [];
      raw.forEach(function (entry, popularityRank) {
        const key = (entry.family || '').toLowerCase();
        if (!key || known.has(key)) return;
        known.add(key); // also deduplicates within the GF snapshot itself
        const normalized = normalizeFont(entry);
        enrichGFEntry(normalized, popularityRank);
        newFromGF.push(normalized);
      });

      // D — expose combined catalog to window
      window.GF_FONT_LIBRARY    = newFromGF;
      window.ALL_FONTS          = [...SAMPLE_COLLECTION, ...OPEN_FONT_LIBRARY, ...newFromGF];
      window.__GF_CATALOG_READY = true;

      if (isDev) {
        console.info(
          `[TypeMatch] GF catalog merged: ${newFromGF.length} new families enriched + added ` +
          `(${window.ALL_FONTS.length} total, ${raw.length} in snapshot).`
        );
      }

      // E — signal any future reactive consumers
      window.dispatchEvent(new CustomEvent('tm:catalog-updated', {
        detail: { added: newFromGF.length, total: window.ALL_FONTS.length }
      }));
    })
    .catch(function (err) {
      // Fetch failed or JSON was invalid — preserve curated-only catalog exactly.
      window.__GF_CATALOG_READY = false;
      window.GF_FONT_LIBRARY    = [];
      window.ALL_FONTS          = [...SAMPLE_COLLECTION, ...OPEN_FONT_LIBRARY];
      if (isDev) console.warn('[TypeMatch] GF catalog failed to load — staying curated-only:', err.message);
    });
})();

const RECOMMENDATION_PRESETS = [
  { id: 'saas',      label: 'Minimal SaaS',     icon: 'computer',         description: 'Clean, professional, functional', context:'saas' },
  { id: 'editorial', label: 'Editorial Luxury', icon: 'article',          description: 'Refined, authoritative, timeless', context:'editorial' },
  { id: 'fintech',   label: 'Friendly Fintech', icon: 'account_balance',  description: 'Trustworthy, approachable, clear', context:'fintech' },
  { id: 'portfolio', label: 'Premium Portfolio',icon: 'palette',          description: 'Creative, distinctive, personal', context:'portfolio' },
  { id: 'devtool',   label: 'Developer Tool',   icon: 'code',             description: 'Technical, precise, minimal', context:'devtool' },
  { id: 'consumer',  label: 'Youthful Consumer',icon: 'celebration',      description: 'Playful, energetic, accessible', context:'consumer' },
  { id: 'luxury',    label: 'Luxury Heritage',  icon: 'diamond',          description: 'Crafted, elegant, premium', context:'luxury' },
  { id: 'ecommerce', label: 'Modern E-commerce',icon: 'shopping_bag',     description: 'Trustworthy, premium, conversion-led', context:'ecommerce' },
];

const MOOD_OPTIONS = [
  'elegant','modern','bold','minimal','playful','authoritative','warm','refined',
  'technical','expressive','friendly','luxury','quirky','classic','fresh',
  'humanist','industrial','crafted','futuristic','editorial',
];
const USE_CASES = [
  'UI & Product','Editorial','Brand identity','Headlines','Body copy',
  'Packaging','Marketing','Mobile app','Web app','Print','Code & data','Long-form reading',
];
const PROJECT_TYPES = [
  'SaaS product','Mobile app','Brand identity','Editorial / publication',
  'E-commerce','Portfolio','Marketing site','Developer tool','Luxury / fashion','Academic / non-profit',
];

// Map a free-form project type string to a context key in contextScore
const PROJECT_TO_CONTEXT = {
  'SaaS product':'saas','Mobile app':'consumer','Brand identity':'agency',
  'Editorial / publication':'editorial','E-commerce':'ecommerce',
  'Portfolio':'portfolio','Marketing site':'agency','Developer tool':'devtool',
  'Luxury / fashion':'luxury','Academic / non-profit':'academic',
  'Minimal SaaS':'saas','Editorial Luxury':'editorial','Friendly Fintech':'fintech',
  'Premium Portfolio':'portfolio','Developer Tool':'devtool','Youthful Consumer':'consumer',
  'Luxury Heritage':'luxury','Modern E-commerce':'ecommerce',
};

// Backwards-compat: legacy AI_SUGGESTIONS used by older code paths.
// We re-derive a top-3 from OPEN_FONT_LIBRARY for any consumer that still reads it.
const AI_SUGGESTIONS = OPEN_FONT_LIBRARY.slice(0,3).map(f => ({
  ...f,
  classification: f.classification, subtype: f.subtype,
  mood: f.mood, tags: f.goodFor || [], availability: f.availability,
  priceRange: f.priceRange || 'Free',
  webPresence: 'Open-source — Google Fonts',
}));

Object.assign(window, {
  SAMPLE_COLLECTION, AI_SUGGESTIONS, OPEN_FONT_LIBRARY,
  RECOMMENDATION_PRESETS, MOOD_OPTIONS, USE_CASES, PROJECT_TYPES,
  PROJECT_TO_CONTEXT,
});
