# 프로젝트 소개

## 마운틴뷰

산 검색을 통해 해당 산에 대한 후기를 남겨주세요!

http://ymkwon.shop/

##  1.제작 기간 & 팀원 소개

2022.02.26 ~ 2022.03.06
- 권영민
- 이한울

## 2. 사용 기술

* Server: AWS EC2 (Ubuntu 20.04 LTS)
* Framework: Flask (Python)
* Database: MongoDB
* front-end : HTML5, CSS, Javascript, jquery

## 3. 핵심 기능

* 로그인/회원가입
  - 아이디 중복확인 기능 및 입력 요소 유효성 검사
  
* 메인페이지
   * 산 검색 및 위치 표기
     <br>키워드 검색을 통한 산 검색 후 카카오맵에 위치 표기
     
   * 코멘트 등록
     <br>선택한 산에 대한 후기 등록 가능
  

## 4. trouble shooting

<details>
    <summary>
        브라우저를 통해 사용자 위치 기반 이용 시 https 문제
    </summary>
    <br>
    <div>
        다른 방법이 없나 모색했지만, 브라우저의 사용자 위치를 얻는 기능을 이용하기 위해서는 https의 사용이 불가피해 보였습니다. 아직 ssl을 적용하지 않아서 사용자 위치 기반을 이용한 기능은 제외시킨 상태입니다.
    </div>
</details>
<br>
