<script setup lang="ts">
import {useRoute} from 'vue-router'
import YudaoTable from '@/components/Table/src/Table.vue'
import dayjs from 'dayjs'
import * as PostApi from '@/api/qdb/post/index'

const route = useRoute()
const ksdm = route.query.KSDM
const ksmc = ref('')
const currentDate = ref('')
const editRows = reactive(new Map())
interface dataItem {
  id:number;
  jyrq:string;
  ks:string;
  jyyqmc:string;
  yqxn:string;
  pjsfqq:string;
  jyz:string;
  ghsj:string;
  yqxn2:string;
  pjsfqq2:string;
  jsz:string;
}
const data = reactive<dataItem[]>([])
const columns = [
  {label:'借用日期',field:'jyrq'},
  {label:'科室',field:'ks',width:150},
  {label:'借用仪器名称',field:'jyyqmc'},
  {label:'仪器性能',field:'yqxn',width:150},
  {label:'配件是否齐全',field:'pjsfqq',width:110},
  {label:'借用者',field:'jyz',width:150},
  {label:'归还时间',field:'ghsj'},
  {label:'仪器性能',field:'yqxn2',width:150},
  {label:'配件是否齐全',field:'pjsfqq2',width:110},
  {label:'接收者',field:'jsz',width:150},
  {label:'操作',field:'action'}
]
// const postData = {
//   'KSDM': route.query.KSDM
// }
// const headers = {
//   'tenant-id': 1,
//   'Authorization': 'Bearer test1'
// }
onMounted(
  async() => {
    currentDate.value = dayjs().format('YYYY-MM-DD')
    console.log('程序运行')
    console.log('当前ksdm:',ksdm)
    if(!ksdm){
      console.log('ksdm为空,终止')
      return
    }
    const postData = {
      'KSDM': ksdm
    }
    const headers = {
      'tenant-id': 1,
      'Authorization': 'Bearer test1'
    }
    const ksmcResponse = await PostApi.getKsinfoByKsdm(postData,headers)
    console.log('接口响应:',ksmcResponse)
    if(ksmcResponse?.data?.code == 0){
      const ksmcList = ksmcResponse.data.data
      const firstItem = ksmcList[0]
      ksmc.value = firstItem.KSMC
      console.log('ksmc:',ksmc)
    }
  }
)
const addNewRow = () =>{
  const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
  // const dateValue = new Date(unref(currentDate))
  // const dateValue = dayjs(unref(currentDate)).toDate()
  const dateStr = unref(currentDate)
  const newRow:dataItem = {
    id:newId,jyrq:dateStr,ks:'',jyyqmc:'',yqxn:'',pjsfqq:'',jyz:'',ghsj:dateStr,yqxn2:'',pjsfqq2:'',jsz:''
    // id:newId,jyrq:'',ks:'',jyyqmc:'',yqxn:'',pjsfqq:'',jyz:'',ghsj:'',yqxn2:'',pjsfqq2:'',jsz:''
  }
  data.push(newRow)
  editRows.set(newRow,{...newRow})
}
const edit = (row) => {
  editRows.set(row,{...row})
}
const save = (row) => {
  editRows.delete(row)
}
const cancel = (row) => {
  editRows.delete(row)
}
const deleteRow = (index) => {
  data.splice(index)
}
</script>
<template>
  <div style="display: flex;padding-left: 30px;gap: 30px; align-items: center;">
    <div>科室：{{ ksmc }}</div>
    <div>时间: {{ currentDate }}</div>
    <el-button @click="addNewRow">新增记录</el-button>
  </div>
  <YudaoTable :columns='columns' :data="data">
    <template #jyrq="{row}">
      <el-date-picker v-model="row.jyrq" type="date" value-format="YYYY-MM-DD" style="width: 140px;" placeholder="借用时间"/>
    </template>
    <template #ks="{row}">
      <el-input v-model="row.ks" v-if="editRows.has(row)"/>
    </template>
    <template #jyyqmc="{row}">
      <el-input v-model="row.jyyqmc" v-if="editRows.has(row)"/>
    </template>
    <template #yqxn="{row}">
      <el-input v-model="row.yqxn" v-if="editRows.has(row)"/>
    </template>
    <template #pjsfqq="{row}">
      <el-input v-model="row.pjsfqq" v-if="editRows.has(row)"/>
    </template>
    <template #jyz="{row}">
      <el-input v-model="row.jyz" v-if="editRows.has(row)"/>
    </template>
    <template #ghsj="{row}">
      <el-date-picker v-model="row.ghsj" type="date" value-format="YYYY-MM-DD" style="width: 140px;" placeholder="归还时间"/>
    </template>
    <template #yqxn2="{row}">
      <el-input v-model="row.yqxn2" v-if="editRows.has(row)"/>
    </template>
    <template #pjsfqq2="{row}">
      <el-input v-model="row.pjsfqq2" v-if="editRows.has(row)"/>
    </template>
    <template #jsz="{row}">
      <el-input v-model="row.jsz" v-if="editRows.has(row)"/>
    </template>
    <template #action="{$index,row}">
      <el-button v-if="!editRows.has(row)" @click="edit(row)">编辑</el-button>
      <el-button v-if="editRows.has(row)" @click="save(row)">保存</el-button>
      <el-button v-if="editRows.has(row)" @click="cancel(row)">取消</el-button>
      <el-button @click="deleteRow($index)">删除</el-button>
    </template>
  </YudaoTable>
</template>
<style scoped>

</style>