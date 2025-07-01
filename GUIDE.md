# 프로젝트 인수인계 가이드

이 문서는 `polio-keycloak-helper` 프로젝트의 주요 개념, 최근 변경 사항, 그리고 사용된 기술 스택을 React 프레임워크에 대한 사전 지식이 없는 개발자도 이해할 수 있도록 설명합니다.

---

## 목차
1.  프로젝트 개요
2.  기술 스택
3.  npm 패키지 설명
4.  주요 기능 개선 및 코드 변경 사항
    *   소셜 로그인 링크 (기존 동작 확인)
    *   로그아웃 및 토큰 만료 시 React Router를 통한 페이지 이동
5.  결론 및 추가 확인 사항

---

## 1. 프로젝트 개요

이 프로젝트는 `Keycloak`이라는 인증 및 권한 부여 서버와 연동하여 사용자 인증을 처리하는 웹 애플리케이션의 헬퍼 역할을 합니다. 기본적인 로그인, 회원가입, 비밀번호 변경/초기화, 그리고 소셜 로그인과 같은 인증 관련 기능을 제공합니다.

이 애플리케이션은 **단일 페이지 애플리케이션 (SPA)** 방식으로 동작합니다. 이는 웹 페이지를 처음 로드할 때 필요한 모든 HTML, CSS, JavaScript를 한 번에 불러오고, 이후 사용자가 다른 페이지로 이동할 때 전체 페이지를 새로고침하는 대신 필요한 부분만 동적으로 변경하는 방식입니다. 이를 통해 사용자에게 더 빠르고 부드러운 경험을 제공합니다.

## 2. 기술 스택

이 프로젝트는 다음 주요 기술들을 사용하여 개발되었습니다:

*   **JavaScript (TypeScript):** 웹 애플리케이션의 핵심 로직을 구현하는 데 사용된 프로그래밍 언어입니다. TypeScript는 JavaScript에 '타입'이라는 개념을 추가하여 코드의 안정성과 가독성을 높여줍니다.
*   **React:** 사용자 인터페이스(UI)를 구축하는 데 사용되는 JavaScript 라이브러리입니다. UI를 재사용 가능한 '컴포넌트' 단위로 나누어 개발 효율성을 높입니다.
*   **React Router:** React 애플리케이션 내에서 페이지 간의 이동(라우팅)을 관리하는 라이브러리입니다.
*   **Material-UI (MUI):** Google의 Material Design을 기반으로 한 UI 컴포넌트 라이브러리입니다. 미리 디자인된 버튼, 입력 필드 등을 제공하여 일관성 있고 미려한 UI를 쉽게 구축할 수 있도록 돕습니다.
*   **Keycloak:** 오픈 소스 ID 및 액세스 관리(IAM) 솔루션입니다. 사용자 인증, 싱글 사인온(SSO), 소셜 로그인 연동 등을 담당하는 백엔드 서버입니다.
*   **npm (Node Package Manager):** JavaScript 프로젝트에서 필요한 외부 라이브러리(패키지)를 설치하고 관리하는 도구입니다.

## 3. npm 패키지 설명

프로젝트의 `package.json` 파일에는 프로젝트가 정상적으로 동작하거나 개발할 때 필요한 모든 외부 라이브러리 목록이 정의되어 있습니다.

### `dependencies` (실행 시 필수 라이브러리)

이 프로젝트가 실행될 때 필수적으로 필요한 라이브러리들입니다.

*   **`react`**: 이 웹 애플리케이션을 구축하는 핵심 JavaScript 라이브러리입니다. 웹 페이지의 사용자 인터페이스(UI)를 효율적으로 만들고 관리하는 데 사용됩니다. (웹 페이지의 HTML 부분을 JavaScript로 더 쉽게 만들고 변경할 수 있게 해주는 도구)
*   **`react-dom`**: `react`와 함께 사용되며, React로 만든 UI 요소를 실제 웹 브라우저 화면에 그려주는(렌더링) 역할을 합니다. (React로 설계된 건물의 청사진을 실제 땅에 건설하는 역할)
*   **`react-router-dom`**: 웹 애플리케이션 내에서 페이지 전환(라우팅)을 관리합니다. 전체 페이지를 새로고침하는 대신 필요한 부분만 변경하여 부드러운 페이지 전환을 제공합니다. (웹사이트 내 내비게이션 시스템)
*   **`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`**: Material-UI (MUI)는 Google의 Material Design을 기반으로 한 UI 컴포넌트(버튼, 텍스트 입력란, 아이콘 등) 라이브러리입니다. `@emotion` 패키지는 MUI 컴포넌트의 스타일링을 돕습니다. (미리 만들어진 예쁜 레고 블록 세트)
*   **`fast-auth-with-keycloak`**: 이 프로젝트의 핵심 커스텀 인증 라이브러리입니다. Keycloak과 연동하여 사용자 로그인, 토큰 관리, 로그아웃 등 인증 관련 복잡한 작업을 처리합니다. (애플리케이션의 보안 및 신분증 검사 시스템)
    *   **참고:** `file:packages/fast-auth-with-keycloak`는 이 패키지가 현재 프로젝트의 `packages/fast-auth-with-keycloak` 디렉토리에 위치한 로컬 패키지임을 의미합니다.
*   **`react-scripts`**: Create React App 도구에서 제공하는 스크립트 모음입니다. React 애플리케이션을 시작, 빌드, 테스트하는 데 필요한 복잡한 설정을 자동으로 처리합니다. (자동차의 시동, 생산, 테스트 자동화 도구)
*   **`typescript`**: JavaScript에 '타입' 개념을 추가하여 코드의 안정성과 예측 가능성을 높여주는 언어입니다. 개발 단계에서 잠재적 오류를 미리 발견하는 데 도움이 됩니다. (레시피에 재료의 정확한 용량을 명시하는 것)
*   **기타 (`@testing-library/*`, `web-vitals`):** 테스트 및 웹 성능 측정을 위한 라이브러리들입니다.

### `devDependencies` (개발 시에만 필요한 라이브러리)

이 프로젝트를 개발하거나 테스트할 때만 필요한 라이브러리들입니다.

*   **`customize-cra` & `react-app-rewired`**: `react-scripts`가 제공하는 기본 설정을 프로젝트 요구사항에 맞게 조정하거나 덮어쓸 수 있도록 돕는 도구입니다. (레고 세트를 분해하지 않고 일부 블록을 교체하는 커스터마이징 도구)

## 4. 주요 기능 개선 및 코드 변경 사항

이 섹션에서는 `Cursor`에 의해 최근에 적용된 주요 기능 개선 및 코드 변경 사항을 설명합니다.

### 4.1. 소셜 로그인 링크 (기존 동작 확인)

*   **배경:** 사용자가 소셜 로그인 버튼 클릭 시 `/auth/social-login` 엔드포인트를 GET 방식으로 호출하도록 요청했습니다.
*   **분석 및 결과:** 프로젝트의 `src/pages/LoginPage.tsx` 파일을 확인한 결과, 소셜 로그인 버튼 클릭 시 이미 `FastAuthProvider`의 설정에서 가져온 `socialLoginEndpoint` 값을 사용하여 URL을 구성한 후, `window.location.href`를 통해 해당 URL로 이동하고 있었습니다. `window.location.href`를 통한 이동은 웹 브라우저가 해당 URL로 GET 요청을 보내는 것과 동일합니다. 따라서, 사용자의 요청은 이미 현재 코드에서 구현되어 있었으며, 이 부분에 대한 추가적인 코드 변경은 필요하지 않았습니다.

### 4.2. 로그아웃 및 토큰 만료 시 React Router를 통한 페이지 이동

*   **문제점:** 기존에는 사용자가 로그아웃하거나 인증 토큰이 만료될 경우, 브라우저가 `/auth/login` (백엔드 API 엔드포인트)으로 강제로 이동하는 문제가 있었습니다. 이는 `window.location.href`를 사용하여 브라우저의 주소창을 직접 변경했기 때문에, 단일 페이지 애플리케이션(SPA)의 특성상 불필요한 전체 페이지 새로고침이 발생했습니다. 사용자의 의도는 React 애플리케이션 내의 `/login` 경로(프론트엔드 라우팅)로 부드럽게 이동하는 것이었습니다.
*   **변경 목적:**
    *   로그아웃 또는 토큰 만료 시 불필요한 전체 페이지 새로고침을 방지하여 사용자 경험을 개선합니다.
    *   백엔드 API 엔드포인트(`/auth/login`)와 프론트엔드 라우팅 경로(`/login`)를 명확히 분리하여 혼동을 줄입니다.
    *   애플리케이션의 라우팅(페이지 전환)을 React Router가 일관되게 관리하도록 합니다.

*   **관련 파일:**
    *   `packages/fast-auth-with-keycloak/index.ts`
    *   `src/App.tsx`
    *   `src/config.ts` (이전 확인)

*   **코드 변경 사항 상세:**

    **1) `packages/fast-auth-with-keycloak/index.ts` 변경 사항**
    *   **파일의 역할:** 이 파일은 인증 관련 핵심 로직을 담고 있는 별도의 라이브러리(패키지)입니다. 이 라이브러리 자체는 React나 다른 특정 UI 프레임워크에 대한 지식이 없습니다.
    *   **변경 목적:** 라이브러리가 페이지 이동 방식을 직접 결정하는 대신, 라이브러리를 사용하는 애플리케이션(여기서는 React)에게 "페이지 이동을 어떻게 할지"에 대한 방법을 위임할 수 있도록 유연성을 추가했습니다.
    *   **구현 내용:**
        *   **`FastAuthConfig` 타입 확장:** `FastAuthConfig`라는 설정 타입에 `onTokenExpiredNavigate?: (path: string) => void;`라는 새로운 선택적 속성을 추가했습니다. 이 속성은 문자열 경로를 인자로 받고 아무것도 반환하지 않는 "페이지 이동 함수"를 받을 수 있도록 정의되었습니다.
        *   **내비게이션 함수 저장:** `FastAuthProvider` 클래스 내부에 `private static _onTokenExpiredNavigate`라는 정적(static) 변수를 추가하여, 초기화 시 외부에서 전달받은 페이지 이동 함수를 저장할 수 있도록 했습니다.
        *   **`init` 함수 수정:** `FastAuthProvider.init` 함수가 호출될 때, 새로운 `onTokenExpiredNavigate` 인자를 받아 내부 `_onTokenExpiredNavigate` 변수에 저장하도록 수정했습니다.
        *   **`logout` 및 `handleTokenExpired` 함수 로직 변경:**
            *   이 두 함수는 이제 토큰 만료 후 리다이렉트가 필요할 때, `FastAuthProvider._onTokenExpiredNavigate`에 저장된 함수가 제공되었는지 먼저 확인합니다.
            *   만약 함수가 제공되었다면, 해당 함수를 호출하여 페이지 이동을 위임합니다 (예: `FastAuthProvider._onTokenExpiredNavigate(config.onTokenExpiredRedirect);`).
            *   만약 함수가 제공되지 않았다면, 기존과 동일하게 `window.location.href`를 사용하여 브라우저가 직접 페이지를 새로고침하도록 합니다. 이는 이 라이브러리가 React 환경이 아닌 다른 환경에서도 독립적으로 사용될 수 있도록 하는 유연성을 제공합니다.
        *   **핵심 아이디어 (비유):** 인증 라이브러리는 더 이상 "내가 직접 문을 열고 나가겠다"고 하지 않고, "문 열고 나가는 방법이 있으면 알려달라"고 요청합니다. 그리고 React 애플리케이션이 그 방법을 알려주면 그 방법대로 따릅니다.

    **2) `src/App.tsx` 변경 사항**
    *   **파일의 역할:** 이 파일은 React 애플리케이션의 최상위 컴포넌트이며, 애플리케이션의 전체적인 구조와 라우팅, 그리고 `FastAuthProvider` 라이브러리를 초기화하는 곳입니다.
    *   **변경 목적:** `FastAuthProvider` 라이브러리가 React Router의 페이지 이동 기능을 사용하여 부드러운 페이지 전환을 수행하도록 연결합니다.
    *   **구현 내용:**
        *   **`useNavigate` 훅 사용:** React Router에서 제공하는 `useNavigate` 훅(Hook)을 사용하여 `navigate` 함수를 가져옵니다. `navigate` 함수는 React 애플리케이션 내부에서 URL을 변경하여 페이지를 전환할 수 있게 해주는 기능입니다.
        *   **`FastAuthProvider.init` 호출 시 `navigate` 전달:** `useEffect` 훅 내부에서 `FastAuthProvider.init` 함수를 호출할 때, `useNavigate`를 통해 얻은 `navigate` 함수를 `onTokenExpiredNavigate` 속성으로 전달하도록 수정했습니다.
        *   **핵심 아이디어 (비유):** 애플리케이션의 시작 부분에서, 우리는 인증 라이브러리에게 "페이지 이동이 필요할 때 React의 '내비게이션 도구'(`navigate` 함수)를 사용해달라"고 명확하게 알려준 것입니다. 이제 인증 라이브러리는 `window.location.href` 대신 이 `navigate` 함수를 사용하여 `/login` 경로로 이동하게 됩니다.

    **3) `src/config.ts` (이전 확인)**
    *   **파일의 역할:** 이 파일은 애플리케이션의 기본 설정 값들을 정의합니다.
    *   **확인된 내용:** `onTokenExpiredRedirect` 값이 `/login`으로 설정되어 있음을 확인했습니다. 이 값은 로그아웃/토큰 만료 시 이동할 프론트엔드 경로를 나타냅니다. 이 설정 자체는 변경되지 않았습니다.

## 5. 결론 및 추가 확인 사항

이러한 변경을 통해 애플리케이션은 로그아웃 및 토큰 만료 시 더 나은 사용자 경험을 제공하며, 프론트엔드 라우팅과 백엔드 엔드포인트의 역할이 더욱 명확하게 분리되었습니다.

### 새로운 개발자가 확인해야 할 사항:

*   **Node.js 및 npm 설치:** 프로젝트를 실행하려면 Node.js와 npm이 설치되어 있어야 합니다. (설치 가이드 참고)
*   **프로젝트 설치:** 프로젝트 클론 후, 터미널에서 `npm install` 명령어를 실행하여 `package.json`에 정의된 모든 의존성 패키지를 설치해야 합니다.
*   **개발 서버 실행:** `npm start` 명령어를 사용하여 개발 서버를 실행하고 애플리케이션을 브라우저에서 확인할 수 있습니다.
*   **React Router의 이해:** React Router는 SPA에서 URL 변경에 따라 화면의 컴포넌트를 변경하는 핵심 라이브러리입니다. `/login`, `/welcome` 등은 React Router가 관리하는 경로이며, 브라우저가 전체 새로고침 없이 해당 경로에 맞는 화면을 보여줍니다.
*   **`FastAuthProvider`와 애플리케이션 간의 상호작용:** `FastAuthProvider`는 독립적인 인증 로직을 제공하고, `App.tsx`와 같은 상위 React 컴포넌트가 `onTokenExpiredNavigate`와 같은 속성을 통해 `FastAuthProvider`에게 필요한 "서비스"(여기서는 페이지 이동 방법)를 제공하는 방식으로 협력합니다.
*   **`src/config.ts`의 `onTokenExpiredRedirect`:** 이 값은 여전히 `FastAuthProvider`가 어떤 경로로 이동해야 할지 결정하는 데 사용됩니다. 하지만 이제 이 경로로 이동하는 *방법*은 `FastAuthProvider._onTokenExpiredNavigate`에 전달된 함수(즉, React Router의 `navigate` 함수)에 의해 결정됩니다.
*   **`.env` 파일:** 프로젝트의 루트 디렉토리에 `.env` 파일을 생성하고 `REACT_APP_AUTH_BASE_URL` 환경 변수를 백엔드 API의 기본 URL로 설정해야 합니다. 예: `REACT_APP_AUTH_BASE_URL=http://localhost:8080`

--- 