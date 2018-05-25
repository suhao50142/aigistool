import fs from "fs";
import path from 'path';

const state = {
  alias:[],
  namelist:[]
}

const mutations = {
  CHANGE_ALIAS (state,value) {
    state.alias=value;
  },
  CHANGE_LIST (state,value) {
    state.namelist=value;
  },
  DEL_ALIAS (state,pos) {
    state.alias.splice(pos,1);
  },
  ADD_ALIAS (state,value) {
    state.alias.push(value);
  }
}

const actions = {
  readList({ commit }){
    fs.readFile(path.join(__static,'alias.json'),(err,list)=>{
      if (err) return;
      list=JSON.parse(list);
      let namelist=[]
      for (let name in list) namelist.push({value:name,label:name});
      commit('CHANGE_LIST',namelist);
    });
  },
  readAlias({ commit },name){
    fs.readFile(path.join(__static,'alias.json'),(err,list)=>{
      if (err) return;
      list=JSON.parse(list);
      if (list[name]){
        commit('CHANGE_ALIAS',list[name]);
      }
    });
  },
  deleteAlias({ commit,state },value){
    commit('DEL_ALIAS',value.pos);
    fs.readFile(path.join(__static,'alias.json'),(err,list)=>{
      if (err) return;
      list=JSON.parse(list);
      list[value.name]=state.alias;
      fs.writeFileSync(path.join(__static,'alias.json'),JSON.stringify(list).replace(/(?!^){/g,'\n\t{').replace(/},"/g,'},\n"'));
    });
  },
  addAlias({ commit,state },value){
    commit('ADD_ALIAS',value.value);
    fs.readFile(path.join(__static,'alias.json'),(err,list)=>{
      if (err) return;
      list=JSON.parse(list);
      list[value.name]=state.alias;
      fs.writeFileSync(path.join(__static,'alias.json'),JSON.stringify(list).replace(/(?!^){/g,'\n\t{').replace(/},"/g,'},\n"'));
    });
  }
}

const getters = {
  getAlias: state => state.alias,
  getNameList: state => state.namelist
}

export default {
  state,
  mutations,
  actions,
  getters
}
