<script lang="ts" setup>
    import YudaoTable from "@/components/Table/src/Table.vue"
    import axios from "axios";
    import * as PostApi from '@/api/qdb/post/index';
    import dayjs from 'dayjs'
    import {useRoute} from 'vue-router'


    const data = ref([])
    const route = useRoute()
    const ksdm = route.query.KSDM
    const ksmc = ref('')
    const editRows = reactive(new Map())
    const currentDate = ref('')
    const inputFocusIndex = reactive(new Map())
    const bcOption = ref(['早','中','晚','总'])
    // const currentRow = ref([])
    interface dataItem{
        id: number
        ypmc: string
        ypgg: string
        js: string
        bc: string
        sl: string
        bz: string
        }
    
    const data2 = reactive([
        {id:1,ypmc:'药1',ypgg:'100ml/只',js:'10',bc:'早',sl:'10',bz:''},
        {id:2,ypmc:'药2',ypgg:'100ml/只',js:'10',bc:'中',sl:'20',bz:''},
        {id:3,ypmc:'药3',ypgg:'100ml/只',js:'10',bc:'晚',sl:'30',bz:''},
        {id:4,ypmc:'药4',ypgg:'100ml/只',js:'10',bc:'总',sl:'20',bz:''}
    ])
    interface searchResultItem{
        YPDW: string,
        MC: string,
        YP: string,
        YPXH: string,
        // YPGG: string
        [key: string]: any
    }
    type groupDataItem = searchResultItem[]
    const allData = ref<searchResultItem[]>([])   //存储全局变量（所有的从数据库查出来的药品信息数据）
    const searchResult = ref<searchResultItem[]>([])
    // interface groupDataItem {
    //     MC : string
    //     [key:string]: any
    // }
    const groupData = ref<groupDataItem[]>([])
    const currentGroupSpecs = ref<string[]>([])
    const columns = [
        {label:"药品名称", field:'ypmc'},
        {label:"药品规格", field:'ypgg',width:200},
        {label:"基数", field:'js'},
        {label:"班次",field:'bc'},
        {label:"数量", field:'sl'},
        {label:"备注", field:'bz'},
        {label:"操作",field:'action'}
    ]
    onMounted(async() => {                       
        currentDate.value = dayjs().format('YYYY-MM-DD')
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
        const response = await PostApi.getYpxx()
        if(response.data != null && response.data.code == 0){
            allData.value = response.data.data
        }
    })
    const edit = (row:dataItem) => {
        editRows.set(row,{...row})
    }
    const save = (row) => {
        editRows.delete(row)
    }
    const cancel = (row) => {
        editRows.delete(row)
    }
    const groupDataByMC = (data:searchResultItem[]):groupDataItem[] => {
            const nameMap = new Map<string,groupDataItem>()
            data.forEach(
                item => {
                    if(!item.MC || !item.YPXH) return;
                    if(!nameMap.has(item.MC)){
                        nameMap.set(item.MC,[])
                    }
                    nameMap.get(item.MC)!.push(item)
            });
            return Array.from(nameMap.values())
        }
    const searchData = async(row) => { 
        const key = row.ypmc        //去空格
        if(!key){
            searchResult.value = []
            return
        }
        searchResult.value = allData.value.filter(item => item.MC.toLowerCase().includes(key.toLowerCase())) //筛选数据   toLowerCase()：大写转小写  .includes():判断是否包含指定内容
        console.log('searchResult:',searchResult)
        groupData.value = groupDataByMC(searchResult.value)
        console.log('groupData:',groupData)

    }
    // const handleItemClick = (item: searchResultItem,row) => {
    //     row.yw = item.MC
    //     searchResult.value = []
    //     row.ywgg = item.YPGG
    //     row.ywdw = item.YPDW
    // }
    const handleItemClick = (group: groupDataItem,row) => {
        row.ypmc = group[0].MC
        groupData.value = []
        const specs = new Set<string>();
        group.forEach(
            item => {
                if(item.YPGG){
                    specs.add(item.YPGG)
                }
            }
        )
        currentGroupSpecs.value=Array.from(specs)
        if(currentGroupSpecs.value.length > 0){
            row.ypgg = currentGroupSpecs.value[0]
        }else{
            row.ypgg = ''
        }
        
    }
    const inputFocus = (row) => {
        inputFocusIndex.set(row,true) 
        searchData(row)
        // currentRow.value = row
    }
    const inputBlur = (row,event) => {
        const relatedTarget = event.relatedTarget
        const ywInput = event.currentTarget
        if(relatedTarget instanceof Node && ywInput.contains(relatedTarget)){
            return
        }
        inputFocusIndex.set(row,false)
        searchResult.value = []
    }
    const addNewRow = () =>{
        const newId = data2.length > 0 ? Math.max(...data2.map(item => item.id)) + 1 : 1
        const newRow = {
            id:newId,ypmc:'',ypgg:'',js:'',bc:'',sl:'',bz:''
        }
        data2.push(newRow)
        editRows.set(newRow,{...newRow})
    }
    const deleteRow = (index) =>{
        data2.splice(index,1)
    }
</script>

<template>
    <!-- <div>{{ searchResult }}</div> -->
    <!-- <div>{{ allData }}</div> -->
    <!-- <div>{{ groupData }}</div> -->
     <div style="display: flex;padding-left: 30px;gap: 30px; align-items: center;">
        <div>科室：{{ ksmc }}</div>
        <div>时间: {{ currentDate }}</div>
        <el-button @click="addNewRow">新增记录</el-button>
    </div>
    <YudaoTable :columns="columns" :data="data2" >
        <template #ypmc="{row}">
            <template v-if="!editRows.has(row)">
                {{ row.ypmc || '-' }}
            </template>
            <template v-if="editRows.has(row)" >
                <div  style="display: grid; grid-template-rows: auto auto;" @focusin="inputFocus(row)" @focusout="inputBlur(row,$event)" tabindex="-1">
                    <el-input v-model="row.ypmc" v-if="editRows.has(row)" @input="searchData(row)" style="grid-row: 1;" :autocomplete="'off'"/>
                    <ul v-show="row.ypmc && groupData.length > 0 && inputFocusIndex.get(row) == true" style="grid-row: 2;position: relative;z-index: 9999;max-height: 200px;overflow-y: auto;" >
                        <li v-for="(group,groupIndex) in groupData" :key="groupIndex" @click="handleItemClick(group,row)" style="cursor: pointer;" tabindex="0">
                            <div>
                                <div style="font-weight: 500;">{{ group[0].MC }}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
        </template>
        <template #ypgg="{row}">
            <div v-if="currentGroupSpecs.length > 0 && editRows.has(row)" >
                <el-select v-model="row.ypgg" >
                    <el-option v-for="spec in currentGroupSpecs" :key="spec" :value="spec">{{ spec }}</el-option>
                </el-select>
            </div>
        </template>
        <template #js="{row}">
            <el-input v-model="row.js" v-if="editRows.has(row)"/>
        </template>
        <template #bc="{row}">
          <el-select v-model="row.bc" v-if="editRows.has(row)">
            <el-option v-for="option in bcOption" :key="option" :value="option">{{ option }}</el-option>
          </el-select>
        </template>
        <template #sl="{row}" >
          <el-input v-model="row.sl" v-if="editRows.has(row)" />
        </template>
        <template #bz="{row}" >
          <el-input v-model="row.bz" v-if="editRows.has(row)" />
        </template>
        <template #action="{row,$index}">
            <el-button v-if="!editRows.has(row)" @click="edit(row)">编辑</el-button>
            <el-button v-if="editRows.has(row)" @click=save(row)>保存</el-button>
            <!-- <el-button v-if="editRows.has(row)" @click="cancel(row)">取消</el-button> -->
            <el-button @click="deleteRow($index)">删除</el-button>
        </template>
    </YudaoTable>
</template>

<style scoped>
/* .ywGrid{
    display: none; 
    grid-template-rows: auto auto;
}
.ywInput:focus + .ywGrid{
    display: grid;
    grid-row: 1;
} */
/* .cell-wrap{
    position: relative;
    width: 100%;
    box-sizing: border-box;
    height: 100%;
}
:deep(.suggest-ul){
    position:absolute;
    top: calc(100% + 2px);
    left: 0;
    z-index: 9999;
    width: 100%;
    margin: 0;
    max-height: 160px;
    overflow: auto;
}
:deep(.suggest-li){
    cursor: pointer;
    white-space: nowrap;
} */
</style>