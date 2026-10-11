/* Mock Trial case files. All people, places and events are fictional and written
   for practice. Side "a" argues for the State (criminal) or Plaintiff (civil);
   side "b" argues for the Defense. Each side has three witnesses to choose from
   (the format calls two per side). */
const MOCK_CASES = [
  {
    id: "reynolds", type: "criminal", title: "State v. Reynolds",
    topic: "State v. Reynolds — Felony theft of a rare manuscript from a private library.",
    charge: "Felony theft of a rare manuscript from the Hargrove Private Library.",
    summary: "On the night of March 3, the 400-year-old Aldersey Manuscript disappeared from a locked display case at the Hargrove Library. Night archivist Dana Reynolds is accused of taking it. Reynolds says the manuscript was already gone when they started their shift.",
    stipulations: [
      "The manuscript is worth about $85,000.",
      "The library's alarm log shows one door badge entry between 6:00 p.m. and 7:00 a.m.: Reynolds, at 6:12 p.m.",
      "The display case lock showed no signs of forcing.",
      "The security camera over the reading room was out of service for maintenance that week."
    ],
    witnesses: [
      { side: "a", name: "Marcus Hale", role: "Library director", points: ["Saw the case empty at 7:30 a.m.", "Says Reynolds had asked about the manuscript's value two weeks earlier."] },
      { side: "a", name: "Officer Priya Nandan", role: "Investigating officer", points: ["Found a pawn-shop flyer for rare books in Reynolds' locker.", "Reynolds' locker had no manuscript."] },
      { side: "a", name: "Ellis Pruitt", role: "Rare-book dealer", points: ["Says Reynolds called him about selling an old manuscript.", "Never saw the item itself."] },
      { side: "b", name: "Dana Reynolds", role: "Defendant, night archivist", points: ["Badged in at 6:12 p.m. and made rounds at 7, 9 and 11.", "Says the case looked closed and locked, so never checked inside."] },
      { side: "b", name: "Camille Ortiz", role: "Cleaning contractor", points: ["Was in the reading room until 9 p.m.", "Saw a man in a gray coat near the display case."] },
      { side: "b", name: "Dr. Noor Haddad", role: "Document conservator", points: ["Says the case lock can be opened with a copied key.", "Three staff members hold keys."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Door badge log", desc: "Shows one entry on the night in question." },
      { name: "Exhibit 2: Pawn-shop flyer", desc: "A flyer for rare books found in Reynolds' locker." },
      { name: "Exhibit 3: Phone record", desc: "Reynolds' call to the dealer, 4 minutes, two weeks before the theft." }
    ],
    elements: ["The manuscript belonged to another person.", "The defendant took it without permission.", "The defendant intended to keep it permanently."],
    hints: {
      a: "Build the story around opportunity: one badge, one night, a call to a dealer. Keep emphasis on who was alone with the case.",
      b: "Attack identity and proof: no camera, three key holders, a stranger in a gray coat. Remind the jury the State must prove each element."
    }
  },
  {
    id: "morales", type: "criminal", title: "State v. Morales",
    topic: "State v. Morales — Vehicular manslaughter following a fatal collision.",
    charge: "Vehicular manslaughter after a collision at Fifth and Alder that killed cyclist Jonah Weiss.",
    summary: "At 6:40 p.m. on a rainy evening, Alex Morales' van struck cyclist Jonah Weiss at the Fifth and Alder intersection. Weiss died at the scene. The State says Morales was texting and ran a red light. Morales says the light was yellow and the cyclist rode out from behind a parked truck.",
    stipulations: [
      "Weiss was pronounced dead at 7:05 p.m.",
      "It was raining and the road was wet.",
      "Morales' phone received three text messages between 6:35 and 6:41 p.m.",
      "Morales had no alcohol or drugs in their system."
    ],
    witnesses: [
      { side: "a", name: "Tessa Brandt", role: "Eyewitness at the bus stop", points: ["Says the light was red for the van.", "Saw the driver looking down."] },
      { side: "a", name: "Detective Omar Reyes", role: "Crash investigator", points: ["Skid marks suggest the van was going about 38 in a 25 zone.", "Phone was unlocked at the scene."] },
      { side: "a", name: "Dr. Lena Park", role: "Medical examiner", points: ["Cause of death: blunt-force trauma.", "Cannot say whether the cyclist was moving fast or slowly."] },
      { side: "b", name: "Alex Morales", role: "Defendant, driver", points: ["Says the light turned yellow as they entered.", "Did not read the texts; phone was in the cup holder."] },
      { side: "b", name: "Gordon Fitch", role: "Delivery truck driver", points: ["Was parked on Alder with hazards on.", "Saw the cyclist ride out between the truck and the curb."] },
      { side: "b", name: "Prof. Anika Sol", role: "Traffic-signal engineer", points: ["The yellow light at that intersection lasts only 2.8 seconds.", "Wet roads add stopping distance."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Scene diagram", desc: "Marks the van, truck, bike and signal." },
      { name: "Exhibit 2: Phone records", desc: "Three incoming messages, none opened." },
      { name: "Exhibit 3: Signal timing chart", desc: "Light cycles for the intersection." }
    ],
    elements: ["The defendant drove in a grossly careless way.", "That carelessness caused the victim's death."],
    hints: {
      a: "Link speed + phone + red light into one pattern of carelessness, and answer the parked-truck claim with the eyewitness.",
      b: "Show the light timing and the blocked view. Phone messages received are not messages read."
    }
  },
  {
    id: "chen", type: "criminal", title: "State v. Chen",
    topic: "State v. Chen — Corporate fraud and embezzlement from investor funds.",
    charge: "Fraud and embezzlement of $1.2 million from investors in Bluefin Robotics.",
    summary: "Jamie Chen was the chief financial officer of Bluefin Robotics. The State says Chen moved $1.2 million of investor money into a private account and falsified reports. Chen says the transfers were approved bridge loans to the company and were repaid in part.",
    stipulations: [
      "Eleven transfers totaling $1.2 million went to an account in Chen's name between January and June.",
      "$310,000 was returned to the company in July.",
      "Chen signed the quarterly investor reports.",
      "The company's board met twice during the period."
    ],
    witnesses: [
      { side: "a", name: "Rita Kovacs", role: "Forensic accountant", points: ["Traced all eleven transfers.", "Reports never mentioned loans."] },
      { side: "a", name: "Devin Okafor", role: "Company investor", points: ["Relied on the reports when adding $500,000.", "Was told money would fund new prototypes."] },
      { side: "a", name: "Hannah Weir", role: "Former accounting clerk", points: ["Says Chen told her to label transfers 'equipment.'", "Never saw any loan paperwork."] },
      { side: "b", name: "Jamie Chen", role: "Defendant, CFO", points: ["Says the CEO verbally approved the loans.", "Planned to repay once a contract closed."] },
      { side: "b", name: "Victor Amari", role: "Board member", points: ["Remembers a conversation about 'bridge financing.'", "No minutes record a vote."] },
      { side: "b", name: "Lorna Pierce", role: "Outside auditor", points: ["Audit found no sign of concealed accounts.", "Chen cooperated with every request."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Bank transfer ledger", desc: "Eleven transfers with dates and amounts." },
      { name: "Exhibit 2: Investor report, Q2", desc: "Signed by Chen." },
      { name: "Exhibit 3: Board meeting notes", desc: "Mention bridge financing in passing; no vote recorded." }
    ],
    elements: ["The defendant took property entrusted to them.", "The defendant intended to deprive the owners of it.", "The defendant used false statements to hide the taking."],
    hints: {
      a: "Follow the money in order, and contrast the quarterly reports with the ledger. Intent is the heart of the case.",
      b: "Intent: loans and partial repayment are not theft. Press on the missing minutes and the cooperative audit."
    }
  },
  {
    id: "patel", type: "criminal", title: "State v. Patel",
    topic: "State v. Patel — Arson of a commercial property after the business failed.",
    charge: "Arson of the Corner Slice pizzeria after the business lost money for two years.",
    summary: "A fire destroyed the Corner Slice pizzeria at 2:10 a.m. on August 9. Owner Sam Patel stood to collect $240,000 in insurance. The State says Patel set the fire. Patel says an electrical fault in the old oven caused it.",
    stipulations: [
      "The building was insured for $240,000, a policy bought eight months earlier.",
      "The business lost money in each of its last six quarters.",
      "Patel was seen on a gas-station camera at 12:45 a.m., six blocks away.",
      "The fire started in the kitchen."
    ],
    witnesses: [
      { side: "a", name: "Fire Marshal Dena Boyle", role: "Origin and cause investigator", points: ["Found traces of an accelerant by the back door.", "Ruled out the oven wiring as a likely source."] },
      { side: "a", name: "Kyle Mercer", role: "Insurance agent", points: ["Patel increased coverage three months before the fire.", "Patel asked how fast claims are paid."] },
      { side: "a", name: "Rosa Delgado", role: "Former employee", points: ["Says Patel complained about debts and said, 'This place is a money pit.'", "Was fired in July."] },
      { side: "b", name: "Sam Patel", role: "Defendant, owner", points: ["Closed at 11 p.m. and went home.", "Out to buy gas at 12:45 a.m. when the oven kept tripping."] },
      { side: "b", name: "Ivan Rostov", role: "Electrician", points: ["Repaired the oven wiring twice.", "Warned that the panel was overloaded."] },
      { side: "b", name: "Dr. Mei Tanaka", role: "Fire-science consultant", points: ["The accelerant test had a high false-positive rate.", "Cleaning fluids in the kitchen could produce the same result."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Insurance policy", desc: "Coverage amount and date purchased." },
      { name: "Exhibit 2: Lab report", desc: "Accelerant traces near the rear door." },
      { name: "Exhibit 3: Electrician invoices", desc: "Two repair visits on the oven wiring." }
    ],
    elements: ["A fire was set on purpose.", "The defendant set it or caused it to be set.", "The fire damaged the property of another or was set to collect insurance."],
    hints: {
      a: "Motive plus accelerant plus timing. The insurance increase is your strongest circumstantial link.",
      b: "Cause is in doubt. Two repairs, an overloaded panel and cleaning products explain what the State calls proof."
    }
  },
  {
    id: "williams", type: "criminal", title: "State v. Williams",
    topic: "State v. Williams — Identity theft and credit card fraud across three states.",
    charge: "Identity theft and credit card fraud totaling $23,400 in purchases across three states.",
    summary: "Over five weeks, someone used the identity of Priya Raman to open four credit cards and buy electronics in three states. The State says Taylor Williams did it. Williams says a roommate had access to Williams' laptop and mail.",
    stipulations: [
      "Four cards were opened in Raman's name using her real Social Security number.",
      "Purchases totaled $23,400.",
      "All card statements were mailed to an apartment where Williams lived with two roommates.",
      "Williams was out of state on business for two of the five weeks."
    ],
    witnesses: [
      { side: "a", name: "Priya Raman", role: "Victim", points: ["Never opened the cards.", "Learned of them when a collection call arrived."] },
      { side: "a", name: "Agent Luis Ferreira", role: "Fraud investigator", points: ["Traced the online applications to the apartment's internet address.", "A laptop of Williams' had the electronics store log-ins saved."] },
      { side: "a", name: "Gwen Albright", role: "Store clerk", points: ["Remembers a customer matching Williams' description.", "Cannot read the signature."] },
      { side: "b", name: "Taylor Williams", role: "Defendant", points: ["Says the laptop was often left open in the living room.", "Never saw the cards."] },
      { side: "b", name: "Chris Dalton", role: "Roommate", points: ["Admits borrowing the laptop.", "Is unemployed and recently bought a new phone."] },
      { side: "b", name: "Maya Brooks", role: "Network security expert", points: ["Shared internet addresses cannot show which person was using them.", "Saved log-ins sync automatically across devices."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Card applications", desc: "Four online applications with the apartment's internet address." },
      { name: "Exhibit 2: Purchase records", desc: "Twenty-two purchases in three states." },
      { name: "Exhibit 3: Travel itinerary", desc: "Shows Williams out of state for two weeks." }
    ],
    elements: ["The defendant used another person's identity.", "The use was without permission.", "The defendant meant to obtain money or goods by doing so."],
    hints: {
      a: "Tie the laptop, address and mail to Williams, and treat the roommate story as unproven convenience.",
      b: "Reasonable doubt lives in the shared apartment: two other people, a borrowed laptop, and purchases while Williams was away."
    }
  },
  {
    id: "thompson", type: "criminal", title: "State v. Thompson",
    topic: "State v. Thompson — Assault and battery at a sports venue after an altercation.",
    charge: "Assault and battery on Eli Navarro at Westfield Arena after a basketball game.",
    summary: "After a high-school playoff game, a fight broke out in the arena parking lot. Eli Navarro suffered a broken nose. The State says Drew Thompson threw the punch without cause. Thompson says Navarro swung first and Thompson acted in self-defense.",
    stipulations: [
      "Navarro's nose was broken in the parking lot at about 9:45 p.m.",
      "Both men had been in the stands for the game.",
      "A parking-lot camera caught the start of the confrontation, but the angle is blocked by a van.",
      "Neither man had a weapon."
    ],
    witnesses: [
      { side: "a", name: "Eli Navarro", role: "Victim", points: ["Says Thompson shoved him and then punched him.", "Had words with Thompson over seats at halftime."] },
      { side: "a", name: "Officer Tamara Quinn", role: "Responding officer", points: ["Navarro had a bloody nose; Thompson had no visible injuries.", "Thompson told her, 'He had it coming.'"] },
      { side: "a", name: "Brent Lowell", role: "Arena security guard", points: ["Saw Thompson walking quickly toward Navarro.", "Did not see who threw the first punch."] },
      { side: "b", name: "Drew Thompson", role: "Defendant", points: ["Says Navarro lunged and swung first.", "Pushed back and struck once to get away."] },
      { side: "b", name: "Nina Castillo", role: "Spectator", points: ["Saw Navarro raise his fist first.", "Had been standing beside the van."] },
      { side: "b", name: "Dr. Owen Marsh", role: "Emergency physician", points: ["A single strike could break a nose.", "A bruise on Thompson's forearm is consistent with blocking a punch."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Parking-lot video", desc: "Shows the start of the confrontation; the key moment is blocked." },
      { name: "Exhibit 2: Medical report", desc: "Navarro's broken nose; bruise on Thompson's arm." },
      { name: "Exhibit 3: Seating chart", desc: "Where the two men sat." }
    ],
    elements: ["The defendant struck the victim.", "The strike was intentional.", "The defendant was not acting in lawful self-defense."],
    hints: {
      a: "Use the officer's quote and the injury gap. Self-defense requires a reasonable fear of force, not a grudge about seats.",
      b: "Self-defense: who moved first. The forearm bruise and the independent spectator match Thompson's account."
    }
  },
  {
    id: "rivera", type: "civil", title: "Rivera v. Lakeside Apartments",
    topic: "Rivera v. Lakeside Apartments — Negligence claim after a fall on a broken stairway.",
    charge: "Negligence: Lakeside Apartments failed to repair a broken stair handrail, and Maria Rivera was injured.",
    summary: "On January 14, tenant Maria Rivera fell down the rear stairway of Lakeside Apartments when the handrail gave way. She fractured her wrist and missed six weeks of work. She says the landlord ignored three repair requests. Lakeside says it inspected the rail and that Rivera was carrying too much and wearing slippery shoes.",
    stipulations: [
      "Rivera lived at Lakeside for two years.",
      "Her medical bills were $14,600; she lost $5,200 in wages.",
      "The handrail was replaced two days after the fall.",
      "Rivera was carrying two laundry bags at the time."
    ],
    witnesses: [
      { side: "a", name: "Maria Rivera", role: "Plaintiff", points: ["Reported the loose rail three times in writing.", "Held the rail for balance when it came away."] },
      { side: "a", name: "Samuel Obi", role: "Neighbor", points: ["Saw the fall and heard the rail snap.", "Had also told the manager about the rail."] },
      { side: "a", name: "Dr. Helen Cho", role: "Treating physician", points: ["Fracture is consistent with a fall onto an outstretched hand.", "Recovery took six weeks."] },
      { side: "b", name: "Pat Larkin", role: "Property manager", points: ["Inspected the rail in November and found it 'acceptable.'", "Says no written repair request was received."] },
      { side: "b", name: "Greg Soto", role: "Maintenance worker", points: ["Tightened the rail's bolts in December.", "Rust on the bolts made it hard to secure."] },
      { side: "b", name: "Dana Whitfield", role: "Safety consultant", points: ["Carrying two heavy bags changes balance.", "Wet leaves were on the steps that day."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Repair request emails", desc: "Three messages from Rivera to the management office." },
      { name: "Exhibit 2: Inspection checklist", desc: "November inspection marked 'rail: acceptable.'" },
      { name: "Exhibit 3: Medical bills and pay stubs", desc: "Out-of-pocket costs and lost wages." }
    ],
    elements: ["The landlord owed Rivera a duty to keep common areas safe.", "The landlord failed to use reasonable care.", "That failure caused Rivera's injury and losses."],
    hints: {
      a: "Show notice: three written requests, a worker who struggled with rusted bolts, and a rail that broke under ordinary use.",
      b: "Reasonable care and shared fault: an inspection, a repair attempt, wet leaves, and a heavy load in both hands."
    }
  },
  {
    id: "hart", type: "civil", title: "Hart v. Brightline Software",
    topic: "Hart v. Brightline Software — Breach of contract over a custom scheduling app.",
    charge: "Breach of contract: Brightline Software failed to deliver a working scheduling app by the deadline.",
    summary: "Hart's Landscaping paid Brightline Software $30,000 for a custom crew-scheduling app, due June 1. Brightline delivered a version on June 20 that crashed on phones. Hart says the contract was breached and wants its money back plus losses. Brightline says Hart kept changing the requirements, which caused the delay.",
    stipulations: [
      "The written contract set a June 1 delivery date and a $30,000 price.",
      "Hart paid in full on April 1.",
      "Hart sent 14 change requests between April and May.",
      "Hart switched to a competitor's app on July 5 at a cost of $9,800."
    ],
    witnesses: [
      { side: "a", name: "Robin Hart", role: "Plaintiff, owner", points: ["Says the changes were small and Brightline agreed to them.", "Lost two crews' scheduling for three weeks."] },
      { side: "a", name: "Eve Tran", role: "Office manager", points: ["Tested the June 20 build; it crashed on every phone.", "Kept a log of the crashes."] },
      { side: "a", name: "Prof. Alan Voss", role: "Software expert", points: ["The 14 requests were minor interface edits.", "A competent team could have met the deadline."] },
      { side: "b", name: "Jordan Mills", role: "Brightline project lead", points: ["Says the change requests added about 80 hours.", "Asked for a deadline extension in writing."] },
      { side: "b", name: "Sara Kline", role: "Brightline developer", points: ["Fixed the crashes within a week of the report.", "Hart never tested the update."] },
      { side: "b", name: "Marcus Bell", role: "Contract lawyer", points: ["The contract lets Brightline extend the deadline when scope changes.", "Hart signed without objection."] }
    ],
    exhibits: [
      { name: "Exhibit 1: Written contract", desc: "Delivery date, price and a clause about scope changes." },
      { name: "Exhibit 2: Change-request emails", desc: "Fourteen messages from Hart." },
      { name: "Exhibit 3: Crash log", desc: "Eve Tran's record of crashes on the June 20 build." }
    ],
    elements: ["A valid contract existed.", "The defendant failed to perform as promised.", "The plaintiff suffered losses because of that failure."],
    hints: {
      a: "The date was in writing. The delivered app didn't work. Minor edits don't excuse a three-week delay.",
      b: "The contract lets scope changes move the deadline, and Brightline fixed the problem fast. Hart never gave it a chance."
    }
  }
];

/* Helper: the ready-made list used by the Setup screen and the Mock Trial tab. */
function mockCaseById(id) {
  return MOCK_CASES.find(function (c) { return c.id === id; }) || null;
}
