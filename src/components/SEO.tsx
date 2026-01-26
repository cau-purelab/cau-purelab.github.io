import React from 'react';
import { Helmet } from 'react-helmet-async';
import { LAB_NAME, LAB_DESCRIPTION } from '../constants';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image }) => {
    const siteTitle = `${title} | ${LAB_NAME}`;
    const metaDescription = description || LAB_DESCRIPTION;

    // [수정됨] 확장자를 .png로 통일 (index.html과 일치시킴)
    const metaImage = image || '/assets/og-image.png';

    // [수정됨] 카카오톡/슬랙 봇을 위해 고정 도메인 사용 권장
    const siteUrl = 'https://security-visual-intelligence-lab-ho.vercel.app';

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={metaDescription} />

            {/* Open Graph / Facebook / Kakao */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={`${siteUrl}${metaImage}`} />
            <meta property="og:url" content={window.location.href} />
            <meta property="og:site_name" content={LAB_NAME} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={`${siteUrl}${metaImage}`} />
        </Helmet>
    );
};

export default SEO;