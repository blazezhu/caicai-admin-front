
import QDNumberPreserve from '@/views/custom/qdb/QDNumberPreserve.vue'
import QDBCPreserve from '@/views/custom/qdb/QDBCPreserve.vue'
import QDMedicinePreserve from '@/views/custom/qdb/QDMedicinePreserve.vue'
import messageSelect from '@/views/custom/messageSelect/messageSelect.vue'
import QDBindex from '@/views/custom/qdb/QDBIndex.vue'
import BYY_QDB from '@/views/custom/qdb/BYY_QDB.vue'
import YZ_BY_ZXCDB from '@/views/custom/qdb/YZ_BY_ZXCDB.vue'
import YW_BX_WDJS_YHB from '@/views/custom/qdb/YW_BX_WDJS_YHB.vue'
import YQ_JY from '@/views/custom/qdb/YQ_JY.vue'
import BL_QD from '@/views/custom/qdb/BL_QD.vue'
import GWYBY_QD from '@/views/custom/qdb/GWYBY_QD.vue'

export default[
    {
    path: '/qdb/QDNumberPreserve',
    name: 'QDNumberPreserve',
    component: QDNumberPreserve,
    meta:{
        title: '清点次数维护表',
        roles:['*']
        
    }
},{
    path: '/qdb/QDBCPreserve',
    name: 'QDBCPreserve',
    component: QDBCPreserve,
    meta:{
        title: '护理部排班维护',
        roles:['*']
        
    }
},
{
    path: '/qdb/QDMedicinePreserve',
    name: 'QDMedicinePreserve',
    component: QDMedicinePreserve,
    meta:{
        title: '需要清点的药品维护',
        roles:['*']
        
    }
},
{
    path:'/qdb/QDBindex',
    name: 'QDBindex' ,
    component : QDBindex,
    meta:{
        title: '清点表主页',
        roles:['*']
    }
},
{
    path:'/qdb/BYY_QDB',
    name:'BYY_QDB',
    component: BYY_QDB,
    meta:{
        title: '备用药物清点表',
        roles: ['*']
    }
},
{
    path:'/qdb/YZ_BY_ZXCDB',
    name:'YZ_BY_ZXCDB',
    component: YZ_BY_ZXCDB,
    meta:{
        title: '医嘱摆药执行查对表',
        roles: ['*']
    }
},
{
    path:'/qdb/YW_BX_WDJS_YHB',
    name:'YW_BX_WDJS_YHB',
    component:YW_BX_WDJS_YHB,
    meta:{
        title:'药物冰箱温度监测、养护记录表',
        role:["*"]
    }
},
{
    path:'/qdb/YQ_JY',
    name:'YQ_JY',
    component: YQ_JY,
    meta:{
        title:'仪器借用登记表',
        role:['*']
    }
},
{
    path:'/qdb/BL_QD',
    name:'BL_QD',
    component: BL_QD,
    meta:{
        title:'布类清点表',
        role:['*']
    }
},
{
    path:'/qdb/GWYBY_QD',
    name:'GWYBY_QD',
    component: GWYBY_QD,
    meta:{
        title:'高危药物备用清点表',
        role:['*']
    }
},
{
    path:'/messageSelect',
    name:'messageSelect',
    component: messageSelect,
    meta:{
        title: '短信查询',
        roles: ['*']
    }
},
// ========== 儿童大屏相关路由 ==========
{
    path: '/kids/dashboard/access',
    name: 'KidsDashboardAccess',
    component: () => import('@/views/kids/dashboard/AccessPage.vue'),
    meta: {
        title: '儿童大屏 - 生成访问码',
        roles: ['*']
    }
},
{
    path: '/kids/dashboard/view',
    name: 'KidsDashboardView',
    component: () => import('@/views/kids/dashboard/DashboardView.vue'),
    meta: {
        title: '我的大屏',
        roles: ['*']
    }
},
{
    path: '/kids/dashboard/user',
    name: 'KidsUserDashboard',
    component: () => import('@/views/kids/dashboard/UserDashboardPage.vue'),
    meta: {
        title: '用户大屏',
        roles: ['*']
    }
}
]