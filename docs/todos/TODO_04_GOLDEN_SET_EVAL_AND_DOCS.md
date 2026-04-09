# TODO 04 — Golden Set, Eval Script, and Documentation

## Objective
Extend the 5 seed cases to 10+ golden test cases, build the eval CLI script, and write README.md and NOTES.md with all required content.

## Why This Matters
The golden set demonstrates edge-case thinking — a core evaluation criterion. The eval script proves the system works. README and NOTES are explicit deliverables that the reviewers will read first.

## Scope
- Include the 5 seed cases from the brief
- Add 5+ additional edge cases covering required categories
- Build eval.py CLI script
- Write README.md with full run/switch/eval instructions
- Write NOTES.md with strategy rationale, trade-offs, limitations

## Detailed Tasks

- [ ] Create `golden_set.json` with 5 seed cases (exact from brief)
- [ ] Add case: ambiguous keyword (common word matches two candidates, semantics must disambiguate)
- [ ] Add case: empty candidate list (candidate_links=[] must not break)
- [ ] Add case: match just below threshold (best candidate exists but too weak)
- [ ] Add case: two candidates with similar scores (margin logic decides)
- [ ] Add case: custom edge case — URL present as plain text (not markdown link) in llm_answer
- [ ] Add case (bonus): chitchat with grounded=true (R1 takes precedence over grounding)
- [ ] Create `eval.py` that loads golden_set.json, hits /guardrail for each case, prints per-case pass/fail + aggregated accuracy
- [ ] Save eval output to `eval_output.txt`
- [ ] Write `README.md` with all required sections
- [ ] Write `NOTES.md` with all required sections

## Golden Set Cases Plan (10+ total)

| # | ID | Category | Expected Status |
|---|----|----------|-----------------|
| 1 | seed_01_grounded_inject | Seed — basic injection | injected |
| 2 | seed_02_grounded_already_present | Seed — already present | already_present |
| 3 | seed_03_chitchat_skip | Seed — chitchat | skipped_chitchat |
| 4 | seed_04_ungrounded_skip | Seed — ungrounded | skipped_ungrounded |
| 5 | seed_05_no_match | Seed — no match | skipped_no_match |
| 6 | edge_06_ambiguous_keyword | Ambiguous keyword | injected (semantic disambiguates) |
| 7 | edge_07_empty_candidates | Empty candidate list | skipped_no_match |
| 8 | edge_08_below_threshold | Below threshold | skipped_no_match |
| 9 | edge_09_similar_scores | Two close candidates | skipped_no_match (margin) |
| 10 | edge_10_url_plain_text | URL as plain text in answer | already_present |
| 11 | edge_11_chitchat_grounded | Chitchat + grounded=true | skipped_chitchat (R1 priority) |

## Eval Script Design
```python
# eval.py
# Usage: python eval.py [--base-url http://localhost:8000]
# 1. Load golden_set.json
# 2. For each case, POST to /guardrail
# 3. Compare actual status vs expected status
# 4. Compare matched_label if expected
# 5. Print per-case: id, expected, actual, pass/fail
# 6. Print aggregated: correct_decision_rate
```

## Acceptance Criteria
- [ ] golden_set.json has >= 10 cases
- [ ] All 5 seed cases match expected output
- [ ] Each required edge case category is represented
- [ ] eval.py runs with `python eval.py` and prints clear output
- [ ] eval_output.txt contains saved results
- [ ] README.md includes: what it is, stack, install, run, HF/OpenAI switch, HF model name, eval usage, golden set location, video placeholder
- [ ] NOTES.md includes: strategy choice + why, one trade-off, one limitation, assumptions, dangerous failure mode, one-week addition

## Files Created/Modified
- `golden_set.json`
- `eval.py`
- `eval_output.txt`
- `README.md`
- `NOTES.md`

## Risks / Pitfalls
- Edge cases that are too contrived or don't test real behavior
- Eval script assuming server is running — document this clearly
- Threshold tuning making edge cases fragile

## Validation Steps
- Start server
- Run `python eval.py`
- Verify 100% on seed cases
- Verify edge cases produce expected statuses
- Read README and confirm instructions work
- Read NOTES and confirm all required sections present

## Commit Checkpoint
`feat: add golden set, eval script, README, and NOTES`

## Final Status
- **Status:** Done
- **Completion Notes:** 11 golden set cases (5 seed + 6 edge). eval.py passes 11/11. README and NOTES complete with all required sections.
