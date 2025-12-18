<template>
  <div class="overflow-hidden">
    <div class="float-right mt-8 mr-8 cursor-pointer">
      Settings
    </div>
  </div>
  <div>
    <a-select
      ref="select"
      v-model:value="dateNumber"
      style="width: 120px"
    >
      <a-select-option value="1">1</a-select-option>
      <a-select-option value="2">2</a-select-option>
      <a-select-option value="3">3</a-select-option>
      <a-select-option value="4">4</a-select-option>
      <a-select-option value="5">5</a-select-option>
      <a-select-option value="6">6</a-select-option>
      <a-select-option value="7">7</a-select-option>
    </a-select>
  </div>
  <div ref="chartRef" class="chart-container" />
</template>

<script setup>
import * as echarts from 'echarts';
import { ref, onMounted, watch } from 'vue';
// import { data } from '@/utils/data';
import { data } from '@/utils/newData';

const newData = data.data

const chartRef = ref(null);
let chart = null;
let currentClickIndex = -1; // 记录当前点击索引
let forecastDataCache = {}; // 缓存生成的预测数据，格式：{ 模块名: { lineData: [], lowerData: [], upperData: [] } }

const newXAxisData = ref([])

const dateNumber = ref(7) // 日期选择器

let legendList = Object.keys(data.data)

// 日期取30个
// const allDate = [...new Set(data.map(item => item.date))].slice(0, 30)
const allDate = newData[legendList[0]].filter(item => item.true_value).map(item => item.date).slice(30, 60)

// 每个lengend取30个
let newDate = newData[legendList[0]].filter(item => item.true_value).slice(30, 60)


const originalData = [] // 原始数据
allDate.forEach(date => {
  newDate.forEach(items => {
    if (items.date === date) {
      originalData.push({ date, value: items.true_value })
    }
  })
})

const colorList = ['#ff7f0e', '#2ca02c', '#d62728']
const forecastModules = [] // 预测模块列表
legendList.forEach((name, idx) => {
  forecastModules.push({
    name,
    color: colorList[idx],
    rangeAlpha: 0.2,
    offset: 0
  })  
})

// 生成指定模块的预测数据（当前+未来4个点）
const generateModuleForecastData = (clickIndex) => {
  const currentItem = originalData[clickIndex];
  const forecastMonths = [`${newXAxisData.value[clickIndex]}`, `${newXAxisData.value[clickIndex+1]}`, `${newXAxisData.value[clickIndex+2]}`,`${newXAxisData.value[clickIndex+3]}`, `${newXAxisData.value[clickIndex+4]}`, `${newXAxisData.value[clickIndex+5]}`, `${newXAxisData.value[clickIndex+6]}`].slice(0, dateNumber.value);
  const baseValue = currentItem.value;
  
  const forecastData = {};
  const forecastLower = {};
  const forecastUpper = {}
  legendList.forEach(item => {
    forecastData[item] = [{date:currentItem.date, value: baseValue}]
    forecastLower[item] = [baseValue]
    forecastUpper[item] = [baseValue]
  })

  forecastMonths.forEach((date, i) => {
    legendList.forEach((item) => {
      let index = newData[item].findIndex(items => items.date == forecastMonths[0] && items.preds)
      const preds = newData[item][index].preds
      forecastData[item].push({ date, value: preds.predictions[i] })
      forecastLower[item].push(preds.lower95 ? preds.lower95[i] : baseValue)
      forecastUpper[item].push(preds.upper95 ? preds.upper95[i] : baseValue)
    })
  });
  
  return {
    forecastData,
    forecastLower,
    forecastUpper,
    startIndex: clickIndex
  };
};

// 生成原始数据的itemStyle（区分实心/空心）
const getOriginalItemStyle = (index) => {
  const isSolid = index <= currentClickIndex;
  return {
    color: isSolid ? '#000' : 'transparent',
    borderColor: '#000',
    borderWidth: 2
  };
};

// 初始化预测系列配置（每个模块对应2个系列：预测线+范围）
const initForecastSeries = () => {
  let series = [];
  forecastModules.forEach(module => {
    const rgb = hexToRgb(module.color);
    const areaColor = `rgba(${rgb.join(',')}, ${module.rangeAlpha})`;
    // 预测数据线
    series.push({
      name: module.name,
      type: 'line',
      data: [],
      symbol: 'circle',
      symbolSize: 10,
      itemStyle: {
        color: 'transparent',
        borderColor: module.color,
        borderWidth: 2
      },
      lineStyle: { type: 'dashed', color: module.color },
      show: false,
      z: 10 // 层级高于范围
    });
    // 预测范围下限（基线）
    series.push({
      name: `${module.name}_range_lower`,
      type: 'line',
      data: [],
      lineStyle: { opacity: 0 },
      itemStyle: { opacity: 0 },
      stack: `forecast_${module.name}`,
      show: false,
      silent: true, // 不触发交互
      z: 5,
      tooltip: { show: true } // 隐藏tooltip
    });
    // 预测范围填充（上限与下限的差值）
    series.push({
      name: `${module.name}_range_fill`,
      type: 'line',
      data: [],
      symbol: 'none',
      lineStyle: { opacity: 0 }, // 隐藏线条
      areaStyle: { color: areaColor }, // 区间填充色
      stack: `forecast_${module.name}`, // 同一模块共享堆叠
      show: false,
      silent: true,
      z: 5,
      tooltip: { show: true } // 隐藏tooltip（关键修改）
    });
    // 预测范围上限（用于显示上限线，可选）
    series.push({
      name: `${module.name}_range_upper`,
      type: 'line',
      data: [],
      symbol: 'none',
      lineStyle: { 
        color: module.color,
        type: 'dashed',
        width: 1,
        opacity: 0.6 // 显示上限线
      },
      show: false,
      silent: true,
      z: 6,
      tooltip: { show: true } // 隐藏tooltip
    });
  });
  return series;
};

// 十六进制转RGB（用于设置透明度）
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

// 初始化图表
const initChart = () => {
  chart = echarts.init(chartRef.value);

  // 默认图例选中状态
  const defaultLegendSelected = { '原始数据': true };
  forecastModules.forEach(module => {
    defaultLegendSelected[module.name] = true;
  });

  // 核心：自定义SVG路径（适配12x12尺寸的图例图标）
  const legendIcons = {
    // 未选中：空心复选框边框（12x12）
    unselected: 'path://M1,1 L11,1 L11,11 L1,11 Z',
    // 选中：带对勾的复选框（填充矩形+对勾）
    selected: 'path://M1,1 L11,1 L11,11 L1,11 Z M3,6 L6,9 L9,3'
  };
  
  // 初始配置
  const initialOption = {
    title: { text: '销量趋势及多模块预测分析', left: 'center', padding: 10, itemGap: 10 },
    grid: {
      x2: 100,
      bottom: '100px'
    },
    tooltip: { 
      trigger: 'axis',
      position: [100, 100],
      axisPointer: { 
        type: 'line',
        lineStyle: { color: '#999', width: 2, type: 'solid' }
      }
    },
    legend: { 
      data: ['原始数据', ...forecastModules.map(m => m.name)], 
      bottom: 35,
      selectedMode: 'multiple', // 支持多图例勾选
      left: 20,
      top: 150,
      orient: 'vertical',
      type: 'scroll',
      selected: defaultLegendSelected,
      textStyle: { fontSize: 12, color: '#666' },
      // icon: 'rect',
      icon: legendIcons.unselected,
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 20,
      selectedIcon: legendIcons.selected,
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        xAxisIndex: 0,
        start: 0,
        end: 100,
        bottom: 5,
        handleSize: 12,
        handleStyle: {color: '#000'},
        textStyle: { color: '#666' },
        borderColor: '#e6e6e6',
        showReset: true,
        // minSpan: 3, // 最小显示3个数据点
        // maxSpan: 12 // 最大显示12个数据点
      },
      {
        type: 'inside',
        xAxisIndex: 0,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
        zoomLock: true
      }
    ],
    xAxis: {
      type: 'category',
      data: originalData.map(item => item.date),
      boundaryGap: false,
      axisPointer: {
        // type: 'line',
        lineStyle: {type: 'dashed', color: '#000', width: 2, opacity: .8 },
        triggerTooltip: false,
        z: 100
      },
      axisLabel: {
        rotate: 45, // 设置文字旋转角度
        fontSize: 12,
        interval: 0, // 标签间隔
        margin: 10 // 文字与轴线的距离
      }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: '原始数据',
        type: 'line',
        data: originalData.map(item => item.value),
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { color: '#000', width: 1 },
        itemStyle: { color: '#000', borderWidth: 0 },
        emphasis: { focus: 'series' },
        z: 15, // 最高层级
        markLine: {
          // symbol: ['none', 'none'],
          data: originalData.map((item, index) => {return {xAxis: index, name: item.date}}),
          lineStyle: { color: 'transparent', width: 1, type: 'dashed' },
          silent: false,
          label: { show: false },
          // z: 20
        }
      },
      // 注入预测系列
      ...initForecastSeries()
    ],
  };
  
  chart.setOption(initialOption);
  
  // 点击事件处理（生成所有模块的预测数据）
  chart.on('click', (params) => {
    if (['xAxis', 'series'].includes(params.componentType) && 
        (params.seriesName === '原始数据' || params.componentType === 'xAxis') || params.componentType === 'markLine') {
      
      const clickIndex = params.dataIndex;
      if (clickIndex === undefined || clickIndex >= originalData.length) return;
      
      currentClickIndex = clickIndex;
      forecastDataCache = {}; // 清空旧缓存

      // 1. 获取当前图例的选择状态（关键：根据图例状态决定是否显示模块）
      const currentLegendSelected = chart.getOption().legend[0].selected || {};

      // 合并X轴数据
      const originalMonths = originalData.map(item => item.date);
      // const addMonths = ['10月', '11月', '12月']; // 未来3个月
      const addMonths = []; // 未来3个月
      newXAxisData.value = [...originalMonths, ...addMonths];
      
      // 重构原始数据（带动态itemStyle）
      const newOriginalData = originalData.map((item, index) => ({
        value: item.value,
        itemStyle: getOriginalItemStyle(index)
      }));
      
      // 构建更新的series配置
      const updateSeries = [
        { 
          name: '原始数据', 
          data: newOriginalData,
          symbol: 'circle',
          symbolSize: 10
        }
      ];
      
      // 为每个预测模块生成数据
      forecastModules.forEach(module => {
        const { forecastData, forecastLower, forecastUpper, startIndex } = generateModuleForecastData(clickIndex);
        
        // 预测数据线数据
        const forecastSeriesData = {}
        const forecastLowerData = {}
        const forecastUpperData = {}
        const rangeFillData = {}
        const fullRangeFillData = {}
        legendList.forEach(item => {
          forecastSeriesData[item] = new Array(startIndex).fill(null).concat(forecastData[item].map(item => item.value));
          forecastLowerData[item] = new Array(startIndex).fill(null).concat(forecastLower[item]);
          forecastUpperData[item] = new Array(startIndex).fill(null).concat(forecastUpper[item]);
          // 计算范围填充数据：上限与下限的差值
          rangeFillData[item] = forecastUpper[item].map((upper, index) => { return upper - forecastLower[item][index] });
          fullRangeFillData[item] = new Array(startIndex).fill(null).concat(rangeFillData[item]);
        })

        // 缓存当前模块的预测数据
        forecastDataCache[module.name] = {
          lineData: forecastSeriesData,
          lowerData: forecastLowerData,
          upperData: forecastUpperData,
          rangeFillData: fullRangeFillData
        };

        // 获取当前模块的图例选择状态（默认选中）
        const isModuleSelected = currentLegendSelected[module.name] !== false;
        
        // 添加当前模块的4个系列（预测线+范围基线+范围填充+范围上限）
        updateSeries.push({
          name: module.name,
          data: isModuleSelected ? forecastSeriesData[module.name] : [],
          show: true // 默认显示，后续由图例控制
        });
        updateSeries.push({
          name: `${module.name}_range_lower`,
          data: isModuleSelected ? forecastLowerData[module.name] : [],  
          show: true,
          tooltip: { show: true } // 隐藏tooltip
        });  
        updateSeries.push({
          name: `${module.name}_range_fill`,
          data: isModuleSelected ? fullRangeFillData[module.name] : [],
          show: true,
          tooltip: { show: false } // 隐藏tooltip（关键修改）
        });  
        updateSeries.push({
          name: `${module.name}_range_upper`,
          data: isModuleSelected ? forecastUpperData[module.name] : [],
          show: true,
          tooltip: { show: true } // 隐藏tooltip
        });
      });
      // 更新图表
      chart.setOption({
        xAxis: { data: newXAxisData.value },
        series: updateSeries,
        // markLine: {
        //   symbol: ['none', 'none'],
        //   silent: true,
        //   data: [{  
        //     name: '当前位置',
        //     xAxis: currentClickIndex,
        //     lineStyle: { color: '#000', width: 1, type: 'solid' }  
        //   }]
        // }
      });
    }
  });

  // 监听图例勾选事件（控制预测模块显示/隐藏）
  chart.on('legendselectchanged', (params) => {
    const { name, selected } = params;
    // 仅处理预测模块的图例

    const isForecastModule = forecastModules.some(m => m.name === name);
    if (!isForecastModule) return;

    const isShow = selected[name]; // 当前图例的勾选状态
    
    // 构建要更新的系列配置    
    const updateSeries = [];
    
    // 从缓存中获取当前模块的预测数据
    const moduleCache = forecastDataCache[name];
    if (moduleCache) {
      // 预测线系列
      updateSeries.push({
        name: name,
        show: isShow,
        data: isShow ? moduleCache.lineData[name] : [] // 显示时使用缓存数据，隐藏时清空
      });
      
      // 范围基线系列
      updateSeries.push({
        name: `${name}_range_lower`,
        show: isShow,
        data: isShow ? moduleCache.lowerData[name] : [],
        tooltip: { show: true } // 隐藏tooltip
      });
      
      // 范围填充系列
      updateSeries.push({
        name: `${name}_range_fill`,
        show: isShow,
        data: isShow ? moduleCache.rangeFillData[name] : [],
        tooltip: { show: false } // 隐藏tooltip（关键修改）
      });
      
      // 范围上限系列
      updateSeries.push({
        name: `${name}_range_upper`,
        show: isShow,
        data: isShow ? moduleCache.upperData[name] : [],
        tooltip: { show: true } // 隐藏tooltip
      });
    }
    chart.setOption({
      series: updateSeries
    });
  });
};

// 响应式调整
const resizeChart = () => {
  chart?.resize();
};

// 初始化与销毁
onMounted(() => {
  if (chartRef.value) {
    initChart();
    window.addEventListener('resize', resizeChart);
  }
});

watch(
  () => chartRef.value,
  (newVal) => {
    if (!newVal) {
      chart?.dispose();
      window.removeEventListener('resize', resizeChart);
      chart = null;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 500px;
}
</style>