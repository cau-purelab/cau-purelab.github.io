import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { LAB_URL } from '../constants';
import { NOT_FOUND_META, metaForPath, normalizePath } from '../lib/seo';

interface SEOProps {
    /** 색인에서 제외할 페이지(404 등). canonical을 내보내지 않고 robots를 noindex로 지정하며 404 문구를 쓴다. */
    noindex?: boolean;
}

const OG_IMAGE = '/assets/og-image.png';

const SEO: React.FC<SEOProps> = ({ noindex = false }) => {
    const { pathname } = useLocation();
    const normalized = normalizePath(pathname);
    const meta = noindex ? NOT_FOUND_META : metaForPath(pathname);
    const canonicalUrl = `${LAB_URL}${normalized === '/' ? '/' : normalized}`;
    const imageUrl = `${LAB_URL}${OG_IMAGE}`;

    return (
        <Helmet>
            <title>{meta.title}</title>
            <meta name="description" content={meta.description} />
            {/* 404 같은 페이지가 자기 자신을 정본으로 선언하면 soft-404가 색인된다 — noindex일 때는 canonical을 내지 않는다 */}
            {noindex
                ? <meta name="robots" content="noindex, follow" />
                : <link rel="canonical" href={canonicalUrl} />}

            {/* og:type · og:site_name · og:locale · twitter:card · og:image:* 는 라우트와 무관하므로
                index.html의 정적 태그에 맡긴다(여기서 또 내보내면 태그가 2개씩 생긴다). */}
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:url" content={canonicalUrl} />

            <meta name="twitter:title" content={meta.title} />
            <meta name="twitter:description" content={meta.description} />
            <meta name="twitter:image" content={imageUrl} />
        </Helmet>
    );
};

export default SEO;
