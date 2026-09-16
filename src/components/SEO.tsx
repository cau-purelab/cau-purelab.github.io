import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { LAB_DESCRIPTION, LAB_URL, SITE_TITLE_SUFFIX } from '../constants';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    /** 색인에서 제외할 페이지(404 등). canonical을 내보내지 않고 robots를 noindex로 지정한다. */
    noindex?: boolean;
}

const SEO: React.FC<SEOProps> = ({ title, description, image, noindex = false }) => {
    const { pathname } = useLocation();
    // 정적 HTML(scripts/site.cjs의 TITLE_SUFFIX)과 같은 접미사를 써서 크롤러가 보는 제목과 어긋나지 않게 한다
    const siteTitle = `${title} | ${SITE_TITLE_SUFFIX}`;
    const metaDescription = description || LAB_DESCRIPTION;

    // [수정됨] 기본 공유 이미지는 og-image.png (텍스트 로고) 사용
    const metaImage = image || '/assets/og-image.png';

    // [수정됨] 도메인 절대 경로 (카카오톡 미리보기용)
    const siteUrl = LAB_URL;
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '/' : pathname}`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={metaDescription} />
            {/* 404 같은 페이지가 자기 자신을 정본으로 선언하면 soft-404가 색인된다 — noindex일 때는 canonical을 내지 않는다 */}
            {noindex
                ? <meta name="robots" content="noindex, follow" />
                : <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph / Facebook / Kakao
                og:type · og:site_name · og:locale · twitter:card · og:image:* 는 라우트와 무관하므로
                index.html의 정적 태그에 맡긴다(여기서 또 내보내면 태그가 2개씩 생긴다). */}
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={`${siteUrl}${metaImage}`} />
            <meta property="og:url" content={canonicalUrl} />

            {/* Twitter */}
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={`${siteUrl}${metaImage}`} />
        </Helmet>
    );
};

export default SEO;
