<script setup lang="ts">
    import YudaoTable from "@/components/Table/src/Table.vue"
    import axios from "axios"
    import dayjs from "dayjs"
    import {useRoute} from 'vue-router'
    import * as PostApi from '@/api/qdb/post/index'
    
    const ZZRinputFocusIndex = reactive(new Map())
    const searchZZResult = ref([])
    const ZZRAllData = ref([])
    const currentDate = ref('')
    const route = useRoute()
    const ks = ref('')
    const ksdm = route.query.KSDM
    const ksmc = ref("")
    const editRows = reactive(new Map())
    interface dataItem{
        bc:string
        cdjg:string
        zrr:string
        cz:string
        czr:string
        bz:string
    }
    const data = reactive([
        {id:1,bc:"早",syby:"无误",yzzx:"无误",czwt:"无误",zrr:'陈泽朋',cz:'无',czr:"陈泽朋",bz:'无'},
        {id:2,bc:"中",syby:"无误",yzzx:"无误",czwt:"无误",zrr:'陈泽朋',cz:'无',czr:"陈泽朋",bz:'无'},
        {id:3,bc:"晚",syby:"无误",yzzx:"无误",czwt:"无误",zrr:'陈泽朋',cz:'无',czr:"陈泽朋",bz:'无'}
    ])
    type  Column ={
        label:string
        field:string
        width?:number
        children?:Column[]
    }
    const columns:Column[] =[
        {label:"班次", field:'bc',width:150},
        {label:"查对结果",field:'cdjg',children:[
            {label:"输液摆药",field:'syby',width:100},
            {label:"医嘱执行",field:'yzzx',width:100},
            {label:"存在问题",field:'czwt',width:100}
        ]},
        {label:"责任人", field:'zrr'},
        {label:"处置",field:'cz'},
        {label:"处置人", field:'czr'},
        {label:"备注", field:'bz'},
        {label:"操作",field:'action'}
        ]
        
    const addNewRow = () =>{
        const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
        const newRow = {
            id: newId,bc:"",syby:"",yzzx:"",czwt:"",zrr:'',cz:'',czr:"",bz:''
        }
        data.push(newRow)
    }  
    const deleteRow = (index) => {
        data.splice(index,1)
    }
    const edit = (row)=>{
        editRows.set(row,{...row})
    }
    const cancel = (row) =>{
        editRows.delete(row)
    }
    onMounted(

        async() => {                   
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
            if(ksmcResponse!=null && (await ksmcResponse).data.code == '0'){
                ksmc.value = (await ksmcResponse).data.data.KSMC
            }

        currentDate.value = dayjs().format('YYYY-MM-DD') //这一句是为了调取当天的时间和http请求无关

        // const ZZRresponse = await axios({
        //     method: 'POST',
        //     url: 'http://127.0.0.1:48080/qdb/getYpxx'  //要把这个接口换成查询工号，名字的接口
        // })
        // if(ZZRresponse.data != null && ZZRresponse.data.code == 0){
        //     ZZRAllData.value = ZZRresponse.data.data
        // }
        
    })
    const searchZZRData = async(row) => { 
        const key = row.zzr        //去空格
        if(!key){
            searchZZResult.value = []
            return
        }
        searchZZResult.value = ZZRAllData.value.filter(item => item.MC.toLowerCase().includes(key.toLowerCase())) //筛选数据   toLowerCase()：大写转小写  .includes():判断是否包含指定内容

    }
    const ZZRinputFocus = (row) => {
        ZZRinputFocusIndex.set(row,true) 
        searchZZRData(row)
        
    }
</script>

<template>
    <div style="display: flex;">
        <div>科室：{{ ks }}</div>
        <div>时间：{{ currentDate }}</div>
        <el-button @click="addNewRow">新增记录</el-button>
    </div>
    <YudaoTable :columns="columns" :data="data">
        <template #bc="{row}">
            <el-input v-model="row.bc" v-if="editRows.has(row)"/>
        </template>
        <template #syby="{row}" >
            <el-input v-model="row.syby" v-if="editRows.has(row)"/>
        </template>
        <template #yzzx="{row}">
            <el-input v-model="row.yzzx" v-if="editRows.has(row)"/>
        </template>
        <template #czwt="{row}">
            <el-input v-model="row.czwt" v-if="editRows.has(row)"/>
        </template>
        <template #zrr="{row}">
            <template>
                <div style="display: grid; grid-template-rows: auto auto;" @focusin="ZZRinputFocus(row)" @focusout="ZZRinputBlur(row,$event)" tabindex="-1">
                    <el-input v-model="row.yw"  @input="searchData(row)" style="grid-row: 1;" :autocomplete="'off'"/>
                    <ul v-show="row.yw && searchResult.length > 0 && inputFocusIndex.get(row) == true" style="grid-row: 2; position: relative;z-index: 9999;max-height: 200px;overflow-y: auto;" >
                        <li v-for="item in searchResult" :key="item.YPXH" @click="handleItemClick(item,row)" style="cursor: pointer;" tabindex="0">
                            <div>
                                <div style="font-weight: 500;">{{ item.MC }}</div>
                            </div>
                        </li>
                    </ul> 
                </div>
            </template>
        </template>
        <template #cz="{row}">
            <el-input v-model="row.cz"/>
        </template>
        <template #czr="{row}">
            <el-input v-model="row.czr"/>
        </template>
        <template #bz="{row}">
            <el-input v-model="row.bz"/>
        </template>
        <template #action="{row,$index}">
            <el-button v-if="!editRows.has(row)" @click="edit(row)">编辑</el-button>
            <el-button v-if="editRows.has(row)" @click="cancel(row)">取消</el-button>
            <el-button @click='deleteRow($index)'>删除</el-button>
        </template>
    </YudaoTable>
</template>

<style scoped>

</style>