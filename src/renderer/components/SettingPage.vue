<template>
    <el-container :class="myclass" :style="getOpacity">
      <el-header style="-webkit-app-region: drag;">
        <el-row type="flex" justify="space-between">
          <el-col :span="2"><i class="el-icon-setting"></i></el-col>
          <el-col :span="5"><span>设置</span></el-col>
          <el-col :span="15"></el-col>
          <el-col :span="2" style="-webkit-app-region: no-drag"><i class="el-icon-error" @click="winClose()"></i></el-col>
        </el-row>
      </el-header>
      <el-main class="setting">
        <el-row>
          <transition name="move-left">
            <el-col v-show="show" class="fix">
              <el-menu
                default-active="2" :style="getOpacity">
                <el-menu-item index="1" @click="toShow(1)">
                  <i class="el-icon-menu"></i>
                  <span slot="title">下载设置</span>
                </el-menu-item>
                <el-menu-item index="2" @click="toShow(2)">
                  <i class="el-icon-menu"></i>
                  <span slot="title">主题修改</span>
                </el-menu-item>
                <el-menu-item index="3" @click="toShow(3)">
                  <i class="el-icon-menu"></i>
                  <span slot="title">搜索黑话设置</span>
                </el-menu-item>
                <el-menu-item index="4" @click="toShow(4)">
                  <i class="el-icon-menu"></i>
                  <span slot="title">程序信息</span>
                </el-menu-item>
              </el-menu>
            </el-col>
          </transition>
          <transition name="move-right">
            <el-col v-show="!show" :span="24">
              <div v-show="page==1">
                <el-row>
                  <el-col :span="4"><el-button size="mini" :style="getOpacity" icon="el-icon-caret-left" round @click="toShow(0)"></el-button></el-col>
                  <el-col :span="20"><strong>下载设置</strong></el-col>
                </el-row>
                <el-row>
                  <el-col :span="8"><p>重连次数:</p></el-col>
                  <el-col :span="10"><el-input v-model="thread" type="number" placeholder="初始为1"></el-input></el-col>
                </el-row>
                <el-row>
                  <el-col :span="8"><p>图片预缓存:</p></el-col>
                  <el-col :span="10"><el-button type="primary" :style="getOpacity" plain @click="downloadimg()">下载</el-button></el-col>
                  <el-col :span="6"><p>{{getImgper}}</p></el-col>
                </el-row>
              </div>
              <div v-show="page==2">
                <el-row>
                  <el-col :span="4"><el-button size="mini" :style="getOpacity" icon="el-icon-caret-left" round @click="toShow(0)"></el-button></el-col>
                  <el-col :span="20"><strong>主题修改</strong></el-col>
                </el-row>
                <el-row>
                  <el-col :span="8"><p>请选择颜色</p></el-col>
                  <el-col :span="10">
                    <el-select v-model="myclass" placeholder="请选择">
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="8"><p>透明度调整</p></el-col>
                  <el-col :span="2"><br></el-col>
                  <el-col :span="10">
                    <el-slider v-model="opacity" @change="storeOpacity()"></el-slider>
                  </el-col>
                </el-row>
              </div>
              <div v-show="page==3">
                <el-row>
                  <el-col :span="4"><el-button size="mini" icon="el-icon-caret-left" round @click="toShow(0)"></el-button></el-col>
                  <el-col :span="20"><strong>搜索黑话设置</strong></el-col>
                </el-row>
                <el-row>
                  <el-select v-model="namevalue" placeholder="请选择">
                    <el-option
                      v-for="item in getNameList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                </el-row>
                <el-row>
                  <el-tag
                    :key="tag"
                    v-for="tag in getAlias"
                    closable
                    :disable-transitions="false"
                    @close="handleClose(tag)">
                    {{tag}}
                  </el-tag>
                </el-row>
                <el-row>
                  <el-input
                    class="input-new-tag"
                    v-if="inputVisible"
                    v-model="inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm"
                    @blur="handleInputConfirm">
                  </el-input>
                  <el-button v-else class="button-new-tag" :style="getOpacity" size="small" @click="showInput">+ New Tag</el-button>
                </el-row>
              </div>
              <div v-show="page==4">
                <el-row>
                  <el-col :span="4"><el-button size="mini" icon="el-icon-caret-left" round @click="toShow(0)"></el-button></el-col>
                  <el-col :span="20"><strong>程序信息</strong></el-col>
                </el-row>
                <el-row>
                  <strong>作者：suhao50142</strong>
                  <p>邮箱：suhao50142@sina.com</p>
                  <p>数据源自seesaawiki.jp/aigis</p>
                  <p>既然有爬维基的,这个也应该没关系吧,大概</p>
                  <p>没玩过electron做着玩的</p>
                </el-row>
              </div>
            </el-col>
          </transition>
        </el-row>
      </el-main>
    </el-container>
</template>

<script>
  import Store from 'electron-store';
  import { mapGetters,mapActions } from 'vuex'
  const store = new Store({name:'setting'});
  export default {
    name: 'setting-page',
    data(){
      return{
        show:true,
        page:1,
        thread:'',
        options: [{
          value: 'custom-teal',
          label: '青色(默认)'
        }, {
          value: 'custom-blue',
          label: '蓝色'
        }, {
          value: 'custom-purple',
          label: '紫色'
        }],
        namevalue: '',
        myclass:'custom-teal',
        id:null,
        inputVisible: false,
        inputValue: '',
        opacity:80
      }
    },
    created(){
      if (!store.has('thread')){
        store.set('thread',1);
        store.set('color','custom-teal')
        store.set('opacity',this.opacity/100);
      }
      this.$ipc.send('getMainID');
      this.$ipc.once('MainID',(event,id)=>{
        this.id=id;
      })
    },
    mounted () {
      if (store.has('opacity')) this.setOpacity(store.get('opacity'));
      this.thread=store.get('thread');
      this.myclass=store.get('color');
      this.opacity=store.get('opacity')*100;
    },
    computed: mapGetters(['getNameList','getAlias','getImgper','getOpacity']),
    watch: {
      thread(value){
        if (value>0) store.set('thread',value);
      },
      myclass(value){
        store.set('color',value);
        if (this.id) this.$bw.fromId(this.id).webContents.send('getColor');
      },
      namevalue(value){
        this.readAlias(value);
      },
      opacity(value){
        this.setOpacity(this.opacity/100);
        if (this.id) this.$bw.fromId(this.id).webContents.send('opacity',this.opacity/100);
      }
    },
    methods: {
      ...mapActions(['readList','readAlias','deleteAlias','addAlias','downloadimg','setOpacity']),
      winClose(){
        this.$ipc.send('closeSetting');
      },
      toShow(page){
        if (page>0) this.page=page;
        if (page==3) this.readList();
        this.show=!this.show;
      },
      handleClose(tag) {
        this.deleteAlias({name:this.namevalue,pos:this.getAlias.indexOf(tag)});
      },
      showInput() {
        this.inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          this.addAlias({name:this.namevalue,value:inputValue});
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      storeOpacity(){
        store.set('opacity',this.opacity/100);
      }
    }
  }
</script>

<style scoped>
*{
  overflow: hidden;
}
.setting{
  width:100%;
  height:340px;
}
.fix{
  position: fixed;
}
.move-left-enter-active,.move-left-leave-active {
    -webkit-transform: translateX(0);
    transform: translateX(0);
    transition: all 0.3s linear;
}
.move-left-enter,.move-left-leave-active {
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%);
}
.move-right-enter-active,.move-right-leave-active {
    -webkit-transform: translateX(0);
    transform: translateX(0);
    transition: all 0.3s linear;
}
.move-right-enter,.move-right-leave-active {
    -webkit-transform: translateX(100%);
    transform: translateX(100%);
}
</style>