# polio-keycloak-helper

## 2024년 7월 30일 업데이트 - 패키지 분리 및 관리 예정 (Work in Progress)

본 프로젝트는 `packages/fast-auth-with-keycloak` 내부에 Keycloak 인증 헬퍼 패키지를 포함하고 있습니다. 현재는 이 패키지가 메인 프로젝트와 함께 관리되고 있으나, 향후 다음과 같은 방향으로 분리하여 관리할 예정입니다.

### 1. `fast-auth-with-keycloak` 패키지 분리

`packages/fast-auth-with-keycloak` 디렉토리의 내용을 별도의 Git 리포지토리로 분리하여 독립적인 오픈소스 패키지로 관리할 예정입니다. 이는 다음과 같은 이점을 제공합니다.

*   **모듈성 강화:** 인증 로직과 관련된 코드를 핵심 프로젝트로부터 완전히 분리하여 재사용성과 독립성을 높입니다.
*   **독립적인 버전 관리:** `fast-auth-with-keycloak` 패키지 자체의 버전 관리를 독립적으로 수행할 수 있게 됩니다.
*   **배포 용이성:** npm 또는 GitHub Package Registry를 통해 패키지를 발행하여 다른 프로젝트에서도 쉽게 의존성으로 추가하여 사용할 수 있습니다.

### 2. 패키지 발행 및 참조 방식 변경

`fast-auth-with-keycloak` 패키지를 별도 리포지토리에서 관리하게 되면, 메인 `polio-keycloak-helper` 프로젝트에서 이 패키지를 다음과 같은 방식으로 참조하게 됩니다.

*   **패키지 발행 준비:**
    *   `fast-auth-with-keycloak` 리포지토리 내의 `package.json` 파일에 `exports` 필드를 올바르게 정의하여 패키지 모듈들이 외부로 노출되도록 설정합니다. (예: 기본 진입점(`.`) 및 필요한 경우 서브 경로).
    *   패키지의 `name` 필드를 적절하게 설정합니다. (예: `@your-scope/fast-auth-with-keycloak` 또는 `fast-auth-with-keycloak`).
    *   패키지 발행을 위한 `publishConfig` (GitHub Package Registry 사용 시) 등을 설정합니다.
*   **패키지 빌드:**
    *   별도 리포지토리에서 `npm run build` 명령을 통해 패키지를 빌드합니다.
*   **패키지 발행:**
    *   빌드된 패키지를 npm (npmjs.com) 또는 GitHub Package Registry와 같은 공개/비공개 패키지 레지스트리에 발행합니다.
*   **메인 프로젝트의 의존성 변경:**
    *   `polio-keycloak-helper` 프로젝트의 루트 `package.json` 파일에서 `fast-auth-with-keycloak` 의존성을 `git+https://...` 형태의 참조 대신 발행된 패키지의 이름과 버전으로 변경합니다.
    *   예: `"fast-auth-with-keycloak": "^1.0.0"` 또는 `"@angularJS80/fast-auth-with-keycloak": "^1.0.0"`

이러한 변경을 통해 프로젝트의 아키텍처를 개선하고, `fast-auth-with-keycloak` 패키지를 더 유연하게 사용할 수 있도록 할 예정입니다.

---

# keycloak-helper

이 프로젝트는 Keycloak 백엔드와 통합되는 React 애플리케이션의 예시 및 개발 환경입니다. 주요 인증 로직은 `fast-auth-with-keycloak`라는 별도의 NPM 패키지로 분리되어 관리됩니다.

## fast-auth-with-keycloak NPM 패키지 (NEW!)

`fast-auth-with-keycloak`는 React 환경에서 Keycloak 기반 인증을 빠르고 쉽게 연동할 수 있도록 돕는 인증 헬퍼 패키지입니다. 이 패키지는 이제 독립적인 NPM 패키지로 제공되어 어떤 React 프로젝트에서도 재사용 가능합니다.

### 설치

```bash
npm install fast-auth-with-keycloak
# 또는
yarn add fast-auth-with-keycloak
```

## 최근 변경사항

## 작업 기록

### 2024년 06월 06일 (목) - 핵심 인증 로직 리팩토링 및 아키텍처 개선

*   **API 호출 계층 분리 (`fast-auth-with-keycloak` 패키지):**
    *   `FastAuthProvider` 내부에 특정 API 호출을 위한 전용 함수 (`findPassword`, `changePassword`, `accountJoin`)를 추가하여 각 API의 책임을 명확히 분리했습니다.
    *   이 함수들에서 `fastAuthApiRequest` 대신 `fetch`를 직접 사용하여 API 호출 로직의 독립성을 강화하고, `handleApiResponse`를 통해 일관된 응답 처리 및 에러 전파를 구현했습니다.
    *   `handleApiResponse`에서 API 호출 실패 시 에러 객체에 구체적인 메시지를 포함하여 `throw`하도록 변경, 메시지 표현은 상위 계층에서 결정하도록 했습니다.
*   **React 훅 계층 개선 (`src/hooks`):**
    *   `useLoginPage.ts`, `useAccountJoinPage.ts`, `usePasswordFindPage.ts` 등의 훅에서 `FastAuthProvider`의 새 함수들을 호출하도록 업데이트했습니다.
    *   UI 컴포넌트(`tsx`)에서 직접 성공 및 실패 메시지 문자열을 훅의 핸들러 함수(예: `handleLogin`, `handleJoin`)로 전달받아 사용하는 방식으로 메시지 관리 로직을 개선했습니다. (표현 정의는 `.tsx`에서, 전달받아 사용은 훅에서)
    *   `useLoginPage.ts`의 중복 로그인 상태 확인 `useEffect` 훅을 제거하고, 해당 로직을 `useAppCore.ts`로 옮겨 역할 분담을 명확히 했습니다.
*   **UI 계층 수정 (`src/pages`):**
    *   `LoginPage.tsx` 및 `AccountJoinPage.tsx`의 버튼 `onClick` 핸들러에서 훅의 함수를 호출할 때, 사용자에게 표시될 성공/실패 메시지를 직접 문자열로 정의하여 전달하도록 변경했습니다.
    *   `AccountJoinPage.tsx`에서 폼 제출 방식(`form onSubmit`)을 `Button`의 `onClick`에 직접 연결하는 방식으로 변경하여 일관성을 맞췄습니다. (주의: `Enter` 키 제출 기능은 제외됨)

---

### 2025년 6월 코드 구조 개선 및 모듈화

#### 유틸리티 함수 통합 및 분리
- **UI 관련 유틸리티 통합**: `src/utils/uiUtils.ts`로 모든 UI/폼 관련 함수들을 통합
  - `validateLoginRequest`, `validatePassword`, `validateEmail`, `validateUsername` 등 폼 유효성 검사 함수들
  - `resetFormState` 폼 초기화 함수
  - `validateMultiple` 복합 유효성 검사 함수
  - `PUBLIC_PATHS`, `DEFAULT_REDIRECT_PATH`, `LOGIN_PATH`, `CONFIG_PATH` 등 UI 관련 상수들
- **API 응답 처리 통합**: `src/utils/apiResponseHandler.ts`에서 모든 API 응답 처리를 통합
  - `handleApiSuccess`: 모든 성공 응답 처리 통합
  - `handleApiError`: 모든 에러 응답 처리 통합
  - 기존 개별 성공/에러 처리 함수들 제거하여 코드 중복 제거
- **불필요한 파일 제거**: `src/utils/constants.ts`, `src/utils/requestValidators.ts`, `src/utils/formUtils.ts` 등 중복/불필요한 파일들 정리

#### fast-auth-with-keycloak 패키지 내부 유효성 검사 강화
- **validator.ts 확장**: 패키지 내부에 모든 API 호출 전 유효성 검사 함수들을 집중
  - `validateFastAuthConfig`, `validateRefreshToken` 등
  - `validateEndpoint`, `validateApiRequestOptions`, `validateAuthCode` 등
  - `validateRequiredConfig`, `validateToken`, `validateUrlToken` 등
  - **토큰 검증 함수 통합**: `validateToken`과 `validateTokenBasedRequest`를 하나로 통합하여 `userFriendly` 매개변수로 에러 메시지 구분
- **토큰 존재 검증 통합**: `validateRefreshToken`과 `validateUrlToken`을 `validateTokenExists`로 통합하여 중복 코드 제거
- **엔드포인트 검증 통합**: `validateLogoutRequest`, `validateTokenRefreshRequest`를 `validateEndpoint`로 통합
- **타입 안전성 개선**: `FastAuthConfig` 타입에 누락된 엔드포인트들(`passwordResetEndpoint`, `joinEndpoint`, `passwordChangeEndpoint`, `passwordFindEndpoint`, `socialLoginEndpoint`) 추가
- **FastAuthProvider 메서드 보강**: 모든 주요 메서드에 유효성 검사 적용
  - `init`, `login`, `logout`, `fastAuthApiRequest`, `checkAndRefreshToken` 등

#### 토큰 갱신 로직 분리 및 개선
- **책임 분리**: `refreshTokenIfNeeded` 함수를 세 개의 함수로 분리
  - `isTokenExpiringSoon()`: 토큰 만료 시점 판단
  - `refreshToken()`: 토큰 갱신 발급
  - `checkAndRefreshToken()`: 위 두 함수를 조합한 통합 함수 (기존 `refreshTokenIfNeeded`에서 이름 변경)
- **코드 가독성 향상**: 각 함수의 책임을 명확히 분리하여 유지보수성 개선

#### 인증 콜백 처리 개선
- **processAuthCallback 리팩토링**: 유효성 검사와 API 호출을 분리
  - `validateAuthCode`로 코드 유효성 검사
  - `FastAuthProvider.loginByCode` 메서드로 API 호출
- **resetPassword API 분리**: `FastAuthProvider.resetPassword` 메서드로 분리하여 일관성 확보

#### 프로필 조회 로직 제거 및 성능 최적화
- **profileAfterLogin 설정 제거**: 불필요한 프로필 조회 로직 제거
- **profileEndpoint 설정 제거**: 관련 설정 및 UI 제거
- **ConfigPage UI 간소화**: 프로필 조회 관련 설정 필드 제거
- **성능 향상**: 로그인 후 불필요한 API 호출 제거로 성능 개선

#### 코드 모듈화 및 재사용성 향상
- **인증 관련 로직 집중**: `fast-auth-with-keycloak` 패키지 내부로 모든 인증 로직 집중
- **UI/폼 관련 유틸리티 분리**: `uiUtils.ts`로 UI 관련 함수들 분리
- **일관된 구조**: 모든 유틸리티 함수들이 적절한 위치에 배치되어 일관성 있는 구조 확보

### 이전 변경사항

- `fast-auth-with-keycloak` 인증 헬퍼 로직을 독립적인 NPM 패키지로 분리하여 재사용성을 높였습니다.
- React 공식 사이트 톤(React Blue, 연회색, 연보라 등) 테마 적용
- 설정(초기화) 화면 상단에 머터리얼 톱니바퀴(Settings) 아이콘 추가
- 로그인 화면 상단에 머터리얼 자물쇠(Lock) 아이콘 추가
- 초기화 버튼 텍스트를 '저장'으로 변경
- **계정 등록 기능 추가**: 초기화 설정 화면에서 계정 등록 엔드포인트를 설정하고, 로그인 페이지에서 계정 등록 페이지로 이동하여 사용자 이름, 이메일, 비밀번호로 계정을 생성할 수 있습니다.
- **비밀번호 변경 엔드포인트 설정 기능 추가**: 초기화 설정 화면에서 비밀번호 변경을 위한 별도 엔드포인트를 설정할 수 있게 되었습니다.
- **비밀번호 변경 페이지 구현**: 현재 비밀번호 없이 토큰의 `sub` 항목을 `userId`로 사용하여 새 비밀번호를 설정할 수 있는 페이지가 추가되었습니다.
- **API 응답 처리 로직 개선**: `fastAuthApiRequest` 함수가 서버 응답 본문이 비어있거나 유효하지 않은 JSON일 경우에도 클라이언트에서 오류 없이 처리하도록 개선되었습니다.
- **토큰 파싱 기능 재사용성 강화**: JWT 토큰 파싱(`decodeToken`) 기능이 `fast-auth-with-keycloak` 패키지 내부로 이동하여 애플리케이션 전반에서 재사용할 수 있게 개선되었습니다.
- **WelcomePage 프로필 아이콘 버튼 수정**: 마우스를 올릴 때만 보이던 프로필 아이콘 버튼을 항상 보이도록 수정하고, Material-UI Button 컴포넌트의 variant를 `contained`로, 배경색을 보라색으로, 크기를 정사각형으로 조정했습니다.
- **ProfilePage 디자인 개선**: 사용자 프로필 페이지에서 이름과 이메일 정보가 입력 필드처럼 보이지 않도록 List, ListItem, ListItemIcon, ListItemText 컴포넌트를 활용하여 목록 형태로 표시하고, 각 정보 앞에 아이콘을 추가하여 조회 전용 느낌을 강화했습니다.
- **모든 화면 상단 제목 글자 크기 통일**: WelcomePage, LoginPage, ConfigPage, ProfilePage의 상단 제목 Typography 컴포넌트 `variant`를 모두 `h5`로 통일하여 일관성을 확보했습니다.
- **WelcomePage 제목 앞 아이콘 변경**: WelcomePage 제목 앞에 `EmojiPeopleIcon` 대신 `WavingHandIcon`을 최종 적용했습니다.
- **비밀번호 변경/재설정 기능 분리:**
    - `PasswordChangePage.tsx`는 로그인된 사용자의 비밀번호 변경을 전담하도록 수정되었습니다.
    - `ResetPasswordPage.tsx`를 새로 추가하여, URL 쿼리 파라미터를 통해 `access_token`을 받아 비밀번호를 재설정하는 기능을 구현했습니다. 이 페이지는 세션 기반의 토큰 갱신 로직을 사용하지 않습니다.
    - `src/App.tsx`에 `/reset-password` 경로로 `ResetPasswordPage.tsx`에 대한 라우팅을 추가했습니다.
    - `src/utils/authConfig.ts`에 `passwordResetEndpoint`를 추가하고, `ConfigPage.tsx`에서 이 엔드포인트를 설정할 수 있도록 입력 필드를 추가했습니다.
- **비밀번호 찾기 기능 추가 및 개선:**
    - 초기화 설정 화면(`ConfigPage.tsx`)에 `비밀번호 찾기 엔드포인트` 설정 필드가 추가되었습니다.
    - 이메일 입력을 통해 비밀번호 재설정 이메일을 요청하는 `비밀번호 찾기 페이지(/password-find)`(`PasswordFindPage.tsx`)가 새로 추가되었습니다.
    - `PasswordFindPage.tsx`와 `ResetPasswordPage.tsx`에서 `FastAuthProvider` 의존성 없이 독립적으로 API 요청을 보낼 수 있도록 `fastAuthApiRequest` 대신 웹 표준 `fetch` API를 사용하도록 수정되었습니다.
    - 애플리케이션 초기화 설정 유무와 관계없이 `비밀번호 찾기` 및 `비밀번호 재설정` 페이지에 직접 접근할 수 있도록 `src/App.tsx`의 라우팅 로직이 개선되었습니다.
    - `src/utils/authConfig.ts` 내 엔드포인트 관련 유틸리티 함수들(`getJoinEndpoint`, `getPasswordResetEndpoint`, `getProfileConfig`, `getRedirectConfig`)이 `loadInitConfig()`를 통해 `DEFAULT_AUTH_CONFIG`의 기본값을 올바르게 참조하도록 수정되었습니다.
    - 로그인 페이지(`LoginPage.tsx`)에서 "비밀번호를 잊으셨나요?" 버튼 텍스트가 "비밀번호 찾기"로 변경되었으며, 다른 버튼들과 동일한 높이를 갖도록 `size="large"`로 조정되었습니다.
    - 초기화 설정 화면(`ConfigPage.tsx`)의 "소셜 로그인 엔드포인트" 항목명이 "소셜 로그인 링크"로 변경되었습니다.
- **`keycloak-js` 의존성 제거:** 클라이언트 애플리케이션에서 직접 `keycloak-js` 라이브러리를 사용하지 않도록 관련 임포트 및 코드를 `src/utils/authConfig.ts`에서 완전히 제거했습니다. 이는 백엔드가 Keycloak과 통신하고 클라이언트는 `fast-auth-with-keycloak` 패키지를 통해 백엔드와 통신하는 아키텍처에 맞게 코드를 정리한 것입니다.
- **소셜/코드 로그인 통합 및 개선:**
    - 초기화 설정 화면(`ConfigPage.tsx`)에 `소셜 로그인 링크`와 `코드 로그인 엔드포인트` 설정 필드가 추가되었습니다.
    - `src/App.tsx`에 `/auth/callback` 경로를 추가하여 외부 인증 콜백을 처리하는 `LoginByOauthPage.tsx`를 구현했습니다. 이 경로는 초기화 설정 유무와 관계없이 접근 가능합니다.
    - `LoginByOauthPage.tsx`는 URL에서 `code` 파라미터를 추출하여, 초기화 설정에서 정의된 `코드 로그인 엔드포인트`로 JSON 본문(`code`)을 포함한 POST 요청을 보냅니다.
    - 코드 로그인 성공 시, ID/PW 로그인과 동일하게 백엔드로부터 받은 토큰(`accessToken`, `refreshToken`)을 `FastAuthProvider`에 설정하고 세션을 재개하며, 이후 프로필 조회 및 설정된 리다이렉트 경로로 이동합니다.
    - React `StrictMode` 환경에서 발생할 수 있는 API 이중 호출을 방지하기 위해 `LoginByOauthPage.tsx`에 `useRef`를 사용하여 API 호출 상태를 추적하는 로직이 추가되었습니다.
    - `LoginPage.tsx`에 `소셜 로그인` 버튼이 추가되어, 초기화 설정의 `소셜 로그인 링크`로 직접 이동할 수 있도록 구현되었습니다. 절대 경로인 경우 `baseUrl`이 중복되지 않도록 처리되었습니다.
    - `src/config.ts` 및 `src/utils/authConfig.ts`에서 `socialLoginEndpoint`와 `loginByCodeEndpoint`의 기본값이 정의되고 로드되도록 업데이트되었습니다.

## 2024년 6월 리팩토링

### 구조 개선
- 모든 주요 페이지의 상태, 이펙트, 주요 핸들러를 커스텀 훅(`src/hooks/useXXXPage.ts`)으로 분리하여 UI와 로직을 완전히 분리함
- 각 페이지 컴포넌트는 UI만 담당, 상태/핸들러/이펙트는 커스텀 훅에서 관리
- 공통 메시지/다이얼로그 관리(`useMessage`, `CommonMessageDialog`)를 도입하여 성공/에러 메시지 처리 일원화
- 세션 만료 다이얼로그, 메시지 다이얼로그 등도 전역 상태/공통 컴포넌트로 단순화
- 페이지 이동(navigate)만 각 페이지에서 직접 처리, 나머지 로직은 모두 훅으로 이동
- LoginByOauthPage, PasswordFindPage 등도 커스텀 훅(`useLoginByOauthPage`, `usePasswordFindPage`)으로 분리

### 유틸리티 함수 분리 (NEW!)
- `src/utils/requestValidators.ts`: 요청 전 유효성 검사 함수들
  - 비밀번호, 토큰, 이메일, 사용자명, 엔드포인트 설정 검증
  - 복합 검증 함수 (`validateMultiple`)로 여러 검증을 한번에 수행
  - **인증 코드 유효성 검사 함수 추가** (`validateAuthCode`)
- `src/utils/apiResponseHandler.ts`: API 호출 후 처리 함수들
  - 성공/실패 응답 처리, 오류 처리, 폼 초기화
- `src/utils/constants.ts`: 공통 상수들
  - 경로 상수, 기본값 등

### 코드 표준화
- 코드 네이밍, 함수명, 상태 변수명 등 실무적이고 명확하게 개선
- hooks 폴더 구조 및 네이밍 표준화
- 각종 중복 코드/로직을 공통 훅, 컴포넌트로 통합하여 유지보수성 향상
- 유효성 검사 및 응답 처리 로직 중앙화

### fast-auth-with-keycloak 패키지 내부 유효성 검사 강화 (NEW!)
- `packages/fast-auth-with-keycloak/validator.ts`: 패키지 내부 유효성 검사 함수들
  - 설정, 로그인 요청, 토큰 기반 요청, 리프레시 토큰, 엔드포인트, API 요청 옵션 검증
  - **필수 설정 유효성 검사 함수 추가** (`validateRequiredConfig`)
  - 로그아웃, 토큰 갱신 요청 유효성 검사
  - 복합 유효성 검사 함수 (`validateMultiple`)
- `packages/fast-auth-with-keycloak/index.ts`의 주요 메서드들에 유효성 검사 적용
  - `init`, `login`, `logout`, `fastAuthApiRequest`, `checkAndRefreshToken` 등

### 토큰 갱신 로직 분리 (NEW!)
- `isTokenExpiringSoon()`: 토큰 만료 시점 판단 함수
- `refreshToken()`: 토큰 갱신 발급 함수  
- `checkAndRefreshToken()`: 위 두 함수를 조합한 통합 함수 (기존 `refreshTokenIfNeeded`에서 이름 변경)
- 각 함수의 책임을 명확히 분리하여 코드 가독성 및 유지보수성 향상

### 인증 콜백 처리 개선 (NEW!)
- `FastAuthProvider.loginByCode()` 메서드 추가
  - 인증 코드를 받아서 API를 호출하는 전용 메서드
  - 내부적으로 설정 유효성 검사 수행
  - 토큰 설정 및 자동 갱신 설정 포함
- `useLoginByOauthPage` 훅 리팩토링
  - **이전**: 직접 fetch 호출과 복잡한 설정 검증
  - **이후**: `validateAuthCode`로 코드 유효성 검사 + `FastAuthProvider.loginByCode`로 API 호출
  - 더 간결하고 명확한 코드 구조

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# fast-auth-with-keycloak

리액트에서 Keycloak 기반 인증을 빠르게 붙일 수 있는 인증 헬퍼 패키지입니다.

## 새로운 엔드포인트 타입 추가하기

새로운 엔드포인트 타입을 추가하려면 다음 단계를 따르세요:

1. **타입 정의 확장** (`packages/fast-auth-with-keycloak/config.ts`):
   ```typescript
   export type EndpointType = 'passwordChange' | 'passwordReset' | 'passwordFind' | 'join' | 'logout' | 'refresh' | 'newEndpoint';
   ```

2. **Config 인터페이스에 추가** (`packages/fast-auth-with-keycloak/config.ts`):
   ```typescript
   interface Config {
     // ... 기존 필드들
     newEndpoint: string;
   }
   ```

3. **FastAuthConfig 타입에 추가** (`packages/fast-auth-with-keycloak/index.ts`):
   ```typescript
   export type FastAuthConfig = {
     // ... 기존 필드들
     newEndpoint: string;
   };
   ```

4. **DEFAULT_INIT_AUTH_CONFIG에 기본값 추가**:
   ```typescript
   export const DEFAULT_INIT_AUTH_CONFIG = {
     // ... 기존 필드들
     newEndpoint: '/auth/new-endpoint',
   };
   ```

5. **getter 함수 추가** (필요한 경우):
   ```typescript
   export function getNewEndpoint() {
     return getConfig().newEndpoint || DEFAULT_INIT_AUTH_CONFIG.newEndpoint || '';
   }
   
   export function hasNewEndpoint(): boolean {
     return !!getNewEndpoint();
   }
   ```

6. **validator.ts의 validateEndpoint 함수에 추가**:
   ```typescript
   const endpointChecks: Record<EndpointType, () => boolean> = {
     // ... 기존 엔드포인트들
     newEndpoint: hasNewEndpoint,
   };
   
   const endpointNames: Record<EndpointType, string> = {
     // ... 기존 엔드포인트들
     newEndpoint: '새 엔드포인트',
   };
   ```

7. **사용 예시**:
   ```typescript
   // fastAuthApiRequest에서 사용
   await fastAuthApiRequest('/new-endpoint', {
     method: 'POST',
     endpointType: 'newEndpoint'
   });
   
   // 또는 직접 validateEndpoint 사용
   const validation = validateEndpoint('newEndpoint');
   ```

## 주요 기능
- Keycloak 등 OAuth2 기반 인증 연동을 위한 인증/토큰 관리
- 로그인/리프레시/프로필/로그아웃 등 엔드포인트 설정
- accessToken, refreshToken 분리 저장 (sessionStorage/localStorage)
- 토큰 만료 자동 감지 및 자동 갱신(사용자 지정 시점)
- 토큰 만료 시 지정 경로로 리다이렉트
- 로그인 후 프로필 조회 및 환영 페이지 이동 등 커스텀 라우팅 지원
- 모든 API 요청에 accessToken 자동 포함 (옵션으로 미포함 가능)
- **API 호출 전 유효성 검사**: 설정, 토큰, 엔드포인트, 요청 옵션 등에 대한 자동 검증

## 사용법

### 1. 초기화 페이지에서 설정
- Base URL
- 계정등록 엔드포인트 (NEW!)
- 로그인 엔드포인트
- **비밀번호 변경 엔드포인트 (NEW!)**
- 리프레쉬 엔드포인트
- 자동 토큰 연장 여부
- 만료시 리다이렉트 경로
- 로그인 후 프로필 조회 여부 및 엔드포인트
- 로그인 후 이동 여부 및 경로
- 토큰 만료 갱신 시점(초 전)

설정값은 localStorage에 저장되어 새로고침/재접속 시에도 유지됩니다.

### 2. 계정 등록 (NEW!)
- 로그인 페이지의 '계정 등록' 버튼을 통해 접근 가능합니다.
- 사용자 이름, 이메일, 비밀번호, 비밀번호 확인을 입력하여 새 계정을 등록할 수 있습니다.
- 초기화 설정 화면에 구성된 '계정등록 엔드포인트'로 POST 요청을 보내 계정 생성 로직을 수행합니다.

### 3. 로그인
- 로그인 시 accessToken은 sessionStorage, refreshToken은 localStorage에 저장
- 프로필 조회 옵션이 켜져 있으면 해당 엔드포인트로 사용자 정보 조회
- 로그인 후 이동 옵션이 켜져 있으면 지정 경로로 이동

### 4. API 요청
```ts
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';

// 토큰 자동 포함
const data = await fastAuthApiRequest('/me');

// 토큰 미포함 요청
const publicData = await fastAuthApiRequest('/public', { withToken: false });
```

### 5. 토큰 자동 갱신
- accessToken의 exp(JWT 만료시간)를 클라이언트에서 파싱하여, 설정한 시점(초 전)에 자동으로 refresh
- 만료 시 자동 로그아웃 및 지정 경로로 리다이렉트
- **토큰 갱신 함수 분리**: `isTokenExpiringSoon()` (판단), `refreshToken()` (발급), `checkAndRefreshToken()` (통합)

---

## 커스텀 옵션 예시
- 로그인 후 프로필 조회: 체크 시, 예) /me
- 로그인 후 이동: 체크 시, 예) /welcome
- 토큰 만료 갱신 시점: 예) 5 (만료 5초 전에 갱신)

---

## 개발 및 확장
- 각 페이지(ConfigPage, LoginPage, WelcomePage)는 src/pages에 분리되어 관리
- 인증 로직은 `packages/fast-auth-with-keycloak`에 모듈화되어 있습니다.
- 설정값은 localStorage(fast-auth-init-config)에 저장

---

## 문의/기여
- 개선사항/버그/기능요청은 이슈로 남겨주세요.
