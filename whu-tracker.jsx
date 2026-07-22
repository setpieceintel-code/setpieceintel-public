import { useState, useEffect } from "react";


const JOURNALIST_TIERS = {
  "Fabrizio Romano":     { tier: 1, score: 40, outlet: "Various" },
  "David Ornstein":      { tier: 1, score: 39, outlet: "The Athletic" },
  "Ben Jacobs":          { tier: 1, score: 37, outlet: "Football Insider" },
  "Matteo Moretto":      { tier: 1, score: 35, outlet: "Various" },
  "Florian Plettenberg": { tier: 1, score: 35, outlet: "Sky Germany" },
  "Roshane Thomas":      { tier: 2, score: 28, outlet: "The Athletic" },
  "ExWHUEmployee":       { tier: 2, score: 26, outlet: "West Ham Way/Patreon" },
  "Sky Sports":          { tier: 2, score: 24, outlet: "Sky Sports" },
  "BBC Sport":           { tier: 2, score: 23, outlet: "BBC" },
  "Harry Watkinson":     { tier: 2, score: 22, outlet: "TEAMtalk" },
  "Claret & Hugh":       { tier: 3, score: 18, outlet: "C&H" },
  "TEAMtalk":            { tier: 3, score: 14, outlet: "TEAMtalk" },
  "West Ham Way":        { tier: 3, score: 13, outlet: "TWHW" },
  "CaughtOffside":       { tier: 3, score: 11, outlet: "CaughtOffside" },
  "Football Insider":    { tier: 3, score: 14, outlet: "Football Insider" },
  "Record.pt":           { tier: 3, score: 10, outlet: "Record (Portugal)" },
  "Hammers News":        { tier: 3, score: 10, outlet: "Hammers News" },
};

const STATUS_SCORES = {
  "imminent": 35, "frontrunner": 28, "bid rejected": 22,
  "inquired": 18, "interested": 12, "monitoring": 6,
  "signed": 100, "dropped": 0, "sold": 0,
  "expected sale": 20, "likely exit": 12,
  "staying": 0, "uncertain": 5,
};

function calculateConfidence(player) {
  if (player.status === "signed" || player.status === "sold") return 100;
  if (player.status === "dropped") return 0;
  
  const statusScore = STATUS_SCORES[player.status] || 6;
  
  // Get top source score
  let topSourceScore = 8;
  let sourceCount = 0;
  if (player.sources && player.sources.length > 0) {
    sourceCount = player.sources.length;
    const scores = player.sources.map(s => {
      const j = JOURNALIST_TIERS[s.journalist] || JOURNALIST_TIERS[s.outlet] || { score: 8 };
      return j.score;
    });
    topSourceScore = Math.max(...scores);
  }
  
  // Prior windows bonus
  const priorBonus = Math.min((player.prior_windows?.length || 0) * 8, 15);
  
  // Corroboration multiplier
  let corrobBonus = 0;
  if (sourceCount >= 3) corrobBonus = 8;
  else if (sourceCount === 2) corrobBonus = 4;
  
  const raw = statusScore + topSourceScore + priorBonus + corrobBonus;
  return Math.min(Math.round(raw), 99); // cap at 99 — only signed = 100
}

function getConfidenceColor(score) {
  if (score >= 76) return "#00c853";
  if (score >= 56) return "#e8a020";
  if (score >= 31) return "#ffab40";
  return "#556e7a";
}

const INITIAL_INCOMING = [
  { id: 1, name: "Ivor Pandur", club: "Hull City", position: "GK", fee: "TBD", notes: "Croatian shot-stopper, linked 2nd year running. Key part of Hull's PL return.", status: "monitoring", sources: [{ journalist: "Hammers News", outlet: "Hammers News", date: "2026-06-01", claim: "WHU linked with Pandur for second successive summer" }], prior_windows: [{ window: "summer_2025", peak_status: "monitoring", outcome: "no_deal", notes: "First linked during 2025 summer window, no deal completed" }] },
  { id: 2, name: "Jordan James", club: "Rennes (loan: Leicester)", position: "MID", fee: "£15–20m", notes: "EFL Young Player of the Season. 11 goals from deep MID despite Leicester's relegation to League One. Wales int'l (23 caps). Fernandes heir — box-to-box, press-heavy, versatile (8, DM, AM). June 14: went on Instagram following spree of WHU players incl. Bowen, Summerville, Payet, Antonio, Coufal & official WHU account. Craig Bellamy (Wales manager) is a WHU fan & manages James. Rennes asking £15–20m per Football Insider.", status: "frontrunner" , sources: [{ journalist: "Ben Jacobs", outlet: "Football Insider", date: "2026-06-14", claim: "Rennes asking £15-20m, WHU frontrunner for James" }, { journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Club remain interested in James as Fernandes replacement" }]},
  { id: 3, name: "Taylor Harwood-Bellis", club: "Southampton", position: "CB", fee: "£12.5m+", notes: "£12.5m bid rejected in January. Ball-playing CB, strong goalscoring record. ExWHUEmployee confirms long-term interest remains — could move for the right deal. Still very much in play. via ExWHU · July 18 2026.", status: "interested", sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Long-term interest remains, could move for right deal" }, { journalist: "Claret & Hugh", outlet: "Claret & Hugh", date: "2026-01-15", claim: "£12.5m bid submitted and rejected by Southampton" }], prior_windows: [{ window: "january_2026", peak_status: "bid rejected", outcome: "no_deal", fee_reported: "£12.5m", notes: "Formal bid submitted and rejected by Southampton in January 2026 window" }] },
  { id: 4, name: "Alpha Toure", club: "FC Metz", position: "MID", fee: "~£6m", notes: "Recommended by ex-recruitment head Max Hahn. Versatile left-footed. Metz relegated.", status: "imminent" , sources: [{ journalist: "Claret & Hugh", outlet: "Claret & Hugh", date: "2026-06-20", claim: "Deal imminent, Toure recommended by ex-recruitment head Max Hahn" }]},
  { id: 5, name: "Moustapha Mbow", club: "Paris FC", position: "DEF", fee: "TBD", notes: "Senegal int'l. ExWHUEmployee confirms WHU like him alongside Paris FC teammate Otavio. Multiple PL enquiries. WHU have good relationship with Paris FC following Kante transfer. via ExWHU · July 18 2026.", status: "interested" , sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "WHU big admirers, Paris FC relationship via Kante deal an advantage" }]},
  { id: 6, name: "Harrison Burrows", club: "Sheffield United", position: "LB", fee: "TBD", notes: "Option to replace Diouf. Attack-minded with a fine cross. Some fan criticism.", status: "monitoring" },
  { id: 7, name: "Santiago Bueno", club: "Wolves", position: "CB", fee: "TBD", notes: "WHU contacted Wolves in April. Standout player in poor Wolves side. Uruguayan.", status: "interested", prior_windows: [{ window: "april_2026_mid_season", peak_status: "interested", outcome: "no_deal", notes: "WHU made contact with Wolves in April 2026 during the season — early planning ahead of summer window" }] },
  { id: 8, name: "Eliezer Mayenda", club: "Sunderland", position: "FWD", fee: "TBD", notes: "10 goals in 25 starts in Sunderland's 2025 promotion. Spain U21. Lost role to Brobbey.", status: "monitoring" },
  { id: 9, name: "Jan Ziolkowski", club: "AS Roma", position: "CB", fee: "TBD", notes: "Polish youngster. Backup at Roma. Loan possible. Wants to break into Roma squad.", status: "monitoring" },
  { id: 10, name: "Pape Moussa Fall", club: "FC Metz", position: "FWD", fee: "~£5m", notes: "6'6\" Senegalese striker. 14 goals on loan at La Louviere. WHU frontrunner per TEAMtalk.", status: "frontrunner" , sources: [{ journalist: "TEAMtalk", outlet: "TEAMtalk", date: "2026-06-25", claim: "WHU frontrunner for Fall signing from Metz" }]},
  { id: 11, name: "Martin Adeline", club: "ESTAC Troyes → Hamburg", position: "MID", fee: "€4m", notes: "France U21. Was lined up as Fernandes replacement. 24 G/A. Exceptional box-crasher. DROPPED — signed for Hamburg (2. Bundesliga) for €4m per C&H. WHU missed out. July 13 2026.", status: "dropped" },
  { id: 12, name: "Carlos Lopes Rodriguez", club: "Alverca", position: "DEF", fee: "TBD", notes: "Teenage Portuguese prospect. One of most promising defensive talents in Portugal.", status: "monitoring" },
  { id: 13, name: "Solly March", club: "Free Agent (ex-Brighton)", position: "MID/FWD", fee: "Free", notes: "Brighton icon, contract expires July. 31 y/o. Only 38 mins PL football in injury-hit season.", status: "interested" },
  { id: 14, name: "Callum Osmand", club: "Celtic", position: "FWD", fee: "TBD", notes: "20 y/o. Injury-hit season but scored + assisted in title-clincher on final day.", status: "monitoring" },
  { id: 15, name: "Josh Mulligan", club: "Hibernian", position: "MID", fee: "TBD", notes: "Versatile. Compared to Gareth Bale AND John McGinn. Formal inquiry lodged per Ben Jacobs.", status: "inquired" , sources: [{ journalist: "Ben Jacobs", outlet: "Football Insider", date: "2026-06-18", claim: "Formal inquiry lodged by West Ham for Mulligan" }]},
  { id: 18, name: "Hayden Hackney", club: "Middlesbrough → Everton", position: "MID", fee: "N/A", notes: "WHU target who signed for Everton instead. Ironically his Everton arrival frees up Dwight McNeil for WHU. Dropped. July 5 2026.", status: "dropped" },
  { id: 17, name: "Dwight McNeil", club: "Everton", position: "MID/FWD", fee: "TBD", notes: "26 y/o left-footed inverted winger. Named as WHU frontrunner for Summerville replacement per TEAMtalk/Harry Watkinson. Everton open to selling — Hackney and Tyrique George signings push McNeil out. WHU have made enquiries, no formal offer yet. Fan reaction mixed — inconsistent, no goals/assists this season, but Championship-budget realistic. via TEAMtalk · July 5 2026.", status: "frontrunner", sources: [{ journalist: "Harry Watkinson", outlet: "TEAMtalk", date: "2026-07-05", claim: "WHU frontrunner for McNeil, Everton open to selling" }], prior_windows: [{ window: "summer_2025", peak_status: "monitoring", outcome: "no_deal", notes: "Previously linked to WHU during 2025 window before deal did not materialise" }] },
  { id: 19, name: "Abdul Fatawu", club: "Leicester", position: "MID/FWD", fee: "TBD", notes: "Was WHU target should Bowen leave. Bowen now staying so interest cooling. ExWHUEmployee confirms WHU leaving the race — looks like joining Ipswich instead. via ExWHU · July 18 2026.", status: "dropped" },
  { id: 29, name: "Axel Disasi", club: "Chelsea (ex-loan)", position: "CB", fee: "TBD", notes: "WHU number one CB target. ExWHUEmployee says intentions made very clear to him. Impressed on loan last season. Will have PL offers but WHU hopeful. May need to bide time. via ExWHU · July 17 2026.", status: "frontrunner" , sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-17", claim: "WHU made intentions very clear to Disasi, want permanent deal" }, { journalist: "Claret & Hugh", outlet: "Claret & Hugh", date: "2026-07-19", claim: "Reality check — re-signing unlikely given pay cut and PL competition" }]},
  { id: 20, name: "Fikayo Tomori", club: "AC Milan", position: "CB", fee: "TBD", notes: "Ambitious target per ExWHUEmployee. 11 months left on Milan deal, keen on London return. Newcastle, Leeds, Crystal Palace, Al-Hilal all competing. WHU would move if others fail. England international with Chelsea/Milan pedigree. via ExWHU · July 18 2026.", status: "monitoring", prior_windows: [{ window: "pre_summer_2026", peak_status: "monitoring", outcome: "no_deal", notes: "Previously linked during Chelsea days and multiple windows — long-standing interest per C&H" }] , sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Ambitious target, WHU would move if others fail" }]},
  { id: 21, name: "Otavio", club: "Paris FC", position: "MID", fee: "TBD", notes: "Brazilian midfielder. ExWHUEmployee confirms WHU interest — good relationship with Paris FC via Kante deal. Known to assistant manager Rui Pedro Silva from Famalicao. Mbow teammate also targeted. via ExWHU · July 18 2026.", status: "interested" },
  { id: 22, name: "Alexsandro", club: "Lille", position: "CB", fee: "TBD", notes: "Brazilian CB. Watched by WHU per ExWHUEmployee. Multiple PL clubs interested — Brentford very keen. WHU would move if PL move does not materialise. via ExWHU · July 18 2026.", status: "monitoring" },
  { id: 23, name: "Tiago Gabriel", club: "Lecce", position: "CB", fee: "TBD", notes: "Portuguese U21 CB. Highly rated after strong Serie A performances. Brentford very keen, multiple suitors. WHU would move if PL move falls through. via ExWHU · July 18 2026.", status: "monitoring" },
  { id: 24, name: "Gabriel Pereira", club: "FC Copenhagen", position: "MID/FWD", fee: "TBD", notes: "Brazilian. Plays for Nils Koppen former club Copenhagen — personal connection could be decisive. ExWHUEmployee flags as potential signing. via ExWHU · July 18 2026.", status: "interested" },
  { id: 25, name: "Ben Nelson", club: "Leicester", position: "CB", fee: "£10-12m", notes: "Young CB. WHU interest described as solid per ExWHUEmployee. Man Utd bid rejected — Leicester want £10-12m. Also Sunderland and Torino interested. WHU one of multiple clubs tracking. via ExWHU · July 18 2026.", status: "interested" },
  { id: 26, name: "Dylan Lawlor", club: "Cardiff City", position: "CB", fee: "~£20m", notes: "20 y/o Welsh CB. WHU actively in talks with Cardiff per CaughtOffside/C&H. Liverpool linked 9 months ago — serious pedigree for a Championship player. Full Welsh international. Cardiff valuing at £20m. Exactly the Nuno profile — young enough to develop, good enough for PL. Three weeks to get deal done before season opener. via C&H/CaughtOffside · July 19 2026.", status: "frontrunner" , sources: [{ journalist: "CaughtOffside", outlet: "CaughtOffside", date: "2026-07-18", claim: "WHU in active talks with Cardiff for Lawlor" }, { journalist: "Claret & Hugh", outlet: "Claret & Hugh", date: "2026-07-19", claim: "Lawlor identified as realistic Disasi Plan B" }, { journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Strong WHU interest, continuing discussions with Cardiff" }]},
  { id: 27, name: "Stephen Mfuni", club: "Manchester City", position: "CB", fee: "Loan", notes: "Loan option described as most likely by ExWHUEmployee. Impressed on loan at Watford in Championship last season. Man City expected to sanction another loan. via ExWHU · July 18 2026.", status: "frontrunner" , sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Mfuni loan most likely CB loan option for WHU" }]},
  { id: 32, name: "Harry Souttar", club: "Leicester City", position: "CB", fee: "<£15m", notes: "6'7\" Australian World Cup CB. Daily Record report WHU favourites to sign him. Leicester paid £15m in 2023 — available for less after Achilles rupture on loan at Sheffield United. Championship-ready, PL experience, aerial dominance. Fan opinion divided — Achilles history a concern. Disasi now confirmed out of reach per C&H. via Daily Record/C&H · July 20 2026.", status: "frontrunner", sources: [{ journalist: "Daily Record", outlet: "Daily Record", date: "2026-07-20", claim: "West Ham favourites to land Souttar, Australian World Cup star high on wanted list" }, { journalist: "Claret & Hugh", outlet: "Claret & Hugh", date: "2026-07-20", claim: "New CB priority following Disasi confirmed out of reach" }] },
  { id: 28, name: "Jaden Dixon", club: "Arsenal", position: "CB", fee: "Loan", notes: "Loan option. Born in Havering — local connection. Two Championship appearances for Stoke. Less likely than Mfuni per ExWHUEmployee. via ExWHU · July 18 2026.", status: "monitoring" },
  { id: 33, name: "James McAtee", club: "Nottingham Forest", position: "MID", fee: "TBD", notes: "WHU prime midfield target who snubbed a substantial offer. Football Insider report McAtee not interested in Championship football — prefers to stay at Forest. WHU back to square one on creative playmaker. Dropped. via Football Insider · July 2026.", status: "dropped", sources: [{ journalist: "Football Insider", outlet: "Football Insider", date: "2026-07-13", claim: "McAtee prepared to snub West Ham despite big-money offer — not interested in Championship" }] },
  { id: 34, name: "Anthony Musaba", club: "Sheffield Wednesday", position: "MID/FWD", fee: "TBD", notes: "Former Sheffield Wednesday winger linked several times with WHU bid. Problem: now being offered to Coventry, Ipswich and Hull City per journalist Yagiz Sabuncuoglu — suggesting he has accepted a Championship move but elsewhere. WHU interest cooling. via The72 · July 2026.", status: "monitoring", sources: [{ journalist: "Yagiz Sabuncuoglu", outlet: "The72", date: "2026-07-17", claim: "Musaba offered to Coventry, Ipswich and Hull — interest from West Ham and Wolves fading" }] },
  { id: 30, name: "Amario Cozier-Duberry", club: "Brighton", position: "MID/FWD", fee: "TBD", notes: "Identified as best domestic Fatawu alternative per The West Ham Way. Left-sided winger, pacey, direct. Brighton's sister club structure may complicate deal. Replaces Fatawu interest now Bowen staying. via TWHW · July 18 2026.", status: "interested" },
  { id: 31, name: "Ruben Vargas", club: "Sevilla", position: "MID/FWD", fee: "TBD", notes: "Swiss winger linked with ambitious WHU move. 2 goals and assist at 2026 World Cup for Switzerland. Left winger who cuts in on right foot. Brighton, Spurs, Villa also interested — WHU would need to convince him to drop to Championship. via TWHW · July 7 2026.", status: "monitoring" },
  { id: 16, name: "Gustavo Sá", club: "Famalicão", position: "MID", fee: "~£17m", notes: "21 y/o Portuguese box-to-box midfielder. Record.pt report deal \'about to land\' at WHU — fee ~€20m (down from €25m asking price). 120 apps, 12G/15A for Famalicão. Lampard-esque profile per scouts. Nuno/Portugal pipeline adds structural credibility. No English outlet corroboration yet. via Record.pt · July 5 2026.", status: "frontrunner" , sources: [{ journalist: "Record.pt", outlet: "Record.pt", date: "2026-07-05", claim: "Deal about to land at WHU, fee ~E20m agreed" }]},
];

const INITIAL_OUTGOING = [
  { id: 101, name: "Mateus Fernandes", position: "MID", notes: "SOLD to Tottenham Hotspur for £85m. Key asset — significant funds freed for reinvestment.", status: "sold" },
  { id: 115, name: "Tomas Soucek", position: "MID", notes: "Committed to staying but ANKLE INJURY — prolonged spell on sidelines expected per Roshane/Athletic. Significant blow for the Championship campaign. Creates opening for Orford and others in midfield. via Roshane Thomas/The Athletic · July 17 2026.", status: "staying" },
  { id: 114, name: "Jarrod Bowen", position: "MID/FWD", notes: "Club captain. Villa interest had been rife but Danny Dyer (father-in-law) said at charity match \'I don\'t think he\'s going anywhere and he will rip up the Championship\'. Biggest signal yet he\'s committed to staying. via C&H/talkSPORT · July 13 2026.", status: "staying" },
  { id: 102, name: "Edson Álvarez", position: "MID", notes: "On extended World Cup leave. Expected sale. Man Utd pursuing Manu Kone from Roma (Roma would then need funds = could accelerate Summerville deal logic). Multiple PL clubs expected to be interested in Alvarez on his return. WHU motivated sellers. via C&H/The Athletic · July 2026.", status: "expected sale" },
  { id: 103, name: "Soungoutou Magassa", position: "DEF", notes: "Expected to be sold. Young French defender.", status: "expected sale" },
  { id: 104, name: "Konstantinos Mavropanos", position: "CB", notes: "WHU want to keep him despite PL and German interest. ExWHUEmployee confirms club will only sell for a large offer. Status upgraded to likely staying. via ExWHU · July 17 2026.", status: "staying" },
  { id: 105, name: "Crysencio Summerville", position: "FWD", notes: "£40m release clause now confirmed per C&H — Man Utd primary suitor and deal looking increasingly close. WHU actively recruiting replacement (McNeil identified). Sale appears imminent. via C&H/TEAMtalk · July 5 2026.", status: "expected sale" },
  { id: 106, name: "Jean-Clair Todibo", position: "CB", notes: "Almost certain to leave per ExWHUEmployee — refused to play in final game vs Leeds, continued refusal in Colchester friendly. WHU want to sell, French clubs enquiring about loans. WHU may reluctantly accept loan if no buyer. One of only two certain departures. via ExWHU · July 17 2026.", status: "expected sale" },
  { id: 107, name: "Malick Diouf", position: "LB", notes: "On extended World Cup leave (Senegal). Growing expectation he will be sold. One season at WHU before likely exit. via C&H · July 2026.", status: "expected sale" },
  { id: 108, name: "Aaron Wan-Bissaka", position: "RB", notes: "Lazio bid of €10m rejected — WHU want €20m and described offer as insulting. Surplus to requirements under Nuno after failing to return from DR Congo World Cup celebrations. Walker-Peters now first choice. Background: Congolese FA/president blocked his return — WHU filed FIFA complaint. Fan opinion divided on blame. Lazio may return with improved offer. via C&H · July 19 2026.", status: "expected sale" },
  { id: 109, name: "Taty Castellanos", position: "FWD", notes: "Everton and Fulham want him; AC Milan also interested per Italian journalist Alberto Petrosilli. Signed only last January — WHU looking to recoup quickly.", status: "expected sale" },
  { id: 116, name: "Adama Traore", position: "FWD", notes: "Departure confirmed per C&H July 20 article — listed alongside Fernandes and Disasi as key departed players. Contract ended. via C&H · July 20 2026.", status: "sold" },
  { id: 117, name: "Niclas Fullkrug", position: "FWD", notes: "Scored vs Colchester United in pre-season. Featured in Southend friendly squad. In Nuno plans despite previously being expected to leave. Absence from Southend starting XI but in squad — still assessing. Not in original outgoings list but update confirms he is in contention. via C&H · July 2026.", status: "uncertain" },
  { id: 118, name: "Maxwel Cornet", position: "FWD", notes: "Scored vs Colchester United in pre-season alongside Fullkrug. Featured in squad. Appears to be in Nuno plans. Previously expected departure. Currently staying unless offer arrives. via C&H · July 2026.", status: "uncertain" },
  { id: 110, name: "Callum Wilson", position: "FWD", notes: "Left as a free agent after contract expiry. Likely headed to Brentford. Had been offered a contract extension but reportedly declined.", status: "sold" },
  { id: 111, name: "Axel Disasi", position: "CB", notes: "Returned to Chelsea after loan. BUT ExWHUEmployee confirms WHU made intentions very clear — want to sign him permanently. Top target for CB position. Will have other offers but WHU are keen. via ExWHU · July 17 2026.", status: "staying" },
  { id: 112, name: "James Ward-Prowse", position: "MID", notes: "Not a single offer received per C&H source. Featured in both pre-season friendlies — Nuno including him despite previous fallout at Nottingham Forest. Source says could definitely stay if no bids arrive. Useful Championship asset. WHU would sell if offer comes but not holding breath. via C&H · July 19 2026.", status: "uncertain" },
  { id: 113, name: "Keiber La Madrid", position: "MID", notes: "Young Venezuelan midfielder. Previously listed as likely departure — signed a new long-term deal. U-turn on his future.", status: "staying" },
];

const INITIAL_ACADEMY = [
  { id: 201, name: "Freddie Potts", age: 22, position: "DM", notes: "Son of Steve Potts. 24 appearances this season (1,429 mins). PL debut vs Brighton Aug 2025. Red card vs Burton hurt him — hooked at HT in FA Cup vs Leeds too. Contracted to 2029. Championship could be his breakout or a loan beckons.", status: "first team fringe" },
  { id: 202, name: "Finlay Herrick", age: 20, position: "GK", notes: "FA Cup QF debut vs Leeds — came off bench after Areola injury, saved a penalty in shootout. Boreham Wood loan cut short last season. Nuno: 'young GK with talent, we have a project to help him.'  Areola expected to depart — Herrick would be Hermansen understudy. Loan interest noted but WHU may keep him. Highly thought of by Nuno. via Roshane Thomas/The Athletic · July 17 2026.", status: "breakthrough ready" },
  { id: 203, name: "Ezra Mayers", age: 19, position: "CB", notes: "West Ham Young Player of the Year 2024/25. Contract extension signed. Six PL substitute appearances — great temperament. England U19. Good enough to be part of Nuno's plans per Roshane. Left-footed CB/LB. via Roshane Thomas/The Athletic · July 17 2026.", status: "breakthrough ready" },
  { id: 204, name: "Preston Fearon", age: 18, position: "MID", notes: "PL Scholar of the Year 2024/25. Released by Chelsea at U14, joined WHU at 15. Bowen called him 'special', Noble says 'go right to the top'. Cream of the crop. Koppen giving youngsters two weeks to impress in pre-season before loan decisions made. via Roshane Thomas/The Athletic · July 17 2026.", status: "brightest prospect" },
  { id: 205, name: "Airidas Golambeckis", age: 18, position: "CB", notes: "Born Nov 2007. England U18/U19 international. U21s captain. If Kaelan Casey goes on loan again, Golambeckis likely remains with U21s rather than stepping up. Still raw — one for next wave. via Roshane Thomas/The Athletic · July 17 2026.", status: "one to watch" },
  { id: 206, name: "Callum Marshall", age: 21, position: "FWD", notes: "EXPECTED TO BE SOLD per Roshane/The Athletic. Final year of deal, does not feature in Nuno's plans. Bochum loan underwhelmed. Featured in Colchester friendly first half. NI full international. PL debut vs Arsenal Oct 2025. WHU looking to sell this summer. via Roshane Thomas/The Athletic · July 17 2026.", status: "loan expected" },
  { id: 209, name: "Mohamadou Kante", age: 20, position: "MID", notes: "The standout academy prospect. Patrick Vieira comparison from U21 manager Mark Robson. 14 first-team appearances. Ligue 1 interest from Marseille, Monaco and Lyon per Roshane Thomas/The Athletic — serious clubs, serious interest. Nuno wants to keep him, 5 years on contract. Key retention priority this window. via Roshane Thomas/The Athletic · July 17 2026.", status: "first team fringe" },
  { id: 210, name: "George Earthy", age: 21, position: "MID", notes: "21 y/o attacking midfielder. Final year of deal — important juncture of career. 2 starts and 8 sub appearances on loan at Bristol City (Championship) last season. Played No.10 alongside Bowen vs Colchester for 45 mins in wing-back system. Nuno assessing. Must impress in next two weeks per Koppen ultimatum. via Roshane Thomas/The Athletic · July 17 2026.", status: "first team fringe" },
  { id: 211, name: "Lewis Orford", age: 20, position: "MID", notes: "Could have opening in squad — Alvarez expected to leave, Soucek ankle injury (prolonged spell out), Ward-Prowse frosty Nuno relationship. Loan at Stevenage cut short last season (1 appearance). PL debut vs Crystal Palace Jan 2025 under Graham Potter. Invited to train with England first team by Tuchel. Potential surprise package. via Roshane Thomas/The Athletic · July 17 2026.", status: "breakthrough ready" },
  { id: 212, name: "Joshua Ajala", age: 19, position: "FWD", notes: "7 goals in 14 PL2 appearances last season. Contract extended to 2028. England U20. Unused sub vs Burton and Leeds FA Cup. Featured vs Colchester. Nuno continuing to assess. Told official site: 'I want to make sure I'm scoring goals whether that's here with the first team or out on loan.' via Roshane Thomas/The Athletic · July 17 2026.", status: "one to watch" },
  { id: 213, name: "Kaelan Casey", age: 21, position: "CB", notes: "Final year of deal. Championship loan at Swansea + League One at Leyton Orient last season (16 apps). 3 first-team WHU appearances. Could loan again — if he does, Golambeckis stays with U21s. via Roshane Thomas/The Athletic · July 17 2026.", status: "loan expected" },
  { id: 208, name: "Liam Earthy", age: 19, position: "MID", notes: "Made the squad for first pre-season friendly vs Southend United — notable inclusion alongside senior players. Todibo and Fullkrug absent. Young midfielder making his case for involvement this season. via TWHW · July 18 2026.", status: "breakthrough ready" },
  { id: 207, name: "Daniel Cummings", age: 19, position: "FWD", notes: "Joined from Celtic July 2025 (29 goals in 37 apps for Celtic B in 2024/25, incl. UCL). Spent first months recovering from shoulder injury. 6 goals in 2026 incl. vs Borussia Dortmund. Scotland U19. Expected to go on loan next season per Standard Sport.", status: "loan expected" },
];

const IN_STATUS_CONFIG = {
  "imminent":     { label: "Imminent",     color: "#00c853", bg: "rgba(0,200,83,0.15)" },
  "frontrunner":  { label: "Frontrunner",  color: "#00b0ff", bg: "rgba(0,176,255,0.15)" },
  "bid rejected": { label: "Bid Rejected", color: "#ff5252", bg: "rgba(255,82,82,0.15)" },
  "inquired":     { label: "Inquired",     color: "#ffab40", bg: "rgba(255,171,64,0.15)" },
  "interested":   { label: "Interested",   color: "#ce93d8", bg: "rgba(206,147,216,0.15)" },
  "monitoring":   { label: "Monitoring",   color: "#90a4ae", bg: "rgba(144,164,174,0.15)" },
  "signed":       { label: "Signed ✓",     color: "#b9f6ca", bg: "rgba(185,246,202,0.2)" },
  "dropped":      { label: "Dropped",      color: "#546e7a", bg: "rgba(84,110,122,0.15)" },
};

const OUT_STATUS_CONFIG = {
  "expected sale": { label: "Expected Sale", color: "#ff5252", bg: "rgba(255,82,82,0.15)" },
  "likely exit":   { label: "Likely Exit",   color: "#ffab40", bg: "rgba(255,171,64,0.15)" },
  "sold":          { label: "Sold ✓",        color: "#546e7a", bg: "rgba(84,110,122,0.2)" },
  "staying":       { label: "Staying",       color: "#00c853", bg: "rgba(0,200,83,0.15)" },
  "uncertain":     { label: "Uncertain",     color: "#90a4ae", bg: "rgba(144,164,174,0.15)" },
};

const ACAD_STATUS_CONFIG = {
  "brightest prospect":  { label: "Brightest Prospect", color: "#ffd740", bg: "rgba(255,215,64,0.15)" },
  "breakthrough ready":  { label: "Breakthrough Ready", color: "#00c853", bg: "rgba(0,200,83,0.15)" },
  "first team fringe":   { label: "1st Team Fringe",    color: "#00b0ff", bg: "rgba(0,176,255,0.15)" },
  "returning loanee":    { label: "Returning Loanee",   color: "#ce93d8", bg: "rgba(206,147,216,0.15)" },
  "loan expected":       { label: "Loan Expected",      color: "#ffab40", bg: "rgba(255,171,64,0.15)" },
  "one to watch":        { label: "One to Watch",       color: "#90a4ae", bg: "rgba(144,164,174,0.15)" },
};

const TAB_CONFIG = {
  in:   { label: "Incomings",      statusConfig: IN_STATUS_CONFIG,   storageKey: "whu-incoming-v27",  initial: INITIAL_INCOMING },
  out:  { label: "Outgoings",      statusConfig: OUT_STATUS_CONFIG,  storageKey: "whu-outgoing-v27",  initial: INITIAL_OUTGOING },
  acad: { label: "Academy Watch", statusConfig: ACAD_STATUS_CONFIG, storageKey: "whu-academy-v27",   initial: INITIAL_ACADEMY },
};

function Badge({ label, color, bg }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: "20px", fontSize: "10px",
      background: bg, color, border: `1px solid ${color}40`,
      fontFamily: "sans-serif", fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function ConfidenceBar({ score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
      <span style={{ fontSize: "9px", color: "#4a5a62", fontFamily: "monospace", letterSpacing: "0.08em", flexShrink: 0 }}>CONF</span>
      <div style={{ flex: 1, height: "3px", background: "#1e2428", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: "#e8a020", borderRadius: "2px", transition: "width 0.3s" }}/>
      </div>
      <span style={{ fontSize: "10px", color: "#e8a020", fontFamily: "monospace", fontWeight: 700, flexShrink: 0, minWidth: "24px", textAlign: "right" }}>{score}</span>
    </div>
  );
}

function SourceAttribution({ sources }) {
  if (!sources || sources.length === 0) return null;
  const topTier = Math.min(...sources.map(s => {
    const j = JOURNALIST_TIERS[s.journalist] || JOURNALIST_TIERS[s.outlet] || { tier: 3 };
    return j.tier;
  }));
  const tierColor = topTier === 1 ? "#00c853" : topTier === 2 ? "#00b0ff" : "#90a4ae";
  return (
    <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
      {sources.map((s, i) => {
        const j = JOURNALIST_TIERS[s.journalist] || JOURNALIST_TIERS[s.outlet] || { tier: 3, score: 8 };
        const c = j.tier === 1 ? "#00c853" : j.tier === 2 ? "#00b0ff" : "#556e7a";
        return (
          <span key={i} title={s.claim} style={{
            padding: "1px 6px", borderRadius: "3px", fontSize: "9px",
            background: `${c}15`, color: c, border: `1px solid ${c}30`,
            fontFamily: "monospace", cursor: "help", flexShrink: 0,
          }}>
            T{j.tier} · {s.journalist} · {s.date?.slice(5)}
          </span>
        );
      })}
    </div>
  );
}

function PlayerCard({ p, statusConfig, onEdit }) {
  const sc = statusConfig[p.status] || Object.values(statusConfig)[0];
  const hasPriorHistory = p.prior_windows && p.prior_windows.length > 0;
  const confidence = calculateConfidence(p);
  const showConfidence = !["signed","sold","dropped","staying"].includes(p.status);
  return (
    <div style={{
      background: "#111619", border: "1px solid #1e2428",
      borderLeft: `3px solid ${sc.color}`, borderRadius: "6px", padding: "12px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        {p.position && (
          <span style={{
            padding: "2px 7px", borderRadius: "3px", fontSize: "10px",
            background: "#1e2428", color: "#8a9aa0",
            fontFamily: "monospace", fontWeight: 700, flexShrink: 0, marginTop: "3px",
          }}>{p.position}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#f0e8e0" }}>{p.name}</span>
            {p.age && <span style={{ fontSize: "11px", color: "#556e7a", fontFamily: "sans-serif" }}>age {p.age}</span>}
            {p.club && <span style={{ fontSize: "12px", color: "#7a8a90", fontFamily: "sans-serif" }}>{p.club}</span>}
            {p.fee && p.fee !== "TBD" && (
              <span style={{ fontSize: "11px", color: "#c8a060", fontFamily: "monospace" }}>{p.fee}</span>
            )}
            <Badge label={sc.label} color={sc.color} bg={sc.bg} />
            {hasPriorHistory && (
              <span title={`Prior interest: ${p.prior_windows.map(w => w.window).join(", ")}`} style={{
                padding: "2px 7px", borderRadius: "20px", fontSize: "10px",
                background: "rgba(255,171,64,0.12)", color: "#ffab40",
                border: "1px solid rgba(255,171,64,0.3)",
                fontFamily: "sans-serif", fontWeight: 700, flexShrink: 0, cursor: "help",
              }}>🔁 Recurring</span>
            )}
          </div>

          {showConfidence && <ConfidenceBar score={confidence} />}

          {hasPriorHistory && (
            <div style={{ marginBottom: "6px" }}>
              {p.prior_windows.map((pw, i) => (
                <div key={i} style={{
                  fontSize: "10px", color: "#7a6a40", fontFamily: "monospace",
                  background: "rgba(255,171,64,0.06)", borderLeft: "2px solid rgba(255,171,64,0.3)",
                  padding: "3px 8px", marginBottom: "2px", borderRadius: "0 3px 3px 0",
                }}>
                  ↩ {pw.window.replace(/_/g, " ")} · {pw.peak_status} · {pw.outcome.replace(/_/g, " ")}
                  {pw.fee_reported && ` · ${pw.fee_reported}`}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <p style={{ margin: 0, fontSize: "12px", color: "#7a8a8e", fontFamily: "sans-serif", lineHeight: 1.5 }}>{p.notes}</p>
            <button onClick={() => onEdit(p)} style={{
              flexShrink: 0, padding: "3px 8px", background: "transparent",
              border: "1px solid #2e3840", color: "#667", borderRadius: "4px",
              cursor: "pointer", fontFamily: "sans-serif", fontSize: "11px",
            }}>Edit</button>
          </div>

          <SourceAttribution sources={p.sources} />
        </div>
      </div>
    </div>
  );
}

function AddPlayerModal({ tab, statusConfig, onSave, onClose }) {
  const isAcad = tab === "acad";
  const isOut = tab === "out";
  const [form, setForm] = useState({
    name: "", position: "", club: "", fee: "TBD", age: "", notes: "",
    status: Object.keys(statusConfig)[0],
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#111619", border: "1px solid #2e3840", borderRadius: "8px", padding: "20px", width: "100%", maxWidth: "500px" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#f0e8e0", marginBottom: "14px" }}>Add Player</div>
        {[
          { label: "Name *", key: "name" },
          { label: "Position", key: "position" },
          ...(!isOut ? [{ label: "Club", key: "club" }] : []),
          ...(!isOut && !isAcad ? [{ label: "Fee", key: "fee" }] : []),
          ...(isAcad ? [{ label: "Age", key: "age" }] : []),
        ].map(({ label, key }) => (
          <div key={key} style={{ marginBottom: "8px" }}>
            <div style={{ fontSize: "11px", color: "#667", fontFamily: "sans-serif", marginBottom: "3px" }}>{label}</div>
            <input value={form[key]} onChange={e => set(key, e.target.value)}
              style={{ width: "100%", background: "#0d1215", border: "1px solid #2e3840", color: "#c8d0d8", borderRadius: "4px", padding: "6px 8px", fontFamily: "sans-serif", fontSize: "12px", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontSize: "11px", color: "#667", fontFamily: "sans-serif", marginBottom: "3px" }}>Notes</div>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={3}
            style={{ width: "100%", background: "#0d1215", border: "1px solid #2e3840", color: "#c8d0d8", borderRadius: "4px", padding: "6px 8px", fontFamily: "sans-serif", fontSize: "12px", resize: "vertical", boxSizing: "border-box" }} />
        </div>
        <div style={{ fontSize: "11px", color: "#667", fontFamily: "sans-serif", marginBottom: "6px" }}>Status</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {Object.entries(statusConfig).map(([key, val]) => (
            <button key={key} onClick={() => set("status", key)} style={{
              padding: "4px 10px", borderRadius: "4px", fontSize: "11px",
              background: form.status === key ? val.color : val.bg,
              color: form.status === key ? "#0a0d0f" : val.color,
              border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
            }}>{val.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => form.name.trim() && onSave(form)} style={{
            padding: "6px 16px", background: "#9b2335", color: "#fff",
            border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "sans-serif", fontSize: "12px", fontWeight: 700,
          }}>Add</button>
          <button onClick={onClose} style={{
            padding: "6px 16px", background: "#1e2428", color: "#8a9aa0",
            border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "sans-serif", fontSize: "12px",
          }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ player, statusConfig, onSave, onClose }) {
  const [notes, setNotes] = useState(player.notes);
  const [status, setStatus] = useState(player.status);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "#111619", border: "1px solid #2e3840", borderRadius: "8px", padding: "20px", width: "100%", maxWidth: "500px" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#f0e8e0", marginBottom: "12px" }}>{player.name}</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
          style={{ width: "100%", background: "#0d1215", border: "1px solid #2e3840", color: "#c8d0d8", borderRadius: "4px", padding: "8px", fontFamily: "sans-serif", fontSize: "12px", resize: "vertical", boxSizing: "border-box", marginBottom: "10px" }} />
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {Object.entries(statusConfig).map(([key, val]) => (
            <button key={key} onClick={() => setStatus(key)} style={{
              padding: "4px 10px", borderRadius: "4px", fontSize: "11px",
              background: status === key ? val.color : val.bg,
              color: status === key ? "#0a0d0f" : val.color,
              border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700,
            }}>{val.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => onSave(notes, status)} style={{ padding: "6px 16px", background: "#9b2335", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "sans-serif", fontSize: "12px", fontWeight: 700 }}>Save</button>
          <button onClick={onClose} style={{ padding: "6px 16px", background: "#1e2428", color: "#8a9aa0", border: "none", borderRadius: "4px", cursor: "pointer", fontFamily: "sans-serif", fontSize: "12px" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("in");
  const [data, setData] = useState({ in: INITIAL_INCOMING, out: INITIAL_OUTGOING, acad: INITIAL_ACADEMY });
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingTab, setEditingTab] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      const newData = { ...data };
      for (const [key, cfg] of Object.entries(TAB_CONFIG)) {
        try {
          const res = await window.storage.get(cfg.storageKey);
          if (res?.value) newData[key] = JSON.parse(res.value);
        } catch {}
      }
      setData(newData);
    }
    load();
  }, []);

  useEffect(() => { setFilter("all"); }, [tab]);

  async function persist(tabKey, updated) {
    try {
      await window.storage.set(TAB_CONFIG[tabKey].storageKey, JSON.stringify(updated));
      setSaveMsg("Saved ✓");
      setTimeout(() => setSaveMsg(""), 1500);
    } catch {}
  }

  async function handleSaveEdit(notes, status) {
    const updated = data[editingTab].map(p =>
      p.id === editingPlayer.id ? { ...p, notes, status } : p
    );
    const newData = { ...data, [editingTab]: updated };
    setData(newData);
    await persist(editingTab, updated);
    setEditingPlayer(null);
  }

  async function handleAdd(form) {
    const maxId = Math.max(0, ...data[tab].map(p => p.id));
    const newPlayer = {
      id: maxId + 1,
      name: form.name.trim(),
      position: form.position.trim(),
      notes: form.notes.trim(),
      status: form.status,
      ...(tab !== "out" && { club: form.club.trim() }),
      ...(tab !== "out" && tab !== "acad" && { fee: form.fee.trim() || "TBD" }),
      ...(tab === "acad" && { age: form.age ? parseInt(form.age) : undefined }),
    };
    const updated = [...data[tab], newPlayer];
    const newData = { ...data, [tab]: updated };
    setData(newData);
    await persist(tab, updated);
    setAdding(false);
  }

  const cfg = TAB_CONFIG[tab];
  const players = data[tab];
  const counts = {};
  players.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
  const filtered = filter === "all" ? players : players.filter(p => p.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d0f", fontFamily: "'Georgia', serif", color: "#e8e0d8" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #7d1a2a 0%, #4a0e18 60%, #1a0508 100%)",
        padding: "20px 20px 0",
        borderBottom: "2px solid #9b2335",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <span style={{ fontSize: "24px" }}>⚒️</span>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#c87080", fontFamily: "sans-serif", fontWeight: 600 }}>West Ham United</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f5ece8" }}>Transfer Tracker — Summer 2026</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
            {saveMsg && <span style={{ fontSize: "11px", color: "#00c853", fontFamily: "sans-serif" }}>{saveMsg}</span>}
            <button onClick={() => setAdding(true)} style={{
              padding: "5px 12px", background: "#9b2335", color: "#fff",
              border: "none", borderRadius: "4px", cursor: "pointer",
              fontFamily: "sans-serif", fontSize: "11px", fontWeight: 700,
            }}>+ Add</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          {Object.entries(TAB_CONFIG).map(([key, tc]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "8px 16px",
              background: tab === key ? "#0a0d0f" : "transparent",
              color: tab === key ? "#f0e8e0" : "#c87080",
              border: "none", borderRadius: "6px 6px 0 0", cursor: "pointer",
              fontFamily: "sans-serif", fontSize: "12px", fontWeight: 700,
              borderBottom: tab === key ? "2px solid #0a0d0f" : "2px solid transparent",
              marginBottom: tab === key ? "-2px" : "0",
            }}>{tc.label} ({data[key].length})</button>
          ))}
        </div>
      </div>

      {/* Status filter bar */}
      <div style={{ padding: "10px 20px", display: "flex", gap: "6px", flexWrap: "wrap", borderBottom: "1px solid #1e2428", background: "#0d1215" }}>
        <button onClick={() => setFilter("all")} style={{
          padding: "2px 10px", borderRadius: "20px", fontSize: "11px", cursor: "pointer",
          background: filter === "all" ? "#9b2335" : "#1e2428",
          color: filter === "all" ? "#fff" : "#8a9aa0",
          border: filter === "all" ? "1px solid #9b2335" : "1px solid #2e3840",
          fontFamily: "sans-serif", fontWeight: 600,
        }}>All · {players.length}</button>
        {Object.entries(cfg.statusConfig).map(([s, val]) =>
          counts[s] ? (
            <button key={s} onClick={() => setFilter(f => f === s ? "all" : s)} style={{
              padding: "2px 10px", borderRadius: "20px", fontSize: "11px", cursor: "pointer",
              background: filter === s ? val.color : val.bg,
              color: filter === s ? "#0a0d0f" : val.color,
              border: `1px solid ${val.color}40`,
              fontFamily: "sans-serif", fontWeight: 600,
            }}>{val.label} · {counts[s]}</button>
          ) : null
        )}
      </div>

      {/* Player list */}
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", color: "#445", fontFamily: "sans-serif", fontSize: "13px", padding: "32px" }}>No players in this category</div>
        )}
        {filtered.map(p => (
          <PlayerCard key={p.id} p={p} statusConfig={cfg.statusConfig}
            onEdit={pl => { setEditingPlayer(pl); setEditingTab(tab); }} />
        ))}
      </div>

      <div style={{ padding: "4px 20px 24px", fontSize: "11px", color: "#334", fontFamily: "sans-serif", textAlign: "center" }}>
        Hammers News · Claret & Hugh · WHUFC.com · June 2026 · Edits persist across sessions
      </div>

      {editingPlayer && (
        <EditModal player={editingPlayer} statusConfig={TAB_CONFIG[editingTab].statusConfig}
          onSave={handleSaveEdit} onClose={() => setEditingPlayer(null)} />
      )}
      {adding && (
        <AddPlayerModal tab={tab} statusConfig={cfg.statusConfig}
          onSave={handleAdd} onClose={() => setAdding(false)} />
      )}
    </div>
  );
}
