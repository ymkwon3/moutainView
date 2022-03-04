let id_span;
let pw_span;

// css에서 사용하는 변수를 js에서 사용가능하게 해줍니다.
let css_color = getComputedStyle(document.documentElement).getPropertyValue("--color");
let css_warning = getComputedStyle(document.documentElement).getPropertyValue("--warning");

$(document).ready(() => {
    id_span = document.getElementById("id_notify")
    pw_span = document.getElementById("pw_notify")
});

// 아이디 유효성 검사
function checkValid(check) {
    var str = check;
    //문자열에 공백이 있는 경우
    var blank_pattern = /[\s]/g;
    if (blank_pattern.test(str) == true) {
        id_span.innerText = '공백이 입력되었습니다.';
        str = null;
    }
    //특수문자가 있는 경우
    var special_pattern = /[`~!@#$%^&*|\\\'\";:\/?]/gi;
    if (special_pattern.test(str) == true) {
        id_span.innerText = '특수문자가 입력되었습니다.';
        str = null;
    }
    // 아이디가 너무 짧거나 긴 경우 (4 ~ 15)
    var id_length = /^[a-zA-z0-9]{4,15}$/;
    if (!id_length.test(str)) {
        id_span.innerText = "아이디는 영문/숫자 4~15 자리 내로 입력해야합니다.";
        str = null;
    }

    if (str === null) {
        return false;
    } else {
        return true;
    }
}

function checkId() {
    const checkId = $('#userId').val()
    const isValid = checkValid(checkId)
    if(!isValid) {
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/register/checkDup',
        data: {id_give: checkId},
        success: function (response) {
            id_span.innerText = response['msg']
            if(id_span.innerText === "사용 가능한 아이디 입니다.") {
                id_span.style.color = css_color;
                id_check = true;
            } else {
                id_span.style.color = css_warning;
                id_check = false;
            }
        }
    });
}

// 비밀번호 공백/길이 체크
function checkPasswordValid(check) {
    var str = check;

    //문자열에 공백이 있는 경우
    var blank_pattern = /[\s]/g;
    if (blank_pattern.test(str) == true) {
        pw_span.innerText = '공백이 입력되었습니다.'
        str = null;
    }
    // 비밀번호가 너무 짧거나 긴 경우 (8 ~ 20)
    var id_length = /^[a-zA-z0-9]{8,15}$/;
    if (!id_length.test(str)) {
        pw_span.innerText = "비밀번호는 문자/숫자/특수문자의 8~20 자리 내로 입력해야합니다."
        str = null;
    }

    if(str === null) {
        pw_span.style.color = css_warning;
        $('#userPassword').val("")
        return false;
    } else {
        return true;
    }
}

function checkPassword() {
    const firstPassword = $('#userPassword').val()
    const secondPassword = $('#checkPassword').val()

    if(firstPassword === secondPassword) {
        pw_span.innerText = '비밀번호가 일치합니다.'
        pw_span.style.color = css_color;

        // 다음으로 포커스 옮김
        $('#userAge').focus()
    } else {
        // 비밀번호와 비밀번호확인이 일치하지않을때, 비밀번호확인 값을 비우고 다시 포커스
        pw_span.innerText = '일치하지 않습니다!!'
        pw_span.style.color = css_warning;
        password_check = false;
    }
}

// 회원가입 버튼 클릭
function register() {
    const userId = $('#userId').val()
    const userPassword = $('#userPassword').val()
    const userBirth = $('#userBirth').val()
    const userNickname = $('#userNickname').val()

    // 닉네임에 값을 넣지 않았을때
    if(userNickname === "") {
        alert("닉네임을 입력하세요!")
        $('#userNickname').focus();
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
        url: "/register/insertDB",
        data: {id_give: userId, password_give: userPassword, birth_give: userBirth, nickname_give: userNickname},
        success: function(response) {
            alert(response['msg'])

            // 로그인 페이지로 이동
            window.location.href = 'login'
        }
    })

}