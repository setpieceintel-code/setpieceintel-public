export const liverpool = {
  id: "liverpool",
  name: "Liverpool",
  badge: "🔴",
  primaryColor: "#C8102E",
  secondaryColor: "#F6EB61",
  league: "premier_league",
  europeanComp: "champions_league",
  manager: "Andoni Iraola",
  season: "2026-27",

  incomings: [
    {
      id: 4001,
      name: "Victor Munoz",
      club: "Unknown",
      position: "MID/FWD",
      fee: "TBD",
      notes: "SIGNED — World Cup winner. Good addition per Iraola but at least one more versatile forward needed. Ekitike out long term with Achilles. via James Pearce/Gregg Evans/The Athletic · July 21 2026.",
      status: "signed",
      sources: [{ journalist: "James Pearce", outlet: "The Athletic", date: "2026-07-21", claim: "Liverpool signed World Cup winner Victor Munoz" }]
    },
    {
      id: 4002,
      name: "Samuel Martinez",
      club: "Atletico Nacional",
      position: "MID",
      fee: "£750k",
      notes: "SIGNED — 17 y/o Colombian attacking midfielder. £750k signing. Future talent acquisition. via James Pearce/The Athletic · July 21 2026.",
      status: "signed",
      sources: [{ journalist: "James Pearce", outlet: "The Athletic", date: "2026-07-21", claim: "Liverpool closing in on £750k signing of Martinez from Atletico Nacional" }]
    },
    {
      id: 4003,
      name: "Bradley Barcola",
      club: "Paris Saint-Germain",
      position: "MID/FWD",
      fee: "£100m+",
      notes: "Player Liverpool would love to add. Primary Salah replacement target. PSG reluctant to sell at any price — enormous obstacle. Other options under consideration if PSG hold firm. via Gregg Evans/The Athletic · July 21 2026.",
      status: "interested",
      sources: [{ journalist: "Gregg Evans", outlet: "The Athletic", date: "2026-07-21", claim: "Barcola is the player Liverpool would love — but PSG reluctant to sell, monitoring other options" }]
    },
  ],

  outgoings: [
    {
      id: 4101,
      name: "Mohamed Salah",
      position: "MID/FWD",
      notes: "SOLD/LEFT — Departed Liverpool. Primary reason for urgent wide reinforcement this summer. Via The Athletic.",
      status: "sold"
    },
    {
      id: 4102,
      name: "Curtis Jones",
      position: "MID",
      notes: "Future uncertain. Inter retain strong interest — rejected second bid of ~€25m (£21m) earlier this month. Iraola says wants to keep him. Contract ends next summer — decision needed or Liverpool lose him for nothing for third year running. At a crossroads. via James Pearce/The Athletic · July 21 2026.",
      status: "uncertain"
    },
    {
      id: 4103,
      name: "Federico Chiesa",
      position: "MID/FWD",
      notes: "Expected to leave. Hinges on future incomings. via James Pearce/The Athletic · July 21 2026.",
      status: "likely exit"
    },
    {
      id: 4104,
      name: "Hugo Ekitike",
      position: "FWD",
      notes: "Achilles injury — expected to miss good chunk of season. Absence driving urgency for forward reinforcements. via The Athletic · July 21 2026.",
      status: "uncertain"
    },
    {
      id: 4105,
      name: "Luke Chambers",
      position: "DEF",
      notes: "Included in US pre-season tour — loan offers to be listened to later in window. via James Pearce/The Athletic · July 21 2026.",
      status: "loan expected"
    },
    {
      id: 4106,
      name: "Calvin Ramsay",
      position: "RB",
      notes: "Scotland clubs interested in loan. Included in US tour squad before potential exit. QPR also like him. via James Pearce/The Athletic · July 21 2026.",
      status: "loan expected"
    },
  ],

  academy: [
    {
      id: 4201,
      name: "James McConnell",
      age: 20,
      position: "MID",
      notes: "Included in US pre-season tour. Loan offers to be listened to later in window. Promising central midfielder.",
      status: "loan expected"
    },
    {
      id: 4202,
      name: "Ifeanyi Ndukwe",
      age: 19,
      position: "MID/FWD",
      notes: "Included in US pre-season tour. Nigerian heritage. Loan offers to be listened to later in window.",
      status: "loan expected"
    },
  ]
};
