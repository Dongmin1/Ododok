# ODODOK 홈페이지 v1.0 배포본

## 1. GitHub Pages 배포
기존 `dongmin1/Ododok` 저장소의 파일을 이 폴더 내용으로 교체합니다.

- index.html
- robots.txt
- sitemap.xml
- assets/logo.svg

GitHub에서 Commit changes 후 1~3분 뒤 아래 주소를 새로고침합니다.
https://dongmin1.github.io/Ododok/

## 2. 카카오톡 채널 연결
`index.html` 맨 아래 JavaScript에서 아래 줄을 찾습니다.

const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_YOUR_CHANNEL_ID/chat";

채널 관리자센터에서 복사한 1:1 채팅 URL로 교체합니다.

예:
const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_AbCdE/chat";

## 3. 현재 폼 동작
- 업체명, 연락처, 업종, 지역, 운영 채널, 링크, 고민 내용을 받습니다.
- 제출 시 신청 내용을 클립보드에 자동 복사합니다.
- 카카오톡 채널 주소가 연결되어 있으면 채널을 엽니다.
- GitHub Pages만으로 작동하며 별도 서버가 필요 없습니다.

## 4. 다음 개선
- 실제 ODODOK 로고 파일로 assets/logo.svg 교체
- 카카오 채널 URL 연결
- 개인정보 처리방침 별도 페이지 추가
- 필요 시 Google Forms/Apps Script 또는 폼 백엔드 연결
