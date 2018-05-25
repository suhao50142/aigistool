<template>
  <div>
    <transition name="el-zoom-in-right">
    <div class="drawer" v-show="show" :style="getOpacity">
      <el-row v-if="getDetail">
        <el-row>
          <el-col :span="8"><img :src="getDetail.img"></el-col>
          <el-col :span="16">
            <el-row><strong>{{name}}</strong></el-row>
            <el-row>
              <el-col :span="6">
                <strong>{{getDetail.rare}}</strong>
              </el-col>
              <el-col :span="6">
                <strong v-if="!getDetail.dist">近战</strong>
                <strong v-if="getDetail.dist">远程</strong>
              </el-col>
            </el-row>
            <el-row>
              <strong>{{getDetail.class}}</strong>
            </el-row>
          </el-col>
        </el-row>
        <el-tabs v-model="activeName">
          <el-tab-pane label="基础信息" name="basic">
            <el-col class="scroll">
              <el-row>
                <el-col :span="5">
                  <el-row><strong>初始职业:</strong></el-row>
                  <el-row><strong>{{getDetail.main.basic.class}}</strong></el-row>
                </el-col>
                <el-col :span="19">
                  <el-row>
                    <el-col :span="4">LV1</el-col>
                    <el-col :span="6">血量:{{getDetail.main.basic.hp}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.basic.atk}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.basic.def}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4">{{getDetail.main.basic.level}}</el-col>
                    <el-col :span="6">血量:{{getDetail.main.basic.hpmax}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.basic.atkmax}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.basic.defmax}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="5">魔法耐性:{{getDetail.main.basic.md}}</el-col>
                    <el-col :span="6">消费(初始):{{getDetail.main.basic.costh}}</el-col>
                    <el-col :span="6">消费(极限):{{getDetail.main.basic.costl}}</el-col>
                    <el-col :span="6">好感:{{getDetail.main.basic.sp}}</el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-if="getDetail.main.cc"><hr/></el-row>
              <el-row v-if="getDetail.main.cc">
                <el-col :span="5">
                  <el-row><strong>转职职业(cc):</strong></el-row>
                  <el-row><strong>{{getDetail.main.cc.class}}</strong></el-row>
                </el-col>
                <el-col :span="19">
                  <el-row>
                    <el-col :span="4">LV1</el-col>
                    <el-col :span="6">血量:{{getDetail.main.cc.hp}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.cc.atk}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.cc.def}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4">{{getDetail.main.cc.level}}</el-col>
                    <el-col :span="6">血量:{{getDetail.main.cc.hpmax}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.cc.atkmax}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.cc.defmax}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="5">魔法耐性:{{getDetail.main.cc.md}}</el-col>
                    <el-col :span="6">消费(初始):{{getDetail.main.cc.costh}}</el-col>
                    <el-col :span="6">消费(极限):{{getDetail.main.cc.costl}}</el-col>
                    <el-col :span="6">好感:{{getDetail.main.cc.sp}}</el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-if="getDetail.main.awake"><hr/></el-row>
              <el-row v-if="getDetail.main.awake">
                <el-col :span="5">
                  <el-row><strong>觉醒职业:</strong></el-row>
                  <el-row><strong>{{getDetail.main.awake.class}}</strong></el-row>
                </el-col>
                <el-col :span="19">
                  <el-row>
                    <el-col :span="4">LV1</el-col>
                    <el-col :span="6">血量:{{getDetail.main.awake.hp}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.awake.atk}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.awake.def}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4">{{getDetail.main.awake.level}}</el-col>
                    <el-col :span="6">血量:{{getDetail.main.awake.hpmax}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.awake.atkmax}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.awake.defmax}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="5">魔法耐性:{{getDetail.main.awake.md}}</el-col>
                    <el-col :span="6">消费(初始):{{getDetail.main.awake.costh}}</el-col>
                    <el-col :span="6">消费(极限):{{getDetail.main.awake.costl}}</el-col>
                    <el-col :span="6">好感:{{getDetail.main.awake.sp}}</el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-if="getDetail.main.double"><hr/></el-row>
              <el-row v-if="getDetail.main.double">
                <el-col :span="5">
                  <el-row><strong>二觉职业:</strong></el-row>
                  <el-row><strong>{{getDetail.main.double.class}}</strong></el-row>
                </el-col>
                <el-col :span="19">
                  <el-row>
                    <el-col :span="4">LV1</el-col>
                    <el-col :span="6">血量:{{getDetail.main.double.hp}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.double.atk}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.double.def}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4">{{getDetail.main.double.level}}</el-col>
                    <el-col :span="6">血量:{{getDetail.main.double.hpmax}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.double.atkmax}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.double.defmax}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="5">魔法耐性:{{getDetail.main.double.md}}</el-col>
                    <el-col :span="6">消费(初始):{{getDetail.main.double.costh}}</el-col>
                    <el-col :span="6">消费(极限):{{getDetail.main.double.costl}}</el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-if="getDetail.main.double2"><hr/></el-row>
              <el-row v-if="getDetail.main.double2">
                <el-col :span="5">
                  <el-row><strong>二觉职业(分支):</strong></el-row>
                  <el-row><strong>{{getDetail.main.double2.class}}</strong></el-row>
                </el-col>
                <el-col :span="19">
                  <el-row>
                    <el-col :span="4">LV1</el-col>
                    <el-col :span="6">血量:{{getDetail.main.double2.hp}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.double2.atk}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.double2.def}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="4">{{getDetail.main.double2.level}}</el-col>
                    <el-col :span="6">血量:{{getDetail.main.double2.hpmax}}</el-col>
                    <el-col :span="6">攻击:{{getDetail.main.double2.atkmax}}</el-col>
                    <el-col :span="6">防御:{{getDetail.main.double2.defmax}}</el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="5">魔法耐性:{{getDetail.main.double2.md}}</el-col>
                    <el-col :span="6">消费(初始):{{getDetail.main.double2.costh}}</el-col>
                    <el-col :span="6">消费(极限):{{getDetail.main.double2.costl}}</el-col>
                  </el-row>
                </el-col>
              </el-row>
              <el-row v-if="getDetail.passivity.normal||getDetail.passivity.awake"><hr/></el-row>
              <el-row v-if="getDetail.passivity.normal">
                <el-col :span="6"><strong>初始被动 {{getDetail.passivity.normal.name}}</strong></el-col>
                <el-col :span="18">{{getDetail.passivity.normal.explain}}</el-col>
              </el-row>
              <el-row v-if="getDetail.passivity.awake">
                <el-col :span="6"><strong>觉醒被动 {{getDetail.passivity.awake.name}}</strong></el-col>
                <el-col :span="18">{{getDetail.passivity.awake.explain}}</el-col>
              </el-row>
              <el-row v-if="getDetail.skill.normal||getDetail.skill.awake"><hr/></el-row>
              <el-row v-if="getDetail.skill.normal">
                <el-col :span="6"><strong>技觉前 {{getDetail.skill.normal.name}}</strong></el-col>
                <el-col :span="18">{{getDetail.skill.normal.explain}}</el-col>
                <el-col :span="6"><br></el-col>
                <el-col :span="6">{{getDetail.skill.normal.init}}</el-col>
                <el-col :span="6">{{getDetail.skill.normal.cd}}</el-col>
              </el-row>
              <el-row v-for="(skill,key) in getDetail.skill.awake" :key="skill.name">
                <el-col :span="6">
                  <strong v-if="key==0">技觉后 {{skill.name}}</strong>
                  <strong v-if="key>0">{{skill.name}}</strong>
                </el-col>
                <el-col :span="18">{{skill.explain}}</el-col>
                <el-col :span="6"><br></el-col>
                <el-col :span="6">{{skill.init}}</el-col>
                <el-col :span="6">{{skill.cd}}</el-col>
              </el-row>
            </el-col>
          </el-tab-pane>
          <el-tab-pane label="职业说明" name="class">
            <el-col v-html="getClass" class="scroll">
            </el-col>
          </el-tab-pane>
        </el-tabs>
      </el-row>
      <el-row v-if="!getDetail" class="nodata">
        <el-col>
          <span>暂无数据</span>
        </el-col>
      </el-row>
    </div>
    </transition>
    <transition name="el-fade-in">
      <div class="mask" v-show="show" :style="getOpacity" @click="toHide()"></div>
    </transition>
  </div>
</template>

<script>
  import { mapGetters,mapActions } from 'vuex'

  export default {
    name:'detail',
    props:['show','name'],
    data(){
      return{
        activeName:'basic'
      }
    },
    computed: mapGetters([
      'getDetail','getOpacity','getClass'
    ]),
    watch:{
      show:function(){
        if (this.show&&this.name){
          this.readDetail(this.name);
        }
      }
    },
    methods: {
      ...mapActions(['readDetail']),
      toHide(){
        this.$emit('show');
      }
    }
  }
</script>

<style scoped>
.drawer{
  position:fixed;
  z-index:2;
  width:60%;
  top:60px;
  bottom:0;
  background-color:white;
  right:0;
  padding: 20px
}
.mask{
  position:fixed;
  z-index:1;
  width:100%;
  top:60px;
  bottom:0;
  background-color:grey;
  opacity:0.3;
  right:0;
  padding: 20px
}
.nodata{
  text-align: center;
  top: 30%;
  color: gray;
}
.scroll{
  height: 330px;
  width: 106%;
  overflow-y: scroll;
  overflow-x: hidden;
}
.el-zoom-in-right-enter-active,.el-zoom-in-right-leave-active{
    opacity:1;
    -webkit-transform:scaleX(1);
    transform:scaleX(1);
    -webkit-transition:opacity .3s cubic-bezier(.23,1,.32,1),-webkit-transform .3s cubic-bezier(.23,1,.32,1);
    transition:opacity .3s cubic-bezier(.23,1,.32,1),-webkit-transform .3s cubic-bezier(.23,1,.32,1);
    transition:transform .3s cubic-bezier(.23,1,.32,1),opacity .3s cubic-bezier(.23,1,.32,1);
    transition:transform .3s cubic-bezier(.23,1,.32,1),opacity .3s cubic-bezier(.23,1,.32,1),-webkit-transform .3s cubic-bezier(.23,1,.32,1);
    -webkit-transform-origin:center right;
    transform-origin:center right
}
.el-zoom-in-right-enter,.el-zoom-in-right-leave-active{
    opacity:0;
    -webkit-transform:scaleX(0);
    transform:scaleX(0)
}
</style>
