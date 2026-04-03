<script setup lang="ts">
    import {ref} from 'vue'
    import YudaoTable from '@/components/Table/src/Table.vue'
    import { ElMessage } from 'element-plus'

    // const tags = ref([
    //     {name:'清点次数维护',type:'',closable:true}
    // ])


    interface dataItem{
         id :String
         whcs: number
         wplx: String
         spzt: String
         bc: String[]
        }
    const data = ref<dataItem[]>([
        {id:'1',whcs:3,wplx:'备用药',spzt:'已审批',bc:['早1','中1','晚1']},
        {id:'2',whcs:3,wplx:'备用药',spzt:'未审批',bc:['早2','中2','晚1']},
        {id:'3',whcs:3,wplx:'备用药',spzt:'未审批',bc:['早2','中1','晚2']}
    ])
     const save = (row) =>{

    }
    const columns = [
        {label:'id',field:'id',width: 150},
        {label:'维护次数',field:'whcs',width:150},
        {label:'物品类型',field:'wplx',width:150},
        {label:'审批状态',field:'spzt',width:150},
        {label:'班次',field:'bc'},
        {label:'操作',field:'action',width:150}
    ]
    // const columns = [
    //     {label:'数据',field:'id',component:{name: 'el-inpput',props:{type: 'String'},vModel:(row) => row.id}},
    //     {label:'维护次数',field:'whcs'},
    //     {label:'物品类型',field:'wplx',component:{name: 'el-inpput',props:{type: 'String'},vModel:(row) => row.wplx}},
    //     {label:'审批状态',field:'spzt',component:{name: 'el-inpput',props:{type: 'String'},vModel:(row) => row.spzt}},
    //     {label:'班次',field:'bc',component:{name:'el-checkbox-group',
    //     props:{modelValue:(row) => row.bc ? row.bc.split(',') : [],
    //     options:[{label:'早1',value:'早1'},{label:'早2',value:'早2'},{label:'中1',value:'中1'},{label:'中2',value:'中2'},{label:'晚1',value:'晚1'},{label:'晚2',value:'晚2'}]},
    // on:{change:(val:string[],row) =>{
    //     row.bc = val.join(',')
    // }}}},
    //     {label:'操作',field:'action'}
    // ]
</script>

<template>
    <!-- <el-title level="2" >清点次数维护</el-title> -->
    <!-- <h1 class="form-title">清点次数维护</h1> -->
    <!-- <template>
        <el-typography>
            <el-title :level="1">清点次数维护</el-title>
        </el-typography>
    </template>                                  -->
    <!-- <template>
        <el-tag v-for="tag in tags" :key="tag.name" :type="tag.type" :closable="tag.closable" :disable-transitions="false">
            {{ tag.name }}
        </el-tag> 
    </template> -->
    <h1 class="title">清点次数维护</h1>
    <YudaoTable :columns="columns" :data="data" >
        <!-- <template #id="{row}">
            <el-input v-model="row.id" type="String"/>
        </template> -->
        <template #wplx="{row}">
            <el-select v-model="row.wplx">
                <el-option label="备用药" value="备用药" />
                <el-option label="麻醉药" value="麻醉药" />
                <el-option label="设备" value="设备" />
            </el-select>
        </template>
        <!-- <template #spzt="{row}">
            <el-input v-model="row.spzt" type="String"/>
        </template> -->
        <template #bc="{row}">
            <el-checkbox-group v-model="row.bc">
                <el-checkbox label="早1" />
                <el-checkbox label="早2" />
                <el-checkbox label="中1" />
                <el-checkbox label="中2" />
                <el-checkbox label="晚1" />
                <el-checkbox label="晚2" />
            </el-checkbox-group>
        </template>
        <template #action="{ row }">
            <el-button @click="save(row)">保存</el-button>
        </template>
    </YudaoTable>
</template>

<style scoped>
.title{
    text-align: center;
    font-family: 'SimSun','宋体',serif;
    font-size: 35px;
    /* font-weight: normal */
}
</style>

