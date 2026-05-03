// tm-data.jsx v3 — Large curated open-source font library with rich AI context
// Each font carries dense metadata that the recommender (and any LLM downstream)
// can use to reason about *why* a typeface fits a given brief.
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
//   goodFor[]           — short bullet list — feeds AI explainability
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
    goodFor: ['Display sizes 48px+','Luxury print','Italic flourishes'],
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
    goodFor: ['UI down to 11px','Data tables','Number-heavy UI','Settings'],
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

// Companion library — a much larger AI knowledge base of open-source fonts
// the recommender can surface as "AI + Web Suggestions" beyond the user's collection.
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
    goodFor:['Developer tools','Modern SaaS','Mono companion needs'],
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
    goodFor:['Modern brand display','Variable system needs','Distinctive product voice'],
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
    goodFor:['Long-form reading','Modern publishing','Newsletter brands'],
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
