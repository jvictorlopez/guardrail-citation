"""In-memory health counters."""

from collections import defaultdict

counters: dict[str, int] = defaultdict(int)


def increment(status: str) -> None:
    counters[status] += 1


def get_counters() -> dict[str, int]:
    return dict(counters)
