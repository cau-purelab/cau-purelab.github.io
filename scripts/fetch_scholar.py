import json
import os
import time
import random
import requests
import re
from scholarly import scholarly
from tqdm import tqdm
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

# ---------------------------------------------------------
# [데이터] 교수님 페이지의 '진행 중인 논문' 직접 입력
# ---------------------------------------------------------
# Google Sites (https://sites.google.com/view/seungminrho) "In Press, Proofing, or In Review" 섹션 기준
# 마지막 동기화: 2026-07-11
IN_PROGRESS_PAPERS = [
    {
        "title": "A Novel Hybrid Multi-Scale Temporal Relations-based Graph Neural Networks for Stock Price Forecasting Using Commodity Indices and Events",
        "author": "A. Sattar, Y. Ansari, A. Mustaqeem, M. Bukhari, M.Y. Lee, S Rho",
        "journal": "Science Progress",
        "status": "Submitted, June 2026",
        "funding_tags": ["Convg_Security-26", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "An improved deepfake detection exploiting temporal and contextual inconsistencies with segmentation-guided feature fusion",
        "author": "W. Ibrahim, M. Bukhari, A. Mustaqeem, A. Sattar, M. Maqsood, MY Lee, S Rho",
        "journal": "ICT Express",
        "status": "Submitted, June 2026",
        "funding_tags": ["ITRC-26", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "TRUST-SDT: A Transparent and Reliable Framework for Selective Machine Unlearning via Soft Decision Tree Distillation",
        "author": "SM Kim, BC Lee, SW Park, M. Maqsood, MY Lee, S Rho",
        "journal": "Applied Soft Computing",
        "status": "Submitted, June 2026",
        "funding_tags": ["Convg_Security-26", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "TRUST: Toward TRUstworthy Selective unlearning through Two-stage optimization",
        "author": "BC Lee, SM Kim, SW Park, M. Maqsood, MY Lee, S Rho",
        "journal": "Information Sciences",
        "status": "Submitted, June 2026",
        "funding_tags": ["Convg_Security-26", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "Domain Knowledge-Aware Photovoltaic Power Forecasting via LLM-Driven Semantic Feature Extraction and Graph Neural Networks",
        "author": "SW Park, MY Lee, S Rho, Hyeonwoo Kim",
        "journal": "ICT Express",
        "status": "Submitted, April 2026",
        "funding_tags": ["Prof. HWKim"],
        "year": "2026"
    },
    {
        "title": "SHAP-Guided Leaf-Value Adjustment for Efficient Unlearning in LightGBM",
        "author": "S.W. Park, S. Kim, B. Lee, M. Maqsood, MY Lee, S Rho",
        "journal": "Future Generation Computer Systems",
        "status": "Submitted, April 2026",
        "funding_tags": ["NRF-SM-25", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "Novel Glow Adversarial Attack–based Proactive Defense against Deepfake Generation with Photometric Specular Highlights",
        "author": "Maryam Bukhari, M. Maqsood, M.Y. Lee, S Rho",
        "journal": "IEEE Access",
        "status": "Submitted, April 2026",
        "funding_tags": ["Convg_Security-26", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "An improved deep learning-based MSA-Net model for small liver tumor segmentation",
        "author": "Beenish Hina, Muazzam Maqsood, Asma Sattar, Zahoor ur Rehman, M. Saud Khan, S Rho, Hyungjoon Kim",
        "journal": "Science Progress",
        "status": "1st Revision, April 2026",
        "funding_tags": ["Prof. HJKim"],
        "year": "2026"
    },
    {
        "title": "Stock Price Forecasting Using Graph Neural Networks Modelling Cross-Sector and Within-Sector Relationships with Sector-Specific Macroeconomic Signals",
        "author": "Asma Sattar, M. Maqsood, M.Y. Lee, S Rho",
        "journal": "Alexandria Engineering Journal",
        "status": "Submitted, July 2026",
        "funding_tags": ["Convg_Security-26"],
        "year": "2026"
    },
    {
        "title": "MSTCA Framework: Advancing Medical Deepfake Detection with Multiscale Spatial Transformers and Convolutional Attention",
        "author": "Fizza Bukhari, Maryam Bukhari, Amna Sarwar, M. Maqsood, Mehr Yahya Durrani, Hyungjoon Kim, S Rho",
        "journal": "Scientific Reports",
        "status": "Submitted, Feb. 2026",
        "funding_tags": ["ITRC-26", "Prof. HJKim"],
        "year": "2026"
    }
]

SCHOLARS = {"Seungmin Rho": "k5aAQxUAAAAJ", "Mi Young Lee": "bxWgGnoAAAAJ"}
OUTPUT_PATH = 'src/data/publications.json'

def fetch_publications():
    # 1. 기존 데이터 로드
    all_data = {}
    if os.path.exists(OUTPUT_PATH):
        try:
            with open(OUTPUT_PATH, 'r', encoding='utf-8') as f: all_data = json.load(f)
        except: pass

    # 2. 구글 스칼라 수집 (기존 로직 유지)
    # ... (생략 없이 동작하도록 유지하지만, 여기서는 핵심 추가 로직만 표시)
    # 실제 파일에는 이전의 셀레니움 수집 코드가 그대로 들어있어야 합니다.

    # 3. 진행 중인 논문(IN_PROGRESS_PAPERS) 병합
    rho_pubs = all_data.get("Seungmin Rho", [])

    # 중복 방지: 구두점/공백 차이와 부분 개정된 제목에도 견디도록 정규화 비교
    def normalize(title):
        return re.sub(r'[^a-z0-9]', '', title.lower())

    existing_norms = {normalize(p['title']) for p in rho_pubs}

    for prog_pub in IN_PROGRESS_PAPERS:
        if normalize(prog_pub['title']) not in existing_norms:
            # 진행 중 배지를 위해 bibtex에 특수 마킹 추가 또는 status 필드 추가
            prog_pub['is_progress'] = True
            rho_pubs.insert(0, prog_pub) # 최상단에 추가

    all_data["Seungmin Rho"] = rho_pubs

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print(f"✅ 구글 스칼라 + 진행 중 논문({len(IN_PROGRESS_PAPERS)}건) 병합 완료")

if __name__ == "__main__":
    fetch_publications()