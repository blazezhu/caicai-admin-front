<script setup lang="ts">
    import {ref} from 'vue'
    import YudaoTable from '@/components/Table/src/Table.vue'
    import axios from 'axios'


    const editRows = reactive(new Map())
    
    interface dataItem{
         bctype: String
         bcmc: String
         bctime: Date
        }
    const data = ref<dataItem[]>([
        {bctype:'早',bcmc:'早1',bctime:new Date().setHours(8,0,0,0) as unknown as Date},
        {bctype:'中',bcmc:'中1',bctime:new Date().setHours(10,0,0,0) as unknown as Date},
        {bctype:'晚',bcmc:'晚1',bctime:new Date().setHours(17,0,0,0) as unknown as Date},
        {bctype:'晚',bcmc:'晚2',bctime:new Date().setHours(18,0,0,0) as unknown as Date}
    ])
    // const getBcMr = async() => {
    //     const response = await axios({
    //         method: 'POST',
    //         url: 'http://127.0.0.1:48080/qdb/getBcMr'
    //     })
    //     if(response.data.code = 0 && response.data!= null){
    //         message.value = response.data.data
    //     }
    // }
    const columns = [
        {label:"班次大类", field:'bctype',width:150},
        {label:"班次名称", field:'bcmc',width:150},
        {label:"定义时间", field:'bctime'},
        {label:"操作",field:'action'}
    ]
    const startEdit = (row:dataItem) =>{
        editRows.set(row,{...row})
    }
    const saveEdit =(row:dataItem) =>{
        editRows.delete(row)
    }
    const cancelEdit=(row:dataItem) =>{
        const original = editRows.get(row)
        Object.assign(row,original)
        editRows.delete(row)
    }
    // onMounted(
    //     async() => {
    //     const response = await axios({
    //         method: 'POST',
    //         url: 'http://127.0.0.1:48080/qdb/getBcMr'
    //     })
    
    //     if(response.data.code = 0 && response.data!= null){
    //         message.value = response.data.data
    //     }
    // }
    // )
</script>
<template>
    <el-button>新增</el-button>
    <el-button>删除</el-button>
    <YudaoTable :columns="columns" :data="data" >
        <template #bctype="{row}">
            <el-select v-model="row.bctype" v-if="editRows.has(row)">
                <el-option label='早' value="早"/>
                <el-option label='中' value="中"/>
                <el-option label='晚' value="晚"/>
            </el-select>
        </template>
        <template #bcmc="{row}">
            <el-input v-model="row.bcmc" v-if="editRows.has(row)"/>
        </template>
        <template #action="{row}">
            <el-button v-if="!editRows.has(row)" @click="startEdit(row)">修改</el-button>
            <el-button v-if="editRows.has(row)" @click="saveEdit(row)">保存</el-button>
            <el-button v-if="editRows.has(row)" @click="cancelEdit(row)">取消</el-button>
        </template>
    </YudaoTable>
</template>
<style scoped>

</style>