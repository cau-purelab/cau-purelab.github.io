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
IN_PROGRESS_PAPERS = [
    {
        "title": "SHAP-Guided Leaf-Value Adjustment for Efficient Unlearning in LightGBM",
        "author": "S.W. Park, S. Kim, B, Lee, M. Maqsood, MY Lee, S Rho",
        "journal": "Communications in Nonlinear Science and Numerical Simulation",
        "status": "Submitted, Feb. 2026",
        "funding_tags": ["NRF-SM-25", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "Novel Glow Adversarial Attack–based Proactive Defense against Deepfake Generation with Photometric Specular Highlights",
        "author": "Maryam Bukharia, M. Maqsood, S Rho",
        "journal": "Alexandria Engineering Journal",
        "status": "Submitted, Feb. 2026",
        "funding_tags": ["ITRC-26", "NRF-SM-25"],
        "year": "2026"
    },
    {
        "title": "An improved deep learning-based MSA-Net model for small liver tumor segmentation",
        "author": "Beenish Hina, Muazzam Maqsood, Asma Sattar, Zahoor ur Rehman, S Rho, Hyungjoon Kim",
        "journal": "Science Progress",
        "status": "Submitted, Dec. 2025",
        "funding_tags": ["Prof. KIM"],
        "year": "2025"
    },
    {
        "title": "Adversarial AI Through Frequency-Domain Imperceptible Attack on Person Re-Identification",
        "author": "Asma Sattar, Maryam Bukhari, M. Saud Khan, Anam Mustaqeem, M.Y. Lee, S Rho",
        "journal": "CMC-Computers, Materials & Continua",
        "status": "2nd Revision, Feb. 2026",
        "funding_tags": ["Convg_Security-26", "NRF-SM-25", "Prof. MYLee"],
        "year": "2026"
    },
    {
        "title": "Stock Price Forecasting Modelling Cross-Sector and Within-Sector Relationships with Sector-Specific Macroeconomic Signals",
        "author": "Asma Sattar, M. Maqsood, S Rho",
        "journal": "Applied Artificial Intelligence",
        "status": "Submitted, Dec. 2025",
        "funding_tags": ["Convg_Security-26", "KNU-26"],
        "year": "2025"
    },
    {
        "title": "Regime-Aware Static and Dynamic Graph Structure Learning for Stock Price Forecasting",
        "author": "S Rho",
        "journal": "Humanities and Social Sciences Communications",
        "status": "1st Revision, Feb. 2026",
        "funding_tags": ["Convg_Security-26", "KNU-26"],
        "year": "2026"
    },
    {
        "title": "A Novel Hybrid Multi-Scale Temporal Relations-based Graph Neural Networks for Stock Price Forecasting Using Commodity Indices and Events",
        "author": "M.C. Kim, S Rho",
        "journal": "Neural Processing Letters",
        "status": "Submitted, Dec. 2025",
        "funding_tags": ["Convg_Security-26", "KNU-26"],
        "year": "2025"
    },
    {
        "title": "MSTCA Framework: Advancing Medical Deepfake Detection with Multiscale Spatial Transformers and Convolutional Attention",
        "author": "Fizza Bukhari, Maryam Bukhari, Amna Sarwar, M. Maqsood, S Rho",
        "journal": "Scientific Reports",
        "status": "Submitted, Feb. 2026",
        "funding_tags": ["ITRC-26", "NRF-SM-25"],
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
    
    # 중복 방지를 위한 제목 리스트
    existing_titles = [p['title'].lower() for p in rho_pubs]
    
    for prog_pub in IN_PROGRESS_PAPERS:
        if prog_pub['title'].lower() not in existing_titles:
            # 진행 중 배지를 위해 bibtex에 특수 마킹 추가 또는 status 필드 추가
            prog_pub['is_progress'] = True
            rho_pubs.insert(0, prog_pub) # 최상단에 추가

    all_data["Seungmin Rho"] = rho_pubs

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print(f"✅ 구글 스칼라 + 진행 중 논문({len(IN_PROGRESS_PAPERS)}건) 병합 완료")

if __name__ == "__main__":
    fetch_publications()