"""
Google Search Console API에서 성과 데이터를 가져와 data/search-console.json 으로 저장하는 스크립트.

인증 방식 (우선순위대로 시도):
  1. GOOGLE_ACCESS_TOKEN 환경변수 — GitHub Actions에서 Workload Identity Federation으로
     발급받은 access token을 그대로 사용합니다 (권장, 키 파일 불필요).
  2. GSC_SERVICE_ACCOUNT_KEY_B64 / GSC_SERVICE_ACCOUNT_KEY 환경변수 — 서비스 계정 JSON 키를
     쓸 수 있는 환경(조직 정책이 키 발급을 막지 않는 경우)에서 로컬 테스트용으로만 사용합니다.

  GSC_SITE_URLS : 콤마(,)로 구분한 Search Console 속성 URL 목록.
                  여러 개를 합산해서 하나의 결과로 만듭니다.
                  (기본값: 예전 GitHub Pages 주소 + 새 ododok.kr 도메인)
  GSC_SITE_URL  : 예전 방식 호환용 - 속성 하나만 넘길 때 사용 (있으면 GSC_SITE_URLS보다 우선).

  ※ 여러 속성을 합산하려면, 그 서비스 계정이 각 속성에 Search Console
    "사용자 및 권한"에 등록되어 있어야 합니다. 등록 안 된 속성은 건너뜁니다.
"""

import base64
import json
import os
from datetime import date, datetime, timedelta, timezone

import requests

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
API_BASE = "https://www.googleapis.com/webmasters/v3"
DEFAULT_SITE_URLS = [
    "https://dongmin1.github.io/Ododok/",
    "https://ododok.kr/",
]
OUTPUT_PATH = os.path.join("data", "search-console.json")


def get_access_token():
    # 1) Workload Identity Federation으로 GitHub Actions가 발급한 access token (권장 경로)
    token = os.environ.get("GOOGLE_ACCESS_TOKEN")
    if token:
        return token

    # 2) 서비스 계정 키 파일 (로컬 테스트용 대체 경로. 조직 정책으로 키 발급이 막혀 있다면 사용 불가)
    key_b64 = os.environ.get("GSC_SERVICE_ACCOUNT_KEY_B64")
    key_json = os.environ.get("GSC_SERVICE_ACCOUNT_KEY")
    if key_b64 or key_json:
        from google.auth.transport.requests import Request
        from google.oauth2 import service_account

        info = json.loads(base64.b64decode(key_b64)) if key_b64 else json.loads(key_json)
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
        creds.refresh(Request())
        return creds.token

    raise RuntimeError(
        "GOOGLE_ACCESS_TOKEN 또는 GSC_SERVICE_ACCOUNT_KEY(_B64) 환경변수가 필요합니다."
    )


def get_site_urls():
    single = os.environ.get("GSC_SITE_URL")
    if single:
        return [single]
    multi = os.environ.get("GSC_SITE_URLS")
    if multi:
        return [s.strip() for s in multi.split(",") if s.strip()]
    return DEFAULT_SITE_URLS


def query(token, site_url, body):
    encoded_site = requests.utils.quote(site_url, safe="")
    url = f"{API_BASE}/sites/{encoded_site}/searchAnalytics/query"

    resp = requests.post(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json=body,
        timeout=30,
    )
    if resp.status_code == 403:
        # 이 속성에 서비스 계정 권한이 없는 경우 - 건너뛰고 나머지 속성으로 계속 진행
        print(f"WARN  {site_url} 에 접근 권한이 없어 건너뜁니다 (403).")
        return {"rows": []}
    resp.raise_for_status()
    return resp.json()


def to_row(r):
    return {
        "key": r["keys"][0],
        "clicks": r.get("clicks", 0),
        "impressions": r.get("impressions", 0),
        "ctr": round(r.get("ctr", 0), 4),
        "position": round(r.get("position", 0), 2),
    }


def merge_rows(row_lists):
    """같은 key(날짜/검색어/페이지)를 가진 행들을 합산합니다."""
    merged = {}
    for rows in row_lists:
        for r in rows:
            key = r["keys"][0]
            if key not in merged:
                merged[key] = {"clicks": 0, "impressions": 0, "position_weighted": 0.0}
            merged[key]["clicks"] += r.get("clicks", 0)
            merged[key]["impressions"] += r.get("impressions", 0)
            merged[key]["position_weighted"] += r.get("position", 0) * r.get("impressions", 0)
    result = []
    for key, v in merged.items():
        impressions = v["impressions"]
        position = (v["position_weighted"] / impressions) if impressions else 0
        ctr = (v["clicks"] / impressions) if impressions else 0
        result.append(
            {
                "keys": [key],
                "clicks": v["clicks"],
                "impressions": impressions,
                "ctr": round(ctr, 4),
                "position": round(position, 2),
            }
        )
    return result


def main():
    site_urls = get_site_urls()
    token = get_access_token()

    # Search Console 데이터는 통상 2~3일 지연되어 확정되므로 최근 2일은 제외합니다.
    end = date.today() - timedelta(days=2)
    start = end - timedelta(days=89)  # 최근 약 3개월

    date_range = {"startDate": start.isoformat(), "endDate": end.isoformat()}

    daily_lists, query_lists, page_lists = [], [], []
    for site_url in site_urls:
        daily = query(token, site_url, {**date_range, "dimensions": ["date"], "rowLimit": 100})
        daily_lists.append(daily.get("rows", []))
        query_lists.append(
            query(token, site_url, {**date_range, "dimensions": ["query"], "rowLimit": 20}).get(
                "rows", []
            )
        )
        page_lists.append(
            query(token, site_url, {**date_range, "dimensions": ["page"], "rowLimit": 20}).get(
                "rows", []
            )
        )

    daily_rows = merge_rows(daily_lists)
    daily_rows.sort(key=lambda r: r["keys"][0])
    query_rows = merge_rows(query_lists)
    query_rows.sort(key=lambda r: r["impressions"], reverse=True)
    page_rows = merge_rows(page_lists)
    page_rows.sort(key=lambda r: r["impressions"], reverse=True)

    total_clicks = sum(r.get("clicks", 0) for r in daily_rows)
    total_impressions = sum(r.get("impressions", 0) for r in daily_rows)
    avg_ctr = (total_clicks / total_impressions) if total_impressions else 0
    avg_position = (
        sum(r.get("position", 0) * r.get("impressions", 0) for r in daily_rows) / total_impressions
        if total_impressions
        else 0
    )

    output = {
        "siteUrls": site_urls,
        "range": date_range,
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "totals": {
            "clicks": total_clicks,
            "impressions": total_impressions,
            "ctr": round(avg_ctr, 4),
            "position": round(avg_position, 2),
        },
        "daily": [
            {
                "date": r["keys"][0],
                "clicks": r.get("clicks", 0),
                "impressions": r.get("impressions", 0),
                "ctr": round(r.get("ctr", 0), 4),
                "position": round(r.get("position", 0), 2),
            }
            for r in daily_rows
        ],
        "topQueries": [to_row(r) for r in query_rows[:20]],
        "topPages": [to_row(r) for r in page_rows[:20]],
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(
        f"OK  sites={len(site_urls)}  clicks={total_clicks}  impressions={total_impressions}  "
        f"ctr={avg_ctr:.2%}  position={avg_position:.2f}  -> {OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()
