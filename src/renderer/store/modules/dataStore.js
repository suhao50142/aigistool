import fs from "fs";
import path from 'path';
import http from 'http';
import Store from 'electron-store';
const store = new Store({name:'setting'});

const state = {
  update: '点击更新',
  data:[],
  detail:null,
  class:null,
  imgper:''
}

const mutations = {
  CHANGE_UPDATE (state,value) {
    state.update=value;
  },
  SET_DATA (state,value) {
    state.data=value;
  },
  SET_DETAIL (state,value) {
    state.detail=value;
  },
  SET_CLASS (state,value) {
    state.class=value;
  },
  SET_IMGPER (state,value) {
    if (value=='add'){
      if (state.imgper.indexOf('/')>-1){
        let num=state.imgper.split('/')
        state.imgper=(parseInt(num[0])+1).toString()+'/'+num[1];
      }
    }else
      state.imgper=value;
  }
}

const actions = {
  mainPageRet ({ commit },value) {
    if (value==null) commit('CHANGE_UPDATE','已经存在文件');
    else if (value){
      commit('CHANGE_UPDATE','下载成功');
    } else commit('CHANGE_UPDATE','下载失败');
    setTimeout(() => {
      commit('CHANGE_UPDATE','点击下载数据');
    }, 1000);
  },
  downloadimg({ commit,state }){
    if (state.imgper.indexOf('/')>-1) return; 
    if (!fs.existsSync(path.join(__static,'img'))) fs.mkdirSync(path.join(__static,'img'));
    fs.readFile(path.join(__static,'characters.json'),(err,value)=>{
      if (err) return;
      value=JSON.parse(value);
      let list=[];
      let trytimes=1;
      if (store.has('thread')) trytimes=store.get('thread');
      for (let name in value){
        if (name=='王子（ユニットページへ）'||!value[name].img) return;
        let img=value[name].img;
        if (img.indexOf('seesaawiki')>-1){
          list.push(getImg(img,name,value,commit,trytimes));
        }
      }
      commit('SET_IMGPER','0/'+(list.length).toString());
      Promise.all(list).then((datas)=>{
        datas.map((data)=>{
          value[data.name]['img']=data.img;
        });
        fs.writeFileSync(path.join(__static,'characters.json'),JSON.stringify(value).replace(/(?!^){/g,'\n\t{').replace(/},"/g,'},\n"'));
        commit('SET_IMGPER','完成');
      }).catch(()=>{commit('SET_IMGPER','失败(可继续重试)');});
    });
  },
  readData ({commit}) {
    fs.readFile(path.join(__static,'characters.json'),(err,value)=>{
      if (err) return;
      value=JSON.parse(value);
      delete value['王子（ユニットページへ）'];
      let list=[];
      for (let name in value){
        let tmp={}
        tmp.name=name;
        tmp.img=value[name].img;
        if (value[name].rare=='6') tmp.rare='蓝宝石'; else tmp.rare=(parseInt(value[name].rare)+1).toString();
        if (value[name].main.awake&&value[name].main.awake!={}&&value[name].main.awake["hpmax"]!=null){
          let awake=value[name].main.awake;
          tmp.cost=parseInt(awake['costh']);
          if (awake['level'])
            tmp.level=parseInt(awake['level'].replace(/LV/i,''));
          else tmp.level=null;
          tmp.hp=parseInt(awake['hpmax']);
          tmp.atk=parseInt(awake['atkmax']);
          tmp.def=parseInt(awake['defmax']);
          tmp.md=parseInt(awake['md']);
          tmp.sp=awake['sp'];
        } else {
          if (value[name].main.cc&&value[name].main.cc!={}&&value[name].main.cc["hpmax"]!=null){
            let cc=value[name].main.cc;
            tmp.cost=parseInt(cc['costh']);
            if (cc['level'])
              tmp.level=parseInt(cc['level'].replace(/LV/i,''));
            else tmp.level=null;
            tmp.hp=parseInt(cc['hpmax']);
            tmp.atk=parseInt(cc['atkmax']);
            tmp.def=parseInt(cc['defmax']);
            tmp.md=parseInt(cc['md']);
            tmp.sp=cc['sp'];
          }else{
            let basic=value[name].main.basic;
            if (basic['level'])
              tmp.level=parseInt(basic['level'].replace(/LV/i,''));
            else tmp.level=null;
            tmp.cost=parseInt(basic['costh']);
            if (basic['hpmax']!=null){
              tmp.hp=parseInt(basic['hpmax']);
              tmp.atk=parseInt(basic['atkmax']);
              tmp.def=parseInt(basic['defmax']);
            }else{
              tmp.level=1;
              tmp.hp=parseInt(basic['hp']);
              tmp.atk=parseInt(basic['atk']);
              tmp.def=parseInt(basic['def']);
            }
            tmp.md=parseInt(basic['md']);
            tmp.sp=basic['sp'];
          }
        }
        list.push(tmp);
      }
      commit('SET_DATA',list);
    });
  },
  readDetail({ commit },name){
    fs.readFile(path.join(__static,'characters.json'),(err,value)=>{
      if (err) return;
      value=JSON.parse(value);
      if (!name){
        commit('SET_DETAIL',null);
        return;
      }
      if (value[name]){
        let obj=value[name];
        if (obj.rare=='6') obj.rare='蓝宝石'; else obj.rare=(parseInt(obj.rare)+1)+'星'
        if (obj.main.awake&&!obj.main.awake.hp) delete obj.main.awake;
        if (obj.main.double&&!obj.main.double.hp) delete obj.main.double;
        if (obj.main.double2&&!obj.main.double2.hp) delete obj.main.double2;
        if (obj.skill.normal&&!obj.skill.normal.name) delete obj.skill.normal;
        if (obj.skill.awake&&obj.skill.awake!=[]&&!obj.skill.awake[0].name) delete obj.skill.awake;
        commit('SET_DETAIL',obj);
        fs.readFile(path.join(__static,'class.json'),(err,value)=>{
          if (err) return;
          value=JSON.parse(value);
          if (!obj.class){
            commit('SET_CLASS',null);
            return;
          }
          let basicClass=obj.class.split('/')[0];
          for (let c in value){
            if (c.indexOf(basicClass)>-1){
              commit('SET_CLASS',value[c]);
              return;
            }
          }
          commit('SET_CLASS',null);
        });
      }else
        commit('SET_DETAIL',null);
    });
  }
}

function getImg(url,name,value,commit,trytimes){
  return new Promise((resolve,reject)=>{
    if(fs.existsSync(path.join(__static,'img',name+'.png'))){
      let rs={}
      rs['name']=name;
      if (process.env.NODE_ENV !== 'development')
        rs['img']='../../../../data/img/'+name+'.png';
      else
        rs['img']='static/img/'+name+'.png';
      commit('SET_IMGPER','add');
      resolve(rs);
      return;
    } 
    let req=http.get(url,function(res){
      let chunks=[];
      res.on('data',function(chunk){
        chunks.push(chunk);
      })
      res.on('end',function(){
        let buff = Buffer.concat(chunks);
        if (buff.length < parseInt(res.headers['content-length'])){
          trytimes--;
          if (trytimes>=0) resolve().then(()=>{return getImg(url,name,value,commit,trytimes)})
          else reject();
          return;
        }
        fs.appendFile(path.join(__static,'img',name+'.png'), buff, function(err){});
        let rs={}
        rs['name']=name;
        if (process.env.NODE_ENV !== 'development')
          rs['img']='../../../../data/img/'+name+'.png';
        else
          rs['img']='static/img/'+name+'.png';
        commit('SET_IMGPER','add');
        resolve(rs);
      });
    });
    req.setTimeout(20*1000,()=>{
      req.abort();
    })
    req.on('error',()=>{
      trytimes--;
      if (trytimes>=0) resolve().then(()=>{return getImg(url,name,value,commit,trytimes)})
      else reject();
    });
    req.end();
  });
}

const getters = {
  updateButton: state => state.update,
  storeData: state => state.data,
  getDetail: state => state.detail,
  getClass: state => state.class,
  getImgper: state => state.imgper
}

export default {
  state,
  mutations,
  actions,
  getters
}
