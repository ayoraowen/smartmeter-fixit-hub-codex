# 01 · Problem statement

**Status:** drafting

Label every statement: `[person: name]`, `[observed: when/where]`,
`[source: document]`, `[code: file]` or `[ASSUMED: what would settle it]`.

## The problem in one sentence

In the primary user's words, not the tool's.

> Field inspection technicians at a customer's premises find meter anomalies that
> could mean unbilled units, such as readings on the reverse register, but cannot
> tell from the meter whether it has the safeguard, so they ask MCL and billing is
> left pending until MCL's findings confirm the cause.

Assembled by Claude from the owner's phrases, and confirmed by the owner as the
problem statement, focused on unbilled-unit anomalies
[person: ayoraowen, project owner].

## Primary user

One user. Who they are, where they work, what they carry, what their day looks like.

- **Field inspection technicians**, who inspect meters for any anomalies that could
  lead to unbilled units [person: ayoraowen, project owner].
- MCL is not the primary user: it is who the technicians ask when a reading does
  not make sense [person: ayoraowen, project owner].
- They find the anomaly **at the customer's premises**, and look things up on a
  **smartphone** [person: ayoraowen, project owner].
- Signal strength at premises, how many inspections they do in a day, and whether
  the customer is present are not recorded [ASSUMED: settled by observing or
  asking inspection technicians].

## What happens today

A real, recent case, told step by step: who noticed, who they contacted, what they
tried, how long it took, how it ended. Synthetic identifiers only.

- MCL receives questions from others about how meters behave. One recurring
  question is how the meter's kWh reading behaves when the supply drop cable is
  connected to the load terminal of the meter [person: ayoraowen, project owner].
- In the most recent case, field inspection technicians had found readings on the
  meter's reverse register, and asked MCL [person: ayoraowen, project owner].
- Reverse-register readings are usually taken as possible unbilled units
  [person: ayoraowen, project owner].
- Some meters have no safeguard that keeps accumulating units on the same register
  when the supply drop cable is terminated on the load terminal. On those meters a
  reversed connection moves consumption to the reverse register
  [person: ayoraowen, project owner]. Which meters these are is open (A1).
- The technicians asked MCL to confirm whether that particular meter has the
  safeguard [person: ayoraowen, project owner].
- MCL set up a simulated test environment with a simulated load, and tested a
  sample of a similar meter to confirm whether it has the safeguard
  [person: ayoraowen, project owner].
- MCL documented the findings for the field technicians
  [person: ayoraowen, project owner].
- Billing on the account was left pending until MCL's findings confirmed the
  cause [person: ayoraowen, project owner].
- How long the wait was is not recorded (A3).

## What it costs

Repeat site visits, call length, wrong disconnections, lost revenue, customer
complaints. A rough figure with a source beats a precise one without.

- **Billing is held.** While MCL confirms whether a meter has the safeguard, billing
  on the account stays pending [person: ayoraowen, project owner].
- The length of the hold, the number of accounts held, and the value of units
  pending are not yet known (A3, A4).

## Why the current options fail

Vendor manuals, vendor support, colleagues, WhatsApp groups, whatever is used now,
and why each falls short.

- **MCL documentation.** MCL documents its findings for future reference across
  the entire company [person: ayoraowen, project owner].
- Even so, the next technician who meets reverse-register readings on the same
  meter model still asks MCL [person: ayoraowen, project owner].
- **Reports, before this app.** MCL's findings were first shared as reports
  [person: ayoraowen, project owner]. Why reports did not stop repeat questions is
  implied (they were not widely or conveniently accessible) but not stated
  [ASSUMED: settled by asking technicians how they looked for reports].
- **This app, now.** MCL's findings are now shared on this app, where they can be
  accessed widely and conveniently [person: ayoraowen, project owner]. The app is
  therefore already in use, and this document specifies it after the fact.
- Technicians can now find MCL's findings in the app themselves
  [person: ayoraowen, project owner].
- The way this is known: MCL directs technicians to the app
  [person: ayoraowen, project owner]. So at least some technicians still contact
  MCL first, and MCL answers by pointing to the app rather than repeating the
  finding. Whether technicians go to the app first, without contacting MCL, is not
  yet known, and neither is whether questions to MCL have fallen (A5).

## Evidence

What shows this is a real problem and not a plausible one.

- A recurring question reaches MCL: how kWh readings behave when the supply drop
  cable is connected to the load terminal [person: ayoraowen, project owner].
- At least one case in which reverse-register readings led to billing being held
  until MCL tested a sample meter [person: ayoraowen, project owner].
- Before the app, the next technician on the same meter model still asked MCL,
  although MCL had documented the finding [person: ayoraowen, project owner].
- No counts yet (A2 to A5). Every item above rests on one person's account.

## Out of scope

Problems this project will not solve, even though they are close.

**Outside this problem statement: error codes and troubleshooting guides.** MCL
is also developing an error-code library for each meter, and step-by-step
troubleshooting guides based on issues reported by field technicians. These serve
customer support when troubleshooting, not inspection technicians looking for
unbilled units [person: ayoraowen, project owner]. They are a separate user and a
separate problem. Whether the app serves both is a stage 2 decision (A6).

**Not yet decided.** Nothing is confirmed as out of scope. Nobody has asked for
anything the owner would refuse [person: ayoraowen, project owner]. Two parts of
the current app were not placed in or out of scope:

- The community discussion page, with its unsourced statistics
  [code: src/pages/Community.tsx].
- Industrial and power-quality meters in the directory seed data
  [code: src/data/meterData.ts], when the case described is a customer's meter at
  their premises.

[ASSUMED: an out-of-scope list, settled by the owner deciding on these two and on
any request that falls outside unbilled-unit anomalies for inspection technicians]

## What the code does today

Which part of the problem the existing app already addresses, and which part it
assumes without evidence.

- **Three users, no primary one.** The page description names "technicians,
  utility staff, and customers" [code: index.html]. The hero names "utility staff"
  resolving "customer energy meter issues" [code: src/components/sections/HeroSection.tsx:39].
  The community page addresses "fellow technicians" [code: src/pages/Community.tsx:54].
- **An owner named only as "MCL".** The hero calls the app "The MCL comprehensive
  resource" [code: src/components/sections/HeroSection.tsx:39]. What MCL is, and its
  relation to Kenya Power, is not stated anywhere.
- **Meters from a template, not the field.** The seeded meters are industrial and
  power-quality meters (Schneider ION 7550, Siemens Sentron PAC3200, GE kV2c) with
  one residential prepaid meter (Landis+Gyr E350) [code: src/data/meterData.ts].
  Whether these are the meters that cause trouble is unsupported.
- **Problem categories assumed.** Search shortcuts offer "E101", "Communication
  Error", "Billing Mismatch" and "Power Outage" [code: src/components/sections/HeroSection.tsx:52-55].
  No source for these being the common problems.
- **Unsourced figures on screen.** The community page shows 1,247 members, 3,892
  discussions, 15,634 verified solutions and 89% of issues resolved as constants
  [code: src/pages/Community.tsx:40-43]. These break the sourced-or-ASSUMED rule.
- **Recent work points somewhere specific.** Since April 2026 the commits add year
  of manufacture, connection type and injected kWh to meters and behaviours
  [code: git log 7123963…c13ea84]. Injected kWh suggests meters that export energy,
  such as solar customers. The problem that drove these fields is not written down.

## Open assumptions

| ID | Assumption | What would settle it | Owner |
|---|---|---|---|
| A1 | Which meter makes and models lack the safeguard, so that a reversed supply connection records on the reverse register | Vendor datasheets or MCL test results per model | ayoraowen |
| A2 | How often reverse-register readings come from a reversed connection rather than from other causes | A count from past MCL cases | ayoraowen |
| A3 | How long billing stays pending from the technician's question to MCL's documented finding | Dates on past MCL requests and their findings | ayoraowen |
| A4 | How many accounts are held pending MCL confirmation, and the value of the units involved | A count and total from billing or MCL records, using aggregates only | ayoraowen |
| A5 | Sharing findings on this app has reduced repeat questions to MCL, and technicians look in the app before contacting MCL | Count of repeat questions to MCL on already-documented meter models, before and after the app; app usage by technicians | ayoraowen |
| A6 | One app should serve both inspection technicians (unbilled-unit anomalies) and customer support (error codes, troubleshooting guides) | A stage 2 decision by the owner, with the cost of serving two users stated | ayoraowen |

## Stress-test log

Objections from `/stress-test 1`. Each has an ID, a severity
(`blocking`, `major`, `minor`), the critic, and a resolution:
`revised`, `accepted as risk`, or `open`.

| ID | Severity | Critic | Objection | Resolution |
|---|---|---|---|---|
