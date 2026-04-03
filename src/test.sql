
WITH diagnoses AS (
    SELECT
        die.id_vismed,
        LISTAGG(CASE WHEN die.sd_dieproctp_cd = 22 THEN dt.na_die END, ',')
            WITHIN GROUP (ORDER BY sn) AS admit_diag_name,
        LISTAGG(CASE WHEN die.sd_dieproctp_cd = 22 THEN dt.cd_die END, ',')
            WITHIN GROUP (ORDER BY sn) AS admit_diag_code,
        LISTAGG(CASE WHEN die.sd_dieproctp_cd = 1 THEN dt.na_die END, ',')
            WITHIN GROUP (ORDER BY sn) AS discharge_west_diag_name,
        LISTAGG(CASE WHEN die.sd_dieproctp_cd = 1 THEN dt.cd_die END, ',')
            WITHIN GROUP (ORDER BY sn) AS discharge_west_diag_code,
        LISTAGG(CASE WHEN die.sd_dieproctp_cd = 2 THEN dt.na_die END, ',')
            WITHIN GROUP (ORDER BY sn) AS discharge_tcm_disease_name,
        LISTAGG(CASE WHEN die.sd_dieproctp_cd = 2 THEN dt.cd_die END, ',')
            WITHIN GROUP (ORDER BY sn) AS discharge_tcm_disease_code
    FROM hi_hpl_med_die die
    JOIN hi_hpl_med_die_dt dt
        ON die.id_meddie = dt.id_meddie
        AND die.delete_flag = 0
        AND dt.delete_flag = 0
    WHERE die.sd_dieproctp_cd IN (1, 2, 22)
    GROUP BY die.id_vismed
),
surgery_plans AS ( -- 新增手术计划CTE
    SELECT t.*,
           ROW_NUMBER() OVER (
               PARTITION BY id_vismed
               ORDER BY actual_time_surg_b
           ) AS rn
    from hi_ex_med_surg_plan t
)
SELECT
    'H33038100064' AS ORGANID,
    ip.id_vismed,
    emr.id_medrecdoc,
    pi.cd_pi AS PAT_INDEX,
    emr.id_patient AS idpi,
    ip.num_vismed AS INPATIENT_SN,
    emr.id_hospital AS INPATIENT_NO,
    CASE bas.SD_MARRY_CD
        WHEN '1' THEN '10'
        WHEN '2' THEN '20'
        WHEN '3' THEN '30'
        WHEN '4' THEN '40'
        ELSE '90'
    END AS MARITAL,
    bas.sd_occu_cd AS PROFESSION_CODE,
    emr.Name AS PAT_NAME,
    DECODE(pi.sd_pernidtp_cd, 11, pi.idno, '') AS IdCard,
    emr.sex AS SEX_CODE,
    '' AS MOBILE_NO,
    '' AS CONTACT_NAME,
    '' AS CONTACT_MOBILE,
    '' AS SEX_NAME,
    pi.bod AS BirthDate,

    (select map_dep_cd(bbpdep.id_dep) from bbp.hi_sys_dep bbpdep,HI_VIS_MED_DEP_io dep
where bbpdep.id_dep= dep.id_depio and dep.id_vismed =ip.id_vismed and dep.SD_DEPIOTP_CD =3  and dep.fg_canc = 0 and rownum = 1 ) as DEPT_CODE,--  科室代码
(select bbpdep.na from bbp.hi_sys_dep bbpdep,HI_VIS_MED_DEP_io dep
where bbpdep.id_dep= dep.id_depio and dep.id_vismed =ip.id_vismed and dep.SD_DEPIOTP_CD =3  and dep.fg_canc =0  and rownum = 1) as DEPT_NAME,--  科室名称
(select map_dep_cd(bbpdep.id_dep) from bbp.hi_sys_dep bbpdep,HI_VIS_MED_DEP_io dep
where bbpdep.id_dep= dep.id_dep_patio and dep.id_vismed =ip.id_vismed and dep.SD_DEPIOTP_CD =3  and dep.fg_canc = 0  and rownum = 1) as  WARD_CODE ,--  病区代码
(select bbpdep.na  from bbp.hi_sys_dep bbpdep,HI_VIS_MED_DEP_io dep
where bbpdep.id_dep= dep.id_dep_patio and dep.id_vismed =ip.id_vismed and dep.SD_DEPIOTP_CD =3  and dep.fg_canc = 0  and rownum = 1) as WARD_NAME,--  病区名称

    CASE WHEN INSTR(emr.age, '岁') > 0 THEN REPLACE(emr.age, '岁', '') END AS AGE,
    '' AS SICKROOM_NO,
    emr.bed_no AS BED_NO,
    vis.DT_VISMED_B AS VisitDateTime,
    vis.DT_VISMED_B AS ADMIT_DATE,
    CASE WHEN cyjl.id_medrecdoc is not null THEN cyjl.ryqk||cyjl.Yinxfzjc ELSE rjcyjl.ryqk END AS ADMIT_SITUATION,
    '' AS ADMIT_TCM_CODE,
    '' AS ADMIT_TCM_NAME,
    diag.admit_diag_name AS AdmissionDiagnoseName,
    diag.admit_diag_code AS ADMIT_DIAG_CODE,
    vis.DT_VISMED_E AS DISCHARGE_DATE,
    diag.discharge_west_diag_name AS DischargeDiagnoseName,
    diag.discharge_west_diag_code AS DISCHARGE_DIAG_CODE,
    diag.discharge_tcm_disease_name AS DischargeTraChiDiseaseName,
    diag.discharge_tcm_disease_code AS DischargeTraChiDiseaseCode,
    '' AS DischargeTraChiSyndromeName,
    '' AS DischargeTraChiSyndromeCode,
    CASE WHEN cyjl.id_medrecdoc is not null THEN cyjl.cyqk ELSE rjcyjl.cyqk END AS DISCHARGE_SUMM,---出院情况
    '' AS DISCHARGE_RESULT,
    CASE WHEN cyjl.yangxfzjc IS NOT NULL THEN cyjl.yangxfzjc ELSE '' END AS AUXILIARY_EXAMINATION,--住院期间辅助检查日间没有
    '' AS OPER_CODE,
    '' AS WOUND_CATEG_CODE,
    '' AS WOUND_HEALING_CODE,
    hemsp.actual_time_surg_b AS OPER_BEGIN_DATE,
    '' AS ANES_METHOD_CODE,
    '' AS OPER_RECORD,
    '' AS EXAMTSET_RESULT,
    CASE WHEN cyjl.cyqk is not null THEN cyjl.cyqk ELSE rjcyjl.cyqk END AS DISCHARGE_STATUS,---出院情况
    CASE WHEN cyjl.cydy is not null THEN cyjl.cydy ELSE rjcyjl.cydy END AS DISCHARGE_ORDER,--出院带药
    CASE WHEN cyjl.zhenljg is not null THEN cyjl.zhenljg ELSE rjcyjl.zljg END AS COURSE_TREATMENT,--诊疗经过
    '' AS FOUR_EXAMINATIONS,
    '' AS TANKYRASE,
    '' AS TCM_DECOCT,
    '' AS TCM_DOSAGE,
    '' AS ChiefDoctorSign,
    '' AS AttendingDoctor,
    f_getygxm(emr.insert_user) AS ATTEND_DR_SIGN,
    '' AS CHIEF_DR_SIGN,
    TO_NUMBER(TRUNC(vis.DT_VISMED_E) - TRUNC(vis.DT_VISMED_B)) AS DAYS_INHOPS,
    (SELECT dt_sign FROM bbp.hi_view_ca_TimeStamp WHERE id_business = emr.id_medrecdoc) AS SIGN_DATE,
    emr.update_time AS EffectivetTime,
   '何种情况需紧急到医院就诊:'||nvl(cyjl.jjqk,'')||CASE WHEN cyjl.zysx IS NOT NULL THEN cyjl.zysx ELSE rjcyjl.zysx END AS DISCHARGE_ATTENTION, --没有jjqk字段
    '' AS DAILY_ACTIVITY,
    '' AS NUTRITION_GUIDANCE,
    '' AS REHABILITATION,
    '' AS PAIN_MANAGEMENT,
    
    CASE WHEN cyjl.fzsj IS NOT NULL THEN to_date(cyjl.fzsj,'yyyy-mm-dd') 
    ELSE to_date(trim((substr(rjcyjl.fzjsf,(instr(rjcyjl.fzjsf,'复诊时间：')+5),(instr(rjcyjl.fzjsf,'复诊地点：') - instr(rjcyjl.fzjsf,'复诊时间：')-5)))),'yyyy-mm-dd')  
    END AS RETURN_VISIT_DATE,--复诊时间
    
    CASE WHEN cyjl.fzjsf IS NOT NULL THEN nvl(cyjl.fzdd,substr(cyjl.fzjsf,(instr(cyjl.fzjsf,'复诊地点：') + length('复诊地点：')),(instr(cyjl.fzjsf,'何种情况需紧急到医院就诊：') - instr(cyjl.fzjsf,'复诊地点：') - length('复诊地点：')))) 
      ELSE (substr(rjcyjl.fzjsf,(instr(rjcyjl.fzjsf,'复诊地点：') + length('复诊地点：')),(instr(rjcyjl.fzjsf,'何种情况需紧急到医院就诊：') - instr(rjcyjl.fzjsf,'复诊地点：') - length('复诊地点：'))))
     END AS RETURN_VISIT_PLACE,--复诊地点
    '' AS RETURN_VISIT_DEPT,
    
    CASE WHEN cyjl.fzjsf IS NOT NULL THEN (substr(cyjl.fzjsf,(instr(cyjl.fzjsf,'复诊时间：')),(instr(cyjl.fzjsf,'何种情况需紧急到医院就诊：') - instr(cyjl.fzjsf,'复诊时间：')))) 
      ELSE (substr(rjcyjl.fzjsf,(instr(rjcyjl.fzjsf,'复诊时间：')),(instr(rjcyjl.fzjsf,'何种情况需紧急到医院就诊：') - instr(rjcyjl.fzjsf,'复诊时间：')))) 
      end AS RETURN_VISIT_NEXT,
   
    cyjl.zljgdm AS OUTCOME_CODE,
    cyjl.zhiljg AS OUTCOME_NAME,
    cyjl.zhiljg AS zgqk,
    cyjl.zljgdm AS zqqkdm,
    (SELECT des_piaddr
     FROM (SELECT des_piaddr
           FROM hi_pi_addr
           WHERE id_pi = pi.id_pi
             AND FG_PIADDRMAJ = '1'
             AND delete_flag = '0'
           ORDER BY insert_time DESC)
     WHERE ROWNUM = 1) AS address,
    '' AS examtest_result,
    SYSDATE AS system_date,
    gdhz.gdzt AS is_discharge_filing
FROM emr.HI_HPL_MED_REC_EMR emr
JOIN hihis.hi_vis_med_ip ip ON emr.id_hospital = ip.id_vismed 
JOIN hihis.hi_vis_med vis ON vis.id_vismed = ip.id_vismed
JOIN hi_pi pi ON emr.id_patient = pi.id_pi
JOIN HI_PI_BAS bas ON pi.id_pi = bas.id_pi
left JOIN emr.hi_bd_rec_make_tab_bdcyjl cyjl ON emr.id_medrecdoc = cyjl.id_medrecdoc 
left JOIN emr.hi_bd_rec_make_tab_bd24rcy rjcyjl ON emr.id_medrecdoc = rjcyjl.id_medrecdoc
LEFT JOIN diagnoses diag ON ip.id_vismed = diag.id_vismed
LEFT JOIN V_EMRA_PATIENT_INDEX@to_emra gdhz ON gdhz.jzhm = ip.id_vismed
LEFT JOIN surgery_plans hemsp 
    ON ip.id_vismed = hemsp.id_vismed
    AND hemsp.rn = 1 -- 只取第一条
WHERE emr.fg_active = 1   --and emr.id_medrecdoc='68f582701f85de348315d8da'
and ip.id_vismed='68ee0a4b6117f6001535117c' and (cyjl.id_medrecdoc is not null or rjcyjl.id_medrecdoc is not null)
;
