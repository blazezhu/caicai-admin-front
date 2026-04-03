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
    // const currentRow = ref([])
    interface dataItem{
        id: number
        yw: String
        ywgg: String
        ywdw: String
        js: number
        ywtype: String
        }
    
    const data2 = reactive([
        {id:1,yw:'药1',ywgg:'100ml/只',ywdw:'只',js: 5,ywtype:'备用药'},
        {id:2,yw:'药2',ywgg:'100ml/只',ywdw:'只',js:20,ywtype:'备用药'},
        {id:3,yw:'药3',ywgg:'100ml/只',ywdw:'只',js:30,ywtype:'备用药'},
        {id:4,yw:'药4',ywgg:'100ml/只',ywdw:'只',js:25,ywtype:'备用药'}
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
    const currentGroupUnits = ref<string[]>([])
    const currentGroupSpecs = ref<string[]>([])
    const columns = [
        {label:"药物名称", field:'yw'},
        {label:"药物规格", field:'ywgg',width:200},
        {label:"药物单位", field:'ywdw'},
        {label:"基数",field:'js'},
        {label:"药物类型", field:'ywtype'},
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
        const key = row.yw        //去空格
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
        row.yw = group[0].MC
        groupData.value = []
        const units = new Set<string>();
        const specs = new Set<string>();
        group.forEach(
            item => {
                if(item.YPDW){
                    units.add(item.YPDW)
                }
            }
        )
        group.forEach(
            item => {
                if(item.YPGG){
                    specs.add(item.YPGG)
                }
            }
        )
        currentGroupUnits.value=Array.from(units)
        if(currentGroupUnits.value.length > 0){
            row.ywdw = currentGroupUnits.value[0]
        }else{
            row.ywdw = ''
        }
        currentGroupSpecs.value=Array.from(specs)
        if(currentGroupSpecs.value.length > 0){
            row.ywgg = currentGroupSpecs.value[0]
        }else{
            row.ywgg = ''
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
            id:newId,yw:'',ywgg:'',ywdw:'',js: 0,ywtype:''
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
        <template #yw="{row}">
            <template v-if="!editRows.has(row)">
                {{ row.yw || '-' }}
            </template>
            <template v-if="editRows.has(row)" >
                <div  style="display: grid; grid-template-rows: auto auto;" @focusin="inputFocus(row)" @focusout="inputBlur(row,$event)" tabindex="-1">
                    <el-input v-model="row.yw" v-if="editRows.has(row)" @input="searchData(row)" style="grid-row: 1;" :autocomplete="'off'"/>
                    <!-- <ul v-show="row.yw && searchResult.length > 0 && inputFocusIndex.get(row) == true" style="grid-row: 2;position: relative;z-index: 9999;max-height: 200px;overflow-y: auto;" >
                        <li v-for="item in searchResult" :key="item.YPXH" @click="handleItemClick(item,row)" style="cursor: pointer;" tabindex="0">
                            <div>
                                <div style="font-weight: 500;">{{ item.MC }}</div>
                            </div>
                        </li>
                    </ul>  -->
                    <!-- <ul v-show="row.yw && groupData.length > 0 && inputFocusIndex.get(row) == true" v-for="(group,groupIndex) in groupData" :key="groupIndex"
                        style="grid-row: 2;position: relative;z-index: 9999;max-height: 200px;overflow-y: auto;" >
                        <li v-for="item in group" :key="item.YPXH" @click="handleItemClick(item,row)" style="cursor: pointer;" tabindex="0">
                            <div>
                                <div style="font-weight: 500;">{{ item.MC }}</div>
                            </div>
                        </li>
                    </ul> -->
                    <ul v-show="row.yw && groupData.length > 0 && inputFocusIndex.get(row) == true" style="grid-row: 2;position: relative;z-index: 9999;max-height: 200px;overflow-y: auto;" >
                        <li v-for="(group,groupIndex) in groupData" :key="groupIndex" @click="handleItemClick(group,row)" style="cursor: pointer;" tabindex="0">
                            <div>
                                <div style="font-weight: 500;">{{ group[0].MC }}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </template>
                <!-- <el-input v-model="row.yw" v-if="editRows.has(row)" @input="searchData(row)" />
                <ul v-show="row.yw && searchResult.length > 0"  >
                    <li v-for="item in searchResult" :key="item.YPXH" @click="handleItemClick(item,row)" >{{ item.MC }}</li>
                </ul> -->
        </template>
        <template #ywgg="{row}">
            <div v-if="currentGroupSpecs.length > 0 && editRows.has(row)" >
                <el-select v-model="row.ywgg" >
                    <el-option v-for="spec in currentGroupSpecs" :key="spec" :value="spec">{{ spec }}</el-option>
                </el-select>
            </div>
        </template>
        <template #ywdw="{row}">
            <div v-if="currentGroupUnits.length > 0 && editRows.has(row)" >
                <el-select v-model="row.ywdw" >
                    <el-option v-for="unit in currentGroupUnits" :key="unit" :value="unit">{{ unit }}</el-option>
                </el-select>
            </div>
        </template>
        <template #js="{row}">
            <el-input v-model="row.js" v-if="editRows.has(row)"/>
        </template>
        <template #ywtype="{row}">
            <el-select v-model="row.ywtype" v-if="editRows.has(row)">
                <el-option label="备用药" value="备用药" />
                <el-option label="麻醉药" value="麻醉药" />
                <el-option label="设备" value="设备" />
            </el-select>
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