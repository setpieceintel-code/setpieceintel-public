export const arsenal = {
  id: "arsenal",
  name: "Arsenal",
  badge: "🔴",
  primaryColor: "#EF0107",
  secondaryColor: "#023474",
  league: "premier_league",
  europeanComp: "champions_league",
  manager: "Mikel Arteta",
  season: "2026-27",

  incomings: [
    {
      id: 1001,
      name: "Christos Tzolis",
      club: "Club Brugge",
      position: "MID/FWD",
      fee: "£34m",
      notes: "AGREED — Arsenal met Club Brugge's £34m asking price. Greek international left winger, 24. Effectively replaces Trossard who joined Besiktas. Arsenal pursued Tzolis separately from Rogers pursuit — always a distinct target. via James McNicholas/The Athletic · July 21 2026.",
      status: "frontrunner",
      sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Arsenal have agreed a fee with Club Brugge for Tzolis, £34m matches their valuation" }]
    },
    {
      id: 1002,
      name: "Bruno Guimaraes",
      club: "Newcastle United",
      position: "MID",
      fee: "£77-100m",
      notes: "Arsenal primary target for midfield. Newcastle insist not for sale but Guimaraes has communicated desire to explore joining champions. Arsenal have clear internal valuation and will only proceed within those parameters. Newcastle in UEFA settlement — need funds carefully. Long-running saga. via The Athletic · July 21 2026.",
      status: "interested",
      sources: [{ journalist: "Chris Waugh", outlet: "The Athletic", date: "2026-07-21", claim: "Newcastle insist Guimaraes not for sale but he has communicated desire to leave — Arsenal pushing" }, { journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Arsenal maintain interest in Guimaraes, have clear valuation, will only proceed within those parameters" }]
    },
    {
      id: 1003,
      name: "Ezri Konsa",
      club: "Aston Villa",
      position: "CB",
      fee: "TBD",
      notes: "CB target following William Saliba fitness concerns. England international. Significant valuation gap between Arsenal and Villa. Arteta admirer. May not get done given gap. via James McNicholas/The Athletic · July 21 2026.",
      status: "interested",
      sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Konsa is a target but significant gap between Arsenal and Villa valuations" }]
    },
    {
      id: 1004,
      name: "Bradley Barcola",
      club: "Paris Saint-Germain",
      position: "MID/FWD",
      fee: "£100m+",
      notes: "France winger on Arteta's radar but PSG reluctant to sell and value him in excess of £100m. One of several attackers on sporting director Andrea Berta's list post-Rogers miss. Long shot at current valuation. via The Athletic · July 21 2026.",
      status: "monitoring",
      sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Barcola on Arsenal radar but PSG reluctant to sell, value in excess of £100m" }]
    },
    {
      id: 1005,
      name: "Morgan Rogers",
      club: "Aston Villa",
      position: "MID/FWD",
      fee: "£117m",
      notes: "DROPPED — Arsenal primary target all summer. Carried out extensive background work, charm offensive from Arteta. Arsenal valuation capped at £80m. Villa demanded £116m+. Chelsea met the valuation in 48 hours — Arsenal declined to match. Rogers open to either club, Chelsea wrapped it up. Major miss. via The Athletic · July 21 2026.",
      status: "dropped",
      sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Arsenal did not want to go beyond £80m — Chelsea met Villa's demands, Arsenal declined to match the bid" }]
    },
  ],

  outgoings: [
    {
      id: 1101,
      name: "Leandro Trossard",
      position: "MID/FWD",
      notes: "SOLD to Besiktas for €20m. Said emotional goodbye to Arsenal. Replaced by Tzolis signing. via The Athletic · July 21 2026.",
      status: "sold"
    },
    {
      id: 1102,
      name: "Gabriel Jesus",
      position: "FWD",
      notes: "Arsenal looking to sell. Brazilian striker among players hoping to offload this summer. Has not nailed down regular starts under Arteta. PL interest expected. via James McNicholas/The Athletic · July 21 2026.",
      status: "expected sale"
    },
    {
      id: 1103,
      name: "Reiss Nelson",
      position: "MID/FWD",
      notes: "Arsenal looking to sell. English winger in first wave of players recalled to London Colney — on the list of hoped departures this summer. via James McNicholas/The Athletic · July 21 2026.",
      status: "expected sale"
    },
    {
      id: 1104,
      name: "Alex Scott",
      position: "MID",
      notes: "Bournemouth insist not for sale but Arsenal and Chelsea both interested. Well-liked by figures at Man Utd too. Price tag significant — Bournemouth holding firm. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "uncertain"
    },
  ],

  academy: [
    {
      id: 1201,
      name: "Myles Lewis-Skelly",
      age: 19,
      position: "LB/MID",
      notes: "Breakthrough academy talent. Featured regularly for Arteta last season. Part of Arsenal's long-term left-back solution. England youth international.",
      status: "breakthrough ready"
    },
    {
      id: 1202,
      name: "Ayden Heaven",
      age: 18,
      position: "CB",
      notes: "Highly-rated CB prospect. Arsenal academy graduate. England youth international. Loan move likely to continue development.",
      status: "loan expected"
    },
  ]
};
