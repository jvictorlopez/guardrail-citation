#!/usr/bin/env python3
"""Evaluation script for the Citation Guardrail Engine.

Loads the golden set, sends each case to the running server,
and reports per-case pass/fail plus aggregated accuracy.

Usage:
    python eval.py [--base-url http://localhost:8000]
"""

import argparse
import json
import sys

import httpx


def load_golden_set(path: str = "golden_set.json") -> list[dict]:
    with open(path) as f:
        return json.load(f)


def run_eval(base_url: str, golden_set: list[dict]) -> tuple[list[dict], float]:
    results = []
    passed = 0

    for case in golden_set:
        case_id = case["id"]
        expected = case["expected"]

        try:
            resp = httpx.post(
                f"{base_url}/guardrail",
                json=case["input"],
                timeout=30.0,
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            results.append({
                "id": case_id,
                "expected_status": expected["status"],
                "actual_status": "ERROR",
                "expected_label": expected.get("matched_label"),
                "actual_label": None,
                "pass": False,
                "error": str(e),
            })
            continue

        actual_status = data["citation_decision"]["status"]
        actual_label = data["citation_decision"]["matched_label"]
        expected_status = expected["status"]
        expected_label = expected.get("matched_label")

        status_ok = actual_status == expected_status
        label_ok = actual_label == expected_label if expected_label is not None else True
        case_pass = status_ok and label_ok

        if case_pass:
            passed += 1

        results.append({
            "id": case_id,
            "expected_status": expected_status,
            "actual_status": actual_status,
            "expected_label": expected_label,
            "actual_label": actual_label,
            "pass": case_pass,
            "strategy_used": data["citation_decision"].get("strategy_used"),
            "similarity_score": data["citation_decision"].get("similarity_score"),
            "reason": data["citation_decision"].get("reason"),
        })

    accuracy = passed / len(golden_set) if golden_set else 0.0
    return results, accuracy


def print_results(results: list[dict], accuracy: float) -> None:
    print("=" * 80)
    print("CITATION GUARDRAIL — EVAL RESULTS")
    print("=" * 80)
    print()

    for r in results:
        mark = "PASS" if r["pass"] else "FAIL"
        print(f"  [{mark}] {r['id']}")
        print(f"         expected: status={r['expected_status']}, label={r['expected_label']}")
        print(f"         actual:   status={r['actual_status']}, label={r['actual_label']}")
        if r.get("strategy_used"):
            print(f"         strategy: {r['strategy_used']}, score={r.get('similarity_score')}")
        if r.get("reason"):
            print(f"         reason:   {r['reason']}")
        if r.get("error"):
            print(f"         error:    {r['error']}")
        print()

    print("-" * 80)
    total = len(results)
    passed = sum(1 for r in results if r["pass"])
    print(f"  TOTAL: {passed}/{total} passed")
    print(f"  correct_decision_rate: {accuracy:.2%}")
    print("-" * 80)


def main():
    parser = argparse.ArgumentParser(description="Evaluate the Citation Guardrail Engine")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Base URL of the running server")
    parser.add_argument("--golden-set", default="golden_set.json", help="Path to golden set JSON file")
    args = parser.parse_args()

    golden_set = load_golden_set(args.golden_set)
    print(f"Loaded {len(golden_set)} test cases from {args.golden_set}")
    print(f"Targeting server at {args.base_url}")
    print()

    results, accuracy = run_eval(args.base_url, golden_set)
    print_results(results, accuracy)

    # Exit with non-zero if any case failed
    if accuracy < 1.0:
        sys.exit(1)


if __name__ == "__main__":
    main()
