<template>
  <el-table
    :data="datas"
    ref="mytable"
    style="width: 100%"
    height="420"
    highlight-current-row
    @current-change="handleCurrentChange">
    <el-table-column
      label="角色"
      width="120">
      <template slot-scope="scope">
        <img :src="scope.row.img">
      </template>
    </el-table-column>
    <el-table-column
      prop="name"
      label="名字"
      width="120">
    </el-table-column>
    <el-table-column
      prop="rare"
      label="稀有度"
      width="100"
      sortable
      :filters="filterlist"
      :filter-method="filterRare">
    </el-table-column>
    <el-table-column
      prop="cost"
      label="消耗"
      width="80"
      sortable>
    </el-table-column>
    <el-table-column
      prop="level"
      label="等级"
      width="80">
    </el-table-column>
    <el-table-column
      prop="hp"
      label="血量"
      width="100"
      sortable>
    </el-table-column>
    <el-table-column
      prop='atk'
      label="攻击"
      width="80"
      sortable>
    </el-table-column>
    <el-table-column
      prop="def"
      label="防御"
      width="80"
      sortable>
    </el-table-column>
    <el-table-column
      prop="md"
      label="魔抗"
      width="80"
      sortable>
    </el-table-column>
    <el-table-column
      prop="sp"
      label="好感"
      width="100">
    </el-table-column>
  </el-table>
</template>

<script>
  export default {
    name:'character',
    data(){
      return{
        filterlist:[{ text: '1', value: '1' },
                    { text: '2', value: '2' },
                    { text: '3', value: '3' },
                    { text: '4', value: '4' },
                    { text: '5', value: '5' },
                    { text: '6', value: '6' },
                    { text: '蓝宝石', value: '蓝宝石' }]
      }
    },
    props:['datas'],
    methods: {
      handleCurrentChange(v){
        if (v) this.$emit('name',v.name);
      },
      setCurrentRow(){
        this.$refs.mytable.setCurrentRow();
      },
      filterRare(value, row, column) {
        const property = column['property'];
        return row[property] === value;
      }
    }
  }
</script>

<style>
</style>
