"""
NeuroCode AI — Prototype Performance & Benchmarking Suite
Measures latency, throughput, and reliability across all endpoints.
"""
import time
import json
import statistics
import httpx
import asyncio

BASE_URL = "http://localhost:8000"

# ── Test Payloads ──
SMALL_CODE = {
    "code": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)",
    "language": "python"
}

MEDIUM_CODE = {
    "code": (
        "class Calculator:\n"
        "    def __init__(self):\n"
        "        self.result = 0\n"
        "    def add(self, x):\n"
        "        self.result += x\n"
        "        return self\n"
        "    def subtract(self, x):\n"
        "        self.result -= x\n"
        "        return self\n"
        "    def multiply(self, x):\n"
        "        self.result *= x\n"
        "        return self\n"
        "    def get_result(self):\n"
        "        return self.result"
    ),
    "language": "python"
}

LARGE_CODE = {
    "code": (
        "import os\nimport json\nimport logging\n\n"
        "logger = logging.getLogger(__name__)\n\n"
        "class DataProcessor:\n"
        "    def __init__(self, config):\n"
        "        self.config = config\n"
        "        self.data = []\n"
        "        self.errors = []\n\n"
        "    def load_data(self, filepath):\n"
        "        if not os.path.exists(filepath):\n"
        "            raise FileNotFoundError(f'{filepath} not found')\n"
        "        with open(filepath, 'r') as f:\n"
        "            self.data = json.load(f)\n"
        "        logger.info(f'Loaded {len(self.data)} records')\n\n"
        "    def validate(self):\n"
        "        valid = []\n"
        "        for record in self.data:\n"
        "            if self._is_valid(record):\n"
        "                valid.append(record)\n"
        "            else:\n"
        "                self.errors.append(record)\n"
        "        self.data = valid\n"
        "        return len(self.errors)\n\n"
        "    def _is_valid(self, record):\n"
        "        required = self.config.get('required_fields', [])\n"
        "        return all(field in record for field in required)\n\n"
        "    def transform(self):\n"
        "        return [self._transform_record(r) for r in self.data]\n\n"
        "    def _transform_record(self, record):\n"
        "        return {k: str(v).strip() for k, v in record.items()}\n\n"
        "    def summary(self):\n"
        "        return {\n"
        "            'total': len(self.data),\n"
        "            'errors': len(self.errors),\n"
        "            'success_rate': len(self.data) / max(len(self.data) + len(self.errors), 1)\n"
        "        }\n"
    ),
    "language": "python"
}


def fmt_ms(seconds):
    return f"{seconds * 1000:.1f} ms"


def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def print_row(label, value, unit=""):
    print(f"  {label:<30} {value:>10} {unit}")


def benchmark_endpoint(client, method, url, payload=None, iterations=5, label=""):
    """Run multiple requests and collect timing stats."""
    times = []
    errors = 0
    status_codes = []

    for i in range(iterations):
        start = time.perf_counter()
        try:
            if method == "GET":
                resp = client.get(url, timeout=60)
            else:
                resp = client.post(url, json=payload, timeout=60)
            elapsed = time.perf_counter() - start
            times.append(elapsed)
            status_codes.append(resp.status_code)
            if resp.status_code >= 400:
                errors += 1
        except Exception as e:
            elapsed = time.perf_counter() - start
            times.append(elapsed)
            errors += 1
            status_codes.append(0)

    avg = statistics.mean(times)
    med = statistics.median(times)
    mn = min(times)
    mx = max(times)
    p95 = sorted(times)[int(len(times) * 0.95)] if len(times) > 1 else times[0]

    print(f"\n  📊 {label}")
    print(f"  {'─'*50}")
    print_row("Iterations", iterations)
    print_row("Success Rate", f"{((iterations - errors) / iterations) * 100:.0f}", "%")
    print_row("Avg Latency", fmt_ms(avg))
    print_row("Median Latency", fmt_ms(med))
    print_row("Min Latency", fmt_ms(mn))
    print_row("Max Latency", fmt_ms(mx))
    print_row("P95 Latency", fmt_ms(p95))

    return {
        "label": label,
        "avg_ms": avg * 1000,
        "median_ms": med * 1000,
        "min_ms": mn * 1000,
        "max_ms": mx * 1000,
        "p95_ms": p95 * 1000,
        "errors": errors,
        "iterations": iterations,
    }


async def concurrent_benchmark(url, payload, concurrency=5, label=""):
    """Simulate concurrent users hitting the analyze endpoint."""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=60) as client:
        async def single_request():
            start = time.perf_counter()
            try:
                resp = await client.post(url, json=payload)
                elapsed = time.perf_counter() - start
                return elapsed, resp.status_code
            except Exception:
                elapsed = time.perf_counter() - start
                return elapsed, 0

        tasks = [single_request() for _ in range(concurrency)]
        wall_start = time.perf_counter()
        results = await asyncio.gather(*tasks)
        wall_time = time.perf_counter() - wall_start

    times = [r[0] for r in results]
    errors = sum(1 for r in results if r[1] >= 400 or r[1] == 0)
    throughput = concurrency / wall_time

    print(f"\n  🔄 {label} ({concurrency} concurrent)")
    print(f"  {'─'*50}")
    print_row("Concurrent Requests", concurrency)
    print_row("Wall Clock Time", fmt_ms(wall_time))
    print_row("Throughput", f"{throughput:.2f}", "req/s")
    print_row("Avg Latency", fmt_ms(statistics.mean(times)))
    print_row("Max Latency", fmt_ms(max(times)))
    print_row("Errors", errors)


def measure_response_size(client, url, payload=None, method="GET"):
    if method == "GET":
        resp = client.get(url, timeout=60)
    else:
        resp = client.post(url, json=payload, timeout=60)
    body = resp.text
    return len(body), resp.status_code


def main():
    print("\n" + "🧠 " * 15)
    print("   NEUROCODE AI — PERFORMANCE & BENCHMARK REPORT")
    print("🧠 " * 15)

    client = httpx.Client(base_url=BASE_URL, timeout=60)

    # ── 1. Health Check ──
    print_header("1. HEALTH CHECK BENCHMARK")
    health_result = benchmark_endpoint(client, "GET", "/health", iterations=10, label="GET /health")

    # ── 2. Response Sizes ──
    print_header("2. RESPONSE PAYLOAD SIZES")
    for name, payload in [("Small (4 LOC)", SMALL_CODE), ("Medium (14 LOC)", MEDIUM_CODE), ("Large (40 LOC)", LARGE_CODE)]:
        size, code = measure_response_size(client, "/analyze", payload, "POST")
        print_row(f"  {name}", f"{size:,}", "bytes")

    # ── 3. Analyze – Varying Code Sizes ──
    print_header("3. ANALYZE ENDPOINT — BY CODE SIZE")
    results = []
    for name, payload in [("Small (4 LOC)", SMALL_CODE), ("Medium (14 LOC)", MEDIUM_CODE), ("Large (40 LOC)", LARGE_CODE)]:
        r = benchmark_endpoint(client, "POST", "/analyze", payload, iterations=3, label=f"POST /analyze — {name}")
        results.append(r)

    # ── 4. Concurrent Load Test ──
    print_header("4. CONCURRENT LOAD TEST")
    asyncio.run(concurrent_benchmark("/analyze", SMALL_CODE, concurrency=3, label="3 Concurrent /analyze"))
    asyncio.run(concurrent_benchmark("/analyze", SMALL_CODE, concurrency=5, label="5 Concurrent /analyze"))

    # ── 5. AWS Service Integration Status ──
    print_header("5. AWS SERVICE STATUS")
    resp = client.get("/health", timeout=10)
    data = resp.json()
    services = data.get("services", {})
    for svc, ok in services.items():
        status = "✅ Connected" if ok else "❌ Unavailable"
        print(f"  {svc:<15} {status}")

    # ── 6. Summary Table ──
    print_header("6. PERFORMANCE SUMMARY")
    print(f"  {'Endpoint':<35} {'Avg':>10} {'P95':>10} {'Min':>10} {'Max':>10}")
    print(f"  {'─'*75}")
    print(f"  {'GET /health':<35} {fmt_ms(health_result['avg_ms']/1000):>10} {fmt_ms(health_result['p95_ms']/1000):>10} {fmt_ms(health_result['min_ms']/1000):>10} {fmt_ms(health_result['max_ms']/1000):>10}")
    for r in results:
        print(f"  {r['label']:<35} {fmt_ms(r['avg_ms']/1000):>10} {fmt_ms(r['p95_ms']/1000):>10} {fmt_ms(r['min_ms']/1000):>10} {fmt_ms(r['max_ms']/1000):>10}")

    # ── 7. Verdict ──
    print_header("7. BENCHMARK VERDICT")
    avg_analyze = statistics.mean([r["avg_ms"] for r in results])
    if avg_analyze < 2000:
        verdict = "🟢 EXCELLENT — Sub-2s average response"
    elif avg_analyze < 5000:
        verdict = "🟡 GOOD — Under 5s average response"
    elif avg_analyze < 10000:
        verdict = "🟠 ACCEPTABLE — Under 10s (AI processing overhead)"
    else:
        verdict = "🔴 NEEDS OPTIMIZATION — Over 10s average"
    print(f"  Average /analyze latency: {avg_analyze:.0f} ms")
    print(f"  Verdict: {verdict}")
    print(f"  Health endpoint: {health_result['avg_ms']:.0f} ms avg (target < 500 ms)")
    total_errors = sum(r["errors"] for r in results) + health_result["errors"]
    print(f"  Total Errors: {total_errors}")
    reliability = ((sum(r["iterations"] for r in results) + health_result["iterations"] - total_errors) /
                   (sum(r["iterations"] for r in results) + health_result["iterations"])) * 100
    print(f"  Reliability: {reliability:.1f}%")
    print()

    client.close()


if __name__ == "__main__":
    main()
