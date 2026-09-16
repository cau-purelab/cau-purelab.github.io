// src/lib/clipboard.ts
// 클립보드 복사 유틸.
//
// 사이트가 평문 HTTP(비보안 오리진)로 서빙되는 동안에는 navigator.clipboard 자체가
// undefined라 `navigator.clipboard.writeText(...)`가 TypeError로 죽는다.
// 그래서 접근 전에 가드하고, 없거나 실패하면 숨긴 textarea + execCommand('copy')로 폴백한다.
// 호출부가 성공/실패를 구분해 사용자에게 알릴 수 있도록 실제 성공일 때만 true를 반환한다.

/** 화면 밖 textarea를 통한 구식 복사. execCommand가 성공을 보고할 때만 true. */
function copyWithTextarea(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  // display:none이면 선택이 안 된다 — 화면 밖에 두되 렌더는 시킨다.
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';

  const previouslyFocused = document.activeElement as HTMLElement | null;
  document.body.appendChild(textarea);

  let copied = false;
  try {
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    document.body.removeChild(textarea);
    // 포커스를 원래 눌렀던 버튼으로 되돌린다(키보드 사용자).
    previouslyFocused?.focus?.();
  }

  return copied;
}

/** 텍스트를 클립보드에 복사한다. 성공하면 true, 실패하면 false. */
export async function copyText(text: string): Promise<boolean> {
  if (!text) return false;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 권한 거부·문서 비활성 등 — 아래 폴백으로 넘어간다.
  }

  return copyWithTextarea(text);
}
