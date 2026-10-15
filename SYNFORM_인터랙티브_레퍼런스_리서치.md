# Jay on Art 인터랙티브 레퍼런스 리서치

- 조사 기준일: 2026-10-13 (Asia/Seoul)
- 범위: 공개 웹 데모, 공식 제작자/수상 출처, 수상 갤러리, GitHub와 소셜 반응. 링크는 조사일 기준으로 확인했으며, 일부 경험은 데스크톱 브라우저와 WebGL/WebGPU 지원 환경에서 가장 잘 작동한다.
- 목적: Jay on Art 브랜드 페이지에 실제 개인 작품, 제작 리더십, 현재 YIGO 대표이사 경력을 연결할 수 있는 인터랙션을 고른다.

## 먼저 본 기존 브랜드 페이지

현재 초안은 ArtStation 개인 작품 6개, Unreal Engine 기반 환경 제작 경력, MORAI의 디지털 트윈/SimReady 업무, 현재 YIGO 대표이사 재직 및 개발 중인 Aelin을 담는다. 공식 브랜드는 Jay on Art다. 개인 작업과 회사 프로젝트를 구분하며, 미확인 성과를 만들지 않는다. 이 조사 문서는 레퍼런스 판단과 적용 기준을 기록한다.

기존 자료: `README.md`, `SYNFORM_공개용_문안_초안.md`, `SYNFORM_사이트_콘텐츠_제작_기준서.md`, `index.html` (F:\_Final\_이력서\_라이온하트\SYNFORM-브랜드페이지)

## 요약: Jay on Art에 맞는 비주얼 전략

사이트는 3D 자체를 정체성으로 내세우지 않는다. 사용자의 강점인 아트·기획·개발을 잇는 제작 방식이 실제 작업과 내러티브에서 읽혀야 한다. 3D Web Lab에서 우선 가져올 것은 특정 3D 오브젝트나 조작기가 아니라 **이어지는 배경, 스크롤에 반응하는 장면 전환, Discover 대표 사례 카드와 전체 작업 링크 흐름**이다.

- **Hero:** Jay on Art 브랜드와 제작자 포지셔닝을 먼저 읽히게 하고, 실제 환경 작품 이미지를 강한 배경 비주얼로 쓴다.
- **작품 탐색:** Discover 카드 영역을 개인 작품 카드로 번역한다. 카드 안에 별도 3D 뷰어를 넣지 않고 실제 작품 이미지·설명·원본 링크를 연결하며, 마지막에 전체 작품 링크를 둔다.
- **타이포그래피:** 읽기 쉬운 산세리프를 사용하고, 반응형 크기 단계와 보통·중간·볼드 굵기로 위계를 정한다. 강조에 이탤릭이나 세리프 장식체를 사용하지 않는다.
- **스크롤 서사:** 개인작 → YIGO/Aelin → MORAI·이전 경력 순으로 패널과 배경 상태를 바꾼다. 페이지 스크롤과 직접 링크를 계속 사용할 수 있게 한다.
- **사실 표기:** 경력 상태, 회사/개인 작업 구분, 프로젝트 역할은 HTML 텍스트로 제공한다. Aelin은 개발 중이며 공개 가능한 화면만 연결한다.
- **접근성·기기:** 기본 링크와 키보드 경로를 유지한다. reduced-motion 정적 경로와 모바일 전용 크롭·카드 배열을 설계한다.

## 사용자 선호 반영: 3D Web Lab 배경·스크롤·카드 흐름

우선 기준은 **3D Web Lab의 배경 장면, 스크롤 액션, Discover 카드와 전체 작품 링크로 이어지는 플로우**다. 사이트를 게임처럼 조작하거나 카드 안에 임시 3D 모델을 배치하지 않는다. 레이아웃 임시 자료는 실제 작업으로 오인되지 않게 표시한다. Mutiny Land·Bruno Simon처럼 세계 탐험 자체가 내비게이션인 사례는 보조 참고로 둔다.

- **최우선 기준점 — [3D Web Lab](https://3dweblab.com/):** 배경 장면이 이어지는 동안 스크롤에 따라 패널과 장면이 전환되고, Discover 영역의 대표 사례 카드 3개가 전체 Cases로 안내한다. 우리 페이지는 실제 개인 작품 카드 전체를 유지하고 ArtStation 전체 작품 링크로 연결한다. [CSSDA 공식 기록](https://www.cssdesignawards.com/sites/3d-web-lab/46828/)은 2025년 2월 13일 Website of the Day와 심사 점수를 확인해 준다.
- **가장 가까운 최신 제작 사례 — [Lightweight](https://lightweight.info/en) / [VKZ 제작 케이스](https://www.vkz.studio/projects/lightweight):** 2026 CSSDA Website of the Month. 정밀 엔지니어링 제품을 최적화된 3D 디지털 트윈, 제품 디테일, 정제된 모션으로 보여준다. 블렌더 모델링→Three.js 구현, 모바일 대응, CMS 기반 페이지 구조까지 제작사가 공개해 하이테크 브랜드 페이지의 최신 제작 흐름을 참고하기 좋다. [CSSDA 심사 페이지](https://www.cssdesignawards.com/wotm/lightweight/48763/)
- **모션 강도 참고 — [Lando Norris](https://landonorris.com/):** 3D 헬멧, 모터스포츠 속도감의 타이포·전환·스크롤 연출을 높은 강도로 적용한 2026 사례다. 기술 브랜드의 직접 템플릿보다는 첫 장면의 에너지와 장면 전환 문법을 참고한다. [OFF+BRAND 제작 케이스](https://www.itsoffbrand.com/our-work/lando-norris)는 WebGL·3D·Rive와 지연 로딩·에셋 최적화를 함께 설명하며, CSSDA Website of the Month 등 수상도 공개한다.
- **페이지 이동 방식 참고 — [Roman Jean-Elie 포트폴리오](https://www.romanjeanelie.com/):** route 간 WebGL 포털 전환을 별도로 참고한다. Jay on Art에서는 모든 메뉴를 공간 안에 숨기기보다, 일반 링크를 유지하며 전환 순간의 장면/카메라/마스크만 3D로 연출하는 쪽이 적합하다.

**Jay on Art에 적용할 방향:** 첫 화면에는 브랜드·제작자 포지셔닝과 실제 작품 배경을 둔다. 스크롤 단계는 개인 작품 → YIGO/Aelin → MORAI·경력으로 이동한다. Discover 카드에는 실제 개인 작품 이미지, 요약과 ArtStation 원본 링크를 두고 전체 작품 CTA로 마무리한다. 메뉴·본문·경력 텍스트는 일반 웹 구조로 유지한다. 실제 자산으로 뒷받침되는 화면 전환만 사용하고, 게임 조작이나 카드 안의 조악한 3D 뷰어를 요구하지 않는다.
## 선정 사례

### 1. Bruno Simon — Bruno's Portfolio (2025 리뉴얼)

- **실제 데모:** [bruno-simon.com](https://bruno-simon.com/?lang=en)
- **제작자·기술:** [Bruno Simon의 제작 노트](https://bruno-simon.com/?lang=en)는 Three.js 기반 3D 월드, WebGL/WebGPU 셰이딩, Rapier 물리, 키보드·마우스·터치·게임패드 조작을 명시한다. 시작 전 품질/오디오 옵션과 `I'm stuck` 복귀 기능도 노출한다.
- **인터랙션:** 자동차를 조작해 사이트 공간을 돌아다니고, 랜드마크/오브젝트와 상호작용해 작업·소개·연락처를 찾는다. 단순 스크롤 포트폴리오를 작은 게임 세계로 바꾼다.
- **기억되는 이유:** 포트폴리오의 주인공인 크리에이티브 개발자의 3D 역량을 네비게이션 그 자체로 보여준다. 실제 조작감과 발견 요소가 기억에 남는다.
- **확인 가능한 인기 근거:** [FWA 2025 올해의 사이트 및 People's Choice 수상 발표](https://www.linkedin.com/posts/the-fwa_huge-congrats-to-bruno-simon-for-winning-activity-7417551138415120384-Y3Oq), [2026 Webby Awards — Technical Achievement 및 People's Voice 2개 수상](https://winners.webbyawards.com/2026/websites-and-mobile-sites/features-design/technical-achievement/370083/brunos-portfolio). 수상 근거는 확실하지만 방문자 수를 뜻하지는 않는다.
- **Jay on Art 적용 아이디어:** 차량 조작형 월드는 채택하지 않는다. 이 사례에서는 첫 화면의 조작 안내·복귀 수단·품질 설정을 참고하고, Jay on Art는 기본 스크롤만으로도 완결되는 밝은 우주 여정으로 만든다. 여러 색의 행성과 은하 흐름은 배경 카메라의 시네마틱 이동으로 표현하며, 작품·경력 탐색은 항상 읽을 수 있는 HTML 텍스트와 카드로 제공한다.
- **난이도/리스크:** 매우 높음. 맞춤형 환경, 물리와 상호작용, WebGL/WebGPU 호환, 키보드·터치 컨트롤, 씬 최적화가 필요하다. 캔버스 내 글자는 검색/스크린리더에 불리하고, 가속도·충돌·카메라가 멀미를 일으킬 수 있다. 기본 HTML 경로, 조작 안내/복귀 버튼, reduced motion, 모바일 성능 프리셋이 필요하다.

### 2. Loaflet — Han Wei의 3D 프로젝트 마을 (AI 제작 주장 포함)

- **실제 데모:** [loaflet.com](https://loaflet.com/)
- **상호작용/기술:** 여러 프로젝트를 하나의 3D 마을에 건물/랜드마크로 배치하고 걸어서 방문한다. 프로젝트 목록·저널로도 내용에 접근할 수 있다. Reddit 작성자는 GPT-6 Astra를 이용해 사이트를 만들었다고 밝혔고, 공개 사이트는 Three.js/GLTF 에셋 사용을 확인할 수 있는 흔적을 제공한다.
- **기억되는 이유:** 서로 다른 과거 작업을 전통적인 썸네일 그리드가 아닌 하나의 장소감 있는 세계로 묶는다. 3D 게임 개발과 해커톤 프로젝트 경험이 있는 제작자에게 맥락을 만들어준다.
- **인기/검증 근거:** [제작자의 Reddit 공개 글](https://www.reddit.com/r/codex/comments/1wfb3f8/i_used_astra_to_turn_my_past_projects_into_a_3d/)에 라이브 데모와 본인의 GPT-6 Astra 제작 주장, 댓글 반응이 있다. 같은 스레드의 분석 댓글은 Three.js r185/GLTF/Draco/KTX2/Meshopt, Netlify 등을 사이트에서 확인했다고 적지만, 실제 에이전트 작업 로그는 공개되지 않아 모델별 기여를 독립 검증할 수 없다고 덧붙인다. 추천 수/도달 수를 인기의 정량 근거로 사용하지 않는다.
- **Jay on Art 적용 아이디어:** 작품마다 다른 행성이나 궤도 표식을 두어 프로젝트들을 하나의 우주 세계관으로 묶되, 3D 마을을 그대로 재현하거나 방문자가 걸어 다니게 하지 않는다. 스크롤로 배경의 행성·성운이 흐르고, Discover 카드와 직접 링크가 프로젝트의 기본 탐색 경로가 된다. 우주 오브젝트는 실제 작품을 대신하는 임시 콘셉트 자산임을 분명히 표시한다.
- **난이도/리스크:** 높음. 정지된 에셋을 최적화한 공간 내비게이션으로 구현하면 전체 게임보다 범위를 줄일 수 있다. 그러나 시야 밖의 작품을 놓치고, 이동 시간을 소모하거나, 모델 로딩이 길면 경력 탐색을 방해한다. 목록/검색 대체, 전체 지도, 모바일 탭 탐색, 3D 씬 지연 로딩을 제공한다. GPT-6 Astra라는 모델 이름은 사례의 인기로 취급하지 않는다.

### 3. 3D Web Lab — 배경 장면, 스크롤 연출, Discover 사례 카드

- **실제 데모:** [3dweblab.com](https://3dweblab.com/)
- **인터랙션/기술:** 화면만으로는 렌더러를 단정하지 않는다. 2026-10-13 현재 공개 JS 번들([현재 빌드 파일](https://3dweblab.com/assets/index-360e525c.js))을 읽어 `/content/scenes/lightstrates.glb`, Three.js `WebGLRenderer`, 스크롤 상태에 쓰이는 `bokehScale`·`viewerBlurEnabled` 값을 확인했다. 메인 배경은 지속되는 Three.js/WebGL 씬이며 카메라·장면 상태와 배경 심도를 스크롤에 맞춰 바꾼다. Cases 구간은 카메라를 낮추고 featured case 그룹을 배경 위로 순차 노출한다. 각 카드는 DOM 레이어로 이미지/영상, 번호, 클라이언트, 제목과 링크를 제공하고 `View All Featured Cases`가 전체 Cases 그리드로 이어진다. 사례 페이지/카드용 `.webm` 영상도 함께 사용한다. 해시가 붙은 공개 번들은 변경될 수 있어 구현 전에 현재 소스를 다시 확인한다.
- **기억되는 이유:** 연속된 배경 장면이 브랜드의 기술 역량을 만들고, 카드와 읽기 쉬운 페이지 구조가 실제 작업을 빠르게 보여준다. 3D 조작이 목적이 되지 않으면서 장면·스크롤·작품 소개가 한 흐름을 이룬다.
- **확인 가능한 인기 근거:** [CSS Design Awards 공식 수상 페이지](https://www.cssdesignawards.com/sites/3d-web-lab/46828/)에 Website of the Day, 2025-02-13, 최종 심사 점수와 UI/UX/Innovation 평가가 남아 있다. 이는 심사·수상 확인이지 트래픽 증거는 아니다.
- **Jay on Art 적용 아이디어:** 이 레퍼런스에서 가져올 핵심은 지속되는 배경 씬, 스크롤에 반응하는 카메라·심도, 그리고 하단 Discover 카드 흐름이다. 다채로운 화이트·펄 우주와 행성·궤도·성운의 흐름을 기본으로 하고, Florigenix 게시물에서 관찰한 세포형 표면 결·방사형 광점·섬유상 분기를 추상적인 보조 모티프로 더한다. 구도나 캐릭터는 복제하지 않는다. 텍스트가 강조될 때 배경만 부드럽게 흐리며, 실제 작품 이미지와 설명은 읽기 쉬운 DOM 카드로 보여준다. 상세 번역 규칙은 [AJ 생태적 우주 아트디렉션](AJ_생태적_우주_아트디렉션.md)에 둔다.
- **난이도/리스크:** 중상~높음. 지속 WebGL 배경과 스크롤 전환은 장면 설계, 상태별 구도, 모바일 대체 프레이밍, 모션 감소 경로와 성능 최적화가 필요하다. 기존에 제거한 조악한 코드 생성 블록아웃을 다시 만들지 않고, 고품질 생성 이미지·실제 작품 자료와 WebGL 배경을 구분해 사용한다. 수상 페이지의 UX 점수는 개별 사용자 접근성을 보장하지 않는다.

### 4. ERA — WebGL 부동산 3D 지도와 스크롤 스토리

- **실제 데모:** [ERA 공식 사이트](https://era-tekta.ru/) (제작자 케이스의 `View Case` 링크에서 진입)
- **제작 근거:** [제작사 Vide Infra 케이스 스터디](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- **인터랙션/기술:** 지형/주변 랜드마크를 탐색하는 WebGL 3D 지도, 위치에 관한 시네마틱 이동, 페이지 스크롤에 연동된 건축 렌더 카메라 줌, 건물/층 선택과 표면 재료 표현.
- **기억되는 이유:** 큰 3D 무대를 사용 목적(위치·교통·생활권·공간 이해)에 연결한다. 장면 전환도 반복되는 빛 선 모티프로 통일했다.
- **확인 가능한 인기 근거:** 제작사가 FWA, CSSDA, Awwwards 각각 Site of the Day 수상을 공개하고, 케이스 본문에서 인터랙티브 3D 지도를 핵심 요소로 설명한다. 제작자 발표 외에 각 시상 페이지로 교차 확인할 수 있다: [FWA](https://thefwa.com/cases/era), [CSSDA](https://www.cssdesignawards.com/sites/era/46769/), [Awwwards](https://www.awwwards.com/sites/era).
- **Jay on Art 적용 아이디어:** 지형 지도 대신 행성계의 궤도와 빛의 경로를 장면 전환 모티프로 삼는다. 스크롤 위치에 따라 카메라가 행성 사이를 천천히 이동하고, 각 경력·작품 구간은 의미가 다른 컬러 팔레트와 짧은 설명으로 안내한다. 실제 위치 정보나 복잡한 선택형 지도를 만들지 않고 일반 페이지 흐름과 작품 링크를 유지한다.
- **난이도/리스크:** 높음. 복잡한 스크롤-카메라 동기화는 모바일에서 지연·멀미·스크롤 고착을 만들 수 있다. 이동거리/위치 정보가 텍스트로도 제공되어야 한다. 포트폴리오에 적용할 때 회사/도시의 비공개 자료를 연상시키지 않도록 공개 권리 범위를 지킨다.

### 5. Kaizen — makemepulse 인터랙티브 서사 경험

- **실제 데모:** [Kaizen live](https://kaizen.makemepulse.com/)
- **제작자 설명/크레딧:** [makemepulse 공식 케이스](https://www.makemepulse.com/case-study/kaizen), [개발자 Guillaume Colombel 포트폴리오와 스택](https://guillaumecolombel.fr/project/kaizen)
- **인터랙션/기술:** 아이가 내면의 목소리와 함께 이동하는 4개 챕터형 서사 경험. WebGL/NanoGL 장면, GSAP/XState 상태 전환, 사운드와 스크롤을 함께 사용한다. 씬마다 가치/메시지가 달라진다.
- **기억되는 이유:** 화면 효과가 기술 쇼케이스에 머물지 않고, 주인공과 여정의 감정·브랜드 메시지를 함께 전달한다. 작은 장면과 발견이 기술력을 이야기로 바꾼다.
- **확인 가능한 인기 근거:** [Awwwards의 2024-06-26 Site of the Day 등재](https://www.awwwards.com/sites/kaizen), [FWA Site of the Day 제작사 발표](https://www.linkedin.com/posts/makemepulse_interactive-fwa-sotd-activity-7206627564994359296-ps4j). 개발자 포트폴리오에서 작업 참여와 기술 스택도 확인된다. 소셜 게시물의 좋아요/조회 수는 조사 자료에 명시되지 않아 인기 수치로 쓰지 않는다.
- **Jay on Art 적용 아이디어:** 경력 내러티브를 챕터처럼 나누고 각 장면의 색과 행성·성운 흐름이 그 시기의 역할과 작업 성격을 받쳐주도록 한다. 모션은 문장과 사건의 강조점에 맞춰 절제하고, 사운드 없이도 의미가 완결되게 구성한다. 모션 감소 설정에서는 정적인 우주 배경과 동일한 본문 순서로 내용을 전달한다.
- **난이도/리스크:** 높음. 시간축, 모션, 오디오, 장면 간 상태 유지가 복합적이다. 사운드는 기본 재생하지 말고 자막/정지 대체 경로를 제공한다. 스크롤을 가로채지 않으며 모션 감소 설정에서 정적 시퀀스로 전환한다.

### 6. Bruno Simon — 포트폴리오 자동차 월드의 이전 세대 (기법 비교용)

- **라이브 경험:** 위의 2025판이 현재 메인이다. 과거 v1의 공개 데모/코드와 학습 자료는 [Three.js Journey 포트폴리오 튜토리얼](https://threejs-journey.com/lessons/portfolio-1-introduction) 및 [Bruno Simon의 포트폴리오/랩](https://bruno-simon.com/html/)에서 확인한다.
- **인터랙션/기술:** 사용자가 직접 차량을 주행해 프로젝트 위치를 찾는 세계형 정보구조. Three.js와 물리 기반 움직임은 작품 정보 탐색과 발견 경험을 한 덩어리로 만든다.
- **기억되는 이유:** 포트폴리오 분야의 상징적 레퍼런스다. 차량 조작, 점프/충돌, 인터랙티브 오브젝트로 창작자 성격을 강하게 각인한다.
- **인기/수상 근거:** [Awwwards 공식 사이트](https://www.awwwards.com/sites/bruno-simon-portfolio)는 2019 Site of the Year 및 Developer Award 기록을 표시한다. 단, 이는 구버전 성과이므로 최근 페이지의 수상처럼 혼동하지 않는다.
- **Jay on Art 적용 아이디어:** 차량 주행과 게임식 조작은 범위에서 제외하고, 강한 공간감이 작품을 기억하게 만드는 원리만 참고한다. 하나의 연속된 우주 배경을 유지하되 스크롤이 장면 이동을 이끌고, 키보드·터치에서 별도 조작을 요구하지 않는다. 고정형 작품 목록과 카드 링크를 함께 제공해 탐색 시간을 짧게 유지한다.
- **난이도/리스크:** 매우 높음. 운전 조작은 매력적인 만큼 목표 방문자가 제어법을 학습해야 한다. 탐색 목적이 불분명해지면 직무/경력 확인을 늦춘다. 차량 이동은 선택형 모드로 두고 정지 카메라/키보드 탐색을 대안으로 제공한다.

### 7. GPT-6 Astra / Opus 5.5 — 같은 프롬프트로 제작한 코드 생성 인터랙션

- **라이브 샘플:** [Opus 5.5 launch page 데모](https://www.aiformortals.co/builds/launch-film-opus-5-5); [세 모델 비교 및 전체 빌드 목록](https://www.aiformortals.co/blog/opus-5-5-fable-5-1-gpt-6-astra-results)
- **인터랙션/기술:** 코드로 그린 찢어진 종이 리빌, 스크롤에 따라 움직이는 콜라주 패널, 20초 런치 필름, 브라우저에서 생성한 종이 사운드. GPT-6 Astra·Opus 5.5·Fable 5.1에 같은 프롬프트를 주어 빌드들을 비교한 사례다.
- **기억되는 이유:** 단순히 모델이 예쁜 페이지를 만들었다는 주장보다, 동일 프롬프트와 공개된 데모로 각 빌드 결과를 직접 살펴볼 수 있다. 화면 효과와 사운드 설계까지 한 경험으로 이어진다.
- **확인 가능한 인기/검증 근거:** [제작자 비교 글](https://www.aiformortals.co/blog/opus-5-5-fable-5-1-gpt-6-astra-results)은 빌드와 조건(모델별 다른 코딩 환경, 동일 프롬프트, 고추론 설정, 이미지 생성기 공통 사용)을 밝힌다. 독립 벤치마크는 아니며, 모델별 기여나 성능 일반화의 근거로 쓰면 안 된다. Opus 데모에 이어진 다른 모델별 작업은 비교 글의 링크에서 확인한다.
- **Jay on Art 적용 아이디어:** 종이 찢김·콜라주·자동 재생 사운드는 복제하지 않는다. 대신 스크롤에 맞춘 얕은 시차와 행성·은하 레이어의 부드러운 리빌을 사용해 화이트톤 우주 내러티브를 돕는다. 생성형으로 채운 행성·성운 이미지는 실제 작품 자료와 시각적으로 구분하고 교체 예정임을 표시하며, 사운드는 기본 재생하지 않는다.
- **난이도/리스크:** 중상. 셰이더와 Canvas 구현은 구현 범위를 조절하기 좋지만, 생성 이미지/영상은 실제 작업 증거와 혼동될 수 있다. 개인 작업 이미지는 원본 출처를 연결하고 생성 이미지 사용 시 명확하게 구분한다. 오디오 autoplay 금지, 동영상 저용량 프리뷰와 정적 poster 필요.

### 8. GPT-6 Astra × “10K Websites” — 고해상도 스크롤 스토리의 제작 워크플로

- **저장소/사례:** [GitHub 공개 저장소](https://github.com/Barty-Bart/gpt-6-astra-10k-websites)
- **인터랙션/기술:** 데스크톱 브랜드 사이트 프롬프트와 모바일 세부 구도/세로형 미디어로 재구성하는 모바일 후속 프롬프트를 공개한다. 이미지/비디오 생성 자산과 scroll-scrub 애니메이션을 포함하는 방향이다. 이 저장소는 공개 프롬프트이지 특정 실제 Jay on Art 스타일 데모의 품질 증거는 아니다.
- **기억되는 이유:** 데스크톱을 축소한 모바일 반응형만으로 끝내지 않고, 모바일용 프레이밍과 스크롤 시간을 다시 설계한다는 워크플로가 명시적이다.
- **확인 가능한 인기 근거:** 조사일 GitHub 페이지에 약 169 stars / 69 forks가 표시된다. 이는 코드/프롬프트에 대한 플랫폼 참여 신호이며 완성된 사이트의 방문자나 성능을 뜻하지 않는다. 저장소는 Higgsfield MCP와 유료 생성 크레딧을 필요로 한다고 밝힌다.
- **Jay on Art 적용 아이디어:** 데스크톱의 넓은 행성계와 모바일 세로형 우주 흐름을 별도로 구도화한다. 모바일에서는 장식 레이어 수와 카메라 이동 폭을 줄이고 카드·본문의 읽기 순서는 그대로 보장한다. 생성형 우주 자산은 데스크톱·모바일 크롭을 함께 준비하되 임시 자료라는 표식을 유지한다.
- **난이도/리스크:** 중상~높음. 영상 시퀀스는 다운로드/디코딩 비용이 크고, 스크롤 연동은 모바일 브라우저·저사양에서 버벅임과 배터리 소모를 일으킬 수 있다. 정지 프레임 대체, 저대역폭 이미지, 모바일 전용 asset, reduced motion을 준비한다.

### 9. Bartosz Ciechanowski — 기계/물리 인터랙티브 에세이

- **실제 작업:** [Gears](https://ciechanow.ski/gears/) · [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) · [Internal Combustion Engine](https://ciechanow.ski/internal-combustion-engine/)
- **인터랙션/기술:** 드래그, 슬라이더, 컷어웨이, 파라미터 조절로 기계와 물리 현상을 단계별로 설명하는 장문의 인터랙티브 일러스트레이션/시뮬레이션.
- **기억되는 이유:** 보는 사람을 단순 관객에서 조작자로 바꾸고, 복잡한 시스템의 구성과 인과관계를 시각적으로 이해하게 한다. 기술 장인정신을 콘텐츠 자체로 보인다.
- **확인 가능한 인기 근거:** 관련 GitHub 큐레이션/에듀케이션 자료에서 반복적으로 링크되는 대표 사례이며([UCalgary iLab 연구자료의 레퍼런스](https://ilab.ucalgary.ca/static/publications/uist-2023-chulpongsatorn.pdf)), 공식 사이트에 공개된 완성 작업으로 접근 가능하다. 조사에서 신뢰할 만한 최신 방문량/소셜 수치를 확인하지 못해 수치 인기는 주장하지 않는다.
- **Jay on Art 적용 아이디어:** 복잡한 물리 시뮬레이션 대신 작품마다 행성의 궤도·재료·색이 무엇을 상징하는지 짧은 캡션과 시각 자료로 설명한다. 사용자가 직접 조작해야만 이해되는 구조는 피하고, 필요한 경우 궤도나 행성 레이어를 선택적으로 살펴보게 한다. 본문·키보드 접근과 정적 이미지 경로를 동일하게 지원한다.
- **난이도/리스크:** 높음. 조작 가능한 설명을 만들려면 사실성 있는 데이터 모델, 일러스트와 문장 순서 설계가 필요하다. 상호작용이 많아도 이야기 흐름이 끊기지 않도록 단계/리셋 기능을 넣는다. 키보드/터치 슬라이더와 정적 다이어그램 대안을 제공한다.

## 구현 난이도 가이드

| 등급 | 범위 예시 | Jay on Art 제안 |
|---|---|---|
| 중 | HTML 레이아웃, 이미지 위 미세 parallax, 일부 SVG/Canvas | 작품 카드의 미세 움직임, 타임라인의 선택 하이라이트 |
| 중상 | Three.js 단일 hero 씬, 포인터 반응/카메라, 저용량 GLB, 간단한 셰이더 | 임팩트 있는 기술 브랜드 첫인상의 실용적 시작점 |
| 높음 | 복수의 최적화 씬, scroll-driven 카메라, 애니메이션/상호작용/상태 관리 | 한 장의 핵심 프로젝트 탐색에만 사용 |
| 매우 높음 | 맞춤형 3D 월드, 물리, 자유 주행, 복잡한 오디오/반응형/저사양 대응 | Bruno Simon 급 완성도를 위한 별도 제작 예산과 장기간 QA가 필요 |

## 필수 리스크 대응

- **정보 접근:** 제목, 경력, 프로젝트 명, 기술, 프로젝트 상태(개인 작업/상용/프로토타입), 연락 방법은 접근 가능한 HTML 텍스트로 남긴다. 3D 안에서만 정보를 제공하지 않는다.
- **모션/접근성:** `prefers-reduced-motion`을 존중하고, 자동 회전/강제 스크롤/자동 재생 사운드를 피한다. 키보드 조작, 초점 표시, 대비, 자막/대체 설명, Skip/Reset을 제공한다.
- **모바일:** 화면 크기만 줄이는 대신 상호작용을 탭/간단한 제스처로 바꾼다. 3D 월드는 선택적 경험이며 기본 정보는 빠른 리스트로 제공한다.
- **성능:** 최적화 GLB/텍스처, 씬 분할, 지연 로딩, 낮은 픽셀 비율, 프레임 제한, 정적 poster를 쓴다. 페이지 첫 바이트부터 전체 월드를 로딩하지 않는다.
- **사실/권리:** 회사 프로젝트 이미지와 수치 성과는 공개 승인을 확인한다. AI 제작물, 개인 작품, 회사 경력을 명확히 라벨링하고 모델 사용 자체를 성과 주장으로 쓰지 않는다.

## 조사 기준과 한계

- **수상 근거**는 수상 기관 페이지 또는 제작자 공식 케이스와 수상 기관을 교차 링크한 자료를 우선했다.
- **인기 근거**는 수상, 플랫폼 표시 GitHub stars/forks, 소셜 공개 게시물과 그곳에서 제공한 반응 수로 구분했다. Award와 social metrics는 방문량/사용성을 직접 증명하지 않는다.
- **시각적 인상**은 확인된 인기와 분리했다. Loaflet의 GPT-6 Astra 사용 주장은 작성자 진술이며, 공개 소스/작업 로그가 없다는 점을 함께 기록했다. Pat Simmons의 모델 비교 역시 자기보고형 사례이며 통제된 일반 성능 벤치마크가 아니다.
- X는 접근 제한 때문에 일부 게시물의 원문/반응을 직접 열 수 없었다. 이를 우회해 확인되지 않은 X 지표를 사실로 사용하지 않았다. 공개 검색 결과와 소셜 게시물, GitHub, 수상 갤러리를 범위에 포함했다.
- 데모 사이트는 조사 기준일에 접근 가능한 공개 URL을 확인했다. 브라우저·하드웨어에 따른 실제 성능/접근성 테스트는 하지 않았다. 페이지의 배포나 제품 상태가 언제든 바뀔 수 있다.

## 최신 동적 페이지 전환·공간형 내비게이션 추가 조사

이 보강은 “스크롤을 내릴 때 장면이 바뀌는 사이트”에만 머무르지 않고, 메뉴/링크로 다른 페이지를 선택할 때 WebGL 장면이 이어지거나 형태를 바꾸는 사례와 사이트 정보구조 자체를 3D 공간으로 만드는 최근 워크플로를 중심으로 한다. 각 사례가 다른 설계 문제를 해결하므로, 모든 효과를 섞기보다 원하는 브랜드 이야기와 탐색 구조에 맞춰 한 가지 주된 전환 언어를 고르는 것이 좋다.

### A. Mutiny Land — 섬을 걸어서 탐험하는 실제 운영 사이트 (2026)

- **라이브 경험:** [Mutiny Land](https://www.mutiny-labs.com/land/)
- **제작 설명/확인 자료:** [Mutiny Labs 공식 케이스](https://www.mutiny-labs.com/work/mutiny-land)
- **무엇이 동적인가:** 메인 메뉴에서 페이지를 누르는 대신 작은 섬의 집/정원/작업대로 직접 이동한다. 장소는 실제 작업·소개·도서관·사례 연구에 대응한다. `클릭해서 걷기` 경로 탐색, 키보드/터치 입력, 지도와 빠른 링크, 주민 대화, 작업대의 참여형 선택 활동이 있다. 화면 안의 HTML 패널을 열어도 현재 섬 위치와 진행 상태가 유지된다.
- **최근 제작 방식:** 절차적으로 만든 WebGL 지형, Three.js, A* 클릭 이동, 인스턴스 드로우/성능 단계 조절. 콘텐츠 카드는 기존 사이트의 케이스스터디 JSON을 실시간 사용해 3D 섬과 일반 페이지의 정보가 따로 낡지 않게 한다. 제작자는 7.2MB의 월드, 8개 목적지, 25개 발견 기록, 일반 키보드/터치 조작, 모바일 품질 저하 대응을 명시한다.
- **기억되는 이유:** 3D가 배경 장식이 아니라 사이트의 정보 구조다. 장소에서 바로 실제 사례·대화·작업 흐름으로 이어지고, 사용자가 걸을지 지도로 이동할지 선택한다.
- **인기/증거 구분:** 실제로 동작하는 사이트와 자체 상세 구현 케이스가 확인된다. 조사일 기준 수상·독립 방문량 지표는 확인되지 않았다. 따라서 이를 수상/대중 인기 사례라 부르지 않고, 최근 구현 워크플로 참고로 선정한다.
- **Jay on Art 적용 아이디어:** 우주를 걷는 게임을 만들기보다, 행성 흐름을 내러티브의 시각적 연결로 사용한다. 프로젝트 정보는 Discover 카드, 간결한 목차, 직접 연결로 즉시 찾을 수 있어야 한다. 캐릭터·대화·퀘스트·길찾기 시스템은 도입하지 않고, 스크롤 배경은 선택적 표현 레이어로 한정한다.
- **난이도/리스크:** 매우 높음. 공간/캐릭터/길찾기/대화까지 구현하면 게임 제작 범위가 된다. 제작자 케이스 자체도 3D 로딩 실패 시 작품 목록과 교육 페이지로 이동하는 대안을 보여준다. 터치, 키보드, 지도, 직접 링크, 세이브 상태, 입력/패널 분리가 필수다. Jay on Art은 캐릭터/보상/대화 시스템보다 제한된 장면과 작품 탐색에 집중하는 편이 적합하다.

### B. Concept Plus — 평면 메뉴 대신 층별 평면도를 누르는 서비스 전환

- **라이브 경험:** [Concept Plus](https://conceptplus.ae/)
- **공식 구현/결과 설명:** [Adnika 케이스 스터디](https://adnika.com/case-studies/concept-plus/)
- **무엇이 동적인가:** 7개 사업 부문을 일반 드롭다운 대신 플로어 플랜/공간 이동으로 선택한다. 메뉴 선택으로 각 부문 씬과 콘텐츠로 이동하고, 별도 실제 서비스 페이지가 존재한다. 화면을 확인하면 메뉴 목적지와 페이지 제목/서비스 텍스트가 함께 나타나 3D만을 유일한 정보 경로로 만들지 않는다.
- **최근 제작 방식:** 사이트는 WebGL 씬과 스크롤 연동 영상 프레임을 선택적으로 로드하며, 다음 예상 씬만 미리 읽고, 기기/연결이 못 받쳐주면 정적 표현으로 낮춘다고 제작사가 설명한다. WordPress의 일반 URL/콘텐츠 구조와 3D 장면을 함께 쓴다.
- **기억되는 이유:** 메뉴 선택이 복수 사업의 관계를 공간으로 보여주며, 실제 부문별 페이지도 유지한다. “페이지 전환”의 연출과 직접 링크/검색 가능성이 함께 간다.
- **인기 근거:** 케이스에 Google PageSpeed 90 및 유기 검색 트래픽 +170%가 기재되어 있지만, 이는 제작사의 자체 보고이고 외부 독립 감사가 아니다. 조사 시점의 실제 사이트와 URL/페이지는 직접 확인했다.
- **Jay on Art 적용 아이디어:** 행성 이름이나 궤도 표식을 목차와 연결해 섹션 사이의 관계를 보여주되, 각 경력·작품에는 직접 접근 가능한 링크와 명확한 제목을 둔다. 선택하면 해당 구간으로 이동하고 배경의 카메라·컬러만 부드럽게 따라간다. 우주 내비게이션이 유일한 탐색 경로가 되지 않도록 일반 HTML 메뉴와 빠른 작품 목록을 유지한다.
- **난이도/리스크:** 높음. 카메라 이동과 텍스트 레이아웃 동기화, 탐색 상태, 모바일 별도 입력이 필요하다. 실제 URL 없이 한 페이지에서만 동작하면 직접 공유/검색/브라우저 뒤로가기 경험이 약해진다. 개별 목적지에는 별도 경로/HTML 본문을 둔다.

### C. Roman Jean-Elie — 하나의 3D 포털이 페이지마다 위치·크기·씬을 바꾸는 포트폴리오 (2025)

- **라이브 포트폴리오:** [Roman Jean-Elie](https://www.romanjeanelie.com/)
- **저자의 구현기:** [Codrops: Letting the Creative Process Shape a WebGL Portfolio](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)
- **무엇이 동적인가:** 메뉴에서 Home/Work/About/Contact로 바뀌어도 3D 화면이 통째로 사라지는 대신 화면 안 포털의 크기와 위치, 내부 카메라/캐릭터 동작이 다음 페이지 구성에 맞게 움직인다. 화면이 포털 형태에서 큰 타이포그래피 마스크로 변하는 장면도 있다.
- **최근 제작 방식:** React Three Fiber/Three.js의 별도 렌더타깃(FBO) 텍스처를 셰이더 마스크로 DOM 위에 표시. ResizeObserver로 DOM 앵커 위치를 추적하고, GSAP이 포털 위치/크기와 페이지의 진입·퇴장 상태를 동시 조절한다. 해시 라우트/브라우저 기록은 유지하므로 뒤로/앞으로도 작동한다.
- **기억되는 이유:** 공간 전체를 만들지 않고도 페이지 이동 자체가 연출의 중심이 된다. 3D 씬이 모든 화면을 뒤덮지 않고 2D 콘텐츠 창의 “살아 있는 내부”로 기능한다.
- **인기/증거 구분:** Codrops에 실린 저자의 재현 가능한 구현 설명과 실제 사이트가 확인된다. 이 자료는 기술/제작 워크플로 근거이며 수상·트래픽 근거는 확인하지 못했다. 페이지는 더 나은 경험을 위해 데스크톱 및 모바일 가로 회전을 안내하므로 모바일 설계의 한계를 함께 참고한다.
- **Jay on Art 적용 아이디어:** 행성의 가장자리나 성운의 원형 빛을 섹션 전환의 시각적 앵커로 활용할 수 있지만, 화면을 덮는 복잡한 포털·셰이더는 필수 요구로 두지 않는다. 배경 씬은 지속시키고 콘텐츠는 별도 DOM 레이어에 둔다. 모바일은 세로형 레이아웃과 정적 대체 장면을 지원하며 화면 회전을 요구하지 않는다.
- **난이도/리스크:** 높음. WebGL 장면-레이아웃 좌표 연동, FBO, 셰이더 마스크, 페이지 상태 동기화가 필요하다. 뷰포트/폰트/스크롤 변화에 포털이 어긋나기 쉽고, 가로 세로 회전 요구는 모바일 이탈을 만든다. 데스크톱 특화 버전과 동등한 세로형 모바일 흐름을 설계할 것.

### D. Design by HL — 2026년 10월, 직접 URL과 3D/전환 워크플로를 함께 공개한 사이트

- **실제 사이트:** [Design by HL](https://dsgnbyhl.com/en/)
- **제작자가 공개한 최신 제작기:** [How I built this 3D portfolio and made its content accessible to Google (2026-10-07)](https://dsgnbyhl.com/en/blog/building-a-3d-portfolio/)
- **무엇이 동적인가:** 물·하늘·떠 있는 큐브가 있는 Three.js 씬 안에서 페이지/뷰를 바꾸고, 메뉴의 목적지로 카메라가 이동한다. 개별 서비스·작품은 직접 열 수 있는 URL과 서버에서 렌더링되는 일반 HTML 페이지다. 제작기는 Highway를 페이지 전환에 사용한다고 밝힌다.
- **최신 제작 방식의 포인트:** 3D 장면은 공통 표현 레이어, 페이지 텍스트는 HTML 문서로 분리. JavaScript가 없어도 본문/주요 링크는 보이도록 한다. 페이지 전환 시 title·description·canonical·언어·소셜 메타데이터를 갱신하며, 포인터/포커스/idle 시점에 다음 씬 렌더 일을 선행 준비한다. 렌더링 품질은 실제 프레임 시간에 맞춰 조절한다. 작성자는 WebGPU도 시험했지만 셰이더 그래프 초기화 비용이 낮은 사양의 CPU에서 첫 화면/전환을 늦춰 WebGL을 기본값으로 둔다고 적었다.
- **기억되는 이유:** 최신 WebGPU로 무조건 바꾸는 대신, 페이지 전환 중 시작 비용까지 관찰해 더 안정적인 렌더 경로를 택한 제작 과정을 공개한다. 화려한 경험과 직접 검색/공유 가능한 페이지를 병행한다.
- **인기 근거:** 최근 공개된 제작자의 실제 사이트와 구체적인 구현기다. 조사 시점 외부 수상·조회 수 증거는 확인되지 않았다. 인기 사례라기보다 최신의 투명한 제작 워크플로 레퍼런스다.
- **Jay on Art 적용 아이디어:** 화이트·펄 톤 WebGL 배경을 공통 시각 레이어로 두고, 이력·프로젝트·연락처는 일반 HTML 문서와 접근 가능한 링크로 유지한다. 배경이 로드되지 않거나 JavaScript가 꺼져도 주요 내용은 먼저 읽혀야 한다. 실제 배포 시 페이지 메타데이터와 공유 URL을 콘텐츠에 맞춰 관리한다.
- **난이도/리스크:** 중상~높음. 서버 렌더링 페이지와 클라이언트 전환의 메타데이터/스크롤/초점/상태를 다 맞춰야 한다. 제작 사이트는 첫 화면에서 “데스크톱 경험”과 모바일 가로 회전을 안내하므로, Jay on Art에서는 별도 세로형 모바일 내비게이션과 2D 빠른 목록이 필요하다.

### E. Owen Sterling — 라우트가 바뀌면 살아 있는 WebGL 배경의 모드도 바뀌는 포트폴리오 (2026)

- **실제 사이트:** [Owen Sterling](https://owensterling.com/)
- **기술 설명:** [포트폴리오 프로젝트](https://owensterling.com/portfolio/this-website), [WebGL 렌더러 문서](https://owensterling.com/docs/webgl-renderer/)
- **무엇이 동적인가:** Home/About/Portfolio/Games/Docs를 바꿀 때 배경 WebGL 캔버스가 파괴되지 않고 유지된다. 문서 페이지로 이동하면 네뷸라/입자 밝기를 부드럽게 낮추고, 포트폴리오 화면에서는 다시 활성화하는 식으로 route에 맞는 프리셋을 보간한다.
- **최근 제작 방식:** Astro 5 ClientRouter의 페이지 전환과 `transition:persist`로 렌더 캔버스를 보존하고, 라우트 완료 이벤트에서 모드 컨트롤러가 새 시각 상태로 전환한다. 직접 작성한 WebGL 2 렌더러는 DOM 배치와 연동되는 유리/블룸/입자 레이어를 가진다. 실제 문서에는 reduced-motion에서 정적 렌더 경로를 선택하는 기술도 적혀 있다.
- **기억되는 이유:** “페이지 이동 때마다 로딩 화면/캔버스 리셋”을 피하고, 3D 배경이 각 페이지의 콘텐츠 성격에 맞춰 얌전해진다. 하이테크 비주얼을 계속 보여주면서 읽어야 할 페이지에서는 배경 밀도를 낮춘다.
- **인기 근거:** 사이트와 자체 기술 문서로 기능을 확인할 수 있다. 독립 수상/트래픽 수치는 확인되지 않았다.
- **Jay on Art 적용 아이디어:** 지속되는 밝은 우주 배경을 유지하면서 구간별로 행성 색, 성운의 밀도, 빛의 세기와 카메라 움직임을 조절한다. 본문 집중 구간에서는 배경 bokeh·블러와 대비를 조정해 텍스트 가독성을 우선한다. reduced-motion 및 WebGL 실패 시에도 같은 내러티브를 전달하는 정적 배경을 제공한다.
- **난이도/리스크:** 중상~높음. 캔버스 지속, 라우트별 렌더 프리셋, 복구/뒤로가기 테스트가 필요하다. 웹GL 오류나 문서 진입 전에 렌더러가 잠시 콘텐츠를 가릴 수 있다. 기술 문서가 상세하지만 외부 수상/인기 성과는 없는 독립 포트폴리오 사례다.

### F. 브라우저 View Transition API — 일반 페이지 간에도 공유 이미지/레이아웃을 이어 주는 기본 전환

- **공식 문서와 인터랙티브 데모:** [Chrome for Developers — View Transition API](https://developer.chrome.com/docs/web-platform/view-transitions?hl=en), 문서 안의 [Cross-document Stack Navigator 데모](https://view-transitions.chrome.dev/stack-navigator/)
- **작동 방식:** 브라우저가 이전/새 문서의 스냅샷을 잡아 링크 이동 사이에 CSS 애니메이션을 수행한다. 같은 작품 썸네일과 상세의 대표 이미지에 동일한 전환 이름을 주면 두 페이지 사이에서 이어지는 효과를 만들 수 있다. SPA에 종속되지 않는 MPA 전환 경로도 있어 모든 페이지를 한 클라이언트 앱으로 만들 필요가 없다.
- **기억되는 이유:** 무거운 WebGL 장면을 전 페이지에 유지하지 않아도 카드 이미지가 확대되어 상세 장면으로 이어지는 것처럼 보인다. 체감상 페이지 이동은 영화적인데, 페이지는 보통 URL/HTML로 유지된다.
- **확인 가능한 근거:** Chromium 공식 문서가 같은 문서/다른 문서 전환 원리와 실제 데모를 제공한다. 이 API 자체는 수상작/인기 수치 사례가 아니라 최근 제작 방식의 공식 플랫폼 기능이다. 브라우저 지원과 기능 차이는 구현 전에 업데이트된 호환성 정보를 확인해야 한다.
- **Jay on Art 적용 아이디어:** 작품 카드의 실제 대표 이미지와 상세 페이지의 같은 이미지를 연결해 카드가 자연스럽게 확장되는 전환을 적용할 수 있다. 이 전환은 행성·은하 배경의 무거운 장면 이동과 별도로 취급해 기본 웹 탐색과 직접 링크를 유지한다. 브라우저 지원 차이가 있어도 즉시 이동하는 일반 링크가 정상 동작해야 한다.
- **난이도/리스크:** 중. 의미 있는 이미지마다 고유/일관된 transition-name을 관리하고, 브라우저 지원 실패/새 탭/앞뒤 이동을 고려해야 한다. 모든 문서를 스크린샷 애니메이션처럼 바꾸면 접근성과 네비게이션 감각이 흐려지므로, 이미지 연속성이 실제로 있는 곳만 쓴다.

### G. Compiz Web — 화면 픽셀 전체가 타는 셰이더 페이지 전환 실험

- **라이브 실험:** [Compiz Web](https://compiz-web.vercel.app/)
- **기술/작동:** 서로 다른 페이지를 텍스처처럼 읽어 WebGL 셰이더로 합성하고, 클릭한 링크마다 페이지가 불타거나 녹는 창 관리자 스타일 효과를 적용한다. 메뉴에 여러 효과 선택 기능이 있다.
- **기억되는 이유:** 카드 하나의 공유 요소 애니메이션을 넘어 전 페이지 캡처가 실시간 셰이더를 통과한다. WebGL 전환의 극단적인 시각적 임팩트와 브라우저 렌더링 모델 자체를 보여준다.
- **인기/검증 근거:** 개발자 Max Leiter의 공개 체험/설명만 확인된다. 공식 수상, 대중 반응 수치는 확인되지 않아 기술 실험으로 분류한다.
- **Jay on Art 적용 아이디어:** 전 화면 캡처·연소 셰이더는 사용하지 않는다. 참고할 점은 장면 전환에도 그래픽 언어를 일관되게 적용하는 정도이며, 이 사이트에서는 밝은 우주색의 행성·은하 레이어가 천천히 이어지는 전환으로 제한한다. 카드와 본문은 상시 선명하고 읽을 수 있도록 유지하며, 실험 기능을 핵심 탐색에 의존시키지 않는다.
- **난이도/리스크:** 구현 높음/실사용 위험 매우 높음. 실험 페이지 자체는 현재 일반 환경에서 “기본 fallback” 메시지를 표시하고 실제 셰이더 기능은 Chrome Canary의 `HTMLInCanvas` 실험 플래그가 필요하다고 안내한다. 따라서 표준 상용 레퍼런스로 추천하지 않고, 브라우저 기능의 극단을 보여주는 R&D 자료로만 기록한다.

## 전환 연출 제작 방식 비교와 Jay on Art 우선순위

| 전환 방식 | 대표 사례 | 사용자가 느끼는 변화 | 구현/활용 조건 |
|---|---|---|---|
| URL 간 공유 요소 확대/교차 | View Transition API | 썸네일이 상세 대표 이미지로 이어짐 | 경량·일반 페이지에 적합. 제일 안전한 전역 기본 전환 |
| persistent background + scroll states | 3D Web Lab | 배경 장면은 이어지고 스크롤에 따라 패널·카메라·콘텐츠가 변함 | 작품 서사와 실제 배경 자산이 필요. URL/HTML 콘텐츠는 별도로 유지 |
| 3D 포털 크기/위치/콘텐츠 교체 | Roman Jean-Elie | 포털 창이 새 페이지 위치로 이동하고 내부 장면이 바뀜 | 예술적이고 명확한 한 번의 전환. 작은 영역부터 시작 |
| 공간 허브로 직접 이동 | Mutiny Land, Concept Plus | 메뉴 선택이 목적지의 공간/랜드마크 이동으로 체감 | 최고 임팩트·최고 비용. 사이트 정보가 실제 공간 의미와 연결되어야 함 |
| 전체 페이지 셰이더 합성 | Compiz Web | 이전 화면이 픽셀 단위로 녹아 새 화면으로 변함 | 특수 브라우저 기능 실험. 표준 배포에는 fallback 필수 |

**Jay on Art 추천 조합:** 경력·작품·Resume는 공유 가능한 실제 HTML 경로로 유지한다. 메인 페이지에서는 3D Web Lab처럼 배경-스크롤-작품 카드가 하나의 연속 흐름을 이루게 설계한다. View Transition은 실제 작품의 이미지가 다음 상세 콘텐츠로 이어질 때만 선택적으로 더한다. 전체 공간 탐험은 필수 경로로 두지 않는다.

## 이번 브랜드 페이지에 채택할 참고 범위

이 문서는 다양한 사례를 조사한 아카이브로 유지하되, 현재 사이트의 작업 범위에는 아래 항목만 가져온다. 자세한 적용 지시와 사용자가 정한 아트·타이포그래피 기준은 [고성능 모델 제작 브리프](SYNFORM_고성능_모델_인수인계_브리프.md)를 따른다.

- **주 비주얼 레퍼런스 — 3D Web Lab:** 이어지는 배경, 스크롤에 반응하는 시점·초점, DOM 기반 Discover 카드와 전체 작품 CTA.
- **보완 구현 원칙 — Design by HL:** 캔버스와 HTML 콘텐츠를 분리하고, URL·문서 의미·핵심 링크를 유지한다. WebGL을 사용할 수 없어도 내용에 접근할 수 있게 한다.
- **보완 구현 원칙 — Owen Sterling:** 지속되는 배경 씬에 구간별 모드를 둬 읽기 구간에서 시각 강도를 낮춘다. reduced-motion 대체 흐름을 준비한다.
- **범위 밖:** 게임식 공간 이동, 전체 사이트 게임 월드, 필수 포털 조작, 실험적 전체 페이지 셰이더는 적용하지 않는다. 작품별 상세 페이지가 생기지 않는 한 View Transition도 필수 요구가 아니다.

## 최신 조사 기준 우선순위 판단

**결론: 전체 디자인의 첫 기준은 3D Web Lab이다.** 사용자가 지정한 핵심은 persistent background, scroll action, 아래에서 작품 카드가 나타나는 순서다. CSSDA 공식 기록은 2025-02-13 Website of the Day 수상을 기록한다. 이는 품질 심사 근거이지 방문자 규모나 대중 인기도 수치는 아니다.

| 적용 순서 | 레퍼런스 | Jay on Art에서 가져올 것 | 그대로 가져오지 않을 것 |
|---|---|---|---|
| 1. 디자인 기준 | [3D Web Lab](https://3dweblab.com/) | 이어지는 배경, 스크롤 상태 전환, Discover 대표 작업 카드와 전체 작품 링크 | 제작사 소개 문구·세부 레이아웃 복제, 카드 안의 임의 3D 뷰어 |
| 2. 구현 기준 | [Lightweight](https://lightweight.info/en) / [VKZ 제작 사례](https://www.vkz.studio/projects/lightweight) | 한 개의 실제 자산을 정교하게 보여주고, 3D 모델을 웹용으로 최적화하며, 데스크톱·태블릿·모바일 동작을 따로 다듬는 방식 | 자전거 제품 사이트의 제품·색상·판매 UX |
| 3. 모션 강도 | [Lando Norris](https://landonorris.com/) / [OFF+BRAND 제작 사례](https://www.itsoffbrand.com/our-work/lando-norris) | 짧은 장면 전환, 타이포그래피의 리듬, 필요한 시점에만 나타나는 모션 | 모터스포츠 속도감과 상시 과격한 스크롤 연출 |
| 후순위·선택 모드 | [Bruno Simon 2025 포트폴리오](https://bruno-simon.com/?lang=en), Mutiny Land | 작은 탐험 경험이나 선택형 `Explore` 모드 | 전체 페이지의 필수 내비게이션을 게임 조작으로 대체하는 방식 |

Lightweight는 조사 문서에서 최신 구현 사례로 유효하다. CSSDA는 2026년 1월 Website of the Month로 기록했고, 제작사 VKZ는 Blender에서 모델을 제작한 뒤 Three.js로 옮겨 웹용 최적화를 했으며 반응형으로 설계했다고 설명한다. 따라서 **디자인 방향의 대체재가 아니라, 실제 자산·성능·모바일 화면을 구현할 때의 제작 기준**으로 쓴다. Lando Norris 제작사는 3D/WebGL과 모션, 최적화·지연 로딩을 함께 설명하지만, 스포츠 스타의 에너지와 방문자 전환을 목표로 한 브랜드 사이트라 여기서는 모션 일부만 참고한다.

Bruno Simon은 2026 Webby Technical Achievement와 People's Voice 수상으로 조사 목록에서 가장 강한 최근 수상 신호를 가진다. 그러나 수상은 이 브랜드에 대한 적합성이나 트래픽 증거가 아니다. 자동차를 몰아 사이트를 찾는 구조는 조작 학습과 개발·성능 부담이 있으므로 첫 공개 경로에 적용하지 않는다.

### 이 우선순위를 현재 페이지에 적용하는 방식

현재 로컬 프로토타입에는 실제 작품 이미지, Discover 스타일 카드와 전체 ArtStation 링크, Marakun 이미지 단계 탐색, Aelin 소개, MORAI 우선 경력, AI 코딩 에이전트를 활용해 만든 포트폴리오 제작 흐름, 별도 Resume 페이지가 있다. 현재 Aelin orbit 그래픽은 임시 자료로 표시하며, MORAI 실제 이미지는 포함하지 않았다. 사용자는 다음 제작 단계에서 레이아웃 통일을 위해 Aelin·MORAI 등 누락된 이미지 슬롯을 고품질 생성형 콘셉트 이미지로 임시 채우고 실제 자료로 교체하도록 승인했다. 생성형 자료에는 `임시 생성형 자료 · 실제 산출물이 아님 · 사용자 자료로 교체 예정`을 표시하고 실제 사실·제품 기능·회사 결과물을 만들지 않는다. AI 사례는 실제 사이트 제작 과정을 설명하는 텍스트다. 코드 생성 WebGL 블록아웃은 제거했고 3D Web Lab의 실제 WebGL 배경·스크롤 전환은 아직 구현하지 않았다. 다음 단계에서는 실제 참조의 화면 캡처를 바탕으로 지속 배경 장면, 스크롤 상태, DOM 카드 출현 타이밍, 모바일 구도와 대체 경로를 스토리보드로 확정한다.

## 최신 워크플로에서 반복되는 설계 원칙

1. **URL과 캔버스 상태를 함께 설계한다.** 캔버스 안의 목적지뿐 아니라 `/works/...` 같은 직접 경로를 마련하고, 새 탭/공유 링크/뒤로가기로도 같은 정보를 찾게 한다.
2. **배경과 문서를 분리한다.** 실제 WebGL 장면은 스크롤 중 이어지는 시각 배경과 상태 전환을 맡고, 제목·경력·기술·프로젝트 상태·본문·카드는 HTML/DOM에 둔다. WebGL 미지원·저성능·reduced-motion 환경에는 동일한 정보를 유지하는 대체 경로를 둔다.
3. **페이지 데이터는 한 곳에서 관리한다.** 카드/3D 라벨/상세 본문이 각자 복제되지 않게 공통 콘텐츠 데이터에서 렌더한다. 회사 경력과 개인작 구분도 하나의 표기 체계로 연결한다.
4. **전환 중에도 제목·설명·초점을 갱신한다.** 부드러운 시각 전환이 끝날 때까지 기존 페이지의 문서 제목/키보드 초점/스크린리더 라벨이 남지 않도록 라우트 변경 시 동기화한다.
5. **GPU 예산과 시작 비용을 함께 본다.** WebGPU/고급 셰이더가 항상 더 빠른 것은 아니다. 셰이더 준비와 CPU 시작 비용이 첫 표시를 늦출 수 있으므로, 기기/프레임 예산을 확인하고 WebGL 및 정적 경로를 유지한다.
6. **모바일은 제스처와 화면 구성을 따로 만든다.** 데스크톱 hover/키보드 포털에 의존하지 않고 터치 목적지 선택, 지도, 세로 프레이밍, 더 낮은 3D 프리셋을 마련한다.
7. **보상/음향은 방해받지 않게 한다.** 자동 시작 음악과 긴 로더는 피한다. 사운드/자동 투어/모션은 사용자가 선택하고, reduced-motion 경로는 장식 축소가 아니라 같은 정보가 편하게 읽히는 별도 시퀀스로 만든다.
## 출처 목록

### 브랜드 자료
- [기존 브랜드 페이지 README](file:///F:/_Final/_%EC%9D%B4%EB%A0%A5%EC%84%9C/_%EB%9D%BC%EC%9D%B4%EC%98%A8%ED%95%98%ED%8A%B8/SYNFORM-%EB%B8%8C%EB%9E%9C%EB%93%9C%ED%8E%98%EC%9D%B4%EC%A7%80/README.md)
- 기존 사이트 콘텐츠 문안과 제작 기준서: 동일 폴더의 `SYNFORM_공개용_문안_초안.md`, `SYNFORM_사이트_콘텐츠_제작_기준서.md`, `index.html`

### 데모 / 제작자 / 수상 / 기술
- [Bruno Simon portfolio live + controls and stack](https://bruno-simon.com/?lang=en)
- [The FWA: Bruno Simon FOTY and People's Choice 2025 announcement](https://www.linkedin.com/posts/the-fwa_huge-congrats-to-bruno-simon-for-winning-activity-7417551138415120384-Y3Oq)
- [Webby Awards: Bruno Simon 2026 awards](https://winners.webbyawards.com/2026/websites-and-mobile-sites/features-design/technical-achievement/370083/brunos-portfolio)
- [Awwwards: Bruno Simon legacy portfolio award page](https://www.awwwards.com/sites/bruno-simon-portfolio)
- [Loaflet live](https://loaflet.com/) · [creator's Reddit post](https://www.reddit.com/r/codex/comments/1wfb3f8/i_used_astra_to_turn_my_past_projects_into_a_3d/)
- [3D Web Lab live](https://3dweblab.com/) · [CSSDA official award](https://www.cssdesignawards.com/sites/3d-web-lab/46828/)
- [ERA live](https://era-tekta.ru/) · [Vide Infra official case study](https://videinfra.com/blog/case-study-a-triple-site-of-the-day-winner-powered-by-webgl)
- [Kaizen live](https://kaizen.makemepulse.com/) · [makemepulse official case study](https://www.makemepulse.com/case-study/kaizen) · [developer credits/stack](https://guillaumecolombel.fr/project/kaizen) · [Awwwards](https://www.awwwards.com/sites/kaizen) · [FWA announcement](https://www.linkedin.com/posts/makemepulse_interactive-fwa-sotd-activity-7206627564994359296-ps4j)
- [Bruno Simon tutorial on previous portfolio](https://threejs-journey.com/lessons/portfolio-1-introduction)
- [AI launch film Opus 5.5 build](https://www.aiformortals.co/builds/launch-film-opus-5-5) · [GPT-6 Astra / Opus 5.5 comparison write-up](https://www.aiformortals.co/blog/opus-5-5-fable-5-1-gpt-6-astra-results)
- [GPT-6 Astra 10K Websites prompts GitHub](https://github.com/Barty-Bart/gpt-6-astra-10k-websites)
- [Bartosz Ciechanowski gears](https://ciechanow.ski/gears/) · [mechanical watch](https://ciechanow.ski/mechanical-watch/) · [internal combustion engine](https://ciechanow.ski/internal-combustion-engine/) · [UCalgary iLab UIST paper listing it as reference](https://ilab.ucalgary.ca/static/publications/uist-2023-chulpongsatorn.pdf)
- [Mutiny Land live island](https://www.mutiny-labs.com/land/) · [2026 Mutiny Labs implementation notes](https://www.mutiny-labs.com/work/mutiny-land)
- [Concept Plus live site](https://conceptplus.ae/) · [Adnika case study and performance/traffic claims](https://adnika.com/case-studies/concept-plus/)
- [Roman Jean-Elie portfolio](https://www.romanjeanelie.com/) · [2025 Codrops WebGL portal transition walkthrough](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)
- [Design by HL live site](https://dsgnbyhl.com/en/) · [2026-10-07 creator implementation article](https://dsgnbyhl.com/en/blog/building-a-3d-portfolio/)
- [Owen Sterling live site](https://owensterling.com/) · [portfolio](https://owensterling.com/portfolio/this-website) · [WebGL renderer technical documentation](https://owensterling.com/docs/webgl-renderer/)
- [Chrome for Developers View Transition API documentation and demos](https://developer.chrome.com/docs/web-platform/view-transitions?hl=en) · [cross-document Stack Navigator demo](https://view-transitions.chrome.dev/stack-navigator/)
- [Compiz Web experiment](https://compiz-web.vercel.app/)
- [Joseph Santamaria portfolio](https://joseph-san.com/) · [2026 showcase and source links](https://www.webgpu.com/showcase/joseph-santamaria-3d-webgl-portfolio/)
- [Painted Paths immersive gallery process (2026)](https://www.studio10b.com/projects/art-gallery/process/)
- [The Long Way Home live/demo and implementation notes (2026)](https://buildsbyluke.com/work/cinematic-website/)



- [Lightweight official live site](https://lightweight.info/en) · [VKZ Studio production case](https://www.vkz.studio/projects/lightweight) · [CSSDA WOTM 2026 January record](https://www.cssdesignawards.com/wotm/lightweight/48763/)
- [Lando Norris official site](https://landonorris.com/) · [OFF+BRAND production case](https://www.itsoffbrand.com/our-work/lando-norris)




