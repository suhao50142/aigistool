<template>
  <el-container :class="myclass" :style="getOpacity">
    <el-header style="-webkit-app-region: drag">
      <el-row type="flex" justify="space-between">
        <el-col :span="1"><i class="el-icon-rank"></i></el-col>
        <el-col :span="5"><span>aigis工具</span></el-col>
        <el-col :span="16"></el-col>
        <el-col :span="1" :offset="10" style="-webkit-app-region: no-drag"><i class="el-icon-error" @click="winClose()"></i></el-col>
      </el-row>
    </el-header>
    <el-main v-loading="updating" :element-loading-text="updateState">
      <el-row>
        <el-col :span="4">
          <el-input v-model="select_words" placeholder="筛选关键词"></el-input>
        </el-col>
        <el-col :span="2"><br></el-col>
        <el-col :span="4">
          <el-button type="primary" plain @click="getMainPage()">{{updateButton}}</el-button>
        </el-col>
        <el-col :span="12"><br></el-col>
        <el-col :span="2">
          <el-button type="primary" plain @click="openSetting()">设置</el-button>
        </el-col>
      </el-row>
      <el-row>
        <br>
      </el-row>
      <el-row>
        <character ref="character" :datas="datas" :style="getOpacity" @name="toShow"></character>
      </el-row>
      <detail :show="show" :name="selectName" @show="toShow()"></detail>
    </el-main>
  </el-container>
</template>

<script>
  import Character from './Character'
  import Detail from './Detail'
  import path from 'path'
  import fs from 'fs'
  import { mapGetters,mapActions } from 'vuex'
  import Store from 'electron-store';
  const store = new Store({name:'setting'});
  export default {
    name: 'main-page',
    data(){
      return{
        updating:false,
        updateState:'',
        show:false,
        selectName:null,
        select_words:'',
        myclass:'custom-teal'
      }
    },
    components: { Character, Detail },
    created () {
      this.$ipc.on('ret',(event,ret)=>{
        if (ret=='add'){
          if (this.updateState.indexOf(' ')>-1){
            let s=this.updateState.split(' ')
            let ss=s[1].split('/')
            this.updateState=s[0]+' '+(parseInt(ss[0])+1).toString()+'/'+ss[1];
          }
        }else{
          this.updateState=ret;
        }
      });
      this.readData();
    },
    mounted () {
      if (store.has('color')){
        this.myclass=store.get('color');
      }
      this.$ipc.on('getColor',(event)=>{
        this.myclass=store.get('color');
      });
      this.$ipc.on('opacity',(event,value)=>{
        this.setOpacity(value);
      });
    },
    computed:{ 
      ...mapGetters(['updateButton','storeData','getOpacity']),
      datas(){
        const self=this;
        if (self.select_words){
          return self.storeData.filter((d)=>{
            let is_del=false;
            if (!is_del){
              if (d.name.indexOf(self.select_words)>-1||this.judgeAlias(d.name,self.select_words)){
                return d;
              }
            }
          });
        }else{
          return this.storeData;
        }
      }
    },
    methods: {
      ...mapActions(['mainPageRet','readData','setOpacity']),
      getMainPage(force=false) {
        if (this.updating) return;
        this.updating=true;
        this.updateState='0/4开始获取角色列表';
        this.$ipc.send('getMainPage',force);
        this.$ipc.once('MainPage',(event,ret)=>{
          this.mainPageRet(ret);
          this.updating=false;
          if (ret==null){
            this.$confirm('已经存在文件, 是否重新下载?', '提示', {
              confirmButtonText: '是',
              cancelButtonText: '否',
              type: 'warning',
              customClass:this.myclass
            }).then(() => {
              this.getMainPage(true);
            }).catch(()=>{});
          }else{
            this.readData();
          }
        });
      },
      winClose(){
        this.$ipc.send('close');
      },
      toShow(name){
        this.selectName=name;
        this.show=!this.show;
        if (!this.show){
          this.$refs.character.setCurrentRow();
        }
      },
      openSetting(){
        this.$ipc.send('settingPage');
      },
      judgeAlias(name,value){
        let list=fs.readFileSync(path.join(__static,'alias.json'));
        if (list){
          list=JSON.parse(list);
          if (list[name]){
            for (let i of list[name]){
              if (i.indexOf(value)>-1) return true; 
            }
          }
        }
        return false;
      }
    }
  }
</script>

<style>
</style>