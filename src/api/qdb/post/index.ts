import request from '@/config/axios'
import axios, { AxiosRequestConfig } from 'axios'



export const getYpxx = async() => {                       //初始化 alldata，从数据库里取
  // return await request.post({ url: 'http://127.0.0.1:48080/qdb/getYpxx'})
  return await axios.post('http://127.0.0.1:48080/qdb/getYpxx')
        // const response = await axios({
        //     method: 'POST',
        //     url: 'http://127.0.0.1:48080/qdb/getYpxx'
        // })
        // if(response.data != null && response.data.code == 0){
        //     allData.value = response.data.data
        // }
    }

export const getKsinfoByKsdm = async(params,headers) => {
  const config:AxiosRequestConfig = {headers}
  return await axios.post('http://127.0.0.1:48080/qdb/getBqinfoByKsdm',params,config)
}