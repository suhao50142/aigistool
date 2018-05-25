import path from 'path'
import http from 'http'
import fs from 'fs'
import iconv from'iconv-lite'

function getMainClass(url){
    return new Promise((resolve,reject)=>{
        let req=http.get(url,function(res){
            let chunks=[];
            res.on('data',function(chunk){
                chunks.push(chunk);
            })
            res.on('end',function(){
                let html = iconv.decode(Buffer.concat(chunks),'EUC-JP');
                let start=html.indexOf('<table');
                let end=html.indexOf('</table>',start);
                html=html.substring(start,end);
                if (!html){
                    reject();
                    return;
                }
                let json={};
                let result=null;
                let patten=/<a href="([^<>]+)"><b>([^<>]+)<\/b>/g;
                while ((result=patten.exec(html))!=null){
                    if (result[2]=='王子') continue
                    json[result[2]]=result[1];
                }
                resolve(json);
            });
        });
        req.on('error',()=>{
            reject();
        });
        req.end();
    });
}

function getClassDetail(url,name,event,trytimes){
    return new Promise((resolve,reject)=>{
        if (name=='皇帝'){
            event.sender.send('ret','add');
            resolve({'皇帝':'<strong>配置中、魔界でも全味方ユニットの能力が低下しない<\/strong>'});
            return;
        }
        let req=http.get(url,function(res){
            let chunks=[];
            res.on('data',function(chunk){
                chunks.push(chunk);
            })
            res.on('end',function(){
                let bodybuffer=Buffer.concat(chunks);
                if (parseInt(res.headers['content-length'])>bodybuffer.length){
                    trytimes--;
                    if (trytimes<=0){
                        reject({});
                    }else{
                        resolve().then(()=>{
                            return getClassDetail(url,name,event,trytimes)
                        });
                    }
                }
                let html = iconv.decode(bodybuffer,'EUC-JP');
                let start=html.indexOf('クラス詳細');
                start=html.indexOf('<table',start);
                let end=html.indexOf('</table>',start);
                html=html.substring(start,end+8);
                if (!html){
                    trytimes--;
                    if (trytimes<=0){
                        reject({});
                    }else{
                        resolve().then(()=>{
                            return getClassDetail(url,name,event,trytimes)
                        });
                    }
                    return;
                }
                let data={}
                if (html.indexOf('成長段階')>-1){
                    data[name]=html.replace(/<table id=[^<>]+>/,'<table>').replace(/[\n ]+/g,'').replace(/thstyle/g,'th style').replace(/tdrow/g,'td row').replace(/<table>/,"<table border='1' cellspacing='0' width='95%'>");
                }else{
                    data[name]='暂无说明';
                }
                event.sender.send('ret','add');
                resolve(data);
            });
        });
        req.on('error',()=>{
            trytimes--;
            if (trytimes<=0){
                reject({});
            }else{
                resolve().then(()=>{
                    return getClassDetail(url,name,event,trytimes)
                });
            }
        });
        req.end();
    });
}

export {getMainClass, getClassDetail}