# Jay. 3차 리뉴얼 구현·검수 기록

2026-10-14. 로컬 구현과 이번 변경의 검수를 완료했다. 커밋·push·공개 배포는 실행하지 않았다.

[로컬 미리보기](http://127.0.0.1:4174/) · [회사 프로젝트](http://127.0.0.1:4174/#works) · [Discover](http://127.0.0.1:4174/#discover) · [프로필](http://127.0.0.1:4174/#about)

## 구현된 흐름

00 영상 → 01 설명 → 오른쪽 공간으로 이동하며 회사 프로젝트 10개 타일 전경 → 첫 타일 확대 → 중앙 정착 → 왼쪽 설명 → 다음 카드가 아래에서 올라와 이전 카드 밀어내기 → 02 Aelin → 개인 작품 Discover 6개 → 실제 어두운 3D 우주 → 밝아짐·줌아웃·배경 블러와 From imagined to real-time. → 회사 경력 → 04 워크플로우 → 05 밝은 인물 소개.

회사 프로젝트 제목·회사·기간·기술·출시 상태, 실제 개인 작품과 외부 에셋 고지, Jay. / on the art / 최효재, YIGO. · Creative Leader, Resume의 대표이사 재직 사실을 유지했다. 모바일에는 타일 개요와 이미지·설명을 세로로 배치했다.

## 검수 결과

- Chrome 1440×900 및 1920×1080, 모바일 뷰포트 390×844에서 확인.
- 카드 중앙 정착 중 설명 투명도 0, 설명 진입 후 1. 같은 스크롤 위치로 되돌아왔을 때 위치·크기·설명이 동일.
- 타일 확대부터 카드 교체까지 15개 진행 지점의 화면 위치를 확인. 마지막 카드 이후 빈 카드 없음.
- 프로젝트 직접 링크와 새로고침, 키보드 타일 선택 후 초점 이동, 창 크기 전환 시 읽던 프로젝트 유지 확인.
- 두 영상의 실제 프레임 진행과 재생 상태 확인. 화면 밖 이전 영상은 정지.
- Marakun 조립 탐색, Resume, 페이지맵과 링크 확인.
- 모션 감소, 명시적 모션 재생 선택, 정적 모드, WebGL 미지원·연결 손실 대체 화면, JavaScript 없는 콘텐츠 표시 확인.
- 확인한 정상 렌더링 경로의 JavaScript 런타임 오류 0건. 모든 실기기·브라우저의 성능 측정을 뜻하지는 않음.

상세 결과: previews/renewal-3/verification.json, previews/renewal-3/final-verification.json.

## 대표 화면

왼쪽 위부터 타일 전경, 중앙 카드, 왼쪽 설명, 어두운 우주, 경력 진입, 밝은 프로필.

대표 캡처는 previews/renewal-3/에 보관한다.

모바일·1920px 캡처도 previews/renewal-3/에 보관한다.

## 교체 예정 자료

회사 프로젝트 콘셉트 이미지는 기존 생성형 임시 자료를 사용하며 실제 산출물로 표시하지 않았다. Aelin 슬롯 영상 역시 임시 영상 고지를 유지했다.

프로필은 내장 image_gen으로 생성한 가상 인물이다. 실제 최효재 사진이 아니다. 원본 저장 위치는 사이트의 assets/profile-placeholder-generated.png, 사이트용 WebP는 assets/profile-placeholder-generated.webp다. 정확한 생성 프롬프트·도구·크기는 work/profile-placeholder-manifest.json에 기록한다.

실제 사진이 제공되면 index.html의 이미지 경로·크기·대체 텍스트, data-asset-status, data-fictional-person 및 교체 예정 문구를 함께 바꾸면 된다.

## 파일 구성

index.html은 콘텐츠 순서, worlds.js는 회사 프로젝트의 절대 스크롤 진행, renewal-three.css는 새 무대와 반응형 레이아웃, app.js는 장면·영상·탐색, cosmos.js와 cosmos.bundle.js는 의미 있는 장면 ID에 연결된 WebGL 배경을 담당한다. 기존 resume 파일은 수정하지 않았다.
