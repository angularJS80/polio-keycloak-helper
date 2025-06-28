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

See the section about [deployment](https://facebook.github.com/create-react-app/docs/deployment) for more information.

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
- 로그인 엔드포인트
- 리프레쉬 엔드포인트
- 자동 토큰 연장 여부
- 만료시 리다이렉트 경로
- 로그인 후 프로필 조회 여부 및 엔드포인트
- 로그인 후 이동 여부 및 경로
- 토큰 만료 갱신 시점(초 전)

설정값은 localStorage에 저장되어 새로고침/재접속 시에도 유지됩니다.

### 2. 로그인
- 로그인 시 accessToken은 sessionStorage, refreshToken은 localStorage에 저장
- 프로필 조회 옵션이 켜져 있으면 해당 엔드포인트로 사용자 정보 조회
- 로그인 후 이동 옵션이 켜져 있으면 지정 경로로 이동

### 3. API 요청
```ts
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';

// 토큰 자동 포함
const data = await fastAuthApiRequest('/me');

// 토큰 미포함 요청
const publicData = await fastAuthApiRequest('/public', { withToken: false });
```

### 4. 토큰 자동 갱신
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
