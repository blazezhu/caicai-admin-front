<script setup lang="ts">
    import YudaoTable from "@/components/Table/src/Table.vue"
    

    interface dataItem{
        ywmc: string,
        ywgg: string,
        js: number,
        bc: string,
        sl: number,
        bz: string
    }
    const data = ref<dataItem[]>([
        {ywmc: '药1',ywgg: '500ml',js: 5,bc: '总',sl: 5,bz: ''},
        {ywmc: '药2',ywgg: '500ml',js: 5,bc: '总',sl: 5,bz: ''},
        {ywmc: '药3',ywgg: '500ml',js: 5,bc: '总',sl: 5,bz: ''},
        {ywmc: '药4',ywgg: '500ml',js: 5,bc: '总',sl: 5,bz: ''},
        {ywmc: '药5',ywgg: '500ml',js: 5,bc: '总',sl: 5,bz: ''}
    ])
    
    const columns =[
        {label:'药物名称',field:'ywmc'},
        {label:'药物规格',field:'ywgg'},
        {label:'基数',field:'js'},
        {label:'班次',field:'bc'},
        {label:'数量',field:'sl'},
        {label:'备注',field:'bz'}
    ]
</script>

<template>
    <h1>瑞安市人民医院病区备用药物清点表</h1>
    <YudaoTable :columns="columns" :data="data">
        <template #sl="{row}">
            <el-input v-model="row.sl" />
        </template>
        <template #bz="{row}">
            <el-input v-model="row.bz" />
        </template>
    </YudaoTable>
</template>

<style scoped>

</style>