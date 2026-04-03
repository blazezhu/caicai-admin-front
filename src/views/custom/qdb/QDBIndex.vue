<script setup lang="ts">
    const zaoIndex =ref(0)
    const zhongIndex =ref(0)
    const wanIndex =ref(0)
    const zongIndex =ref(0)
    const response = reactive(Map)
    

    const getMoringQDB = () =>{
        
    }
    const getAfternoonQDB = () =>{

    }
    const getNightQDB = () =>{

    }
    const getTotalQDB = () =>{

    }
</script>

<template>
    <h1>清点表</h1>
    <div>
        <el-button v-if="zaoIndex == 0" @click="getMoringQDB">早</el-button>
        <el-button v-if="zhongIndex == 0" @click="getAfternoonQDB">中</el-button>
        <el-button v-if="wanIndex == 0" @click="getNightQDB">晚</el-button>
        <el-button v-if="zongIndex == 0" @click="getTotalQDB">总</el-button>
    </div>
</template>

<style scoped>

</style>