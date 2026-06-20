<script>
import { ref } from 'vue'
import axios from 'axios'

    export default{
        name: 'SelectSMSmassage',
        data: () => ({
            f: '1',
            massage: [],
            phoneNumber: null,
            startTime: '',
            endTime: null,
            isSyncing: false
        }),
        mounted(){
            this.formatCurrentTime();
        },
        methods: {
            formatNum(n){
                return n.toString().padStart(2,'0');
            },
            formatCurrentTime(){
                const now = new Date();
                const year = now.getFullYear();
                const month = this.formatNum(now.getMonth() +1);
                const day = this.formatNum(now.getDate());
                let month2 = this.formatNum(now.getMonth());
                if(month2 == '00'){
                    month2 = '12';
                }
                this.startTime = `${year}-${month2}-${day}`;
                this.endTime = `${year}-${month}-${day}`;
            },
            async selectSMSmassage(){ 
                try {
                    this.f = '请求中'
                    const response = await axios({
                        method: 'GET',
                        url: 'http://172.16.180.212:48080/admin-api/SMS/select/content',
                        headers: {
                            'tenant-id': '1',
                            Authorization: 'Bearer test1'
                        },
                        params: {
                            LXDH: this.phoneNumber,
                            startTime: this.startTime,
                            endTime: this.endTime
                            }
                    })
                    if(response.data.code == 0){
                        this.massage = response.data.data;
                        // this.$nextTick(()=> {
                        //     this.initScroll();
                        // })
                        }
                    else{
                        alert('数据获取失败' + response.data.message)
                    }
                }catch(error){
                    console.error('请求出错:' + err);
                }
                
            },
            handleLeftScroll(event){
                this.$refs.div2.scrollTop = event.target.scrollTop;
            },
            handleRightScroll(event){
                this.$refs.div1.scrollTop = event.target.scrollTop;
            },       
            scrollHandle(source){
                if (this.isSyncing) return;
                this.isSyncing = true;
                let sourceDiv,targetDiv;
                if (source === 'div1') {
                sourceDiv = this.$refs.div1;
                targetDiv = this.$refs.div2;
            } else {
                sourceDiv = this.$refs.div2;
                targetDiv = this.$refs.div1;
            if(!sourceDiv || !targetDiv){
                this.isSyncing = false;
                return;
            }
            const sourceTotal = sourceDiv.scrollHeight - sourceDiv.clientHeight;
            const scrollPercent = sourceTotal > 0 ? (sourceDiv.scrollTop / sourceTotal) : 0;
            const targetTotal = targetDiv.scrollHeight - targetDiv.clientHeight;
            const targetScrollTop = scrollPercent * targetTotal;
            targetDiv.scrollTop = targetScrollTop;
            this.$nextTick(()=> {
                this.isSyncing = false;
            })
            }
            } 
            }
    } 
</script>

<template>
    <div class="page" >
        <div class='params'>
        <input v-model="phoneNumber" placeholder='请输入手机号码' style="width: 200px; text-align: center; font-size: 15px;" />
        <div class="date">
            <el-date-picker v-model="startTime" type="date" style="width: 150px;  " value-format="YYYY-MM-DD" placeholder="起始时间"/>
            <el-date-picker v-model="endTime" type="date" style="width: 150px;" value-format="YYYY-MM-DD" placeholder="末尾时间"/>
        </div>
        <el-button @click="selectSMSmassage">查询</el-button>
        </div>
       
        <div class="el-table-container">
            <el-table :data="massage"  class="el-table">
                <el-table-column type='index' label="序号" width="100" fixed="left" header-align="center"/>
                <el-table-column prop="rq" label="日期" width="150" header-align="center"/>
                <el-table-column prop="content" label="内容" min-width="800px" header-align="center"/>
            </el-table>
        </div>
    </div>
</template>

<style scoped>
.page{
    
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-bottom: 3%;
    padding-left: 3%;
    padding-right: 3%;  
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
.params{
    margin-left: 100px;
    margin-top: 50px;
    width: 1000px;
    height: 35px;
    display: flex;
    gap:20px;
    
}

.el-table{
    overflow: auto;
    height: 100%;
    width: 100%;
    /* background-color: transparent !important; */
}

.el-table-container{
    flex: 1;
    width: 100%;
    overflow: hidden;
    margin-top:15px ;
    
}

.data-line{
    padding: 5px 0;
    border-bottom: 1px dashed #eee;
}
.title-container{
    height: 6%;
    width: 100%;
    display: flex;
    justify-content: space-between;
}
.title1{
    width: 15%;
    align-items:center;
    text-align: center;
    border: 1px solid #eee;
}
.title2{
    width: 85%;
    align-items:center;
    text-align: center;
    border: 1px solid #eee;
}
.date{
    gap:10px;
    display: flex;
    height: 100%;
    align-items: center;
}
</style>
