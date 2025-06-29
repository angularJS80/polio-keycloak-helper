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
- **모든 화면 상단 제목 글자 크기 통일**: WelcomePage, LoginPage, InitPage, ProfilePage의 상단 제목 Typography 컴포넌트 `variant`를 모두 `h5`로 통일하여 일관성을 확보했습니다.
- **WelcomePage 제목 앞 아이콘 변경**: WelcomePage 제목 앞에 `EmojiPeopleIcon` 대신 `WavingHandIcon`을 최종 적용했습니다.
- **비밀번호 변경/재설정 기능 분리:**
    - `PasswordChangePage.tsx`는 로그인된 사용자의 비밀번호 변경을 전담하도록 수정되었습니다.
    - `ResetPasswordPage.tsx`를 새로 추가하여, URL 쿼리 파라미터를 통해 `access_token`을 받아 비밀번호를 재설정하는 기능을 구현했습니다. 이 페이지는 세션 기반의 토큰 갱신 로직을 사용하지 않습니다.
    - `src/App.tsx`에 `/reset-password` 경로로 `ResetPasswordPage.tsx`에 대한 라우팅을 추가했습니다.
    - `src/utils/authConfig.ts`에 `passwordResetEndpoint`를 추가하고, `InitPage.tsx`에서 이 엔드포인트를 설정할 수 있도록 입력 필드를 추가했습니다.
- **`keycloak-js` 의존성 제거:** 클라이언트 애플리케이션에서 직접 `keycloak-js` 라이브러리를 사용하지 않도록 관련 임포트 및 코드를 `src/utils/authConfig.ts`에서 완전히 제거했습니다. 이는 백엔드가 Keycloak과 통신하고 클라이언트는 `fast-auth-with-keycloak` 패키지를 통해 백엔드와 통신하는 아키텍처에 맞게 코드를 정리한 것입니다.

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

## 주요 기능
- Keycloak 등 OAuth2 기반 인증 연동을 위한 인증/토큰 관리
- 로그인/리프레시/프로필/로그아웃 등 엔드포인트 설정
- accessToken, refreshToken 분리 저장 (sessionStorage/localStorage)
- 토큰 만료 자동 감지 및 자동 갱신(사용자 지정 시점)
- 토큰 만료 시 지정 경로로 리다이렉트
- 로그인 후 프로필 조회 및 환영 페이지 이동 등 커스텀 라우팅 지원
- 모든 API 요청에 accessToken 자동 포함 (옵션으로 미포함 가능)

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

---

## 커스텀 옵션 예시
- 로그인 후 프로필 조회: 체크 시, 예) /me
- 로그인 후 이동: 체크 시, 예) /welcome
- 토큰 만료 갱신 시점: 예) 5 (만료 5초 전에 갱신)

---

## 개발 및 확장
- 각 페이지(InitPage, LoginPage, WelcomePage)는 src/pages에 분리되어 관리
- 인증 로직은 `packages/fast-auth-with-keycloak`에 모듈화되어 있습니다.
- 설정값은 localStorage(fast-auth-init-config)에 저장

---

## 문의/기여
- 개선사항/버그/기능요청은 이슈로 남겨주세요.
