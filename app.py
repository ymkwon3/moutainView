from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from ignore import *
from bson.objectid import ObjectId
import certifi
import hashlib

#SSL: CERTIFICATE_VERIFY_FAILED 에러 때문에 넣음
ca = certifi.where()
client = MongoClient(mongodb, tlsCAFile=ca)
db = client.dbsparta

app = Flask(__name__)

@app.route('/test')
def test():
    return render_template('testLogin.html')

# ---------- 페이지 라우팅 ---------- #
@app.route('/')
def index():
    return render_template('index.html', kakaomap=kakaomap)

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/home')
def home():
    return render_template('index.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/mountainInfo')
def mountainInfo():
    return render_template('mountainInfo.html')

@app.route('/mypage')
def mypage():
    return render_template('mypage.html')


# ---------- Ajax 요청 ---------- #
# 아이디 중복체크
@app.route('/register/checkDup', methods=["POST"])
def checkDup():
    id_receive = request.form['id_give']
    userList = list(db.users.find({}, {'_id': False}))
    for user in userList:
        if user['id'] == id_receive:
            return jsonify({'msg': '이미 존재하는 아이디 입니다!!'})
    return jsonify({'msg': '사용 가능한 아이디 입니다.'})

# 회원가입
@app.route('/register/insertDB', methods=["POST"])
def userRegister():
    id_receive = request.form['id_give']
    password_receive = request.form['password_give']
    birth_receive = request.form['birth_give']
    nickname_receive = request.form['nickname_give']

    # if (id_receive == "" or password_receive == "" or birth_receive == "" or nickname_receive == ""):
    #     return jsonify({'msg': '정상적이지 않은 접근입니다.'})

    # 암호화
    pw_hash = hashlib.sha256(password_receive.encode('utf-8')).hexdigest()

    doc = {
        "id": id_receive,
        "password": pw_hash,
        "birth": birth_receive,
        "nickname": nickname_receive
    }
    db.users.insert_one(doc)
    return jsonify({'msg': '회원가입 완료'})

#로그인
@app.route('/user/login', methods=["POST"])
def userLogin():
    id_recv = request.form['id_give']
    pwd_recv = request.form['password_give']
    pw_hash = hashlib.sha256(pwd_recv.encode('utf-8')).hexdigest()

    user = db.users.find_one({'id':id_recv}, {'_id':False})
    if user == None:
        result = 'none'
    elif user['id'] == id_recv and user['password'] == pw_hash:
        result = 'success'
        jsonify(user)
    else:
        result = 'fail'
    return jsonify({'msg': result, 'data': user})

#유저정보수정
@app.route('/user/update', methods=["POST"])
def userUpdate():
    id_recv = request.form['id_give']
    pwd_recv = request.form['password_give']
    birth_recv = request.form['birth_give']
    nick_recv = request.form['nickname_give']
    pw_hash = hashlib.sha256(pwd_recv.encode('utf-8')).hexdigest()

    doc = {
        "id": id_recv,
        "password": pw_hash,
        "birth": birth_recv,
        "nickname": nick_recv
    }

    db.users.update_one({'id':id_recv}, {"$set":doc})
    user = db.users.find_one({'id': id_recv}, {'_id': False})

    return jsonify({'msg': "업데이트 완료!", 'data': user})

# 산 정보 요청(임시-권영민)
@app.route("/getMountain", methods=["POST"])
def movie_get():
    mountain_name = request.form['name']
    mountain_addr = request.form['address']
    mountain_list = list(db.tests.find({'address':{'$regex':mountain_addr}, 'name':mountain_name}, {'_id':False}))
    # for m in mountain_list:
    #     m['_id'] = str(m['_id'])
    return jsonify({'mountains': mountain_list})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)