# 01 · Problem statement: prompts

## 2026-09-29 · Stage 1 interview started

**Instruction:** `/stage-interview 1`

Claude read the landing pages, community page, seed data and recent commit
history, and recorded what the code assumes under "What the code does today".
Interview questions and answers follow.

### Q1

> Think of the most recent smart meter problem you saw or heard about that took
> far longer to resolve than it should have. Who was the first person trying to
> fix it, and what were they looking at when they got stuck?

**Answer (verbatim):** "One of the questions MCL gets is on how meter kWh reading
behaves when for example supply drop cable is connected to load terminal of meter"

**Recorded:** under "What happens today". The answer describes a recurring
category of question, not a single case, so Q2 asks for the most recent instance.

### Q2

> Take the most recent time MCL got the reversed-connection question. Who asked,
> and what had they seen on the meter or on a bill that made them ask?

**Answer (verbatim):** "They found readings on the reverse register which is
usually taken as possible unbilled units because some meters do not have safeguard
that ensures that even when meter supply drop cable is terminated on load terminal
of meter, units are still accumulated on the same register"

**Recorded:** under "What happens today", with A1 (which meters lack the
safeguard) and A2 (how often reverse readings mean a reversed connection) added to
open assumptions. "They" is not yet identified, so Q3 asks who, and what was at
stake.

### Q3

> Who were "they" in that case, meaning their role rather than their name, and
> what were they about to do with the account because of the reverse-register
> readings?

**Answer (verbatim):** "they is field inspection technicians who inspect meters
for any anomalies that could lead to unbilled units"

**Recorded:** field inspection technicians as the primary user; MCL recorded as
the party they ask, not the user. The second half of the question (what they were
about to do) was not answered, so Q4 asks for it once more as part of what
happened next.

### Q4

> In that case, what did the technicians do next with the reverse-register
> readings, and how long did it take before they had an answer they could act on?

**Answer (verbatim):** "after seeking confirmation from MCL on whether the
particular meter has safeguards or not, MCL simulated a test environment with a
simulated load to confirm on whether a sample similar meter has the safeguard.
The findings were then documented for the field technicians"

**Recorded:** the three steps (ask MCL, MCL tests a sample under simulated load,
MCL documents findings) under "What happens today". The duration was not given,
so Q5 asks for it together with the cost of waiting.

### Q5

> In that case, roughly how long was it from the technicians' question to MCL's
> documented finding? And what happened to that customer's inspection while they
> waited: was it left open, the customer billed, or something else?

**Answer (verbatim):** "billing was left pending until confirmation from MCL
findings"

**Recorded:** billing held pending under "What happens today" and "What it
costs". The duration was asked twice and not given, so it is recorded as A3
rather than asked again; volume and value added as A4.

### Q6

> Once MCL had documented its finding for that meter model, how did it reach the
> *next* technician who found reverse-register readings on the same model? Did
> that technician still end up asking MCL?

**Answer (verbatim):** "yes hence why MCL documents for future reference of
entire company"

**Recorded:** under "Why the current options fail". Read as: the next technician
still asks MCL, and MCL documents findings company-wide for that reason. This
reading is Claude's and should be confirmed. The answer does not say where the
documentation lives or why it is not found, so Q7 asks.

### Q7

> Where do MCL's documented findings live today: a report, a shared drive, email,
> something else? And when a technician in the field needs one, what stops them
> from finding it?

**Answer (verbatim):** "initially they were shared as reports but now are being
shared on this app where they can be accessed widely and conveniently"

**Recorded:** under "Why the current options fail": reports first, this app now.
The app is already in use, so the stage 1 document specifies it after the fact.
Whether it has reduced repeat questions is added as A5; Q8 asks for evidence.

### Q8

> Since findings moved onto the app, take the most recent time a technician found
> reverse-register readings. Did they find the answer in the app themselves, or
> did they still ask MCL?

**Answer (verbatim):** "they can now find it in the app"

**Recorded:** under "Why the current options fail", and the "Evidence" section
drafted from answers so far. The answer is general rather than a specific case,
so Q9 pushes once for how this is known.

### Q9

> How do you know technicians are finding it in the app? For example, a specific
> technician who told you, fewer of these questions reaching MCL, or usage you can
> see in the app?

**Answer (verbatim):** "MCL directs them to the app"

**Recorded:** under "Why the current options fail". This qualifies Q8: some
technicians still contact MCL first, and MCL points them to the app. A5 widened
to cover whether technicians look in the app first. Pushed once; not asked again.

### Q10

> In that most recent case, where was the technician when they found the
> reverse-register readings, and what device did they have with them to look
> things up?

**Answer (verbatim):** "at the customer's premises with a smartphone"

**Recorded:** under "Primary user". Signal, workload and customer presence
recorded as unknown rather than asked, to keep the interview short; the field-user
critic will press on them.

### Q11

> Has anyone asked for something to be added to this app that you think it
> shouldn't do? What was it?

**Answer (verbatim):** "Not really"

**Recorded:** nothing yet. Out of scope cannot be empty, so Q12 pushes once from
a different angle: the parts of the app that already go beyond the problem
described.

### Q12

> Which of those [error-code library, troubleshooting guides, community page,
> industrial power-quality meters] are part of the problem MCL is solving, and
> which would you put outside it?

**Answer (verbatim):** "MCl is also trying to develop an error code library for
each meter as well as a step-by-step troubleshooting guide based on reported
issues from field technicians"

**Recorded:** error codes and guides confirmed in scope under "Out of scope".
Community page and industrial meters not addressed; recorded as undecided, with
out of scope marked ASSUMED. Pushed once; not asked again.

Claude then drafted "The problem in one sentence" from the owner's phrases in
Q1 to Q5, and Q13 asks the owner to correct it.

### Q13

> Rewrite that sentence in the words you'd use to explain the problem to a Kenya
> Power manager. Change anything that's wrong, and say whether it should cover
> error codes and troubleshooting too, or stay focused on unbilled-unit anomalies.

**Answer (verbatim):** "keep it focused on unbilled-unit anomalies, sentence is
fine. the other such as error codes are for customer support when troubleshooting"

**Kept:** the drafted sentence, unchanged.

**Rejected framing:** the Q12 recording, which put error codes and guides "in
scope, confirmed" as part of this problem. The owner's reason: they serve a
different user, customer support. Rewritten under "Out of scope" as outside this
problem statement, with A6 deferring the one-app-or-two decision to stage 2.

## Interview closed

Every section has content or an explicit assumption. Ready for `/stress-test 1`.
