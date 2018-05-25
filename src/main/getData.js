import path from 'path'
import http from 'http'
import fs from 'fs'
import iconv from'iconv-lite'

function getMainPage(url){
    return new Promise((resolve,reject)=>{
        let req=http.get(url,function(res){
            let chunks=[];
            res.on('data',function(chunk){
                chunks.push(chunk);
            })
            res.on('end',function(){
                let html = iconv.decode(Buffer.concat(chunks),'EUC-JP');
                let start=html.indexOf('<table id="content_block_4">');
                let end=html.indexOf('</table>',start);
                html=html.substring(start+39,end-13);
                if (!html){
                    reject();
                    return;
                }
                let trs=html.split('<tr>');
                trs=trs.map((value)=>{
                    let pos=value.indexOf('<td colspan="7" style="background-color:#fffab3;">');
                    if (pos>=0){
                        let v=value.substring(pos+50,value.indexOf('</td>',pos));
                        return />([^<>]+)</.exec(v)[1];
                    }else{
                        if (value.indexOf('<td colspan="8" style="background-color:#c0c0c0;">')>=0) return;
                        let patten=/<a href="([^<>]+)">([^<>]+)<\/a>/g;
                        if (!value){
                            reject();
                            return;
                        }
                        return value.split('</td>').slice(0,-1).map((v)=>{
                            let json={}
                            let result=null;
                            while ((result=patten.exec(v))!=null){
                                json[result[2]]=result[1];
                            }
                            return json;
                        });
                    }
                });
                for(var i in trs){  
                    if (trs[i] == null){  
                        trs.splice(i,1);  
                        i--;  
                    }  
                }
                trs.shift();
                trs.shift();
                trs.pop();
                trs.pop();
                let fstore={};
                for (let s in trs){
                    if (typeof(trs[s])=="string"){
                        fstore[trs[s]]=trs[Number(s)+1];
                    }
                }
                resolve(fstore);
            });
        });
        req.on('error',()=>{
            reject();
        });
        req.end();
    });
}

function getAllData(MainFile){
    let characters={};
    for (let i=0;i<2;i++)
        if (fs.existsSync(MainFile[i])){
            let data=JSON.parse(fs.readFileSync(MainFile[i]));
            for (let classname in data){
                let classdata=data[classname];
                for (let rare in classdata){
                    let raredata=classdata[rare];
                    for (let name in raredata)
                        characters[name]={
                            'src':raredata[name],
                            'rare':rare,
                            'class':classname,
                            'dist':i
                        }
                }
            }
        }
        fs.writeFileSync(MainFile[2],JSON.stringify(characters).replace(/(?!^){/g,'\n\t{').replace(/},"/g,'},\n"'));
}

function getCharacterData(data,name,event,trytimes){
    return new Promise((resolve,reject)=>{
        let req=http.get(data['src'],function(res){
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
                            return getCharacterData(data,name,event,trytimes)
                        });
                    }
                }
                let html = iconv.decode(bodybuffer,'EUC-JP');
                //白值获取
                let start=html.indexOf('<div class="title-2">');
                let end=html.indexOf('</table>',start);
                let dm=html.substring(start,end).split('/tr')
                let img=null;
                if (dm){
                    if (name=='盗賊ベティ') data['main']=getMain(dm,true);
                    else data['main']=getMain(dm);
                    img=/<img src="(http:\/\/image[^<>"]+)"/.exec(dm);
                }else{
                    data['main']={}
                }
                if (img)
                    data['img']=img[1];
                else
                    data['img']='';
                //被动获取
                let pass={}
                start=html.indexOf('>アビリティ <');
                if (start>=0){
                    end=html.indexOf('</ul>',start);
                    pass['normal']=getpassivity(html.substring(start,end).split('ul'));
                }
                start=html.indexOf('>覚醒アビリティ <');
                if (start==-1) start=html.indexOf('>追加アビリティ（クラスチェンジ後最大レベル到達で開放） <');//银单位
                if (start==-1) start=html.indexOf('>追加アビリティ（クラスチェンジ後最大レベル到達で解放） <');
                if (start>=0){
                    end=html.indexOf('</ul>',start);
                    pass['awake']=getpassivity(html.substring(start,end).split('ul'));
                }
                data['passivity']=pass;
                //技能获取(有觉醒)
                start=html.indexOf('>スキル覚醒 <');
                if (start>-1){
                    end=html.indexOf('</table>',start);
                    data['skill']=getSkill(html.substring(start,end).split('/tr'));
                }else{
                    start=html.indexOf('>スキル <');
                    end=html.indexOf('</table>',start);
                    data['skill']=getSkillNormal(html.substring(start,end).split('/tr'));
                }
                event.sender.send('ret','add');
                let rs={}
                rs[name]=data;
                resolve(rs);
            });
        });
        req.on('error',()=>{
            trytimes--;
            if (trytimes<=0){
                reject({});
            }else{
                resolve().then(()=>{
                    return getCharacterData(data,name,event,trytimes)
                });
            }
        });
        req.setTimeout(20*1000,()=>{
            req.abort();
        });
        req.end();
    });
}

function getWord(str){
    if (str) {
        let d=/>([^<>]+)</.exec(str.replace(/<br \/>/g,' ').replace(/<b>/g,'').replace(/<\/b>/g,''));
        if (d) return d[1];
        else return null;
    }else return null;
}

function splitsub(data,i,dec){
    if (dec) i--;
    if (!data||!data[i]) return {}
    let area=data[i].split('/td');
    let sub={}
    //是否是第一行
    if (i<=2){
        sub['class']=getWord(area[2]);
        sub['hp']=getWord(area[4]);
        sub['atk']=getWord(area[5]);
        sub['def']=getWord(area[6]);
        sub['md']=getWord(area[7]);
        sub['block']=getWord(area[8]);
        sub['costh']=getWord(area[9]);
        sub['costl']=getWord(area[10]);
        sub['sp']=getWord(area[11]);
    }else{
        sub['class']=getWord(area[0]);
        sub['hp']=getWord(area[2]);
        sub['atk']=getWord(area[3]);
        sub['def']=getWord(area[4]);
        sub['md']=getWord(area[5]);
        sub['block']=getWord(area[6]);
        sub['costh']=getWord(area[7]);
        sub['costl']=getWord(area[8]);
        sub['sp']=getWord(area[9]);
    }
    if (!data[i+1]) return {}
    area=data[i+1].split('/td');
    sub['level']=getWord(area[0]);
    sub['hpmax']=getWord(area[1]);
    sub['atkmax']=getWord(area[2]);
    sub['defmax']=getWord(area[3]);
    return sub;
}

function getMain(data,dec=false){
    let pos=2;
    let main={};
    main['basic']=splitsub(data,pos,dec);
    if (data.length>=pos+2&&data[pos+2].indexOf('#f3f3f3')>0){//颜色背景灰色是cc内容
        pos+=2;
        main['cc']=splitsub(data,pos,dec);
    }
    if (data.length>=pos+2){//没有读到末尾应该还有觉醒
        pos+=2;
        main['awake']=splitsub(data,pos,dec);
    }
    if (data.length>=pos+2){//没有读到末尾应该还有二觉
        pos+=2;
        main['double']=splitsub(data,pos,dec);
    }
    if (data.length>=pos+2){//没有读到末尾应该还有第二分支
        pos+=2;
        main['double2']=splitsub(data,pos,dec);
    }
    return main;
}

function getpassivity(d){
    let passivity={'name':'','explain':''}
    let patten=/li>([^<>]+)</g;
    let result=null;
    while ((result=patten.exec(d[1]))!=null){
        passivity['name']+=result[1].replace(/\n/,'');
    }
    patten.lastIndex=0;
    while ((result=patten.exec(d[2]))!=null){
        passivity['explain']+=result[1].replace(/\n/,'');
    }
    return passivity;
}

function getSkill(data){
    let skill={}
    if (!data||!data[0]){
        return skill;
    }
    let area=data[0].split('<td');
    skill['normal']={'name':getWord(area[2]),'explain':getWord(area[3]),'init':getWord(area[4]),'cd':getWord(area[5])};
    if (!data[1]){
        return skill;
    }
    let tmp=[];
    for (let i=1;i<data.length;i++){
        area=data[i].split('<td');
        if (i==1)
            tmp.push({'name':getWord(area[2]),'explain':getWord(area[3]),'init':getWord(area[4]),'cd':getWord(area[5])});
        else if (tmp[0].name){
            if (tmp[0].name=='吸血剣フルンティング'&&area.length==4)
                tmp.push({'name':i,'explain':getWord(area[1]),'init':getWord(area[2]),'cd':getWord(area[3])});
            else if (area.length==4)
                tmp.push({'name':getWord(area[1]),'explain':getWord(area[2]),'init':getWord(area[3]),'cd':'-'});
            else if (area.length==5)
                tmp.push({'name':getWord(area[1]),'explain':getWord(area[2]),'init':getWord(area[3]),'cd':getWord(area[4])});
        }
    }
    skill['awake']=tmp;
    return skill;
}

function getSkillNormal(data){
    let skill={}
    if (!data||!data[0]){
        return skill;
    }
    let area=data[2].split('<td');
    let tmp={};
    tmp['name']=getWord(area[1]);
    area=data[data.length-3].split('<td');
    tmp['explain']=getWord(area[2]);
    for (let i=3;i<area.length-1;i++)
        if (getWord(area[i])!='-')
            tmp['init']=getWord(area[i]);
    tmp['cd']=getWord(area[area.length-1]);
    skill['normal']=tmp;
    return skill;
}

function combineAlias(){
    if (!fs.existsSync(path.join(__static,'alias.json'))){
        fs.readFile(path.join(__static,'characters.json'),(err,data)=>{
            if (err) return;
            data=JSON.parse(data);
            let list={};
            for (let name in data){
                list[name]=[];
            }
            fs.writeFileSync(path.join(__static,'alias.json'),JSON.stringify(list).replace(/],/g,'],\n'));
        })
    }else{
        fs.readFile(path.join(__static,'alias.json'),(err,list)=>{
            if (err) return;
            list=JSON.parse(list);
            fs.readFile(path.join(__static,'characters.json'),(err2,data)=>{
                if (err2) return;
                data=JSON.parse(data);
                for (let name in data){
                    if (!list[name]) list[name]=[];
                }
                fs.writeFileSync(path.join(__static,'alias.json'),JSON.stringify(list).replace(/],/g,'],\n'));
            });
        });
    }
}

export {getMainPage, getAllData, getCharacterData, combineAlias}