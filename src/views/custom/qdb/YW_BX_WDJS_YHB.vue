<script setup lang="ts">
  import YudaoTable from '@/components/Table/src/Table.vue'
  import * as PostApi from '@/api/qdb/post/index'


  const data = reactive([
    {id:1,bc:"早",wd:"3",qm1:"陈泽朋",wdtj:"无",ypzy:"无",tzwx:"无",qt:"无",qm2:"陈泽朋",clhwd:"3",qm3:"陈泽朋",qj:"无",cs:"无",qm4:"陈泽朋"}
  ])
  
  const editRows = reactive(new Map())

  const edit = (row) =>{
    editRows.set(row,{...row})
  }
  const cancel =(row) => {
    editRows.delete(row)
  }
  type  Column = {
        label:string
        field:string
        width?:number
        children?:Column[]
    }
  const columns:Column[] = [
    {label:"班次",field: "bc",width:100},
    {label:"温度",field: "",children:[
      {label:'2-8℃',field:'wd',width:100}
    ]},
    {label:"签名",field: "qm1",width:120},
    {label:"温度异常处理措施",field: "",children:[
      {label:"温度调节",field: "wdtj",width:200},
      {label:"药品转移",field: "ypzy",width:200},
      {label:"通知维修",field: "tzwx",width:200},
      {label:"其他",field: "qt",width:100},
    ]},
    {label:"签名",field: "qm2",width:120},
    {label:"处理后温度",field: "clhwd",width:100},
    {label:"签名",field: "qm3",width:120},
    {label:"保护措施",field: "",children:[
      {label:'清洁',field:'qj',width:100},
      {label:'除霜',field:'cs',width:100}
    ]},
    {label:"签名",field: "qm4",width:120},
    {label:"操作",field:"action"}
  ]
  // onMounted(
  //   async() => {
  //     PostApi.getKsinfoByKsdm(ksdm)
  // }
// )
  const addNewRow = () =>{
        const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
        const newRow = {
            id:newId,bc:"",wd:"",qm1:"",wdtj:"无",ypzy:"无",tzwx:"无",qt:"无",qm2:"",clhwd:"",qm3:"",qj:"无",cs:"无",qm4:""
        }
        data.push(newRow)
        editRows.set(newRow,{...newRow})
    }
  const deleteRow = (index) => {
    data.splice(index,1)
  }
</script>

<template>
  <div style="display: flex;">
    <el-button @click="addNewRow">新增记录</el-button>
  </div>
  <YudaoTable :columns="columns" :data="data">
    <template #bc="{row}">
      <el-input v-model="row.bc" v-if="editRows.has(row)"/>
    </template>
    <template #wd="{row}">
      <el-input v-model="row.wd" v-if="editRows.has(row)"/>
    </template>
    <template #qm1="{row}">
      <el-input v-model="row.qm1" v-if="editRows.has(row)"/>
    </template>
    <template #wdtj="{row}">
      <el-input v-model="row.wdtj" v-if="editRows.has(row)"/>
    </template>
    <template #ypzy="{row}">
      <el-input v-model="row.ypzy" v-if="editRows.has(row)"/>
    </template>
    <template #tzwx="{row}">
      <el-input v-model="row.tzwx" v-if="editRows.has(row)"/>
    </template>
    <template #qt="{row}">
      <el-input v-model="row.qt" v-if="editRows.has(row)"/>
    </template>
    <template #qm2="{row}">
      <el-input v-model="row.qm2" v-if="editRows.has(row)"/>
    </template>
    <template #clhwd="{row}">
      <el-input v-model="row.clhwd" v-if="editRows.has(row)"/>
    </template>
    <template #qm3="{row}">
      <el-input v-model="row.qm3" v-if="editRows.has(row)"/>
    </template>
    <template #qj="{row}">
      <el-input v-model="row.qj" v-if="editRows.has(row)"/>
    </template>
    <template #cs="{row}">
      <el-input v-model="row.cs" v-if="editRows.has(row)"/>
    </template>
    <template #qm4="{row}">
      <el-input v-model="row.qm4" v-if="editRows.has(row)"/>
    </template>
    <template #action="{row,$index}">
      <el-button v-if="!editRows.has(row)" @click="edit(row)">编辑</el-button>
      <el-button v-if="editRows.has(row)" >保存</el-button>
      <el-button v-if="editRows.has(row)" @click="cancel(row)">取消</el-button>
      <el-button @click="deleteRow($index)">删除</el-button>
    </template>
  </YudaoTable>
</template>

<style scoped>

</style>