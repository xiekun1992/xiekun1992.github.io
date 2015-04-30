var express = require('express');
var User=require('./model/user');
var parse=require('url').parse;
var router = express.Router();
var nodemailer=require('nodemailer');
var crypto=require('crypto');
var fs=require('fs');
var data=fs.readFileSync('./routes/data.json','utf-8');
data=JSON.parse(data);
//重置为新密码
router.post('/password/new',function(req,res){
	var md5=crypto.createHash('md5');
	if(req.body.params.p && req.body.params.key){
        User.findOne({key:req.body.params.key},function(err,user_key){//检查key值是否存在
            if(err){
                console.log(err);
                res.json({status:500,message:'Internal Error'});
            }else if(user_key){
                md5.update(req.body.params.p);
                User.findOneAndUpdate({key:req.body.params.key},{key:'',password:md5.digest('hex')},function(err,user){
                    if(err){
                        console.log(err);
                        res.json({status:500,message:'Internal Error'});
                    }else if(user){
                        console.log(user)
                        res.json({status:200,message:'New Password Avalible Now'});
                    }else{
                        res.json({status:400,message:'Fail to Modify Old Password'});
                    }
                });
            }else{//key值不存在
                res.json({status:400,message:'Token Is Out of Date'});
            }
        });
	}else{
		res.json({status:400,message:'Fail to Modify Old Password'});
	}
});
//通过key的存在与否和过期时间检查key的有效性
router.get('/password/token/',function(req,res){
	var query=parse(req.url,true).query;
	if(!query.key){
		res.json({status:400,message:'Token not Exist'});
	}else{
		User.findOne({key:query.key},function(err,user){
			if(err){
				console.log(err);
				res.json({status:500,message:'Internal Error'});
			}else if(user){
				console.log(user);
				var d=new Date();
				if(d-user.key_generate_time>10*1000*60){
					res.json({status:400,message:'Token Is Out of Date'});
				}else{
					res.json({status:200,message:'Token Existed'});
				}
			}else{
				res.json({status:400,message:'Token not Exist'});
			}	
		});
	}
});
//发送重置密码邮件
router.get('/reset_password',function(req,res){
	var transporter=nodemailer.createTransport('SMTP',{
//		service:'qq',
        host:'smtp.qq.com',
        secureConnection:true,
        port:465,
		auth:{
			user:data.user,
			pass:data.pass
		}
	});
	var md5=crypto.createHash('md5');
	var d=new Date();
	md5.update(d.toString()+'xiekun');
	var key=md5.digest('hex').toUpperCase();
	var url="http://localhost:3000/#/app/user/password/"+key;
	var mailOptions={
		from:'ordinary\'blog <'+data.user+'>',
		to:'2195619068@qq.com',
		subject:'您的个人博客发送的密码重置链接',
		html:"<p>来自您的个人博客发来的密码重置链接。如果不是您本人的操作，请忽略本次邮件，否则请点击下列文字进入重置密码页面</p><a href='"+url+"' >"+url+"</a>"
	};
	transporter.sendMail(mailOptions,function(err,info){
		if(err){
			console.log(err)
			res.json({status:500,message:'Mail Fail to Sent'});
		}else{
			console.log('Mail Sent Success: '+info.response)
			User.findOne({username:'xiekun'},function(err,result){//多次发送邮件以最后一次成功的key为准
				if(err){
					console.log(err);
				}else{
					result.key=key;
					result.key_generate_time=d;
					result.save(function(err,r){
						console.log(err);
						res.json({status:200,message:'Mail Sent Success'});
					});
				}
			});
		}
	});
});
//获取当前用户信息
router.get('/current_user',function(req,res){
    console.log('当前用户');
    console.log(req.session.user);
	if(req.session.user){
		res.json({status:200,message:req.session.user});
	}else{
		res.json({status:401,message:'no user login'});
	}
});
//退出登录---清空自动登录的标识
router.get('/logout',function(req,res){
	var query=parse(req.url,true).query;
	console.log(query)
	console.log('logout: '+req.session.user._id);
	//query session
	if(req.session.user._id==query.id){
		req.session.user=null;
        User.findOneAndUpdate({_id:query.id},{auto_login:null},function(err,result){
            if(err){
                console.log(err);
                res.json({status:500,message:'Internal Error!'});
            }else if(result){
                res.json({status:200,message:'logout success'});
            }
        });
    }else{
		res.json({status:403,message:'forbidden'});
	}
});
//登录
router.post('/login', function(req, res) {
	console.log(req.body.params);
    if(req.body.params.cookie){//存在cookie则自动登录
        User.findOne({auto_login:req.body.params.cookie},function(err,result){
            if(err){
                console.log(err);
                res.json({status:500,message:'Internal Error!'});
            }else if(result){
                var tmp=result.last_login_time;
                result.last_login_time=new Date();
                result.save(function(err,user){
                    if(user){
                        result.last_login_time=tmp;
                        result.key=result.key_generate_time=result.password='';
                        //write session
                        if(!req.session.user){
                            req.session.user=result;
                            console.log('自动登录');
                            console.log(req.session.user);
                            res.json({status:200,message:result});
                        }else if(req.session.user._id==user._id){
                            res.json({status:200,message:result});
                        }
                    }else{
                        res.json({status:500,message:'Internal Error!'});
                    }
                });
            }else{
                res.json({status:401,message:'Username or Password Error!'});
            }
        });
    }else{//不存在cookie则普通登录
        var md5=crypto.createHash('md5');
        md5.update(req.body.params.password);
        User.findOne({
            username:req.body.params.username,
            password:md5.digest('hex')
        },function(err,result){
            if(err){
                console.log(err);
                res.json({status:500,message:'Internal Error!'});
            }else if(result){
                var tmp=result.last_login_time;
                result.last_login_time=new Date();
                if(req.body.params.auto) {
                    result.auto_login = crypto.createHash('md5').update(result.last_login_time + result.username).digest('hex');
                }
                result.save(function(err,user){
                    if(user){
                        result.last_login_time=tmp;
                        result.key=result.key_generate_time=result.password='';
                        //write session
                        if(!req.session.user){
                            req.session.user=result;
                            res.json({status:200,message:result});
                        }else if(req.session.user._id==user._id){
                            res.json({status:200,message:'User Already Online'});
                        }
                    }else{
                        res.json({status:500,message:'Internal Error!'});
                    }
                });
            }else{
                res.json({status:401,message:'Username or Password Error!'});
            }
        });
    }

});

module.exports = router;
