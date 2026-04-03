<script setup lang="ts">
import {useRoute} from 'vue-router'
import YudaoTable from '@/components/Table/src/Table.vue'
import dayjs from 'dayjs'
import * as PostApi from '@/api/qdb/post/index'
import { id } from 'element-plus/es/locale'

const route = useRoute()
const ksdm = route.query.KSDM
const ksmc = ref('')
const currentDate = ref('')
const editRows = reactive(new Map())
interface dataItem {
  id: number;
  wpmc:string;
  js:string;
  bc:string;
  sl:string;
  bz:string;
  [key:string]: any
}
const data = reactive<dataItem[]>([])
const bcOption = ref(['早','中','晚','总'])
const columns = [
  {label:'物品名称',field:'wpmc'},
  {label:'基数',field:'js'},
  {label:'班次',field:'bc'},
  {label:'数量',field:'sl'},
  {label:'备注',field:'bz'},
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
    id:newId,wpmc:'',js:'',bc:'总',sl:'',bz:''
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
    <template #wpmc="{row}">
      <el-input v-model="row.wpmc" v-if="editRows.has(row)"/>
    </template>
    <template #js="{row}">
      <el-input v-model="row.js" v-if="editRows.has(row)"/>
    </template>
    <template #bc="{row}">
      <el-select v-model="row.bc" v-if="editRows.has(row)">
        <el-option v-for="option in bcOption" :key="option" :value="option">{{ option }}</el-option>
      </el-select>
    </template>
    <template #sl="{row}">
      <el-input v-model="row.sl" v-if="editRows.has(row)"/>
    </template>
    <template #bz="{row}">
      <el-input v-model="row.bz" v-if="editRows.has(row)"/>
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