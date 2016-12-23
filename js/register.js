$(function(){
    var ENV = 'dev';
    var invite = getUrlParam("number")||'279B5AE890D02DEA';

    var wait = 0,timer = null;

    var prx = (function(){
        return{
            'test':'//api.sy7.com',
            'prod':'//api.sy8.com',
            'dev':'//customer.dev.sy8.com'
        }[ENV]
    }());
    var LS = localStorage;
    LS.clear();
    if(invite=='0000'){
        LS.clear();
        return;
    }

    if(invite!==LS.getItem('invite')){
        LS.clear()
    }

    LS.setItem('invite',invite);

    if(LS.getItem('phone')){
        $("#phone").val(LS.getItem('phone'))
    }

    if(!window.isReady){
        window.isReady = 1;
        $.ajaxSetup({
            dataType: "json",
            contentType: "application/json",
            accept: "application/json",
            headers: {
                "client": window.pf,
                'auth-token':'' //
            },
            complete: function(res, req) {
                var rp = res.responseJSON || {};
                var _load = $('.loading');
                _load.length && _load.remove();
                if (rp.resCode && rp.resCode != '0000') {
                    alert((!!rp.resDesc ? rp.resDesc : rp.resMsg),res);
                }
            }
        });
    }

    if(LS.getItem('step')!=='2'){
        $.ajax({
            url: prx+'/api/client/user/invite/getInviterPhone',
            async: false,
            data: {
                code: invite
            },
            success: function(data) {
                console.log(data)
                if (data.resCode == "0000") {
                    $("#invPhone").html(data.data);
                    changeimge();

                    $(".v-pic-veri").on("click",function(){
                        changeimge();
                    })

                }
            }
        });
    }else{
        $("#stepOne").hide();
        $("#stepTwo").show();
    }


    //提交第一步
    $("body").on("click","#registerOne",function(){
        var getServerCode = "";
        if(wait){return ;}
        var phone = $.trim($("#phone").val()),
            code = $.trim($("#picVeri").val()),
            token = $(".v-pic-veri").attr("data-token");
        var obj = {
            phone: phone,
            code: code,
            token: token
        };
        if(phone.length==0){
            alert("请填写手机号");
            return;
        }
        else if(!/^1(3[0-9]|5[012356789]|7[01678]|8[0-9]|4[57])\d{8}$/.test(phone)){
            alert("请填写正确的手机号码");
            return;  
        }
        else if(code.length==0){
            alert("请填写验证码");
            return;
        }
        getServerCode = sendPhone({
            phone:phone,
            type:1,
            imageCode:code,
            token:token,
            imgo:".v-pic-veri"
        });
        if(getServerCode.resCode == "61005") {      //注册过
            LS.setItem('step','2');
            LS.setItem('isRegister', 1);
            openWhichWin(1, obj);
        }else if(getServerCode.resCode == "0000") {   //未注册
            LS.setItem('step','2');
            LS.setItem('isRegister', 0);
            countDown("achoeveCode",60);
            openWhichWin(0, obj);
        }else {
            alert(getServerCode.resDesc);
        }

    });

    //提交第二步
    $("body").on("click","#registerTwo",function(){

        if(LS.getItem("isRegister") == 1) { //注册过的  领取事件
            var password =$.trim($("#password").val());
            if(!/^(?=.*[0-9])(?=.*[a-zA-Z~!@#\$%\^&\*\(\)_\+\{\}\|:"<>\?`\-=\[\]\\;',\./]).{8,20}$/.test(password)) {
                alert("密码必须为8~20位英文字母、数字的组合");
                return;
            }
        }
        else if(LS.getItem("isRegister") == 0) { //未注册过的  领取事件
            var phoneCode = $.trim($("#phoneCode").val());
            if(phoneCode.length==0){
                alert("请填写短信验证码");
                return;
            }
        }
        $.ajax({
            url:prx+'/v13/api/client/coupon/getCoupon',
            type:"post",
            headers: {
                "client": 5
            },
            data:JSON.stringify({
                password: password ? password : "",
                phoneCode: phoneCode ? phoneCode: "",
                phoneNum: LS.getItem('phone'),
                toke: LS.getItem('token'),
                verityCode: LS.getItem('verityCode')
            }),
            success:function(data){
                if(data.resCode == "0000"){
                    var wh = LS.getItem('phone').slice(7);
                    LS.clear();
                    //window.location="/success.html?phone="+wh;
                }
            },
            error: function (data) {
                LS.clear();
            }
        });
    });

    $("#cancel-dialog").on('click', function() {
        LS.setItem('step','1');
        LS.setItem('token', '');
        LS.setItem('verityCode', '');
        resetState();
        $("#picVeri").val("");
        changeimge();
    });

    $("body").on("click","#achoeveCode",function () {
        // $('#registerOne').trigger('click')
        $(".layer").addClass('hide');
        $(".dialog").addClass("hide");
        LS.setItem('step','1');
        LS.setItem('token', '');
        LS.setItem('verityCode', '');
        $("#picVeri").val("");
        changeimge();
    });

    function openWhichWin(index, obj) {
        LS.setItem('phone',obj.phone);
        LS.setItem('token', obj.token);
        LS.setItem('verityCode', obj.code);
        $(".layer").removeClass('hide');
        $(".dialog").removeClass('hide');
        $("#msg_code-warp")[index == 1 ? 'addClass' : 'removeClass']('hide');
        $("#pwd-warp")[index == 1 ? 'removeClass' : 'addClass']('hide');
    }

    function resetState() {
        $("#phoneCode").val("");
        $("#password").val("");
        $("#msg_code-warp").removeClass('hide');
        $("#pwd-warp").addClass('hide');
        $(".layer").addClass('hide');
        $(".dialog").addClass("hide");
    }

    //发送手机验证码1：注册、2：找回密码 3：设置交易密码 4：重置交易密码 5:银行卡绑定
    function sendPhone(opt) {
        var _this = this,
            res = "",mytoken;
        if(opt.type == 1 || opt.type == 2){
            mytoken=opt.token;
        }
        else{
            mytoken=LS.getItem("token");
        }
        $.ajax({
            url: prx+'/api/client/msg/sendphonecode',
            async: false,
            headers:{
                client:window.pf,
                'auth-token':mytoken
            },
            data: {
                phonenum: opt.phone,
                type: opt.type,
                imageCode:opt.imageCode||""
            },
            beforeSend: function() {
                wait = 1
            },
            success: function(data) {
                wait = 0;
                if(opt.type == 1 || opt.type == 2){
                    var img = getNewImageUrl();
                    $(opt.imgo).attr({"src":img.url,"data-token":img.token});
                }
                res = data;
                return res;
            },
            complete: function() {
                setTimeout(function() {
                    wait = 0
                }, 500)
            }
        });
        return res;
    }

    function countDown (ID, t) {
        if (t == undefined) t = 60;
        if (timer) clearInterval(timer);
        timer = null;
        setT();

        function setT() {
            if (t < 0) {
                clearInterval(timer);
                $("#" + ID).html("重新获取").removeAttr('disabled').removeClass('disabled');
            } else {
                $("#" + ID).html('重新获取(' + t + '秒)').attr("disabled", true).addClass("disabled");
                t = t - 1;
            }
        }
        timer = setInterval(setT, 1000);
    }

    function changeimge(){
        var img = getNewImageUrl();
        $(".v-pic-veri").attr({"src":img.url,"data-token":img.token});
    }
    function getNewImageUrl(){
        var img={},_this=this;
        $.ajax({
            url: prx+'/api/client/user/imageVerificationToken',
            async: false,
            headers:{client:5 },
            success:function(data){
                if(data.resCode=="0000"){
                    img.url = prx+'/api/client/user/registerImageVerification' + "?auth-token=" + data.token;
                    img.token=data.token;
                }
            }
        });
        return img;
    }
    
    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象  
        var r = window.location.search.substr(1).match(reg); //匹配目标参数  
        if (r != null) return unescape(r[2]);
        return null; //返回参数值  
    }

    $.fn.loading = function() {
        var loading = $('.loading');
        if (!loading.length) {
            loading = $('<div class="loading"></div>');
            this.after(loading);
        }
        this.parent().css('position', 'relative');
        return loading;
    };
});

