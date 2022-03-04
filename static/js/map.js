$(document).ready(() => {
    getLocation();

    // 산 검색창 enter키 입력 이벤트입니다.
    $('#find-mtn').keypress(function (e) {
        if (e.which === 13) {
            setMountain();
        }
    });
})

let map = null; // 카카오맵
let markers = []; // 마커객체들의 배열
let userPosition = null; // 현재위치 좌표객체
let infoWindows = []; // 마커 토글 윈도우 배열
let lineArr = [];

let keyword = ""; // 검색어

function getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        // 현재위치 좌표
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let container = document.getElementById('map');

        // 지도 생성
        map = new kakao.maps.Map(container, {
            center: new kakao.maps.LatLng(latitude, longitude),
            level: 8
        });

        // 마커가 표시될 좌표
        userPosition = new kakao.maps.LatLng(latitude, longitude)

        // 로컬 이미지 안불러와져서 일단 아무거나 넣었습니다 ㅠㅠ
        // const imageSrc = "https://image.pngaaa.com/232/2702232-middle.png",
        //     imageSize = new kakao.maps.Size(60, 60), // 마커이미지의 크기입니다
        //     imageOption = {offset: new kakao.maps.Point(27, 69)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
        // const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption)

        // 유저 마커 (현재위치)
        const marker = new kakao.maps.Marker({
            position: userPosition,
            // image: markerImage
        })

        // 마커를 지도에 표시
        marker.setMap(map)

        let info_html = `<div class="flex-column info-window">내 위치</div>`

        // 마커 클릭 시 표시할 윈도우 생성
        var infowindow = new kakao.maps.InfoWindow({
            content: info_html
        })

        // 클릭 시 생성한 윈도우 토글
        kakao.maps.event.addListener(marker, 'click', makerListener(map, marker, infowindow));

    }, function (error) {
        console.error(error);
    })
}

// 입력값으로 함수 실행
function setMountain(m) {
    // 실행 전 마커 리스트와, 인포윈도우 리스트를 초기화 시켜줍니다.
    init();
    // 산 이름 받기
    if (m === undefined)
        keyword = $('#find-mtn').val();
    else {
        keyword = m;
        $('#find-mtn').val(keyword)
    }
    // 키워드 검색
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(keyword, placesSearchCB);
}

// 키워드 검색 완료 시 호출되는 콜백함수 입니다
function placesSearchCB(data) {

    const list = $('#mountain-list');
    list.empty();
    list.append(`<h1>검색 결과</h1>`)

    for (let i = 0; i < data.length; i++) {
        // 검색결과가 일치하고, 해당 결과의 카테고리가 산일 경우 실행합니다.
        if (data[i]['place_name'] === keyword && data[i]['category_name'] === '여행 > 관광,명소 > 산') {
            let x = data[i]['x'],
                y = data[i]['y'];
            let pos = new kakao.maps.LatLng(y, x);

            let addr = data[i]['address_name'];

            let marker = new kakao.maps.Marker({
                position: pos
            });
            marker.setMap(map);
            markers.push(marker);

            // 현재 위치와 산의 위치를 선으로 연결
            let pivot = new kakao.maps.Polyline({
                map, // 선을 표시할 지도입니다
                path: [userPosition], // 선을 구성하는 좌표 배열입니다
                strokeWeight: 2, // 선의 두께입니다
                strokeColor: "#db4040", // 선의 색깔입니다
                strokeOpacity: .5, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
                strokeStyle: "solid", // 선의 스타일입니다
            });

            let path = pivot.getPath();
            path.push(pos)
            lineArr.push(pivot);

            let info_html = `
                <div class="flex-column info-window">
                    ${keyword}
                    <br>
                    ${addr}
                </div>
                `
            const infowindow = new kakao.maps.InfoWindow({
                content: info_html,
            })
            kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow, pivot, path));
            infoWindows.push(infowindow);

            temp_html =
                `<div class="content-card flex-row-start" onclick="mountainInfo('s')">`;

            // 로그인이 됐을 경우
            if (window.localStorage.getItem('29_login') !== null) {
                let user = JSON.parse(window.localStorage.getItem('29_login'));
                let param = keyword + " " + addr;

                // 즐겨찾기 항목에 해당 산이 존재 할 경우
                if (user['favorite'].find(p => p === param)) {
                    temp_html += `<img alt="즐겨찾기" src="/static/img/favorite_checked.png" class="favorite_icon" onclick="setFavorite('${param}', 'main'); event.stopPropagation()">`
                } else {
                    temp_html += `<img alt="즐겨찾기" src="/static/img/favorite_normal.png" class="favorite_icon" onclick="setFavorite('${param}', 'main'); event.stopPropagation()">`
                }
            }

            temp_html +=
                `<div class="flex-column-start">
                        <h3>${keyword}</h3>
                        <div class="address">${addr}</div>
                    </div>
                    <button class="positive-btn btn-40-40 content-icon" onclick="moveMap(${x}, ${y})">지도</button>
                </div>`

            list.append(temp_html);
        }
    }

    // 검색결과가 없을 경우입니다.
    if (list.children().length === 1) {
        temp_html = ` 
            <div class="content-card">
                검색 결과가 없습니다람쥐!
            </div>`
        list.append(temp_html);
    }
}

// marker 클릭 시 토글
const makerListener = (map, marker, info) => {
    let is = true;
    return function () {
        is ? info.open(map, marker) : info.close();
        is = !is
    }
}

const makeOverListener = (map, marker, info, pivot, path) => {
    let is = true;
    let dist = 0;
    return function () {
        is ? (info.open(map, marker), pivot.setPath(path)) : (info.close(), pivot.setPath(null));
        dist = getDistance(pivot);
        is = !is
    }
}

const moveMap = (x, y) => {
    let pos = new kakao.maps.LatLng(y, x);
    map.panTo(pos);
}

const moveMyPosition = () => {
    map.panTo(userPosition)
}

// 검색 전 데이터 초기화
function init() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null)
    }
    for (let i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
        lineArr[i].setMap(null);
    }
    markers = [];
    infoWindows = [];
    lineArr = [];
}

// todo: 산정보페이지를 띄울때 선택된 산 정보들을 불러옵니다.(필요시 id만 불러오기)
function mountainInfo(data) {
    console.log("데이터,", data)
}

function getDistance(path) {
    // m 직선 거리
    let distance = Math.round(path.getLength());
    // km 변환
    let changeKm = Math.round(distance / 1000 * 10) / 10;
    return changeKm;
}