import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import App, { routerBasename } from './App'
import './index.css'

const container = document.getElementById('root')!

const app = (
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter basename={routerBasename}>
                <App />
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
)

// 배포본의 라우트별 HTML에는 scripts/prerender.cjs가 렌더한 본문이 들어 있다 → 그 DOM을 재사용(hydrate).
// 본문이 비어 있으면(개발 서버, 404.html) 처음부터 그린다.
if (container.hasChildNodes()) {
    ReactDOM.hydrateRoot(container, app)
} else {
    ReactDOM.createRoot(container).render(app)
}
