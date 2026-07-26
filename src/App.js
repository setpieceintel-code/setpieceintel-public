import React, { useState, useEffect } from "react";

// ── INLINE CLUB DATA ─────────────────────────────────────────────────────────
// All club data lives here until we move to separate files
// Add new clubs to the CLUBS array below

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



// ── STATUS CONFIGS ────────────────────────────────────────────────────────────
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

// ── WEST HAM DATA ─────────────────────────────────────────────────────────────
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



// ── ARSENAL DATA ──────────────────────────────────────────────────────────────
const ARSENAL_INCOMINGS = [
  { id: 1001, name: "Christos Tzolis", club: "Club Brugge", position: "MID/FWD", fee: "£34m", notes: "AGREED — Arsenal met Club Brugge's £34m asking price. Greek international left winger, 24. Replaces Trossard who joined Besiktas. via James McNicholas/The Athletic · July 21 2026.", status: "frontrunner", sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Arsenal agreed fee with Club Brugge for Tzolis at £34m" }] },
  { id: 1002, name: "Bruno Guimaraes", club: "Newcastle United", position: "MID", fee: "£77-100m", notes: "Primary midfield target. Newcastle insist not for sale but Guimaraes communicated desire to join champions. Arsenal have clear internal valuation — will only proceed within those parameters. via The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Arsenal maintain interest in Guimaraes, clear valuation, only proceed within those parameters" }] },
  { id: 1003, name: "Ezri Konsa", club: "Aston Villa", position: "CB", fee: "TBD", notes: "CB target following Saliba fitness concerns. England international. Significant valuation gap between Arsenal and Villa. via The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Konsa a target but significant valuation gap with Villa" }] },
  { id: 1004, name: "Bradley Barcola", club: "Paris Saint-Germain", position: "MID/FWD", fee: "£100m+", notes: "On sporting director Berta radar but PSG reluctant to sell, value in excess of £100m. Long shot. via The Athletic · July 21 2026.", status: "monitoring", sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Barcola on Arsenal radar but PSG reluctant to sell at £100m+" }] },
  { id: 1005, name: "Morgan Rogers", club: "Aston Villa", position: "MID/FWD", fee: "£117m", notes: "DROPPED — Primary target all summer. Arsenal capped valuation at £80m. Villa demanded £116m+. Chelsea met fee in 48 hours, Arsenal declined to match. Major miss. via The Athletic · July 21 2026.", status: "dropped", sources: [{ journalist: "James McNicholas", outlet: "The Athletic", date: "2026-07-21", claim: "Arsenal did not want to go beyond £80m — Chelsea met Villa demands, Arsenal declined" }] },
];

const ARSENAL_OUTGOINGS = [
  { id: 1101, name: "Leandro Trossard", position: "MID/FWD", notes: "SOLD to Besiktas for €20m. Replaced by Tzolis.", status: "sold" },
  { id: 1102, name: "Gabriel Jesus", position: "FWD", notes: "Arsenal looking to sell. Among players hoping to offload this summer. via The Athletic · July 21 2026.", status: "expected sale" },
  { id: 1103, name: "Reiss Nelson", position: "MID/FWD", notes: "Arsenal looking to sell. On list of hoped departures. via The Athletic · July 21 2026.", status: "expected sale" },
];

const ARSENAL_ACADEMY = [
  { id: 1201, name: "Myles Lewis-Skelly", age: 19, position: "LB/MID", notes: "Breakthrough talent. Featured regularly for Arteta. England youth international.", status: "breakthrough ready" },
];

// ── CHELSEA DATA ──────────────────────────────────────────────────────────────
const CHELSEA_INCOMINGS = [
  { id: 2001, name: "Morgan Rogers", club: "Aston Villa", position: "MID/FWD", fee: "£117m", notes: "SIGNED — Chelsea club record. Deal wrapped in 48 hours. Six-year contract. via Simon Johnson/The Athletic · July 21 2026.", status: "signed", sources: [{ journalist: "Simon Johnson", outlet: "The Athletic", date: "2026-07-21", claim: "Chelsea agreed £117m fee with Villa for Rogers — new club record" }] },
  { id: 2002, name: "Valentin Barco", club: "Strasbourg", position: "LB/MID", fee: "TBD", notes: "Close to confirming. Argentine, away with Argentina at WC. Sources in France confirm heading to Stamford Bridge. via The Athletic · July 21 2026.", status: "frontrunner", sources: [{ journalist: "Simon Johnson", outlet: "The Athletic", date: "2026-07-21", claim: "Chelsea close to confirming Barco — French sources confirm Stamford Bridge bound" }] },
  { id: 2003, name: "Maxence Lacroix", club: "Crystal Palace", position: "CB", fee: "TBD", notes: "Official enquiry made. One of several CB targets. Chelsea valuation below reported £55m. via The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "Simon Johnson", outlet: "The Athletic", date: "2026-07-21", claim: "Chelsea made official enquiry for Lacroix, valuation below £55m" }] },
  { id: 2004, name: "John Stones", club: "Free Agent (ex-Man City)", position: "CB", fee: "Free", notes: "Added to CB list. Free agent, 32. Impressed for England at WC — played 5 of 8 matches. via The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "Simon Johnson", outlet: "The Athletic", date: "2026-07-21", claim: "Chelsea added Stones to CB list — free agent after City contract expiry" }] },
];

const CHELSEA_OUTGOINGS = [
  { id: 2101, name: "Nicolas Jackson", position: "FWD", notes: "Chelsea want £65m. Joao Pedro first choice — Jackson's path to starts limited. Aston Villa and others interested. via The Athletic · July 21 2026.", status: "expected sale" },
  { id: 2102, name: "Alejandro Garnacho", position: "MID/FWD", notes: "€50m asking price. Wants to leave for more game time. Villa, one PL club, two Serie A clubs interested. via The Athletic · July 21 2026.", status: "expected sale" },
  { id: 2103, name: "Enzo Fernandez", position: "MID", notes: "Available for £120m. Chelsea prepared to sell if met. via The Athletic · July 21 2026.", status: "expected sale" },
  { id: 2104, name: "Axel Disasi", position: "CB", notes: "Confirmed available per The Athletic. Also of interest to West Ham. via Simon Johnson/The Athletic · July 21 2026.", status: "expected sale" },
  { id: 2105, name: "Liam Delap", position: "FWD", notes: "Only 3 goals after £30m switch from Ipswich. Lot of PL interest. via The Athletic · July 21 2026.", status: "expected sale" },
];

const CHELSEA_ACADEMY = [
  { id: 2201, name: "Shumaira Mheuka", age: 18, position: "FWD", notes: "PL2 Player of Season — 18 goals in 19 apps. Contract talks before loan. via The Athletic · July 21 2026.", status: "loan expected" },
];

// ── MAN UTD DATA ──────────────────────────────────────────────────────────────
const MANUTD_INCOMINGS = [
  { id: 3001, name: "Youri Tielemans", club: "Aston Villa", position: "MID", fee: "£35m", notes: "SIGNED — Triggered release clause. Belgian international, 29, five-year deal. via The Athletic · July 21 2026.", status: "signed", sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "United completed £35m Tielemans transfer — triggered release clause in Villa contract" }] },
  { id: 3002, name: "Tynan Thompson", club: "Tottenham", position: "MID/FWD", fee: "£4m (rising to £8m)", notes: "SIGNED — 18 y/o left winger. Emerging talent drive. Goes into first team training. via The Athletic · July 21 2026.", status: "signed", sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "United signed Thompson from Spurs for initial £4m — emerging talent drive" }] },
  { id: 3003, name: "Manu Kone", club: "AS Roma", position: "MID", fee: "TBD", notes: "Discussed but budgetary concerns. Not certain United would commit finance required. via The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "Kone discussed at Man United but budgetary concerns remain" }] },
];

const MANUTD_OUTGOINGS = [
  { id: 3101, name: "Marcus Rashford", position: "MID/FWD", notes: "Exit clause expired. Plan to reintegrate post-WC break. Carrick managed him previously — different dynamic to Amorim. Will assess on return. via The Athletic · July 21 2026.", status: "uncertain" },
  { id: 3102, name: "Mason Greenwood", position: "MID/FWD", notes: "SOLD to Fenerbahce from Marseille for €39m. United receive ~€13m via sell-on clause. via The Athletic · July 21 2026.", status: "sold" },
];

const MANUTD_ACADEMY = [
  { id: 3201, name: "Toby Collyer", age: 20, position: "MID", notes: "Making push for first team. Loan to Championship or League One likely.", status: "loan expected" },
];

// ── LIVERPOOL DATA ─────────────────────────────────────────────────────────────
const LIVERPOOL_INCOMINGS = [
  { id: 4001, name: "Victor Munoz", club: "Unknown", position: "MID/FWD", fee: "TBD", notes: "SIGNED — World Cup winner. Good addition per Iraola but more forwards needed given Ekitike Achilles injury. via The Athletic · July 21 2026.", status: "signed", sources: [{ journalist: "James Pearce", outlet: "The Athletic", date: "2026-07-21", claim: "Liverpool signed World Cup winner Victor Munoz" }] },
  { id: 4002, name: "Bradley Barcola", club: "Paris Saint-Germain", position: "MID/FWD", fee: "£100m+", notes: "Player Liverpool would love to add as Salah replacement. PSG reluctant to sell. Other options under consideration. via The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "Gregg Evans", outlet: "The Athletic", date: "2026-07-21", claim: "Barcola player Liverpool would love — PSG reluctant to sell, monitoring alternatives" }] },
];

const LIVERPOOL_OUTGOINGS = [
  { id: 4101, name: "Mohamed Salah", position: "MID/FWD", notes: "DEPARTED — Primary reason for urgent wide reinforcement this summer.", status: "sold" },
  { id: 4102, name: "Curtis Jones", position: "MID", notes: "Inter retain strong interest — second bid ~€25m rejected. Contract ends next summer. Decision needed. via The Athletic · July 21 2026.", status: "uncertain" },
  { id: 4103, name: "Federico Chiesa", position: "MID/FWD", notes: "Expected to leave. Hinges on future incomings. via The Athletic · July 21 2026.", status: "likely exit" },
];

const LIVERPOOL_ACADEMY = [
  { id: 4201, name: "James McConnell", age: 20, position: "MID", notes: "Included in US pre-season tour. Loan offers to be listened to later in window.", status: "loan expected" },
];


// ── MAN CITY DATA ─────────────────────────────────────────────────────────────
const MANCITY_INCOMINGS = [
  { id: 5001, name: "Elliot Anderson", club: "Nottingham Forest", position: "MID", fee: "£116m", notes: "SIGNED — Club record. Deep-lying combative midfielder, very comfortable on ball. Replaces Bernardo Silva in City's pressing system. via David Ornstein/The Athletic · July 14 2026.", status: "signed", sources: [{ journalist: "David Ornstein", outlet: "The Athletic", date: "2026-07-14", claim: "City signed Elliot Anderson from Nottingham Forest for £116m" }] },
  { id: 5002, name: "Ayyoub Bouaddi", club: "Lille", position: "MID", fee: "~£85m", notes: "City pushing hard per Ornstein. 18 y/o Morocco midfielder — World Cup standout. Deep-lying combative style. Lille value at ~€100m. City, Arsenal, Man Utd all in contact with camp. City would integrate immediately rather than loan back. Decision expected soon. via David Ornstein/The Athletic · July 14 2026.", status: "frontrunner", sources: [{ journalist: "David Ornstein", outlet: "The Athletic", date: "2026-07-14", claim: "City pushing hard for Bouaddi ahead of him making a decision on his future" }] },
  { id: 5003, name: "Pierce Charles", club: "Sheffield Wednesday", position: "GK", fee: "£3m+", notes: "SIGNED — 20 y/o re-signed from academy. Loaned immediately to QPR. Planning for future GK role. via Sam Lee/The Athletic · July 7 2026.", status: "signed", sources: [{ journalist: "Sam Lee", outlet: "The Athletic", date: "2026-07-07", claim: "City re-signed Pierce Charles from Sheffield Wednesday, loaned to QPR" }] },
  { id: 5004, name: "Jeremy Monga", club: "Leicester City", position: "MID", fee: "£12.5m", notes: "SIGNED — 16 y/o England U19. Beat Arsenal in late move. Enzo Maresca driving force — knew player from Leicester days. Long-term investment. via Sam Lee/The Athletic · July 7 2026.", status: "signed", sources: [{ journalist: "Sam Lee", outlet: "The Athletic", date: "2026-07-07", claim: "City beat Arsenal to sign Monga from Leicester for £12.5m — Maresca drove deal" }] },
];

const MANCITY_OUTGOINGS = [
  { id: 5101, name: "Bernardo Silva", position: "MID", notes: "DEPARTED. Significant loss to City's midfield quality.", status: "sold" },
  { id: 5102, name: "John Stones", position: "CB", notes: "DEPARTED — Free agent after contract expired. Chelsea added him to their CB list.", status: "sold" },
  { id: 5103, name: "Nathan Ake", position: "CB", notes: "SOLD to Fenerbahce for £7m. via The Athletic · July 2026.", status: "sold" },
  { id: 5104, name: "Mateo Kovacic", position: "MID", notes: "Considered likely departure. Market options being explored. via Sam Lee/The Athletic.", status: "likely exit" },
  { id: 5105, name: "James Trafford", position: "GK", notes: "Primary Newcastle target. Two prior bids from Toon. Movement possible post-WC. City signed Pierce Charles as contingency. via The Athletic.", status: "likely exit" },
  { id: 5106, name: "Nico Gonzalez", position: "MID", notes: "Considered likely to go. January 2025 arrival yet to cement place. via Sam Lee/The Athletic.", status: "likely exit" },
  { id: 5107, name: "Savinho", position: "MID/FWD", notes: "Tottenham tracking for multiple windows. Could leave if right offer arrives. 22 y/o Brazilian. via The Athletic.", status: "likely exit" },
  { id: 5108, name: "Rodri", position: "MID", notes: "One year left on contract. No new deal signed yet. Named best player at 2026 World Cup. Further talks expected. Named best player at WC. Possible but not certain departure. via Sam Lee/The Athletic.", status: "uncertain" },
  { id: 5109, name: "Kalvin Phillips", position: "MID", notes: "Will be moved on if right options come along — not a direct replacement needed. via The Athletic.", status: "likely exit" },
  { id: 5110, name: "Jack Grealish", position: "MID/FWD", notes: "Will be moved on if right options come along. via The Athletic.", status: "likely exit" },
];

const MANCITY_ACADEMY = [
  { id: 5201, name: "Sverre Nypan", age: 19, position: "MID", notes: "Loaned to City Football Group sister club Lommel for development. via The Athletic.", status: "loan expected" },
];

// ── NEWCASTLE DATA ─────────────────────────────────────────────────────────────
const NEWCASTLE_INCOMINGS = [
  { id: 6001, name: "Bazoumana Toure", club: "Hoffenheim", position: "MID/FWD", fee: "up to €50m", notes: "SIGNED — 20 y/o Ivory Coast winger. Effectively Anthony Gordon replacement. Renowned for pace and crossing. Represents the young, hungry profile Newcastle are targeting. via Chris Waugh/The Athletic · July 7 2026.", status: "signed", sources: [{ journalist: "Chris Waugh", outlet: "The Athletic", date: "2026-07-07", claim: "Newcastle confirmed Toure signing from Hoffenheim — Gordon replacement on left wing" }] },
  { id: 6002, name: "Sean Steur", club: "Ajax", position: "MID", fee: "up to £23m", notes: "SIGNED — 18 y/o Dutch midfielder. No 6 or No 8. Part of first-team squad but needs physical development. Not a Tonali replacement — longer-term investment. via Chris Waugh/The Athletic · July 14 2026.", status: "signed", sources: [{ journalist: "Chris Waugh", outlet: "The Athletic", date: "2026-07-14", claim: "Newcastle confirmed Sean Steur signing from Ajax — up to £23m" }] },
  { id: 6003, name: "Ewen Jaouen", club: "Unknown", position: "GK", fee: "TBD", notes: "SIGNED — Young GK, third summer signing. Under-21 level, part of youth rebuild. via The Athletic.", status: "signed" },
  { id: 6004, name: "Lucas Bergvall", club: "Tottenham", position: "MID", fee: "~£60m", notes: "Newcastle bid £46m rejected by Spurs. Bergvall wants to leave — told Spurs he wants new challenge. Spurs holding out for ~£60m per Ornstein. UEFA 45-day rule means Newcastle have narrow window to complete without impacting Tonali profits. Forest also keen. via David Ornstein/The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "David Ornstein", outlet: "The Athletic", date: "2026-07-21", claim: "Newcastle bid £46m for Bergvall rejected — Spurs hold out for ~£60m, Bergvall wants to leave" }] },
  { id: 6005, name: "James Trafford", club: "Manchester City", position: "GK", fee: "TBD", notes: "Primary GK target — twice tried to sign him before. Movement possible post-WC. Cannot let Pope leave until replacement secured. Parma GK Zion Suzuki and Brighton GK Carl Rushworth also considered as alternatives. via The Athletic.", status: "frontrunner" },
  { id: 6006, name: "Danilo", club: "Botafogo", position: "MID", fee: "TBD", notes: "25 y/o Brazilian midfielder discussed internally. Ross Wilson knew player from Nottingham Forest days. Among alternatives to lost Manzambi target. via Chris Waugh/The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "Chris Waugh", outlet: "The Athletic", date: "2026-07-21", claim: "Botafogo midfielder Danilo among midfielders discussed at Newcastle" }] },
  { id: 6007, name: "Hugo Larsson", club: "Eintracht Frankfurt", position: "MID", fee: "TBD", notes: "22 y/o featured in internal conversations as Manzambi alternative. via The Athletic.", status: "monitoring" },
];

const NEWCASTLE_OUTGOINGS = [
  { id: 6101, name: "Sandro Tonali", position: "MID", notes: "SOLD to Tottenham for up to £100m. Newcastle held firm on asking price — Spurs met it in full. Finances transformed window options despite fan concern over selling to a rival. via Chris Waugh/The Athletic.", status: "sold" },
  { id: 6102, name: "Anthony Gordon", position: "MID/FWD", notes: "SOLD to Barcelona for up to €80m. No sell-on clause — Newcastle receive nothing from future sales. via The Athletic.", status: "sold" },
  { id: 6103, name: "Bruno Guimaraes", position: "MID", notes: "Newcastle insist NOT FOR SALE but Guimaraes communicated desire to join Arsenal. No formal Arsenal offer yet. Newcastle unsure how real the interest is. Club captain — losing him would be severe. via Chris Waugh/The Athletic · July 14 2026.", status: "uncertain", sources: [{ journalist: "Chris Waugh", outlet: "The Athletic", date: "2026-07-14", claim: "Guimaraes informed Newcastle of desire to join Arsenal — club insist not for sale" }] },
  { id: 6104, name: "Nick Pope", position: "GK", notes: "Expected to leave if new No1 arrives. No firm interest yet. 34 y/o. Newcastle cannot let him go until replacement signed. via The Athletic.", status: "likely exit" },
  { id: 6105, name: "Joe Willock", position: "MID", notes: "Available — final year of contract. No concrete offers yet. Would free up midfielder slot. via The Athletic.", status: "likely exit" },
  { id: 6106, name: "Jacob Murphy", position: "MID/FWD", notes: "Final 12 months of deal. Bids would be considered. via The Athletic.", status: "likely exit" },
];

const NEWCASTLE_ACADEMY = [
  { id: 6201, name: "Sean Neave", age: 19, position: "FWD", notes: "Scored vs Darlington in pre-season. Loan possible but won't be sanctioned until later — Howe needs numbers. via The Athletic.", status: "one to watch" },
  { id: 6202, name: "Afner Ca", age: 19, position: "FWD", notes: "Former Levante striker joined U21s. Guinea-Bissau international. Part of youth rebuild. via The Athletic.", status: "one to watch" },
];

// ── TOTTENHAM DATA ─────────────────────────────────────────────────────────────
const SPURS_INCOMINGS = [
  { id: 7001, name: "Mateus Fernandes", club: "West Ham United", position: "MID", fee: "£85m", notes: "SIGNED — Club record. WHU held out for guaranteed fee — Spurs met it. United were unwilling to guarantee the full amount. Portuguese midfielder, highly rated. via Roshane Thomas/The Athletic · July 7 2026.", status: "signed", sources: [{ journalist: "Roshane Thomas", outlet: "The Athletic", date: "2026-07-07", claim: "Spurs completed £85m signing of Mateus Fernandes from West Ham — club record" }] },
  { id: 7002, name: "Sandro Tonali", club: "Newcastle United", position: "MID", fee: "up to £100m", notes: "SIGNED — Another record-level deal. Newcastle insisted on full fee — Spurs paid it. 26 y/o Italian immediately upgrades the midfield. Surprising destination given Spurs finished 17th twice in a row. via The Athletic · July 7 2026.", status: "signed", sources: [{ journalist: "Jay Harris", outlet: "The Athletic", date: "2026-07-07", claim: "Spurs signed Tonali from Newcastle for up to £100m" }] },
  { id: 7003, name: "Andy Robertson", club: "Unknown", position: "LB", fee: "TBD", notes: "SIGNED — Experienced LB addition. Senior international. Part of defensive strengthening alongside Van Hecke and Senesi. via The Athletic.", status: "signed" },
  { id: 7004, name: "Jan Paul Van Hecke", club: "Unknown", position: "CB", fee: "TBD", notes: "SIGNED — CB addition strengthening defence. Dutch international. via The Athletic.", status: "signed" },
  { id: 7005, name: "Marcos Senesi", club: "Unknown", position: "CB", fee: "TBD", notes: "SIGNED — CB addition. Senior international. via The Athletic.", status: "signed" },
  { id: 7006, name: "Savinho", club: "Manchester City", position: "MID/FWD", fee: "TBD", notes: "Long-standing Spurs target tracked for multiple windows. Left winger priority. City have shown willingness to sell. Spurs tabled several bids last summer — could not close. 22 y/o Brazilian. via The Athletic.", status: "interested", sources: [{ journalist: "Elias Burke", outlet: "The Athletic", date: "2026-07-21", claim: "Tottenham remain interested in Savinho — tracked for multiple windows, left wing priority" }] },
];

const SPURS_OUTGOINGS = [
  { id: 7101, name: "Tynan Thompson", position: "MID/FWD", notes: "SOLD to Man United for £4m rising to £8m. 18 y/o left winger. Family circumstances drove move from London. Spurs retain sell-on clause and matching rights. via The Athletic.", status: "sold" },
  { id: 7102, name: "Luka Vuskovic", position: "CB", notes: "SOLD to Brighton for £50m. 19 y/o Croatia CB who never made competitive appearance for Spurs. Spurs retain 20% sell-on clause and matching rights. via The Athletic.", status: "sold" },
  { id: 7103, name: "Radu Dragusin", position: "CB", notes: "LOANED to Fiorentina — obligation to buy on appearances. 24 y/o Romania CB. Never comfortable with PL pace. via The Athletic.", status: "sold" },
  { id: 7104, name: "Lucas Bergvall", position: "MID", notes: "Wants to leave — told Spurs he wants new challenge. Out of favour under De Zerbi. Newcastle bid £46m rejected. Forest also keen. Spurs open to selling at ~£60m. 20 y/o Swede. via Elias Burke/The Athletic.", status: "likely exit", sources: [{ journalist: "Elias Burke", outlet: "The Athletic", date: "2026-07-21", claim: "Bergvall told Spurs he wants new challenge — Newcastle £46m bid rejected, Forest also keen" }] },
  { id: 7105, name: "Cristian Romero", position: "CB", notes: "Expected to depart. Started WC final for Argentina vs Spain before injury substitution in 70th min. via The Athletic.", status: "expected sale" },
  { id: 7106, name: "Guglielmo Vicario", position: "GK", notes: "Expected to leave after losing starting place to Kinsky. via The Athletic.", status: "likely exit" },
  { id: 7107, name: "Richarlison", position: "FWD", notes: "Spurs open to offers. Striker depth needed if he leaves. via The Athletic.", status: "likely exit" },
];

const SPURS_ACADEMY = [
  { id: 7201, name: "Mikey Moore", age: 18, position: "MID/FWD", notes: "Ended last season strongly at Rangers loan. Borussia Dortmund among loan admirers. Could move again on loan. Left wing depth issue without him. via The Athletic.", status: "loan expected" },
];

// ── ASTON VILLA DATA ───────────────────────────────────────────────────────────
const VILLA_INCOMINGS = [
  { id: 8001, name: "Johan Manzambi", club: "Freiburg", position: "MID", fee: "TBD", notes: "SIGNED — Club record. 20 y/o Swiss WC star — 2 goals, 3 assists in 4 games. Gazumped Newcastle who had done extensive groundwork including face-to-face meetings. Regarded as direct Rogers replacement. via Jacob Tanswell/The Athletic · July 21 2026.", status: "signed", sources: [{ journalist: "Jacob Tanswell", outlet: "The Athletic", date: "2026-07-21", claim: "Villa signed Manzambi from Freiburg, gazumping Newcastle who had agreed framework of deal" }] },
  { id: 8002, name: "Youri Tielemans", club: "Aston Villa", position: "MID", fee: "N/A", notes: "DEPARTED — Man Utd triggered £35m release clause. Villa had no desire to sell and offered new terms but could not prevent exit. via The Athletic.", status: "dropped" },
  { id: 8003, name: "Pervis Estupinan", club: "AC Milan", position: "LB", fee: "TBD", notes: "Progressing in talks. Personal terms not expected to be an issue. Two clubs discussing fee. Replaces Digne who has medical ahead of £8m move to PSG. 28 y/o Ecuador LB. via Jacob Tanswell/The Athletic · July 21 2026.", status: "frontrunner", sources: [{ journalist: "Jacob Tanswell", outlet: "The Athletic", date: "2026-07-21", claim: "Villa progressing in talks for Estupinan from Milan — personal terms not an issue" }] },
  { id: 8004, name: "Ibrahim Mbaye", club: "Paris Saint-Germain", position: "MID/FWD", fee: "TBD", notes: "Leading wide target alongside Summerville (now sold to Al Hilal). PSG winger enlisted Jorge Mendes as agent — Mendes also represents Emery. Similar cost to Summerville. Garnacho pursuit could impact this. UEFA financial rules around Rogers/Chelsea deals complicate. via Jacob Tanswell/The Athletic · July 21 2026.", status: "interested", sources: [{ journalist: "Jacob Tanswell", outlet: "The Athletic", date: "2026-07-21", claim: "Mbaye one of two leading wide targets for Villa — Mendes represents both him and Emery" }] },
  { id: 8005, name: "Alejandro Garnacho", club: "Chelsea", position: "MID/FWD", fee: "€50m", notes: "Villa held talks over Garnacho. But UEFA exchange transaction rules with Chelsea complicate — buying from Chelsea within 45 days of Rogers sale could negate profit. Not clear if pursuing further. via The Athletic.", status: "monitoring" },
  { id: 8006, name: "Nicolas Jackson", club: "Chelsea", position: "FWD", fee: "£65m", notes: "Villa exploring alongside Garnacho but same UEFA financial rule problem applies. Emery long-term admirer since Villarreal. Would join Watkins and Abraham up front. via The Athletic.", status: "monitoring" },
];

const VILLA_OUTGOINGS = [
  { id: 8101, name: "Morgan Rogers", position: "MID/FWD", notes: "SOLD to Chelsea for £117m — British record. Villa needed profit for UEFA settlement compliance. Rogers arrived from Middlesbrough for £7m. Middlesbrough hold 20% sell-on. via Jacob Tanswell/The Athletic.", status: "sold" },
  { id: 8102, name: "Youri Tielemans", position: "MID", notes: "SOLD — Man Utd triggered £35m release clause. Villa had no desire to sell. via The Athletic.", status: "sold" },
  { id: 8103, name: "Lucas Digne", position: "LB", notes: "Medical ahead of £8m move to PSG. Replaced by Estupinan pursuit. via The Athletic.", status: "sold" },
  { id: 8104, name: "Tammy Abraham", position: "FWD", notes: "Villa willing to listen to offers but not actively looking to sell. via The Athletic.", status: "uncertain" },
  { id: 8105, name: "Ollie Watkins", position: "FWD", notes: "Turkish interest. Villa not actively looking to sell but interest noted. via The Athletic.", status: "uncertain" },
  { id: 8106, name: "Evann Guessand", position: "FWD", notes: "Crystal Palace decided against £28m option. Available to leave Villa this summer. via The Athletic.", status: "likely exit" },
];

const VILLA_ACADEMY = [
  { id: 8201, name: "Tommi O'Reilly", age: 22, position: "MID", notes: "Advanced talks for season-long loan to Sheffield Wednesday — would be Villa's third player loaned there. One PL appearance (Conference League). via The Athletic.", status: "loan expected" },
];

// ── EVERTON DATA ───────────────────────────────────────────────────────────────
const EVERTON_INCOMINGS = [
  { id: 9001, name: "Hayden Hackney", club: "Middlesbrough", position: "MID", fee: "TBD", notes: "SIGNED — Middlesbrough midfielder. Ironically his arrival freed up Dwight McNeil for West Ham. Significant signing for Everton's midfield rebuild. via TEAMtalk.", status: "signed" },
  { id: 9002, name: "Tyrique George", club: "Chelsea", position: "MID/FWD", fee: "£18m rising to £24m", notes: "SIGNED — Academy graduate from Chelsea. Initial £18m with £6m add-ons. 15% sell-on clause. via Simon Johnson/The Athletic · July 7 2026.", status: "signed", sources: [{ journalist: "Simon Johnson", outlet: "The Athletic", date: "2026-07-07", claim: "Everton signed Tyrique George from Chelsea for initial £18m rising to £24m" }] },
  { id: 9003, name: "Djed Spence", club: "Tottenham", position: "RB", fee: "TBD", notes: "Everton interested per The Athletic. Also looking at Arsenal Ben White and Guela Doue (Strasbourg — likely too expensive). WC cameo for England impressed. via Jay Harris/The Athletic · July 14 2026.", status: "interested", sources: [{ journalist: "Jay Harris", outlet: "The Athletic", date: "2026-07-14", claim: "Everton interested in Spurs RB Djed Spence" }] },
  { id: 9004, name: "Ollie Dewsbury", club: "Bristol Rovers", position: "FWD", fee: "TBD", notes: "18 y/o Wales U19 on trial at Everton. Made professional debut at 15. Multiple PL clubs interested. Could feature for U21s vs Shrewsbury. via Gregg Evans/The Athletic · July 21 2026.", status: "monitoring", sources: [{ journalist: "Gregg Evans", outlet: "The Athletic", date: "2026-07-21", claim: "Everton took Dewsbury on trial — Wales U19 international, pro debut at 15" }] },
];

const EVERTON_OUTGOINGS = [
  { id: 9101, name: "Dwight McNeil", position: "MID/FWD", notes: "West Ham frontrunner per TEAMtalk. Hackney and George signings push him out of Everton picture. WHU made enquiries. Championship move possible. via Harry Watkinson/TEAMtalk.", status: "likely exit" },
];

const EVERTON_ACADEMY = [
  { id: 9201, name: "Ollie Dewsbury", age: 18, position: "FWD", notes: "On trial — could be Academy signing. Wales U19, made pro debut at 15. Loan at Weston-super-Mare last season. Exciting prospect. via The Athletic.", status: "one to watch" },
];

// ── BOURNEMOUTH DATA ──────────────────────────────────────────────────────────
const BOURNEMOUTH_INCOMINGS = [
  { id: 10001, name: "Alvaro Rodriguez", club: "Real Madrid", position: "FWD", fee: "~€12.5m", notes: "Advanced talks per The Athletic. Madrid academy graduate. Would net Real Madrid €12.5m. via Sebastian Stafford-Bloor/The Athletic · July 7 2026.", status: "frontrunner", sources: [{ journalist: "Sebastian Stafford-Bloor", outlet: "The Athletic", date: "2026-07-07", claim: "Bournemouth in advanced talks to sign Alvaro Rodriguez from Real Madrid" }] },
];

const BOURNEMOUTH_OUTGOINGS = [
  { id: 10101, name: "Alex Scott", position: "MID", notes: "Bournemouth insist NOT FOR SALE. Arsenal, Chelsea, Man Utd all interested. Scott has turned down Bournemouth contract offers. Deal runs until 2028. 22 y/o — club holding firm. via Multiple Athletic correspondents.", status: "staying", sources: [{ journalist: "Laurie Whitwell", outlet: "The Athletic", date: "2026-07-21", claim: "Bournemouth insist Scott not for sale — Arsenal, Chelsea, Man Utd all interested" }] },
];

const BOURNEMOUTH_ACADEMY = [];

// ── BRIGHTON DATA ─────────────────────────────────────────────────────────────
const BRIGHTON_INCOMINGS = [
  { id: 11001, name: "Tarik Muharemovic", club: "Sassuolo", position: "CB", fee: "TBD", notes: "On Leeds shortlist per The Athletic — but Brighton also linked. 23 y/o Bosnia CB, 6ft 4in left-footed. Consistent shot-blocking, clearances, aerial duels. Sassuolo expect to lose him. via Beren Cross/The Athletic · July 14 2026.", status: "monitoring" },
  { id: 11002, name: "Yankuba Minteh", club: "Brighton", position: "MID/FWD", fee: "N/A", notes: "Staying — Liverpool monitoring as Salah replacement but no move materialised. Brighton key winger asset.", status: "staying" },
];

const BRIGHTON_OUTGOINGS = [
  { id: 11101, name: "Amario Cozier-Duberry", position: "MID/FWD", notes: "STAYING — Brighton rejected Anderlecht £5m approach. New contract talks ongoing. Brighton regard him as first team player. 9G/13A on loan at Bolton (League One promotion) last season. Augsburg, Paris FC, Rangers also keen but rejected. via Andy Naylor/The Athletic · July 21 2026.", status: "staying", sources: [{ journalist: "Andy Naylor", outlet: "The Athletic", date: "2026-07-21", claim: "Brighton rejected Anderlecht approach for Cozier-Duberry — in first team plans, new contract talks" }] },
  { id: 11102, name: "Pascal Struijk", position: "CB", notes: "SOLD to Brighton from Leeds last month. Now IN Brighton squad. via The Athletic.", status: "staying" },
];

const BRIGHTON_ACADEMY = [];

// ── CRYSTAL PALACE DATA ───────────────────────────────────────────────────────
const PALACE_INCOMINGS = [
  { id: 12001, name: "Aurele Amenda", club: "Eintracht Frankfurt", position: "CB", fee: "TBD", notes: "Late Palace interest but Coventry completing signing instead. 22 y/o Switzerland CB. Palace missed out. via Sebastian Stafford-Bloor/The Athletic · July 14 2026.", status: "dropped" },
];

const PALACE_OUTGOINGS = [
  { id: 12101, name: "Maxence Lacroix", position: "CB", notes: "Chelsea primary target — official enquiry made. Chelsea valuation below reported £55m. 26 y/o French CB. Palace asking price not yet met. via Simon Johnson/The Athletic.", status: "expected sale", sources: [{ journalist: "Simon Johnson", outlet: "The Athletic", date: "2026-07-21", claim: "Chelsea made official enquiry for Lacroix — valuation below £55m" }] },
  { id: 12102, name: "Evann Guessand", position: "FWD", notes: "On loan from Villa — Palace declined £28m option (expired May 31). Player returns to Villa. Palace opted against alternative agreement. via The Athletic.", status: "sold" },
];

const PALACE_ACADEMY = [];

// ── BRENTFORD DATA ────────────────────────────────────────────────────────────
const BRENTFORD_INCOMINGS = [
  { id: 13001, name: "Callum Wilson", club: "Free Agent (ex-West Ham)", position: "FWD", fee: "Free", notes: "SIGNED — Free transfer. Veteran English striker confirmed by ESPN article citing West Ham departure. Experienced Championship/PL forward adds depth. via ESPN · July 21 2026.", status: "signed", sources: [{ journalist: "ESPN", outlet: "ESPN", date: "2026-07-21", claim: "Brentford announced signing of Callum Wilson on free transfer after West Ham departure" }] },
];

const BRENTFORD_OUTGOINGS = [];
const BRENTFORD_ACADEMY = [];

// ── FULHAM DATA ───────────────────────────────────────────────────────────────
const FULHAM_INCOMINGS = [
  { id: 14001, name: "Sander Berge", club: "Bournemouth", position: "MID", fee: "TBD", notes: "United previously considered Berge. 28 y/o Norway midfielder impressing at WC. Fulham manager is Alvaro Arbeloa — Real Madrid connection. Championship promotion push last season. via Laurie Whitwell/The Athletic.", status: "monitoring" },
];

const FULHAM_OUTGOINGS = [];
const FULHAM_ACADEMY = [];

// ── IPSWICH DATA ──────────────────────────────────────────────────────────────
const IPSWICH_INCOMINGS = [
  { id: 15001, name: "Abdul Fatawu", club: "Leicester City", position: "MID/FWD", fee: "TBD", notes: "Ipswich leading candidate per ExWHUEmployee after West Ham dropped interest (Bowen staying). Dutch winger, PL pedigree. via ExWHUEmployee · July 2026.", status: "frontrunner", sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Fatawu looks like he could now be joining Ipswich — West Ham left the race" }] },
  { id: 15002, name: "Kjell Scherpen", club: "Union Saint-Gilloise", position: "GK", fee: "TBD", notes: "Initial approach rejected by Saint-Gilloise. 26 y/o Dutch GK. Ipswich also looking at Volendam's Kayne van Oevelen (22) as alternative. via The Athletic.", status: "bid rejected", sources: [{ journalist: "Sebastian Stafford-Bloor", outlet: "The Athletic", date: "2026-07-21", claim: "Ipswich initial approach for Scherpen rejected — also looking at Van Oevelen as alternative" }] },
];

const IPSWICH_OUTGOINGS = [
  { id: 15101, name: "Liam Delap", position: "FWD", notes: "ON LOAN from Chelsea (£30m move from Ipswich last year). Only 3 goals. Now available for sale from Chelsea. Multiple PL clubs interested in him. via The Athletic.", status: "uncertain" },
];

const IPSWICH_ACADEMY = [];

// ── LEEDS DATA ────────────────────────────────────────────────────────────────
const LEEDS_INCOMINGS = [
  { id: 16001, name: "Tarik Muharemovic", club: "Sassuolo", position: "CB", fee: "TBD", notes: "On Leeds shortlist per Beren Cross/The Athletic. 23 y/o Bosnia CB, 6ft 4in left-footed. Replaces Pascal Struijk who moved to Brighton. Sassuolo expect to struggle to retain him. No prospective deal gone further yet. via Beren Cross/The Athletic · July 14 2026.", status: "interested", sources: [{ journalist: "Beren Cross", outlet: "The Athletic", date: "2026-07-14", claim: "Muharemovic one of names on Leeds shortlist — Sassuolo expect difficult to retain him" }] },
];

const LEEDS_OUTGOINGS = [
  { id: 16101, name: "Karl Darlow", position: "GK", notes: "SOLD/FREE — Joined Man United as free agent after Leeds contract expired. 35 y/o Wales international. via The Athletic.", status: "sold" },
  { id: 16102, name: "Pascal Struijk", position: "CB", notes: "SOLD to Brighton last month. Left-footed CB — departure drives need for Muharemovic. via The Athletic.", status: "sold" },
];

const LEEDS_ACADEMY = [];

// ── NOTTM FOREST DATA ─────────────────────────────────────────────────────────
const FOREST_INCOMINGS = [
  { id: 17001, name: "Lucas Bergvall", club: "Tottenham", position: "MID", fee: "~£60m", notes: "Forest see Bergvall as potential Elliot Anderson replacement. Bid submitted, Spurs rejected. Bergvall wants to leave — could return to Forest if Spurs lower price. Newcastle also competing. via Elias Burke/The Athletic.", status: "interested", sources: [{ journalist: "Elias Burke", outlet: "The Athletic", date: "2026-07-21", claim: "Forest see Bergvall as potential Anderson replacement — Spurs rejected bid" }] },
];

const FOREST_OUTGOINGS = [
  { id: 17101, name: "Elliot Anderson", position: "MID", notes: "SOLD to Man City for £116m. No sell-on clause — Forest get nothing from future sales. Newcastle receive nothing either having sold without clause. via The Athletic.", status: "sold" },
  { id: 17102, name: "Jota Silva", position: "MID/FWD", notes: "Close to loan move to Olympiacos (sister club). 26 y/o. Under contract until 2028. via Paul Taylor/The Athletic.", status: "loan expected" },
];

const FOREST_ACADEMY = [];

// ── SUNDERLAND DATA ───────────────────────────────────────────────────────────
const SUNDERLAND_INCOMINGS = [
  { id: 18001, name: "Granit Xhaka", club: "Sunderland", position: "MID", fee: "N/A", notes: "STAYING — Pledged commitment after Chelsea £8m bid rejected. Also rejected earlier Chelsea approach. 34 y/o Switzerland captain. Key figure for Sunderland. via Simon Johnson/The Athletic.", status: "staying" },
];

const SUNDERLAND_OUTGOINGS = [
  { id: 18101, name: "Eliezer Mayenda", position: "FWD", notes: "West Ham monitoring. 10 goals in 25 starts in Sunderland 2025 promotion season. Spain U21. Interest from multiple clubs.", status: "likely exit" },
];

const SUNDERLAND_ACADEMY = [];

// ── COVENTRY DATA ─────────────────────────────────────────────────────────────  
const COVENTRY_INCOMINGS = [
  { id: 19001, name: "Aurele Amenda", club: "Eintracht Frankfurt", position: "CB", fee: "TBD", notes: "Completing signing pending medical. 22 y/o Switzerland CB. Crystal Palace expressed late interest but Coventry in pole. via Sebastian Stafford-Bloor/The Athletic · July 14 2026.", status: "frontrunner", sources: [{ journalist: "Sebastian Stafford-Bloor", outlet: "The Athletic", date: "2026-07-14", claim: "Coventry completing Amenda signing from Frankfurt despite late Palace interest" }] },
];

const COVENTRY_OUTGOINGS = [];
const COVENTRY_ACADEMY = [];

// ── HULL DATA ─────────────────────────────────────────────────────────────────
const HULL_INCOMINGS = [
  { id: 20001, name: "Ivor Pandur", club: "Hull City", position: "GK", fee: "TBD", notes: "Hull GK linked with West Ham for second successive summer. Key part of Hull PL return. If WHU sign him Hull will need a replacement. via Hammers News.", status: "monitoring" },
];

const HULL_OUTGOINGS = [];
const HULL_ACADEMY = [];



// ── CHAMPIONSHIP CLUBS DATA ───────────────────────────────────────────────────

const BIRMINGHAM_INCOMINGS = [];
const BIRMINGHAM_OUTGOINGS = [];
const BIRMINGHAM_ACADEMY = [];

const BLACKBURN_INCOMINGS = [];
const BLACKBURN_OUTGOINGS = [];
const BLACKBURN_ACADEMY = [];

const BOLTON_INCOMINGS = [];
const BOLTON_OUTGOINGS = [];
const BOLTON_ACADEMY = [];

const BRISTOL_INCOMINGS = [];
const BRISTOL_OUTGOINGS = [];
const BRISTOL_ACADEMY = [];

const BURNLEY_INCOMINGS = [];
const BURNLEY_OUTGOINGS = [
  { id: 30101, name: "Luca Koleosho", position: "MID/FWD", notes: "Young Canadian winger. Multiple PL clubs monitoring. Could depart if promoted side makes offer.", status: "likely exit" },
];
const BURNLEY_ACADEMY = [];

const CARDIFF_INCOMINGS = [];
const CARDIFF_OUTGOINGS = [
  { id: 31101, name: "Dylan Lawlor", position: "CB", notes: "West Ham frontrunner per C&H/CaughtOffside. Cardiff valuing at ~£20m. Active discussions ongoing. Full Welsh international, 20 y/o. via ExWHU/C&H · July 2026.", status: "expected sale", sources: [{ journalist: "ExWHUEmployee", outlet: "West Ham Way", date: "2026-07-18", claim: "Strong WHU interest in Lawlor — Cardiff in continuing discussions" }] },
];
const CARDIFF_ACADEMY = [];

const CHARLTON_INCOMINGS = [];
const CHARLTON_OUTGOINGS = [];
const CHARLTON_ACADEMY = [];

const DERBY_INCOMINGS = [];
const DERBY_OUTGOINGS = [];
const DERBY_ACADEMY = [];

const LINCOLN_INCOMINGS = [];
const LINCOLN_OUTGOINGS = [];
const LINCOLN_ACADEMY = [];

const MIDDLESBROUGH_INCOMINGS = [];
const MIDDLESBROUGH_OUTGOINGS = [
  { id: 32101, name: "Hayden Hackney", position: "MID", notes: "SOLD to Everton. Ironically freed up Dwight McNeil who West Ham are now pursuing. via TEAMtalk.", status: "sold" },
];
const MIDDLESBROUGH_ACADEMY = [];

const MILLWALL_INCOMINGS = [];
const MILLWALL_OUTGOINGS = [];
const MILLWALL_ACADEMY = [];

const NORWICH_INCOMINGS = [];
const NORWICH_OUTGOINGS = [];
const NORWICH_ACADEMY = [];

const PORTSMOUTH_INCOMINGS = [];
const PORTSMOUTH_OUTGOINGS = [];
const PORTSMOUTH_ACADEMY = [];

const PRESTON_INCOMINGS = [];
const PRESTON_OUTGOINGS = [];
const PRESTON_ACADEMY = [];

const QPR_INCOMINGS = [
  { id: 33001, name: "Calvin Ramsay", club: "Liverpool", position: "RB", fee: "Loan", notes: "Liverpool considering loan to QPR. Scotland international. Included in Liverpool US pre-season tour before potential exit. via James Pearce/The Athletic · July 21 2026.", status: "monitoring", sources: [{ journalist: "James Pearce", outlet: "The Athletic", date: "2026-07-21", claim: "QPR among clubs interested in Ramsay loan — Liverpool to listen to offers later in window" }] },
  { id: 33002, name: "Pierce Charles", club: "Manchester City", position: "GK", fee: "Loan", notes: "SIGNED on loan from Man City. 20 y/o re-signed by City from Sheffield Wednesday then immediately loaned to QPR. via Sam Lee/The Athletic.", status: "signed", sources: [{ journalist: "Sam Lee", outlet: "The Athletic", date: "2026-07-07", claim: "Pierce Charles loaned to QPR after City re-signed him from Sheffield Wednesday" }] },
];
const QPR_OUTGOINGS = [];
const QPR_ACADEMY = [];

const SHEFF_UTD_INCOMINGS = [];
const SHEFF_UTD_OUTGOINGS = [
  { id: 34101, name: "Harrison Burrows", position: "LB", notes: "West Ham monitoring as Diouf replacement. Attack-minded LB with fine cross. Some fan criticism. via WHU sources.", status: "likely exit" },
];
const SHEFF_UTD_ACADEMY = [];

const STOKE_INCOMINGS = [
  { id: 35001, name: "Jaden Dixon", club: "Arsenal", position: "CB", fee: "Loan", notes: "Two Championship appearances for Stoke already. Arsenal considering sending him back on loan. Local connection — born in Havering. Less likely than Mfuni for WHU but on their radar too. via ExWHUEmployee.", status: "monitoring" },
];
const STOKE_OUTGOINGS = [];
const STOKE_ACADEMY = [];

const SWANSEA_INCOMINGS = [];
const SWANSEA_OUTGOINGS = [
  { id: 36101, name: "Kaelan Casey", position: "CB", notes: "West Ham academy CB on loan at Swansea last season. Final year of deal at WHU. Could loan again. via Roshane Thomas/The Athletic.", status: "uncertain" },
];
const SWANSEA_ACADEMY = [];

const WATFORD_INCOMINGS = [
  { id: 37001, name: "Stephen Mfuni", club: "Manchester City", position: "CB", fee: "Loan", notes: "Previously loaned to Watford last season — impressed in Championship. West Ham now frontrunner for next loan ahead of Watford. via ExWHUEmployee · July 18 2026.", status: "monitoring" },
];
const WATFORD_OUTGOINGS = [];
const WATFORD_ACADEMY = [];

const WEST_BROM_INCOMINGS = [];
const WEST_BROM_OUTGOINGS = [];
const WEST_BROM_ACADEMY = [];

const WOLVES_INCOMINGS = [];
const WOLVES_OUTGOINGS = [
  { id: 38101, name: "Santiago Bueno", position: "CB", notes: "West Ham contacted Wolves in April. Standout player in poor Wolves side. Uruguayan international. WHU still interested this window. via WHU sources.", status: "likely exit" },
];
const WOLVES_ACADEMY = [];

const WREXHAM_INCOMINGS = [];
const WREXHAM_OUTGOINGS = [];
const WREXHAM_ACADEMY = [];

const SOUTHAMPTON_INCOMINGS = [
  { id: 39001, name: "Taylor Harwood-Bellis", club: "Southampton", position: "CB", fee: "£12.5m+", notes: "STAYING for now — Southampton rejected £12.5m bid from West Ham in January. ExWHUEmployee confirms WHU long-term interest remains. Southampton need him especially with points deduction. Ball-playing CB, strong goalscoring record. via ExWHU · July 2026.", status: "staying" },
];
const SOUTHAMPTON_OUTGOINGS = [];
const SOUTHAMPTON_ACADEMY = [];


// ── CLUBS REGISTRY ─────────────────────────────────────────────────────────────
const CLUBS = [
  // ── CHAMPIONSHIP ──────────────────────────────────────────────────────────
  {
    id: "west-ham", name: "West Ham United", badge: "⚒️",
    primaryColor: "#7d1a2a", league: "championship", relegated: true, manager: "Nuno Espírito Santo",
    incomings: INITIAL_INCOMING, outgoings: INITIAL_OUTGOING, academy: INITIAL_ACADEMY,
    storageKeys: { in: "whu-incoming-v29", out: "whu-outgoing-v29", acad: "whu-academy-v29" },
  },
  {
    id: "sunderland", name: "Sunderland", badge: "🔴",
    primaryColor: "#EB172B", league: "championship", manager: "Régis Le Bris",
    incomings: SUNDERLAND_INCOMINGS, outgoings: SUNDERLAND_OUTGOINGS, academy: SUNDERLAND_ACADEMY,
    storageKeys: { in: "sun-incoming-v1", out: "sun-outgoing-v1", acad: "sun-academy-v1" },
  },
  {
    id: "coventry", name: "Coventry City", badge: "🔵",
    primaryColor: "#009EE0", league: "championship", manager: "Frank Lampard",
    incomings: COVENTRY_INCOMINGS, outgoings: COVENTRY_OUTGOINGS, academy: COVENTRY_ACADEMY,
    storageKeys: { in: "cov-incoming-v1", out: "cov-outgoing-v1", acad: "cov-academy-v1" },
  },
  {
    id: "hull", name: "Hull City", badge: "🟠",
    primaryColor: "#F18A01", league: "championship", manager: "Ruben Selles",
    incomings: HULL_INCOMINGS, outgoings: HULL_OUTGOINGS, academy: HULL_ACADEMY,
    storageKeys: { in: "hul-incoming-v1", out: "hul-outgoing-v1", acad: "hul-academy-v1" },
  },
  { id: "birmingham", name: "Birmingham City", badge: "🔵", primaryColor: "#0000FF", league: "championship", manager: "Chris Davies", incomings: BIRMINGHAM_INCOMINGS, outgoings: BIRMINGHAM_OUTGOINGS, academy: BIRMINGHAM_ACADEMY, storageKeys: { in: "bir-in-v1", out: "bir-out-v1", acad: "bir-ac-v1" } },
  { id: "blackburn", name: "Blackburn Rovers", badge: "🔵", primaryColor: "#009EE0", league: "championship", manager: "John Eustace", incomings: BLACKBURN_INCOMINGS, outgoings: BLACKBURN_OUTGOINGS, academy: BLACKBURN_ACADEMY, storageKeys: { in: "bla-in-v1", out: "bla-out-v1", acad: "bla-ac-v1" } },
  { id: "bolton", name: "Bolton Wanderers", badge: "⚪", primaryColor: "#263F6A", league: "championship", manager: "Ian Evatt", incomings: BOLTON_INCOMINGS, outgoings: BOLTON_OUTGOINGS, academy: BOLTON_ACADEMY, storageKeys: { in: "bol-in-v1", out: "bol-out-v1", acad: "bol-ac-v1" } },
  { id: "bristol-city", name: "Bristol City", badge: "🔴", primaryColor: "#E3001B", league: "championship", manager: "Liam Manning", incomings: BRISTOL_INCOMINGS, outgoings: BRISTOL_OUTGOINGS, academy: BRISTOL_ACADEMY, storageKeys: { in: "brc-in-v1", out: "brc-out-v1", acad: "brc-ac-v1" } },
  { id: "burnley", name: "Burnley", badge: "🟣", primaryColor: "#6C1D45", league: "championship", manager: "Scott Parker", incomings: BURNLEY_INCOMINGS, outgoings: BURNLEY_OUTGOINGS, academy: BURNLEY_ACADEMY, storageKeys: { in: "bur-in-v1", out: "bur-out-v1", acad: "bur-ac-v1" } },
  { id: "cardiff", name: "Cardiff City", badge: "🔵", primaryColor: "#0070B5", league: "championship", manager: "Omer Riza", incomings: CARDIFF_INCOMINGS, outgoings: CARDIFF_OUTGOINGS, academy: CARDIFF_ACADEMY, storageKeys: { in: "car-in-v1", out: "car-out-v1", acad: "car-ac-v1" } },
  { id: "charlton", name: "Charlton Athletic", badge: "🔴", primaryColor: "#CC0000", league: "championship", manager: "Nathan Jones", incomings: CHARLTON_INCOMINGS, outgoings: CHARLTON_OUTGOINGS, academy: CHARLTON_ACADEMY, storageKeys: { in: "cha-in-v1", out: "cha-out-v1", acad: "cha-ac-v1" } },
  { id: "derby", name: "Derby County", badge: "⚫", primaryColor: "#1C2B5E", league: "championship", manager: "Paul Warne", incomings: DERBY_INCOMINGS, outgoings: DERBY_OUTGOINGS, academy: DERBY_ACADEMY, storageKeys: { in: "der-in-v1", out: "der-out-v1", acad: "der-ac-v1" } },
  { id: "lincoln", name: "Lincoln City", badge: "🔴", primaryColor: "#CC0000", league: "championship", manager: "Michael Skubala", incomings: LINCOLN_INCOMINGS, outgoings: LINCOLN_OUTGOINGS, academy: LINCOLN_ACADEMY, storageKeys: { in: "lin-in-v1", out: "lin-out-v1", acad: "lin-ac-v1" } },
  { id: "middlesbrough", name: "Middlesbrough", badge: "🔴", primaryColor: "#E03A3E", league: "championship", manager: "Michael Carrick", incomings: MIDDLESBROUGH_INCOMINGS, outgoings: MIDDLESBROUGH_OUTGOINGS, academy: MIDDLESBROUGH_ACADEMY, storageKeys: { in: "mid-in-v1", out: "mid-out-v1", acad: "mid-ac-v1" } },
  { id: "millwall", name: "Millwall", badge: "🔵", primaryColor: "#001D5E", league: "championship", manager: "Neil Harris", incomings: MILLWALL_INCOMINGS, outgoings: MILLWALL_OUTGOINGS, academy: MILLWALL_ACADEMY, storageKeys: { in: "mil-in-v1", out: "mil-out-v1", acad: "mil-ac-v1" } },
  { id: "norwich", name: "Norwich City", badge: "🟡", primaryColor: "#00A650", league: "championship", manager: "Johannes Hoff Thorup", incomings: NORWICH_INCOMINGS, outgoings: NORWICH_OUTGOINGS, academy: NORWICH_ACADEMY, storageKeys: { in: "nor-in-v1", out: "nor-out-v1", acad: "nor-ac-v1" } },
  { id: "portsmouth", name: "Portsmouth", badge: "🔵", primaryColor: "#001489", league: "championship", manager: "John Mousinho", incomings: PORTSMOUTH_INCOMINGS, outgoings: PORTSMOUTH_OUTGOINGS, academy: PORTSMOUTH_ACADEMY, storageKeys: { in: "por-in-v1", out: "por-out-v1", acad: "por-ac-v1" } },
  { id: "preston", name: "Preston North End", badge: "⚪", primaryColor: "#FFFFFF", league: "championship", manager: "Paul Heckingbottom", incomings: PRESTON_INCOMINGS, outgoings: PRESTON_OUTGOINGS, academy: PRESTON_ACADEMY, storageKeys: { in: "pre-in-v1", out: "pre-out-v1", acad: "pre-ac-v1" } },
  { id: "qpr", name: "Queens Park Rangers", badge: "🔵", primaryColor: "#1D5BA4", league: "championship", manager: "Martí Cifuentes", incomings: QPR_INCOMINGS, outgoings: QPR_OUTGOINGS, academy: QPR_ACADEMY, storageKeys: { in: "qpr-in-v1", out: "qpr-out-v1", acad: "qpr-ac-v1" } },
  { id: "sheff-utd", name: "Sheffield United", badge: "🔴", primaryColor: "#EE2737", league: "championship", manager: "Chris Wilder", incomings: SHEFF_UTD_INCOMINGS, outgoings: SHEFF_UTD_OUTGOINGS, academy: SHEFF_UTD_ACADEMY, storageKeys: { in: "shu-in-v1", out: "shu-out-v1", acad: "shu-ac-v1" } },
  { id: "southampton", name: "Southampton", badge: "🔴", primaryColor: "#D71920", league: "championship", relegated: true, manager: "Ivan Juric", incomings: SOUTHAMPTON_INCOMINGS, outgoings: SOUTHAMPTON_OUTGOINGS, academy: SOUTHAMPTON_ACADEMY, storageKeys: { in: "sou-in-v1", out: "sou-out-v1", acad: "sou-ac-v1" } },
  { id: "stoke", name: "Stoke City", badge: "🔴", primaryColor: "#E03A3E", league: "championship", manager: "Narcis Pelach", incomings: STOKE_INCOMINGS, outgoings: STOKE_OUTGOINGS, academy: STOKE_ACADEMY, storageKeys: { in: "sto-in-v1", out: "sto-out-v1", acad: "sto-ac-v1" } },
  { id: "swansea", name: "Swansea City", badge: "⚪", primaryColor: "#121212", league: "championship", manager: "Luke Williams", incomings: SWANSEA_INCOMINGS, outgoings: SWANSEA_OUTGOINGS, academy: SWANSEA_ACADEMY, storageKeys: { in: "swa-in-v1", out: "swa-out-v1", acad: "swa-ac-v1" } },
  { id: "watford", name: "Watford", badge: "🟡", primaryColor: "#FBEE23", league: "championship", manager: "Tom Cleverley", incomings: WATFORD_INCOMINGS, outgoings: WATFORD_OUTGOINGS, academy: WATFORD_ACADEMY, storageKeys: { in: "wat-in-v1", out: "wat-out-v1", acad: "wat-ac-v1" } },
  { id: "west-brom", name: "West Bromwich Albion", badge: "🔵", primaryColor: "#122F67", league: "championship", manager: "Tony Mowbray", incomings: WEST_BROM_INCOMINGS, outgoings: WEST_BROM_OUTGOINGS, academy: WEST_BROM_ACADEMY, storageKeys: { in: "wba-in-v1", out: "wba-out-v1", acad: "wba-ac-v1" } },
  { id: "wolves", name: "Wolverhampton Wanderers", badge: "🟠", primaryColor: "#FDB913", league: "championship", relegated: true, manager: "Vitor Pereira", incomings: WOLVES_INCOMINGS, outgoings: WOLVES_OUTGOINGS, academy: WOLVES_ACADEMY, storageKeys: { in: "wol-in-v1", out: "wol-out-v1", acad: "wol-ac-v1" } },
  { id: "wrexham", name: "Wrexham", badge: "🔴", primaryColor: "#CC0000", league: "championship", manager: "Phil Parkinson", incomings: WREXHAM_INCOMINGS, outgoings: WREXHAM_OUTGOINGS, academy: WREXHAM_ACADEMY, storageKeys: { in: "wrx-in-v1", out: "wrx-out-v1", acad: "wrx-ac-v1" } },
  // ── PREMIER LEAGUE ────────────────────────────────────────────────────────
  {
    id: "arsenal", name: "Arsenal", badge: "🔴",
    primaryColor: "#EF0107", league: "premier_league", europeanComp: "champions_league", manager: "Mikel Arteta",
    incomings: ARSENAL_INCOMINGS, outgoings: ARSENAL_OUTGOINGS, academy: ARSENAL_ACADEMY,
    storageKeys: { in: "ars-incoming-v1", out: "ars-outgoing-v1", acad: "ars-academy-v1" },
  },
  {
    id: "aston-villa", name: "Aston Villa", badge: "🟣",
    primaryColor: "#95BFE5", league: "premier_league", europeanComp: "champions_league", manager: "Unai Emery",
    incomings: VILLA_INCOMINGS, outgoings: VILLA_OUTGOINGS, academy: VILLA_ACADEMY,
    storageKeys: { in: "avl-incoming-v1", out: "avl-outgoing-v1", acad: "avl-academy-v1" },
  },
  {
    id: "bournemouth", name: "Bournemouth", badge: "🍒",
    primaryColor: "#DA291C", league: "premier_league", manager: "Andoni Iraola",
    incomings: BOURNEMOUTH_INCOMINGS, outgoings: BOURNEMOUTH_OUTGOINGS, academy: BOURNEMOUTH_ACADEMY,
    storageKeys: { in: "bou-incoming-v1", out: "bou-outgoing-v1", acad: "bou-academy-v1" },
  },
  {
    id: "brentford", name: "Brentford", badge: "🐝",
    primaryColor: "#E30613", league: "premier_league", manager: "Thomas Frank",
    incomings: BRENTFORD_INCOMINGS, outgoings: BRENTFORD_OUTGOINGS, academy: BRENTFORD_ACADEMY,
    storageKeys: { in: "bre-incoming-v1", out: "bre-outgoing-v1", acad: "bre-academy-v1" },
  },
  {
    id: "brighton", name: "Brighton", badge: "🔵",
    primaryColor: "#0057B8", league: "premier_league", manager: "Roberto De Zerbi",
    incomings: BRIGHTON_INCOMINGS, outgoings: BRIGHTON_OUTGOINGS, academy: BRIGHTON_ACADEMY,
    storageKeys: { in: "bha-incoming-v1", out: "bha-outgoing-v1", acad: "bha-academy-v1" },
  },
  {
    id: "chelsea", name: "Chelsea", badge: "🔵",
    primaryColor: "#034694", league: "premier_league", europeanComp: "champions_league", manager: "Xabi Alonso",
    incomings: CHELSEA_INCOMINGS, outgoings: CHELSEA_OUTGOINGS, academy: CHELSEA_ACADEMY,
    storageKeys: { in: "che-incoming-v1", out: "che-outgoing-v1", acad: "che-academy-v1" },
  },
  {
    id: "crystal-palace", name: "Crystal Palace", badge: "🦅",
    primaryColor: "#1B458F", league: "premier_league", manager: "Oliver Glasner",
    incomings: PALACE_INCOMINGS, outgoings: PALACE_OUTGOINGS, academy: PALACE_ACADEMY,
    storageKeys: { in: "cry-incoming-v1", out: "cry-outgoing-v1", acad: "cry-academy-v1" },
  },
  {
    id: "everton", name: "Everton", badge: "🔵",
    primaryColor: "#003399", league: "premier_league", manager: "Sean Dyche",
    incomings: EVERTON_INCOMINGS, outgoings: EVERTON_OUTGOINGS, academy: EVERTON_ACADEMY,
    storageKeys: { in: "eve-incoming-v1", out: "eve-outgoing-v1", acad: "eve-academy-v1" },
  },
  {
    id: "fulham", name: "Fulham", badge: "⚪",
    primaryColor: "#CC0000", league: "premier_league", manager: "Alvaro Arbeloa",
    incomings: FULHAM_INCOMINGS, outgoings: FULHAM_OUTGOINGS, academy: FULHAM_ACADEMY,
    storageKeys: { in: "ful-incoming-v1", out: "ful-outgoing-v1", acad: "ful-academy-v1" },
  },
  {
    id: "ipswich", name: "Ipswich Town", badge: "🔵",
    primaryColor: "#0033A0", league: "premier_league", manager: "Kieran McKenna",
    incomings: IPSWICH_INCOMINGS, outgoings: IPSWICH_OUTGOINGS, academy: IPSWICH_ACADEMY,
    storageKeys: { in: "ips-incoming-v1", out: "ips-outgoing-v1", acad: "ips-academy-v1" },
  },
  {
    id: "leeds", name: "Leeds United", badge: "⚪",
    primaryColor: "#FFCD00", league: "premier_league", manager: "Daniel Farke",
    incomings: LEEDS_INCOMINGS, outgoings: LEEDS_OUTGOINGS, academy: LEEDS_ACADEMY,
    storageKeys: { in: "lee-incoming-v1", out: "lee-outgoing-v1", acad: "lee-academy-v1" },
  },
  {
    id: "liverpool", name: "Liverpool", badge: "🔴",
    primaryColor: "#C8102E", league: "premier_league", europeanComp: "champions_league", manager: "Andoni Iraola",
    incomings: LIVERPOOL_INCOMINGS, outgoings: LIVERPOOL_OUTGOINGS, academy: LIVERPOOL_ACADEMY,
    storageKeys: { in: "liv-incoming-v1", out: "liv-outgoing-v1", acad: "liv-academy-v1" },
  },
  {
    id: "man-city", name: "Manchester City", badge: "🔵",
    primaryColor: "#6CABDD", league: "premier_league", europeanComp: "champions_league", manager: "Enzo Maresca",
    incomings: MANCITY_INCOMINGS, outgoings: MANCITY_OUTGOINGS, academy: MANCITY_ACADEMY,
    storageKeys: { in: "mci-incoming-v1", out: "mci-outgoing-v1", acad: "mci-academy-v1" },
  },
  {
    id: "man-utd", name: "Manchester United", badge: "🔴",
    primaryColor: "#DA291C", league: "premier_league", manager: "Michael Carrick",
    incomings: MANUTD_INCOMINGS, outgoings: MANUTD_OUTGOINGS, academy: MANUTD_ACADEMY,
    storageKeys: { in: "mnu-incoming-v1", out: "mnu-outgoing-v1", acad: "mnu-academy-v1" },
  },
  {
    id: "newcastle", name: "Newcastle United", badge: "⚫",
    primaryColor: "#241F20", league: "premier_league", manager: "Eddie Howe",
    incomings: NEWCASTLE_INCOMINGS, outgoings: NEWCASTLE_OUTGOINGS, academy: NEWCASTLE_ACADEMY,
    storageKeys: { in: "new-incoming-v1", out: "new-outgoing-v1", acad: "new-academy-v1" },
  },
  {
    id: "nottm-forest", name: "Nottingham Forest", badge: "🌳",
    primaryColor: "#DD0000", league: "premier_league", manager: "Nuno Espírito Santo",
    incomings: FOREST_INCOMINGS, outgoings: FOREST_OUTGOINGS, academy: FOREST_ACADEMY,
    storageKeys: { in: "nfo-incoming-v1", out: "nfo-outgoing-v1", acad: "nfo-academy-v1" },
  },
  {
    id: "spurs", name: "Tottenham Hotspur", badge: "⚪",
    primaryColor: "#132257", league: "premier_league", manager: "Ange Postecoglou",
    incomings: SPURS_INCOMINGS, outgoings: SPURS_OUTGOINGS, academy: SPURS_ACADEMY,
    storageKeys: { in: "tot-incoming-v1", out: "tot-outgoing-v1", acad: "tot-academy-v1" },
  },
];

const TAB_CONFIG = {
  in:   { label: "Incomings",     statusConfig: IN_STATUS_CONFIG },
  out:  { label: "Outgoings",     statusConfig: OUT_STATUS_CONFIG },
  acad: { label: "Academy Watch", statusConfig: ACAD_STATUS_CONFIG },
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

function PlayerCard({ p, statusConfig, onEdit, isAdmin }) {
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
            {isAdmin && (
              <button onClick={() => onEdit(p)} style={{
                flexShrink: 0, padding: "3px 8px", background: "transparent",
                border: "1px solid #2e3840", color: "#667", borderRadius: "4px",
                cursor: "pointer", fontFamily: "sans-serif", fontSize: "11px",
              }}>Edit</button>
            )}
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
  const [selectedClubId, setSelectedClubId] = useState("west-ham");
  const [tab, setTab] = useState("in");
  const [clubData, setClubData] = useState({});
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editingTab, setEditingTab] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [filter, setFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "spi2026") setIsAdmin(true);
  }, []);

  // Reset tab and filter when club changes
  useEffect(() => {
    setTab("in");
    setFilter("all");
  }, [selectedClubId]);

  useEffect(() => { setFilter("all"); }, [tab]);

  const club = CLUBS.find(c => c.id === selectedClubId) || CLUBS[0];

  // Get data for current club — use clubData overrides if admin has edited
  const getData = (key) => clubData[`${selectedClubId}-${key}`] || club[key === "in" ? "incomings" : key === "out" ? "outgoings" : "academy"];

  async function persist(tabKey, updated) {
    const storeKey = club.storageKeys[tabKey];
    try {
      await window.storage.set(storeKey, JSON.stringify(updated));
      setClubData(prev => ({ ...prev, [`${selectedClubId}-${tabKey}`]: updated }));
      setSaveMsg("Saved ✓");
      setTimeout(() => setSaveMsg(""), 1500);
    } catch {}
  }

  async function handleSaveEdit(notes, status) {
    const current = getData(editingTab);
    const updated = current.map(p => p.id === editingPlayer.id ? { ...p, notes, status } : p);
    await persist(editingTab, updated);
    setEditingPlayer(null);
  }

  async function handleAdd(form) {
    const current = getData(tab);
    const maxId = Math.max(0, ...current.map(p => p.id));
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
    const updated = [...current, newPlayer];
    await persist(tab, updated);
    setAdding(false);
  }

  const cfg = TAB_CONFIG[tab];
  const players = getData(tab);
  const counts = {};
  players.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
  const filtered = filter === "all" ? players : players.filter(p => p.status === filter);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d0f", fontFamily: "'Georgia', serif", color: "#e8e0d8" }}>

      {/* SPI Global Nav */}
      <div style={{
        background: "#080a0c",
        borderBottom: "1px solid #1e2428",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "44px", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <line x1="3" y1="25" x2="26" y2="25" stroke="#e8a020" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
            <line x1="3" y1="25" x2="3" y2="3" stroke="#e8a020" strokeWidth="1.2" strokeLinecap="round" opacity="0.7"/>
            <path d="M3 15 Q11 15 11 25" stroke="#e8a020" strokeWidth="1" fill="none" strokeDasharray="1.8 1.8" strokeLinecap="round" opacity="0.55"/>
            <line x1="3" y1="25" x2="3" y2="7" stroke="#e8a020" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M3 7 L16 10.5 L3 14 Z" fill="#e8a020"/>
          </svg>
          <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "#f0e8e0", letterSpacing: "0.04em" }}>
            SETPIECE<span style={{ color: "#e8a020" }}>INTEL</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#4a5a62", letterSpacing: "0.08em" }}>
            SUMMER 2026
          </span>
          <a href="https://spi-newsletter.beehiiv.com/" target="_blank" rel="noreferrer" style={{
            padding: "4px 12px", background: "#e8a020", color: "#080a0c",
            borderRadius: "2px", fontFamily: "monospace", fontSize: "10px",
            fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none",
          }}>GET UPDATES</a>
        </div>
      </div>

      {/* Club Selector Bar */}
      <div style={{
        background: "#0d1215",
        borderBottom: "1px solid #1e2428",
        padding: "10px 20px",
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#4a5a62", letterSpacing: "0.1em", flexShrink: 0 }}>
          SELECT CLUB
        </span>
        <select
          value={selectedClubId}
          onChange={e => setSelectedClubId(e.target.value)}
          style={{
            background: "#111619",
            border: "1px solid #2e3840",
            color: "#f0e8e0",
            borderRadius: "4px",
            padding: "6px 12px",
            fontFamily: "monospace",
            fontSize: "12px",
            cursor: "pointer",
            flex: 1,
            maxWidth: "300px",
            appearance: "none",
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23e8a020' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: "30px",
          }}
        >
          {CLUBS.filter(c => c.league === "championship").length > 0 && (
            <optgroup label="── Championship 2026/27 ──">
              {CLUBS.filter(c => c.league === "championship").sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                <option key={c.id} value={c.id}>{c.badge} {c.name}</option>
              ))}
            </optgroup>
          )}
          <optgroup label="── Premier League 2026/27 ──">
            {CLUBS.filter(c => c.league === "premier_league").sort((a,b) => a.name.localeCompare(b.name)).map(c => (
              <option key={c.id} value={c.id}>{c.badge} {c.name}</option>
            ))}
          </optgroup>
        </select>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "auto" }}>
          {saveMsg && <span style={{ fontSize: "11px", color: "#00c853", fontFamily: "sans-serif" }}>{saveMsg}</span>}
          {isAdmin && <span style={{ fontSize: "10px", color: "#9b2335", fontFamily: "monospace", letterSpacing: "0.1em" }}>ADMIN</span>}
          {isAdmin && (
            <button onClick={() => setAdding(true)} style={{
              padding: "5px 12px", background: "#9b2335", color: "#fff",
              border: "none", borderRadius: "4px", cursor: "pointer",
              fontFamily: "sans-serif", fontSize: "11px", fontWeight: 700,
            }}>+ Add</button>
          )}
        </div>
      </div>

      {/* Club Header */}
      <div style={{
        background: `linear-gradient(135deg, ${club.primaryColor}cc 0%, ${club.primaryColor}44 60%, #0a0d0f 100%)`,
        padding: "16px 20px 0",
        borderBottom: `2px solid ${club.primaryColor}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <span style={{ fontSize: "28px" }}>{club.badge}</span>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#c8a080", fontFamily: "sans-serif", fontWeight: 600 }}>
              {club.league === "championship" ? "Championship 2026/27" : "Premier League 2026/27"}
              {club.europeanComp === "champions_league" ? " · UCL" : ""}
            </div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#f5ece8" }}>
              {club.name} — Transfer Tracker
            </div>
            {club.manager && (
              <div style={{ fontSize: "11px", color: "#8a7a70", fontFamily: "sans-serif" }}>
                Manager: {club.manager}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
          {Object.entries(TAB_CONFIG).map(([key, tc]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "8px 16px",
              background: tab === key ? "#0a0d0f" : "transparent",
              color: tab === key ? "#f0e8e0" : "#c8a080",
              border: "none", borderRadius: "6px 6px 0 0", cursor: "pointer",
              fontFamily: "sans-serif", fontSize: "12px", fontWeight: 700,
              borderBottom: tab === key ? `2px solid #0a0d0f` : "2px solid transparent",
              marginBottom: tab === key ? "-2px" : "0",
            }}>{tc.label} ({getData(key).length})</button>
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
            isAdmin={isAdmin}
            onEdit={pl => { setEditingPlayer(pl); setEditingTab(tab); }} />
        ))}
      </div>

      <div style={{ padding: "4px 20px 24px", fontSize: "11px", color: "#334", fontFamily: "sans-serif", textAlign: "center" }}>
        SetpieceIntel · Sources: The Athletic · Claret & Hugh · ExWHUEmployee · Romano · Ornstein · Summer 2026
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
