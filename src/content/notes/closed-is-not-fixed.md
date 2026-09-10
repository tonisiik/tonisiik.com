---
title: 'Closed Is Not the Same as Fixed'
description: Why closing an action and fixing the problem are different claims — and why most systems that track "done" are only tracking the first one.
category: Quality Systems
tags:
- Verification
- Quality Engineering
- Process Discipline
---

# Closed Is Not the Same as Fixed

Most shop-floor and quality systems measure themselves by the same metric: how many open items got closed this week. A red status turns green, an action gets a checkmark, and the system counts it as resolved. That number is easy to report and easy to game, and it is measuring the wrong thing.

Closing an action means someone did what the action said. It says nothing about whether the underlying problem went away. A machine gets adjusted, a training reminder gets sent, a work instruction gets updated — the ticket closes — and three weeks later the same defect shows up on a different shift, filed as a new issue because nobody connected it to the last one. The system reports a 100% closure rate on a problem that was never actually solved even once.

The fix is to track two different things instead of one, and never let the second substitute for the first:

- Was a decision made, and did it get acted on — the thing "closed" actually measures.
- Did the fix hold — no recurrence over a defined window, checked, not assumed.

Only the second is a claim about the problem. The first is a claim about paperwork. Conflating them produces the familiar pattern of a shop floor that is constantly busy — meetings held, actions assigned, boards full of green — with a scrap rate that hasn't moved in a year. Activity isn't evidence of change; only the absence of recurrence is, checked on a timescale long enough for the process to actually cycle back through the failure mode, not the timescale of the next stand-up.

Stated plainly, this sounds obvious. It stays rare in practice because the two claims get collapsed into a single status field almost everywhere they're built — and once "closed" means both "the action happened" and "the problem is gone," a system will always report more progress than actually occurred. Not through dishonesty. Through the metric doing exactly what it was built to do.
