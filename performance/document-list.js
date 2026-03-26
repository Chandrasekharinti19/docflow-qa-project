import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "20s",
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = "http://localhost:5000";

export default function () {
  const res = http.get(`${BASE_URL}/api/documents`);

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time under 800ms": (r) => r.timings.duration < 800,
  });

  sleep(1);
}