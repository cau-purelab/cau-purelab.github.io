"""
patch_publications.py
---------------------
publications.json의 데이터 불일치를 수정하고 누락된 논문을 추가한다.
Google Sites (https://sites.google.com/view/seungminrho) 기준으로 최신화.

실행: python scripts/patch_publications.py
"""

import json
import re
import sys
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'publications.json')


def normalize(title: str) -> str:
    return re.sub(r'[^a-z0-9]', '', title.lower())


# ──────────────────────────────────────────────────────────────
# 아래 4개 배열에 패치를 추가한 뒤 실행하면 publications.json에 반영된다.
# 이전 패치(2026-05-07, 2026-06-04)는 모두 적용 완료되어 비워둠 —
# 적용 이력은 git log로 확인할 것. 적용이 끝난 패치는 다시 비워둘 것.
# ──────────────────────────────────────────────────────────────

# 1. 기존 is_progress 항목 필드 수정 (Google Sites 기준으로 학술지명/상태 정정)
#    예: {"match": "제목 일부", "updates": {"journal": "새 학술지명"}, "reason": "근거"}
FIELD_PATCHES = []

# 2. is_progress → 출판 완료로 전환 (Google Sites published 섹션에 등장)
#    예: {"match": "제목 일부", "bibtex": "@article{...}", "url": "https://doi.org/...", "reason": "근거"}
CONVERT_TO_PUBLISHED = []

# 3. 신규 is_progress 논문 추가
#    예: {"title": ..., "author": ..., "journal": ..., "status": ..., "funding_tags": [...], "year": ..., "is_progress": True}
NEW_PROGRESS_PAPERS = []

# 4. 신규 출판 완료 논문 추가 (DOI 확인)
#    예: {"title": ..., "url": "https://doi.org/...", "bibtex": "@article{...}", "funding_tags": [...]}
NEW_PUBLISHED_PAPERS = []


# ──────────────────────────────────────────────────────────────
# 실행
# ──────────────────────────────────────────────────────────────
def main():
    sys.stdout.reconfigure(encoding='utf-8')

    if not os.path.exists(OUTPUT_PATH):
        print(f"❌ 파일 없음: {OUTPUT_PATH}")
        sys.exit(1)

    with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    rho_pubs = data.get("Seungmin Rho", [])
    existing_norms = {normalize(p.get('title', '')): i for i, p in enumerate(rho_pubs)}

    changed = 0

    # 1. 필드 수정
    for patch in FIELD_PATCHES:
        for pub in rho_pubs:
            if patch["match"].lower() in pub.get("title", "").lower():
                for field, val in patch["updates"].items():
                    old = pub.get(field, "")
                    if old != val:
                        pub[field] = val
                        print(f"[FIXED] {pub['title'][:55]}")
                        print(f"   {field}: '{old}' -> '{val}'")
                        print(f"   reason: {patch['reason']}")
                        changed += 1

    # 2. is_progress → 출판 전환
    for conv in CONVERT_TO_PUBLISHED:
        for i, pub in enumerate(rho_pubs):
            if conv["match"].lower() in pub.get("title", "").lower():
                if pub.get("is_progress"):
                    preserved_tags = pub.get("funding_tags", [])
                    rho_pubs[i] = {
                        "title": pub["title"],
                        "url": conv["url"],
                        "bibtex": conv["bibtex"],
                        "funding_tags": preserved_tags,
                    }
                    print(f"[CONVERTED] {pub['title'][:55]}")
                    print(f"   reason: {conv['reason']}")
                    changed += 1

    # 3. 신규 is_progress 추가 (중복 체크)
    for prog in NEW_PROGRESS_PAPERS:
        norm = normalize(prog["title"])
        if norm not in existing_norms:
            rho_pubs.insert(0, prog)
            existing_norms[norm] = 0
            print(f"[ADDED-PROGRESS] {prog['title'][:60]}")
            changed += 1
        else:
            print(f"[SKIP] already exists: {prog['title'][:60]}")

    # 4. 신규 출판 완료 추가 (중복 체크)
    progress_count = sum(1 for p in rho_pubs if p.get("is_progress"))
    for pub in NEW_PUBLISHED_PAPERS:
        norm = normalize(pub["title"])
        if norm not in existing_norms:
            rho_pubs.insert(progress_count, pub)
            existing_norms[norm] = progress_count
            print(f"[ADDED-PUBLISHED] {pub['title'][:60]}")
            changed += 1
        else:
            print(f"[SKIP] already exists: {pub['title'][:60]}")

    data["Seungmin Rho"] = rho_pubs

    if changed > 0:
        with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"\nDONE: {changed} changes applied. Saved: {OUTPUT_PATH}")
    else:
        print("\nDONE: No changes (already up to date)")


if __name__ == "__main__":
    main()
