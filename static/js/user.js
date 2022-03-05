function userLogin() {
    let userId = $('#userId').val();
    let userPassword = $('#userPassword').val();
    //uncaught RangeError: Maximum call stack size exceeded 에러 오지게뜸...
    $.ajax({
        type: 'POST',
        url: '/user/login',
        data: {id_give: userId, password_give: userPassword},
        success: function (response) {
            if (response['msg'] === 'success') {
                window.localStorage.setItem('29_login', JSON.stringify(response['data']));
                window.location.href = '/'
            } else {
                alert('비밀번호가 올바르지 않거나 등록되지 않은 사용자입니다.')
            }
        }
    })
}

function userLogout() {
    window.localStorage.removeItem('29_login');
    window.location.href = '/';
}

function userUpdate() {
    const userId = $('#userId').val();
    const userPassword = $('#userPassword').val();
    const checkPassword = $('#checkPassword').val();
    const userBirth = $('#userBirth').val();
    const userNickname = $('#userNickname').val();

    // 닉네임에 값을 넣지 않았을때
    if (userNickname === "") {
        alert("닉네임을 입력하세요!")
        $('#userNickname').focus();
        return;
    }

    // 닉네임에 값을 넣지 않았을때
    if (userPassword === "" || checkPassword === "") {
        alert("비밀번호를 입력하세요!")
        $('#userPassword').focus();
        return;
    }

    // 나이의 값이 비어있을때
    if (userBirth === "") {
        alert("생년월일을 입력하세요!")
        $('#userBirth').focus();
        return;
    }

    $.ajax({
        type: "POST",
        url: "/user/update",
        data: {id_give: userId, password_give: userPassword, birth_give: userBirth, nickname_give: userNickname},
        success: function (response) {
            alert(response['msg'])
            window.localStorage.setItem('29_login', JSON.stringify(response['data']));
            window.location.reload()
        }
    })
}

function setFavorite(param, location) {
    let user = JSON.parse(window.localStorage.getItem('29_login'));
    $.ajax({
        type: "POST",
        url: "/user/favorite",
        data: {id_give: user['id'], favorite_give: param},
        success: function (response) {
            window.localStorage.setItem('29_login', JSON.stringify(response['data']));
            alert(response['msg'])
            if (location === 'main')
                setMountain();
            else if (location === 'mypage')
                window.location.reload();
        }
    })
}

function setComment() {
    let comment = $('#write-comment').val();
    let user = JSON.parse(window.localStorage.getItem('29_login'));
    let mName = new URLSearchParams(location.search).get('mName');
    let addr = new URLSearchParams(location.search).get('addr');
    $.ajax({
        type: "POST",
        url: "/comment/insert",
        data: {
            nickname_give: user['nickname'],
            comment_give: comment,
            mName_give: mName,
            addr_give: addr,
            id_give: user['id']
        },
        success: function (response) {
            window.location.reload();
        }
    })
}

function getComment() {
    let mName = new URLSearchParams(location.search).get('mName');
    let addr = new URLSearchParams(location.search).get('addr');
    $.ajax({
        type: "POST",
        url: "/comment/get",
        data: {m_give: mName + " " + addr},
        success: function (response) {
            for (let i = 0; i < response['data'].length; i++) {
                temp_html = `
               <div class="content-card content-card-450-100 flex-column-start" style="justify-content: center!important;">
                    <h2>${response['data'][i]['nickname']}</h2>
                    <div>${response['data'][i]['comment']}</div>
                </div>
               `
                $('#comment').append(temp_html)
            }
        }
    })
}

function userComment() {
    let user = JSON.parse(window.localStorage.getItem('29_login'));
    $.ajax({
        type: "POST",
        url: "/user/comment",
        data: {id_give: user['id']},
        success: function (response) {
            for (let i = 0; i < response['data'].length; i++) {
                temp_html = `
               <div class="content-card flex-row-start">
                    <div class="flex-column-start">
                        <div class="flex-row-start">
                             <h2>${response['data'][i]['mName']}</h2>&nbsp&nbsp<h5>${response['data'][i]['addr']}</h5>
                        </div>
                        <div>${response['data'][i]['comment']}</div>
                    </div>
                </div>
               `
                $('#comment').append(temp_html)
            }
        }
    })
}