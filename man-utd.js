export const manUtd = {
  id: "man-utd",
  name: "Manchester United",
  badge: "🔴",
  primaryColor: "#DA291C",
  secondaryColor: "#FFE500",
  league: "premier_league",
  europeanComp: "europa_league",
  manager: "Michael Carrick",
  season: "2026-27",

  incomings: [
    {
      id: 3001,
      name: "Youri Tielemans",
      club: "Aston Villa",
      position: "MID",
      fee: "£35m",
      notes: "SIGNED — United triggered release clause in Villa contract. Belgian international, 29, five-year deal. Villa had clause inserted in contract. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "signed",
      sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "Man United completed £35m Tielemans transfer — triggered release clause in Villa contract" }]
    },
    {
      id: 3002,
      name: "Karl Darlow",
      club: "Free Agent (ex-Leeds)",
      position: "GK",
      fee: "Free",
      notes: "SIGNED — Free transfer after Leeds contract expired. 35 y/o provides backup for No1 Senne Lammens. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "signed",
      sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "Darlow joined United on free transfer after Leeds contract expiry" }]
    },
    {
      id: 3003,
      name: "Tynan Thompson",
      club: "Tottenham",
      position: "MID/FWD",
      fee: "£4m (rising to £8m)",
      notes: "SIGNED — 18 y/o left winger. £4m guaranteed plus £4m in bonuses. Part of United's emerging talent recruitment drive. Goes into first team training. Spurs retain sell-on clause plus matching rights. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "signed",
      sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "United signed Thompson from Spurs for initial £4m — emerging talent drive" }]
    },
    {
      id: 3004,
      name: "Manu Kone",
      club: "AS Roma",
      position: "MID",
      fee: "TBD",
      notes: "Third combative midfielder discussed at United but budgetary concerns. Not certain United would commit finance required. Roma selling — could be freed up if Summerville sale to Al Hilal (£68m to Roma's budget) accelerates move. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "interested",
      sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "Kone discussed at Man United but budgetary concerns over whether they would commit" }]
    },
    {
      id: 3005,
      name: "Lewis Hall",
      club: "Newcastle United",
      position: "LB",
      fee: "TBD",
      notes: "People at United like Hall. But Rashford return and Dorgu's left position impact here — Mazraoui could switch to LB. Not top priority. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "monitoring",
      sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "United have looked at Hall at LB but Rashford/Dorgu situation impacts decision" }]
    },
    {
      id: 3006,
      name: "Alex Scott",
      club: "Bournemouth",
      position: "MID",
      fee: "TBD",
      notes: "Well-liked by figures at United but Bournemouth insist not for sale. Arsenal and Chelsea also interested. Out of reach at current stance. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "monitoring",
      sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "Scott well-liked at United but Bournemouth insisting he is not for sale" }]
    },
  ],

  outgoings: [
    {
      id: 3101,
      name: "Marcus Rashford",
      position: "MID/FWD",
      notes: "Exit clause expired. Plan is to reintegrate once back from three-week break post-WC. Barcelona signed Gordon instead of triggering €30m option. Carrick managed him under Mourinho and Solskjaer — different dynamic. Will assess on return. His presence impacts Summerville and Dorgu situations. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "uncertain"
    },
    {
      id: 3102,
      name: "Altay Bayindir",
      position: "GK",
      notes: "Expected to leave following Darlow signing and Lammens as No1. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "likely exit"
    },
    {
      id: 3103,
      name: "Radek Vitek",
      position: "GK",
      notes: "22 y/o clear in desire for first team football. Open to loan or permanent. Several clubs registered interest. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "likely exit"
    },
    {
      id: 3104,
      name: "Mason Greenwood",
      position: "MID/FWD",
      notes: "SOLD to Fenerbahce from Marseille for €39m. United receive ~€13m via sell-on clause. via Laurie Whitwell/The Athletic · July 21 2026.",
      status: "sold"
    },
  ],

  academy: [
    {
      id: 3201,
      name: "Toby Collyer",
      age: 20,
      position: "MID",
      notes: "Academy midfielder making push for first team involvement. Loan move likely to Championship or League One for regular minutes.",
      status: "loan expected"
    },
  ]
};
