/* Study content for Verdict Debate: practice scenarios and Mock Trial vocabulary.
   Plain data only; the Study screen (study.js) and the Mock Trial case library (mocktrial.js) read it.
   Everything here is educational practice material. Case facts are fictional. */

/* ---------------------------------------------------------------------------
   Mock Trial objections: one card each (when to use it), plus scenarios below.
   --------------------------------------------------------------------------- */
const MOCK_OBJECTIONS = [
  { name: "Hearsay", def: "An out-of-court statement offered to prove that what it says is true. Object unless an exception applies (party admission, excited utterance, business record...).", ex: "Q: What did the neighbor tell you about the defendant's car?" },
  { name: "Relevance", def: "The question or answer doesn't make any fact that matters to the case more or less likely.", ex: "Q: What is your favorite food?" },
  { name: "Leading", def: "The question suggests the answer the lawyer wants. Allowed on cross-examination; objectionable on direct.", ex: "Q (on direct): You saw the defendant run from the store, didn't you?" },
  { name: "Speculation", def: "The witness is guessing about something they don't actually know.", ex: "Q: Why do you think the driver was in such a hurry?" },
  { name: "Lack of foundation", def: "The lawyer hasn't first shown how the witness knows this, or that the exhibit is what it claims to be.", ex: "Q: Is this the contract the parties signed? (witness never saw it before)" },
  { name: "Lack of personal knowledge", def: "The witness wasn't there and didn't perceive it themselves.", ex: "Q: What did the defendant do after you left the room?" },
  { name: "Argumentative", def: "The lawyer is arguing with the witness or asking them to accept the lawyer's conclusion instead of asking for facts.", ex: "Q: So you expect this court to believe you just happened to be there?" },
  { name: "Asked and answered", def: "The same question has already been asked and answered.", ex: "Q: (third time) What color was the car?" },
  { name: "Compound question", def: "Two or more questions are joined in one, so the answer would be unclear.", ex: "Q: Did you see the defendant and did you call the police?" },
  { name: "Assumes facts not in evidence", def: "The question builds in a fact the jury hasn't heard yet.", ex: "Q: After you saw him break the window, what did you do? (no one has testified to a broken window)" },
  { name: "Narrative", def: "The question is so open that the witness can ramble on for minutes, instead of answering one point at a time.", ex: "Q: Tell the jury everything that happened that night." },
  { name: "Improper character evidence", def: "Using someone's general character or past conduct to suggest they acted that way this time.", ex: "Q: Isn't it true the defendant has a reputation for being violent?" },
  { name: "Beyond the scope", def: "On cross, the question goes past the topics covered on direct (where the rules limit cross to the scope of direct).", ex: "Q (cross of a witness who only testified about the weather): Where was the defendant born?" },
  { name: "Non-responsive", def: "The answer doesn't address the question that was asked. Usually raised by the lawyer who asked.", ex: "Q: Yes or no, did you lock the door? A: I always take safety very seriously." },
  { name: "Improper opinion", def: "A lay witness is giving an opinion that needs expert training, or telling the jury what conclusion to reach.", ex: "Q: In your opinion, was the bridge's steel fatigued? (asked of the bakery owner)" }
];

/* ---------------------------------------------------------------------------
   Objection trainer: read the courtroom line, pick the objection (or none).
   --------------------------------------------------------------------------- */
const OBJECTION_SCENARIOS = [
  { id: "o1", setting: "Direct exam of the arresting officer (prosecution)", line: "Q: What did the bystander say the driver shouted before the crash?", answer: "Hearsay", why: "The bystander's words are an out-of-court statement offered for their truth, and no exception has been shown." },
  { id: "o2", setting: "Direct exam of the store clerk (prosecution)", line: "Q: You saw the defendant take the ring, didn't you?", answer: "Leading", why: "On direct, the question tells the witness the answer. It should be open-ended: \"What did you see?\"" },
  { id: "o3", setting: "Direct exam of a neighbor (defense)", line: "Q: What is your opinion of the city's new parking rules?", answer: "Relevance", why: "Parking rules have nothing to do with what happened on the night in question." },
  { id: "o4", setting: "Cross-exam of the mechanic (prosecution)", line: "Q: Isn't it true you never inspected the brakes, which means you were careless?", answer: "Argumentative", why: "The lawyer is pushing a conclusion (\"careless\") rather than asking for a fact." },
  { id: "o5", setting: "Direct exam of the victim (prosecution)", line: "Q: Please describe where you were standing when the car approached.", answer: "No objection", why: "This is a proper, open-ended question that asks for facts the witness personally saw." },
  { id: "o6", setting: "Direct exam of a passerby (defense)", line: "Q: Why do you think the driver didn't brake in time?", answer: "Speculation", why: "The witness can say what they saw, not guess at the driver's reasons." },
  { id: "o7", setting: "Direct exam of the accountant (prosecution)", line: "Q: Is this spreadsheet the record the company kept? (witness has never seen it)", answer: "Lack of foundation", why: "Nothing yet shows that the witness knows the exhibit or that it is what it claims to be." },
  { id: "o8", setting: "Cross-exam of the defendant (prosecution)", line: "Q: You were in the parking lot at 9 p.m., correct?", answer: "No objection", why: "Leading questions are allowed on cross-examination, and this one is about a relevant fact." },
  { id: "o9", setting: "Direct exam of the officer (prosecution)", line: "Q: Did you interview the defendant, and did you also collect the fingerprints?", answer: "Compound question", why: "Two questions at once make the answer unclear. Ask them one at a time." },
  { id: "o10", setting: "Direct exam of the witness (defense)", line: "Q: What color was the jacket? (asked for the third time, same answer each time)", answer: "Asked and answered", why: "The witness has already answered this exact question." },
  { id: "o11", setting: "Direct exam of the landlord (plaintiff)", line: "Q: What did the tenant do after the stairs collapsed? (no one has said the stairs collapsed)", answer: "Assumes facts not in evidence", why: "The question assumes a fact the jury has not heard." },
  { id: "o12", setting: "Direct exam of the nurse (defense)", line: "Q: Tell us everything you remember about that whole week.", answer: "Narrative", why: "A question this broad invites a long ramble. Ask about specific events." },
  { id: "o13", setting: "Cross-exam of the defendant (prosecution)", line: "Q: Isn't it true you've been in trouble before, so you're the type to do this?", answer: "Improper character evidence", why: "Past conduct can't be used to suggest the defendant acted the same way this time." },
  { id: "o14", setting: "Direct exam of the clerk (prosecution)", line: "Q: What did the manager do after you went home for the night?", answer: "Lack of personal knowledge", why: "The clerk wasn't there, so they can't know what happened." },
  { id: "o15", setting: "Direct exam of the baker (defense)", line: "Q: In your opinion, was the wiring in that building up to electrical code?", answer: "Improper opinion", why: "That takes expert training. A baker is a lay witness." },
  { id: "o16", setting: "Cross-exam of the witness (defense)", line: "Q: Where did you go to college? (the witness only testified about hearing a loud noise)", answer: "Beyond the scope", why: "Where the rules limit cross to the scope of direct, this goes past what direct covered." },
  { id: "o17", setting: "Direct exam of the pharmacist (prosecution)", line: "Q: Did you sell the medicine that day? A: Our store has served this town for forty years.", answer: "Non-responsive", why: "The answer doesn't address the yes-or-no question." },
  { id: "o18", setting: "Direct exam of an employee (plaintiff)", line: "Q: What did the manager say in the meeting about the layoffs? (the manager is a party to the case)", answer: "No objection", why: "A statement by the opposing party is not hearsay when offered against them (admission by a party-opponent)." },
  { id: "o19", setting: "Direct exam of the officer (prosecution)", line: "Q: Describe what you saw when you arrived on the scene.", answer: "No objection", why: "Open-ended, based on personal observation, and clearly relevant." },
  { id: "o20", setting: "Cross-exam of the witness (prosecution)", line: "Q: So you want this jury to believe you never noticed anything, even though you were standing right there?", answer: "Argumentative", why: "It challenges the witness rather than asking a question about a fact." },
  { id: "o21", setting: "Direct exam of a friend (defense)", line: "Q: What did the defendant's brother tell you about the argument?", answer: "Hearsay", why: "The brother's out-of-court statement would be offered for its truth, so it is hearsay." },
  { id: "o22", setting: "Direct exam of the technician (plaintiff)", line: "Q: Where do you think the company was planning to open its next office?", answer: "Speculation", why: "The technician has no way of knowing; this calls for a guess." },
  { id: "o23", setting: "Direct exam of the cashier (prosecution)", line: "Q: What time did the defendant enter the store?", answer: "No objection", why: "A simple, relevant question about something the cashier personally saw." },
  { id: "o24", setting: "Cross-exam of the officer (prosecution)", line: "Q: Isn't the defendant just a violent person by nature, which is why he did this?", answer: "Improper character evidence", why: "It uses general character (\"violent by nature\") to suggest he acted that way this time." }
];

/* ---------------------------------------------------------------------------
   More Mock Trial vocabulary (the existing list covers hearsay, foundation, etc.)
   --------------------------------------------------------------------------- */
const MOCK_TERMS = [
  { term: "Opening Statement", def: "Each side's first speech to the jury: a roadmap of the story and what the evidence will show. It is not evidence and should not argue." },
  { term: "Closing Argument", def: "The final speech that ties the evidence to the legal elements and tells the jury why they should decide for your side." },
  { term: "Redirect", def: "A second round of questions from the side that called the witness, limited to topics raised on cross-examination." },
  { term: "Recross", def: "A second cross-examination of a witness, limited to topics raised on redirect (if the rules allow it)." },
  { term: "Stipulation", def: "A fact both sides agree is true, so no one has to prove it at trial." },
  { term: "Exhibit", def: "A document, photo or object offered as evidence. It must be authenticated and admitted before the jury considers it." },
  { term: "Sustained", def: "The judge agrees with an objection. The question or answer is not allowed." },
  { term: "Overruled", def: "The judge disagrees with an objection. The question or answer is allowed." },
  { term: "Approach the Bench", def: "A lawyer's request to speak with the judge privately, away from the jury, usually about a legal issue." },
  { term: "Rest", def: "A side's formal statement that it has finished presenting its evidence." },
  { term: "Verdict", def: "The jury's (or judge's) final decision in the case." },
  { term: "Jury Instructions", def: "The judge's explanation of the law the jury must apply, including the elements and the burden of proof." },
  { term: "Elements", def: "The individual facts the prosecution (or plaintiff) must prove for each charge or claim. If one element fails, the claim fails." },
  { term: "Prima Facie Case", def: "Enough evidence on every element, taken at face value, that the claim goes forward unless the other side answers it." },
  { term: "Affirmative Defense", def: "A defense that admits the basic facts but offers a reason the defendant still shouldn't be liable (like self-defense or consent)." },
  { term: "Motion in Limine", def: "A request, made before the evidence is heard, asking the judge to allow or exclude certain evidence." },
  { term: "Voir Dire", def: "Questioning of potential jurors (or sometimes an expert's qualifications) to see whether they are suitable." },
  { term: "Lay Witness", def: "A regular witness who testifies about what they saw, heard or did, not about technical opinions." },
  { term: "Expert Witness", def: "A witness qualified by training or experience to give opinions on technical matters, like medicine or engineering." },
  { term: "Demonstrative Evidence", def: "Charts, models or diagrams that help explain testimony. They illustrate; they aren't the evidence itself." },
  { term: "Hostile Witness", def: "A witness who is unwilling or openly opposed to the side that called them; the judge may allow leading questions on direct." },
  { term: "Admission by a Party-Opponent", def: "A statement by the opposing party, offered against them. It is not hearsay." },
  { term: "Excited Utterance", def: "A statement made while still under the stress of a startling event. A common exception to the hearsay rule." },
  { term: "Business Records", def: "Regularly kept records made at or near the time of events. A common exception to the hearsay rule when properly authenticated." },
  { term: "Judicial Notice", def: "The judge accepts a fact as true without proof because it is common knowledge or easily verified." },
  { term: "Best Evidence Rule", def: "When the contents of a document matter, the original (or an accepted copy) is preferred over someone's description of it." },
  { term: "Direct Evidence", def: "Evidence that proves a fact on its own, like an eyewitness who saw the event." },
  { term: "Circumstantial Evidence", def: "Evidence that points to a fact only by inference, like fingerprints that suggest someone was in a room." },
  { term: "Reasonable Doubt", def: "The criminal standard: the jury must be firmly convinced of guilt. Any real doubt based on reason means not guilty." },
  { term: "Preponderance of the Evidence", def: "The usual civil standard: it is more likely than not (just over 50%) that the claim is true." },
  { term: "Proximate Cause", def: "A cause close enough to the harm that the law holds the defendant responsible, not just a distant link." },
  { term: "Mens Rea", def: "The 'guilty mind': the mental state (intent, knowledge, recklessness) that many crimes require along with the act." }
];

/* ---------------------------------------------------------------------------
   Spot the fallacy: two clear scenarios per fallacy.
   --------------------------------------------------------------------------- */
const SPOT_SCENARIOS = [
  { id: "s1", fallacy: "Ad Hominem", text: "\"Don't listen to her budget proposal. She dropped out of college, so what could she know?\"" },
  { id: "s2", fallacy: "Ad Hominem", text: "\"His argument about recycling is nonsense. The guy can't even keep his own lawn tidy.\"" },
  { id: "s3", fallacy: "Straw Man", text: "\"My opponent wants a shorter school day. Apparently she thinks kids shouldn't learn anything at all.\"" },
  { id: "s4", fallacy: "Straw Man", text: "\"They say we should review the dress code. So they want total chaos and no rules anywhere.\"" },
  { id: "s5", fallacy: "False Dichotomy", text: "\"You're either with us on this bill or you're against progress. There's no other choice.\"" },
  { id: "s6", fallacy: "False Dichotomy", text: "\"Either we cut the arts program or the school goes bankrupt.\"" },
  { id: "s7", fallacy: "Slippery Slope", text: "\"If we let students use phones at lunch, soon they'll be on them in class, and then nobody will learn anything ever again.\"" },
  { id: "s8", fallacy: "Slippery Slope", text: "\"Allow one extra day of homework help and teachers will end up doing all of our work for us.\"" },
  { id: "s9", fallacy: "Appeal to Authority", text: "\"A famous actor says this supplement works, so it must.\"" },
  { id: "s10", fallacy: "Appeal to Authority", text: "\"My uncle is a lawyer and he says the earth is only a few thousand years old, so that's settled.\"" },
  { id: "s11", fallacy: "Appeal to Emotion", text: "\"If you vote against this playground, you're telling every child in this town that they don't matter.\"" },
  { id: "s12", fallacy: "Appeal to Emotion", text: "\"Imagine the puppy's sad face. How could anyone support shutting down the shelter?\"" },
  { id: "s13", fallacy: "Circular Reasoning", text: "\"The report is accurate because it says so right in the report.\"" },
  { id: "s14", fallacy: "Circular Reasoning", text: "\"He's the best leader because he's the one who should be in charge.\"" },
  { id: "s15", fallacy: "Hasty Generalization", text: "\"I had two bad meals at that chain, so all of their restaurants must be terrible.\"" },
  { id: "s16", fallacy: "Hasty Generalization", text: "\"The new transfer student was rude to me, so people from that town are rude.\"" },
  { id: "s17", fallacy: "Red Herring", text: "\"Yes, test scores dropped. But why is nobody talking about how great our football team is this year?\"" },
  { id: "s18", fallacy: "Red Herring", text: "\"You asked about the broken heater? Let's talk about how beautiful the new mural is.\"" },
  { id: "s19", fallacy: "Tu Quoque", text: "\"You tell me to stop interrupting, but you interrupted me yesterday, so I don't have to listen.\"" },
  { id: "s20", fallacy: "Tu Quoque", text: "\"You're lecturing me about littering? I saw you drop a wrapper last month.\"" },
  { id: "s21", fallacy: "Bandwagon", text: "\"Everyone is switching to this app, so it has to be the best one.\"" },
  { id: "s22", fallacy: "Bandwagon", text: "\"Millions of people believe this diet works. That's all the proof you need.\"" },
  { id: "s23", fallacy: "Post Hoc", text: "\"I wore my lucky socks and we won. The socks clearly caused the win.\"" },
  { id: "s24", fallacy: "Post Hoc", text: "\"Crime fell after the new streetlights went up, so the lights must be what cut crime.\"" },
  { id: "s25", fallacy: "No True Scotsman", text: "\"No real fan would ever leave early.\" \"But my friend left early and she's a huge fan.\" \"Then she's not a real fan.\"" },
  { id: "s26", fallacy: "No True Scotsman", text: "\"A true patriot never questions the government.\" \"I do and I'm a patriot.\" \"Then you aren't a true one.\"" },
  { id: "s27", fallacy: "Anecdotal", text: "\"The data says seatbelts save lives, but my grandfather drove for fifty years without one and was fine.\"" },
  { id: "s28", fallacy: "Anecdotal", text: "\"Studies show the vaccine is safe, but I know a guy who got sick, so I don't trust it.\"" },
  { id: "s29", fallacy: "Burden of Proof", text: "\"Ghosts are real. Prove they aren't.\"" },
  { id: "s30", fallacy: "Burden of Proof", text: "\"The plan will work and you can't show otherwise, so we should adopt it.\"" },
  { id: "s31", fallacy: "Equivocation", text: "\"Laws change over time. Gravity is a law. So gravity will change over time.\"" },
  { id: "s32", fallacy: "Equivocation", text: "\"A feather is light. What is light cannot be dark. So a feather cannot be dark.\"" },
  { id: "s33", fallacy: "Appeal to Tradition", text: "\"We've held the assembly in the gym for fifty years, so there's no reason to ever move it.\"" },
  { id: "s34", fallacy: "Appeal to Tradition", text: "\"This is how our family has always done it, so it must be the right way.\"" },
  { id: "s35", fallacy: "False Equivalence", text: "\"Forgetting your homework once is basically the same as cheating on a test.\"" },
  { id: "s36", fallacy: "False Equivalence", text: "\"A speeding ticket and a bank robbery are both breaking the law, so they're equally bad.\"" },
  { id: "s37", fallacy: "Cherry Picking", text: "\"Look at this one chart where sales went up in March. See, the policy is a success.\" (the other eleven months fell)" },
  { id: "s38", fallacy: "Cherry Picking", text: "\"Two of the forty reviews were glowing, so everyone loves it.\"" },
  { id: "s39", fallacy: "Guilt by Association", text: "\"That idea was first proposed by someone I dislike, so it can't be any good.\"" },
  { id: "s40", fallacy: "Guilt by Association", text: "\"She sat at lunch with the troublemakers, so she must be one of them.\"" },
  { id: "s41", fallacy: "Poisoning the Well", text: "\"Before he speaks, remember that he's a known liar, so ignore whatever he says.\"" },
  { id: "s42", fallacy: "Poisoning the Well", text: "\"Anyone who disagrees with me obviously hasn't done the reading, so don't bother listening to them.\"" },
  { id: "s43", fallacy: "Loaded Question", text: "\"When did you stop cheating on your quizzes?\"" },
  { id: "s44", fallacy: "Loaded Question", text: "\"Why does the mayor keep wasting our money?\"" },
  { id: "s45", fallacy: "Non Sequitur", text: "\"She plays the violin beautifully, so she'd make a great treasurer.\"" },
  { id: "s46", fallacy: "Non Sequitur", text: "\"It's sunny today, so the economy must be improving.\"" },
  { id: "s47", fallacy: "Moving the Goalposts", text: "\"You said you'd believe me if I got an A. I got an A, but now it only counts if it's an A on the next test too.\"" },
  { id: "s48", fallacy: "Moving the Goalposts", text: "\"Fine, the program cut costs by 20%. But it doesn't really work until it cuts them by 50%.\"" }
];

/* Fold the new vocabulary into the Learn screen's glossary (once). */
if (typeof GLOSSARY !== "undefined" && !GLOSSARY.__merged) {
  GLOSSARY["Mock Trial"] = (GLOSSARY["Mock Trial"] || []).concat(MOCK_TERMS);
  GLOSSARY["Mock Trial: Objections"] = MOCK_OBJECTIONS.map(function (o) { return { term: o.name, def: o.def }; });
  Object.defineProperty(GLOSSARY, "__merged", { value: true, enumerable: false });
}
