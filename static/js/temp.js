$(document).ready(function () {
    getLocation();

    // 산 검색창 enter키 입력 이벤트입니다.
    $('#find-mtn').keypress(function (e) {
        if (e.which === 13) {
            setMountain();
        }
    });
})

let map;

let markers = [];
let infoWindows = [];

let latitude;
let longitude;

function getLocation() {
    let asd, suc = 0, fail = 0;
    for(let i = 0; i < 1000; i++) {
        asd = Math.floor(Math.random() * 100);
        if(asd < 25){
            suc++;
        }else {
            fail++;
        }
    }
    console.log("성공",suc, ",실패", fail);

    // 현재위치의 좌표값을 가져옵니다.
    navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        let container = document.getElementById('map');

        // 지도를 생성합니다.
        map = new kakao.maps.Map(container, {
            center: new kakao.maps.LatLng(latitude, longitude),
            level: 5
        });

        // 마커가 표시될 위치입니다.
        let markerPosition = new kakao.maps.LatLng(latitude, longitude)

        // 마커를 생성합니다.
        let marker = new kakao.maps.Marker({
            position: markerPosition
        });

        // 마커를 지도위에 표시합니다.
        marker.setMap(map);
        // todo: 사용자 마커 모양 바꾸기
        // 마커를 클릭했을 때 마커 위에 표시할 윈도우를 생성합니다.
        let info_html = `
        <div class="flex-column info-window">
            내 위치
        </div>
        `
        var infowindow = new kakao.maps.InfoWindow({
            content: info_html,
        })

        // 클릭 시 infowindow를 표시합니다.
        kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow));
    }, function (error) {
        console.error(error);
    });
}

// 산 검색시 실행되는 함수
function setMountain() {
    // 실행 전 마커 리스트와, 인포윈도우 리스트를 초기화 시켜줍니다.
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    for (let i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
    }
    markers = [];
    infoWindows = [];

    // 산명을 받습니다.
    let m = $('#find-mtn').val();

    // 키워드로 장소를 검색합니다
    var ps = new kakao.maps.services.Places();
    ps.keywordSearch(m, placesSearchCB);

    // 키워드 검색 완료 시 호출되는 콜백함수 입니다
    function placesSearchCB(data, status, pagination) {
        let list = $('#mountain-list');
        list.empty();
        list.append(`<h1>검색 결과</h1>`);

        for (let i = 0; i < data.length; i++) {
            if (data[i]['place_name'] === m && data[i]['category_name'] === '여행 > 관광,명소 > 산') {
                console.log(data[i]);
                let x = data[i]['x'], y = data[i]['y'];
                let pos = new kakao.maps.LatLng(y, x);

                // 주소중에서 시, 군, 면, 읍단위
                let addr = data[i]['address_name'].split(' ')[1];
                //지도를 해당 위치로 이동합니다.
                map.panTo(pos);

                // 마커를 생성합니다.
                let marker = new kakao.maps.Marker({
                    position: pos
                });

                // 마커를 지도위에 표시합니다.
                marker.setMap(map);

                //지도에 표기되는 산 마커들을 리스트에 저장합니다.
                markers.push(marker);

                // ===============위는 지도 영역, 아래는 리스트 영역=================

                $.ajax({
                    type: 'POST',
                    url: '/getMountain',
                    data: {name: m, address: addr},
                    success: function (response) {
                        let temp_html;
                        let rows = response['mountains'][0];
                        if (rows !== undefined) {
                            let name = rows['name'];
                            let address = rows['address'];
                            let high = rows['high'];

                            // 마커를 클릭했을 때 마커 위에 표시할 윈도우를 생성합니다.
                            // todo : 상세정보 클릭, 아마 아래의 mountainInfo 함수 사용과 같이 하면될듯
                            let info_html = `
                            <div class="flex-column info-window">
                                ${name} (${high}m)
                                <br>
                                <a href="#">상세정보</a>
                            </div>
                            `
                            var infowindow = new kakao.maps.InfoWindow({
                                content: info_html,
                            })
                            // 클릭 시 infowindow를 표시합니다.
                            kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, infowindow));
                            infoWindows.push(infowindow);

                            temp_html = `
                            <div class="content-card flex-row-start" onclick="mountainInfo('${rows}')">
                                <div class="flex-column-start">
                                    <h3>${name}</h3>
                                    <div class="comment">${address}</div>
                                </div>
                                <button class="positive-btn btn-40-40 content-icon" onclick="setPosition(${x}, ${y})">지도</button>
                            </div>
                            `
                            list.append(temp_html);
                        }
                    }
                });
            }
        }
    }
}

// 내 위치로 이동합니다.
function setMyPosition() {
    let pos = new kakao.maps.LatLng(latitude, longitude);
    //지도를 해당 위치로 이동합니다.
    map.panTo(pos);
}

// 해당 위치로 이동합니다.
function setPosition(x, y) {
    let pos = new kakao.maps.LatLng(y, x);
    //지도를 해당 위치로 이동합니다.
    map.panTo(pos);
}

// todo: 산정보페이지를 띄울때 선택된 산 정보들을 불러옵니다.(필요시 id만 불러오기)
function mountainInfo(data) {
    console.log("데이터,", data)
}

// 인포윈도우를 표시하는 클로저를 만드는 함수입니다
// 이 부분은 클로저에 대해서 조금 더 학습할 필요가 있어보임
let makeOverListener = function (map, marker, infowindow) {
    let is = true;
    return function () {
        is ? infowindow.open(map, marker) : infowindow.close();
        is = !is
    };
}